import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { UserService } from "@/lib/services/user.service";
import Link from "next/link";

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
              <Link
                href="/admin/users"
                className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                Usuarios
              </Link>
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
            <h3 className="text-zinc-400 text-sm font-medium mb-1">Sede</h3>
            <p className="text-xl font-bold">
              {dbUser.gymLocation?.name || "No especificada"}
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-zinc-400 text-sm font-medium mb-1">Coach</h3>
            <p className="text-xl font-bold text-[#c22524]">Spartanfit IA</p>
          </div>
        </div>
      </div>
    </div>
  );
}
