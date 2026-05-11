"use client";

import { useState } from "react";
import { createCity, updateCity, toggleCityStatus } from "@/actions/city.actions";

export function CitiesView({ initialCities }: { initialCities: any[] }) {
  const [cities, setCities] = useState(initialCities);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<any | null>(null);
  const [formData, setFormData] = useState({ name: "", isActive: true });
  const [loading, setLoading] = useState(false);

  const handleOpenModal = (city?: any) => {
    if (city) {
      setEditingCity(city);
      setFormData({ name: city.name, isActive: city.isActive });
    } else {
      setEditingCity(null);
      setFormData({ name: "", isActive: true });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let res;
    if (editingCity) {
      res = await updateCity(editingCity.id, formData);
    } else {
      res = await createCity(formData);
    }
    
    if (res.success && res.data) {
      if (editingCity) {
        setCities(cities.map(c => c.id === res.data.id ? res.data : c));
      } else {
        setCities([...cities, res.data]);
      }
      setIsModalOpen(false);
    } else {
      alert(res.error || "Error al guardar");
    }
    setLoading(false);
  };

  const handleToggleStatus = async (id: string) => {
    const res = await toggleCityStatus(id);
    if (res.success && res.data) {
      setCities(cities.map(c => c.id === id ? res.data : c));
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
          + Nueva Ciudad
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md">
        <table className="w-full text-left text-sm text-white">
          <thead className="bg-white/5 text-white/50 text-xs uppercase border-b border-white/10">
            <tr>
              <th className="px-6 py-4 font-medium">Nombre</th>
              <th className="px-6 py-4 font-medium">Estado</th>
              <th className="px-6 py-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {cities.map((city) => (
              <tr key={city.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-medium">{city.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${city.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {city.isActive ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button onClick={() => handleOpenModal(city)} className="text-white/70 hover:text-white transition">Editar</button>
                  <button onClick={() => handleToggleStatus(city.id)} className={`${city.isActive ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'} transition`}>
                    {city.isActive ? "Desactivar" : "Activar"}
                  </button>
                </td>
              </tr>
            ))}
            {cities.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-white/50">
                  No hay ciudades registradas.
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
                {editingCity ? "Editar Ciudad" : "Nueva Ciudad"}
              </h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Nombre de la Ciudad</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                    placeholder="Ej. Ciudad de México"
                  />
                </div>
                {!editingCity && (
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
                    disabled={loading}
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
