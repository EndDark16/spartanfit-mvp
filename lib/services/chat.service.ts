import prisma from "@/lib/prisma";
import { GeminiService } from "./gemini.service";

export interface ChatMessageRecord {
  id: string;
  role: "user" | "coach";
  content: string;
  createdAt: Date;
}

export interface CoachReplyResult {
  source: "gemini" | "fallback";
  content: string;
  model?: string;
  reason?: string;
}

interface KnowledgeChunkRow {
  content: string;
  metadata: unknown;
}

function getFallbackReply(input: {
  userMessage: string;
  recentMessages: ChatMessageRecord[];
}) {
  const message = input.userMessage.toLowerCase();

  if (message.includes("hipertrofia")) {
    return "Para hipertrofia, prioriza 10-20 series semanales por grupo muscular, progresión de carga y sueño consistente. Si quieres, te propongo una rutina de hoy según tu nivel.";
  }

  if (message.includes("fuerza")) {
    return "Para ganar fuerza, enfócate en básicos con 3-6 repeticiones, descansos amplios y progresión semanal. También podemos revisar tu último registro para ajustar volumen.";
  }

  if (message.includes("rutina")) {
    return "Hoy puedes hacer una sesión full-body: sentadilla, press, remo y peso muerto rumano con trabajo accesorio. Dime tu equipo disponible y te la adapto.";
  }

  if (message.includes("analiza") || message.includes("entrenamiento")) {
    return "Puedo ayudarte a analizar tu entrenamiento. Regla rápida: si completas todas las series con RIR alto, sube carga 2.5-5% en la próxima sesión.";
  }

  if (input.recentMessages.length > 8) {
    return "Veo constancia en tus registros. Mantén la técnica limpia y ajusta la carga solo cuando controles el rango completo. ¿Quieres que pasemos a una microplanificación semanal?";
  }

  return "Estoy listo para ayudarte con hipertrofia, fuerza y progresión. Cuéntame tu objetivo principal de esta semana y tu disponibilidad de días.";
}

function mapGeminiErrorToReason(error: unknown): string {
  const message = error instanceof Error ? error.message : "unknown";
  if (message.includes(" 429")) return "gemini_rate_limited";
  if (message.includes(" 401") || message.includes(" 403")) return "gemini_auth_error";
  if (message.includes(" 404")) return "gemini_model_not_found";
  return "gemini_error";
}

function readMeta(metadata: unknown, key: string): string | null {
  if (!metadata || typeof metadata !== "object") {
    return null;
  }

  const value = (metadata as Record<string, unknown>)[key];
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === "string").join(", ");
  }

  return null;
}

function formatKnowledgeContext(chunks: KnowledgeChunkRow[]) {
  return chunks
    .map((chunk) => {
      const title = readMeta(chunk.metadata, "title");
      const authors = readMeta(chunk.metadata, "authors");
      const category = readMeta(chunk.metadata, "category");

      const sourceInfo = title
        ? `[Fuente: \"${title}\" | Autor(es): ${authors || "Desconocido"} | Categoría: ${category || "N/A"}]`
        : "";

      return `${sourceInfo}\nContenido: ${chunk.content}`.trim();
    })
    .join("\n\n---\n\n");
}

export class ChatService {
  static async getMessagesByUser(userId: string): Promise<ChatMessageRecord[]> {
    const messages = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    return messages.map((message) => ({
      ...message,
      role: message.role as "user" | "coach",
    }));
  }

  static async createMessage(userId: string, role: "user" | "coach", content: string) {
    return prisma.chatMessage.create({
      data: { userId, role, content },
    });
  }

  private static async getKnowledgeContext(userMessage: string): Promise<string | undefined> {
    if (!GeminiService.isConfigured()) {
      return undefined;
    }

    try {
      const embedding = await GeminiService.generateEmbedding({
        text: `task: search query | query: ${userMessage}`,
        outputDimensionality: 768,
      });

      if (!embedding.vector || embedding.vector.length === 0) {
        return undefined;
      }

      const vectorLiteral = `[${embedding.vector.map((value) => Number(value).toFixed(8)).join(",")}]`;

      const chunks = await prisma.$queryRaw<KnowledgeChunkRow[]>`
        SELECT content, metadata
        FROM match_knowledge_chunks(
          ${vectorLiteral}::vector,
          ${0.5},
          ${5}
        )
      `;

      if (!chunks || chunks.length === 0) {
        return undefined;
      }

      return formatKnowledgeContext(chunks);
    } catch (error) {
      console.warn("RAG context unavailable, continuing without retrieval:", error);
      return undefined;
    }
  }

  private static async getUserTrainingStats(userId: string): Promise<Record<string, unknown>> {
    const referenceDate = new Date();
    const fromDate = new Date(referenceDate.getTime() - 28 * 24 * 60 * 60 * 1000);

    const workouts = await prisma.workoutLog.findMany({
      where: {
        userId,
        recordedAt: {
          gte: fromDate,
        },
      },
      include: {
        exercise: {
          select: { name: true },
        },
      },
      orderBy: {
        recordedAt: "desc",
      },
      take: 300,
    });

    if (workouts.length === 0) {
      return {
        sesionesUltimos28Dias: 0,
        diasActivosPorSemana: 0,
        volumenSemanalKgAprox: 0,
      };
    }

    const activeDays = new Set<string>();
    const exerciseUsage = new Map<string, number>();

    let totalVolume = 0;
    let maxLoad = 0;

    for (const workout of workouts) {
      activeDays.add(workout.recordedAt.toISOString().slice(0, 10));

      const exerciseName = workout.exercise?.name || "Sin ejercicio";
      exerciseUsage.set(exerciseName, (exerciseUsage.get(exerciseName) || 0) + 1);

      const volume = workout.weightLoad * workout.reps * workout.sets;
      if (Number.isFinite(volume)) {
        totalVolume += volume;
      }

      if (workout.weightLoad > maxLoad) {
        maxLoad = workout.weightLoad;
      }
    }

    const favoriteExercise = [...exerciseUsage.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    return {
      sesionesUltimos28Dias: workouts.length,
      diasActivosPorSemana: Number((activeDays.size / 4).toFixed(1)),
      volumenSemanalKgAprox: Number((totalVolume / 4).toFixed(1)),
      ejercicioFrecuente: favoriteExercise,
      cargaMaxKgReciente: Number(maxLoad.toFixed(1)),
    };
  }

  static async generateCoachReply(input: {
    userId: string;
    userMessage: string;
    recentMessages: ChatMessageRecord[];
  }): Promise<CoachReplyResult> {
    const [knowledgeContext, userStats] = await Promise.all([
      this.getKnowledgeContext(input.userMessage),
      this.getUserTrainingStats(input.userId),
    ]);

    if (GeminiService.isConfigured()) {
      try {
        const aiReply = await GeminiService.generateReply({
          userMessage: input.userMessage,
          recentMessages: input.recentMessages,
          knowledgeContext,
          userStats,
        });

        if (aiReply.text) {
          return {
            source: "gemini",
            content: aiReply.text,
            model: aiReply.model,
          };
        }
      } catch (error) {
        console.error("Gemini reply failed, using fallback reply:", error);
        return {
          source: "fallback",
          content: getFallbackReply(input),
          reason: mapGeminiErrorToReason(error),
        };
      }
    }

    return {
      source: "fallback",
      content: getFallbackReply(input),
      reason: GeminiService.isConfigured() ? "empty_response" : "missing_api_key",
    };
  }

  static async getProviderStatus() {
    const status = await GeminiService.getStatus();
    return {
      configured: status.configured,
      preferredModel: status.modelCandidates[0] || "gemini-2.0-flash",
      candidates: status.modelCandidates,
    };
  }
}
