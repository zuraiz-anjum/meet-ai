"use client";

import { useSession, signOut } from "@/auth-client";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <button
              onClick={handleSignOut}
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
            >
              Sign Out
            </button>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50">
            <p className="text-sm text-gray-500 mb-1">Logged in as</p>
            <p className="font-medium">{session?.user?.name}</p>
            <p className="text-sm text-gray-500">{session?.user?.email}</p>
          </div>

          <div className="mt-6">
            <p className="text-gray-400 text-sm text-center">
              Agent dashboard coming soon 🚀
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}