"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
  const [filter, setFilter] = useState<"all" | "upcoming" | "active" | "completed">("all");
  const [search, setSearch] = useState("");

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

  const statusIcon: Record<string, string> = {
    upcoming: "🕐",
    active: "🔴",
    completed: "✅",
  };

  const filtered = meetings
    .filter((m) => filter === "all" || m.status === filter)
    .filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-black">Meetings</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Schedule and manage your AI meetings
            </p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 text-sm font-medium"
          >
            + New Meeting
          </button>
        </div>

        {/* Search + Filter */}
        <div className="flex items-center gap-3 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search meetings..."
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
          />
          <div className="flex items-center gap-2">
            {(["all", "upcoming", "active", "completed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
                  filter === f
                    ? "bg-black text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Create Modal */}
        {open && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
              <h2 className="text-xl font-bold mb-1">New Meeting</h2>
              <p className="text-gray-500 text-sm mb-5">
                Schedule a meeting with an AI agent
              </p>

              {error && (
                <p className="text-red-500 text-sm mb-3 bg-red-50 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}

              <label className="block text-sm font-medium mb-1">
                Meeting Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sales Call with John"
                className="w-full border rounded-lg px-4 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />

              <label className="block text-sm font-medium mb-1">
                Select Agent
              </label>
              <select
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 mb-6 text-sm focus:outline-none focus:ring-2 focus:ring-black"
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
                  disabled={creating || !name || !agentId}
                  className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 text-sm font-medium"
                >
                  {creating ? "Creating..." : "Create Meeting"}
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    setError("");
                    setName("");
                    setAgentId("");
                  }}
                  className="flex-1 border py-2 rounded-lg hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
            <p className="text-gray-400">Loading meetings...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
            <p className="text-4xl mb-4">📅</p>
            <h2 className="text-lg font-semibold mb-2">
              {search || filter !== "all" ? "No meetings found" : "No meetings yet"}
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              {search || filter !== "all"
                ? "Try a different search or filter"
                : "Schedule your first AI meeting"}
            </p>
            {!search && filter === "all" && (
              <button
                onClick={() => setOpen(true)}
                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 text-sm"
              >
                Create Meeting
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
            {filtered.map((meeting) => (
              <div
                key={meeting.id}
                className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-lg">
                    {statusIcon[meeting.status] || "📅"}
                  </div>
                  <div>
                    <h2 className="font-semibold text-black text-sm">
                      {meeting.name}
                    </h2>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {new Date(meeting.createdAt).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor[meeting.status]}`}
                  >
                    {meeting.status}
                  </span>
                  {meeting.status === "completed" ? (
                    <Link
                      href={`/dashboard/meetings/${meeting.id}/summary`}
                      className="text-xs border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      View Summary
                    </Link>
                  ) : (
                    <Link
                      href={`/dashboard/meetings/${meeting.id}`}
                      className="text-xs bg-black text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Join →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}