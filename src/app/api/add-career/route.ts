import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { sanitizeObject } from "@/lib/utils/security";

export async function POST(request: Request) {
  try {
    let requestData = await request.json();
    
    // Sanitize all input data to prevent XSS attacks
    requestData = sanitizeObject(requestData, 'rich');
    const { jobTitle, orgID, careerId, isDraft } = requestData;

    // For drafts, only orgID is required
    // For published careers, jobTitle and description are required
    if (!orgID) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const { db } = await connectMongoDB();

    // If careerId exists, update existing career (auto-save)
    if (careerId) {
      const updateData = {
        ...requestData,
        updatedAt: Date.now(),
      };
      
      // Remove careerId from update data
      delete updateData.careerId;
      delete updateData.isDraft;

      await db.collection("careers").updateOne(
        { id: careerId },
        { $set: updateData }
      );

      return NextResponse.json({
        message: "Career updated successfully",
        careerId: careerId,
      });
    }

    // Create new career
    // Generate a unique ID for the career
    const newCareerId = `career_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const career = {
      ...requestData,
      id: newCareerId, // Add id field for lookups
      status: isDraft ? "inactive" : (requestData.status || "active"),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Remove helper fields
    delete career.careerId;
    delete career.isDraft;

    const result = await db.collection("careers").insertOne(career);

    return NextResponse.json({
      message: "Career created successfully",
      careerId: newCareerId,
      career: {
        ...career,
        _id: result.insertedId,
      },
    });
  } catch (error) {
    console.error("Error saving career:", error);
    return NextResponse.json(
      { error: "Failed to save career" },
      { status: 500 }
    );
  }
}
