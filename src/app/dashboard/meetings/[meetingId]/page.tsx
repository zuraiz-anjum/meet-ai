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

export default function MeetingRoomPage() {
  const { meetingId } = useParams();
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch("/api/stream-token");
        const { token, userId, userName } = await res.json();

        const streamClient = new StreamVideoClient({
          apiKey: process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY!,
          user: {
            id: userId,
            name: userName,
          },
          token,
        });

        const streamCall = streamClient.call("default", meetingId as string);
        await streamCall.join({ create: true });

        setClient(streamClient);
        setCall(streamCall);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Joining meeting...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
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
  );
}