import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { invite_code } = body;
    if (!invite_code || invite_code.trim() === "") {
      return NextResponse.json({ error: "Invite code is required" }, { status: 400 });
    }

    const db = await getDb();

    // Verify user is not already in a team
    const user = await db.collection("user").findOne({ _id: new ObjectId(session.user.id) });
    if (user && user.team_id) {
      return NextResponse.json({ 
        error: "You are already a member of a team! Please leave your current team first." 
      }, { status: 400 });
    }

    // Find team by matching invite code
    const team = await db.collection("teams").findOne({ 
      invite_code: invite_code.toUpperCase().trim() 
    });
    if (!team) {
      return NextResponse.json({ error: "Invalid invite code! Team not found." }, { status: 404 });
    }

    const teamIdStr = team._id.toString();

    // Update the team's members array with the new member's ID
    await db.collection("teams").updateOne(
      { _id: team._id },
      { $addToSet: { members: session.user.id } }
    );

    // Update the user's profile database entry
    console.log("[JOIN API] Updating user in DB:", { userId: session.user.id, teamIdStr });
    const updateResult = await db.collection("user").updateOne(
      { _id: new ObjectId(session.user.id) },
      { $set: { role: "member", team_id: teamIdStr } }
    );
    console.log("[JOIN API] Update result:", updateResult);

    return NextResponse.json({
      message: "Successfully joined the team!",
      team: {
        _id: teamIdStr,
        name: team.name,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
