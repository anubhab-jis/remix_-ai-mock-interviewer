import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";
import { Type } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const { question, answer, jobDescription, resume, interviewType } = await req.json();

    if (!question || !answer) {
      return NextResponse.json(
        { error: "Both 'question' and 'answer' are required." },
        { status: 400 }
      );
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are an elite, highly precise technical interviewer and AI evaluation engine.
Analyze the candidate's last answer in response to the interviewer's last question, taking into account the job description and the candidate's resume if provided.

Provide an extremely granular, instant evaluation of this specific response turn.
Evaluate:
1. Confidence & Pacing / Fluency: Assign a 'Confidence Score' from 0 to 100 representing how confident, complete, and articulate the response is.
2. Key Areas: Evaluate 2 to 3 critical dimensions of the response (e.g., "Technical Accuracy", "STAR Structure", "Communication Clarity", "Operational Trade-offs") and flag their status ("strong", "needs_improvement", or "outstanding") with a highly specific comment.
3. Feedback Text: Provide a highly constructive, encouraging, but crisp 1-2 sentence feedback about their answer.
4. Suggested Additions: Identify 1 or 2 specific technical details, real-world examples, or frameworks they could have mentioned to make their answer truly outstanding.

Produce a JSON object adhering strictly to the required schema. Ensure the response is constructive and uses precise technical or professional vocabulary.`;

    const prompt = `
Interviewer's Question:
"${question}"

Candidate's Answer:
"${answer}"

Contextual Job Description:
"${jobDescription || "Not provided"}"

Candidate's Resume:
"${resume || "Not provided"}"

Interview Type Focus:
"${interviewType || "mixed"}"

Evaluate this single question-answer turn and provide the granular report card.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            confidenceScore: {
              type: Type.INTEGER,
              description: "Confidence & fluency score from 0 to 100 based on the candidate's response structure and completeness."
            },
            feedbackText: {
              type: Type.STRING,
              description: "A highly crisp, tailored, 1-2 sentence constructive evaluation of this specific answer."
            },
            keyAreas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Name of the dimension evaluated (e.g., 'Technical Depth', 'STAR Alignment', 'Clarity')." },
                  status: { type: Type.STRING, description: "Status: 'strong', 'needs_improvement', or 'outstanding'." },
                  comment: { type: Type.STRING, description: "Short, precise 1-sentence comment highlighting why this status was given." }
                },
                required: ["name", "status", "comment"]
              },
              description: "2 to 3 key areas of evaluation for this specific answer."
            },
            suggestedAdditions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "1 or 2 highly specific terms, technologies, or concepts the candidate could have included to level-up their response."
            }
          },
          required: ["confidenceScore", "feedbackText", "keyAreas", "suggestedAdditions"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No text response from Gemini API.");
    }

    const feedbackData = JSON.parse(text.trim());
    return NextResponse.json(feedbackData);
  } catch (error: any) {
    console.error("Instant Feedback API error:", error);
    return NextResponse.json(
      { error: "Failed to generate instant feedback: " + error.message },
      { status: 500 }
    );
  }
}
