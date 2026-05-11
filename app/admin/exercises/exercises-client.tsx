"use client";

import { useState } from "react";
import { createExercise, updateExerciseStatus } from "@/actions/exercise.actions";
import { useRouter } from "next/navigation";

type Exercise = {
  id: string;
  name: string;
  isActive: boolean;
};

export function ExercisesClient({ initialExercises }: { initialExercises: Exercise[] }) {
  const [exercises, setExercises] = useState(initialExercises);
  const [newExercise, setNewExercise] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExercise.trim()) return;
    setLoading(true);
    const res = await createExercise(newExercise.trim());
    if (res.success) {
      setNewExercise("");
      window.location.reload(); 
    } else {
      alert(res.error);
    }
    setLoading(false);
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const res = await updateExerciseStatus(id, !currentStatus);
    if (res.success) {
      setExercises(exercises.map(ex => ex.id === id ? { ...ex, isActive: !currentStatus } : ex));
      router.refresh();
    } else {
      alert(res.error);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={newExercise}
          onChange={(e) => setNewExercise(e.target.value)}
          placeholder="Nombre del nuevo ejercicio"
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-[#c22524]"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-[#c22524] text-white px-8 py-4 rounded-xl font-bold hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Agregando..." : "Agregar"}
        </button>
      </form>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="p-4 text-zinc-400 font-medium text-sm">Ejercicio</th>
                <th className="p-4 text-zinc-400 font-medium text-sm w-32 text-center">Estado</th>
                <th className="p-4 text-zinc-400 font-medium text-sm w-32 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {exercises.map((ex) => (
                <tr key={ex.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="p-4 font-medium capitalize text-white">{ex.name}</td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${ex.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {ex.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleToggleStatus(ex.id, ex.isActive)}
                      className="text-sm font-medium text-zinc-400 hover:text-white transition-colors underline underline-offset-4"
                    >
                      {ex.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {exercises.length === 0 && (
          <div className="p-8 text-center text-zinc-500">
            No hay ejercicios registrados. Agrega uno nuevo para comenzar.
          </div>
        )}
      </div>
    </div>
  );
}
