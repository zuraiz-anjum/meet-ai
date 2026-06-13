"use client";

import { useState, useEffect } from "react";

interface Meeting {
  id: string;
  name: string;
  agentId: string;
  status: string;
  createdAt: string;
}

interface Agent {
  id: string;
  name: string;
}

export default function MeetingsPage() {
  const [open, setOpen] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [agentId, setAgentId] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    const [meetingsRes, agentsRes] = await Promise.all([
      fetch("/api/meetings"),
      fetch("/api/agents"),
    ]);
    const meetingsData = await meetingsRes.json();
    const agentsData = await agentsRes.json();
    setMeetings(meetingsData);
    setAgents(agentsData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    setError("");
    const res = await fetch("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, agentId }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
      setCreating(false);
      return;
    }
    setName("");
    setAgentId("");
    setOpen(false);
    fetchData();
    setCreating(false);
  };

  const statusColor: Record<string, string> = {
    upcoming: "bg-yellow-100 text-yellow-700",
    active: "bg-green-100 text-green-700",
    completed: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Meetings</h1>
            <p className="text-gray-500 mt-1">Schedule and manage your AI meetings</p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            + New Meeting
          </button>
        </div>

        {open && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
              <h2 className="text-xl font-bold mb-4">Create Meeting</h2>

              {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

              <label className="block text-sm font-medium mb-1">Meeting Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sales Call with John"
                className="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-black"
              />

              <label className="block text-sm font-medium mb-1">Select Agent</label>
              <select
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">-- Choose an agent --</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>

              <div className="flex gap-3">
                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Meeting"}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 border py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-gray-400 text-center">Loading...</p>
        ) : meetings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <p className="text-4xl mb-4">📅</p>
            <h2 className="text-xl font-semibold mb-2">No meetings yet</h2>
            <p className="text-gray-500 mb-6">Schedule your first AI meeting</p>
            <button
              onClick={() => setOpen(true)}
              className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
            >
              Create Meeting
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="bg-white rounded-xl shadow-sm border p-6 flex items-center justify-between"
              >
                <div>
                  <h2 className="text-lg font-semibold">{meeting.name}</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {new Date(meeting.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor[meeting.status]}`}>
                    {meeting.status}
                  </span>
                  <button className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800">
                    Join
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}