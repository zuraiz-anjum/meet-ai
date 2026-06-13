"use client";

import { useState, useEffect } from "react";
import { CreateAgentDialog } from "@/components/create-agent-dialog";

interface Agent {
  id: string;
  name: string;
  instructions: string;
  createdAt: string;
}

export default function AgentsPage() {
  const [open, setOpen] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);

  const fetchAgents = async () => {
    const res = await fetch("/api/agents");
    if (res.ok) {
      const data = await res.json();
      setAgents(data);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Agents</h1>
            <p className="text-gray-500 mt-1">
              Create and manage your AI agents
            </p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            + New Agent
          </button>
        </div>

        {agents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <p className="text-4xl mb-4">🤖</p>
            <h2 className="text-xl font-semibold mb-2">No agents yet</h2>
            <p className="text-gray-500 mb-6">
              Create your first AI agent to get started
            </p>
            <button
              onClick={() => setOpen(true)}
              className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
            >
              Create Agent
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {agents.map((agent) => (
              <div key={agent.id} className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-semibold">{agent.name}</h2>
                <p className="text-gray-500 mt-1 text-sm line-clamp-2">{agent.instructions}</p>
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