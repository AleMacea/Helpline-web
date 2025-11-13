import React from 'react';
import Sidebar from './components/Sidebar';
import UserSidebar from './components/UserSidebar';
import TopBar from '@/components/TopBar';
import { MobileMenu } from '@/components/MobileMenu';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket, BookOpen, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Home() {
  const { user, isManager } = useAuth();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <MobileMenu isManager={isManager} />
      {isManager ? <Sidebar /> : <UserSidebar />}
      <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
        <TopBar />
        <div className="flex-1 p-4 md:p-6">
          <div className="bg-white border border-[#D9D9D9] rounded-lg shadow-sm">
            <div className="bg-[#D9D9D9] text-slate-900 px-4 md:px-6 py-3 rounded-t-lg">
              <h1 className="text-2xl md:text-3xl font-bold">Bem-vindo, {user?.name}!</h1>
              <p className="text-sm text-slate-700">Escolha uma opção para começar:</p>
            </div>
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isManager ? (
                  <>
                    <Link to="/tickets">
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Ticket className="text-blue-600" />
                            Chamados
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600">Visualize e gerencie todos os chamados do sistema.</p>
                        </CardContent>
                      </Card>
                    </Link>

                    <Link to="/knowledge-base">
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <BookOpen className="text-green-600" />
                            Base de Conhecimento
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600">Crie e gerencie artigos da base de conhecimento.</p>
                        </CardContent>
                      </Card>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/chat">
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="text-blue-600" />
                            Chat Bot
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600">Converse com nosso assistente virtual para resolver problemas.</p>
                        </CardContent>
                      </Card>
                    </Link>

                    <Link to="/artigos">
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <BookOpen className="text-green-600" />
                            Artigos úteis
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600">Acesse artigos úteis para resolver problemas comuns.</p>
                        </CardContent>
                      </Card>
                    </Link>

                    <Link to="/tickets">
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Ticket className="text-purple-600" />
                            Meus Chamados
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-600">Visualize o status dos seus chamados.</p>
                        </CardContent>
                      </Card>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

