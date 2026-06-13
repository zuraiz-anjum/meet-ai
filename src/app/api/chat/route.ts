import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message, instructions, history } = await req.json();

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const chatHistory = history
    .filter((msg: any) => msg.text)
    .map((msg: any) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.text,
    }));

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: instructions },
      ...chatHistory,
      { role: "user", content: message },
    ],
  });

  const reply = response.choices[0].message.content;

  return NextResponse.json({ reply });
}