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

interface GeminiReplyResult {
  text: string | null;
  model: string;
}

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
  static getConfiguredModelCandidates() {
    const envModel = process.env.GEMINI_MODEL?.trim();
    const candidates = [
      envModel,
      "gemini-2.0-flash",
      "gemini-1.5-flash",
    ].filter((model): model is string => Boolean(model));

    return [...new Set(candidates)];
  }

  static isConfigured() {
    const key = process.env.GEMINI_API_KEY?.trim();
    return Boolean(key && key.length > 20);
  }

  static getStatus() {
    return {
      configured: GeminiService.isConfigured(),
      modelCandidates: GeminiService.getConfiguredModelCandidates(),
    };
  }

  static async generateReply(input: {
    userMessage: string;
    recentMessages: ChatMessageRecord[];
  }): Promise<GeminiReplyResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return { text: null, model: "none" };

    const models = GeminiService.getConfiguredModelCandidates();
    let lastError: Error | null = null;

    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
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
          const raw = await response.text();
          throw new Error(`Gemini ${model} failed ${response.status}: ${raw.slice(0, 240)}`);
        }

        const data = (await response.json()) as GeminiResponse;
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (reply) {
          return { text: reply, model };
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown Gemini error");
      }
    }

    if (lastError) {
      throw lastError;
    }

    return { text: null, model: models[0] || "unknown" };
  }
}
