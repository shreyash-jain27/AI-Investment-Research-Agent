# LLM Chat Session Logs — Building the AI Investment Research Agent

**Tool used**: AI Assistant (LLM)  
**Date**: June 2025  
**Purpose**: Used AI assistance throughout the build process for architecture decisions, code implementation, and debugging.

---

## Session 1: Planning & Architecture

**Me:**  
I need to build an AI investment research agent. It takes a company name, researches it, and gives an invest/pass decision. Tech stack has to be Next.js + LangChain.js + LangGraph.js. Where do I even start? What should the architecture look like?

**AI:**  
A good approach would be to break the research into multiple steps and model it as a graph using LangGraph. Each step (node) handles one part of the research — like fetching company info, analyzing financials, etc. The final node aggregates everything and makes the decision.

**Me:**  
I've seen examples with like 5-6 nodes — one for each research area. But that feels over-engineered for what I need. Can I simplify?

**AI:**  
Absolutely. You could consolidate into 3 nodes:

1. **Gather** — do all the web searches in one node
2. **Analyze** — have the LLM write a structured analysis
3. **Decide** — have the LLM make the final call

This reduces LLM calls and keeps the codebase simpler while still showing you understand the graph pattern.

**Me:**  
Yeah 3 nodes makes more sense. The gather node can run multiple searches in parallel with Promise.all right? Since the searches don't depend on each other.

**AI:**  
Exactly. That's a good optimization — parallel searches cut the gather step time significantly.

**Me:**  
OK so the flow is: gather → analyze → decide. Linear, not branching. Do I even need LangGraph for a linear flow? Could I just use a simple chain?

**AI:**  
You could use a chain, but LangGraph gives you a proper state management pattern. Each node reads and writes to shared state. If you later want to add conditional logic (like "search more if data is insufficient"), LangGraph supports that natively. It also shows the interviewer you understand agentic AI patterns beyond simple API calls.

**Me:**  
Good point. I'll stick with LangGraph. It's what they use in production anyway.

---

## Session 2: Choosing LLM & Search Tools

**Me:**  
For the LLM, I'm thinking Gemini. Free tier, fast. Any issues with using it via LangChain?

**AI:**  
Gemini works well with LangChain via `@langchain/google-genai`. The `gemini-2.5-flash` model has a good free tier — 15 requests per minute. For factual research, keep the temperature low (0.2-0.4).

**Me:**  
What about getting company data? I don't want to use a financial API because most of them need paid plans and the setup is complicated. Can I just use web search?

**AI:**  
Yes — Tavily is a good option. It's a search API built specifically for AI agents. Returns clean text snippets instead of raw HTML. Free tier gives you 1000 searches/month.

**Me:**  
Should I use LangChain's built-in Tavily tool or just call the API directly with fetch?

**AI:**  
Either works. The built-in tool just wraps the same API call. Using raw fetch is simpler, fewer dependencies, and easier to explain in an interview.

**Me:**  
I'll go with raw fetch then. for more transparency.

---

## Session 3: Building the Agent

**Me:**  
I'm setting up the LangGraph state. How does the Annotation thing work? I see examples with reducers but I don't fully get it.

**AI:**  
`Annotation` defines each field in your state object. The `reducer` tells LangGraph how to update the field when a node returns a new value. For simple "just replace the old value" behavior, use `(_, v) => v` — the underscore ignores the old value, `v` is the new value.

**Me:**  
Oh ok so it's like a setState but for the graph. makes sense And each node only returns the fields it wants to update, not the full state?

**AI:**  
Exactly. LangGraph merges the partial update into the full state automatically.

**Me:**  
Got it. Now for the gather node, I want to search for 3 things in parallel — company overview, financials, and recent news. What search queries would give good results?

**AI:**  
For the search queries, be specific with the year to get recent data. Something like:

- `"{company} company overview business model products revenue"`
- `"{company} financial performance revenue growth profit 2024 2025"`
- `"{company} latest news funding market sentiment 2025"`

**Me:**  
I was thinking about adding a 4th search for competitors specifically, but that's another API call. The analyze node can probably figure out competitors from the overview data right?

**AI:**  
Yes, the LLM can infer competitive positioning from the overview and news data. Saving an API call is worth it here — Tavily's free tier is limited to 1000/month.

**Me:**  
OK so 3 searches per run, that gives me about 330 runs on the free tier. That's plenty.

---

## Session 4: Prompting Strategy

**Me:**  
The analyze node prompt is important. My first version was giving really long responses — like 1000+ words. How do I make the LLM keep it concise so it would be easy in the interview process to explain the analysis?

**AI:**  
Add explicit constraints: word limits, bullet points instead of paragraphs, and "skip fluff" type instructions. Something like "Keep TOTAL response under 400 words. Use 3-5 bullet points per section."

**Me:**  
That worked much better. For the decide node, I need it to output JSON so I can render it in the frontend. But LLMs sometimes wrap JSON in markdown backticks. How do I handle that?

**AI:**  
Two approaches: tell the LLM "no backticks, just raw JSON" in the prompt, and also strip backticks in your parsing code as a fallback. Always wrap JSON.parse in a try-catch.

**Me:**  
Yeah I'll do both can you help me implement it with the code structure. I also added a fallback object in case parsing completely fails — the app won't crash, it'll just show a generic result.

---

## Session 5: Frontend

**Me:**  
For the frontend I'm keeping it simple. One page — search bar at top, results below. Dark theme. Do I need separate component files?

**AI:**  
For 3 small components (VerdictCard, ResearchReport, and the main page), keeping them in one file is fine. Splitting into files adds structure without real benefit at this scale.

**Me:**  
Agreed. I also want to show loading progress — like "Gathering data... Analyzing... Making decision..." — but I'm not actually streaming from the agent. Can I fake it with timeouts?

**AI:**  
Yes. Set timed step updates with setTimeout. It won't reflect real agent progress, but it gives the user feedback instead of staring at a spinner for 20 seconds. Just be honest about it if asked — real streaming would use Server-Sent Events.

**Me:**  
Good call. I'll note it as a "what I'd improve" in the README.

---

## Session 6: Debugging

**Me:**  
Getting a 429 rate limit error from Gemini. "Quota exceeded for gemini-2.0-flash". But I've barely used it.

**AI:**  
The gemini-2.0-flash model shares a quota pool. Try switching to `gemini-2.5-flash` — it has separate rate limits. Or create a new Google AI Studio project for a fresh quota.

**Me:**  
Switched to 2.5-flash, works now. Also noticed the detailed analysis section shows raw markdown — the ## and \*\* characters are visible as text instead of formatting.

**AI:**  
You need to render the markdown as HTML. Install `react-markdown` and use `<Markdown>{analysis}</Markdown>` instead of rendering it as plain text. Add `@tailwindcss/typography` for the `prose` classes to style it.

**Me:**  
Fixed. Looks much better now. The headers render properly and bullet points are actual bullets.

---

## Session 7: Final Review

**Me:**  
Before I submit — am I missing anything that would impress them?

**AI:**  
Your README should have: overview, setup instructions, architecture explanation, key decisions with trade-offs, example runs, and what you'd improve. Make sure the trade-offs section is honest — interviewers respect "I chose X because Y, but Z would be better for production."

**Me:**  
Yeah I have all that. I also want to mention that I'd add caching, real financial APIs, and streaming as improvements. Anything else?

**AI:**  
Deploy to Vercel — the assignment says it carries bonus points. It's one-click with Next.js. Just add your env vars in the Vercel dashboard.

**Me:**  
Done. Ship it.

---

_End of chat logs. Total sessions: 7. Used AI for architecture planning, implementation guidance, debugging, and code review. All architectural decisions and trade-offs were made by me._
