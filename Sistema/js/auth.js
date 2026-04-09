/**
 * MN Imperialowls — Auth & Session Manager
 * Autenticação via Supabase Auth + controle de perfis e permissões
 */

// ─────────────────────────────────────────────────────────────
// PERFIS E PERMISSÕES
// ─────────────────────────────────────────────────────────────

const PROFILES = {
  master:          { grau: 1, label: 'Master',               icon: '👑' },
  ceo:             { grau: 2, label: 'CEO',                   icon: '🏢' },
  dir_executivo:   { grau: 3, label: 'Diretor Executivo',     icon: '📋' },
  dir_marketing:   { grau: 3, label: 'Diretor de Marketing',  icon: '📣' },
  dir_organizacao: { grau: 3, label: 'Dir. de Organização',   icon: '⚙️' },
  usuario:         { grau: 4, label: 'Usuário',               icon: '👤' }
};

// Módulos visíveis por perfil
const PERMISSIONS = {
  master:          ['dashboard','usuarios','atletas','equipes','organograma','planejamento','revisoes','swot','pdca','bsc','spliss','canvas','pmo','estatuto','logistica','competicao','marketing','funko','site-editor'],
  ceo:             ['dashboard','usuarios','atletas','equipes','organograma','planejamento','revisoes','swot','pdca','bsc','spliss','canvas','pmo','estatuto','logistica','competicao','marketing','funko','site-editor'],
  dir_executivo:   ['dashboard','atletas','equipes','planejamento','revisoes','swot','pdca','bsc','spliss','canvas','pmo','estatuto'],
  dir_marketing:   ['dashboard','atletas','equipes','marketing','funko'],
  dir_organizacao: ['dashboard','atletas','equipes','organograma','logistica','competicao'],
  usuario:         ['dashboard','atletas','equipes']
};

// Quem pode EDITAR (criar/alterar) em cada módulo
const EDIT_PERMISSIONS = {
  master:          ['all'],
  ceo:             ['atletas','equipes','organograma','planejamento','revisoes','swot','pdca','bsc','spliss','canvas','pmo','estatuto','logistica','competicao','marketing','funko','site-editor'],
  dir_executivo:   ['planejamento','revisoes','swot','pdca','bsc','spliss','canvas','pmo','estatuto'],
  dir_marketing:   ['marketing','funko','atletas'],
  dir_organizacao: ['organograma','logistica','competicao','atletas','equipes'],
  usuario:         []
};

// Quem pode EXCLUIR registros
const DELETE_PERMISSIONS = {
  master:          ['all'],
  ceo:             ['atletas','equipes','organograma','logistica','competicao','marketing','funko'],
  dir_executivo:   [],
  dir_marketing:   ['marketing','funko'],
  dir_organizacao: ['logistica','competicao'],
  usuario:         []
};

// ─────────────────────────────────────────────────────────────
// ESTADO DA SESSÃO
// ─────────────────────────────────────────────────────────────

let currentUser = null;
let currentProfile = null;

// ─────────────────────────────────────────────────────────────
// INICIALIZAÇÃO — verifica sessão ao carregar a página
// ─────────────────────────────────────────────────────────────

async function initAuth() {
  try {
    // Verifica se Supabase está disponível
    if (typeof SupaAuth === 'undefined') {
      console.warn('[Auth] Supabase não está configurado. Usando modo demo.');
      return initAuthDemo();
    }

    const session = await SupaAuth.getSession();

    if (!session) {
      // Não há sessão — redireciona para login (exceto nas páginas públicas)
      const publicPages = ['index.html', 'login.html', '/'];
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';
      if (!publicPages.includes(currentPage)) {
        window.location.href = 'login.html';
      }
      return;
    }

    // Busca dados completos do usuário na tabela usuarios
    const { id, email } = session.user;
    const users = await SupaDB.list('usuarios', { filters: { auth_id: id } });

    if (users.length === 0) {
      console.error('[Auth] Usuário autenticado sem perfil na tabela usuarios.');
      await SupaAuth.logout();
      window.location.href = 'login.html';
      return;
    }

    const userData = users[0];
    currentUser = { ...session.user, ...userData };
    currentProfile = userData.perfil || 'usuario';

    // Armazena no sessionStorage para acesso rápido
    sessionStorage.setItem('mn_user', JSON.stringify(currentUser));
    sessionStorage.setItem('mn_profile', currentProfile);

    applyPermissions();
    return currentUser;

  } catch (err) {
    console.error('[Auth] Erro na inicialização:', err);
    return initAuthDemo();
  }
}

// ─────────────────────────────────────────────────────────────
// MODO DEMO — fallback quando Supabase não está configurado
// ─────────────────────────────────────────────────────────────

function initAuthDemo() {
  const storedUser = sessionStorage.getItem('mn_user');
  const storedProfile = sessionStorage.getItem('mn_profile');

  if (storedUser && storedProfile) {
    currentUser = JSON.parse(storedUser);
    currentProfile = storedProfile;
    applyPermissions();
    return currentUser;
  }

  // Sem sessão demo e sem Supabase — vai para login
  const publicPages = ['index.html', 'login.html', '/'];
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  if (!publicPages.includes(currentPage)) {
    window.location.href = 'login.html';
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────────────────────

async function doLogin(emailOrUsername, password) {
  try {
    // Tenta login via Supabase
    if (typeof SupaAuth !== 'undefined') {
      // Se não é email, busca o email pelo username
      let email = emailOrUsername;
      if (!emailOrUsername.includes('@')) {
        const users = await SupaDB.list('usuarios', { filters: { username: emailOrUsername } });
        if (users.length === 0) throw new Error('Usuário não encontrado.');
        email = users[0].email;
      }

      await SupaAuth.login(email, password);
      await initAuth();
      window.location.href = 'dashboard.html';
      return true;
    }

    // Fallback modo demo
    return loginDemo(emailOrUsername, password);

  } catch (err) {
    console.error('[Auth] Erro no login:', err);
    throw err;
  }
}

// Login demo (sem Supabase)
const DEMO_USERS = {
  master:    { id: '1', nome: 'Master Admin',    perfil: 'master',          email: 'master@mnimperialowls.com',    grau: 1 },
  ceo:       { id: '2', nome: 'CEO',             perfil: 'ceo',             email: 'ceo@mnimperialowls.com',       grau: 2 },
  executivo: { id: '3', nome: 'Dir. Executivo',  perfil: 'dir_executivo',   email: 'executivo@mnimperialowls.com', grau: 3 },
  marketing: { id: '4', nome: 'Dir. Marketing',  perfil: 'dir_marketing',   email: 'marketing@mnimperialowls.com', grau: 3 },
  org:       { id: '5', nome: 'Dir. Organização',perfil: 'dir_organizacao', email: 'org@mnimperialowls.com',       grau: 3 },
  usuario:   { id: '6', nome: 'Usuário Padrão',  perfil: 'usuario',         email: 'usuario@mnimperialowls.com',   grau: 4 }
};

const DEMO_PASSWORDS = {
  master: 'Master@2025!', ceo: 'Ceo@2025!', executivo: 'Exec@2025!',
  marketing: 'Mkt@2025!', org: 'Org@2025!', usuario: 'User@2025!'
};

function loginDemo(username, password) {
  const user = DEMO_USERS[username];
  if (!user) throw new Error('Usuário não encontrado.');
  if (DEMO_PASSWORDS[username] !== password) throw new Error('Senha incorreta.');

  currentUser = user;
  currentProfile = user.perfil;
  sessionStorage.setItem('mn_user', JSON.stringify(user));
  sessionStorage.setItem('mn_profile', user.perfil);
  window.location.href = 'dashboard.html';
  return true;
}

// ─────────────────────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────────────────────

async function doLogout() {
  try {
    if (typeof SupaAuth !== 'undefined') {
      await SupaAuth.logout();
    }
  } catch (e) {
    console.warn('[Auth] Erro ao fazer logout:', e);
  } finally {
    sessionStorage.removeItem('mn_user');
    sessionStorage.removeItem('mn_profile');
    currentUser = null;
    currentProfile = null;
    window.location.href = 'login.html';
  }
}

// ─────────────────────────────────────────────────────────────
// CONTROLE DE PERMISSÕES
// ─────────────────────────────────────────────────────────────

function canAccess(module) {
  if (!currentProfile) return false;
  const perms = PERMISSIONS[currentProfile] || [];
  return perms.includes('all') || perms.includes(module);
}

function canEdit(module) {
  if (!currentProfile) return false;
  const perms = EDIT_PERMISSIONS[currentProfile] || [];
  return perms.includes('all') || perms.includes(module);
}

function canDelete(module) {
  if (!currentProfile) return false;
  const perms = DELETE_PERMISSIONS[currentProfile] || [];
  return perms.includes('all') || perms.includes(module);
}

function isMaster() {
  return currentProfile === 'master';
}

function isCEOOrAbove() {
  const profile = PROFILES[currentProfile];
  return profile && profile.grau <= 2;
}

function isDirectorOrAbove() {
  const profile = PROFILES[currentProfile];
  return profile && profile.grau <= 3;
}

// ─────────────────────────────────────────────────────────────
// APLICA PERMISSÕES NA UI
// ─────────────────────────────────────────────────────────────

function applyPermissions() {
  if (!currentUser) return;

  // Atualiza nome e perfil na topbar
  const nameEl = document.getElementById('user-name');
  const profileEl = document.getElementById('user-profile');
  const avatarEl = document.getElementById('user-avatar');

  if (nameEl) nameEl.textContent = currentUser.nome || currentUser.email || 'Usuário';
  if (profileEl) {
    const p = PROFILES[currentProfile] || PROFILES.usuario;
    profileEl.textContent = p.label;
  }
  if (avatarEl) {
    const p = PROFILES[currentProfile] || PROFILES.usuario;
    avatarEl.textContent = p.icon;
  }

  // Esconde itens do menu sem permissão
  document.querySelectorAll('[data-module]').forEach(el => {
    const mod = el.getAttribute('data-module');
    el.style.display = canAccess(mod) ? '' : 'none';
  });

  // Esconde botões de edição sem permissão
  document.querySelectorAll('[data-edit-module]').forEach(el => {
    const mod = el.getAttribute('data-edit-module');
    el.style.display = canEdit(mod) ? '' : 'none';
  });

  // Esconde botões de exclusão sem permissão
  document.querySelectorAll('[data-delete-module]').forEach(el => {
    const mod = el.getAttribute('data-delete-module');
    el.style.display = canDelete(mod) ? '' : 'none';
  });
}

// ─────────────────────────────────────────────────────────────
// TEMA CLARO/ESCURO
// ─────────────────────────────────────────────────────────────

function initTheme() {
  const savedTheme = localStorage.getItem('mn_theme') || 'dark';
  applyTheme(savedTheme);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('mn_theme', theme);

  const toggleBtns = document.querySelectorAll('.theme-toggle, #theme-toggle');
  toggleBtns.forEach(btn => {
    btn.innerHTML = theme === 'dark'
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';
    btn.title = theme === 'dark' ? 'Modo Claro' : 'Modo Escuro';
  });
}

function toggleTheme() {
  const current = localStorage.getItem('mn_theme') || 'dark';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

// ─────────────────────────────────────────────────────────────
// GETTERS
// ─────────────────────────────────────────────────────────────

function getCurrentUser() {
  if (!currentUser) {
    const stored = sessionStorage.getItem('mn_user');
    if (stored) currentUser = JSON.parse(stored);
  }
  return currentUser;
}

function getCurrentProfile() {
  if (!currentProfile) {
    currentProfile = sessionStorage.getItem('mn_profile') || 'usuario';
  }
  return currentProfile;
}

function getProfileLabel() {
  const p = PROFILES[getCurrentProfile()];
  return p ? p.label : 'Usuário';
}

// ─────────────────────────────────────────────────────────────
// EXPORTA FUNÇÕES GLOBAIS
// ─────────────────────────────────────────────────────────────

window.MNAuth = {
  init: initAuth,
  login: doLogin,
  logout: doLogout,
  canAccess,
  canEdit,
  canDelete,
  isMaster,
  isCEOOrAbove,
  isDirectorOrAbove,
  getCurrentUser,
  getCurrentProfile,
  getProfileLabel,
  applyPermissions,
  PROFILES,
  PERMISSIONS
};

window.MNTheme = {
  init: initTheme,
  toggle: toggleTheme,
  apply: applyTheme
};

// Auto-inicializa tema
initTheme();
