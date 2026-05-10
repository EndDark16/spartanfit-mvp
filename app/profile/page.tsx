import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { UserService } from "@/lib/services/user.service";
import { ProfileForm } from "@/components/features/profile/ProfileForm";
import Link from "next/link";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const dbUser = await UserService.syncUser(user);
  const gyms = await UserService.getGymLocations();
  const roles = await UserService.getRoles();



  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex justify-between items-center pb-6 border-b border-zinc-800">
          <h1 className="text-3xl font-bold">
            {dbUser.goal === 'pending' || !dbUser.roleId ? "Completa tu Perfil" : "Configuración de Perfil"}
          </h1>
          {dbUser.goal !== 'pending' && dbUser.roleId && (
            <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors">
              Volver al Dashboard
            </Link>
          )}
        </header>

        <ProfileForm user={dbUser} gyms={gyms} roles={roles} />
      </div>
    </div>
  );
}
