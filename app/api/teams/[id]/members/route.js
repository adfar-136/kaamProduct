import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = await getDb();

    // Verify requesting user is part of the requested team
    const requester = await db.collection("user").findOne({ _id: new ObjectId(session.user.id) });
    if (!requester || requester.team_id !== id) {
      return NextResponse.json({ error: "Unauthorized access to team data" }, { status: 403 });
    }

    const isWarden = requester.role === "manager";

    // Find the team details
    const team = await db.collection("teams").findOne({ _id: new ObjectId(id) });
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

    // Convert string member IDs into native ObjectIds for matching
    const memberObjectIds = team.members.map(m => new ObjectId(m));

    // Fetch team member profile details
    const members = await db.collection("user").find({
      _id: { $in: memberObjectIds },
    }, {
      projection: { _id: 1, email: 1, name: 1, official_name: 1, role: 1 },
    }).toArray();

    // Fetch EOD reports for team members on the specified date
    const reports = await db.collection("eod_reports").find({
      team_id: id,
      date: date,
    }).toArray();

    // If Warden request, load read-only task lists for each team member for the day
    let tasksMap = {};
    if (isWarden) {
      const allTodayTasks = await db.collection("tasks").find({
        team_id: id,
        date: date,
      }).sort({ order: 1 }).toArray();

      allTodayTasks.forEach(task => {
        if (!tasksMap[task.user_id]) {
          tasksMap[task.user_id] = [];
        }
        tasksMap[task.user_id].push(task);
      });
    }

    // Map profiles together with EOD statistics and optional Warden-only task list
    const memberData = members.map(m => {
      const report = reports.find(r => r.user_id === m._id);
      return {
        id: m._id,
        name: m.name,
        official_name: m.official_name || m.name,
        role: m.role,
        email: m.email,
        eod: report ? {
          tasks_done: report.tasks_done,
          total_tasks: report.total_tasks,
          productivity_percentage: report.productivity_percentage,
        } : null,
        tasks: isWarden ? (tasksMap[m._id] || []) : null,
      };
    });

    return NextResponse.json({
      team: {
        id: team._id.toString(),
        name: team.name,
        invite_code: team.invite_code,
        manager_id: team.manager_id,
      },
      members: memberData,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
