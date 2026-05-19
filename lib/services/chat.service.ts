import prisma from "@/lib/prisma";

export interface ChatMessageRecord {
  id: string;
  role: "user" | "coach";
  content: string;
  createdAt: Date;
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

  static async generateCoachReply(input: {
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
}
