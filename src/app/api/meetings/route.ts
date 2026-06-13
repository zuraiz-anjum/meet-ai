import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { meetings } from "@/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, agentId } = await req.json();

  if (!name || !agentId) {
    return NextResponse.json(
      { error: "Name and agent are required" },
      { status: 400 }
    );
  }

  const meeting = await db
    .insert(meetings)
    .values({
      id: nanoid(),
      name,
      agentId,
      userId: session.user.id,
      status: "upcoming",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return NextResponse.json(meeting[0]);
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userMeetings = await db
    .select()
    .from(meetings)
    .where(eq(meetings.userId, session.user.id));

  return NextResponse.json(userMeetings);
}