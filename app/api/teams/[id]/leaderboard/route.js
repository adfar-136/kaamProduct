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

    // Find the team details
    const team = await db.collection("teams").findOne({ _id: new ObjectId(id) });
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date") || new Date().toISOString().split("T")[0];

    // Generate date lists for past 7 days and 30 days relative to query date
    const today = new Date(dateStr + "T00:00:00");
    
    const past7Days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      past7Days.push(d.toISOString().split("T")[0]);
    }

    const past30Days = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      past30Days.push(d.toISOString().split("T")[0]);
    }

    // Fetch team member profile details
    const memberObjectIds = team.members.map(m => new ObjectId(m));
    const members = await db.collection("user").find({
      _id: { $in: memberObjectIds },
    }).toArray();

    // Fetch EOD reports in parallel for both ranges
    const [weeklyReports, monthlyReports] = await Promise.all([
      db.collection("eod_reports").find({
        team_id: id,
        date: { $in: past7Days },
      }).toArray(),
      db.collection("eod_reports").find({
        team_id: id,
        date: { $in: past30Days },
      }).toArray(),
    ]);

    // Rank function
    const calculateRankings = (reports) => {
      const userStats = {};
      
      // Initialize stats for all members
      members.forEach(m => {
        userStats[m._id] = {
          user_id: m._id,
          official_name: m.official_name || m.name,
          role: m.role,
          total_percentage: 0,
          report_count: 0,
          average: 0,
        };
      });

      // Sum scores
      reports.forEach(r => {
        if (userStats[r.user_id]) {
          userStats[r.user_id].total_percentage += r.productivity_percentage;
          userStats[r.user_id].report_count += 1;
        }
      });

      // Calculate averages and sort descending
      return Object.values(userStats).map(stat => {
        stat.average = stat.report_count > 0 ? Math.round(stat.total_percentage / stat.report_count) : 0;
        return stat;
      }).sort((a, b) => b.average - a.average);
    };

    const weeklyRankings = calculateRankings(weeklyReports);
    const monthlyRankings = calculateRankings(monthlyReports);

    // Filter top performers (must have at least one report and average > 0)
    const topWeekly = weeklyRankings[0] && weeklyRankings[0].average > 0 ? weeklyRankings[0] : null;
    const topMonthly = monthlyRankings[0] && monthlyRankings[0].average > 0 ? monthlyRankings[0] : null;

    return NextResponse.json({
      weekly: weeklyRankings,
      monthly: monthlyRankings,
      topWeekly,
      topMonthly,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
