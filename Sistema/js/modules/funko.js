/**
 * MN Imperialowls — Módulo Funko Pop MAG
 * Pedidos personalizados com upload de foto
 */

async function renderFunko(container) {
  container.innerHTML = `
    <div class="section-header">
      <div class="section-title">Funko Pop MAG</div>
      <div class="d-flex gap-1">
        <select id="funko-filter" class="form-control" style="width:auto" onchange="filterFunko(this.value)">
          <option value="todos">Todos os pedidos</option>
          <option value="pendente">Pendente</option>
          <option value="em_producao">Em Produção</option>
          <option value="pronto">Pronto</option>
          <option value="entregue">Entregue</option>
        </select>
        ${MNAuth.canEdit('funko') ? `<button class="btn btn-primary btn-sm" onclick="openFunkoForm()"><i class="fas fa-plus"></i> Novo Pedido</button>` : ''}
      </div>
    </div>

    <!-- KPIs -->
    <div class="grid-4" style="gap:12px;margin-bottom:24px">
      <div class="kpi-card"><div class="kpi-icon cyan">🎭</div><div><div class="kpi-value" id="fkpi-total">—</div><div class="kpi-label">Total Pedidos</div></div></div>
      <div class="kpi-card"><div class="kpi-icon amber">⏳</div><div><div class="kpi-value" id="fkpi-pendente">—</div><div class="kpi-label">Pendentes</div></div></div>
      <div class="kpi-card"><div class="kpi-icon purple">🔨</div><div><div class="kpi-value" id="fkpi-producao">—</div><div class="kpi-label">Em Produção</div></div></div>
      <div class="kpi-card"><div class="kpi-icon green">✅</div><div><div class="kpi-value" id="fkpi-entregue">—</div><div class="kpi-label">Entregues</div></div></div>
    </div>

    <!-- Lista de pedidos -->
    <div id="funko-grid" class="grid-3" style="gap:16px">
      <div class="loading"><div class="spinner"></div></div>
    </div>

    <!-- Modal Novo Pedido -->
    <div class="modal-overlay" id="modal-funko">
      <div class="modal" style="max-width:700px">
        <div class="modal-header">
          <div class="modal-title">🎭 Novo Pedido Funko MAG</div>
          <button class="modal-close" onclick="closeModal('modal-funko')">&times;</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="funko-id">

          <!-- Upload de Foto -->
          <div class="form-group">
            <label class="form-label">📷 Foto do Cliente *</label>
            <div id="foto-drop-area" style="border:2px dashed var(--border);border-radius:var(--radius-md);padding:24px;text-align:center;cursor:pointer;transition:var(--transition)" onclick="document.getElementById('funko-foto-input').click()" ondragover="fotoDragOver(event)" ondrop="fotoDrop(event)">
              <img id="funko-foto-preview" src="" style="max-width:160px;max-height:160px;border-radius:var(--radius-sm);display:none;margin:0 auto 12px">
              <div id="foto-placeholder">
                <i class="fas fa-camera" style="font-size:2rem;color:var(--text-muted);margin-bottom:8px"></i>
                <p style="color:var(--text-muted);font-size:0.85rem">Clique ou arraste a foto aqui</p>
                <p style="color:var(--text-muted);font-size:0.75rem">JPG, PNG • Máx 5MB</p>
              </div>
            </div>
            <input type="file" id="funko-foto-input" accept="image/*" style="display:none" onchange="handleFotoUpload(event)">
          </div>

          <!-- Dados do Cliente -->
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Nome Completo *</label>
              <input type="text" id="funko-nome" class="form-control" placeholder="Nome completo do cliente">
            </div>
            <div class="form-group">
              <label class="form-label">WhatsApp / Contato</label>
              <input type="text" id="funko-contato" class="form-control" placeholder="(11) 99999-9999">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">E-mail</label>
            <input type="email" id="funko-email" class="form-control" placeholder="cliente@email.com">
          </div>

          <!-- Personalização -->
          <div style="margin:16px 0;padding:16px;background:var(--bg-hover);border-radius:var(--radius-sm)">
            <div style="font-weight:700;margin-bottom:12px;color:var(--cyan)">🎨 Personalização</div>
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Camisa do Projeto</label>
                <select id="funko-camisa" class="form-control">
                  <option value="">Selecionar...</option>
                  <option value="home">Camisa Principal (Home)</option>
                  <option value="away">Camisa Alternativa (Away)</option>
                  <option value="treino">Camisa de Treino</option>
                  <option value="especial">Edição Especial</option>
                  <option value="personalizada">Personalizada (descrever)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Número na Camisa</label>
                <input type="number" id="funko-numero" class="form-control" placeholder="Ex: 10" min="1" max="99">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Tipo de Produto *</label>
              <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:6px">
                <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
                  <input type="radio" name="funko-tipo" value="chaveiro" id="tipo-chaveiro">
                  <span>🔑 Chaveiro</span>
                </label>
                <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
                  <input type="radio" name="funko-tipo" value="bancada" id="tipo-bancada">
                  <span>🖥️ Ornamento de Bancada</span>
                </label>
                <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
                  <input type="radio" name="funko-tipo" value="ambos" id="tipo-ambos">
                  <span>✨ Ambos</span>
                </label>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Pose / Expressão</label>
              <input type="text" id="funko-pose" class="form-control" placeholder="Ex: braços cruzados, sorrindo, com bola...">
            </div>
            <div class="form-group">
              <label class="form-label">Acessórios / Itens Extras</label>
              <input type="text" id="funko-acessorios" class="form-control" placeholder="Ex: bola, medalha, troféu...">
            </div>
            <div class="form-group">
              <label class="form-label">Observações e Detalhes Especiais</label>
              <textarea id="funko-obs" class="form-control" placeholder="Descreva todos os detalhes que fazem este Funko único..."></textarea>
            </div>
          </div>

          <!-- Pedido -->
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Valor (R$)</label>
              <input type="number" id="funko-valor" class="form-control" placeholder="0,00" step="0.01" min="0">
            </div>
            <div class="form-group">
              <label class="form-label">Prazo de Entrega</label>
              <input type="date" id="funko-prazo" class="form-control">
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('modal-funko')">Cancelar</button>
          <button class="btn btn-primary" onclick="saveFunko()"><i class="fas fa-save"></i> Salvar Pedido</button>
        </div>
      </div>
    </div>

    <!-- Modal Detalhes Pedido -->
    <div class="modal-overlay" id="modal-funko-detail">
      <div class="modal" style="max-width:600px">
        <div class="modal-header">
          <div class="modal-title">🎭 Detalhes do Pedido</div>
          <button class="modal-close" onclick="closeModal('modal-funko-detail')">&times;</button>
        </div>
        <div class="modal-body" id="funko-detail-body"></div>
        <div class="modal-footer" id="funko-detail-footer"></div>
      </div>
    </div>
  `;

  loadFunkos();
}

let allFunkos = [];
let funkoFotoUrl = '';

async function loadFunkos() {
  try {
    allFunkos = await SupaDB.list('pedidos_funko', { sort: 'created_at' });
    renderFunkosGrid(allFunkos);
    updateFunkoKPIs(allFunkos);
  } catch (e) {
    document.getElementById('funko-grid').innerHTML = `<p class="text-muted">Configure o Supabase para carregar pedidos.</p>`;
  }
}

function updateFunkoKPIs(pedidos) {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('fkpi-total', pedidos.length);
  set('fkpi-pendente', pedidos.filter(p => p.status === 'pendente').length);
  set('fkpi-producao', pedidos.filter(p => p.status === 'em_producao').length);
  set('fkpi-entregue', pedidos.filter(p => p.status === 'entregue').length);
}

const STATUS_BADGE = {
  pendente:    'badge-amber',
  em_producao: 'badge-purple',
  pronto:      'badge-cyan',
  entregue:    'badge-green'
};
const STATUS_LABEL = {
  pendente: '⏳ Pendente', em_producao: '🔨 Em Produção', pronto: '✅ Pronto', entregue: '📦 Entregue'
};
const TIPO_LABEL = { chaveiro: '🔑 Chaveiro', bancada: '🖥️ Bancada', ambos: '✨ Ambos' };

function renderFunkosGrid(pedidos) {
  const grid = document.getElementById('funko-grid');
  if (!grid) return;

  if (pedidos.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1">${MNUtils.renderEmpty('🎭', 'Nenhum pedido', 'Clique em "Novo Pedido" para começar.')}</div>`;
    return;
  }

  grid.innerHTML = pedidos.map(p => `
    <div class="card" style="cursor:pointer" onclick='viewFunko(${JSON.stringify(p).replace(/'/g,"\\'")} )'>
      ${p.foto_url ? `<img src="${p.foto_url}" style="width:100%;height:140px;object-fit:cover;border-radius:var(--radius-sm);margin-bottom:12px">` : `<div style="height:80px;background:var(--bg-hover);border-radius:var(--radius-sm);margin-bottom:12px;display:flex;align-items:center;justify-content:center;font-size:2.5rem">🎭</div>`}
      <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px">
        <div style="font-weight:700">${p.nome_cliente || '—'}</div>
        <span class="badge ${STATUS_BADGE[p.status] || 'badge-gray'}">${STATUS_LABEL[p.status] || p.status}</span>
      </div>
      <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:4px">${TIPO_LABEL[p.tipo] || p.tipo || '—'}</div>
      ${p.camisa ? `<div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:4px">👕 ${p.camisa}${p.numero ? ` #${p.numero}` : ''}</div>` : ''}
      ${p.prazo ? `<div style="font-size:0.75rem;color:var(--text-muted)">📅 Prazo: ${MNUtils.formatDate(p.prazo)}</div>` : ''}
      ${p.valor ? `<div style="font-size:0.9rem;font-weight:700;color:var(--cyan);margin-top:8px">${MNUtils.formatCurrency(p.valor)}</div>` : ''}
    </div>
  `).join('');
}

function filterFunko(status) {
  const filtered = status === 'todos' ? allFunkos : allFunkos.filter(p => p.status === status);
  renderFunkosGrid(filtered);
}

function openFunkoForm() {
  funkoFotoUrl = '';
  const preview = document.getElementById('funko-foto-preview');
  if (preview) { preview.src = ''; preview.style.display = 'none'; }
  const placeholder = document.getElementById('foto-placeholder');
  if (placeholder) placeholder.style.display = 'block';

  ['funko-id','funko-nome','funko-contato','funko-email','funko-pose','funko-acessorios','funko-obs','funko-valor','funko-prazo','funko-numero'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  ['funko-camisa'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.selectedIndex = 0;
  });
  document.querySelectorAll('[name="funko-tipo"]').forEach(r => r.checked = false);

  openModal('modal-funko');
}

function handleFotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const preview = document.getElementById('funko-foto-preview');
    if (preview) { preview.src = e.target.result; preview.style.display = 'block'; }
    const placeholder = document.getElementById('foto-placeholder');
    if (placeholder) placeholder.style.display = 'none';

    // Tenta upload no Supabase Storage
    if (typeof SupaStorage !== 'undefined') {
      try {
        const path = `funko/${Date.now()}_${file.name.replace(/\s+/g,'_')}`;
        funkoFotoUrl = await SupaStorage.upload('fotos', path, file);
      } catch (err) {
        funkoFotoUrl = e.target.result; // fallback base64
      }
    } else {
      funkoFotoUrl = e.target.result;
    }
  };
  reader.readAsDataURL(file);
}

function fotoDragOver(e) {
  e.preventDefault();
  document.getElementById('foto-drop-area').style.borderColor = 'var(--cyan)';
}

function fotoDrop(e) {
  e.preventDefault();
  document.getElementById('foto-drop-area').style.borderColor = 'var(--border)';
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    const dt = new DataTransfer();
    dt.items.add(file);
    document.getElementById('funko-foto-input').files = dt.files;
    handleFotoUpload({ target: { files: [file] } });
  }
}

async function saveFunko() {
  const nome = document.getElementById('funko-nome').value.trim();
  if (!nome) { showToast('Nome do cliente obrigatório.', 'error'); return; }

  const tipoEl = document.querySelector('[name="funko-tipo"]:checked');
  if (!tipoEl) { showToast('Selecione o tipo de produto.', 'error'); return; }

  const payload = {
    nome_cliente: nome,
    contato: document.getElementById('funko-contato').value,
    email: document.getElementById('funko-email').value,
    camisa: document.getElementById('funko-camisa').value,
    numero: parseInt(document.getElementById('funko-numero').value) || null,
    tipo: tipoEl.value,
    pose: document.getElementById('funko-pose').value,
    acessorios: document.getElementById('funko-acessorios').value,
    observacoes: document.getElementById('funko-obs').value,
    valor: parseFloat(document.getElementById('funko-valor').value) || null,
    prazo: document.getElementById('funko-prazo').value || null,
    foto_url: funkoFotoUrl || null,
    status: 'pendente'
  };

  try {
    await SupaDB.create('pedidos_funko', payload);
    showToast('Pedido registrado com sucesso!', 'success');
    closeModal('modal-funko');
    loadFunkos();
  } catch (e) {
    showToast('Erro: ' + e.message, 'error');
  }
}

function viewFunko(pedido) {
  const body = document.getElementById('funko-detail-body');
  const footer = document.getElementById('funko-detail-footer');
  if (!body) return;

  body.innerHTML = `
    ${pedido.foto_url ? `<img src="${pedido.foto_url}" style="width:100%;max-height:240px;object-fit:contain;border-radius:var(--radius-sm);margin-bottom:16px">` : ''}
    <div class="grid-2" style="gap:12px;margin-bottom:16px">
      <div><strong>Cliente:</strong> ${pedido.nome_cliente}</div>
      <div><strong>Contato:</strong> ${pedido.contato || '—'}</div>
      <div><strong>E-mail:</strong> ${pedido.email || '—'}</div>
      <div><strong>Status:</strong> <span class="badge ${STATUS_BADGE[pedido.status]}">${STATUS_LABEL[pedido.status] || pedido.status}</span></div>
      <div><strong>Tipo:</strong> ${TIPO_LABEL[pedido.tipo] || pedido.tipo || '—'}</div>
      <div><strong>Camisa:</strong> ${pedido.camisa || '—'}${pedido.numero ? ` #${pedido.numero}` : ''}</div>
      <div><strong>Pose:</strong> ${pedido.pose || '—'}</div>
      <div><strong>Acessórios:</strong> ${pedido.acessorios || '—'}</div>
      <div><strong>Valor:</strong> ${pedido.valor ? MNUtils.formatCurrency(pedido.valor) : '—'}</div>
      <div><strong>Prazo:</strong> ${pedido.prazo ? MNUtils.formatDate(pedido.prazo) : '—'}</div>
    </div>
    ${pedido.observacoes ? `<div class="form-group"><label class="form-label">Observações</label><p style="color:var(--text-secondary)">${pedido.observacoes}</p></div>` : ''}

    ${MNAuth.canEdit('funko') ? `
    <div class="form-group" style="margin-top:16px">
      <label class="form-label">Atualizar Status</label>
      <select id="funko-status-update" class="form-control">
        <option value="pendente" ${pedido.status==='pendente'?'selected':''}>⏳ Pendente</option>
        <option value="em_producao" ${pedido.status==='em_producao'?'selected':''}>🔨 Em Produção</option>
        <option value="pronto" ${pedido.status==='pronto'?'selected':''}>✅ Pronto para Retirada</option>
        <option value="entregue" ${pedido.status==='entregue'?'selected':''}>📦 Entregue</option>
      </select>
    </div>
    ` : ''}
  `;

  footer.innerHTML = `
    <button class="btn btn-secondary" onclick="closeModal('modal-funko-detail')">Fechar</button>
    ${MNAuth.canEdit('funko') ? `<button class="btn btn-primary" onclick="updateFunkoStatus('${pedido.id}')"><i class="fas fa-save"></i> Salvar Status</button>` : ''}
    ${MNAuth.canDelete('funko') ? `<button class="btn btn-danger" onclick="deleteFunko('${pedido.id}')"><i class="fas fa-trash"></i> Excluir</button>` : ''}
  `;

  openModal('modal-funko-detail');
}

async function updateFunkoStatus(id) {
  const status = document.getElementById('funko-status-update').value;
  try {
    await SupaDB.update('pedidos_funko', id, { status });
    showToast('Status atualizado!', 'success');
    closeModal('modal-funko-detail');
    loadFunkos();
  } catch (e) {
    showToast('Erro: ' + e.message, 'error');
  }
}

async function deleteFunko(id) {
  confirmAction('Excluir este pedido Funko?', async () => {
    try {
      await SupaDB.delete('pedidos_funko', id);
      showToast('Pedido excluído.', 'success');
      closeModal('modal-funko-detail');
      loadFunkos();
    } catch (e) {
      showToast('Erro: ' + e.message, 'error');
    }
  });
}
