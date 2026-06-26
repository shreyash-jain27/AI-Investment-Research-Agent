"use client";
import { useState } from "react";
import Markdown from "react-markdown";

export default function Home() {
  const [company, setCompany] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!company.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);
    setStep("Searching the web for company data...");

    // simulate step updates for ux
    const steps = [
      { text: "Gathering company information...", delay: 3000 },
      { text: "Analyzing financial data...", delay: 6000 },
      { text: "Reading recent news & sentiment...", delay: 9000 },
      { text: "Making investment decision...", delay: 13000 },
    ];
    const timers = steps.map((s) =>
      setTimeout(() => setStep(s.text), s.delay)
    );

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: company.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setResult(data);
      }
    } catch {
      setError("Failed to connect. Check if the server is running.");
    } finally {
      timers.forEach(clearTimeout);
      setLoading(false);
      setStep("");
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100">
      {/* header */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-3">
            AI Investment Research Agent
          </h1>
          <p className="text-gray-400 text-lg">
            Enter a company name — get an instant investment analysis powered by AI
          </p>
        </div>

        {/* search form */}
        <form onSubmit={handleSubmit} className="flex gap-3 mb-10 max-w-xl mx-auto">
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Zomato, Tesla, Stripe..."
            disabled={loading}
            className="flex-1 px-5 py-3 rounded-xl bg-gray-800/70 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <button
            type="submit"
            disabled={loading || !company.trim()}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed font-medium transition-all cursor-pointer"
          >
            {loading ? "Researching..." : "Analyze"}
          </button>
        </form>

        {/* loading state */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-blue-400 font-medium animate-pulse">{step}</p>
            <p className="text-gray-500 text-sm mt-2">This usually takes 15-30 seconds</p>
          </div>
        )}

        {/* error */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-300 text-center">
            {error}
          </div>
        )}

        {/* results */}
        {result && <ResearchReport data={result} />}
      </div>
    </main>
  );
}

// -- verdict card --
function VerdictCard({ verdict }) {
  if (!verdict) return null;
  const isInvest = verdict.verdict === "INVEST";

  return (
    <div
      className={`rounded-2xl p-6 mb-8 border ${
        isInvest
          ? "bg-emerald-950/40 border-emerald-700"
          : "bg-red-950/40 border-red-700"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{isInvest ? "✅" : "❌"}</span>
          <div>
            <h2
              className={`text-2xl font-bold ${
                isInvest ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {verdict.verdict}
            </h2>
            <p className="text-gray-400 text-sm">Investment Recommendation</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-white">{verdict.confidence}%</p>
          <p className="text-gray-400 text-sm">Confidence</p>
        </div>
      </div>
      <p className="text-gray-300 leading-relaxed">{verdict.summary}</p>
    </div>
  );
}

// -- full report --
function ResearchReport({ data }) {
  const { company, analysis, verdict } = data;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center">
        Research Report: <span className="text-blue-400">{company}</span>
      </h2>

      <VerdictCard verdict={verdict} />

      {/* bull & bear case */}
      {verdict && (
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="bg-emerald-950/20 border border-emerald-800/50 rounded-xl p-5">
            <h3 className="text-emerald-400 font-semibold mb-2">📈 Bull Case</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{verdict.bullCase}</p>
          </div>
          <div className="bg-red-950/20 border border-red-800/50 rounded-xl p-5">
            <h3 className="text-red-400 font-semibold mb-2">📉 Bear Case</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{verdict.bearCase}</p>
          </div>
        </div>
      )}

      {/* key factors */}
      {verdict?.keyFactors && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 mb-8">
          <h3 className="text-white font-semibold mb-3">🔑 Key Factors</h3>
          <ul className="space-y-2">
            {verdict.keyFactors.map((f, i) => (
              <li key={i} className="text-gray-300 text-sm flex gap-2">
                <span className="text-blue-400">•</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* full analysis */}
      <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">📋 Detailed Analysis</h3>
        <div className="text-gray-300 text-sm leading-relaxed prose prose-invert prose-sm max-w-none prose-headings:text-blue-400 prose-strong:text-white prose-li:text-gray-300">
          <Markdown>{analysis}</Markdown>
        </div>
      </div>

      {/* disclaimer */}
      <p className="text-gray-600 text-xs text-center mt-8">
        ⚠️ This is AI-generated research for educational purposes only. Not financial advice.
      </p>
    </div>
  );
}
