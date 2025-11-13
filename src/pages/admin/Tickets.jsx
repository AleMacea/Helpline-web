import React, { useEffect, useState } from 'react';
import TopBar from '@/components/TopBar';
import { MobileMenu } from '@/components/MobileMenu';
import UserSidebar from '@/pages/components/UserSidebar';
import { Input } from '@/components/ui/input';
import { ticketsAPI } from '@/services/api';

export default function AdminTickets() {
  const [origin, setOrigin] = useState('');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await ticketsAPI.getAll(origin ? { origin } : undefined);
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
              <h1 className="text-2xl font-bold">Admin • Tickets</h1>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              <div className="flex gap-2 items-center">
                <label className="text-sm text-muted-foreground">Filter origin</label>
                <Input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="ex: web|mobile|admin|chatbot" />
              </div>
              <div className="text-sm text-muted-foreground">{loading ? 'Loading…' : `${items.length} tickets`}</div>
              <ul className="divide-y">
                {items.map((t) => (
                  <li key={t.id || t._id || t.protocol} className="py-2">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-medium">{t.title || `Ticket ${t.protocol}`}</div>
                        <div className="text-xs text-muted-foreground">{t.category || '-'} • {t.priority || '-'}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">{t.origin || '-'}</div>
                    </div>
                    {t.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t.description}</p>
                    )}
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

