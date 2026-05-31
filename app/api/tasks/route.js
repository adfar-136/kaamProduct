import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
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
    const date = searchParams.get("date");
    if (!date) {
      return NextResponse.json({ error: "Date parameter is required" }, { status: 400 });
    }

    const db = await getDb();
    const tasks = await db.collection("tasks").find({
      user_id: session.user.id,
      date: date,
    }).sort({ order: 1 }).toArray();

    return NextResponse.json(tasks);
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
    const { title, type, date } = body;

    if (!title || !type || !date) {
      return NextResponse.json({ error: "Title, type, and date are required" }, { status: 400 });
    }

    if (!["task", "break", "meeting"].includes(type)) {
      return NextResponse.json({ error: "Invalid task type" }, { status: 400 });
    }

    const db = await getDb();

    // Check 10-task limit (excluding deleted/carried? No, the requirement says "Show up to 10 tasks per day")
    // We count tasks with active statuses (pending, done, carried all count towards the day's total layout)
    const count = await db.collection("tasks").countDocuments({
      user_id: session.user.id,
      date: date,
    });

    if (count >= 10) {
      return NextResponse.json({ 
        error: "Daily limit reached. You can only add up to 10 tasks per day!" 
      }, { status: 400 });
    }

    const newTask = {
      user_id: session.user.id,
      team_id: session.user.team_id || null,
      date,
      title,
      type,
      status: "pending",
      order: count,
      priority: body.priority || "medium",
      duration: Number(body.duration) || 30,
      completion_percentage: 0,
    };

    const result = await db.collection("tasks").insertOne(newTask);
    return NextResponse.json({ ...newTask, _id: result.insertedId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
