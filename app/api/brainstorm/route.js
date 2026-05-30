import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const team_id = searchParams.get("team_id");

    const db = await getDb();
    let query = {};

    if (team_id && team_id !== "null" && team_id !== "undefined") {
      // Fetch all cards assigned to the team
      query = { team_id: team_id };
    } else {
      // Fetch personal brainstorm cards where team_id is not set
      query = { user_id: session.user.id, team_id: null };
    }

    const cards = await db.collection("brainstorm").find(query).sort({ created_at: -1 }).toArray();
    return NextResponse.json(cards);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, team_id, stage } = body;

    if (!title || title.trim() === "") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const db = await getDb();

    // Verify team association if specified
    if (team_id) {
      const user = await db.collection("user").findOne({ _id: new ObjectId(session.user.id) });
      if (!user || user.team_id !== team_id) {
        return NextResponse.json({ error: "Unauthorized team assignment" }, { status: 403 });
      }
    }

    const user = await db.collection("user").findOne({ _id: new ObjectId(session.user.id) });
    const creator_name = user ? (user.official_name || user.name) : (session.user.name);

    const allowedInitialStages = ["subject", "ideation", "proposal"];
    const initialStage = stage && allowedInitialStages.includes(stage) ? stage : "subject";

    const newCard = {
      user_id: session.user.id,
      creator_name,
      team_id: team_id || null,
      title: title.trim(),
      stage: initialStage, // Subject -> Ideation -> Proposal
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await db.collection("brainstorm").insertOne(newCard);

    return NextResponse.json({ ...newCard, _id: result.insertedId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
