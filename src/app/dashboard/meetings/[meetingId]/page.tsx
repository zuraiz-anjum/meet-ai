"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";

interface Message {
  role: "user" | "agent";
  text: string;
}

export default function MeetingRoomPage() {
  const { meetingId } = useParams();
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [agentName, setAgentName] = useState("");
  const [agentInstructions, setAgentInstructions] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // Get stream token for user
        const tokenRes = await fetch("/api/stream-token");
        const { token, userId, userName } = await tokenRes.json();

        // Join meeting and get agent info
        const joinRes = await fetch(`/api/meetings/${meetingId}/join`, {
          method: "POST",
        });
        const agentData = await joinRes.json();
        setAgentName(agentData.agentName);
        setAgentInstructions(agentData.agentInstructions);

        // Set up Stream video
        const streamClient = new StreamVideoClient({
          apiKey: process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY!,
          user: { id: userId, name: userName },
          token,
        });

        const streamCall = streamClient.call("default", meetingId as string);
        await streamCall.join({ create: true });

        setClient(streamClient);
        setCall(streamCall);

        // Add welcome message from agent
        setMessages([
          {
            role: "agent",
            text: `Hi! I'm ${agentData.agentName}. How can I help you today?`,
          },
        ]);

        setLoading(false);
      } catch (err) {
        setError("Failed to join meeting");
        setLoading(false);
      }
    };

    init();

    return () => {
      call?.leave();
      client?.disconnectUser();
    };
  }, [meetingId]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          instructions: agentInstructions,
          history: messages,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "agent", text: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "agent", text: "Sorry, I couldn't process that." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-white">Joining meeting...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Video Section */}
      <div className="flex-1">
        {client && call && (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <StreamTheme>
                <SpeakerLayout />
                <CallControls />
              </StreamTheme>
            </StreamCall>
          </StreamVideo>
        )}
      </div>

      {/* Chat Section */}
      <div className="w-80 bg-gray-900 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-white font-semibold">🤖 {agentName}</h2>
          <p className="text-gray-400 text-xs mt-1">AI Assistant</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-white text-black"
                    : "bg-gray-700 text-white"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-700 text-white rounded-lg px-3 py-2 text-sm">
                Thinking...
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-700 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask the agent..."
            className="flex-1 bg-gray-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none"
          />
          <button
            onClick={sendMessage}
            className="bg-white text-black px-3 py-2 rounded-lg text-sm hover:bg-gray-200"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}