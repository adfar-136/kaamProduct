import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/DashboardClient";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  // Sync session custom fields directly from database to bypass JWT stale cache
  try {
    const db = await getDb();
    const dbUser = await db.collection("user").findOne({ _id: new ObjectId(session.user.id) });
    if (dbUser) {
      session.user.role = dbUser.role || "member";
      session.user.team_id = dbUser.team_id || null;
    }
  } catch (error) {
    console.error("Error syncing user session fields:", error);
  }

  return <DashboardClient session={session} />;
}
