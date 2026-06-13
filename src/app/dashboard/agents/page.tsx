"use client";

import { useState, useEffect } from "react";
import { CreateAgentDialog } from "@/components/create-agent-dialog";
import Link from "next/link";

interface Agent {
  id: string;
  name: string;
  instructions: string;
  createdAt: string;
}

export default function AgentsPage() {
  const [open, setOpen] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchAgents = async () => {
    const res = await fetch("/api/agents");
    if (res.ok) {
      const data = await res.json();
      setAgents(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const filtered = agents.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const avatarColors = [
    "bg-blue-100 text-blue-600",
    "bg-purple-100 text-purple-600",
    "bg-green-100 text-green-600",
    "bg-orange-100 text-orange-600",
    "bg-pink-100 text-pink-600",
    "bg-yellow-100 text-yellow-600",
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-black">Agents</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Create and manage your AI agents
            </p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 text-sm font-medium"
          >
            + New Agent
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agents..."
            className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
            <p className="text-gray-400">Loading agents...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
            <p className="text-4xl mb-4">🤖</p>
            <h2 className="text-lg font-semibold mb-2">
              {search ? "No agents found" : "No agents yet"}
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              {search
                ? "Try a different search"
                : "Create your first AI agent to get started"}
            </p>
            {!search && (
              <button
                onClick={() => setOpen(true)}
                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 text-sm"
              >
                Create Agent
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((agent, i) => (
              <div
                key={agent.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0 ${
                      avatarColors[i % avatarColors.length]
                    }`}
                  >
                    {agent.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-black">{agent.name}</h2>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                      {agent.instructions}
                    </p>
                    <p className="text-gray-400 text-xs mt-2">
                      Created{" "}
                      {new Date(agent.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-50">
                  <Link
                    href="/dashboard/meetings"
                    className="flex-1 text-center text-xs bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Start Meeting
                  </Link>
                  <button
                    className="flex-1 text-center text-xs border border-gray-200 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      navigator.clipboard.writeText(agent.instructions);
                      alert("Instructions copied!");
                    }}
                  >
                    Copy Instructions
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <CreateAgentDialog
          open={open}
          onOpenChange={setOpen}
          onSuccess={fetchAgents}
        />
      </div>
    </div>
  );
}