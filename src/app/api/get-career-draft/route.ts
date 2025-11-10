import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";

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

    // Find the most recent draft (inactive status) created by this user
    const draft = await db.collection("careers").findOne(
      {
        orgID,
        createdBy: userEmail,
        status: "inactive",
      },
      {
        sort: { updatedAt: -1 }, // Get most recent
      }
    );

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
