import { useAuth } from '@/context/AuthContext';

export default function TopBar() {
  const { user } = useAuth();
  return (
    <div className="mt-0 bg-white border-b shadow-sm px-6 py-7 flex justify-end">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <span className="hidden sm:inline text-slate-500">Olá,</span>
        <span className="font-semibold text-slate-800">{user?.name ?? 'Usuário'}</span>
      </div>
    </div>
  );
}

