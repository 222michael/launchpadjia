import { MongoClient } from "mongodb";

let uri = process.env.MONGODB_URI;
let dbName = "jia-db";

let cachedClient = null;
let cachedDb = null;

if (!uri) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

if (!dbName) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

export default async function connectMongoDB() {
  if (cachedClient && cachedDb) {
    // Check if connection is still alive
    try {
      await cachedClient.db().admin().ping();
      return { client: cachedClient, db: cachedDb };
    } catch (error) {
      // Connection is dead, clear cache and reconnect
      console.log("Cached connection is dead, reconnecting...");
      cachedClient = null;
      cachedDb = null;
    }
  }

  const client = await MongoClient.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 2,
    retryWrites: true,
    retryReads: true,
  });

  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export async function disconnectFromDatabase() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
  }
}
