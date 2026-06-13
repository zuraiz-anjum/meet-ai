import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { agents } from "@/db/schema";
import { auth } from "@/auth";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, instructions } = await req.json();

  if (!name || !instructions) {
    return NextResponse.json({ error: "Name and instructions are required" }, { status: 400 });
  }

  const agent = await db.insert(agents).values({
    id: nanoid(),
    name,
    instructions,
    userId: session.user.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();

  return NextResponse.json(agent[0]);
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userAgents = await db
    .select()
    .from(agents)
    .where(eq(agents.userId, session.user.id));

  return NextResponse.json(userAgents);
}