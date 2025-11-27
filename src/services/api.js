// Unified API helpers with VITE_API_BASE and auth header
export const API_BASE = import.meta.env.VITE_API_BASE;
const NORMALIZED_BASE = (API_BASE || '').replace(/\/+$/, '');

const withBase = (path = '') => {
  if (!NORMALIZED_BASE) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${NORMALIZED_BASE}${normalizedPath}`;
};

const buildHeaders = (extra = {}) => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
};

const statusMessage = (status) => {
  if (status === 401) return 'Sua sessão expirou. Faça login novamente.';
  if (status === 403) return 'Você não tem permissão para esta ação.';
  if (status === 404) return 'Recurso não encontrado.';
  if (status >= 500) return 'Erro no servidor. Tente novamente mais tarde.';
  return `Erro (${status}).`;
};

const ensureOk = async (res) => {
  if (!res.ok) {
    let body;
    try {
      body = await res.json();
    } catch (_) {
      // ignore
    }
    const message = body?.error || body?.message || statusMessage(res.status);
    const err = new Error(message);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return res;
};

const withQuery = (url, params) => {
  if (!params || Object.keys(params).length === 0) return url;
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') usp.append(k, String(v));
  });
  return `${url}?${usp.toString()}`;
};

const http = {
  get: async (path, params) => {
    try {
      const res = await fetch(withQuery(withBase(path), params), {
        method: 'GET',
        headers: buildHeaders(),
      });
      await ensureOk(res);
      return res.json();
    } catch (e) {
      if (e instanceof TypeError || (typeof e.message === 'string' && e.message.toLowerCase().includes('failed to fetch'))) {
        const err = new Error('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
        err.code = 'NETWORK';
        throw err;
      }
      throw e;
    }
  },
  post: async (path, body) => {
    try {
      const res = await fetch(withBase(path), {
        method: 'POST',
        headers: buildHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });
      await ensureOk(res);
      return res.json();
    } catch (e) {
      if (e instanceof TypeError || (typeof e.message === 'string' && e.message.toLowerCase().includes('failed to fetch'))) {
        const err = new Error('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
        err.code = 'NETWORK';
        throw err;
      }
      throw e;
    }
  },
  patch: async (path, body) => {
    try {
      const res = await fetch(withBase(path), {
        method: 'PATCH',
        headers: buildHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });
      await ensureOk(res);
      return res.json();
    } catch (e) {
      if (e instanceof TypeError || (typeof e.message === 'string' && e.message.toLowerCase().includes('failed to fetch'))) {
        const err = new Error('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
        err.code = 'NETWORK';
        throw err;
      }
      throw e;
    }
  },
  put: async (path, body) => {
    try {
      const res = await fetch(withBase(path), {
        method: 'PUT',
        headers: buildHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });
      await ensureOk(res);
      return res.json();
    } catch (e) {
      if (e instanceof TypeError || (typeof e.message === 'string' && e.message.toLowerCase().includes('failed to fetch'))) {
        const err = new Error('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
        err.code = 'NETWORK';
        throw err;
      }
      throw e;
    }
  },
  delete: async (path) => {
    try {
      const res = await fetch(withBase(path), {
        method: 'DELETE',
        headers: buildHeaders(),
      });
      await ensureOk(res);
      return res.json();
    } catch (e) {
      if (e instanceof TypeError || (typeof e.message === 'string' && e.message.toLowerCase().includes('failed to fetch'))) {
        const err = new Error('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
        err.code = 'NETWORK';
        throw err;
      }
      throw e;
    }
  },
};

// Auth API
export const authAPI = {
  login: (email, password) => http.post('/auth/login', { email, password }),
  register: (userData) => http.post('/auth/register', userData),
  getMe: () => http.get('/auth/me'),
};

// Tickets API
export const ticketsAPI = {
  getAll: (params) => http.get('/tickets', params),
  getById: (id) => http.get(`/tickets/${id}`),
  create: (ticketData) => http.post('/tickets', ticketData),
  update: (id, ticketData) => http.put(`/tickets/${id}`, ticketData),
  delete: (id) => http.delete(`/tickets/${id}`),
};

export const ticketMessagesAPI = {
  add: (ticketId, messageData) => http.post(`/tickets/${ticketId}/messages`, messageData),
};

// Articles API
export const articlesAPI = {
  getAll: (params) => http.get('/articles', params),
  create: (articleData) => http.post('/articles', articleData),
  update: (id, articleData) => http.put(`/articles/${id}`, articleData),
  delete: (id) => http.delete(`/articles/${id}`),
  addFeedback: (id, type) => http.post(`/articles/${id}/feedback`, { type }),
};

export const faqAPI = {
  getAll: () => http.get('/faq'),
  getPopular: () => http.get('/faq/popular'),
  addFeedback: (id, payload) => http.post(`/faq/${id}/feedback`, payload),
};

// Users API
export const usersAPI = {
  getAll: (params) => http.get('/users', params),
  getById: (id) => http.get(`/users/${id}`),
  getManagers: () => http.get('/users/managers/list'),
};

// AI API
export const aiAPI = {
  chat: (payload) => http.post('/ai/chat', { origin: 'web', ...payload })
};

