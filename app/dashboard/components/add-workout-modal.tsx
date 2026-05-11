"use client";

import { useState } from "react";
import { addWorkoutLog } from "@/actions/workout.actions";
import { useRouter } from "next/navigation";

export function AddWorkoutModal({ 
  userId, 
  exercises 
}: { 
  userId: string; 
  exercises: { id: string; name: string }[] 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Create a string that input[type="datetime-local"] understands
  const now = new Date();
  const tzOffset = now.getTimezoneOffset() * 60000; // offset in milliseconds
  const localISOTime = (new Date(Date.now() - tzOffset)).toISOString().slice(0, 16);

  const [formData, setFormData] = useState({
    exerciseId: "",
    sets: 1,
    reps: 1,
    weightLoad: 0,
    recordedAt: localISOTime,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (!formData.exerciseId) {
        alert("Por favor selecciona un ejercicio.");
        setLoading(false);
        return;
    }

    const res = await addWorkoutLog({
      userId,
      exerciseId: formData.exerciseId,
      sets: Number(formData.sets),
      reps: Number(formData.reps),
      weightLoad: Number(formData.weightLoad),
      recordedAt: new Date(formData.recordedAt),
    });

    setLoading(false);
    if (res.success) {
      setIsOpen(false);
      setFormData({
        ...formData,
        exerciseId: "",
        sets: 1,
        reps: 1,
        weightLoad: 0,
        recordedAt: localISOTime,
      });
      router.refresh();
    } else {
      alert(res.error);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full sm:w-auto px-6 py-3 bg-[#c22524] text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
      >
        + Agregar Entrenamiento
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-white mb-4">Registrar Entrenamiento</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-zinc-400 text-sm mb-1">Fecha y Hora</label>
                <input 
                  type="datetime-local" 
                  value={formData.recordedAt}
                  onChange={(e) => setFormData({...formData, recordedAt: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-400 text-sm mb-1">Ejercicio</label>
                <select 
                  value={formData.exerciseId}
                  onChange={(e) => setFormData({...formData, exerciseId: e.target.value})}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white"
                  required
                >
                  <option value="" disabled>Selecciona un ejercicio</option>
                  {exercises.map((ex) => (
                    <option key={ex.id} value={ex.id}>{ex.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-zinc-400 text-sm mb-1">Sets</label>
                  <input 
                    type="number" 
                    min="1"
                    value={formData.sets}
                    onChange={(e) => setFormData({...formData, sets: Number(e.target.value)})}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-1">Reps</label>
                  <input 
                    type="number" 
                    min="1"
                    value={formData.reps}
                    onChange={(e) => setFormData({...formData, reps: Number(e.target.value)})}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 text-sm mb-1">Peso (kg)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="0"
                    value={formData.weightLoad}
                    onChange={(e) => setFormData({...formData, weightLoad: Number(e.target.value)})}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-zinc-800 text-white rounded-xl p-3 font-bold hover:bg-zinc-700"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#c22524] text-white rounded-xl p-3 font-bold hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
