/**
 * MN Imperialowls — Módulo Usuários
 * CRUD de usuários com controle de perfis
 */

async function renderUsuarios(container) {
  if (!MNAuth.isCEOOrAbove()) {
    container.innerHTML = `<div class="alert alert-error"><i class="fas fa-lock"></i> Acesso restrito a CEO e Master.</div>`;
    return;
  }

  container.innerHTML = `
    <div class="section-header">
      <div class="section-title">Gestão de Usuários</div>
      ${MNAuth.canEdit('usuarios') ? `<button class="btn btn-primary btn-sm" onclick="openUserForm()"><i class="fas fa-user-plus"></i> Novo Usuário</button>` : ''}
    </div>

    <div class="alert alert-info mb-2" id="supabase-tip" style="display:none">
      <i class="fas fa-info-circle"></i>
      No Supabase, crie usuários em <strong>Authentication → Users</strong> e depois cadastre aqui com o mesmo e-mail para associar o perfil.
    </div>

    <div class="table-wrap">
      <table id="users-table">
        <thead><tr>
          <th>Usuário</th><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Grau</th><th>Status</th><th>Ações</th>
        </tr></thead>
        <tbody id="users-tbody">
          <tr><td colspan="7"><div class="loading"><div class="spinner"></div></div></td></tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Usuário -->
    <div class="modal-overlay" id="modal-usuario">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title" id="modal-usuario-title">Novo Usuário</div>
          <button class="modal-close" onclick="closeModal('modal-usuario')">&times;</button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="usuario-id">
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label">Username *</label>
              <input type="text" id="usuario-username" class="form-control" placeholder="nome_usuario">
            </div>
            <div class="form-group">
              <label class="form-label">Nome Completo</label>
              <input type="text" id="usuario-nome" class="form-control" placeholder="Nome completo">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">E-mail *</label>
            <input type="email" id="usuario-email" class="form-control" placeholder="usuario@mnimperialowls.com">
          </div>
          <div class="form-group">
            <label class="form-label">Perfil de Acesso *</label>
            <select id="usuario-perfil" class="form-control">
              <option value="usuario">Usuário (Leitura)</option>
              <option value="dir_organizacao">Diretor de Organização</option>
              <option value="dir_marketing">Diretor de Marketing</option>
              <option value="dir_executivo">Diretor Executivo</option>
              ${MNAuth.isCEOOrAbove() ? `<option value="ceo">CEO</option>` : ''}
              ${MNAuth.isMaster() ? `<option value="master">Master</option>` : ''}
            </select>
          </div>
          <div id="create-password-section">
            <div class="form-group">
              <label class="form-label">Senha Inicial</label>
              <input type="password" id="usuario-senha" class="form-control" placeholder="Mínimo 8 caracteres">
              <small style="color:var(--text-muted);font-size:0.75rem">O usuário pode alterar depois no sistema.</small>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('modal-usuario')">Cancelar</button>
          <button class="btn btn-primary" onclick="saveUsuario()"><i class="fas fa-save"></i> Salvar</button>
        </div>
      </div>
    </div>
  `;

  loadUsuarios();
}

async function loadUsuarios() {
  const tbody = document.getElementById('users-tbody');
  try {
    const users = await SupaDB.list('usuarios', { sort: 'nome' });
    if (users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-muted)">Nenhum usuário cadastrado.</td></tr>`;
      return;
    }

    const PROFILE_LABELS = {
      master: { label: 'Master', badge: 'badge-red', icon: '👑' },
      ceo: { label: 'CEO', badge: 'badge-amber', icon: '🏢' },
      dir_executivo: { label: 'Dir. Executivo', badge: 'badge-purple', icon: '📋' },
      dir_marketing: { label: 'Dir. Marketing', badge: 'badge-blue', icon: '📣' },
      dir_organizacao: { label: 'Dir. Organização', badge: 'badge-cyan', icon: '⚙️' },
      usuario: { label: 'Usuário', badge: 'badge-gray', icon: '👤' }
    };

    tbody.innerHTML = users.map(u => {
      const p = PROFILE_LABELS[u.perfil] || PROFILE_LABELS.usuario;
      const grau = MNAuth.PROFILES[u.perfil]?.grau || 4;
      return `<tr>
        <td><strong>${u.username || '—'}</strong></td>
        <td>${u.nome || '—'}</td>
        <td><a href="mailto:${u.email}">${u.email || '—'}</a></td>
        <td><span class="badge ${p.badge}">${p.icon} ${p.label}</span></td>
        <td>${grau}</td>
        <td><span class="badge ${u.ativo ? 'badge-green' : 'badge-gray'}">${u.ativo ? 'Ativo' : 'Inativo'}</span></td>
        <td>
          <div style="display:flex;gap:6px">
            ${MNAuth.canEdit('usuarios') ? `<button class="btn btn-secondary btn-sm" onclick='editUsuario(${JSON.stringify(u).replace(/'/g,"\\'")})'><i class="fas fa-edit"></i></button>` : ''}
            ${MNAuth.isMaster() ? `<button class="btn btn-danger btn-sm" onclick="deleteUsuario('${u.id}','${u.nome || u.username}')"><i class="fas fa-trash"></i></button>` : ''}
          </div>
        </td>
      </tr>`;
    }).join('');
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="7" style="color:var(--text-muted);text-align:center">Configure o Supabase para carregar usuários.</td></tr>`;
    document.getElementById('supabase-tip').style.display = 'flex';
  }
}

function openUserForm() {
  document.getElementById('modal-usuario-title').textContent = 'Novo Usuário';
  ['usuario-id','usuario-username','usuario-nome','usuario-email','usuario-senha'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const perfil = document.getElementById('usuario-perfil');
  if (perfil) perfil.value = 'usuario';
  openModal('modal-usuario');
}

function editUsuario(user) {
  document.getElementById('modal-usuario-title').textContent = 'Editar Usuário';
  document.getElementById('usuario-id').value = user.id || '';
  document.getElementById('usuario-username').value = user.username || '';
  document.getElementById('usuario-nome').value = user.nome || '';
  document.getElementById('usuario-email').value = user.email || '';
  document.getElementById('usuario-perfil').value = user.perfil || 'usuario';
  const senhaSection = document.getElementById('create-password-section');
  if (senhaSection) senhaSection.style.display = 'none';
  openModal('modal-usuario');
}

async function saveUsuario() {
  const id = document.getElementById('usuario-id').value;
  const username = document.getElementById('usuario-username').value.trim();
  const email = document.getElementById('usuario-email').value.trim();

  if (!username || !email) { showToast('Username e e-mail obrigatórios.', 'error'); return; }

  const perfil = document.getElementById('usuario-perfil').value;
  const grau = MNAuth.PROFILES[perfil]?.grau || 4;

  const payload = {
    username,
    nome: document.getElementById('usuario-nome').value,
    email,
    perfil,
    grau,
    ativo: true
  };

  try {
    if (id) {
      await SupaDB.update('usuarios', id, payload);
      showToast('Usuário atualizado!', 'success');
    } else {
      // Criar usuário no Supabase Auth também
      if (typeof supabaseClient !== 'undefined') {
        const senha = document.getElementById('usuario-senha').value;
        if (senha && senha.length >= 8) {
          try {
            const { data, error } = await supabaseClient.auth.admin.createUser({
              email, password: senha, email_confirm: true
            });
            if (!error && data?.user) {
              payload.auth_id = data.user.id;
            }
          } catch (e) {
            // Admin API não disponível no client-side
          }
        }
      }
      await SupaDB.create('usuarios', payload);
      showToast('Usuário criado! Crie também no Supabase Auth com o mesmo e-mail.', 'info', 6000);
    }
    closeModal('modal-usuario');
    loadUsuarios();
  } catch (e) {
    showToast('Erro: ' + e.message, 'error');
  }
}

async function deleteUsuario(id, nome) {
  if (!MNAuth.isMaster()) { showToast('Apenas o Master pode excluir usuários.', 'error'); return; }
  confirmAction(`Excluir usuário "${nome}"? O acesso será revogado imediatamente.`, async () => {
    try {
      await SupaDB.delete('usuarios', id);
      showToast('Usuário excluído.', 'success');
      loadUsuarios();
    } catch (e) {
      showToast('Erro: ' + e.message, 'error');
    }
  });
}
