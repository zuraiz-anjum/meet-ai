"use client";

import { useState } from "react";
import { signUp } from "@/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setLoading(true);
    setError("");
    const { error } = await signUp.email({
      name,
      email,
      password,
      callbackURL: "/dashboard",
    });
    if (error) {
      setError(error.message ?? "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-black flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <span className="text-white text-xl font-bold">Meet AI</span>
        </div>
        <div>
          <p className="text-white text-3xl font-bold leading-snug mb-4">
            Your AI meeting <br /> assistant awaits
          </p>
          <p className="text-gray-400 text-sm">
            Create custom agents, have voice conversations, and get
            AI-generated summaries after every meeting.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: "🎙️", label: "Voice conversations" },
            { icon: "📋", label: "Auto summaries" },
            { icon: "🤖", label: "Custom agents" },
            { icon: "📅", label: "Easy scheduling" },
          ].map((f) => (
            <div
              key={f.label}
              className="bg-gray-900 rounded-lg px-3 py-2.5 flex items-center gap-2"
            >
              <span>{f.icon}</span>
              <span className="text-gray-300 text-xs">{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="text-2xl">🤖</span>
            <span className="text-xl font-bold text-black">Meet AI</span>
          </div>

          <h1 className="text-2xl font-bold text-black mb-1">
            Create your account
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            Start having AI-powered meetings today — free forever.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-lg mb-5">
              {error}
            </div>
          )}

          <div className="space-y-3 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSignUp()}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSignUp()}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSignUp()}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
              <p className="text-xs text-gray-400 mt-1">
                Must be at least 8 characters
              </p>
            </div>
          </div>

          <button
            onClick={handleSignUp}
            disabled={loading || !name || !email || !password}
            className="w-full bg-black text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors mb-4"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <p className="text-xs text-gray-400 text-center mb-6">
            By signing up you agree to our{" "}
            <span className="underline cursor-pointer">Terms of Service</span>{" "}
            and{" "}
            <span className="underline cursor-pointer">Privacy Policy</span>.
          </p>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="text-black font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}