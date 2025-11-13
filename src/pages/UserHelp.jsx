import React, { useState, useEffect } from "react";
import { Wifi, Monitor, ShieldAlert, Lock, Printer, ThumbsUp, ThumbsDown } from "lucide-react";
import UserSidebar from "./components/UserSidebar";
import TopBar from "@/components/TopBar";
import { MobileMenu } from "@/components/MobileMenu";
import { articlesAPI } from "@/services/api";

// Mapeamento de ícones por categoria
const iconMap = {
  Rede: Wifi,
  Hardware: Monitor,
  Software: ShieldAlert,
  Segurança: Lock,
  Impressora: Printer,
  Geral: Monitor,
};

export function UsefulArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState({});

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

  const handleFeedback = async (articleId, type) => {
    try {
      await articlesAPI.addFeedback(articleId, type);
      setFeedback((prev) => ({ ...prev, [articleId]: type }));
    } catch (err) {
      console.error("Erro ao adicionar feedback:", err);
    }
  };

  const getIcon = (category, iconName) => {
    if (iconName) {
      const IconComponent = iconMap[iconName] || Monitor;
      return <IconComponent size={32} />;
    }
    const IconComponent = iconMap[category] || Monitor;
    return <IconComponent size={32} />;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col md:flex-row">
        <MobileMenu isManager={false} />
        <UserSidebar />
        <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
          <TopBar />
          <div className="flex-1 flex items-center justify-center p-6">
            <p>Carregando artigos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <MobileMenu isManager={false} />
      <UserSidebar />
      <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
        <TopBar />
        <div className="flex-1 p-4 md:p-6">
          <div className="bg-white border border-[#D9D9D9] rounded-lg shadow-sm">
            <div className="bg-[#D9D9D9] text-slate-900 px-4 md:px-6 py-3 rounded-t-lg">
              <h1 className="text-2xl md:text-3xl font-bold">Artigos úteis</h1>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {articles.length === 0 ? (
                <p className="text-gray-500">Nenhum artigo disponível no momento.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {articles.map((article) => (
                    <div key={article.id} className="bg-white shadow-md rounded-lg p-4 flex flex-col">
                      <div className="flex items-start">
                        <div className="text-blue-600 flex-shrink-0">{getIcon(article.category, article.icon)}</div>
                        <div className="ml-4 flex-1">
                          <h2 className="text-lg md:text-xl font-semibold">{article.title}</h2>
                          <p className="text-gray-600 text-sm md:text-base mt-1">{article.description}</p>
                          <p className="text-xs text-gray-400 mt-2">Categoria: {article.category}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center space-x-2">
                        <span className="text-gray-700 text-sm">Este artigo foi útil?</span>
                        <button
                          onClick={() => handleFeedback(article.id, "like")}
                          className={`p-2 rounded transition-colors ${
                            feedback[article.id] === "like" ? "bg-green-200" : "bg-gray-100 hover:bg-green-100"
                          }`}
                        >
                          <ThumbsUp size={20} className="text-green-600" />
                        </button>
                        <button
                          onClick={() => handleFeedback(article.id, "dislike")}
                          className={`p-2 rounded transition-colors ${
                            feedback[article.id] === "dislike" ? "bg-red-200" : "bg-gray-100 hover:bg-red-100"
                          }`}
                        >
                          <ThumbsDown size={20} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UsefulArticles;

