# AI Investment Research Agent

An AI-powered tool that researches any company and delivers an **Invest or Pass** verdict with detailed reasoning. Built with Next.js, LangChain.js, LangGraph.js, and Google Gemini.

---

## Overview

Enter a company name and the agent:
1. **Searches the web** for company overview, financials, and recent news (using Tavily)
2. **Analyzes** all the gathered data through an LLM to produce a structured report
3. **Decides** whether to Invest or Pass — with a confidence score, bull/bear cases, and key risk factors

The AI agent is built as a **3-node state graph** using LangGraph.js — each node handles one phase of the research pipeline.

---

## How to Run

### Prerequisites
- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com/apikey) (free)
- A [Tavily API key](https://app.tavily.com) (free tier — 1000 searches/month)

### Setup
```bash
git clone <repo-url>
cd ai-investment-agent
npm install
```

Create a `.env.local` file in the root:
```
GOOGLE_API_KEY=your_gemini_key_here
TAVILY_API_KEY=your_tavily_key_here
```

### Run locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### Deploy to Vercel
1. Push the repo to GitHub
2. Go to [vercel.com](https://vercel.com), import the repo
3. Add `GOOGLE_API_KEY` and `TAVILY_API_KEY` in Vercel's Environment Variables settings
4. Deploy — it works out of the box with Next.js

---

## How It Works

### Architecture

```
User Input (company name)
        │
        ▼
   [API Route]  ──→  POST /api/research
        │
        ▼
   [LangGraph Agent]
        │
   ┌────┴────┐
   │  GATHER  │  → Runs 3 parallel web searches (overview, financials, news)
   └────┬────┘
        │
   ┌────┴─────┐
   │  ANALYZE  │  → LLM reads all search data, writes structured analysis
   └────┬─────┘
        │
   ┌────┴────┐
   │  DECIDE  │  → LLM makes invest/pass call with confidence + reasoning
   └────┬────┘
        │
        ▼
   JSON Response → Frontend renders the report
```

### Key files

| File | What it does |
|------|-------------|
| `lib/llm.js` | Initializes Google Gemini via LangChain.js |
| `lib/search.js` | Tavily web search wrapper |
| `lib/agent.js` | LangGraph state graph — the core agent with 3 nodes |
| `app/api/research/route.js` | Next.js API route that runs the agent |
| `app/page.js` | React frontend — search bar, loading states, report display |

### The 3 Agent Nodes

1. **Gather** — fires 3 parallel Tavily searches for company overview, financial data, and recent news. Stores raw results in the shared state.
2. **Analyze** — sends all gathered data to Gemini with a structured prompt. Outputs analysis across 5 dimensions: overview, financials, sentiment, competitive position, risks.
3. **Decide** — reads the analysis and outputs a JSON verdict: INVEST or PASS, confidence score (1-100), executive summary, bull case, bear case, and key factors.

---

## Key Decisions & Trade-offs

| Decision | Why | Trade-off |
|----------|-----|-----------|
| **3-node graph** (gather → analyze → decide) instead of 5+ nodes | Simpler, fewer LLM calls, faster execution, easier to debug | Less granular — each research area isn't independently analyzed |
| **Gemini 2.0 Flash** | Free tier (15 RPM), fast, good quality for analytical tasks | Not as strong as GPT-4o on complex reasoning |
| **Tavily** for web search | Built for AI agents, returns clean structured results | Limited to 1000 searches/month on free tier |
| **Raw fetch for Tavily** instead of LangChain tool wrapper | Fewer dependencies, full control, easier to understand | Doesn't use LangChain's built-in tool abstraction |
| **Single page.js** for all UI | Appropriate for the project's scope — no need to over-split | Would split components for a larger app |
| **No database / caching** | Not needed for the assignment scope | Repeated searches for the same company cost API calls |
| **Step indicators are time-based** (not real streaming) | Much simpler to implement, good enough UX | Steps don't reflect actual agent progress |

### What I left out (intentionally)
- **Authentication** — not needed for a demo
- **Rate limiting** — would add for production
- **Caching layer** — would save API costs at scale
- **Real financial APIs** (Yahoo Finance, Alpha Vantage) — Tavily web search is sufficient for this scope

---

## Example Runs

### Example 1: Zomato
- **Verdict**: INVEST ✅
- **Confidence**: 78%
- **Summary**: Zomato has shown strong revenue growth, achieved profitability, and dominates Indian food delivery. Blinkit adds a high-growth quick commerce angle.
- **Key Risks**: Competitive pressure from Swiggy, regulatory changes

### Example 2: Tesla
- **Verdict**: INVEST ✅ (with caution)
- **Confidence**: 65%
- **Summary**: Tesla leads in EV manufacturing with strong brand and growing energy business. High valuation and competitive pressure from Chinese EVs are concerns.
- **Key Risks**: Valuation premium, CEO distraction, growing competition

### Example 3: WeWork
- **Verdict**: PASS ❌
- **Confidence**: 88%
- **Summary**: WeWork filed for bankruptcy. Massive losses, declining occupancy, and failed business model make this a clear pass.
- **Key Risks**: Already bankrupt, no viable turnaround path

*(Run the agent yourself to see full detailed reports for any company)*

---

## What I Would Improve With More Time

1. **Real financial data APIs** — integrate Alpha Vantage or Yahoo Finance for actual revenue/EPS numbers instead of relying on web search
2. **Streaming responses** — show analysis as it's generated instead of waiting for the full result
3. **Historical comparison** — compare current metrics against historical performance
4. **Sector-specific analysis** — different frameworks for tech vs. pharma vs. manufacturing
5. **Multi-company comparison** — analyze multiple companies side by side
6. **Caching with Redis** — avoid re-searching recently analyzed companies
7. **Charts and visualizations** — render financial data in interactive charts
8. **PDF export** — let users download the research report
9. **More search sources** — add SEC filings, earnings call transcripts for US companies

---

## Tech Stack

- **Next.js 16** — React framework (frontend + API routes)
- **LangChain.js** — LLM abstraction layer
- **LangGraph.js** — Stateful AI agent orchestration
- **Google Gemini 2.0 Flash** — LLM provider
- **Tavily** — AI-optimized web search
- **Tailwind CSS** — Styling
- **Vercel** — Deployment
