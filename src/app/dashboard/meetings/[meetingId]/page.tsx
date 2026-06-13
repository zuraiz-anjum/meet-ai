"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
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
  const router = useRouter();
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [agentName, setAgentName] = useState("");
  const [agentInstructions, setAgentInstructions] = useState("");
  const [status, setStatus] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [transcript, setTranscript] = useState("");
  const [ending, setEnding] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const isSpeakingRef = useRef(false);
  const messagesRef = useRef<Message[]>([]);
  const agentInstructionsRef = useRef("");
  const callRef = useRef<any>(null);
  const clientRef = useRef<any>(null);
  const endingRef = useRef(false);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    agentInstructionsRef.current = agentInstructions;
  }, [agentInstructions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, transcript]);

  const speak = (text: string, onDone?: () => void) => {
    if (!window.speechSynthesis || endingRef.current) {
      onDone?.();
      return;
    }
    window.speechSynthesis.cancel();
    isSpeakingRef.current = true;
    setStatus("speaking");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = () => {
      isSpeakingRef.current = false;
      if (!endingRef.current) onDone?.();
    };
    utterance.onerror = () => {
      isSpeakingRef.current = false;
      if (!endingRef.current) onDone?.();
    };
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (endingRef.current) return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setStatus("listening");
      setTranscript("");
    };

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += t;
        } else {
          interim += t;
        }
      }
      setTranscript(final || interim);
    };

    recognition.onend = () => {
      if (endingRef.current) return;
      const current = recognitionRef.current;
      if (!current) return;
      const finalText = current._lastTranscript;
      if (finalText && finalText.trim().length > 0) {
        handleUserMessage(finalText.trim());
      } else {
        startListening();
      }
    };

    recognition.onerror = (e: any) => {
      if (endingRef.current) return;
      if (e.error === "no-speech") {
        startListening();
      }
    };

    const originalOnResult = recognition.onresult;
    recognition.onresult = (event: any) => {
      originalOnResult(event);
      let final = "";
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        }
      }
      recognition._lastTranscript = final;
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleUserMessage = async (text: string) => {
    if (endingRef.current) return;

    setTranscript("");
    setStatus("thinking");

    const userMsg: Message = { role: "user", text };
    const updatedMessages = [...messagesRef.current, userMsg];
    setMessages(updatedMessages);
    messagesRef.current = updatedMessages;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          instructions: agentInstructionsRef.current,
          history: messagesRef.current,
        }),
      });
      const data = await res.json();
      const reply = data.reply;

      if (endingRef.current) return;

      const agentMsg: Message = { role: "agent", text: reply };
      const finalMessages = [...messagesRef.current, agentMsg];
      setMessages(finalMessages);
      messagesRef.current = finalMessages;

      speak(reply, () => {
        startListening();
      });
    } catch {
      if (endingRef.current) return;
      const errMsg = "Sorry, I couldn't process that.";
      setMessages((prev) => [...prev, { role: "agent", text: errMsg }]);
      speak(errMsg, () => startListening());
    }
  };

  const endMeeting = async () => {
    // Set ending flag immediately to stop all ongoing processes
    endingRef.current = true;
    setEnding(true);

    // Stop everything immediately
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    window.speechSynthesis?.cancel();
    isSpeakingRef.current = false;
    setStatus("idle");

    const transcriptText = messagesRef.current
      .map((m) => `${m.role === "user" ? "User" : "Agent"}: ${m.text}`)
      .join("\n");

    try {
      const res = await fetch(`/api/meetings/${meetingId}/summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: transcriptText }),
      });
      const data = await res.json();
      localStorage.setItem(`summary-${meetingId}`, data.summary);
    } catch {
      localStorage.setItem(
        `summary-${meetingId}`,
        "Summary could not be generated."
      );
    }

    callRef.current?.leave();
    clientRef.current?.disconnectUser();
    router.push(`/dashboard/meetings/${meetingId}/summary`);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const tokenRes = await fetch("/api/stream-token");
        const { token, userId, userName } = await tokenRes.json();

        const joinRes = await fetch(`/api/meetings/${meetingId}/join`, {
          method: "POST",
        });
        const agentData = await joinRes.json();
        setAgentName(agentData.agentName);
        setAgentInstructions(agentData.agentInstructions);
        agentInstructionsRef.current = agentData.agentInstructions;

        const streamClient = new StreamVideoClient({
          apiKey: process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY!,
          user: { id: userId, name: userName },
          token,
        });

        const streamCall = streamClient.call("default", meetingId as string);
        await streamCall.join({ create: true });

        setClient(streamClient);
        setCall(streamCall);
        callRef.current = streamCall;
        clientRef.current = streamClient;

        const welcome = `Hi! I'm ${agentData.agentName}. How can I help you today?`;
        const welcomeMsg: Message = { role: "agent", text: welcome };
        setMessages([welcomeMsg]);
        messagesRef.current = [welcomeMsg];

        setLoading(false);

        speak(welcome, () => {
          startListening();
        });
      } catch (err) {
        setError("Failed to join meeting");
        setLoading(false);
      }
    };

    init();

    return () => {
      endingRef.current = true;
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      window.speechSynthesis?.cancel();
      callRef.current?.leave();
      clientRef.current?.disconnectUser();
    };
  }, [meetingId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-white text-lg">Joining meeting...</p>
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

  const statusLabel = {
    idle: "...",
    listening: "🎙️ Listening...",
    thinking: "🤔 Thinking...",
    speaking: "🔊 Speaking...",
  }[status];

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
          <p
            className={`text-xs mt-1 font-medium ${
              status === "listening"
                ? "text-green-400"
                : status === "thinking"
                ? "text-yellow-400"
                : status === "speaking"
                ? "text-blue-400"
                : "text-gray-400"
            }`}
          >
            {statusLabel}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
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

          {transcript && (
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-lg px-3 py-2 text-sm bg-white/20 text-white/70 italic">
                {transcript}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Status bar + End Meeting at bottom */}
        <div className="p-4 border-t border-gray-700 space-y-2">
          <div
            className={`w-full py-3 rounded-lg text-sm font-medium text-center ${
              status === "listening"
                ? "bg-green-600 text-white animate-pulse"
                : status === "thinking"
                ? "bg-yellow-600 text-white"
                : status === "speaking"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-400"
            }`}
          >
            {statusLabel}
          </div>
          <button
            onClick={endMeeting}
            disabled={ending}
            className="w-full py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {ending ? "Ending..." : "End Meeting"}
          </button>
        </div>
      </div>
    </div>
  );
}