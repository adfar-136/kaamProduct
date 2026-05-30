import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function PATCH(request, { params }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { stage } = body;

    const validStages = ["subject", "ideation", "proposal", "approved", "rejected"];
    if (stage && !validStages.includes(stage)) {
      return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
    }

    const db = await getDb();

    // Verify card ownership or team membership
    const card = await db.collection("brainstorm").findOne({ _id: new ObjectId(id) });
    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const user = await db.collection("user").findOne({ _id: new ObjectId(session.user.id) });

    // A user can edit the card if they created it OR if it belongs to their team
    const isOwner = card.user_id === session.user.id;
    const isTeamMember = card.team_id && user && user.team_id === card.team_id;

    if (!isOwner && !isTeamMember) {
      return NextResponse.json({ error: "Unauthorized access to card" }, { status: 403 });
    }

    // Collaborative approvals constraint check
    const isStageChange = stage !== undefined && stage !== card.stage;
    const isTargetFinal = stage === "approved" || stage === "rejected";
    const isCurrentFinal = card.stage === "approved" || card.stage === "rejected";

    if (isStageChange && (isTargetFinal || isCurrentFinal)) {
      const userRole = user ? (user.role || "member") : "member";
      if (userRole !== "manager") {
        return NextResponse.json(
          { error: "Only team managers can approve, reject, or modify finalized brainstorm cards" },
          { status: 403 }
        );
      }
      if (card.user_id === session.user.id) {
        return NextResponse.json(
          { error: "Card creators cannot approve or reject their own proposed ideas" },
          { status: 403 }
        );
      }
    }


    const updates = {
      updated_at: new Date(),
    };
    if (stage) {
      updates.stage = stage;
    }
    if (body.title !== undefined) {
      updates.title = body.title.trim();
    }

    await db.collection("brainstorm").updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    return NextResponse.json({ 
      message: "Card updated successfully", 
      card: { ...card, ...updates },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = await getDb();

    // Verify card ownership or warden status
    const card = await db.collection("brainstorm").findOne({ _id: new ObjectId(id) });
    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const user = await db.collection("user").findOne({ _id: new ObjectId(session.user.id) });
    const isOwner = card.user_id === session.user.id;
    const isWarden = card.team_id && user && user.role === "manager" && user.team_id === card.team_id;

    if (!isOwner && !isWarden) {
      return NextResponse.json({ error: "Unauthorized to delete card" }, { status: 403 });
    }

    await db.collection("brainstorm").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ message: "Card deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
