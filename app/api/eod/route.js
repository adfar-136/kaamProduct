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
    const { date } = body;
    if (!date) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    const db = await getDb();

    // Fetch tasks for the user and specific date
    const tasks = await db.collection("tasks").find({
      user_id: session.user.id,
      date: date,
    }).toArray();

    const total_tasks = tasks.length;
    // Count 'done' tasks (completed at 100%)
    const tasks_done = tasks.filter(t => t.status === "done" || t.completion_percentage === 100).length;

    let productivity_percentage = 0;
    if (total_tasks > 0) {
      const total_percentage = tasks.reduce((sum, t) => sum + (t.completion_percentage || 0), 0);
      productivity_percentage = Math.round(total_percentage / total_tasks);
    }

    // Query fresh user fields from database (for current team_id and official_name)
    const user = await db.collection("user").findOne({ _id: new ObjectId(session.user.id) });
    const team_id = user ? user.team_id : null;
    const official_name = user ? user.official_name : session.user.name;

    const eodReport = {
      user_id: session.user.id,
      official_name,
      team_id: team_id || null,
      date,
      tasks_done,
      total_tasks,
      productivity_percentage,
    };

    // Save or upsert the EOD report for this day
    await db.collection("eod_reports").updateOne(
      { user_id: session.user.id, date: date },
      { $set: eodReport },
      { upsert: true }
    );

    // Premium dynamic motivation message cards based on completion percentage
    let message = "";
    if (total_tasks === 0) {
      message = "You had no tasks scheduled today. Take a moment to plan for a successful tomorrow! 📋✨";
    } else if (productivity_percentage === 100) {
      message = "Perfection achieved! You conquered every single task on your dashboard today. Absolute powerhouse! 🏆🔥";
    } else if (productivity_percentage >= 80) {
      message = "Outstanding performance! You completed the vast majority of your goals. You're riding a wave of peak efficiency! 🚀⭐";
    } else if (productivity_percentage >= 50) {
      message = "Great effort! A highly productive day. Keep building this momentum, step by step! 💪⚡";
    } else if (productivity_percentage > 0) {
      message = "Good attempt! You checked off some blocks today. Reflect, recharge, and aim even higher tomorrow! 🔋✨";
    } else {
      message = "Recharging is a vital part of the productivity cycle. Tomorrow is a brand new page to write! 🌤️❤️";
    }

    return NextResponse.json({
      report: eodReport,
      message,
      productivity_percentage,
      tasks_done,
      total_tasks,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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
    const date = searchParams.get("date");

    if (!team_id || !date) {
      return NextResponse.json({ error: "team_id and date are required" }, { status: 400 });
    }

    const db = await getDb();

    // Verify requesting user is part of the team (or Warden)
    const user = await db.collection("user").findOne({ _id: new ObjectId(session.user.id) });
    if (!user || user.team_id !== team_id) {
      return NextResponse.json({ error: "Unauthorized access to team data" }, { status: 403 });
    }

    // Fetch EOD reports for the team members on this date
    const reports = await db.collection("eod_reports").find({
      team_id: team_id,
      date: date,
    }).toArray();

    return NextResponse.json(reports);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
