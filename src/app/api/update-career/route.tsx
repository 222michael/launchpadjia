import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { ObjectId } from "mongodb";
import { sanitizeObject } from "@/lib/utils/security";

// Force dynamic route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Handle OPTIONS for CORS
export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: Request) {
  try {
    let requestData = await request.json();
    
    // Sanitize all input data to prevent XSS attacks
    requestData = sanitizeObject(requestData, 'rich');
    const { _id } = requestData;

    // Validate required fields
    if (!_id) {
      return NextResponse.json(
        { error: "Job Object ID is required" },
        { status: 400 }
      );
    }

    const { db } = await connectMongoDB();

    let dataUpdates = { ...requestData };

    delete dataUpdates._id;

    const career = {
      ...dataUpdates,
    };

    await db
      .collection("careers")
      .updateOne({ _id: new ObjectId(_id) }, { $set: career });

    return NextResponse.json({
      message: "Career updated successfully",
      career,
    });
  } catch (error) {
    console.error("Error adding career:", error);
    return NextResponse.json(
      { error: "Failed to add career" },
      { status: 500 }
    );
  }
}
