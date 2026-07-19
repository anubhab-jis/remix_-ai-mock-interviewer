import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { jobDescription, jobTitle } = await req.json();

    if (!jobDescription || !jobDescription.trim()) {
      return NextResponse.json({ profession: "General Professional" });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are a career track classifier. Your sole job is to analyze the provided job description and target job title, and return a clean, high-level, standard career track/profession in 2-3 words (e.g., "Software Engineering", "Marketing Strategy", "Data Analytics", "Product Management", "Product Design", "Finance & Accounting", "Human Resources", "Sales & Business Development", "Systems Administration", "Operations Management", "Legal Services", "Healthcare Administration"). 

Rules:
1. Return ONLY the 2-3 word career track name.
2. Absolutely DO NOT include any formatting, markdown, bolding, quotes, bullets, punctuation, explanations, or filler text.
3. Keep it professional, standard, and brief (under 30 characters).`;

    const prompt = `Target Job Title: ${jobTitle || "Not provided"}\n\nJob Description:\n${jobDescription}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.1, // Low temperature for precise classification
      },
    });

    const profession = response.text ? response.text.trim().replace(/[*_"`]/g, "") : "General Professional";

    return NextResponse.json({ profession });
  } catch (error: any) {
    console.error("Error in detect-profession API:", error);
    return NextResponse.json(
      { error: error.message || "Failed to detect profession." },
      { status: 500 }
    );
  }
}
