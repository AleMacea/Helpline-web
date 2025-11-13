import React from 'react';
import TopBar from '@/components/TopBar';
import { MobileMenu } from '@/components/MobileMenu';
import UserSidebar from '@/pages/components/UserSidebar';

export default function AdminReports() {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <MobileMenu isManager={true} />
      <UserSidebar />
      <div className="flex-1 flex flex-col bg-gray-50">
        <TopBar />
        <div className="flex-1 p-4 md:p-6">
          <div className="bg-white border border-border rounded-lg shadow-sm">
            <div className="bg-primary text-primary-foreground px-4 md:px-6 py-3 rounded-t-lg">
              <h1 className="text-2xl font-bold">Admin • Reports</h1>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              <p className="text-muted-foreground">Resumo e métricas centralizadas (origem, categorias, SLA, CSAT).</p>
              <p className="text-sm text-muted-foreground">Em breve: gráficos e filtros avançados.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

