import { StateGraph, Annotation, END, START } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import llm from "./llm.js";
import { searchWeb } from "./search.js";

// -- state definition --
// this is the data that flows through the graph
const ResearchState = Annotation.Root({
  company: Annotation({ reducer: (_, v) => v, default: () => "" }),
  searchResults: Annotation({ reducer: (_, v) => v, default: () => ({}) }),
  analysis: Annotation({ reducer: (_, v) => v, default: () => "" }),
  verdict: Annotation({ reducer: (_, v) => v, default: () => null }),
});

// -- node 1: gather --
// searches the web for company info across multiple angles
async function gather(state) {
  const { company } = state;

  // run all searches in parallel — faster than sequential
  const [overview, financials, news] = await Promise.all([
    searchWeb(`${company} company overview business model products revenue`),
    searchWeb(`${company} financial performance revenue growth profit 2024 2025`),
    searchWeb(`${company} latest news funding market sentiment 2025`),
  ]);

  return {
    searchResults: {
      overview: overview.answer + "\n" + overview.snippets,
      financials: financials.answer + "\n" + financials.snippets,
      news: news.answer + "\n" + news.snippets,
    },
  };
}

// -- node 2: analyze --
// llm reads all the raw search data and writes a structured analysis
async function analyze(state) {
  const { company, searchResults } = state;

  const prompt = `You are a research analyst writing a CONCISE investment brief.
Analyze ${company} using the data below. Be direct, use numbers, skip fluff.

Write EXACTLY these 5 sections (keep each section to 3-5 bullet points max):

## Company Overview
What they do, sector, main products, scale.

## Financial Health
Revenue, growth rate, profitability, recent funding. Use specific numbers.

## Market Sentiment
Recent news highlights, public perception, momentum direction.

## Competitive Position
Key competitors, market share if available, moat/advantages.

## Key Risks
Top 3-4 risks that could hurt the investment.

--- Search Data ---
${searchResults.overview}

${searchResults.financials}

${searchResults.news}

IMPORTANT: Keep the TOTAL response under 400 words. Be specific, not generic.`;

  const res = await llm.invoke([new HumanMessage(prompt)]);
  return { analysis: res.content };
}

// -- node 3: decide --
// llm reads the analysis and makes the investment call
async function decide(state) {
  const { company, analysis } = state;

  const prompt = `You are a senior investment analyst making a final investment decision.

Based on the analysis below, decide: should we INVEST in ${company} or PASS?

${analysis}

Respond in EXACTLY this JSON format (no markdown, no backticks, just raw JSON):
{
  "verdict": "INVEST" or "PASS",
  "confidence": <number 1-100>,
  "summary": "<2-3 sentence executive summary of your decision>",
  "bullCase": "<why this could be a great investment>",
  "bearCase": "<why this could be a bad investment>",
  "keyFactors": ["<factor 1>", "<factor 2>", "<factor 3>"]
}`;

  const res = await llm.invoke([new HumanMessage(prompt)]);

  // parse the json from llm response
  let parsed;
  try {
    // clean up in case llm wraps it in backticks
    const clean = res.content.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    parsed = JSON.parse(clean);
  } catch {
    // fallback if json parsing fails
    parsed = {
      verdict: "PASS",
      confidence: 50,
      summary: res.content,
      bullCase: "Could not parse structured response",
      bearCase: "Could not parse structured response",
      keyFactors: ["Analysis available but structured parsing failed"],
    };
  }

  return { verdict: parsed };
}

// -- build the graph --
// gather → analyze → decide (simple linear flow)
const graph = new StateGraph(ResearchState)
  .addNode("gather", gather)
  .addNode("analyze", analyze)
  .addNode("decide", decide)
  .addEdge(START, "gather")
  .addEdge("gather", "analyze")
  .addEdge("analyze", "decide")
  .addEdge("decide", END);

// compile it so it's ready to run
const agent = graph.compile();

// main function to run the whole thing
export async function runResearch(companyName) {
  const result = await agent.invoke({
    company: companyName,
  });

  return {
    company: result.company,
    analysis: result.analysis,
    verdict: result.verdict,
  };
}
