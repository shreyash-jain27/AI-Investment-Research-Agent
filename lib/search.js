// tavily search — built for ai agents, returns clean results
const TAVILY_URL = "https://api.tavily.com/search";

export async function searchWeb(query, maxResults = 5) {
  const res = await fetch(TAVILY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query,
      max_results: maxResults,
      include_answer: true,
    }),
  });

  if (!res.ok) {
    throw new Error(`Tavily search failed: ${res.status}`);
  }

  const data = await res.json();

  // pull out the useful bits
  const snippets = (data.results || []).map(
    (r) => `${r.title}: ${r.content}`
  );

  return {
    answer: data.answer || "",
    snippets: snippets.join("\n\n"),
  };
}
