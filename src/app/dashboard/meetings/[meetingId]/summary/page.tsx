"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function SummaryPage() {
  const { meetingId } = useParams();
  const router = useRouter();
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(`summary-${meetingId}`);
    if (stored) {
      setSummary(stored);
      setLoading(false);
    } else {
      router.push("/dashboard/meetings");
    }
  }, [meetingId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading summary...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Meeting Summary</h1>
            <p className="text-gray-500 mt-1">AI-generated summary of your meeting</p>
          </div>
          <button
            onClick={() => router.push("/dashboard/meetings")}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            Back to Meetings
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-8">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">📋</span>
            <h2 className="text-xl font-semibold">Summary</h2>
          </div>
          <div className="prose max-w-none">
            {summary.split("\n").map((line, i) => (
              <p key={i} className="text-gray-700 mb-2">
                {line}
              </p>
            ))}
          </div>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              navigator.clipboard.writeText(summary);
              alert("Summary copied to clipboard!");
            }}
            className="text-gray-500 hover:text-black text-sm underline"
          >
            Copy to clipboard
          </button>
        </div>
      </div>
    </div>
  );
}