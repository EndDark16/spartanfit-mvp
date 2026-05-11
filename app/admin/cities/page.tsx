import { getCities } from "@/actions/city.actions";
import { CitiesView } from "@/components/features/admin/CitiesView";
import { UserService } from "@/lib/services/user.service";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const metadata = {
  title: 'Administración de Ciudades | SpartanFit',
}

export default async function AdminCitiesPage() {
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

  const { data: initialCities } = await getCities(true);

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8 flex justify-between items-end border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Administración de Ciudades</h1>
            <p className="text-white/50 mt-2 text-sm">Gestiona el catálogo de ciudades donde existen gimnasios.</p>
          </div>
        </div>
        
        <CitiesView initialCities={initialCities || []} />
      </div>
    </div>
  );
}
