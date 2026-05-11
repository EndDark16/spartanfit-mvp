import { getExercises } from "@/actions/exercise.actions";
import { ExercisesClient } from "./exercises-client";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { UserService } from "@/lib/services/user.service";
import Link from "next/link";

export const metadata = {
  title: "Admin | Ejercicios",
};

export default async function AdminExercisesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const dbUser = await UserService.syncUser(user);
  if (dbUser.role?.name !== "ADMIN") {
    redirect("/dashboard");
  }

  const exercises = await getExercises();

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors">
            &larr; Volver al Dashboard
          </Link>
        </div>
        <div>
          <h1 className="text-3xl font-bold">Gestión de Ejercicios</h1>
          <p className="text-zinc-400 mt-2">Agrega o desactiva ejercicios del catálogo.</p>
        </div>
        <ExercisesClient initialExercises={exercises} />
      </div>
    </div>
  );
}
