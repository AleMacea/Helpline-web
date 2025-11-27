import React, { useEffect, useMemo, useState } from 'react';
import { Wifi, Monitor, ShieldAlert, Lock, Printer, ThumbsUp, ThumbsDown, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import UserSidebar from './components/UserSidebar';
import TopBar from '@/components/TopBar';
import { MobileMenu } from '@/components/MobileMenu';
import { articlesAPI } from '@/services/api';
import { faqFallback } from '@/services/faq';

const iconMap = {
  Rede: Wifi,
  Hardware: Monitor,
  Software: ShieldAlert,
  Segurança: Lock,
  Acesso: Lock,
  Impressora: Printer,
  Geral: BookOpen,
};

const contentTemplates = {
  Rede:
    'Passos rápidos para voltar a navegar:\n' +
    '1) Confirme se o Wi-Fi ou cabo estão conectados e desative o modo avião.\n' +
    '2) Reinicie o roteador (home office) e o próprio dispositivo.\n' +
    '3) Esqueça a rede corporativa e reconecte com o usuário correto.\n' +
    '4) Desative a VPN temporariamente e teste outra rede para comparação.\n' +
    '5) Se continuar sem internet, anote SSID, mensagem de erro e horário e abra um chamado.',
  Acesso:
    'Dicas para recuperar acesso:\n' +
    '1) Redefina a senha pelo Ctrl+Alt+Del (Windows) conectado na rede ou VPN.\n' +
    '2) Siga a política: mínimo 8 caracteres com maiúsculas, minúsculas, número e símbolo.\n' +
    '3) Depois de alterar, bloqueie e desbloqueie a sessão para replicar no domínio.\n' +
    '4) Se a conta estiver bloqueada, aguarde 15 minutos e tente novamente.\n' +
    '5) Persistindo, registre um chamado com print do erro e horário da tentativa.',
  Software:
    'Para resolver lentidão ou travamentos:\n' +
    '1) Reinicie o equipamento e feche apps pesados no Gerenciador de Tarefas.\n' +
    '2) Verifique uso de CPU, memória e disco; encerre processos em 100%.\n' +
    '3) Desative inicialização de apps não essenciais e limpe arquivos temporários.\n' +
    '4) Conclua atualizações pendentes do Windows/antivírus e reinicie novamente.\n' +
    '5) Ainda lento? Anote hora, app afetado e prints e abra um chamado.',
  Hardware:
    'Checklist rápido de hardware:\n' +
    '1) Confirme cabos de energia/rede e se há luzes no equipamento.\n' +
    '2) Teste outra tomada e outro cabo conhecido.\n' +
    '3) Verifique ruídos ou cheiro de queimado na fonte/ventoinhas.\n' +
    '4) Desconecte periféricos opcionais e tente ligar novamente.\n' +
    '5) Persistindo, acione o suporte e informe testes já feitos.',
  Impressora:
    'Problemas de impressão:\n' +
    '1) Revise cabos, energia, papel e toner/tinta; veja alertas no visor.\n' +
    '2) Limpe a fila de impressão e confirme que não está pausada.\n' +
    '3) Imprima página de teste; se falhar, reinstale/atualize o driver.\n' +
    '4) Teste a impressora em outro computador ou outra impressora no seu.\n' +
    '5) Informe modelo, IP (se houver) e mensagem de erro ao suporte.',
  Geral:
    'Siga o passo a passo do artigo e, se o problema persistir, registre um chamado com o que já foi testado.',
};

const safeId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `faq-${Math.random().toString(36).slice(2)}`;
};

const normalizeArticle = (article) => {
  const lastUpdated = article.lastUpdated || article.updatedAt || article.createdAt || null;
  const category = article.category || 'Geral';
  const baseDescription = article.description || article.summary || '';
  const baseContent = article.content || baseDescription || '';
  const fallbackContent = baseContent?.trim() ? baseContent : contentTemplates[category] || contentTemplates.Geral;
  const description = baseDescription?.trim() || fallbackContent.slice(0, 180);
  const feedbackCount = Array.isArray(article.feedback) ? article.feedback.length : 0;

  return {
    id: article.id ?? article._id ?? safeId(),
    title: article.title ?? 'Artigo sem título',
    description,
    content: fallbackContent,
    category,
    icon: article.icon ?? category,
    tags: Array.isArray(article.tags) ? article.tags : [],
    lastUpdated,
    feedbackCount,
  };
};

const selectPopular = (list) =>
  [...list]
    .sort((a, b) => {
      const feedbackDiff = (b.feedbackCount || 0) - (a.feedbackCount || 0);
      if (feedbackDiff !== 0) return feedbackDiff;
      const dateA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
      const dateB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 3);

export function UsefulArticles() {
  const [articles, setArticles] = useState([]);
  const [popular, setPopular] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState({});
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todos');
  const [focusArticleId, setFocusArticleId] = useState(null);

  useEffect(() => {
    loadFaqContent();
  }, []);

  useEffect(() => {
    if (focusArticleId) {
      const node = document.getElementById(`article-${focusArticleId}`);
      if (node) {
        node.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setFocusArticleId(null);
    }
  }, [focusArticleId]);

  const loadFaqContent = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await articlesAPI.getAll();
      const normalized = Array.isArray(data) ? data.map(normalizeArticle) : [];
      if (!normalized.length) throw new Error('Sem artigos publicados');
      setArticles(normalized);
      setPopular(selectPopular(normalized));
    } catch (err) {
      console.error('Erro ao carregar FAQ:', err);
      const fallback = faqFallback.map(normalizeArticle);
      setArticles(fallback);
      setPopular(selectPopular(fallback));
      setError('');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (articleId, helpful) => {
    const nextValue = helpful ? 'like' : 'dislike';
    setFeedback((prev) => ({ ...prev, [articleId]: nextValue })); // otimista para feedback visual
    try {
      await articlesAPI.addFeedback(articleId, nextValue);
    } catch (err) {
      console.error('Erro ao enviar feedback:', err);
    }
  };

  const categories = useMemo(() => {
    const unique = new Set(articles.map((article) => article.category || 'Geral'));
    return ['Todos', ...Array.from(unique).sort()];
  }, [articles]);

  const filteredArticles = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return articles.filter((article) => {
      if (category !== 'Todos' && article.category !== category) return false;
      if (!needle) return true;
      return (
        article.title.toLowerCase().includes(needle) ||
        article.description.toLowerCase().includes(needle) ||
        article.content.toLowerCase().includes(needle) ||
        article.tags.some((tag) => tag.toLowerCase().includes(needle))
      );
    });
  }, [articles, query, category]);

  const handlePopularClick = (article) => {
    setCategory(article.category || 'Todos');
    setQuery(article.title || '');
    setFocusArticleId(article.id);
  };

  const getIcon = (article) => {
    const IconComponent = iconMap[article.icon] || iconMap[article.category] || Monitor;
    return <IconComponent size={36} />;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col md:flex-row bg-slate-50">
        <MobileMenu />
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
    <div className="flex min-h-screen flex-col md:flex-row bg-slate-50">
      <MobileMenu />
      <UserSidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <div className="flex-1 px-4 py-6 md:px-10 md:py-10">
          <div className="space-y-8">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="px-6 py-5 border-b border-slate-100">
                <h1 className="text-3xl font-bold text-slate-900">FAQ e artigos úteis</h1>
                <p className="text-sm text-slate-500 mt-1">Encontre orientações rápidas para os problemas mais comuns.</p>
              </div>
              <div className="p-6 space-y-6">
                {error && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Buscar</label>
                    <Input
                      placeholder="Busque por palavra-chave ou sintoma"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      className="mt-1 text-base"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Filtrar por categoria</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {categories.map((label) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => setCategory(label)}
                          className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                            category === label
                              ? 'bg-primary text-white border-primary'
                              : 'border-gray-300 text-gray-700 hover:border-primary'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {popular.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Mais acessados</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {popular.map((article) => (
                        <button
                          type="button"
                          key={`popular-${article.id}`}
                          onClick={() => handlePopularClick(article)}
                          className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-left hover:border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
                        >
                          <p className="text-base font-semibold text-indigo-900 line-clamp-2">{article.title}</p>
                          <span className="text-xs text-indigo-600">{article.category}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {filteredArticles.length === 0 ? (
                  <p className="text-gray-500">Nenhum artigo disponível no momento.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredArticles.map((article) => (
                      <div
                        key={article.id}
                        id={`article-${article.id}`}
                        className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 flex flex-col gap-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className="text-primary flex-shrink-0">{getIcon(article)}</div>
                          <div className="flex-1 space-y-1">
                            <h2 className="text-xl font-semibold text-slate-900">{article.title}</h2>
                            <p className="text-base text-slate-600 whitespace-pre-line">{article.content || article.description}</p>
                            <div className="flex flex-wrap gap-2 text-xs text-slate-500 mt-2">
                              <span className="font-medium text-slate-600">{article.category}</span>
                              {article.tags.map((tag) => (
                                <span key={tag} className="bg-slate-100 px-2 py-0.5 rounded-full">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                          <span>Este artigo foi útil?</span>
                          <button
                            onClick={() => handleFeedback(article.id, true)}
                            className={`flex items-center justify-center w-8 h-8 rounded-md border ${
                              feedback[article.id] === 'like'
                                ? 'bg-green-100 border-green-200'
                                : 'border-slate-200 hover:border-green-300'
                            }`}
                            aria-label="Artigo ajudou"
                          >
                            <ThumbsUp size={18} className="text-green-600" />
                          </button>
                          <button
                            onClick={() => handleFeedback(article.id, false)}
                            className={`flex items-center justify-center w-8 h-8 rounded-md border ${
                              feedback[article.id] === 'dislike'
                                ? 'bg-red-100 border-red-200'
                                : 'border-slate-200 hover:border-red-300'
                            }`}
                            aria-label="Artigo não ajudou"
                          >
                            <ThumbsDown size={18} className="text-red-600" />
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
    </div>
  );
}

export default UsefulArticles;
