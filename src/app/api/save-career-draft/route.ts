import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    const { orgID, userEmail, draftData, currentStep } = requestData;

    if (!orgID || !userEmail) {
      return NextResponse.json(
        { error: "Organization ID and user email are required" },
        { status: 400 }
      );
    }

    const { db } = await connectMongoDB();

    const draft = {
      orgID,
      userEmail,
      draftData,
      currentStep,
      updatedAt: Date.now(),
    };

    // Upsert: update if exists, insert if not
    await db.collection("career_drafts").updateOne(
      { orgID, userEmail },
      { $set: draft, $setOnInsert: { createdAt: Date.now() } },
      { upsert: true }
    );

    return NextResponse.json({
      message: "Draft saved successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error saving draft:", error);
    return NextResponse.json(
      { error: "Failed to save draft" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgID = searchParams.get("orgID");
    const userEmail = searchParams.get("userEmail");

    if (!orgID || !userEmail) {
      return NextResponse.json(
        { error: "Organization ID and user email are required" },
        { status: 400 }
      );
    }

    const { db } = await connectMongoDB();

    const draft = await db.collection("career_drafts").findOne({
      orgID,
      userEmail,
    });

    if (!draft) {
      return NextResponse.json({ draft: null });
    }

    return NextResponse.json({ draft });
  } catch (error) {
    console.error("Error fetching draft:", error);
    return NextResponse.json(
      { error: "Failed to fetch draft" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgID = searchParams.get("orgID");
    const userEmail = searchParams.get("userEmail");

    if (!orgID || !userEmail) {
      return NextResponse.json(
        { error: "Organization ID and user email are required" },
        { status: 400 }
      );
    }

    const { db } = await connectMongoDB();

    await db.collection("career_drafts").deleteOne({
      orgID,
      userEmail,
    });

    return NextResponse.json({
      message: "Draft deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting draft:", error);
    return NextResponse.json(
      { error: "Failed to delete draft" },
      { status: 500 }
    );
  }
}
