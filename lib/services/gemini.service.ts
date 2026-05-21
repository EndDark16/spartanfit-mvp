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

interface GeminiModel {
  name: string;
  supportedGenerationMethods?: string[];
}

interface GeminiModelsResponse {
  models?: GeminiModel[];
}

interface GeminiReplyResult {
  text: string | null;
  model: string;
}

const MODEL_CACHE_TTL_MS = 5 * 60 * 1000;

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
  private static cachedModels: string[] | null = null;
  private static cachedAt = 0;

  static isConfigured() {
    const key = process.env.GEMINI_API_KEY?.trim();
    return Boolean(key && key.length > 20);
  }

  private static getConfiguredModelCandidates() {
    const envModel = process.env.GEMINI_MODEL?.trim();
    const candidates = [
      envModel,
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
      "gemini-1.5-flash",
    ].filter((model): model is string => Boolean(model));

    return [...new Set(candidates)];
  }

  private static normalizeModelName(model: string) {
    return model.startsWith("models/") ? model.replace("models/", "") : model;
  }

  private static async fetchAvailableModels(apiKey: string): Promise<string[]> {
    const now = Date.now();
    if (this.cachedModels && now - this.cachedAt < MODEL_CACHE_TTL_MS) {
      return this.cachedModels;
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(`Gemini list models failed ${response.status}`);
    }

    const data = (await response.json()) as GeminiModelsResponse;
    const models = (data.models || [])
      .filter((model) => model.supportedGenerationMethods?.includes("generateContent"))
      .map((model) => this.normalizeModelName(model.name))
      .filter((name) => name.startsWith("gemini-"));

    this.cachedModels = [...new Set(models)];
    this.cachedAt = now;
    return this.cachedModels;
  }

  private static async getModelCandidates(apiKey: string) {
    const preferred = this.getConfiguredModelCandidates();
    const available = await this.fetchAvailableModels(apiKey);

    const prioritized = preferred.filter((model) => available.includes(model));
    const fallback = available.filter((model) => !prioritized.includes(model));

    return [...prioritized, ...fallback];
  }

  static async getStatus() {
    const configured = GeminiService.isConfigured();
    if (!configured) {
      return {
        configured: false,
        modelCandidates: this.getConfiguredModelCandidates(),
      };
    }

    const apiKey = process.env.GEMINI_API_KEY!.trim();
    try {
      const candidates = await this.getModelCandidates(apiKey);
      return {
        configured: true,
        modelCandidates: candidates,
      };
    } catch {
      return {
        configured: true,
        modelCandidates: this.getConfiguredModelCandidates(),
      };
    }
  }

  static async generateReply(input: {
    userMessage: string;
    recentMessages: ChatMessageRecord[];
  }): Promise<GeminiReplyResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return { text: null, model: "none" };

    const models = await this.getModelCandidates(apiKey.trim());
    let lastError: Error | null = null;

    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`,
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

    if (lastError) throw lastError;

    return { text: null, model: models[0] || "unknown" };
  }
}
