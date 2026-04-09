/**
 * MN Imperialowls — Módulo Marketing & Vendas
 * Catálogo, vendas, campanhas, relatórios
 */

async function renderMarketing(container) {
  container.innerHTML = `
    <div class="section-header">
      <div class="section-title">📣 Marketing & Vendas</div>
    </div>

    <div class="tabs-wrapper">
      <div class="tabs">
        <button class="tab-btn active" onclick="switchTab(this,'tab-mkt-catalogo')">🛒 Catálogo</button>
        <button class="tab-btn" onclick="switchTab(this,'tab-mkt-vendas');loadVendas()">💳 Vendas</button>
        <button class="tab-btn" onclick="switchTab(this,'tab-mkt-campanhas')">📢 Campanhas</button>
        <button class="tab-btn" onclick="switchTab(this,'tab-mkt-relatorios');loadRelatorios()">📊 Relatórios</button>
      </div>

      <!-- Catálogo -->
      <div id="tab-mkt-catalogo" class="tab-pane active">
        <div style="display:flex;align-items:center;justify-content:space-between;margin:16px 0">
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-secondary btn-sm active" onclick="filterCatalogo('todos',this)">Todos</button>
            <button class="btn btn-secondary btn-sm" onclick="filterCatalogo('camisas',this)">👕 Camisas</button>
            <button class="btn btn-secondary btn-sm" onclick="filterCatalogo('acessorios',this)">🎽 Acessórios</button>
            <button class="btn btn-secondary btn-sm" onclick="filterCatalogo('funko',this)">🎭 Funko</button>
            <button class="btn btn-secondary btn-sm" onclick="filterCatalogo('outros',this)">📦 Outros</button>
          </div>
          ${MNAuth.canEdit('marketing') ? `<button class="btn btn-primary btn-sm" onclick="openProdutoForm()"><i class="fas fa-plus"></i> Produto</button>` : ''}
        </div>
        <div id="produtos-grid" class="grid-4" style="gap:16px">
          <div class="loading"><div class="spinner"></div></div>
        </div>
      </div>

      <!-- Vendas -->
      <div id="tab-mkt-vendas" class="tab-pane">
        <div style="margin:16px 0;display:flex;justify-content:space-between;align-items:center">
          <h3 style="font-size:1rem">Registrar Venda</h3>
        </div>
        <div class="card" style="margin-bottom:16px">
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Produto</label>
              <select id="venda-produto" class="form-control" onchange="updateVendaPreco()">
                <option value="">Selecionar produto...</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Quantidade</label>
              <input type="number" id="venda-qtd" class="form-control" value="1" min="1" oninput="calcVendaTotal()">
            </div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Valor Unitário</label>
              <input type="number" id="venda-preco" class="form-control" step="0.01" oninput="calcVendaTotal()">
            </div>
            <div class="form-group">
              <label class="form-label">Total</label>
              <input type="text" id="venda-total" class="form-control" readonly placeholder="R$ 0,00" style="background:var(--bg-hover);font-weight:700;color:var(--cyan)">
            </div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Cliente</label>
              <input type="text" id="venda-cliente" class="form-control" placeholder="Nome do cliente">
            </div>
            <div class="form-group">
              <label class="form-label">Forma de Pagamento</label>
              <select id="venda-pagamento" class="form-control">
                <option value="pix">Pix</option>
                <option value="credito">Cartão Crédito</option>
                <option value="debito">Cartão Débito</option>
                <option value="dinheiro">Dinheiro</option>
              </select>
            </div>
          </div>
          <button class="btn btn-primary" onclick="registrarVenda()"><i class="fas fa-cash-register"></i> Registrar Venda</button>
        </div>
        <div id="vendas-list">
          <div class="loading"><div class="spinner"></div></div>
        </div>
      </div>

      <!-- Campanhas -->
      <div id="tab-mkt-campanhas" class="tab-pane">
        <div style="margin:16px 0;display:flex;justify-content:space-between;align-items:center">
          <h3 style="font-size:1rem">Campanhas</h3>
          ${MNAuth.canEdit('marketing') ? `<button class="btn btn-primary btn-sm" onclick="openCampanhaForm()"><i class="fas fa-plus"></i> Nova Campanha</button>` : ''}
        </div>
        <div id="campanhas-list">
          <div class="loading"><div class="spinner"></div></div>
        </div>
      </div>

      <!-- Relatórios -->
      <div id="tab-mkt-relatorios" class="tab-pane">
        <div id="relatorios-content" style="margin-top:16px">
          <div class="loading"><div class="spinner"></div></div>
        </div>
      </div>
    </div>

    <!-- Modal Produto -->
    <div class="modal-overlay" id="modal-produto">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title" id="modal-produto-title">Novo Produto</div>
          <button class="modal-close" onclick="closeModal('modal-produto')">&times;</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="produto-id">
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Nome do Produto *</label>
              <input type="text" id="produto-nome" class="form-control" placeholder="Nome do produto">
            </div>
            <div class="form-group">
              <label class="form-label">Categoria</label>
              <select id="produto-cat" class="form-control">
                <option value="camisas">👕 Camisas</option>
                <option value="acessorios">🎽 Acessórios</option>
                <option value="funko">🎭 Funko</option>
                <option value="outros">📦 Outros</option>
              </select>
            </div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Preço (R$)</label>
              <input type="number" id="produto-preco" class="form-control" step="0.01" min="0" placeholder="0,00">
            </div>
            <div class="form-group">
              <label class="form-label">Estoque</label>
              <input type="number" id="produto-estoque" class="form-control" min="0" placeholder="0">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Descrição</label>
            <textarea id="produto-desc" class="form-control" placeholder="Descrição do produto..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('modal-produto')">Cancelar</button>
          <button class="btn btn-primary" onclick="saveProduto()"><i class="fas fa-save"></i> Salvar</button>
        </div>
      </div>
    </div>
  `;

  loadProdutos();
  loadCampanhas();
}

let allProdutos = [];

async function loadProdutos() {
  try {
    allProdutos = await SupaDB.list('produtos', { sort: 'nome' });
    renderProdutosGrid(allProdutos);
    updateVendasProdutosSelect(allProdutos);
  } catch (e) {
    const grid = document.getElementById('produtos-grid');
    if (grid) grid.innerHTML = `<div style="grid-column:1/-1"><p class="text-muted">Configure o Supabase para carregar produtos.</p></div>`;
  }
}

function renderProdutosGrid(produtos) {
  const grid = document.getElementById('produtos-grid');
  if (!grid) return;

  if (produtos.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1">${MNUtils.renderEmpty('🛒', 'Nenhum produto', 'Adicione produtos ao catálogo.')}</div>`;
    return;
  }

  const catIcon = { camisas:'👕', acessorios:'🎽', funko:'🎭', outros:'📦' };
  grid.innerHTML = produtos.map(p => `
    <div class="card" style="text-align:center">
      <div style="font-size:2.5rem;margin-bottom:10px">${catIcon[p.categoria] || '📦'}</div>
      <div style="font-weight:700;margin-bottom:4px">${p.nome}</div>
      <div style="font-size:1.1rem;font-weight:800;color:var(--cyan);margin-bottom:8px">${MNUtils.formatCurrency(p.preco || 0)}</div>
      ${p.estoque !== null ? `<div class="badge ${p.estoque > 0 ? 'badge-green' : 'badge-red'} mb-1">Estoque: ${p.estoque || 0}</div>` : ''}
      ${p.descricao ? `<p style="font-size:0.75rem;color:var(--text-muted);margin-top:8px">${p.descricao.substring(0,60)}</p>` : ''}
      ${MNAuth.canEdit('marketing') ? `
        <div style="display:flex;gap:6px;justify-content:center;margin-top:12px">
          <button class="btn btn-secondary btn-sm" onclick='editProduto(${JSON.stringify(p).replace(/'/g,"\\'")})'><i class="fas fa-edit"></i></button>
          ${MNAuth.canDelete('marketing') ? `<button class="btn btn-danger btn-sm" onclick="deleteProduto('${p.id}','${p.nome}')"><i class="fas fa-trash"></i></button>` : ''}
        </div>
      ` : ''}
    </div>
  `).join('');
}

function filterCatalogo(cat, btn) {
  document.querySelectorAll('#tab-mkt-catalogo .btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const filtered = cat === 'todos' ? allProdutos : allProdutos.filter(p => p.categoria === cat);
  renderProdutosGrid(filtered);
}

function openProdutoForm() {
  document.getElementById('modal-produto-title').textContent = 'Novo Produto';
  ['produto-id','produto-nome','produto-preco','produto-estoque','produto-desc'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  openModal('modal-produto');
}

function editProduto(p) {
  document.getElementById('modal-produto-title').textContent = 'Editar Produto';
  document.getElementById('produto-id').value = p.id || '';
  document.getElementById('produto-nome').value = p.nome || '';
  document.getElementById('produto-cat').value = p.categoria || 'outros';
  document.getElementById('produto-preco').value = p.preco || '';
  document.getElementById('produto-estoque').value = p.estoque || '';
  document.getElementById('produto-desc').value = p.descricao || '';
  openModal('modal-produto');
}

async function saveProduto() {
  const id = document.getElementById('produto-id').value;
  const nome = document.getElementById('produto-nome').value.trim();
  if (!nome) { showToast('Nome obrigatório.', 'error'); return; }
  const payload = {
    nome,
    categoria: document.getElementById('produto-cat').value,
    preco: parseFloat(document.getElementById('produto-preco').value) || 0,
    estoque: parseInt(document.getElementById('produto-estoque').value) || 0,
    descricao: document.getElementById('produto-desc').value,
    ativo: true
  };
  try {
    if (id) await SupaDB.update('produtos', id, payload);
    else await SupaDB.create('produtos', payload);
    showToast(id ? 'Produto atualizado!' : 'Produto criado!', 'success');
    closeModal('modal-produto');
    loadProdutos();
  } catch (e) { showToast('Erro: ' + e.message, 'error'); }
}

async function deleteProduto(id, nome) {
  confirmAction(`Excluir produto "${nome}"?`, async () => {
    try {
      await SupaDB.delete('produtos', id);
      showToast('Produto excluído.', 'success');
      loadProdutos();
    } catch (e) { showToast('Erro: ' + e.message, 'error'); }
  });
}

function updateVendasProdutosSelect(produtos) {
  const sel = document.getElementById('venda-produto');
  if (!sel) return;
  sel.innerHTML = '<option value="">Selecionar produto...</option>';
  produtos.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `${p.nome} — ${MNUtils.formatCurrency(p.preco||0)}`;
    opt.dataset.preco = p.preco || 0;
    sel.appendChild(opt);
  });
}

function updateVendaPreco() {
  const sel = document.getElementById('venda-produto');
  const preco = document.getElementById('venda-preco');
  if (!sel || !preco) return;
  const opt = sel.selectedOptions[0];
  preco.value = opt?.dataset?.preco || '';
  calcVendaTotal();
}

function calcVendaTotal() {
  const qtd = parseFloat(document.getElementById('venda-qtd')?.value) || 0;
  const preco = parseFloat(document.getElementById('venda-preco')?.value) || 0;
  const total = document.getElementById('venda-total');
  if (total) total.value = MNUtils.formatCurrency(qtd * preco);
}

async function registrarVenda() {
  const produtoId = document.getElementById('venda-produto').value;
  const qtd = parseInt(document.getElementById('venda-qtd').value) || 1;
  const preco = parseFloat(document.getElementById('venda-preco').value) || 0;

  if (!produtoId) { showToast('Selecione um produto.', 'error'); return; }

  const produto = allProdutos.find(p => p.id === produtoId);
  const payload = {
    produto_id: produtoId,
    produto_nome: produto?.nome || '',
    quantidade: qtd,
    preco_unit: preco,
    total: qtd * preco,
    cliente: document.getElementById('venda-cliente').value,
    pagamento: document.getElementById('venda-pagamento').value,
    vendedor: MNAuth.getCurrentUser()?.nome || ''
  };

  try {
    await SupaDB.create('vendas', payload);
    showToast(`Venda registrada! Total: ${MNUtils.formatCurrency(payload.total)}`, 'success');
    ['venda-produto','venda-qtd','venda-cliente'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = id === 'venda-qtd' ? '1' : '';
    });
    document.getElementById('venda-total').value = 'R$ 0,00';
    loadVendas();
  } catch (e) { showToast('Erro: ' + e.message, 'error'); }
}

async function loadVendas() {
  const el = document.getElementById('vendas-list');
  if (!el) return;
  try {
    const vendas = await SupaDB.list('vendas', { sort: 'created_at', limit: 20 });
    if (vendas.length === 0) {
      el.innerHTML = MNUtils.renderEmpty('💳', 'Nenhuma venda registrada');
      return;
    }
    el.innerHTML = `<div class="table-wrap"><table>
      <thead><tr><th>Produto</th><th>Qtd</th><th>Valor Unit.</th><th>Total</th><th>Cliente</th><th>Pagamento</th><th>Data</th></tr></thead>
      <tbody>
        ${vendas.map(v => `<tr>
          <td>${v.produto_nome||'—'}</td>
          <td>${v.quantidade}</td>
          <td>${MNUtils.formatCurrency(v.preco_unit)}</td>
          <td style="font-weight:700;color:var(--cyan)">${MNUtils.formatCurrency(v.total)}</td>
          <td>${v.cliente||'—'}</td>
          <td>${v.pagamento||'—'}</td>
          <td>${MNUtils.formatDate(v.created_at)}</td>
        </tr>`).join('')}
      </tbody>
    </table></div>`;
  } catch (e) {
    el.innerHTML = `<p class="text-muted">Configure o Supabase para ver vendas.</p>`;
  }
}

async function loadCampanhas() {
  const el = document.getElementById('campanhas-list');
  if (!el) return;
  try {
    const campanhas = await SupaDB.list('campanhas', { sort: 'created_at' });
    if (campanhas.length === 0) {
      el.innerHTML = MNUtils.renderEmpty('📢', 'Nenhuma campanha');
      return;
    }
    el.innerHTML = `<div class="grid-3" style="gap:16px">
      ${campanhas.map(c => `
        <div class="card">
          <div style="font-weight:700;margin-bottom:6px">${c.titulo}</div>
          <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:10px">${c.descricao||''}</div>
          <span class="badge ${c.ativa ? 'badge-green' : 'badge-gray'}">${c.ativa ? 'Ativa' : 'Encerrada'}</span>
        </div>
      `).join('')}
    </div>`;
  } catch (e) {}
}

function openCampanhaForm() { showToast('Formulário de campanha em desenvolvimento.', 'info'); }

async function loadRelatorios() {
  const el = document.getElementById('relatorios-content');
  if (!el) return;

  try {
    const vendas = await SupaDB.list('vendas', { sort: 'created_at' });
    const total = vendas.reduce((s, v) => s + (v.total || 0), 0);
    const qtd = vendas.reduce((s, v) => s + (v.quantidade || 0), 0);
    const ticket = vendas.length ? total / vendas.length : 0;

    // Agrupa por pagamento
    const pagGroup = {};
    vendas.forEach(v => { pagGroup[v.pagamento] = (pagGroup[v.pagamento] || 0) + (v.total || 0); });

    el.innerHTML = `
      <div class="grid-4" style="gap:12px;margin-bottom:24px">
        <div class="kpi-card"><div class="kpi-icon cyan">💰</div><div><div class="kpi-value">${MNUtils.formatCurrency(total)}</div><div class="kpi-label">Total Vendas</div></div></div>
        <div class="kpi-card"><div class="kpi-icon green">📦</div><div><div class="kpi-value">${qtd}</div><div class="kpi-label">Itens Vendidos</div></div></div>
        <div class="kpi-card"><div class="kpi-icon purple">💳</div><div><div class="kpi-value">${MNUtils.formatCurrency(ticket)}</div><div class="kpi-label">Ticket Médio</div></div></div>
        <div class="kpi-card"><div class="kpi-icon amber">🛒</div><div><div class="kpi-value">${vendas.length}</div><div class="kpi-label">Transações</div></div></div>
      </div>

      <div class="grid-2" style="gap:16px">
        <div class="card">
          <div class="card-title mb-2">💳 Vendas por Pagamento</div>
          ${Object.entries(pagGroup).map(([tipo, valor]) => `
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
              <span>${tipo || '—'}</span>
              <strong style="color:var(--cyan)">${MNUtils.formatCurrency(valor)}</strong>
            </div>
          `).join('') || '<p class="text-muted">Sem dados.</p>'}
        </div>
        <div class="card">
          <div class="card-title mb-2">📈 Últimas Vendas</div>
          ${vendas.slice(0,5).map(v => `
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
              <div>
                <div style="font-size:0.85rem;font-weight:600">${v.produto_nome||'—'}</div>
                <div style="font-size:0.75rem;color:var(--text-muted)">${MNUtils.formatDate(v.created_at)}</div>
              </div>
              <strong style="color:var(--cyan)">${MNUtils.formatCurrency(v.total)}</strong>
            </div>
          `).join('') || '<p class="text-muted">Sem vendas.</p>'}
        </div>
      </div>
    `;
  } catch (e) {
    el.innerHTML = `<p class="text-muted">Configure o Supabase para ver relatórios.</p>`;
  }
}
