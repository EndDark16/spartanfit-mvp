import { AdminUsersView } from "@/components/features/admin/AdminUsersView";
import { UserService } from "@/lib/services/user.service";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const metadata = {
  title: 'Panel de Administración | SpartanFit',
}

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/?error=unauthorized");
  }

  // Security Check: Verify Admin Role
  const dbUser = await UserService.getUserProfile(user.id);
  if (dbUser?.role?.name !== "ADMIN") {
    redirect("/dashboard?error=admin_required");
  }

  const roles = await UserService.getRoles();
  const locations = await UserService.getGymLocations();

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8 border-b border-white/10 pb-6">
          <h1 className="text-3xl font-black text-white tracking-tight">Administración de Usuarios</h1>
          <p className="text-white/50 mt-2 text-sm">Gestiona perfiles, asigna roles y controla el acceso a la plataforma.</p>
        </div>
        
        <AdminUsersView roles={roles} locations={locations} />
      </div>
    </div>
  );
}
