/**
 * MN Imperialowls — Módulos de Gestão Estratégica
 * SWOT, PDCA, BSC, SPLISS, Canvas, PMO
 */

// ─────────────────────────────────────────────────────────────
// SWOT
// ─────────────────────────────────────────────────────────────
async function renderSwot(container) {
  let dados = {};
  try {
    const list = await SupaDB.list('gestao_swot', { limit: 1, sort: 'created_at' });
    if (list.length > 0) dados = list[0];
  } catch (e) {}

  const podeEditar = MNAuth.canEdit('swot');

  container.innerHTML = `
    <div class="section-header">
      <div class="section-title">⚔️ Análise SWOT</div>
      ${podeEditar ? `<button class="btn btn-primary btn-sm" onclick="saveSwot()"><i class="fas fa-save"></i> Salvar SWOT</button>` : ''}
    </div>
    <input type="hidden" id="swot-id" value="${dados.id || ''}">
    <div class="grid-2" style="gap:16px">
      ${swotCard('forcas', '💪 Forças', 'badge-green', dados.forcas || '', !podeEditar, 'Pontos fortes internos do projeto...')}
      ${swotCard('fraquezas', '⚠️ Fraquezas', 'badge-amber', dados.fraquezas || '', !podeEditar, 'Pontos a melhorar internamente...')}
      ${swotCard('oportunidades', '🚀 Oportunidades', 'badge-cyan', dados.oportunidades || '', !podeEditar, 'Fatores externos favoráveis...')}
      ${swotCard('ameacas', '🔴 Ameaças', 'badge-red', dados.ameacas || '', !podeEditar, 'Fatores externos desfavoráveis...')}
    </div>
    <div class="grid-2 mt-3" style="gap:16px">
      ${swotCard('estrategia_so', '🎯 Estratégia SO (Forças × Oportunidades)', 'badge-green', dados.estrategia_so || '', !podeEditar)}
      ${swotCard('estrategia_wo', '🛠️ Estratégia WO (Fraquezas × Oportunidades)', 'badge-cyan', dados.estrategia_wo || '', !podeEditar)}
      ${swotCard('estrategia_st', '🛡️ Estratégia ST (Forças × Ameaças)', 'badge-amber', dados.estrategia_st || '', !podeEditar)}
      ${swotCard('estrategia_wt', '⚡ Estratégia WT (Fraquezas × Ameaças)', 'badge-red', dados.estrategia_wt || '', !podeEditar)}
    </div>
  `;
}

function swotCard(field, title, badge, value, readonly, placeholder='') {
  return `
    <div class="card">
      <div class="card-header"><div class="card-title"><span class="badge ${badge}">${title}</span></div></div>
      <textarea id="swot-${field}" class="form-control" style="min-height:120px" ${readonly ? 'readonly' : ''} placeholder="${placeholder}">${value}</textarea>
    </div>`;
}

async function saveSwot() {
  const id = document.getElementById('swot-id').value;
  const payload = {
    forcas: document.getElementById('swot-forcas').value,
    fraquezas: document.getElementById('swot-fraquezas').value,
    oportunidades: document.getElementById('swot-oportunidades').value,
    ameacas: document.getElementById('swot-ameacas').value,
    estrategia_so: document.getElementById('swot-estrategia_so').value,
    estrategia_wo: document.getElementById('swot-estrategia_wo').value,
    estrategia_st: document.getElementById('swot-estrategia_st').value,
    estrategia_wt: document.getElementById('swot-estrategia_wt').value,
    responsavel: MNAuth.getCurrentUser()?.nome || ''
  };
  try {
    if (id) await SupaDB.update('gestao_swot', id, payload);
    else await SupaDB.create('gestao_swot', payload);
    showToast('SWOT salvo!', 'success');
    renderSwot(document.getElementById('modules-area'));
  } catch (e) { showToast('Erro: ' + e.message, 'error'); }
}

// ─────────────────────────────────────────────────────────────
// PDCA
// ─────────────────────────────────────────────────────────────
async function renderPdca(container) {
  let dados = {};
  try {
    const list = await SupaDB.list('gestao_pdca', { limit: 1, sort: 'created_at' });
    if (list.length > 0) dados = list[0];
  } catch (e) {}

  const podeEditar = MNAuth.canEdit('pdca');
  const fases = [
    { id: 'plan', label: '📋 Plan (Planejar)', color: 'var(--accent-blue)', desc: 'O que fazer e como fazer?' },
    { id: 'do',   label: '🔨 Do (Executar)',   color: 'var(--accent-green)', desc: 'Executar o que foi planejado.' },
    { id: 'check',label: '🔍 Check (Verificar)',color: 'var(--accent-amber)', desc: 'Monitorar e avaliar resultados.' },
    { id: 'act',  label: '⚡ Act (Agir)',       color: 'var(--accent-red)', desc: 'Padronizar ou corrigir.' }
  ];

  container.innerHTML = `
    <div class="section-header">
      <div class="section-title">🔄 Ciclo PDCA</div>
      ${podeEditar ? `<button class="btn btn-primary btn-sm" onclick="savePdca()"><i class="fas fa-save"></i> Salvar</button>` : ''}
    </div>
    <input type="hidden" id="pdca-id" value="${dados.id || ''}">

    <!-- Visual do ciclo -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px">
      ${fases.map(f => `
        <div class="card" style="border-left:4px solid ${f.color}">
          <div class="card-header" style="margin-bottom:12px">
            <div class="card-title" style="color:${f.color}">${f.label}</div>
          </div>
          <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:10px">${f.desc}</p>
          <textarea id="pdca-${f.id}" class="form-control" style="min-height:120px" ${podeEditar ? '' : 'readonly'} placeholder="Descreva a fase ${f.label.split(' ')[1]}...">${dados[f.id] || ''}</textarea>
        </div>
      `).join('')}
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">📊 Indicadores de Acompanhamento</div></div>
      <textarea id="pdca-indicadores" class="form-control" style="min-height:100px" ${podeEditar ? '' : 'readonly'} placeholder="KPIs e metas para medir o ciclo...">${dados.indicadores || ''}</textarea>
    </div>
  `;
}

async function savePdca() {
  const id = document.getElementById('pdca-id').value;
  const payload = {
    plan: document.getElementById('pdca-plan').value,
    do: document.getElementById('pdca-do').value,
    check: document.getElementById('pdca-check').value,
    act: document.getElementById('pdca-act').value,
    indicadores: document.getElementById('pdca-indicadores').value
  };
  try {
    if (id) await SupaDB.update('gestao_pdca', id, payload);
    else await SupaDB.create('gestao_pdca', payload);
    showToast('PDCA salvo!', 'success');
  } catch (e) { showToast('Erro: ' + e.message, 'error'); }
}

// ─────────────────────────────────────────────────────────────
// BSC
// ─────────────────────────────────────────────────────────────
async function renderBsc(container) {
  let dados = {};
  try {
    const list = await SupaDB.list('gestao_bsc', { limit: 1 });
    if (list.length > 0) dados = list[0];
  } catch (e) {}

  const podeEditar = MNAuth.canEdit('bsc');
  const perspectivas = [
    { id: 'financeira',   label: '💰 Financeira',  color: '#22c55e', desc: 'Sustentabilidade financeira do projeto' },
    { id: 'clientes',     label: '👥 Clientes/Comunidade', color: '#3b82f6', desc: 'Satisfação e impacto social' },
    { id: 'processos',    label: '⚙️ Processos Internos', color: '#f59e0b', desc: 'Eficiência operacional' },
    { id: 'aprendizado',  label: '📚 Aprendizado e Crescimento', color: '#8b5cf6', desc: 'Capacitação e inovação' }
  ];

  container.innerHTML = `
    <div class="section-header">
      <div class="section-title">⚖️ Balanced Scorecard</div>
      ${podeEditar ? `<button class="btn btn-primary btn-sm" onclick="saveBsc()"><i class="fas fa-save"></i> Salvar BSC</button>` : ''}
    </div>
    <input type="hidden" id="bsc-id" value="${dados.id || ''}">

    <div class="grid-2" style="gap:16px">
      ${perspectivas.map(p => `
        <div class="card" style="border-top:4px solid ${p.color}">
          <div class="card-title" style="color:${p.color};margin-bottom:6px">${p.label}</div>
          <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:12px">${p.desc}</p>
          <div class="grid-2" style="gap:8px;margin-bottom:10px">
            <div class="form-group">
              <label class="form-label">Objetivo</label>
              <input type="text" id="bsc-${p.id}-obj" class="form-control" placeholder="Objetivo estratégico" value="${dados[p.id+'_obj'] || ''}" ${podeEditar ? '' : 'readonly'}>
            </div>
            <div class="form-group">
              <label class="form-label">Meta</label>
              <input type="text" id="bsc-${p.id}-meta" class="form-control" placeholder="Meta numérica" value="${dados[p.id+'_meta'] || ''}" ${podeEditar ? '' : 'readonly'}>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Iniciativas</label>
            <textarea id="bsc-${p.id}-ini" class="form-control" style="min-height:80px" placeholder="Ações para alcançar..." ${podeEditar ? '' : 'readonly'}>${dados[p.id+'_ini'] || ''}</textarea>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

async function saveBsc() {
  const id = document.getElementById('bsc-id').value;
  const perspectivas = ['financeira','clientes','processos','aprendizado'];
  const payload = {};
  perspectivas.forEach(p => {
    payload[p+'_obj'] = document.getElementById(`bsc-${p}-obj`).value;
    payload[p+'_meta'] = document.getElementById(`bsc-${p}-meta`).value;
    payload[p+'_ini'] = document.getElementById(`bsc-${p}-ini`).value;
  });
  try {
    if (id) await SupaDB.update('gestao_bsc', id, payload);
    else await SupaDB.create('gestao_bsc', payload);
    showToast('BSC salvo!', 'success');
  } catch (e) { showToast('Erro: ' + e.message, 'error'); }
}

// ─────────────────────────────────────────────────────────────
// SPLISS
// ─────────────────────────────────────────────────────────────
async function renderSpliss(container) {
  let dados = {};
  try {
    const list = await SupaDB.list('gestao_spliss', { limit: 1 });
    if (list.length > 0) dados = list[0];
  } catch (e) {}

  const podeEditar = MNAuth.canEdit('spliss');
  const pilares = [
    { id: 'p1', label: 'Apoio Financeiro' },
    { id: 'p2', label: 'Governança Esportiva' },
    { id: 'p3', label: 'Participação no Esporte' },
    { id: 'p4', label: 'Detecção de Talentos' },
    { id: 'p5', label: 'Suporte a Atletas de Elite' },
    { id: 'p6', label: 'Instalações Esportivas' },
    { id: 'p7', label: 'Desenvolvimento Técnico' },
    { id: 'p8', label: 'Competições Nacionais/Internacionais' },
    { id: 'p9', label: 'Pesquisa e Inovação' }
  ];

  container.innerHTML = `
    <div class="section-header">
      <div class="section-title">📡 SPLISS — 9 Pilares</div>
      ${podeEditar ? `<button class="btn btn-primary btn-sm" onclick="saveSpliss()"><i class="fas fa-save"></i> Salvar</button>` : ''}
    </div>
    <input type="hidden" id="spliss-id" value="${dados.id || ''}">

    <div class="card" style="margin-bottom:24px">
      <div class="card-header"><div class="card-title">📊 Avaliação dos Pilares (0–10)</div></div>
      <div style="display:flex;flex-direction:column;gap:16px;margin-top:8px">
        ${pilares.map((p, i) => {
          const val = dados[p.id] || 5;
          return `
          <div style="display:flex;align-items:center;gap:16px">
            <div style="min-width:28px;color:var(--cyan);font-weight:700">${i+1}</div>
            <div style="flex:1">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                <span style="font-size:0.85rem;font-weight:500">${p.label}</span>
                <span id="spliss-${p.id}-val" style="color:var(--cyan);font-weight:700">${val}</span>
              </div>
              <input type="range" id="spliss-${p.id}" min="0" max="10" value="${val}" style="width:100%;accent-color:var(--cyan)"
                ${podeEditar ? '' : 'disabled'}
                oninput="document.getElementById('spliss-${p.id}-val').textContent=this.value">
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">📝 Observações e Plano de Ação</div></div>
      <textarea id="spliss-obs" class="form-control" style="min-height:120px" ${podeEditar ? '' : 'readonly'} placeholder="Análise dos pilares e plano de melhoria...">${dados.observacoes || ''}</textarea>
    </div>
  `;
}

async function saveSpliss() {
  const id = document.getElementById('spliss-id').value;
  const payload = { observacoes: document.getElementById('spliss-obs').value };
  for (let i = 1; i <= 9; i++) {
    const el = document.getElementById(`spliss-p${i}`);
    if (el) payload[`p${i}`] = parseInt(el.value);
  }
  try {
    if (id) await SupaDB.update('gestao_spliss', id, payload);
    else await SupaDB.create('gestao_spliss', payload);
    showToast('SPLISS salvo!', 'success');
  } catch (e) { showToast('Erro: ' + e.message, 'error'); }
}

// ─────────────────────────────────────────────────────────────
// CANVAS
// ─────────────────────────────────────────────────────────────
async function renderCanvas(container) {
  let dados = {};
  try {
    const list = await SupaDB.list('gestao_canvas', { limit: 1 });
    if (list.length > 0) dados = list[0];
  } catch (e) {}

  const podeEditar = MNAuth.canEdit('canvas');
  const blocos = [
    { id: 'proposta', label: '💎 Proposta de Valor', col: 'span 2' },
    { id: 'segmentos', label: '👥 Segmentos de Clientes', col: 'span 1' },
    { id: 'relacionamento', label: '💬 Relacionamento', col: 'span 1' },
    { id: 'canais', label: '📡 Canais', col: 'span 2' },
    { id: 'atividades', label: '⚙️ Atividades-Chave', col: 'span 1' },
    { id: 'recursos', label: '🏗️ Recursos-Chave', col: 'span 1' },
    { id: 'parceiros', label: '🤝 Parceiros-Chave', col: 'span 2' },
    { id: 'custos', label: '💸 Estrutura de Custos', col: 'span 2' },
    { id: 'receitas', label: '💰 Fontes de Receita', col: 'span 2' }
  ];

  container.innerHTML = `
    <div class="section-header">
      <div class="section-title">🎨 Project Model Canvas</div>
      ${podeEditar ? `<button class="btn btn-primary btn-sm" onclick="saveCanvas()"><i class="fas fa-save"></i> Salvar Canvas</button>` : ''}
    </div>
    <input type="hidden" id="canvas-id" value="${dados.id || ''}">
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">
      ${blocos.map(b => `
        <div class="card" style="grid-column:${b.col};padding:16px">
          <div style="font-weight:700;font-size:0.85rem;color:var(--cyan);margin-bottom:8px">${b.label}</div>
          <textarea id="canvas-${b.id}" class="form-control" style="min-height:100px;font-size:0.8rem" ${podeEditar ? '' : 'readonly'} placeholder="${b.label}...">${dados[b.id] || ''}</textarea>
        </div>
      `).join('')}
    </div>
  `;
}

async function saveCanvas() {
  const id = document.getElementById('canvas-id').value;
  const blocos = ['proposta','segmentos','relacionamento','canais','atividades','recursos','parceiros','custos','receitas'];
  const payload = {};
  blocos.forEach(b => { const el = document.getElementById(`canvas-${b}`); if (el) payload[b] = el.value; });
  try {
    if (id) await SupaDB.update('gestao_canvas', id, payload);
    else await SupaDB.create('gestao_canvas', payload);
    showToast('Canvas salvo!', 'success');
  } catch (e) { showToast('Erro: ' + e.message, 'error'); }
}

// ─────────────────────────────────────────────────────────────
// PMO
// ─────────────────────────────────────────────────────────────
async function renderPmo(container) {
  let projetos = [], riscos = [];
  try {
    [projetos, riscos] = await Promise.all([
      SupaDB.list('pmo_projetos', { sort: 'nome' }),
      SupaDB.list('pmo_riscos', { sort: 'created_at' })
    ]);
  } catch (e) {}

  const podeEditar = MNAuth.canEdit('pmo');

  container.innerHTML = `
    <div class="section-header">
      <div class="section-title">📊 PMO — Gestão de Projetos</div>
      ${podeEditar ? `<button class="btn btn-primary btn-sm" onclick="openPmoProjetoForm()"><i class="fas fa-plus"></i> Novo Projeto</button>` : ''}
    </div>

    <!-- Portfólio -->
    <div class="card mb-3">
      <div class="card-header">
        <div class="card-title">📁 Portfólio de Projetos</div>
        <span class="badge badge-cyan">${projetos.length} projetos</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Projeto</th><th>Responsável</th><th>Status</th><th>Prazo</th><th>Progresso</th></tr></thead>
          <tbody>
            ${projetos.length === 0 ? `<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">Nenhum projeto cadastrado.</td></tr>` :
              projetos.map(p => {
                const statusBadge = { ativo:'badge-green',pausado:'badge-amber',encerrado:'badge-gray',planejamento:'badge-purple' };
                return `<tr>
                  <td><strong>${p.nome}</strong>${p.descricao ? `<br><small style="color:var(--text-muted)">${p.descricao.substring(0,50)}...</small>` : ''}</td>
                  <td>${p.responsavel || '—'}</td>
                  <td><span class="badge ${statusBadge[p.status]||'badge-gray'}">${p.status||'—'}</span></td>
                  <td>${p.prazo ? MNUtils.formatDate(p.prazo) : '—'}</td>
                  <td>
                    <div style="display:flex;align-items:center;gap:8px">
                      <div style="flex:1;height:8px;background:var(--border);border-radius:4px;overflow:hidden">
                        <div style="height:100%;width:${p.progresso||0}%;background:var(--cyan);border-radius:4px"></div>
                      </div>
                      <span style="font-size:0.75rem">${p.progresso||0}%</span>
                    </div>
                  </td>
                </tr>`;
              }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Riscos -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">⚠️ Registro de Riscos</div>
        ${podeEditar ? `<button class="btn btn-secondary btn-sm" onclick="openRiscoForm()"><i class="fas fa-plus"></i> Adicionar Risco</button>` : ''}
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Risco</th><th>Probabilidade</th><th>Impacto</th><th>Mitigação</th></tr></thead>
          <tbody>
            ${riscos.length === 0 ? `<tr><td colspan="4" style="text-align:center;color:var(--text-muted)">Nenhum risco registrado.</td></tr>` :
              riscos.map(r => {
                const prob = { alto:'badge-red',medio:'badge-amber',baixo:'badge-green' };
                return `<tr>
                  <td>${r.descricao}</td>
                  <td><span class="badge ${prob[r.probabilidade]||'badge-gray'}">${r.probabilidade||'—'}</span></td>
                  <td><span class="badge ${prob[r.impacto]||'badge-gray'}">${r.impacto||'—'}</span></td>
                  <td style="font-size:0.8rem">${r.mitigacao||'—'}</td>
                </tr>`;
              }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function openPmoProjetoForm() { showToast('Módulo PMO — cadastro de projetos em desenvolvimento.', 'info'); }
function openRiscoForm() { showToast('Módulo PMO — registro de riscos em desenvolvimento.', 'info'); }

// ─────────────────────────────────────────────────────────────
// PLANEJAMENTO, REVISÕES, ESTATUTO, ORGANOGRAMA, LOGÍSTICA, COMPETIÇÃO
// ─────────────────────────────────────────────────────────────

async function renderPlanejamento(container) {
  renderModuloSimples(container, '📅 Planejamento Anual', 'planejamento_anual', MNAuth.canEdit('planejamento'));
}

async function renderRevisoes(container) {
  container.innerHTML = `
    <div class="section-header"><div class="section-title">📋 Revisões</div></div>
    <div class="tabs">
      <button class="tab-btn active" onclick="loadRevisao('quinzenal',this)">Quinzenal</button>
      <button class="tab-btn" onclick="loadRevisao('mensal',this)">Mensal</button>
      <button class="tab-btn" onclick="loadRevisao('semestral',this)">Semestral</button>
    </div>
    <div id="revisao-content">
      <div class="loading"><div class="spinner"></div></div>
    </div>`;
  loadRevisao('quinzenal', document.querySelector('.tab-btn.active'));
}

async function loadRevisao(tipo, btn) {
  if (btn) {
    btn.closest('.tabs').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  const area = document.getElementById('revisao-content');
  const podeEditar = MNAuth.canEdit('revisoes');
  let dados = {};
  try {
    const list = await SupaDB.list('revisoes', { filters: { tipo }, limit: 1, sort: 'created_at' });
    if (list.length > 0) dados = list[0];
  } catch (e) {}

  area.innerHTML = `
    <div class="card mt-2">
      <div class="card-header">
        <div class="card-title">Revisão ${tipo.charAt(0).toUpperCase()+tipo.slice(1)}</div>
        ${podeEditar ? `<button class="btn btn-primary btn-sm" onclick="saveRevisao('${tipo}','${dados.id||''}')"><i class="fas fa-save"></i> Salvar</button>` : ''}
      </div>
      <div class="form-group">
        <label class="form-label">O que foi realizado</label>
        <textarea id="rev-realizado" class="form-control" ${podeEditar ? '' : 'readonly'} placeholder="Atividades realizadas no período...">${dados.realizado || ''}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Pontos de Melhoria</label>
        <textarea id="rev-melhoria" class="form-control" ${podeEditar ? '' : 'readonly'} placeholder="O que pode ser melhorado...">${dados.pontos_melhoria || ''}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Próximas Ações</label>
        <textarea id="rev-acoes" class="form-control" ${podeEditar ? '' : 'readonly'} placeholder="Ações para o próximo período...">${dados.proximas_acoes || ''}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Status</label>
        <select id="rev-status" class="form-control" ${podeEditar ? '' : 'disabled'}>
          <option value="rascunho" ${dados.status==='rascunho'?'selected':''}>Rascunho</option>
          <option value="aprovado" ${dados.status==='aprovado'?'selected':''}>Aprovado</option>
          <option value="reprovado" ${dados.status==='reprovado'?'selected':''}>Reprovado</option>
        </select>
      </div>
    </div>
  `;
}

async function saveRevisao(tipo, id) {
  const payload = {
    tipo,
    realizado: document.getElementById('rev-realizado').value,
    pontos_melhoria: document.getElementById('rev-melhoria').value,
    proximas_acoes: document.getElementById('rev-acoes').value,
    status: document.getElementById('rev-status').value
  };
  try {
    if (id) await SupaDB.update('revisoes', id, payload);
    else await SupaDB.create('revisoes', payload);
    showToast('Revisão salva!', 'success');
  } catch (e) { showToast('Erro: ' + e.message, 'error'); }
}

async function renderEstatuto(container) {
  renderModuloSimples(container, '📄 Estatuto & Documentos', 'estatuto_docs', MNAuth.canEdit('estatuto'));
}

async function renderOrganograma(container) {
  container.innerHTML = `
    <div class="section-header">
      <div class="section-title">🗂️ Organograma</div>
    </div>
    <div class="card">
      <div style="overflow-x:auto">
        <div style="display:flex;flex-direction:column;align-items:center;gap:32px;padding:32px;min-width:600px">
          ${buildOrgChart()}
        </div>
      </div>
    </div>
  `;
}

function buildOrgChart() {
  const nodes = [
    { titulo: 'Master / Fundador', icon: '👑', nivel: 1, color: 'var(--cyan)' },
    { titulo: 'CEO', icon: '🏢', nivel: 2, color: 'var(--accent-blue)' },
    { titulo: 'Dir. Executivo', icon: '📋', nivel: 3, color: 'var(--accent-purple)' },
    { titulo: 'Dir. Marketing', icon: '📣', nivel: 3, color: 'var(--accent-amber)' },
    { titulo: 'Dir. Organização', icon: '⚙️', nivel: 3, color: 'var(--accent-green)' },
  ];

  return nodes.map(n => `
    <div style="display:flex;flex-direction:column;align-items:center">
      <div style="background:var(--bg-card);border:2px solid ${n.color};border-radius:var(--radius-md);padding:16px 24px;text-align:center;min-width:180px">
        <div style="font-size:1.8rem">${n.icon}</div>
        <div style="font-weight:700;margin-top:6px">${n.titulo}</div>
        <div style="font-size:0.75rem;color:var(--text-muted)">Nível ${n.nivel}</div>
      </div>
    </div>
  `).join('<div style="font-size:1.5rem;color:var(--border)">↓</div>');
}

async function renderLogistica(container) {
  container.innerHTML = `
    <div class="section-header">
      <div class="section-title">📦 Logística</div>
      ${MNAuth.canEdit('logistica') ? `<button class="btn btn-primary btn-sm" onclick="openLogisticaForm()"><i class="fas fa-plus"></i> Nova Solicitação</button>` : ''}
    </div>
    <div id="logistica-list">
      <div class="loading"><div class="spinner"></div></div>
    </div>

    <div class="modal-overlay" id="modal-logistica">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">Nova Solicitação</div>
          <button class="modal-close" onclick="closeModal('modal-logistica')">&times;</button>
        </div>
        <div class="modal-body">
          <div class="grid-2">
            <div class="form-group"><label class="form-label">Item *</label><input type="text" id="log-item" class="form-control" placeholder="Nome do item"></div>
            <div class="form-group"><label class="form-label">Quantidade</label><input type="number" id="log-qtd" class="form-control" min="1" value="1"></div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Urgência</label>
              <select id="log-urgencia" class="form-control">
                <option value="normal">Normal</option>
                <option value="urgente">Urgente</option>
                <option value="critico">Crítico</option>
              </select>
            </div>
            <div class="form-group"><label class="form-label">Data Necessária</label><input type="date" id="log-data" class="form-control"></div>
          </div>
          <div class="form-group"><label class="form-label">Justificativa</label><textarea id="log-just" class="form-control" placeholder="Por que este item é necessário..."></textarea></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('modal-logistica')">Cancelar</button>
          <button class="btn btn-primary" onclick="saveLogistica()"><i class="fas fa-save"></i> Solicitar</button>
        </div>
      </div>
    </div>
  `;
  loadLogistica();
}

async function loadLogistica() {
  const el = document.getElementById('logistica-list');
  try {
    const items = await SupaDB.list('logistica_itens', { sort: 'created_at' });
    if (items.length === 0) {
      el.innerHTML = MNUtils.renderEmpty('📦', 'Nenhuma solicitação', 'Clique em "Nova Solicitação".');
      return;
    }
    const statusBadge = { pending:'badge-amber',aprovado:'badge-green',reprovado:'badge-red' };
    const urgBadge = { normal:'badge-gray',urgente:'badge-amber',critico:'badge-red' };
    el.innerHTML = `<div class="table-wrap"><table><thead><tr><th>Item</th><th>Qtd</th><th>Urgência</th><th>Solicitante</th><th>Status</th><th>Ações</th></tr></thead><tbody>
      ${items.map(i => `<tr>
        <td><strong>${i.item}</strong>${i.justificativa ? `<br><small style="color:var(--text-muted)">${i.justificativa.substring(0,40)}...</small>` : ''}</td>
        <td>${i.quantidade}</td>
        <td><span class="badge ${urgBadge[i.urgencia]||'badge-gray'}">${i.urgencia||'normal'}</span></td>
        <td>${i.solicitante||'—'}</td>
        <td><span class="badge ${statusBadge[i.status]||'badge-gray'}">${i.status||'pending'}</span></td>
        <td>
          ${MNAuth.isCEOOrAbove() && i.status === 'pending' ? `
            <button class="btn btn-success btn-sm" onclick="aprovarLogistica('${i.id}')"><i class="fas fa-check"></i></button>
            <button class="btn btn-danger btn-sm" onclick="reprovarLogistica('${i.id}')"><i class="fas fa-times"></i></button>
          ` : ''}
        </td>
      </tr>`).join('')}
    </tbody></table></div>`;
  } catch (e) {
    el.innerHTML = `<p class="text-muted">Configure o Supabase para carregar logística.</p>`;
  }
}

function openLogisticaForm() { openModal('modal-logistica'); }

async function saveLogistica() {
  const item = document.getElementById('log-item').value.trim();
  if (!item) { showToast('Item obrigatório.', 'error'); return; }
  const payload = {
    item, quantidade: parseInt(document.getElementById('log-qtd').value)||1,
    urgencia: document.getElementById('log-urgencia').value,
    data_necessidade: document.getElementById('log-data').value || null,
    justificativa: document.getElementById('log-just').value,
    solicitante: MNAuth.getCurrentUser()?.nome || 'Desconhecido',
    status: 'pending'
  };
  try {
    await SupaDB.create('logistica_itens', payload);
    showToast('Solicitação enviada!', 'success');
    closeModal('modal-logistica');
    loadLogistica();
  } catch (e) { showToast('Erro: ' + e.message, 'error'); }
}

async function aprovarLogistica(id) {
  try {
    await SupaDB.update('logistica_itens', id, { status: 'aprovado', aprovado_por: MNAuth.getCurrentUser()?.nome });
    showToast('Aprovado!', 'success'); loadLogistica();
  } catch (e) { showToast('Erro: ' + e.message, 'error'); }
}

async function reprovarLogistica(id) {
  try {
    await SupaDB.update('logistica_itens', id, { status: 'reprovado', aprovado_por: MNAuth.getCurrentUser()?.nome });
    showToast('Reprovado.', 'info'); loadLogistica();
  } catch (e) { showToast('Erro: ' + e.message, 'error'); }
}

async function renderCompeticao(container) {
  container.innerHTML = `
    <div class="section-header">
      <div class="section-title">🏆 Competição MN Cup</div>
      ${MNAuth.canEdit('competicao') ? `<button class="btn btn-primary btn-sm" onclick="openSumulaForm()"><i class="fas fa-plus"></i> Registrar Partida</button>` : ''}
    </div>
    <div id="competicao-list">
      <div class="loading"><div class="spinner"></div></div>
    </div>
  `;
  loadCompeticao();
}

async function loadCompeticao() {
  const el = document.getElementById('competicao-list');
  try {
    const partidas = await SupaDB.list('competicao_edicoes', { sort: 'data_partida' });
    if (partidas.length === 0) {
      el.innerHTML = MNUtils.renderEmpty('🏆', 'Nenhuma partida registrada');
      return;
    }
    el.innerHTML = `<div class="table-wrap"><table><thead><tr><th>Mandante</th><th>Placar</th><th>Visitante</th><th>Fase</th><th>Data</th><th>Local</th></tr></thead><tbody>
      ${partidas.map(p => `<tr>
        <td><strong>${p.equipe_mandante||'—'}</strong></td>
        <td style="text-align:center;font-weight:700;font-size:1.1rem;color:var(--cyan)">${p.placar||'× × ×'}</td>
        <td><strong>${p.equipe_visitante||'—'}</strong></td>
        <td><span class="badge badge-purple">${p.fase||'—'}</span></td>
        <td>${p.data_partida ? MNUtils.formatDate(p.data_partida) : '—'}</td>
        <td>${p.local||'—'}</td>
      </tr>`).join('')}
    </tbody></table></div>`;
  } catch (e) {
    el.innerHTML = `<p class="text-muted">Configure o Supabase para carregar competições.</p>`;
  }
}

function openSumulaForm() { showToast('Formulário de súmula em desenvolvimento completo.', 'info'); }

// ─────────────────────────────────────────────────────────────
// Auxiliar — Módulo genérico de texto
// ─────────────────────────────────────────────────────────────
async function renderModuloSimples(container, titulo, tabela, podeEditar) {
  let dados = {};
  try {
    const list = await SupaDB.list(tabela, { limit: 1 });
    if (list.length > 0) dados = list[0];
  } catch (e) {}

  container.innerHTML = `
    <div class="section-header">
      <div class="section-title">${titulo}</div>
      ${podeEditar ? `<button class="btn btn-primary btn-sm" onclick="saveModuloSimples('${tabela}','${dados.id||''}')"><i class="fas fa-save"></i> Salvar</button>` : ''}
    </div>
    <input type="hidden" id="ms-id" value="${dados.id||''}">
    <div class="card">
      <div class="form-group">
        <label class="form-label">Conteúdo</label>
        <textarea id="ms-conteudo" class="form-control" style="min-height:300px" ${podeEditar ? '' : 'readonly'} placeholder="Conteúdo de ${titulo}...">${dados.conteudo || ''}</textarea>
      </div>
    </div>
  `;
}

async function saveModuloSimples(tabela, id) {
  const conteudo = document.getElementById('ms-conteudo').value;
  try {
    if (id) await SupaDB.update(tabela, id, { conteudo });
    else await SupaDB.create(tabela, { conteudo });
    showToast('Salvo!', 'success');
  } catch (e) { showToast('Erro: ' + e.message, 'error'); }
}
