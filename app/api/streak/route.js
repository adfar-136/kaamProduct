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

    const db = await getDb();

    // Fetch all EOD reports for the user, sorted by date descending
    const reports = await db.collection("eod_reports")
      .find({ user_id: session.user.id })
      .sort({ date: -1 })
      .toArray();

    if (reports.length === 0) {
      return NextResponse.json({ streak: 0 });
    }

    // Get today and yesterday dates as YYYY-MM-DD
    const today = new Date().toISOString().split("T")[0];
    
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split("T")[0];

    // Find the dates of submitted reports in a Set for O(1) checks
    const reportDates = new Set(reports.map(r => r.date));

    // To count as an active streak, the user must have submitted an EOD report
    // either today or at least yesterday (if today's is still pending).
    if (!reportDates.has(today) && !reportDates.has(yesterday)) {
      return NextResponse.json({ streak: 0 });
    }

    // Step backwards day-by-day starting from the latest submitted report date
    let currentStreak = 0;
    let checkDate = reportDates.has(today) ? new Date(today + "T00:00:00") : new Date(yesterday + "T00:00:00");

    while (true) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (reportDates.has(dateStr)) {
        currentStreak++;
        // Go back 1 day
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return NextResponse.json({ streak: currentStreak });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
