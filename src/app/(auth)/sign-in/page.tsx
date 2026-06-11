"use client";

import { useState } from "react";
import { signIn } from "@/auth-client";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    setError("");
    const { error } = await signIn.email({
      email,
      password,
      callbackURL: "/dashboard",
    });
    if (error) {
      setError(error.message ?? "Something went wrong");
      setLoading(false);
    }
  };

  const handleGithub = async () => {
    await signIn.social({ provider: "github", callbackURL: "/dashboard" });
  };

  const handleGoogle = async () => {
    await signIn.social({ provider: "google", callbackURL: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-black"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-black"
        />

        <button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded-lg mb-3 hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <button
          onClick={handleGithub}
          className="w-full border py-2 rounded-lg mb-3 hover:bg-gray-50"
        >
          Continue with GitHub
        </button>

        <button
          onClick={handleGoogle}
          className="w-full border py-2 rounded-lg hover:bg-gray-50"
        >
          Continue with Google
        </button>

        <p className="text-center text-sm mt-4 text-gray-500">
          Don't have an account?{" "}
          <a href="/sign-up" className="text-black font-medium hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}