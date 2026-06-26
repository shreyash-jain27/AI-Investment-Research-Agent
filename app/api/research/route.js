import { NextResponse } from "next/server";
import { runResearch } from "@/lib/agent";

export async function POST(req) {
  try {
    const { company } = await req.json();

    if (!company || typeof company !== "string") {
      return NextResponse.json(
        { error: "Please provide a company name" },
        { status: 400 }
      );
    }

    const result = await runResearch(company.trim());
    return NextResponse.json(result);
  } catch (err) {
    console.error("Research failed:", err);
    return NextResponse.json(
      { error: "Something went wrong during research. Please try again." },
      { status: 500 }
    );
  }
}
