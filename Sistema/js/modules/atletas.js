/**
 * MN Imperialowls — Módulo Atletas & Equipes
 * CRUD completo, gamificação, uniformes
 */

const NIVEIS = ['Novato','Iniciante','Intermediário','Avançado','Expert','Veterano','Elite','Lenda','Mestre','Imperialowl'];

// ─────────────────────────────────────────────────────────────
// ATLETAS
// ─────────────────────────────────────────────────────────────

async function renderAtletas(container) {
  container.innerHTML = `
    <div class="section-header">
      <div class="section-title">Atletas</div>
      <div class="d-flex gap-1">
        <div class="search-bar" style="max-width:280px">
          <i class="fas fa-search"></i>
          <input type="text" id="search-atletas" placeholder="Buscar atleta...">
        </div>
        ${MNAuth.canEdit('atletas') ? `<button class="btn btn-primary btn-sm" onclick="openAtletaForm()"><i class="fas fa-plus"></i> Novo Atleta</button>` : ''}
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-wrapper">
      <div class="tabs">
        <button class="tab-btn active" data-tab="lista" onclick="switchTab(this,'tab-atletas-lista')">🏃 Lista de Atletas</button>
        <button class="tab-btn" data-tab="ranking" onclick="switchTab(this,'tab-atletas-ranking')">🏆 Ranking XP</button>
        <button class="tab-btn" data-tab="uniformes" onclick="switchTab(this,'tab-atletas-uniformes')">👕 Uniformes</button>
      </div>

      <div id="tab-atletas-lista" class="tab-pane active">
        <div id="atletas-grid" class="grid-3" style="gap:16px;margin-top:16px">
          <div class="loading"><div class="spinner"></div></div>
        </div>
      </div>

      <div id="tab-atletas-ranking" class="tab-pane">
        <div id="ranking-list" style="margin-top:16px">
          <div class="loading"><div class="spinner"></div></div>
        </div>
      </div>

      <div id="tab-atletas-uniformes" class="tab-pane">
        <div id="uniformes-content" style="margin-top:16px">
          <div class="loading"><div class="spinner"></div></div>
        </div>
      </div>
    </div>

    <!-- Modal Atleta -->
    <div class="modal-overlay" id="modal-atleta">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title" id="modal-atleta-title">Novo Atleta</div>
          <button class="modal-close" onclick="closeModal('modal-atleta')">&times;</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="atleta-id">
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Nome Completo *</label>
              <input type="text" id="atleta-nome" class="form-control" placeholder="Nome do atleta">
            </div>
            <div class="form-group">
              <label class="form-label">Data de Nascimento</label>
              <input type="date" id="atleta-nasc" class="form-control">
            </div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Equipe</label>
              <select id="atleta-equipe" class="form-control">
                <option value="">Selecionar equipe...</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Posição / Modalidade</label>
              <input type="text" id="atleta-posicao" class="form-control" placeholder="Ex: Atacante, Libero...">
            </div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Contato / WhatsApp</label>
              <input type="text" id="atleta-contato" class="form-control" placeholder="(11) 99999-9999">
            </div>
            <div class="form-group">
              <label class="form-label">E-mail</label>
              <input type="email" id="atleta-email" class="form-control" placeholder="atleta@email.com">
            </div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Cidade</label>
              <input type="text" id="atleta-cidade" class="form-control" placeholder="Cidade">
            </div>
            <div class="form-group">
              <label class="form-label">Responsável (se menor)</label>
              <input type="text" id="atleta-responsavel" class="form-control" placeholder="Nome do responsável">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Histórico Esportivo</label>
            <textarea id="atleta-historico" class="form-control" placeholder="Experiência anterior, conquistas..."></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Número da Camisa</label>
            <input type="number" id="atleta-camisa" class="form-control" placeholder="Ex: 10" min="1" max="99">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('modal-atleta')">Cancelar</button>
          <button class="btn btn-primary" onclick="saveAtleta()"><i class="fas fa-save"></i> Salvar</button>
        </div>
      </div>
    </div>
  `;

  loadAtletas();

  // Busca em tempo real
  document.getElementById('search-atletas').addEventListener('input', function() {
    filterAtletas(this.value);
  });
}

let allAtletas = [];

async function loadAtletas() {
  try {
    allAtletas = await SupaDB.list('atletas', { sort: 'nome' });
    renderAtletasGrid(allAtletas);
    renderRanking(allAtletas);
    renderUniformes(allAtletas);
    await loadEquipesSelect();
  } catch (e) {
    const grid = document.getElementById('atletas-grid');
    if (grid) grid.innerHTML = `<p class="text-muted">Configure o Supabase para carregar atletas.</p>`;
  }
}

function renderAtletasGrid(atletas) {
  const grid = document.getElementById('atletas-grid');
  if (!grid) return;

  if (atletas.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1">${MNUtils.renderEmpty('🏃', 'Nenhum atleta cadastrado', 'Clique em "Novo Atleta" para começar.')}</div>`;
    return;
  }

  grid.innerHTML = atletas.map(a => {
    const xp = a.xp || 0;
    const nivel = Math.min(Math.floor(xp / 100), 9);
    const pct = (xp % 100);

    return `
    <div class="card" style="position:relative">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
        <div style="width:48px;height:48px;background:var(--cyan-glow);border:2px solid var(--cyan);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.3rem;font-weight:700;color:var(--cyan)">
          ${(a.nome || 'A').charAt(0).toUpperCase()}
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${a.nome || 'Sem nome'}</div>
          <div style="font-size:0.75rem;color:var(--text-muted)">${a.posicao || 'Posição não definida'}</div>
        </div>
        ${a.camisa ? `<div class="badge badge-cyan">#${a.camisa}</div>` : ''}
      </div>

      <div style="margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--text-muted);margin-bottom:4px">
          <span>${NIVEIS[nivel]}</span>
          <span>${xp} XP</span>
        </div>
        <div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:var(--cyan);border-radius:3px;transition:width 0.5s"></div>
        </div>
      </div>

      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">
        ${a.equipe_nome ? `<span class="badge badge-gray"><i class="fas fa-shield-alt"></i> ${a.equipe_nome}</span>` : ''}
        ${a.cidade ? `<span class="badge badge-gray"><i class="fas fa-map-marker-alt"></i> ${a.cidade}</span>` : ''}
      </div>

      <div style="display:flex;gap:6px">
        ${MNAuth.canEdit('atletas') ? `
          <button class="btn btn-secondary btn-sm" onclick='editAtleta(${JSON.stringify(a).replace(/'/g,"\\'")})'><i class="fas fa-edit"></i></button>
          <button class="btn btn-secondary btn-sm" onclick="addXP('${a.id}')"><i class="fas fa-star"></i> +XP</button>
        ` : ''}
        ${MNAuth.canDelete('atletas') ? `
          <button class="btn btn-danger btn-sm" onclick="deleteAtleta('${a.id}','${a.nome}')"><i class="fas fa-trash"></i></button>
        ` : ''}
      </div>
    </div>`;
  }).join('');
}

function renderRanking(atletas) {
  const el = document.getElementById('ranking-list');
  if (!el) return;

  const sorted = [...atletas].sort((a, b) => (b.xp || 0) - (a.xp || 0));
  const medals = ['🥇','🥈','🥉'];

  el.innerHTML = `
    <div class="card">
      <div class="card-header"><div class="card-title">🏆 Ranking por XP</div></div>
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>#</th><th>Atleta</th><th>Nível</th><th>XP</th><th>Progresso</th>
          </tr></thead>
          <tbody>
            ${sorted.map((a, i) => {
              const xp = a.xp || 0;
              const nivel = Math.min(Math.floor(xp / 100), 9);
              const pct = xp % 100;
              return `<tr>
                <td>${medals[i] || `#${i+1}`}</td>
                <td><strong>${a.nome || '—'}</strong></td>
                <td><span class="badge badge-cyan">${NIVEIS[nivel]}</span></td>
                <td>${xp} XP</td>
                <td>
                  <div style="display:flex;align-items:center;gap:8px">
                    <div style="flex:1;height:8px;background:var(--border);border-radius:4px;overflow:hidden">
                      <div style="height:100%;width:${pct}%;background:var(--cyan);border-radius:4px"></div>
                    </div>
                    <span style="font-size:0.75rem;color:var(--text-muted);width:32px">${pct}%</span>
                  </div>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

function renderUniformes(atletas) {
  const el = document.getElementById('uniformes-content');
  if (!el) return;

  const comCamisa = atletas.filter(a => a.camisa);
  el.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title">👕 Numeração de Uniformes</div>
        <span class="badge badge-gray">${comCamisa.length} atribuídos</span>
      </div>
      <div class="grid-4" style="gap:12px;margin-top:8px">
        ${comCamisa.sort((a,b) => a.camisa - b.camisa).map(a => `
          <div class="card" style="padding:16px;text-align:center">
            <div style="font-size:2rem;font-weight:800;color:var(--cyan);font-family:'Rajdhani',sans-serif">#${a.camisa}</div>
            <div style="font-size:0.8rem;font-weight:600;margin-top:4px">${a.nome}</div>
            <div style="font-size:0.7rem;color:var(--text-muted)">${a.posicao || '—'}</div>
          </div>
        `).join('')}
        ${comCamisa.length === 0 ? '<p class="text-muted">Nenhum uniforme atribuído ainda.</p>' : ''}
      </div>
    </div>`;
}

function filterAtletas(query) {
  const q = query.toLowerCase().trim();
  const filtered = q ? allAtletas.filter(a =>
    (a.nome || '').toLowerCase().includes(q) ||
    (a.posicao || '').toLowerCase().includes(q) ||
    (a.cidade || '').toLowerCase().includes(q)
  ) : allAtletas;
  renderAtletasGrid(filtered);
}

async function loadEquipesSelect() {
  try {
    const equipes = await SupaDB.list('equipes', { sort: 'nome_equipe' });
    const sel = document.getElementById('atleta-equipe');
    if (!sel) return;
    equipes.forEach(e => {
      const opt = document.createElement('option');
      opt.value = e.id;
      opt.textContent = e.nome_equipe;
      sel.appendChild(opt);
    });
  } catch (e) {}
}

function openAtletaForm(atleta = null) {
  const title = document.getElementById('modal-atleta-title');
  if (title) title.textContent = atleta ? 'Editar Atleta' : 'Novo Atleta';

  ['atleta-id','atleta-nome','atleta-nasc','atleta-posicao','atleta-contato',
   'atleta-email','atleta-cidade','atleta-responsavel','atleta-historico','atleta-camisa'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  if (atleta) {
    document.getElementById('atleta-id').value = atleta.id || '';
    document.getElementById('atleta-nome').value = atleta.nome || '';
    document.getElementById('atleta-nasc').value = atleta.data_nasc || '';
    document.getElementById('atleta-posicao').value = atleta.posicao || '';
    document.getElementById('atleta-contato').value = atleta.contato || '';
    document.getElementById('atleta-email').value = atleta.email || '';
    document.getElementById('atleta-cidade').value = atleta.cidade || '';
    document.getElementById('atleta-responsavel').value = atleta.responsavel || '';
    document.getElementById('atleta-historico').value = atleta.historico || '';
    document.getElementById('atleta-camisa').value = atleta.camisa || '';
    const sel = document.getElementById('atleta-equipe');
    if (sel) sel.value = atleta.equipe_id || '';
  }

  openModal('modal-atleta');
}

function editAtleta(atleta) {
  openAtletaForm(atleta);
}

async function saveAtleta() {
  const id = document.getElementById('atleta-id').value;
  const nome = document.getElementById('atleta-nome').value.trim();

  if (!nome) { showToast('Nome obrigatório.', 'error'); return; }

  const equipeEl = document.getElementById('atleta-equipe');
  const equipeId = equipeEl?.value || '';
  const equipeNome = equipeEl?.selectedOptions[0]?.textContent || '';

  const payload = {
    nome,
    data_nasc: document.getElementById('atleta-nasc').value || null,
    posicao: document.getElementById('atleta-posicao').value,
    contato: document.getElementById('atleta-contato').value,
    email: document.getElementById('atleta-email').value,
    cidade: document.getElementById('atleta-cidade').value,
    responsavel: document.getElementById('atleta-responsavel').value,
    historico: document.getElementById('atleta-historico').value,
    camisa: parseInt(document.getElementById('atleta-camisa').value) || null,
    equipe_id: equipeId || null,
    equipe_nome: equipeId ? equipeNome : null,
    ativo: true
  };

  try {
    if (id) {
      await SupaDB.update('atletas', id, payload);
      showToast('Atleta atualizado!', 'success');
    } else {
      await SupaDB.create('atletas', payload);
      showToast('Atleta cadastrado!', 'success');
    }
    closeModal('modal-atleta');
    loadAtletas();
  } catch (e) {
    showToast('Erro ao salvar: ' + e.message, 'error');
  }
}

async function addXP(id) {
  const atleta = allAtletas.find(a => a.id === id);
  if (!atleta) return;
  const currentXP = atleta.xp || 0;
  const add = parseInt(prompt('Quantos XP adicionar?', '10')) || 0;
  if (add <= 0) return;
  try {
    await SupaDB.update('atletas', id, { xp: currentXP + add });
    showToast(`+${add} XP adicionado!`, 'success');
    loadAtletas();
  } catch (e) {
    showToast('Erro: ' + e.message, 'error');
  }
}

async function deleteAtleta(id, nome) {
  confirmAction(`Excluir atleta "${nome}"? Esta ação não pode ser desfeita.`, async () => {
    try {
      await SupaDB.delete('atletas', id);
      showToast('Atleta excluído.', 'success');
      loadAtletas();
    } catch (e) {
      showToast('Erro ao excluir: ' + e.message, 'error');
    }
  });
}

function switchTab(btn, paneId) {
  const wrapper = btn.closest('.tabs-wrapper');
  wrapper.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  wrapper.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  const pane = document.getElementById(paneId);
  if (pane) pane.classList.add('active');
}

// ─────────────────────────────────────────────────────────────
// EQUIPES
// ─────────────────────────────────────────────────────────────

async function renderEquipes(container) {
  container.innerHTML = `
    <div class="section-header">
      <div class="section-title">Equipes</div>
      ${MNAuth.canEdit('equipes') ? `<button class="btn btn-primary btn-sm" onclick="openEquipeForm()"><i class="fas fa-plus"></i> Nova Equipe</button>` : ''}
    </div>

    <div id="equipes-grid" class="grid-3" style="gap:16px">
      <div class="loading"><div class="spinner"></div></div>
    </div>

    <!-- Modal Equipe -->
    <div class="modal-overlay" id="modal-equipe">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title" id="modal-equipe-title">Nova Equipe</div>
          <button class="modal-close" onclick="closeModal('modal-equipe')">&times;</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="equipe-id">
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Nome da Equipe *</label>
              <input type="text" id="equipe-nome" class="form-control" placeholder="Ex: Imperialowls Sub-17">
            </div>
            <div class="form-group">
              <label class="form-label">Categoria</label>
              <input type="text" id="equipe-categoria" class="form-control" placeholder="Sub-17, Adulto, Feminino...">
            </div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Local de Treino</label>
              <input type="text" id="equipe-local" class="form-control" placeholder="Quadra, ginásio...">
            </div>
            <div class="form-group">
              <label class="form-label">Horários</label>
              <input type="text" id="equipe-horarios" class="form-control" placeholder="Seg/Qua 19h-21h">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Técnico Responsável</label>
            <input type="text" id="equipe-tecnico" class="form-control" placeholder="Nome do técnico">
          </div>
          <div class="form-group">
            <label class="form-label">Descrição</label>
            <textarea id="equipe-desc" class="form-control" placeholder="Sobre a equipe..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('modal-equipe')">Cancelar</button>
          <button class="btn btn-primary" onclick="saveEquipe()"><i class="fas fa-save"></i> Salvar</button>
        </div>
      </div>
    </div>
  `;

  loadEquipes();
}

async function loadEquipes() {
  const grid = document.getElementById('equipes-grid');
  try {
    const equipes = await SupaDB.list('equipes', { sort: 'nome_equipe' });
    if (equipes.length === 0) {
      grid.innerHTML = `<div style="grid-column:1/-1">${MNUtils.renderEmpty('🛡️', 'Nenhuma equipe cadastrada')}</div>`;
      return;
    }

    grid.innerHTML = equipes.map(e => `
      <div class="card">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
          <div style="font-size:2rem">🛡️</div>
          <div>
            <div style="font-weight:700">${e.nome_equipe}</div>
            ${e.categoria ? `<span class="badge badge-cyan">${e.categoria}</span>` : ''}
          </div>
        </div>
        ${e.tecnico ? `<div style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:6px"><i class="fas fa-user-tie"></i> ${e.tecnico}</div>` : ''}
        ${e.local_treino ? `<div style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:6px"><i class="fas fa-map-pin"></i> ${e.local_treino}</div>` : ''}
        ${e.horarios ? `<div style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:12px"><i class="fas fa-clock"></i> ${e.horarios}</div>` : ''}
        <div style="display:flex;gap:6px;margin-top:auto">
          ${MNAuth.canEdit('equipes') ? `<button class="btn btn-secondary btn-sm" onclick='editEquipe(${JSON.stringify(e).replace(/'/g,"\\'")})'><i class="fas fa-edit"></i> Editar</button>` : ''}
          ${MNAuth.canDelete('equipes') ? `<button class="btn btn-danger btn-sm" onclick="deleteEquipe('${e.id}','${e.nome_equipe}')"><i class="fas fa-trash"></i></button>` : ''}
        </div>
      </div>
    `).join('');
  } catch (err) {
    grid.innerHTML = `<p class="text-muted">Erro ao carregar equipes.</p>`;
  }
}

function openEquipeForm(equipe = null) {
  document.getElementById('modal-equipe-title').textContent = equipe ? 'Editar Equipe' : 'Nova Equipe';
  ['equipe-id','equipe-nome','equipe-categoria','equipe-local','equipe-horarios','equipe-tecnico','equipe-desc'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  if (equipe) {
    document.getElementById('equipe-id').value = equipe.id || '';
    document.getElementById('equipe-nome').value = equipe.nome_equipe || '';
    document.getElementById('equipe-categoria').value = equipe.categoria || '';
    document.getElementById('equipe-local').value = equipe.local_treino || '';
    document.getElementById('equipe-horarios').value = equipe.horarios || '';
    document.getElementById('equipe-tecnico').value = equipe.tecnico || '';
    document.getElementById('equipe-desc').value = equipe.descricao || '';
  }
  openModal('modal-equipe');
}

function editEquipe(equipe) { openEquipeForm(equipe); }

async function saveEquipe() {
  const id = document.getElementById('equipe-id').value;
  const nome = document.getElementById('equipe-nome').value.trim();
  if (!nome) { showToast('Nome obrigatório.', 'error'); return; }

  const payload = {
    nome_equipe: nome,
    categoria: document.getElementById('equipe-categoria').value,
    local_treino: document.getElementById('equipe-local').value,
    horarios: document.getElementById('equipe-horarios').value,
    tecnico: document.getElementById('equipe-tecnico').value,
    descricao: document.getElementById('equipe-desc').value,
    ativo: true
  };

  try {
    if (id) {
      await SupaDB.update('equipes', id, payload);
      showToast('Equipe atualizada!', 'success');
    } else {
      await SupaDB.create('equipes', payload);
      showToast('Equipe cadastrada!', 'success');
    }
    closeModal('modal-equipe');
    loadEquipes();
  } catch (e) {
    showToast('Erro: ' + e.message, 'error');
  }
}

async function deleteEquipe(id, nome) {
  confirmAction(`Excluir equipe "${nome}"?`, async () => {
    try {
      await SupaDB.delete('equipes', id);
      showToast('Equipe excluída.', 'success');
      loadEquipes();
    } catch (e) {
      showToast('Erro: ' + e.message, 'error');
    }
  });
}
