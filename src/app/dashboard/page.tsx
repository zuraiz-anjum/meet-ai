"use client";

import { useSession, signOut } from "@/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Stats {
  totalMeetings: number;
  completedMeetings: number;
  activeMeetings: number;
  totalAgents: number;
}

interface Meeting {
  id: string;
  name: string;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalMeetings: 0,
    completedMeetings: 0,
    activeMeetings: 0,
    totalAgents: 0,
  });
  const [recentMeetings, setRecentMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meetingsRes, agentsRes] = await Promise.all([
          fetch("/api/meetings"),
          fetch("/api/agents"),
        ]);
        const meetings: Meeting[] = await meetingsRes.json();
        const agents = await agentsRes.json();

        setStats({
          totalMeetings: meetings.length,
          completedMeetings: meetings.filter((m) => m.status === "completed").length,
          activeMeetings: meetings.filter((m) => m.status === "active").length,
          totalAgents: agents.length,
        });

        setRecentMeetings(meetings.slice(0, 5));
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const statusColor: Record<string, string> = {
    upcoming: "bg-yellow-100 text-yellow-700",
    active: "bg-green-100 text-green-700",
    completed: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      {/* Header */}
      <div className="px-8 py-8 pb-0">
        <h1 className="text-2xl font-bold text-black">Home</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back, {session?.user?.name} 👋
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Meetings", value: stats.totalMeetings, icon: "📅" },
            { label: "Completed", value: stats.completedMeetings, icon: "✅" },
            { label: "Active Now", value: stats.activeMeetings, icon: "🔴" },
            { label: "AI Agents", value: stats.totalAgents, icon: "🤖" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
            >
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-black mb-1">
                {loading ? "—" : stat.value}
              </div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-black mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/dashboard/meetings"
              className="bg-black text-white rounded-xl p-6 hover:bg-gray-800 transition-colors group"
            >
              <div className="text-2xl mb-2">📅</div>
              <div className="font-semibold mb-1">New Meeting</div>
              <div className="text-sm text-gray-400">
                Schedule a meeting with an AI agent
              </div>
            </Link>
            <Link
              href="/dashboard/agents"
              className="bg-white border border-gray-100 shadow-sm rounded-xl p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="text-2xl mb-2">🤖</div>
              <div className="font-semibold text-black mb-1">Create Agent</div>
              <div className="text-sm text-gray-500">
                Build a custom AI agent for your needs
              </div>
            </Link>
            <Link
              href="/dashboard/meetings"
              className="bg-white border border-gray-100 shadow-sm rounded-xl p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="text-2xl mb-2">📋</div>
              <div className="font-semibold text-black mb-1">View Summaries</div>
              <div className="text-sm text-gray-500">
                Review your past meeting summaries
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Meetings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-black">Recent Meetings</h2>
            <Link
              href="/dashboard/meetings"
              className="text-sm text-gray-500 hover:text-black"
            >
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
              <p className="text-gray-400">Loading...</p>
            </div>
          ) : recentMeetings.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
              <p className="text-4xl mb-3">📅</p>
              <p className="font-medium text-gray-700 mb-1">No meetings yet</p>
              <p className="text-sm text-gray-400 mb-4">
                Schedule your first meeting to get started
              </p>
              <Link
                href="/dashboard/meetings"
                className="text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
              >
                Create Meeting
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
              {recentMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                      📅
                    </div>
                    <div>
                      <p className="font-medium text-black text-sm">
                        {meeting.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(meeting.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[meeting.status]}`}
                    >
                      {meeting.status}
                    </span>
                    {meeting.status === "completed" ? (
                      <Link
                        href={`/dashboard/meetings/${meeting.id}/summary`}
                        className="text-xs text-gray-500 hover:text-black underline"
                      >
                        View Summary
                      </Link>
                    ) : (
                      <Link
                        href={`/dashboard/meetings/${meeting.id}`}
                        className="text-xs bg-black text-white px-3 py-1 rounded-lg hover:bg-gray-800"
                      >
                        Join
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}