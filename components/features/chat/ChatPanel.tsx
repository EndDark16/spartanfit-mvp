"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import { sendChatMessageAction } from "@/actions/chat.actions";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { ChatInput } from "./ChatInput";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { ChatTypingIndicator } from "./ChatTypingIndicator";

interface ChatPanelProps {
  initialMessages: Array<{
    id: string;
    role: "user" | "coach";
    content: string;
    createdAt: Date;
  }>;
}

const suggestionPrompts = [
  "Como mejoro mi hipertrofia?",
  "Que rutina puedo hacer hoy?",
  "Como progreso en fuerza?",
  "Analiza mi ultimo entrenamiento",
];

export function ChatPanel({ initialMessages }: ChatPanelProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryMessage, setRetryMessage] = useState<string>("");
  const { pushToast } = useToast();
  const endRef = useRef<HTMLDivElement | null>(null);
  const optimisticCounter = useRef(0);

  const hasMessages = useMemo(() => messages.length > 0, [messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isSending]);

  const handleSend = async (message: string) => {
    setIsSending(true);
    setErrorMessage(null);
    setRetryMessage(message);

    const optimisticUserMessage = {
      id: `temp-${optimisticCounter.current++}`,
      role: "user" as const,
      content: message,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, optimisticUserMessage]);

    const response = await sendChatMessageAction(message);
    setIsSending(false);

    if (!response.success || !response.data) {
      setMessages((prev) => prev.filter((item) => item.id !== optimisticUserMessage.id));
      setErrorMessage(response.error || "No pudimos responder ahora.");
      pushToast({
        variant: "error",
        title: "No se pudo enviar el mensaje",
        description: "Intenta nuevamente en unos segundos.",
      });
      return false;
    }

    setMessages((prev) => {
      const withoutOptimistic = prev.filter((item) => item.id !== optimisticUserMessage.id);
      return [
        ...withoutOptimistic,
        {
          id: response.data.userMessage.id,
          role: "user",
          content: response.data.userMessage.content,
          createdAt: new Date(response.data.userMessage.createdAt),
        },
        {
          id: response.data.coachMessage.id,
          role: "coach",
          content: response.data.coachMessage.content,
          createdAt: new Date(response.data.coachMessage.createdAt),
        },
      ];
    });
    return true;
  };

  return (
    <Card className="flex min-h-[70vh] flex-col overflow-hidden p-0">
      <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
        {!hasMessages && (
          <EmptyState
            title="Empieza tu conversacion"
            description="Hazle una pregunta al coach para planificar tu entrenamiento."
            icon={<MessageCircle className="h-6 w-6" />}
            action={
              <div className="flex flex-wrap justify-center gap-2">
                {suggestionPrompts.map((prompt) => (
                  <Button
                    key={prompt}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void handleSend(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            }
          />
        )}

        {messages.map((message) => (
          <ChatMessageBubble
            key={message.id}
            role={message.role}
            content={message.content}
            createdAt={new Date(message.createdAt)}
          />
        ))}

        {isSending && <ChatTypingIndicator />}

        {errorMessage && (
          <ErrorState
            title="No pudimos generar respuesta"
            description={errorMessage}
            action={
              <Button
                variant="secondary"
                type="button"
                onClick={() => void handleSend(retryMessage)}
              >
                Reintentar
              </Button>
            }
          />
        )}
        <div ref={endRef} />
      </div>

      <ChatInput onSend={handleSend} isSending={isSending} />
    </Card>
  );
}
