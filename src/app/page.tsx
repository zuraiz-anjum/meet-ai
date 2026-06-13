import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <span className="text-xl font-bold text-black">Meet AI</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/sign-in"
            className="text-sm text-gray-600 hover:text-black transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-8 py-28">
        <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-600 text-sm px-4 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          AI-powered meetings, now live
        </div>
        <h1 className="text-6xl font-bold text-black leading-tight max-w-3xl mb-6">
          Meet with AI agents that actually{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            listen & respond
          </span>
        </h1>
        <p className="text-xl text-gray-500 max-w-xl mb-10">
          Create custom AI agents, schedule meetings, and have real voice
          conversations. Get summaries and action items automatically.
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="/sign-up"
            className="bg-black text-white px-8 py-3 rounded-lg text-base font-medium hover:bg-gray-800 transition-colors"
          >
            Start for free
          </Link>
          <Link
            href="/sign-in"
            className="text-gray-600 px-8 py-3 rounded-lg text-base font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-black mb-4">
            Everything you need for AI meetings
          </h2>
          <p className="text-gray-500 text-center mb-14 max-w-xl mx-auto">
            From creating agents to getting meeting summaries — all in one place.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "🤖",
                title: "Custom AI Agents",
                desc: "Create agents with custom names, personalities, and instructions tailored to your use case.",
              },
              {
                icon: "🎙️",
                title: "Voice Conversations",
                desc: "Talk naturally with your AI agent. It listens, understands, and speaks back in real time.",
              },
              {
                icon: "📋",
                title: "Auto Summaries",
                desc: "Every meeting ends with an AI-generated summary, key topics, and action items.",
              },
              {
                icon: "📅",
                title: "Meeting Scheduling",
                desc: "Schedule meetings in advance and manage all your upcoming and past sessions.",
              },
              {
                icon: "🧠",
                title: "Knowledge Base",
                desc: "Upload documents and let your agent answer questions from your own content.",
              },
              {
                icon: "📊",
                title: "Analytics",
                desc: "Track meeting frequency, topics discussed, and agent performance over time.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-black mb-4">
            How it works
          </h2>
          <p className="text-gray-500 text-center mb-14 max-w-xl mx-auto">
            Get up and running in minutes.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Create an agent", desc: "Give it a name and instructions" },
              { step: "2", title: "Schedule a meeting", desc: "Pick a time and assign your agent" },
              { step: "3", title: "Join & talk", desc: "Have a real voice conversation" },
              { step: "4", title: "Get summary", desc: "Review AI-generated notes" },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center text-lg font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-black mb-1">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-20 bg-black">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to meet your AI agent?
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Join thousands of teams using Meet AI to run smarter meetings.
          </p>
          <Link
            href="/sign-up"
            className="bg-white text-black px-8 py-3 rounded-lg text-base font-medium hover:bg-gray-100 transition-colors"
          >
            Get started for free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-8 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <span className="font-semibold text-black">Meet AI</span>
        </div>
        <p className="text-gray-400 text-sm">© 2026 Meet AI. All rights reserved.</p>
      </footer>
    </div>
  );
}