"use client";

import { useState } from "react";
import { updateUserAsAdmin } from "@/actions/admin.actions";
import { GymMultiSelect } from "../users/GymMultiSelect";

interface Props {
  user: any;
  roles: any[];
  locations: any[];
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminEditUserModal({ user, roles, locations, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    age: user.age || "",
    weight: user.weight || "",
    height: user.height || "",
    activityIndex: user.activityIndex || "",
    roleId: user.roleId || "",
    gymIds: user.userGyms?.map((ug: any) => ug.gymLocation.id) || [],
    status: user.status || "ACTIVE",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUserAsAdmin(user.id, {
        age: formData.age ? Number(formData.age) : null,
        weight: formData.weight ? Number(formData.weight) : null,
        height: formData.height ? Number(formData.height) : null,
        activityIndex: formData.activityIndex ? Number(formData.activityIndex) : null,
        roleId: formData.roleId || null,
        gymIds: formData.gymIds,
        status: formData.status as any,
      });
      onSuccess();
    } catch (error) {
      console.error(error);
      alert("Hubo un error al guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
          <div>
            <h2 className="text-xl font-bold text-white">Editar Perfil</h2>
            <p className="text-sm text-white/50 mt-1">Modificando a {user.name}</p>
          </div>
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <form id="edit-user-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Read-only Identity Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/40 mb-2">Nombre</label>
                <input 
                  type="text" 
                  value={user.name} 
                  disabled 
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-white/50 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/40 mb-2">Correo</label>
                <input 
                  type="text" 
                  value={user.email} 
                  disabled 
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 text-white/50 cursor-not-allowed"
                />
              </div>
            </div>

            <hr className="border-white/5" />

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Edad</label>
                <input 
                  type="number" 
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Peso (kg)</label>
                <input 
                  type="number" step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                />
              </div>
            </div>

            <hr className="border-white/5" />

            {/* Admin Controls */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Asignar Rol</label>
                <select 
                  value={formData.roleId}
                  onChange={(e) => setFormData({...formData, roleId: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all appearance-none"
                >
                  <option value="" className="bg-[#111]">Sin Rol (Usuario Base)</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id} className="bg-[#111]">{r.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Estado de Cuenta</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className={`w-full border rounded-xl px-4 py-2.5 font-bold focus:outline-none focus:ring-2 focus:ring-white/20 transition-all appearance-none ${
                    formData.status === 'SUSPENDED' 
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}
                >
                  <option value="ACTIVE" className="bg-[#111] text-emerald-400">Activo (Acceso Permitido)</option>
                  <option value="SUSPENDED" className="bg-[#111] text-rose-400">Suspendido (Acceso Bloqueado)</option>
                </select>
              </div>
            </div>

            <hr className="border-white/5" />

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Gimnasios a los que asiste</label>
              <GymMultiSelect 
                gyms={locations} 
                initialSelectedIds={formData.gymIds} 
                onChange={(ids) => setFormData({...formData, gymIds: ids})} 
              />
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-black/20">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            form="edit-user-form"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-black/20 border-t-black rounded-full"></div>
                Guardando...
              </>
            ) : "Guardar Cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}
