import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { jobDescription, resume, interviewType, interviewerPersona, messages } = await req.json();

    const ai = getGeminiClient();

    const systemInstruction = `You are a helpful, subtle, and supportive Interview Coach Lifeline. 
Your goal is to provide a subtle, conceptual clue, helpful structuring framework (like the STAR method), or brainstorming guidance to help the candidate answer the interviewer's last question.

Rules:
1. Review the conversation history. Identify the latest question or prompt posed by the interviewer.
2. Formulate a gentle, strategic hint or nudge. For example, suggest a relevant key concept to mention, a structure to follow, or a way to connect their resume/experience to the question.
3. CRITICAL: Do NOT give away the direct answer, complete sample response, or exact code/syntax. Keep the clue purely conceptual, subtle, and strategic.
4. Keep the output extremely crisp, friendly, and brief (maximum 60 words).
5. Speak directly to the candidate as a supportive sideline mentor. Do not output any metadata, intro headers, or tags.`;

    // Map frontend messages to Gemini format
    let contents: any[] = [];
    if (messages && messages.length > 0) {
      contents = messages.map((msg: any) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      }));
    }

    // Append a prompt asking for the nudge based on the last message
    contents.push({
      role: "user",
      parts: [{ 
        text: `Based on our interview context (Job Description: "${jobDescription || "N/A"}", Resume: "${resume || "N/A"}", Interview Type: "${interviewType}"), please provide a subtle, brief, and strategic conceptual hint/clue to help me answer the interviewer's last question.` 
      }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.6,
      },
    });

    const text = response.text || "Try breaking your answer down into the Situation, Task, Action, and Result (STAR) format.";

    return NextResponse.json({ hint: text });
  } catch (error: any) {
    console.error("Error generating interview hint:", error);
    return NextResponse.json(
      { error: error.message || "Could not generate hint." },
      { status: 500 }
    );
  }
}
