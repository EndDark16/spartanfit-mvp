import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // Fetch user from DB
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { gymLocation: true }
  })

  // Fetch gyms for the select
  const gyms = await prisma.gymLocation.findMany()

  async function updateProfile(formData: FormData) {
    'use server'
    const goal = formData.get('goal') as string
    const gymLocationId = formData.get('gymLocationId') as string

    if (!goal) return

    await prisma.user.update({
      where: { id: user?.id },
      data: {
        goal,
        gymLocationId: gymLocationId === 'none' ? null : gymLocationId
      }
    })
    
    revalidatePath('/dashboard')
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex justify-between items-center pb-6 border-b border-zinc-800">
          <h1 className="text-3xl font-bold">Bienvenido, {dbUser?.name || user.email}</h1>
          <form action={async () => {
            'use server'
            const sb = await createClient()
            await sb.auth.signOut()
            redirect('/')
          }}>
            <button className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded text-sm font-medium transition-colors">
              Cerrar sesión
            </button>
          </form>
        </header>

        {dbUser?.goal === 'pending' ? (
          <div className="bg-zinc-900 border border-[#c22524] rounded-xl p-8 max-w-xl shadow-lg shadow-[#c22524]/10">
            <h2 className="text-2xl font-semibold mb-2">Completa tu Perfil</h2>
            <p className="text-zinc-400 mb-6">Para ofrecerte la mejor experiencia con tu coach de IA, necesitamos unos datos más.</p>
            
            <form action={updateProfile} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium">¿Cuál es tu objetivo principal?</label>
                <select name="goal" required className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-4 py-3 text-white focus:outline-none focus:border-[#c22524] focus:ring-1 focus:ring-[#c22524]">
                  <option value="">Selecciona un objetivo...</option>
                  <option value="hipertrofia">Hipertrofia</option>
                  <option value="fuerza">Fuerza</option>
                  <option value="perdida de peso">Pérdida de peso</option>
                  <option value="mantencion">Mantención</option>
                  <option value="salud general">Salud general</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">¿En qué gimnasio entrenas?</label>
                <select name="gymLocationId" className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-4 py-3 text-white focus:outline-none focus:border-[#c22524] focus:ring-1 focus:ring-[#c22524]">
                  <option value="none">No entreno en un gimnasio de la red / Omitir</option>
                  {gyms.map(gym => (
                    <option key={gym.id} value={gym.id}>{gym.name}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="w-full bg-[#c22524] hover:bg-[#a61f1e] text-white font-bold py-3 px-4 rounded-md transition-colors mt-4">
                Guardar Perfil
              </button>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-zinc-400 text-sm font-medium mb-1">Objetivo Actual</h3>
              <p className="text-xl font-bold capitalize">{dbUser?.goal}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-zinc-400 text-sm font-medium mb-1">Sede</h3>
              <p className="text-xl font-bold">{dbUser?.gymLocation?.name || 'No especificada'}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-zinc-400 text-sm font-medium mb-1">Coach</h3>
              <p className="text-xl font-bold text-[#c22524]">Spartanfit IA</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
