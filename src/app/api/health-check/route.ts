import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import admin from "firebase-admin";
import OpenAI from "openai";

/**
 * Health Check API Endpoint
 * Verifies all external service connections
 * GET /api/health-check
 */
export async function GET(req: NextRequest) {
  const checks = {
    timestamp: new Date().toISOString(),
    status: "healthy",
    services: {
      mongodb: { status: "unknown", message: "" },
      firebase: { status: "unknown", message: "" },
      openai: { status: "unknown", message: "" },
      coreApi: { status: "unknown", message: "" },
    },
  };

  // Check MongoDB Connection
  try {
    const { db } = await connectMongoDB();
    await db.admin().ping();
    checks.services.mongodb = {
      status: "connected",
      message: "MongoDB connection successful",
    };
  } catch (error: any) {
    checks.services.mongodb = {
      status: "error",
      message: error.message || "MongoDB connection failed",
    };
    checks.status = "unhealthy";
  }

  // Check Firebase Admin SDK
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccount) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT not configured");
    }

    if (admin.apps.length === 0) {
      const parsedServiceAccount = JSON.parse(serviceAccount);
      admin.initializeApp({
        credential: admin.credential.cert(parsedServiceAccount),
      });
    }

    // Test Firebase by listing users (limited to 1)
    await admin.auth().listUsers(1);
    checks.services.firebase = {
      status: "connected",
      message: "Firebase Admin SDK initialized successfully",
    };
  } catch (error: any) {
    checks.services.firebase = {
      status: "error",
      message: error.message || "Firebase initialization failed",
    };
    checks.status = "unhealthy";
  }

  // Check OpenAI API
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    const openai = new OpenAI({ apiKey });
    // Test with a minimal API call
    await openai.models.list();
    checks.services.openai = {
      status: "connected",
      message: "OpenAI API key valid",
    };
  } catch (error: any) {
    checks.services.openai = {
      status: "error",
      message: error.message || "OpenAI API connection failed",
    };
    checks.status = "unhealthy";
  }

  // Check Core API
  try {
    const coreApiUrl = process.env.NEXT_PUBLIC_CORE_API_URL;
    if (!coreApiUrl) {
      throw new Error("NEXT_PUBLIC_CORE_API_URL not configured");
    }

    const response = await fetch(coreApiUrl, {
      method: "GET",
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (response.ok || response.status === 404) {
      // 404 is acceptable - means server is reachable
      checks.services.coreApi = {
        status: "connected",
        message: `Core API reachable at ${coreApiUrl}`,
      };
    } else {
      throw new Error(`Core API returned status ${response.status}`);
    }
  } catch (error: any) {
    checks.services.coreApi = {
      status: "error",
      message: error.message || "Core API unreachable",
    };
    checks.status = "unhealthy";
  }

  // Return appropriate status code
  const statusCode = checks.status === "healthy" ? 200 : 503;

  return NextResponse.json(checks, { status: statusCode });
}
