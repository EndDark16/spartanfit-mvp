import { getChatMessagesAction } from "@/actions/chat.actions";
import { ChatPanel } from "@/components/features/chat/ChatPanel";
import { AppShell } from "@/components/layout/AppShell";
import { UserService } from "@/lib/services/user.service";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "SpartanFit | Chat IA",
};

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const [dbUser, messages] = await Promise.all([
    UserService.syncUser(user),
    getChatMessagesAction(),
  ]);

  if (dbUser.goal === "pending" || !dbUser.roleId) {
    redirect("/profile");
  }

  return (
    <AppShell
      userName={dbUser.name || user.email || "Atleta"}
      userEmail={user.email || ""}
      isAdmin={dbUser.role?.name === "ADMIN"}
      title="Coach IA SpartanFit"
      description="Consulta rutinas, estrategia de fuerza y análisis de progreso."
    >
      <ChatPanel
        initialMessages={messages.map((message) => ({
          ...message,
          role: message.role as "user" | "coach",
          createdAt: new Date(message.createdAt),
        }))}
      />
    </AppShell>
  );
}
