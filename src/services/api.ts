export const API_BASE = import.meta.env.VITE_API_BASE as string;
const NORMALIZED_BASE = (API_BASE || '').replace(/\/+$/, '');

const withBase = (path = '') => {
  if (!NORMALIZED_BASE) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${NORMALIZED_BASE}${normalizedPath}`;
};

const buildHeaders = (extra: Record<string, string> = {}) => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  } as Record<string, string>;
};

const statusMessage = (status: number) => {
  if (status === 401) return 'Sua sessão expirou. Faça login novamente.';
  if (status === 403) return 'Você não tem permissão para esta ação.';
  if (status === 404) return 'Recurso não encontrado.';
  if (status >= 500) return 'Erro no servidor. Tente novamente mais tarde.';
  return `Erro (${status}).`;
};

const ensureOk = async (res: Response) => {
  if (!res.ok) {
    let body: any;
    try {
      body = await res.json();
    } catch {}
    const message = body?.error || body?.message || statusMessage(res.status);
    const err = new Error(message) as Error & { status?: number; body?: any };
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return res;
};

const withQuery = (url: string, params?: Record<string, unknown>) => {
  if (!params || Object.keys(params).length === 0) return url;
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') usp.append(k, String(v));
  });
  return `${url}?${usp.toString()}`;
};

const http = {
  get: async <T = any>(path: string, params?: Record<string, unknown>): Promise<T> => {
    try {
      const res = await fetch(withQuery(withBase(path), params), {
        method: 'GET',
        headers: buildHeaders(),
      });
      await ensureOk(res);
      return res.json();
    } catch (e: any) {
      if (e instanceof TypeError || (typeof e.message === 'string' && e.message.toLowerCase().includes('failed to fetch'))) {
        const err = new Error('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.') as Error & { code?: string };
        err.code = 'NETWORK';
        throw err;
      }
      throw e;
    }
  },
  post: async <T = any>(path: string, body?: unknown): Promise<T> => {
    try {
      const res = await fetch(withBase(path), {
        method: 'POST',
        headers: buildHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });
      await ensureOk(res);
      return res.json();
    } catch (e: any) {
      if (e instanceof TypeError || (typeof e.message === 'string' && e.message.toLowerCase().includes('failed to fetch'))) {
        const err = new Error('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.') as Error & { code?: string };
        err.code = 'NETWORK';
        throw err;
      }
      throw e;
    }
  },
  patch: async <T = any>(path: string, body?: unknown): Promise<T> => {
    try {
      const res = await fetch(withBase(path), {
        method: 'PATCH',
        headers: buildHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });
      await ensureOk(res);
      return res.json();
    } catch (e: any) {
      if (e instanceof TypeError || (typeof e.message === 'string' && e.message.toLowerCase().includes('failed to fetch'))) {
        const err = new Error('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.') as Error & { code?: string };
        err.code = 'NETWORK';
        throw err;
      }
      throw e;
    }
  },
  put: async <T = any>(path: string, body?: unknown): Promise<T> => {
    try {
      const res = await fetch(withBase(path), {
        method: 'PUT',
        headers: buildHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });
      await ensureOk(res);
      return res.json();
    } catch (e: any) {
      if (e instanceof TypeError || (typeof e.message === 'string' && e.message.toLowerCase().includes('failed to fetch'))) {
        const err = new Error('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.') as Error & { code?: string };
        err.code = 'NETWORK';
        throw err;
      }
      throw e;
    }
  },
  delete: async <T = any>(path: string): Promise<T> => {
    try {
      const res = await fetch(withBase(path), {
        method: 'DELETE',
        headers: buildHeaders(),
      });
      await ensureOk(res);
      return res.json();
    } catch (e: any) {
      if (e instanceof TypeError || (typeof e.message === 'string' && e.message.toLowerCase().includes('failed to fetch'))) {
        const err = new Error('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.') as Error & { code?: string };
        err.code = 'NETWORK';
        throw err;
      }
      throw e;
    }
  },
};

export const authAPI = {
  login: (email: string, password: string) => http.post('/auth/login', { email, password }),
  register: (userData: Record<string, unknown>) => http.post('/auth/register', userData),
  getMe: () => http.get('/auth/me'),
};

export const ticketsAPI = {
  getAll: (params?: Record<string, unknown>) => http.get('/tickets', params),
  getById: (id: string | number) => http.get(`/tickets/${id}`),
  create: (ticketData: Record<string, unknown>) => http.post('/tickets', ticketData),
  update: (id: string | number, ticketData: Record<string, unknown>) => http.put(`/tickets/${id}`, ticketData),
  delete: (id: string | number) => http.delete(`/tickets/${id}`),
};

export const ticketMessagesAPI = {
  add: (ticketId: string | number, messageData: Record<string, unknown>) => http.post(`/tickets/${ticketId}/messages`, messageData),
};

export const articlesAPI = {
  getAll: (params?: Record<string, unknown>) => http.get('/articles', params),
  create: (articleData: Record<string, unknown>) => http.post('/articles', articleData),
  update: (id: string | number, articleData: Record<string, unknown>) => http.put(`/articles/${id}`, articleData),
  delete: (id: string | number) => http.delete(`/articles/${id}`),
  addFeedback: (id: string | number, type: string) => http.post(`/articles/${id}/feedback`, { type }),
};

export const faqAPI = {
  getAll: () => http.get('/faq'),
  getPopular: () => http.get('/faq/popular'),
  addFeedback: (id: string | number, payload: Record<string, unknown>) => http.post(`/faq/${id}/feedback`, payload),
};

export const usersAPI = {
  getAll: (params?: Record<string, unknown>) => http.get('/users', params),
  getById: (id: string | number) => http.get(`/users/${id}`),
  getManagers: () => http.get('/users/managers/list'),
};

export const aiAPI = {
  chat: <T = any>(payload: Record<string, unknown>) => http.post<T>('/ai/chat', { origin: 'web', ...payload }),
};

export default {
  API_BASE,
  authAPI,
  ticketsAPI,
  ticketMessagesAPI,
  articlesAPI,
  faqAPI,
  usersAPI,
  aiAPI,
};
