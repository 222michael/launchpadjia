import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";

export async function POST(request: Request) {
  try {
    const { name, email, image } = await request.json();

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    const { db } = await connectMongoDB();
    
    // Check if user is an admin
    const admin = await db.collection("admins").findOne({ email: email });

    if (admin) {
      await db.collection("admins").updateOne(
        { email: email },
        {
          $set: {
            name: name,
            image: image,
            lastSeen: new Date(),
          },
        }
      );

      return NextResponse.json(admin);
    }
    
    // Check if user is a member of an organization (recruiter/employer)
    const member = await db.collection("members").findOne({ email: email });
    
    if (member) {
      // User is a member of an organization - return member data
      await db.collection("members").updateOne(
        { email: email },
        {
          $set: {
            name: name,
            image: image,
            lastLogin: new Date(),
          },
        }
      );
      
      return NextResponse.json({
        email: member.email,
        name: member.name,
        image: member.image,
        role: member.role, // This will be "admin", "member", or "hiring_manager"
      });
    }
    
    // Check if user is an applicant
    const applicant = await db
      .collection("applicants")
      .findOne({ email: email });

    if (applicant) {
      return NextResponse.json(applicant);
    }

    // Create new applicant if not found anywhere
    if (!applicant) {
      await db.collection("applicants").insertOne({
        email: email,
        name: name,
        image: image,
        createdAt: new Date(),
        lastSeen: new Date(),
        role: "applicant",
      });
      
      return NextResponse.json({
        email: email,
        name: name,
        image: image,
        role: "applicant",
      });
    }

    return NextResponse.json({
      message: "Default Fallback",
    });
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      { error: "Failed to authenticate user" },
      { status: 500 }
    );
  }
}
