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
    const { name } = body;
    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Team name is required" }, { status: 400 });
    }

    const db = await getDb();

    // Verify user is not already in a team
    const user = await db.collection("user").findOne({ _id: new ObjectId(session.user.id) });
    if (user && user.team_id) {
      return NextResponse.json({ 
        error: "You are already a member of a team! Please leave your current team first." 
      }, { status: 400 });
    }

    // Generate unique 6-character alphanumeric invite code
    let invite_code = "";
    let codeExists = true;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    while (codeExists) {
      invite_code = "";
      for (let i = 0; i < 6; i++) {
        invite_code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const existingTeam = await db.collection("teams").findOne({ invite_code });
      if (!existingTeam) {
        codeExists = false;
      }
    }

    const newTeam = {
      name: name.trim(),
      manager_id: session.user.id,
      invite_code,
      members: [session.user.id],
    };

    const result = await db.collection("teams").insertOne(newTeam);
    const teamId = result.insertedId.toString();

    // Update user record: set role to manager (Warden) and link team_id
    console.log("[TEAMS API] Updating user in DB:", { userId: session.user.id, teamId });
    const updateResult = await db.collection("user").updateOne(
      { _id: new ObjectId(session.user.id) },
      { $set: { role: "manager", team_id: teamId } }
    );
    console.log("[TEAMS API] Update result:", updateResult);

    return NextResponse.json({
      message: "Team created successfully!",
      team: { ...newTeam, _id: teamId },
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
