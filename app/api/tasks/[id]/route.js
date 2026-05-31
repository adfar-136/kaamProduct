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
    const db = await getDb();

    // Verify task ownership
    const task = await db.collection("tasks").findOne({
      _id: new ObjectId(id),
      user_id: session.user.id,
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const updates = {};

    if (body.status !== undefined) {
      updates.status = body.status;
      updates.completion_percentage = body.status === "done" ? 100 : 0;
    }
    if (body.completion_percentage !== undefined) {
      updates.completion_percentage = Number(body.completion_percentage);
      updates.status = updates.completion_percentage === 100 ? "done" : "pending";
    }
    if (body.order !== undefined) {
      updates.order = body.order;
    }
    if (body.title !== undefined) {
      updates.title = body.title;
    }
    if (body.type !== undefined) {
      updates.type = body.type;
    }
    if (body.priority !== undefined) {
      updates.priority = body.priority;
    }
    if (body.duration !== undefined) {
      updates.duration = Number(body.duration);
    }

    // Carry to tomorrow logic
    if (body.action === "carry") {
      updates.status = "carried";

      // Calculate tomorrow's date relative to the task's date (formatted as YYYY-MM-DD)
      const taskDate = new Date(task.date + "T00:00:00");
      taskDate.setDate(taskDate.getDate() + 1);
      const tomorrowStr = taskDate.toISOString().split("T")[0];

      // Enforce the 10-task limit for tomorrow's list
      const tomorrowCount = await db.collection("tasks").countDocuments({
        user_id: session.user.id,
        date: tomorrowStr,
      });

      if (tomorrowCount >= 10) {
        return NextResponse.json({ 
          error: "Cannot carry task. Tomorrow's list already has 10 tasks!" 
        }, { status: 400 });
      }

      // Insert new task under tomorrow's date as pending
      const carriedTaskCopy = {
        user_id: session.user.id,
        team_id: session.user.team_id || null,
        date: tomorrowStr,
        title: task.title,
        type: task.type,
        status: "pending",
        order: tomorrowCount,
      };

      await db.collection("tasks").insertOne(carriedTaskCopy);
    }

    await db.collection("tasks").updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    return NextResponse.json({ 
      message: "Task updated successfully", 
      status: updates.status || task.status 
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

    const result = await db.collection("tasks").deleteOne({
      _id: new ObjectId(id),
      user_id: session.user.id,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Task deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
