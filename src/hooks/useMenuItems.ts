import { useState, useEffect } from 'react';
import type { MenuItem } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

export function useMenuItems() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchMenuItems() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/api/menu-items`);

        if (!res.ok) {
          throw new Error(`Failed to fetch menu items (${res.status})`);
        }

        const data: MenuItem[] = await res.json();

        if (!cancelled) {
          setMenuItems(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load menu');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchMenuItems();

    return () => {
      cancelled = true;
    };
  }, []);

  return { menuItems, loading, error } as const;
}
