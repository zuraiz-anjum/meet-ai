import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { meetings } from "@/db/schema";
import { eq } from "drizzle-orm";
import Groq from "groq-sdk";

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

  const { transcript } = await req.json();

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "You are an assistant that summarizes meeting transcripts. Be concise and structured. Include: key topics discussed, decisions made, and action items.",
      },
      {
        role: "user",
        content: `Summarize this meeting transcript:\n\n${transcript}`,
      },
    ],
  });

  const summary = response.choices[0].message.content;

  await db
    .update(meetings)
    .set({
      transcript,
      summary,
      status: "completed",
      endedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(meetings.id, meetingId));

  return NextResponse.json({ summary });
}