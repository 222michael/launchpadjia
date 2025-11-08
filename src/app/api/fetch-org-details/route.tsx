import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongoDB/mongoDB";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
  try {
    const { orgID } = await req.json();

    if (!orgID) {
      return NextResponse.json(
        { error: "Missing orgID parameter" },
        { status: 400 }
      );
    }

    const { db } = await connectMongoDB();

    let query: any;
    try {
      query = { _id: new ObjectId(orgID) };
    } catch (e) {
      query = { _id: orgID };
    }

    const orgDoc = await db.collection("organizations").aggregate([
      {
        $match: query
      },
      {
        $lookup: {
          from: "organization-plans",
          let: { planId: "$planId" },
          pipeline: [
            {
              $addFields: {
                _id: { $toString: "$_id" }
              }
            },
            {
              $match: {
                $expr: { $eq: ["$_id", "$$planId"] }
              }
            }
          ],
          as: "plan"
        }
      },
      {
        $unwind: {
          path: "$plan",
          preserveNullAndEmptyArrays: true
        }
      }
    ]).toArray();

    if (!orgDoc || orgDoc.length === 0) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(orgDoc[0]);
  } catch (error) {
    console.error("Error in fetch-org-details endpoint:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
