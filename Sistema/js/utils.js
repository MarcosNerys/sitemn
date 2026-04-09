/**
 * MN Imperialowls — Utilitários Globais
 * Toast, Modais, Formatação, Upload, Helpers
 */

// ─────────────────────────────────────────────────────────────
// TOAST NOTIFICATIONS
// ─────────────────────────────────────────────────────────────

function showToast(message, type = 'info', duration = 4000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas ${icons[type] || icons.info}" style="color:var(--accent-${type === 'success' ? 'green' : type === 'error' ? 'red' : type === 'warning' ? 'amber' : 'cyan'})"></i><span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

const toast = {
  success: (msg, d) => showToast(msg, 'success', d),
  error:   (msg, d) => showToast(msg, 'error', d),
  info:    (msg, d) => showToast(msg, 'info', d),
  warn:    (msg, d) => showToast(msg, 'warning', d)
};

// ─────────────────────────────────────────────────────────────
// MODAIS
// ─────────────────────────────────────────────────────────────

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('active');
}

// Fechar modal clicando fora
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
  }
});

// ─────────────────────────────────────────────────────────────
// CONFIRMAÇÃO
// ─────────────────────────────────────────────────────────────

function confirmAction(message, onConfirm, onCancel) {
  const existing = document.getElementById('confirm-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'confirm-modal';
  modal.className = 'modal-overlay active';
  modal.innerHTML = `
    <div class="modal" style="max-width:400px">
      <div class="modal-header">
        <div class="modal-title"><i class="fas fa-exclamation-triangle" style="color:var(--accent-amber)"></i> Confirmar Ação</div>
      </div>
      <div class="modal-body">
        <p style="color:var(--text-secondary)">${message}</p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="confirm-cancel">Cancelar</button>
        <button class="btn btn-danger" id="confirm-ok"><i class="fas fa-trash"></i> Confirmar</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById('confirm-ok').addEventListener('click', () => {
    modal.remove();
    if (onConfirm) onConfirm();
  });

  document.getElementById('confirm-cancel').addEventListener('click', () => {
    modal.remove();
    if (onCancel) onCancel();
  });
}

// ─────────────────────────────────────────────────────────────
// FORMATAÇÃO
// ─────────────────────────────────────────────────────────────

function formatDate(dateStr, opts = {}) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', ...opts
  });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('pt-BR');
}

function formatCurrency(value) {
  if (value == null) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatNumber(value) {
  if (value == null) return '0';
  return new Intl.NumberFormat('pt-BR').format(value);
}

function timeAgo(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = (now - d) / 1000;
  if (diff < 60) return 'agora';
  if (diff < 3600) return `${Math.floor(diff/60)}min atrás`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h atrás`;
  return `${Math.floor(diff/86400)}d atrás`;
}

// ─────────────────────────────────────────────────────────────
// UPLOAD DE IMAGEM
// ─────────────────────────────────────────────────────────────

function initImageUpload(inputId, previewId, onUpload) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  if (!input) return;

  input.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview local
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (preview) {
        preview.src = ev.target.result;
        preview.style.display = 'block';
      }
    };
    reader.readAsDataURL(file);

    // Upload para Supabase Storage (se configurado)
    if (typeof SupaStorage !== 'undefined' && onUpload) {
      try {
        const bucket = 'fotos';
        const path = `${Date.now()}_${file.name.replace(/\s+/g,'_')}`;
        const url = await SupaStorage.upload(bucket, path, file);
        onUpload(url, file);
      } catch (err) {
        console.error('Upload error:', err);
        // Fallback: converte para base64
        const reader2 = new FileReader();
        reader2.onload = ev => onUpload(ev.target.result, file);
        reader2.readAsDataURL(file);
      }
    } else if (onUpload) {
      // Sem Supabase — usa base64
      const reader2 = new FileReader();
      reader2.onload = ev => onUpload(ev.target.result, file);
      reader2.readAsDataURL(file);
    }
  });
}

// ─────────────────────────────────────────────────────────────
// LOADING STATE
// ─────────────────────────────────────────────────────────────

function setLoading(containerId, isLoading, message = 'Carregando...') {
  const el = document.getElementById(containerId);
  if (!el) return;

  if (isLoading) {
    el.innerHTML = `
      <div class="loading">
        <div style="text-align:center">
          <div class="spinner" style="margin:0 auto 12px"></div>
          <p style="color:var(--text-muted);font-size:0.85rem">${message}</p>
        </div>
      </div>`;
  }
}

// ─────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────

function renderEmpty(icon = '📭', title = 'Nenhum registro', subtitle = '') {
  return `
    <div class="empty-state">
      <div class="empty-icon">${icon}</div>
      <h3>${title}</h3>
      ${subtitle ? `<p>${subtitle}</p>` : ''}
    </div>`;
}

// ─────────────────────────────────────────────────────────────
// TABS
// ─────────────────────────────────────────────────────────────

function initTabs(containerSelector) {
  const container = document.querySelector(containerSelector) || document;
  container.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      const parent = btn.closest('.tabs-wrapper') || container;

      parent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      parent.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const pane = parent.querySelector(`#tab-${target}`);
      if (pane) pane.classList.add('active');
    });
  });
}

// ─────────────────────────────────────────────────────────────
// SEARCH FILTER (client-side)
// ─────────────────────────────────────────────────────────────

function filterTable(inputId, tableId, cols = []) {
  const input = document.getElementById(inputId);
  const table = document.getElementById(tableId);
  if (!input || !table) return;

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    table.querySelectorAll('tbody tr').forEach(row => {
      const text = cols.length
        ? cols.map(i => row.cells[i]?.textContent || '').join(' ').toLowerCase()
        : row.textContent.toLowerCase();
      row.style.display = !q || text.includes(q) ? '' : 'none';
    });
  });
}

// ─────────────────────────────────────────────────────────────
// GERAÇÃO DE ID LOCAL (fallback)
// ─────────────────────────────────────────────────────────────

function generateId() {
  return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

// ─────────────────────────────────────────────────────────────
// PDF EXPORT (básico via print)
// ─────────────────────────────────────────────────────────────

function printSection(contentId, title = 'MN Imperialowls') {
  const content = document.getElementById(contentId);
  if (!content) return;

  const win = window.open('', '_blank');
  win.document.write(`
    <!DOCTYPE html><html><head>
    <title>${title}</title>
    <style>body{font-family:sans-serif;padding:20px;} h1{color:#00c8e0;}</style>
    </head><body>
    <h1>🦉 MN Imperialowls — ${title}</h1>
    ${content.innerHTML}
    </body></html>
  `);
  win.document.close();
  win.print();
}

// ─────────────────────────────────────────────────────────────
// EXPORTAR GLOBAL
// ─────────────────────────────────────────────────────────────

window.MNUtils = {
  toast, showToast,
  openModal, closeModal,
  confirmAction,
  formatDate, formatDateTime, formatCurrency, formatNumber, timeAgo,
  initImageUpload,
  setLoading, renderEmpty,
  initTabs, filterTable,
  generateId, printSection
};

// Atalhos globais
window.showToast = showToast;
window.confirmAction = confirmAction;
window.openModal = openModal;
window.closeModal = closeModal;
