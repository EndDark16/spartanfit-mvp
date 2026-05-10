"use client";

import { AdminUserFilters } from "@/actions/admin.actions";

interface Props {
  filters: AdminUserFilters;
  setFilters: (filters: AdminUserFilters) => void;
  roles: any[];
}

export function UserFilters({ filters, setFilters, roles }: Props) {
  return (
    <div className="bg-[#111] p-6 rounded-2xl border border-white/10 space-y-6">
      <h2 className="text-xl font-bold text-white tracking-tight">Filtros de Búsqueda</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <label className="block text-sm font-medium text-white/60 mb-2">Buscar por nombre</label>
          <input 
            type="text" 
            placeholder="Ej. Juan Pérez"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
            value={filters.searchQuery || ""}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white/60 mb-2">Rol</label>
          <select 
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all appearance-none"
            value={filters.roleId || "ALL"}
            onChange={(e) => setFilters({ ...filters, roleId: e.target.value })}
          >
            <option value="ALL" className="bg-[#111]">Todos los roles</option>
            {roles.map(r => (
              <option key={r.id} value={r.id} className="bg-[#111]">{r.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/60 mb-2 flex justify-between">
            <span>Edad</span>
            <span className="text-white font-semibold">{filters.ageRange?.min} - {filters.ageRange?.max}</span>
          </label>
          <div className="flex items-center gap-4">
            <input 
              type="range" min="0" max="150" 
              value={filters.ageRange?.min || 0}
              onChange={(e) => setFilters({ ...filters, ageRange: { ...filters.ageRange!, min: Number(e.target.value) }})}
              className="w-1/2 accent-white"
            />
            <input 
              type="range" min="0" max="150" 
              value={filters.ageRange?.max || 150}
              onChange={(e) => setFilters({ ...filters, ageRange: { ...filters.ageRange!, max: Number(e.target.value) }})}
              className="w-1/2 accent-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/60 mb-2 flex justify-between">
            <span>Peso (kg)</span>
            <span className="text-white font-semibold">{filters.weightRange?.min} - {filters.weightRange?.max}</span>
          </label>
          <div className="flex items-center gap-4">
            <input 
              type="range" min="0" max="200" 
              value={filters.weightRange?.min || 0}
              onChange={(e) => setFilters({ ...filters, weightRange: { ...filters.weightRange!, min: Number(e.target.value) }})}
              className="w-1/2 accent-white"
            />
            <input 
              type="range" min="0" max="200" 
              value={filters.weightRange?.max || 200}
              onChange={(e) => setFilters({ ...filters, weightRange: { ...filters.weightRange!, max: Number(e.target.value) }})}
              className="w-1/2 accent-white"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <input 
          type="checkbox" 
          id="includeNulls"
          checked={filters.includeNulls}
          onChange={(e) => setFilters({ ...filters, includeNulls: e.target.checked })}
          className="w-5 h-5 rounded border-white/20 bg-white/5 text-white focus:ring-white/20 focus:ring-offset-[#111] accent-white"
        />
        <label htmlFor="includeNulls" className="text-sm font-medium text-white/80 select-none cursor-pointer">
          Incluir usuarios sin edad o peso especificado
        </label>
      </div>
    </div>
  );
}
