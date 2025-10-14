// js/auth.js
console.log('[auth.js] Cargado ✅');

/**
 * AUTENTICACIÓN (demo localStorage) — lista para migrar a backend.
 * - Reemplaza internamente por fetch() cuando tengas tu API.
 */

const USERS_KEY = 'users_v1';
const SESSION_KEY = 'session_user_v1';

const Auth = {
  // ---------- Storage helpers ----------
  _loadUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
    catch { return []; }
  },
  _saveUsers(list) { localStorage.setItem(USERS_KEY, JSON.stringify(list)); },
  _normalizeEmail(email) { return (email || '').trim().toLowerCase(); },

  // ---------- API simulada ----------
  async register({ email, password }) {
    const e = this._normalizeEmail(email);
    if (!e || !password) return { ok: false, error: 'Completa email y contraseña.' };

    const users = this._loadUsers();
    if (users.some(u => u.email === e)) {
      return { ok: false, error: 'Ese correo ya está registrado.' };
    }

    // ⚠️ Demo: contraseña en claro. En backend real, usar hashing.
    users.push({ email: e, password });
    this._saveUsers(users);

    return { ok: true };
  },

  async login({ email, password }) {
    const e = this._normalizeEmail(email);
    const users = this._loadUsers();
    const user = users.find(u => u.email === e);

    if (!user) return { ok: false, error: 'No existe una cuenta con ese correo.' };
    if (user.password !== password) return { ok: false, error: 'Contraseña incorrecta.' };

    localStorage.setItem(SESSION_KEY, JSON.stringify({ email: e }));
    return { ok: true, user: { email: e } };
  },

  async logout() { localStorage.removeItem(SESSION_KEY); return { ok: true }; },

  currentUser() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
    catch { return null; }
  },

  isLoggedIn() { return !!this.currentUser(); }
};

// Exponer en window por simplicidad
window.Auth = Auth;
