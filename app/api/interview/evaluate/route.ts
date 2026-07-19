import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";
import { Type } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const { jobDescription, resume, interviewType, interviewerPersona, messages, unexpectedScenarioMode } = await req.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "No interview messages found to evaluate. Please participate in the interview first." },
        { status: 400 }
      );
    }

    const ai = getGeminiClient();

    // Format chat transcripts for the AI evaluator
    const transcript = messages
      .map((msg: any) => `${msg.sender.toUpperCase()}: ${msg.text}`)
      .join("\n\n");

    let unexpectedScenarioEvaluationGuide = "";
    if (unexpectedScenarioMode) {
      unexpectedScenarioEvaluationGuide = `\n5. CRISIS COGNITION & PIVOT AGILITY: Unexpected Scenario Mode was active! Evaluate how effectively the candidate responded when the interview shifted into crisis mode halfway through. Did they maintain composure, pivot their technical approach on the fly using the technical skills listed in their resume, and design sensible mitigation steps? Address this performance specifically in the overall score, key strengths/improvements, and recommended answers.`;
    }

    const systemInstruction = `You are an elite talent acquisition leader, executive coach, and engineering bar-raiser.
Your task is to analyze the provided mock interview transcript between a candidate and an AI interviewer, and produce a comprehensive, structured evaluation.

Context details:
- Target Job Description:
${jobDescription || "Not provided (evaluate general professional suitability)"}

- Candidate Resume:
${resume || "Not provided (evaluate pure interview communication and substance)"}

- Interview Type: ${interviewType || "Mixed"}
- Interviewer Persona: ${interviewerPersona || "Executive"}

Analyze the transcript thoroughly. Look at:
1. Technical Depth: Did they show real understanding, describe actual trade-offs, and use correct domain terminology?
2. Communication: Was their speech clear, crisp, structured, and professional, or did they ramble, use fillers, or give too brief answers?
3. Problem Solving: How did they handle technical problems or scenario-based behavioral challenges?
4. Behavioral Fit: Did they explain situations using STAR methodology (Situation, Task, Action, Result) with clear accountability?
5. Speech Pacing: Analyze the transcript for pacing, long-windedness vs. conciseness. Assign a score based on whether answers are too brief/dodge detail or too rambling/long-winded, with 10 representing perfectly crisp, structured, and proportional pacing.${unexpectedScenarioEvaluationGuide}

Produce a complete JSON object adhering strictly to the required schema. Ensure the feedback is extremely constructive, citing actual parts of their conversation where possible.`;

    const prompt = `Please evaluate the following mock interview transcript:

--- INTERVIEW TRANSCRIPT ---
${transcript}
---------------------------

Generate a complete, helpful, and highly detailed evaluation report card in JSON format. Make sure to provide excellent recommended answers that demonstrate highly structured, polished communication style.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3, // Lower temperature for analytical evaluation
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: {
              type: Type.INTEGER,
              description: "Overall score out of 100 representing the candidate's interview performance."
            },
            summary: {
              type: Type.STRING,
              description: "A comprehensive summary assessment of the candidate's performance. Focus on general impressions, their delivery style, and clear advice."
            },
            strengths: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  point: { type: Type.STRING, description: "A high-level strength point, e.g., 'Strong System Architecture Knowledge'." },
                  detail: { type: Type.STRING, description: "A detail explaining exactly where and how they demonstrated this in the interview." }
                },
                required: ["point", "detail"]
              },
              description: "List of 2-4 key strengths shown during the conversation."
            },
            improvements: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  point: { type: Type.STRING, description: "An area needing improvement, e.g., 'Incomplete STAR Framework execution'." },
                  detail: { type: Type.STRING, description: "Actionable, constructive feedback detailing how the candidate could restructure or enrich their answer." }
                },
                required: ["point", "detail"]
              },
              description: "List of 2-4 key areas of constructive growth."
            },
            recommendedAnswers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING, description: "The specific question asked by the interviewer." },
                  candidateAnswer: { type: Type.STRING, description: "The candidate's actual answer or a short summary of it." },
                  suggestedResponse: { type: Type.STRING, description: "A highly optimized, professional model response showing how to answer perfectly." }
                },
                required: ["question", "candidateAnswer", "suggestedResponse"]
              },
              description: "Up to 3 specific question-and-answer pairs from the interview, showing what they answered vs a highly polished, ideal model answer."
            },
            categories: {
              type: Type.OBJECT,
              properties: {
                technicalDepth: { type: Type.INTEGER, description: "Score from 1 to 10 for technical competencies or alignment." },
                communication: { type: Type.INTEGER, description: "Score from 1 to 10 for clarity, articulation, and conciseness." },
                problemSolving: { type: Type.INTEGER, description: "Score from 1 to 10 for reasoning, structuring, and critical thinking." },
                behavioralFit: { type: Type.INTEGER, description: "Score from 1 to 10 for STAR alignment, culture fit, or executive presence." },
                speechPacing: { type: Type.INTEGER, description: "Score from 1 to 10 evaluating long-windedness vs. conciseness. High score means perfectly crisp, well-paced answers, while low score means too rambling or too brief." }
              },
              required: ["technicalDepth", "communication", "problemSolving", "behavioralFit", "speechPacing"]
            }
          },
          required: ["overallScore", "summary", "strengths", "improvements", "recommendedAnswers", "categories"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Received empty response from evaluation model.");
    }

    const evaluationData = JSON.parse(resultText.trim());
    return NextResponse.json(evaluationData);
  } catch (error: any) {
    console.error("Error in mock interview evaluation route:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during the interview evaluation." },
      { status: 500 }
    );
  }
}
