import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";

export async function POST(request: Request) {
  try {
    const { db } = await connectMongoDB();

    // Find careers without id field
    const careersWithoutId = await db.collection("careers").find({ id: { $exists: false } }).toArray();

    console.log(`Found ${careersWithoutId.length} careers without id field`);

    if (careersWithoutId.length > 0) {
      const updates = [];
      
      for (const career of careersWithoutId) {
        const careerId = `career_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await db.collection("careers").updateOne(
          { _id: career._id },
          { $set: { id: careerId } }
        );
        
        updates.push({
          jobTitle: career.jobTitle,
          _id: career._id,
          newId: careerId
        });
        
        console.log(`Updated career "${career.jobTitle}" with id: ${careerId}`);
      }
      
      return NextResponse.json({
        message: "Careers updated successfully",
        updated: updates.length,
        careers: updates
      });
    } else {
      return NextResponse.json({
        message: "All careers already have id field",
        updated: 0
      });
    }
  } catch (error) {
    console.error("Error fixing career IDs:", error);
    return NextResponse.json(
      { error: "Failed to fix career IDs" },
      { status: 500 }
    );
  }
}
