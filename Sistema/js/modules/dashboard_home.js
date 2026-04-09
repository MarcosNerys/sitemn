/**
 * MN Imperialowls — Dashboard Home
 * KPIs, atividade recente e visão geral
 */

async function renderDashboardHome(container) {
  const user = MNAuth.getCurrentUser();
  const profile = MNAuth.getProfileLabel();

  container.innerHTML = `
    <!-- Boas-vindas -->
    <div class="dashboard-welcome">
      <h1>Olá, ${user?.nome || user?.email || 'Usuário'}! 🦉</h1>
      <p>Perfil: <strong style="color:var(--cyan)">${profile}</strong> &nbsp;|&nbsp; ${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
    </div>

    <!-- KPIs -->
    <div class="kpis-grid" id="kpis-grid">
      <div class="kpi-card">
        <div class="kpi-icon cyan">🏃</div>
        <div><div class="kpi-value" id="kpi-atletas">—</div><div class="kpi-label">Atletas Ativos</div></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon green">🛡️</div>
        <div><div class="kpi-value" id="kpi-equipes">—</div><div class="kpi-label">Equipes</div></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon amber">📦</div>
        <div><div class="kpi-value" id="kpi-logistica">—</div><div class="kpi-label">Solicitações Pendentes</div></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon purple">🎭</div>
        <div><div class="kpi-value" id="kpi-funko">—</div><div class="kpi-label">Pedidos Funko</div></div>
      </div>
    </div>

    <!-- Grid Principal -->
    <div class="grid-2">
      <!-- Atividade Recente -->
      <div class="card">
        <div class="card-header">
          <div class="card-title"><i class="fas fa-clock"></i> Atividade Recente</div>
          <span class="badge badge-cyan">Live</span>
        </div>
        <div id="recent-activity">
          <div class="loading"><div class="spinner"></div></div>
        </div>
      </div>

      <!-- Ações Rápidas -->
      <div class="card">
        <div class="card-header">
          <div class="card-title"><i class="fas fa-bolt"></i> Ações Rápidas</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px" id="quick-actions">
          ${buildQuickActions()}
        </div>
      </div>
    </div>

    <!-- Módulos do Sistema -->
    <div class="card mt-3">
      <div class="card-header">
        <div class="card-title"><i class="fas fa-th-large"></i> Módulos do Sistema</div>
      </div>
      <div class="grid-3" style="gap:12px">
        ${buildModuleCards()}
      </div>
    </div>
  `;

  // Carrega KPIs
  loadKPIs();
  loadRecentActivity();
}

function buildQuickActions() {
  const actions = [];

  if (MNAuth.canEdit('atletas')) {
    actions.push(`<button class="btn btn-primary btn-sm" onclick="navigateTo('atletas')"><i class="fas fa-user-plus"></i> Cadastrar Atleta</button>`);
  }
  if (MNAuth.canEdit('logistica')) {
    actions.push(`<button class="btn btn-secondary btn-sm" onclick="navigateTo('logistica')"><i class="fas fa-box"></i> Nova Solicitação</button>`);
  }
  if (MNAuth.canEdit('marketing')) {
    actions.push(`<button class="btn btn-secondary btn-sm" onclick="navigateTo('funko')"><i class="fas fa-magic"></i> Novo Pedido Funko</button>`);
  }
  if (MNAuth.canEdit('competicao')) {
    actions.push(`<button class="btn btn-secondary btn-sm" onclick="navigateTo('competicao')"><i class="fas fa-trophy"></i> Registrar Partida</button>`);
  }
  if (MNAuth.canEdit('revisoes')) {
    actions.push(`<button class="btn btn-secondary btn-sm" onclick="navigateTo('revisoes')"><i class="fas fa-clipboard-check"></i> Nova Revisão</button>`);
  }
  if (MNAuth.isCEOOrAbove()) {
    actions.push(`<button class="btn btn-secondary btn-sm" onclick="navigateTo('site-editor')"><i class="fas fa-globe"></i> Editar Site Público</button>`);
  }

  return actions.length ? actions.join('') : '<p class="text-muted">Bem-vindo ao painel. Use o menu lateral para navegar.</p>';
}

function buildModuleCards() {
  const modules = [
    { id: 'atletas', icon: '🏃', label: 'Atletas', desc: 'CRUD e gamificação' },
    { id: 'equipes', icon: '🛡️', label: 'Equipes', desc: 'Gestão de equipes' },
    { id: 'swot', icon: '⚔️', label: 'SWOT', desc: 'Análise estratégica' },
    { id: 'pdca', icon: '🔄', label: 'PDCA', desc: 'Ciclo de melhoria' },
    { id: 'bsc', icon: '⚖️', label: 'BSC', desc: 'Balanced Scorecard' },
    { id: 'spliss', icon: '📡', label: 'SPLISS', desc: '9 pilares esportivos' },
    { id: 'canvas', icon: '🎨', label: 'Canvas', desc: 'Project Model Canvas' },
    { id: 'pmo', icon: '📊', label: 'PMO', desc: 'Portfólio de projetos' },
    { id: 'logistica', icon: '📦', label: 'Logística', desc: 'Materiais e aprovações' },
    { id: 'competicao', icon: '🏆', label: 'MN Cup', desc: 'Torneios e súmulas' },
    { id: 'marketing', icon: '📣', label: 'Marketing', desc: 'Catálogo e vendas' },
    { id: 'funko', icon: '🎭', label: 'Funko MAG', desc: 'Pedidos personalizados' },
  ];

  return modules
    .filter(m => MNAuth.canAccess(m.id))
    .map(m => `
      <div class="card" style="padding:16px;cursor:pointer;text-align:center" onclick="navigateTo('${m.id}')">
        <div style="font-size:2rem;margin-bottom:8px">${m.icon}</div>
        <div style="font-weight:700;font-size:0.9rem">${m.label}</div>
        <div style="font-size:0.75rem;color:var(--text-muted);margin-top:4px">${m.desc}</div>
      </div>
    `).join('');
}

async function loadKPIs() {
  try {
    const tables = ['atletas', 'equipes', 'logistica_itens', 'pedidos_funko'];
    const [atletas, equipes, logistica, funko] = await Promise.allSettled(
      tables.map(t => SupaDB.list(t).catch(() => []))
    );

    const atletasData = atletas.value || [];
    const equipesData = equipes.value || [];
    const logisticaData = (logistica.value || []).filter(i => i.status === 'pending');
    const funkoData = funko.value || [];

    document.getElementById('kpi-atletas').textContent = atletasData.filter(a => a.ativo !== false).length;
    document.getElementById('kpi-equipes').textContent = equipesData.length;
    document.getElementById('kpi-logistica').textContent = logisticaData.length;
    document.getElementById('kpi-funko').textContent = funkoData.filter(f => f.status !== 'entregue').length;
  } catch (e) {
    ['kpi-atletas','kpi-equipes','kpi-logistica','kpi-funko'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '—';
    });
  }
}

async function loadRecentActivity() {
  const el = document.getElementById('recent-activity');
  if (!el) return;

  try {
    // Busca últimas entradas de diferentes tabelas
    const [atletas, pedidos, logistica] = await Promise.allSettled([
      SupaDB.list('atletas', { limit: 3, sort: 'created_at' }),
      SupaDB.list('pedidos_funko', { limit: 3, sort: 'created_at' }),
      SupaDB.list('logistica_itens', { limit: 3, sort: 'created_at' })
    ]);

    const items = [];

    (atletas.value || []).forEach(a => items.push({
      icon: '🏃', label: `Atleta cadastrado: ${a.nome || 'N/A'}`,
      time: a.created_at, color: 'cyan'
    }));

    (pedidos.value || []).forEach(p => items.push({
      icon: '🎭', label: `Pedido Funko: ${p.nome_cliente || 'N/A'}`,
      time: p.created_at, color: 'purple'
    }));

    (logistica.value || []).forEach(l => items.push({
      icon: '📦', label: `Solicitação: ${l.item || 'N/A'}`,
      time: l.created_at, color: 'amber'
    }));

    items.sort((a, b) => new Date(b.time) - new Date(a.time));
    const recent = items.slice(0, 6);

    if (recent.length === 0) {
      el.innerHTML = `<div class="empty-state" style="padding:24px"><div class="empty-icon">📭</div><p>Nenhuma atividade recente.</p></div>`;
      return;
    }

    el.innerHTML = recent.map(item => `
      <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
        <div style="font-size:1.2rem">${item.icon}</div>
        <div style="flex:1">
          <div style="font-size:0.85rem;font-weight:500">${item.label}</div>
          <div style="font-size:0.75rem;color:var(--text-muted)">${MNUtils.timeAgo(item.time)}</div>
        </div>
      </div>
    `).join('');
  } catch (e) {
    el.innerHTML = `<p class="text-muted" style="padding:16px;text-align:center">Conecte o Supabase para ver atividades.</p>`;
  }
}
