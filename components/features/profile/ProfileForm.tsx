"use client";

import { useState, useTransition } from "react";
import { updateProfileAction, suspendAccountAction } from "@/actions/user.actions";
import { UserProfileResponse } from "@/lib/types/user.types";

interface Props {
  user: UserProfileResponse;
  gyms: { id: string; name: string }[];
  roles: { id: string; name: string }[];
}

export function ProfileForm({ user, gyms, roles }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      name: formData.get("name") as string,
      age: formData.get("age") ? parseInt(formData.get("age") as string) : null,
      weight: formData.get("weight") ? parseFloat(formData.get("weight") as string) : null,
      height: formData.get("height") ? parseFloat(formData.get("height") as string) : null,
      activityIndex: formData.get("activityIndex") ? parseInt(formData.get("activityIndex") as string) : null,
      goal: formData.get("goal") as string,
      gymLocationId: formData.get("gymLocationId") as string || null,
      roleId: formData.get("roleId") as string || undefined,
    };

    if (data.gymLocationId === "none") data.gymLocationId = null;

    startTransition(async () => {
      try {
        setError(null);
        await updateProfileAction(data);
        alert("Perfil actualizado correctamente");
      } catch (err: any) {
        setError(err.message || "Error al actualizar perfil");
      }
    });
  };

  const handleSuspend = () => {
    if (window.confirm("¿Estás seguro de que deseas eliminar tu cuenta? Esta acción suspenderá tu acceso de forma inmediata.")) {
      startTransition(async () => {
        try {
          await suspendAccountAction();
        } catch (err: any) {
          setError(err.message || "Error al suspender cuenta");
        }
      });
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 max-w-xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-6">Mi Perfil</h2>
      
      {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-300">Nombre</label>
          <input type="text" name="name" defaultValue={user.name || ""} required className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-4 py-3 text-white focus:outline-none focus:border-[#c22524] focus:ring-1 focus:ring-[#c22524]" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-300">Edad</label>
            <input type="number" name="age" defaultValue={user.age || ""} className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-4 py-3 text-white focus:outline-none focus:border-[#c22524] focus:ring-1 focus:ring-[#c22524]" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-300">Peso (kg)</label>
            <input type="number" step="0.1" name="weight" defaultValue={user.weight || ""} className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-4 py-3 text-white focus:outline-none focus:border-[#c22524] focus:ring-1 focus:ring-[#c22524]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-300">Altura (cm)</label>
            <input type="number" step="0.1" name="height" defaultValue={user.height || ""} className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-4 py-3 text-white focus:outline-none focus:border-[#c22524] focus:ring-1 focus:ring-[#c22524]" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-300">Índice Actividad (1-10)</label>
            <input type="number" min="1" max="10" name="activityIndex" defaultValue={user.activityIndex || ""} className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-4 py-3 text-white focus:outline-none focus:border-[#c22524] focus:ring-1 focus:ring-[#c22524]" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-300">Objetivo principal</label>
          <select name="goal" defaultValue={user.goal || "pending"} required className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-4 py-3 text-white focus:outline-none focus:border-[#c22524] focus:ring-1 focus:ring-[#c22524]">
            <option value="pending" disabled>Selecciona un objetivo...</option>
            <option value="hipertrofia">Hipertrofia</option>
            <option value="fuerza">Fuerza</option>
            <option value="perdida de peso">Pérdida de peso</option>
            <option value="mantencion">Mantención</option>
            <option value="salud general">Salud general</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-300">Gimnasio</label>
          <select name="gymLocationId" defaultValue={user.gymLocationId || "none"} className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-4 py-3 text-white focus:outline-none focus:border-[#c22524] focus:ring-1 focus:ring-[#c22524]">
            <option value="none">No entreno en un gimnasio de la red / Omitir</option>
            {gyms.map(gym => (
              <option key={gym.id} value={gym.id}>{gym.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-zinc-500">Rol asignado</label>
          {!user.roleId ? (
            <select name="roleId" required className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-4 py-3 text-white focus:outline-none focus:border-[#c22524] focus:ring-1 focus:ring-[#c22524]">
              <option value="" disabled selected>Selecciona tu rol...</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          ) : (
            <input type="text" readOnly disabled value={user.role?.name || "Sin asignar"} className="w-full bg-zinc-800/50 border border-zinc-800 rounded-md px-4 py-3 text-zinc-500 cursor-not-allowed" />
          )}
        </div>

        <button type="submit" disabled={isPending} className="w-full bg-[#c22524] hover:bg-[#a61f1e] text-white font-bold py-3 px-4 rounded-md transition-colors mt-4 disabled:opacity-50">
          {isPending ? "Guardando..." : "Guardar Perfil"}
        </button>
      </form>

      <div className="mt-12 pt-6 border-t border-zinc-800">
        <h3 className="text-xl font-semibold text-red-500 mb-2">Zona de Peligro</h3>
        <p className="text-zinc-400 text-sm mb-4">Eliminar tu cuenta suspenderá tu acceso a la plataforma.</p>
        <button type="button" onClick={handleSuspend} disabled={isPending} className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50">
          Eliminar cuenta
        </button>
      </div>
    </div>
  );
}
