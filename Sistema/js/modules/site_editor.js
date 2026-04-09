/**
 * MN Imperialowls — Editor do Site Público
 */

async function renderSiteEditor(container) {
  if (!MNAuth.isCEOOrAbove()) {
    container.innerHTML = `<div class="alert alert-error"><i class="fas fa-lock"></i> Acesso restrito a CEO e Master.</div>`;
    return;
  }

  container.innerHTML = `
    <div class="section-header">
      <div class="section-title">🌐 Editor do Site Público</div>
      <div class="d-flex gap-1">
        <a href="index.html" class="btn btn-secondary btn-sm" target="_blank"><i class="fas fa-external-link-alt"></i> Ver Site</a>
        <button class="btn btn-primary btn-sm" onclick="publicarSite()"><i class="fas fa-upload"></i> Publicar Tudo</button>
      </div>
    </div>

    <div class="tabs-wrapper">
      <div class="tabs">
        <button class="tab-btn active" onclick="switchTab(this,'tab-site-hero')">🎯 Hero</button>
        <button class="tab-btn" onclick="switchTab(this,'tab-site-sobre')">ℹ️ Sobre</button>
        <button class="tab-btn" onclick="switchTab(this,'tab-site-missao')">🎯 Missão/Valores</button>
        <button class="tab-btn" onclick="switchTab(this,'tab-site-impacto')">📊 Impacto</button>
        <button class="tab-btn" onclick="switchTab(this,'tab-site-equipes')">🛡️ Equipes</button>
        <button class="tab-btn" onclick="switchTab(this,'tab-site-logo')">🎨 Logo</button>
      </div>

      <div id="tab-site-hero" class="tab-pane active">
        ${siteSection('hero','🎯 Seção Hero (Principal)',['hero_titulo:Título Principal:text','hero_subtitulo:Subtítulo:text','hero_cta:Texto do Botão CTA:text','hero_stats1:Estatística 1 (Ex: 150+ Atletas):text','hero_stats2:Estatística 2:text','hero_stats3:Estatística 3:text'])}
      </div>

      <div id="tab-site-sobre" class="tab-pane">
        ${siteSection('sobre','ℹ️ Sobre o Projeto',['sobre_titulo:Título da Seção:text','sobre_texto:Texto Principal:textarea','sobre_historia:Nossa História:textarea'])}
      </div>

      <div id="tab-site-missao" class="tab-pane">
        ${siteSection('missao','🎯 Missão / Visão / Valores',['missao_texto:Missão:textarea','visao_texto:Visão:textarea','valores_texto:Valores (um por linha):textarea'])}
      </div>

      <div id="tab-site-impacto" class="tab-pane">
        ${siteSection('impacto','📊 Impacto Social',['impacto_num1:Número 1 (ex: 500+):text','impacto_label1:Label 1 (ex: Jovens Atendidos):text','impacto_num2:Número 2:text','impacto_label2:Label 2:text','impacto_num3:Número 3:text','impacto_label3:Label 3:text','impacto_texto:Texto do Impacto:textarea'])}
      </div>

      <div id="tab-site-equipes" class="tab-pane">
        <div class="card" style="margin-top:16px">
          <div class="card-header">
            <div class="card-title">🛡️ Equipes Exibidas no Site</div>
            <p style="font-size:0.8rem;color:var(--text-muted)">As equipes cadastradas no módulo Equipes são exibidas automaticamente no site.</p>
          </div>
          <div id="site-equipes-preview">
            <div class="loading"><div class="spinner"></div></div>
          </div>
        </div>
      </div>

      <div id="tab-site-logo" class="tab-pane">
        <div class="card" style="margin-top:16px">
          <div class="card-header"><div class="card-title">🎨 Logo e Identidade Visual</div></div>
          <div style="text-align:center;padding:24px">
            <div id="logo-preview" style="margin-bottom:24px;font-size:5rem">🦉</div>
            <p style="color:var(--text-muted);margin-bottom:16px">Faça upload do logo oficial do projeto (PNG, SVG — recomendado fundo transparente)</p>
            <input type="file" id="logo-input" accept="image/*,.svg" style="display:none" onchange="handleLogoUpload(event)">
            <button class="btn btn-primary" onclick="document.getElementById('logo-input').click()"><i class="fas fa-upload"></i> Fazer Upload do Logo</button>
          </div>
        </div>
      </div>
    </div>
  `;

  await loadSiteContent();
  loadSiteEquipes();
}

function siteSection(secao, titulo, campos) {
  return `
    <div class="card" style="margin-top:16px">
      <div class="card-header">
        <div class="card-title">${titulo}</div>
        <button class="btn btn-primary btn-sm" onclick="saveSiteSection('${secao}')"><i class="fas fa-save"></i> Salvar Seção</button>
      </div>
      <div class="grid-2" style="gap:12px">
        ${campos.map(c => {
          const [id, label, tipo] = c.split(':');
          return `
            <div class="form-group" style="${tipo==='textarea' ? 'grid-column:1/-1' : ''}">
              <label class="form-label">${label}</label>
              ${tipo === 'textarea'
                ? `<textarea id="site-${id}" class="form-control" style="min-height:100px" placeholder="${label}..."></textarea>`
                : `<input type="text" id="site-${id}" class="form-control" placeholder="${label}...">`
              }
            </div>`;
        }).join('')}
      </div>
    </div>`;
}

async function loadSiteContent() {
  try {
    const items = await SupaDB.list('site_content');
    items.forEach(item => {
      const el = document.getElementById(`site-${item.chave}`);
      if (el) el.value = item.valor || '';
    });
  } catch (e) {}
}

async function saveSiteSection(secao) {
  const campos = document.querySelectorAll(`#tab-site-${secao} [id^="site-"]`);
  const saves = [];

  for (const el of campos) {
    const chave = el.id.replace('site-', '');
    const valor = el.value;

    saves.push(SupaDB.upsert('site_content', {
      chave, valor, secao,
      updated_by: MNAuth.getCurrentUser()?.nome || ''
    }, 'chave').catch(() => null));
  }

  try {
    await Promise.all(saves);
    showToast(`Seção "${secao}" salva!`, 'success');
  } catch (e) {
    showToast('Erro ao salvar: ' + e.message, 'error');
  }
}

async function publicarSite() {
  showToast('Publicando todas as seções...', 'info');
  const secoes = ['hero','sobre','missao','impacto'];
  for (const s of secoes) {
    await saveSiteSection(s).catch(() => {});
  }
  showToast('Site atualizado com sucesso! 🚀', 'success');
}

async function loadSiteEquipes() {
  const el = document.getElementById('site-equipes-preview');
  if (!el) return;
  try {
    const equipes = await SupaDB.list('equipes', { sort: 'nome_equipe' });
    if (equipes.length === 0) {
      el.innerHTML = `<p class="text-muted" style="padding:16px">Cadastre equipes no módulo Equipes para exibi-las no site.</p>`;
      return;
    }
    el.innerHTML = `<div class="grid-3" style="gap:12px;padding:16px">
      ${equipes.map(e => `
        <div class="card" style="padding:12px;text-align:center">
          <div style="font-size:1.5rem">🛡️</div>
          <div style="font-weight:700;font-size:0.9rem;margin-top:6px">${e.nome_equipe}</div>
          ${e.categoria ? `<span class="badge badge-cyan" style="margin-top:4px">${e.categoria}</span>` : ''}
        </div>
      `).join('')}
    </div>`;
  } catch (e) {}
}

async function handleLogoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const preview = document.getElementById('logo-preview');
    if (preview) {
      preview.innerHTML = `<img src="${e.target.result}" style="max-height:100px;max-width:200px;object-fit:contain">`;
    }

    let url = e.target.result;
    if (typeof SupaStorage !== 'undefined') {
      try {
        const path = `logo_${Date.now()}_${file.name.replace(/\s+/g,'_')}`;
        url = await SupaStorage.upload('logos', path, file);
      } catch (err) {}
    }

    try {
      await SupaDB.upsert('logo_projeto', {
        nome: file.name, tipo: file.type,
        dados_base64: url,
        updated_by: MNAuth.getCurrentUser()?.nome || ''
      }, 'nome');
      showToast('Logo salvo!', 'success');
    } catch (err) {
      showToast('Erro ao salvar logo: ' + err.message, 'error');
    }
  };
  reader.readAsDataURL(file);
}
