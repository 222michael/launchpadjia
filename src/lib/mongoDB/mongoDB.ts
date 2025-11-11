import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = "jia-db";

if (!uri) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

// Global variable to store the connection
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;
let connectionPromise: Promise<{ client: MongoClient; db: Db }> | null = null;

export default async function connectMongoDB() {
  // If we already have a valid cached connection, return it
  if (cachedClient && cachedDb) {
    try {
      // Quick check if connection is alive (non-blocking)
      await cachedClient.db().admin().ping();
      return { client: cachedClient, db: cachedDb };
    } catch (error) {
      console.log("Cached connection is dead, reconnecting...");
      cachedClient = null;
      cachedDb = null;
      connectionPromise = null;
    }
  }

  // If a connection is already being established, wait for it
  if (connectionPromise) {
    return connectionPromise;
  }

  // Create new connection with optimized pooling settings
  connectionPromise = (async () => {
    const client = new MongoClient(uri, {
      // Connection pool settings
      maxPoolSize: 10, // Maximum 10 connections in the pool
      minPoolSize: 2,  // Keep at least 2 connections open
      maxIdleTimeMS: 60000, // Close idle connections after 60 seconds
      
      // Timeout settings
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      
      // Retry settings
      retryWrites: true,
      retryReads: true,
      
      // Compression
      compressors: ['zlib'],
    });

    await client.connect();
    const db = client.db(dbName);

    cachedClient = client;
    cachedDb = db;

    console.log("MongoDB connected successfully with connection pooling");
    
    return { client, db };
  })();

  return connectionPromise;
}

export async function disconnectFromDatabase() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
    connectionPromise = null;
    console.log("MongoDB disconnected");
  }
}

// Graceful shutdown handler
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    await disconnectFromDatabase();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await disconnectFromDatabase();
    process.exit(0);
  });
}
