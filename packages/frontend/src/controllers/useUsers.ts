import { useState, useEffect, useCallback } from 'react';
import { userService, type User } from '../models/user.service';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (filters?: { role?: string; active?: boolean }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getAll(filters);
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = async (data: Partial<User> & { password: string }) => {
    const user = await userService.create(data);
    setUsers((prev) => [user, ...prev]);
    return user;
  };

  const updateUser = async (id: string, data: Partial<User>) => {
    const updated = await userService.update(id, data);
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    return updated;
  };

  const toggleUser = async (id: string) => {
    const toggled = await userService.toggleActive(id);
    setUsers((prev) => prev.map((u) => (u.id === id ? toggled : u)));
    return toggled;
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, fetchUsers, createUser, updateUser, toggleUser };
}
