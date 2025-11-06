// js/auth.js
console.log('[auth.js] Backend mode ✅');

const API_BASE = localStorage.getItem('API_BASE') || 'http://127.0.0.1:8000';
const SESSION_KEY = 'session_user_v2';

// ---------- Helper de fetch ----------
async function postJSON(path, body) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      return { ok: true, data: json };
    } else {
      return { ok: false, error: json?.detail || json?.error || `HTTP ${res.status}` };
    }
  } catch (e) {
    console.error('[auth] postJSON error:', e);
    return { ok: false, error: 'No se pudo conectar al servidor.' };
  }
}

const Auth = {
  _normalizeEmail(email) { return (email || '').trim().toLowerCase(); },

  async register({ email, password }) {
    const e = this._normalizeEmail(email);
    if (!e || !password) return { ok: false, error: 'Completa email y contraseña.' };
    if (password.length > 72) return { ok: false, error: 'La contraseña no puede exceder 72 caracteres.' };

    const { ok, data, error } = await postJSON('/api/auth/register', { email: e, password });
    if (!ok) return { ok: false, error };
    if (!data?.ok) return { ok: false, error: data?.error || 'Registro no permitido.' };
    return { ok: true, user: data.user };
  },

  async login({ email, password }) {
    const e = this._normalizeEmail(email);
    if (!e || !password) return { ok: false, error: 'Completa email y contraseña.' };

    const { ok, data, error } = await postJSON('/api/auth/login', { email: e, password });
    if (!ok) return { ok: false, error };
    if (!data?.ok || !data?.user) return { ok: false, error: data?.error || 'Credenciales inválidas.' };

    localStorage.setItem(SESSION_KEY, JSON.stringify({ id: data.user.id, email: data.user.email, ts: Date.now() }));
    return { ok: true, user: data.user };
  },

  async logout() { localStorage.removeItem(SESSION_KEY); return { ok: true }; },
  currentUser() { try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; } },
  isLoggedIn() { return !!this.currentUser(); }
};

window.Auth = Auth;
