"use client";

interface Props {
  users: any[];
  totalCount: number;
  page: number;
  setPage: (p: number) => void;
  isLoading: boolean;
  onEdit: (u: any) => void;
}

export function UsersDataGrid({ users, totalCount, page, setPage, isLoading, onEdit }: Props) {
  const pageSize = 10;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="bg-[#111] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-white/80">
          <thead className="bg-white/5 text-white/50 uppercase text-[10px] tracking-wider font-bold">
            <tr>
              <th className="px-6 py-4">Usuario</th>
              <th className="px-6 py-4">Rol</th>
              <th className="px-6 py-4">Edad</th>
              <th className="px-6 py-4">Peso</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-white/40">
                  <div className="inline-block animate-spin w-6 h-6 border-2 border-white/20 border-t-white rounded-full mb-3"></div>
                  <p>Cargando datos de usuarios...</p>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-white/40">
                  No se encontraron usuarios que coincidan con los filtros.
                </td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white">{user.name}</div>
                    <div className="text-white/40 text-xs mt-0.5">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {user.role?.name || "Sin Rol"}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-white/70">{user.age ? `${user.age} años` : "-"}</td>
                  <td className="px-6 py-4 font-medium text-white/70">{user.weight ? `${user.weight} kg` : "-"}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      user.status === 'ACTIVE' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {user.status === 'ACTIVE' ? 'Activo' : 'Suspendido'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onEdit(user)}
                      className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium text-xs transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between bg-black/20">
        <span className="text-sm text-white/50 font-medium">
          Mostrando <span className="text-white">{totalCount > 0 ? (page - 1) * pageSize + 1 : 0}</span> a <span className="text-white">{Math.min(page * pageSize, totalCount)}</span> de <span className="text-white">{totalCount}</span>
        </span>
        <div className="flex gap-2">
          <button 
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 rounded-lg bg-white/5 text-white text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
          >
            Anterior
          </button>
          <button 
            disabled={page >= totalPages || totalCount === 0}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 rounded-lg bg-white/5 text-white text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
