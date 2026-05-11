import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { UserService } from "@/lib/services/user.service";
import Link from "next/link";
import { getActiveExercises } from "@/actions/exercise.actions";
import { getUserWorkoutProgress } from "@/actions/workout.actions";
import { AddWorkoutModal } from "./components/add-workout-modal";
import { WorkoutProgressCharts } from "./components/workout-progress-charts";

export const metadata = {
  title: "SpartanFit | Dashboard",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Refactored: Using the Service Layer instead of direct DB access
  // Sync user first to ensure they exist in Prisma
  const dbUser = await UserService.syncUser(user);

  // Onboarding flow: force complete profile
  if (dbUser.goal === "pending" || !dbUser.roleId) {
    redirect("/profile");
  }

  const exercises = await getActiveExercises();
  const progressData = await getUserWorkoutProgress(dbUser.id);

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex justify-between items-center pb-6 border-b border-zinc-800">
          <h1 className="text-3xl font-bold">
            Bienvenido, {dbUser.name || user.email}
          </h1>
          <div className="flex items-center gap-4">
            <Link
              href="/profile"
              className="text-zinc-400 hover:text-white transition-colors text-sm font-medium"
            >
              Mi Perfil
            </Link>
            {dbUser.role?.name == "ADMIN" && (
              <>
                <Link
                  href="/admin/users"
                  className="text-zinc-400 hover:text-white transition-colors text-sm font-medium"
                >
                  Usuarios
                </Link>
                <Link
                  href="/admin/gyms"
                  className="text-zinc-400 hover:text-white transition-colors text-sm font-medium"
                >
                  Gimnasios
                </Link>
                <Link
                  href="/admin/cities"
                  className="text-zinc-400 hover:text-white transition-colors text-sm font-medium"
                >
                  Ciudades
                </Link>
                <Link
                  href="/admin/exercises"
                  className="text-zinc-400 hover:text-white transition-colors text-sm font-medium"
                >
                  Ejercicios
                </Link>
              </>
            )}
            <form
              action={async () => {
                "use server";
                const sb = await createClient();
                await sb.auth.signOut();
                redirect("/");
              }}
            >
              <button className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded text-sm font-medium transition-colors">
                Cerrar sesión
              </button>
            </form>
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-zinc-400 text-sm font-medium mb-1">
              Objetivo Actual
            </h3>
            <p className="text-xl font-bold capitalize">{dbUser.goal}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-zinc-400 text-sm font-medium mb-1">
              Sede{dbUser.userGyms && dbUser.userGyms.length > 1 ? "s" : ""}
            </h3>
            <p className="text-xl font-bold truncate">
              {dbUser.userGyms && dbUser.userGyms.length > 0
                ? dbUser.userGyms
                    .map((ug: any) => ug.gymLocation?.name)
                    .filter(Boolean)
                    .join(", ")
                : "No especificada"}
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-zinc-400 text-sm font-medium mb-1">Coach</h3>
            <p className="text-xl font-bold text-[#c22524]">Spartanfit IA</p>
          </div>
        </div>

        <div className="mt-12">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold">Progreso de Entrenamiento</h2>
            <AddWorkoutModal userId={dbUser.id} exercises={exercises} />
          </div>
          <WorkoutProgressCharts chartsData={progressData} />
        </div>
      </div>
    </div>
  );
}
