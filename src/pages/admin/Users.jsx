import React, { useEffect, useState } from 'react';
import TopBar from '@/components/TopBar';
import { MobileMenu } from '@/components/MobileMenu';
import UserSidebar from '@/pages/components/UserSidebar';
import { Input } from '@/components/ui/input';
import { usersAPI } from '@/services/api';

export default function AdminUsers() {
  const [origin, setOrigin] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await usersAPI.getAll(origin ? { origin } : undefined);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin]);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <MobileMenu isManager={true} />
      <UserSidebar />
      <div className="flex-1 flex flex-col bg-gray-50">
        <TopBar />
        <div className="flex-1 p-4 md:p-6">
          <div className="bg-white border border-border rounded-lg shadow-sm">
            <div className="bg-primary text-primary-foreground px-4 md:px-6 py-3 rounded-t-lg">
              <h1 className="text-2xl font-bold">Admin • Users</h1>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              <div className="flex gap-2 items-center">
                <label className="text-sm text-muted-foreground">Filter origin</label>
                <Input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="ex: web|mobile|admin" />
              </div>
              <div className="text-sm text-muted-foreground">{loading ? 'Loading…' : `${items.length} users`}</div>
              <ul className="divide-y">
                {items.map((u) => (
                  <li key={u.id || u._id} className="py-2 flex justify-between">
                    <span className="font-medium">{u.name || u.fullName || u.email}</span>
                    <span className="text-xs text-muted-foreground">{u.origin || '-'}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

