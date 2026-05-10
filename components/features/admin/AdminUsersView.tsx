"use client";

import { useState, useEffect } from "react";
import { UserFilters } from "./UserFilters";
import { UsersDataGrid } from "./UsersDataGrid";
import { AdminEditUserModal } from "./AdminEditUserModal";
import { getFilteredUsers, AdminUserFilters } from "@/actions/admin.actions";

export function AdminUsersView({ roles, locations }: { roles: any[], locations: any[] }) {
  const [filters, setFilters] = useState<AdminUserFilters>({
    searchQuery: "",
    roleId: "ALL",
    ageRange: { min: 0, max: 150 },
    weightRange: { min: 0, max: 200 },
    includeNulls: true,
  });
  
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [editingUser, setEditingUser] = useState<any | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { users: fetchedUsers, totalCount: count } = await getFilteredUsers(filters, page, 10);
      setUsers(fetchedUsers);
      setTotalCount(count);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Simple debounce to avoid spamming the server when sliders are dragged
    const timeoutId = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [filters, page]);

  return (
    <div className="space-y-6">
      <UserFilters 
        filters={filters} 
        setFilters={(f) => { setFilters(f); setPage(1); }} 
        roles={roles} 
      />
      
      <UsersDataGrid 
        users={users} 
        totalCount={totalCount} 
        page={page} 
        setPage={setPage} 
        isLoading={isLoading}
        onEdit={(u) => setEditingUser(u)}
      />
      
      {editingUser && (
        <AdminEditUserModal 
          user={editingUser} 
          roles={roles}
          locations={locations}
          onClose={() => setEditingUser(null)} 
          onSuccess={() => {
            setEditingUser(null);
            fetchUsers();
          }} 
        />
      )}
    </div>
  );
}
