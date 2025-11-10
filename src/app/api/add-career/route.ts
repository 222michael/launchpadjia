import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    const { jobTitle, description, orgID } = requestData;

    // Validate required fields
    if (!jobTitle || !description || !orgID) {
      return NextResponse.json(
        { error: "Job title, description, and organization ID are required", message: "Job title, description, and organization ID are required" },
        { status: 400 }
      );
    }

    const { db } = await connectMongoDB();

    const career = {
      ...requestData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const result = await db.collection("careers").insertOne(career);

    return NextResponse.json({
      message: "Career added successfully",
      career: {
        ...career,
        _id: result.insertedId,
      },
    });
  } catch (error) {
    console.error("Error adding career:", error);
    return NextResponse.json(
      { error: "Failed to add career", message: "Failed to add career" },
      { status: 500 }
    );
  }
}
