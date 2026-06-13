import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { StreamClient } from "@stream-io/node-sdk";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = new StreamClient(
    process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY!,
    process.env.STREAM_VIDEO_API_SECRET!
  );

  const token = client.generateUserToken({
    user_id: session.user.id,
  });

  return NextResponse.json({
    token,
    userId: session.user.id,
    userName: session.user.name,
  });
}