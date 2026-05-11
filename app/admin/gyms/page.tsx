import { getGyms } from "@/actions/gym.actions";
import { getCities } from "@/actions/city.actions";
import { GymsView } from "@/components/features/admin/GymsView";
import { UserService } from "@/lib/services/user.service";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const metadata = {
  title: 'Administración de Gimnasios | SpartanFit',
}

export default async function AdminGymsPage() {
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

  const [{ data: initialGyms }, { data: activeCities }] = await Promise.all([
    getGyms(true), // Traer inactivos también
    getCities(false) // Solo ciudades activas para la creación/edición
  ]);

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8 flex justify-between items-end border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Administración de Gimnasios</h1>
            <p className="text-white/50 mt-2 text-sm">Gestiona las sucursales y ubicaciones de entrenamiento.</p>
          </div>
        </div>
        
        <GymsView initialGyms={initialGyms || []} activeCities={activeCities || []} />
      </div>
    </div>
  );
}
