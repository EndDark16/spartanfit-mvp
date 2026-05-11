"use client";

import { useState } from "react";

interface Props {
  gyms: { id: string; name: string }[];
  initialSelectedIds: string[];
  onChange: (selectedIds: string[]) => void;
}

export function GymMultiSelect({ gyms, initialSelectedIds, onChange }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [isOpen, setIsOpen] = useState(false);

  const toggleSelection = (id: string) => {
    const newSelected = selectedIds.includes(id)
      ? selectedIds.filter(selectedId => selectedId !== id)
      : [...selectedIds, id];
    
    setSelectedIds(newSelected);
    onChange(newSelected);
  };

  return (
    <div className="relative">
      <div 
        className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-4 py-3 text-white cursor-pointer hover:border-zinc-600 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedIds.length === 0 ? (
          <span className="text-zinc-400">Selecciona uno o más gimnasios...</span>
        ) : (
          <span className="truncate block">
            {selectedIds.length} gimnasio(s) seleccionado(s)
          </span>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {gyms.length === 0 ? (
            <div className="px-4 py-3 text-zinc-400 text-sm">No hay gimnasios disponibles</div>
          ) : (
            gyms.map(gym => {
              const isSelected = selectedIds.includes(gym.id);
              return (
                <div 
                  key={gym.id}
                  className="px-4 py-2 hover:bg-zinc-700 cursor-pointer flex items-center space-x-3 transition"
                  onClick={() => toggleSelection(gym.id)}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-[#c22524] border-[#c22524]' : 'border-zinc-500'}`}>
                    {isSelected && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className="text-sm text-zinc-200">{gym.name}</span>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Inputs ocultos para FormData nativo si se usa submit tradicional */}
      {selectedIds.map(id => (
        <input key={id} type="hidden" name="gymIds" value={id} />
      ))}
    </div>
  );
}
