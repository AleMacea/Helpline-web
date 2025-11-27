import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Sidebar from "./components/Sidebar";
import UserSidebar from "./components/UserSidebar";
import TopBar from "@/components/TopBar";
import { MobileMenu } from "@/components/MobileMenu";
import { ticketsAPI, usersAPI } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Eye, Pencil } from "lucide-react";

export function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [managers, setManagers] = useState([]);
  const { canManage } = useAuth();

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium",
    status: "open",
    assigneeId: ""
  });

  useEffect(() => {
    loadTickets();
    if (canManage) {
      loadManagers();
    }
  }, [canManage]);

  const normalizeTickets = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (payload?.tickets && Array.isArray(payload.tickets)) return payload.tickets;
    if (payload?.data && Array.isArray(payload.data)) return payload.data;
    if (payload?.results && Array.isArray(payload.results)) return payload.results;
    if (payload?.items && Array.isArray(payload.items)) return payload.items;
    return [];
  };

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await ticketsAPI.getAll();
      let parsed = normalizeTickets(data);
      if (!Array.isArray(data) && parsed.length === 0) {
        console.warn("Formato inesperado para lista de tickets:", data);
      }
      if (canManage) {
        parsed = parsed.filter((ticket) => ticket.status !== 'closed');
      }
      setTickets(parsed);
    } catch (err) {
      setError("Erro ao carregar tickets");
      console.error(err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const loadManagers = async () => {
    try {
      const data = await usersAPI.getManagers();
      setManagers(data);
    } catch (err) {
      console.error("Erro ao carregar gerentes:", err);
    }
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setIsDialogOpen(true);
  };

  const handleEditTicket = (ticket) => {
    setSelectedTicket(ticket);
    setFormData({
      title: ticket.title,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      assigneeId: ticket.assigneeId || ""
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateTicket = async () => {
    try {
      await ticketsAPI.update(selectedTicket.id, formData);
      await loadTickets();
      setIsEditDialogOpen(false);
      setSelectedTicket(null);
    } catch (err) {
      setError("Erro ao atualizar ticket");
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "closed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "open":
        return "Aberto";
      case "in_progress":
        return "Em Andamento";
      case "closed":
        return "Fechado";
      default:
        return status;
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case "high":
        return "Alta";
      case "medium":
        return "Média";
      case "low":
        return "Baixa";
      default:
        return priority;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col md:flex-row">
        <MobileMenu />
        {canManage ? <Sidebar /> : <UserSidebar />}
        <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
          <TopBar />
          <div className="flex-1 flex items-center justify-center p-6">
            <p>Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <MobileMenu />
      {canManage ? <Sidebar /> : <UserSidebar />}
      <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
        <TopBar />
        <div className="flex-1 p-4 md:p-6">
          <div className="bg-white border border-[#D9D9D9] rounded-lg shadow-sm">
            <div className="bg-[#D9D9D9] text-slate-900 px-4 md:px-6 py-3 rounded-t-lg">
              <h1 className="text-2xl md:text-3xl font-bold">
                {canManage ? 'Chamados em aberto' : 'Meus Chamados'}
              </h1>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="space-y-4 md:hidden">
                {tickets.length === 0 ? (
                  <p className="text-center text-gray-500">Nenhum ticket encontrado</p>
                ) : (
                  tickets.map((ticket) => (
                    <div key={ticket.id} className="bg-white rounded-lg shadow border p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs text-gray-500">Protocolo</p>
                          <p className="text-sm font-semibold">{ticket.protocol.substring(0, 8)}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(ticket.status)}`}>
                          {getStatusLabel(ticket.status)}
                        </span>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">Título</p>
                        <p className="text-sm font-medium">{ticket.title}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div>
                          <p className="text-gray-500">Categoria</p>
                          <p>{ticket.category}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Prioridade</p>
                          <div className="flex items-center gap-2">
                            <span className={`inline-block w-3 h-3 rounded-full ${getPriorityColor(ticket.priority)}`}></span>
                            <span>{getPriorityLabel(ticket.priority)}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-500">Data</p>
                          <p>{new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</p>
                        </div>
                        {canManage && (
                          <div>
                            <p className="text-gray-500">Solicitante</p>
                            <p>{ticket.requester?.name || 'N/A'}</p>
                          </div>
                        )}
                        {canManage && (
                          <div>
                            <p className="text-gray-500">Responsável</p>
                            <p>{ticket.assignee?.name || 'Não atribuído'}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewTicket(ticket)} className="flex-1 flex items-center justify-center gap-2 text-xs">
                          <Eye size={16} />
                          <span className="sr-only">Ver</span>
                        </Button>
                        {canManage && (
                          <Button variant="outline" size="sm" onClick={() => handleEditTicket(ticket)} className="flex-1 flex items-center justify-center gap-2 text-xs">
                            <Pencil size={16} />
                            <span className="sr-only">Editar</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="overflow-x-auto bg-white shadow-md rounded-lg hidden md:block">
                <div className="min-w-full overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-200 text-gray-700">
                        <th className="p-2 text-left text-xs md:text-sm">Protocolo</th>
                        <th className="p-2 text-left text-xs md:text-sm">Data</th>
                        <th className="p-2 text-left text-xs md:text-sm">Título</th>
                        {canManage && (
                          <>
                            <th className="p-2 text-left text-xs md:text-sm">Solicitante</th>
                            <th className="p-2 text-left text-xs md:text-sm">Responsável</th>
                          </>
                        )}
                        <th className="p-2 text-left text-xs md:text-sm">Categoria</th>
                        <th className="p-2 text-left text-xs md:text-sm">Status</th>
                        <th className="p-2 text-left text-xs md:text-sm">Prioridade</th>
                        <th className="p-2 text-left text-xs md:text-sm">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.length === 0 ? (
                        <tr>
                          <td colSpan={canManage ? 8 : 6} className="p-4 text-center text-gray-500">
                            Nenhum ticket encontrado
                          </td>
                        </tr>
                      ) : (
                        tickets.map((ticket) => (
                          <tr key={ticket.id} className="border-t hover:bg-gray-50">
                            <td className="p-2 text-xs md:text-sm">{ticket.protocol.substring(0, 8)}</td>
                            <td className="p-2 text-xs md:text-sm">
                              {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="p-2 text-xs md:text-sm">{ticket.title}</td>
                            {canManage && (
                              <>
                                <td className="p-2 text-xs md:text-sm">{ticket.requester?.name || "N/A"}</td>
                                <td className="p-2 text-xs md:text-sm">{ticket.assignee?.name || "Não atribuído"}</td>
                              </>
                            )}
                            <td className="p-2 text-xs md:text-sm">{ticket.category}</td>
                            <td className="p-2 text-xs md:text-sm">
                              <span className={`px-2 py-1 rounded text-xs ${getStatusColor(ticket.status)}`}>
                                {getStatusLabel(ticket.status)}
                              </span>
                            </td>
                            <td className="p-2 text-xs md:text-sm">
                              <div className="flex items-center gap-2">
                                <span className={`inline-block w-3 h-3 rounded-full ${getPriorityColor(ticket.priority)}`}></span>
                              </div>
                            </td>
                            <td className="p-2 text-xs md:text-sm">
                              <div className="flex flex-col md:flex-row gap-1">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleViewTicket(ticket)}
                                  className="text-xs flex items-center justify-center gap-2"
                                >
                                  <Eye size={16} />
                                  <span className="sr-only">Ver</span>
                                </Button>
                                {canManage && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleEditTicket(ticket)}
                                    className="text-xs flex items-center justify-center gap-2"
                                  >
                                    <Pencil size={16} />
                                    <span className="sr-only">Editar</span>
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Dialog para visualizar ticket */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="p-0 max-w-3xl overflow-hidden">
                  {selectedTicket && (
                    <div className="bg-white">
                      <div className="bg-[#D9D9D9] text-slate-900 px-6 py-4">
                        <h2 className="text-xl font-semibold">
                          {selectedTicket.title || `Chamado ${selectedTicket.protocol.substring(0, 8)}`}
                        </h2>
                        <p className="text-sm text-slate-700">Protocolo {selectedTicket.protocol}</p>
                      </div>
                      <div className="p-6 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700">Solicitante</label>
                              <Input value={selectedTicket.requester?.name || 'Não informado'} readOnly disabled className="bg-slate-50" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700">Responsável</label>
                              <Input value={selectedTicket.assignee?.name || 'Não atribuído'} readOnly disabled className="bg-slate-50" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700">Descrição</label>
                              <Textarea value={selectedTicket.description} readOnly disabled className="bg-slate-50 min-h-[140px]" />
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700">Data de cadastro</label>
                              <Input value={new Date(selectedTicket.createdAt).toLocaleDateString('pt-BR')} readOnly disabled className="bg-slate-50" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700">Categoria</label>
                              <Input value={selectedTicket.category} readOnly disabled className="bg-slate-50" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700">Tipo</label>
                              <Input value={selectedTicket.title} readOnly disabled className="bg-slate-50" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-slate-700">Situação</label>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedTicket.status)}`}>
                                  {getStatusLabel(selectedTicket.status)}
                                </span>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-700">Prioridade</label>
                                <span className="inline-flex items-center gap-2 text-sm">
                                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${getPriorityColor(selectedTicket.priority)}`}></span>
                                  {getPriorityLabel(selectedTicket.priority)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {/* Dialog para editar ticket (apenas gerente) */}
              {canManage && (
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogContent className="p-0 max-w-3xl overflow-hidden">
                    <div className="bg-white">
                      <div className="bg-[#D9D9D9] text-slate-900 px-6 py-4">
                        <h2 className="text-xl font-semibold">
                          Editar Chamado - {selectedTicket?.title || ''}
                        </h2>
                        {selectedTicket && (
                          <p className="text-sm text-slate-700">Protocolo {selectedTicket.protocol}</p>
                        )}
                      </div>
                      <div className="p-6 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700">Título</label>
                              <Input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700">Categoria</label>
                              <Input
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700">Descrição</label>
                              <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={6}
                              />
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700">Status</label>
                              <select
                                className="w-full p-3 border rounded"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                              >
                                <option value="open">Aberto</option>
                                <option value="in_progress">Em Andamento</option>
                                <option value="closed">Fechado</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700">Prioridade</label>
                              <select
                                className="w-full p-3 border rounded"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                              >
                                <option value="low">Baixa</option>
                                <option value="medium">Média</option>
                                <option value="high">Alta</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700">Responsável</label>
                              <select
                                className="w-full p-3 border rounded"
                                value={formData.assigneeId}
                                onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                              >
                                <option value="">Não atribuído</option>
                                {managers.map((manager) => (
                                  <option key={manager.id} value={manager.id}>
                                    {manager.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={handleUpdateTicket}>Salvar</Button>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TicketList;




