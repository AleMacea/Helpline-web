import { useState } from 'react';
import { Menu, X, Home, Ticket, BookOpen, MessageSquare, FileText, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';

export const MobileMenu = ({ isManager = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsOpen(false);
  };

  const managerItems = [
    { name: 'Início', icon: <Home size={20} />, path: '/home' },
    { name: 'Base de Conhecimento', icon: <BookOpen size={20} />, path: '/knowledge-base' },
    { name: 'Lista de Chamados', icon: <Ticket size={20} />, path: '/tickets' },
  ];

  const userItems = [
    { name: 'Início', icon: <Home size={20} />, path: '/home' },
    { name: 'Chat', icon: <MessageSquare size={20} />, path: '/chat' },
    { name: 'Artigos úteis', icon: <FileText size={20} />, path: '/artigos' },
    { name: 'Meus Chamados', icon: <Ticket size={20} />, path: '/tickets' },
  ];

  const items = isManager ? managerItems : userItems;

  return (
    <>
      {/* Botão do menu móvel */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white shadow-lg"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Menu móvel overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-64 h-full bg-[rgba(33,0,93,255)] text-white shadow-lg flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Logo */}
            <div className="flex items-center justify-center p-4 border-b border-blue-800 flex-shrink-0">
              <img src="/images/logo.png" alt="HelpLine Logo" className="w-20 h-auto" />
            </div>

            {/* Informações do usuário */}
            {user && (
              <div className="px-4 py-3 border-b border-blue-800 flex-shrink-0">
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-blue-200">{isManager ? 'Gerente' : 'Usuário'}</p>
              </div>
            )}

            {/* Navegação */}
            <nav className="p-4 space-y-2 flex-grow overflow-y-auto">
              {items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => {
                      setTimeout(() => setIsOpen(false), 100);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive ? 'bg-blue-700 text-white' : 'text-white hover:bg-blue-800'
                    }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Botão de sair */}
            <div className="p-4 border-t border-blue-800 flex-shrink-0">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-white hover:bg-red-600 transition-colors"
                onClick={handleLogout}
              >
                <LogOut size={20} />
                <span>Sair</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileMenu;

