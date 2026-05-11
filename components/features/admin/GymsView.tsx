"use client";

import { useState } from "react";
import { createGym, updateGym, toggleGymStatus } from "@/actions/gym.actions";

export function GymsView({ initialGyms, activeCities }: { initialGyms: any[], activeCities: any[] }) {
  const [gyms, setGyms] = useState(initialGyms);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGym, setEditingGym] = useState<any | null>(null);
  const [formData, setFormData] = useState({ name: "", address: "", cityId: "", isActive: true });
  const [loading, setLoading] = useState(false);

  const handleOpenModal = (gym?: any) => {
    if (gym) {
      setEditingGym(gym);
      setFormData({ name: gym.name, address: gym.address || "", cityId: gym.cityId, isActive: gym.isActive });
    } else {
      setEditingGym(null);
      // Seleccionar la primera ciudad por defecto si existe
      setFormData({ name: "", address: "", cityId: activeCities.length > 0 ? activeCities[0].id : "", isActive: true });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cityId) {
      alert("Debes seleccionar una ciudad");
      return;
    }

    setLoading(true);
    let res;
    if (editingGym) {
      res = await updateGym(editingGym.id, formData);
    } else {
      res = await createGym(formData);
    }
    
    if (res.success && res.data) {
      // Como devolvemos el gym, necesitamos actualizar el array. 
      // Idealmente recargaríamos de la BD o armamos el objeto con el `city` incrustado.
      // Refrescamos la vista simulando el objeto para UI inmediata:
      const savedGym = {
        ...res.data,
        city: activeCities.find(c => c.id === formData.cityId) || editingGym?.city
      };
      
      if (editingGym) {
        setGyms(gyms.map(g => g.id === savedGym.id ? savedGym : g));
      } else {
        setGyms([...gyms, savedGym]);
      }
      setIsModalOpen(false);
    } else {
      alert(res.error || "Error al guardar");
    }
    setLoading(false);
  };

  const handleToggleStatus = async (id: string) => {
    const res = await toggleGymStatus(id);
    if (res.success && res.data) {
      setGyms(gyms.map(g => g.id === id ? { ...g, isActive: res.data.isActive } : g));
    } else {
      alert(res.error || "Error al cambiar estado");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={() => handleOpenModal()}
          className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-white/90 transition-colors"
        >
          + Nuevo Gimnasio
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md">
        <table className="w-full text-left text-sm text-white">
          <thead className="bg-white/5 text-white/50 text-xs uppercase border-b border-white/10">
            <tr>
              <th className="px-6 py-4 font-medium">Nombre</th>
              <th className="px-6 py-4 font-medium">Ciudad</th>
              <th className="px-6 py-4 font-medium">Dirección</th>
              <th className="px-6 py-4 font-medium">Estado</th>
              <th className="px-6 py-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {gyms.map((gym) => (
              <tr key={gym.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium">{gym.name}</td>
                <td className="px-6 py-4 text-white/70">{gym.city?.name || "N/A"}</td>
                <td className="px-6 py-4 text-white/70">{gym.address || "-"}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${gym.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {gym.isActive ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button onClick={() => handleOpenModal(gym)} className="text-white/70 hover:text-white transition">Editar</button>
                  <button onClick={() => handleToggleStatus(gym.id)} className={`${gym.isActive ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'} transition`}>
                    {gym.isActive ? "Desactivar" : "Activar"}
                  </button>
                </td>
              </tr>
            ))}
            {gyms.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-white/50">
                  No hay gimnasios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                {editingGym ? "Editar Gimnasio" : "Nuevo Gimnasio"}
              </h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                    placeholder="Ej. Sede Central"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Ciudad</label>
                  <select
                    required
                    value={formData.cityId}
                    onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all [&>option]:bg-[#111]"
                  >
                    {activeCities.length === 0 && <option value="" disabled>No hay ciudades activas</option>}
                    {activeCities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Dirección (Opcional)</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                    placeholder="Calle Principal 123"
                  />
                </div>
                {!editingGym && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded border-white/20 bg-white/5 text-white focus:ring-0 focus:ring-offset-0"
                    />
                    <label htmlFor="isActive" className="text-sm text-white/70">Activo desde su creación</label>
                  </div>
                )}
                <div className="flex justify-end space-x-3 mt-8">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading || activeCities.length === 0}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-black hover:bg-white/90 disabled:opacity-50 transition-colors"
                  >
                    {loading ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
