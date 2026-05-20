import type { ChatMessageRecord } from "./chat.service";

interface GeminiCandidatePart {
  text?: string;
}

interface GeminiCandidateContent {
  parts?: GeminiCandidatePart[];
}

interface GeminiCandidate {
  content?: GeminiCandidateContent;
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
}

const GEMINI_MODEL = "gemini-1.5-flash";

function buildPrompt(input: { userMessage: string; recentMessages: ChatMessageRecord[] }) {
  const contextMessages = input.recentMessages
    .slice(-8)
    .map((message) => `${message.role === "user" ? "Usuario" : "Coach"}: ${message.content}`)
    .join("\n");

  return [
    "Eres SpartanFit IA, un coach de fitness en español.",
    "Responde de forma útil, segura y accionable.",
    "No inventes datos personales ni médicos.",
    "Si hay riesgos, sugiere consultar un profesional.",
    "Mantén respuestas entre 3 y 7 líneas.",
    contextMessages ? `Contexto reciente:\n${contextMessages}` : "",
    `Mensaje actual del usuario: ${input.userMessage}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export class GeminiService {
  static isConfigured() {
    return Boolean(process.env.GEMINI_API_KEY);
  }

  static async generateReply(input: {
    userMessage: string;
    recentMessages: ChatMessageRecord[];
  }): Promise<string | null> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: buildPrompt(input) }],
            },
          ],
          generationConfig: {
            temperature: 0.6,
            topP: 0.9,
            maxOutputTokens: 400,
          },
        }),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(`Gemini request failed with status ${response.status}`);
    }

    const data = (await response.json()) as GeminiResponse;
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return reply || null;
  }
}
