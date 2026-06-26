import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

// one shared llm instance — gemini 2.0 flash is fast and free
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0.3, // low temp for factual research
  apiKey: process.env.GOOGLE_API_KEY,
});

export default llm;
