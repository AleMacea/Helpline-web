import React, { useState, useEffect } from "react";
import Sidebar from './components/Sidebar';
import TopBar from '@/components/TopBar';
import { MobileMenu } from '@/components/MobileMenu';
import { articlesAPI } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";

export function KnowledgeBase() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { canManage } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    icon: ""
  });

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await articlesAPI.getAll();
      setArticles(data);
    } catch (err) {
      setError("Erro ao carregar artigos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArticle = async () => {
    try {
      if (!formData.title || !formData.description || !formData.category) {
        setError("Todos os campos são obrigatórios");
        return;
      }

      await articlesAPI.create(formData);
      await loadArticles();
      setIsDialogOpen(false);
      setFormData({ title: "", description: "", category: "", icon: "" });
      setError("");
    } catch (err) {
      setError("Erro ao criar artigo");
      console.error(err);
    }
  };

  const handleDeleteArticle = async (id) => {
    if (!window.confirm("Tem certeza que deseja deletar este artigo?")) {
      return;
    }
    try {
      await articlesAPI.delete(id);
      await loadArticles();
    } catch (err) {
      setError("Erro ao deletar artigo");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col md:flex-row">
        <MobileMenu />
        <Sidebar />
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
      <Sidebar />
      <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
        <TopBar />
        <div className="flex-1 p-4 md:p-6">
          <div className="bg-white border border-[#D9D9D9] rounded-lg shadow-sm">
            <div className="bg-[#D9D9D9] text-slate-900 px-4 md:px-6 py-3 rounded-t-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h1 className="text-2xl md:text-3xl font-bold">Base de Conhecimento</h1>
              <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-500 hover:bg-blue-600">
                Criar Artigo
              </Button>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {articles.length === 0 ? (
                  <p className="text-gray-500 col-span-full">Nenhum artigo criado ainda.</p>
                ) : (
                  articles.map((article) => (
                    <Card key={article.id} className="flex flex-col">
                      <CardHeader>
                        <CardTitle className="text-lg">{article.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1 flex justify-between items-end">
                        <div>
                          <p className="text-gray-600 text-sm mb-2">{article.description}</p>
                          <p className="text-xs text-gray-400">Categoria: {article.category}</p>
                        </div>
                        <Button variant="destructive" size="icon" onClick={() => handleDeleteArticle(article.id)}>
                          <Trash2 size={16} />
                          <span className="sr-only">Deletar</span>
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Criar Novo Artigo</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block font-medium mb-1">Título</label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Ex: Como resolver problema de conexão"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1">Descrição</label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Descreva a solução ou informação..."
                        rows={4}
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1">Categoria</label>
                      <select
                        className="w-full p-2 border rounded"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option value="">Selecione uma categoria</option>
                        <option value="Rede">Rede</option>
                        <option value="Hardware">Hardware</option>
                        <option value="Software">Software</option>
                        <option value="Segurança">Segurança</option>
                        <option value="Impressora">Impressora</option>
                        <option value="Geral">Geral</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium mb-1">Ícone (opcional)</label>
                      <Input
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        placeholder="Ex: Rede, Hardware, Software"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateArticle}>Criar Artigo</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KnowledgeBase;
