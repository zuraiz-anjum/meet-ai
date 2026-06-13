import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { meetings, agents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { StreamClient } from "@stream-io/node-sdk";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  const { meetingId } = await params;

  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const meeting = await db
    .select()
    .from(meetings)
    .where(eq(meetings.id, meetingId))
    .then((r) => r[0]);

  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  const agent = await db
    .select()
    .from(agents)
    .where(eq(agents.id, meeting.agentId))
    .then((r) => r[0]);

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const streamClient = new StreamClient(
    process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY!,
    process.env.STREAM_VIDEO_API_SECRET!
  );

  await streamClient.upsertUsers([
    {
      id: `agent-${agent.id}`,
      name: agent.name,
      role: "user",
    },
  ]);

  const botToken = streamClient.generateUserToken({
    user_id: `agent-${agent.id}`,
  });

  await db
    .update(meetings)
    .set({ status: "active", startedAt: new Date(), updatedAt: new Date() })
    .where(eq(meetings.id, meetingId));

  return NextResponse.json({
    agentId: `agent-${agent.id}`,
    agentName: agent.name,
    agentInstructions: agent.instructions,
    botToken,
    meetingId,
  });
}