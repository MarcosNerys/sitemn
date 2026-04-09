/**
 * MN Imperialowls — Dashboard Controller
 * Navegação, inicialização e controle de módulos
 */

let currentModule = 'dashboard';

// Mapa de módulos → funções de renderização
const MODULE_RENDERERS = {
  'dashboard':    renderDashboardHome,
  'usuarios':     renderUsuarios,
  'atletas':      renderAtletas,
  'equipes':      renderEquipes,
  'organograma':  renderOrganograma,
  'planejamento': renderPlanejamento,
  'revisoes':     renderRevisoes,
  'estatuto':     renderEstatuto,
  'swot':         renderSwot,
  'pdca':         renderPdca,
  'bsc':          renderBsc,
  'spliss':       renderSpliss,
  'canvas':       renderCanvas,
  'pmo':          renderPmo,
  'logistica':    renderLogistica,
  'competicao':   renderCompeticao,
  'marketing':    renderMarketing,
  'funko':        renderFunko,
  'site-editor':  renderSiteEditor
};

const MODULE_TITLES = {
  'dashboard':    '🏠 Dashboard',
  'usuarios':     '👥 Gestão de Usuários',
  'atletas':      '🏃 Atletas',
  'equipes':      '🛡️ Equipes',
  'organograma':  '🗂️ Organograma',
  'planejamento': '📅 Planejamento Anual',
  'revisoes':     '📋 Revisões',
  'estatuto':     '📄 Estatuto & Documentos',
  'swot':         '⚔️ Análise SWOT',
  'pdca':         '🔄 Ciclo PDCA',
  'bsc':          '⚖️ Balanced Scorecard',
  'spliss':       '📡 SPLISS',
  'canvas':       '🎨 Project Canvas',
  'pmo':          '📊 PMO',
  'logistica':    '📦 Logística',
  'competicao':   '🏆 Competição MN Cup',
  'marketing':    '📣 Marketing & Vendas',
  'funko':        '🎭 Funko Pop MAG',
  'site-editor':  '🌐 Editor do Site'
};

// ─────────────────────────────────────────────────────────────
// NAVEGAÇÃO
// ─────────────────────────────────────────────────────────────

async function navigateTo(module) {
  // Verifica permissão
  if (module !== 'dashboard' && !MNAuth.canAccess(module)) {
    showToast('Você não tem acesso a este módulo.', 'error');
    return;
  }

  currentModule = module;

  // Atualiza menu ativo
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-module') === module);
  });

  // Atualiza título
  const titleEl = document.getElementById('topbar-title');
  if (titleEl) titleEl.textContent = MODULE_TITLES[module] || module;

  // Fecha sidebar em mobile
  closeMobileSidebar();

  // Atualiza hash na URL
  window.location.hash = module;

  // Renderiza módulo
  const area = document.getElementById('modules-area');
  if (!area) return;

  area.innerHTML = `<div class="loading"><div><div class="spinner" style="margin:0 auto 12px"></div><p style="color:var(--text-muted)">Carregando módulo...</p></div></div>`;

  try {
    const renderer = MODULE_RENDERERS[module];
    if (renderer) {
      await renderer(area);
    } else {
      area.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🚧</div>
          <h3>Módulo em Desenvolvimento</h3>
          <p>Este módulo estará disponível em breve.</p>
        </div>`;
    }
  } catch (err) {
    console.error(`[Dashboard] Erro ao carregar módulo ${module}:`, err);
    area.innerHTML = `
      <div class="alert alert-error">
        <i class="fas fa-exclamation-circle"></i>
        Erro ao carregar módulo: ${err.message}
      </div>`;
  }
}

// ─────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    sidebar.classList.toggle('mobile-open');
    document.getElementById('sidebar-overlay').classList.toggle('active');
  } else {
    sidebar.classList.toggle('collapsed');
    localStorage.setItem('mn_sidebar_collapsed', sidebar.classList.contains('collapsed'));
  }
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.remove('mobile-open');
  const overlay = document.getElementById('sidebar-overlay');
  if (overlay) overlay.classList.remove('active');
}

// ─────────────────────────────────────────────────────────────
// INICIALIZAÇÃO
// ─────────────────────────────────────────────────────────────

async function initDashboard() {
  // Inicializa autenticação
  const user = await MNAuth.init();
  if (!user) return; // Redirecionado para login

  // Aplica estado da sidebar
  const sidebarCollapsed = localStorage.getItem('mn_sidebar_collapsed') === 'true';
  if (sidebarCollapsed) {
    document.getElementById('sidebar').classList.add('collapsed');
  }

  // Aplica permissões nos itens do menu
  MNAuth.applyPermissions();

  // Navega para o módulo inicial (hash ou dashboard)
  const hash = window.location.hash.replace('#', '');
  const initialModule = hash && MODULE_RENDERERS[hash] ? hash : 'dashboard';
  await navigateTo(initialModule);

  // Listener de mudança de hash
  window.addEventListener('hashchange', () => {
    const newHash = window.location.hash.replace('#', '');
    if (newHash && newHash !== currentModule && MODULE_RENDERERS[newHash]) {
      navigateTo(newHash);
    }
  });

  console.log('[Dashboard] Inicializado como:', MNAuth.getCurrentProfile());
}

// ─────────────────────────────────────────────────────────────
// INICIA
// ─────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', initDashboard);
