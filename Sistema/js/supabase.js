/**
 * MN Imperialowls — Supabase Client
 * Configuração central do cliente Supabase para autenticação, banco e storage.
 *
 * INSTRUÇÕES DE CONFIGURAÇÃO:
 * 1. Crie um projeto em https://supabase.com
 * 2. Vá em Project Settings → API
 * 3. Copie a "Project URL" e a "anon/public key"
 * 4. Substitua os valores abaixo OU configure as variáveis no Netlify:
 *    - SUPABASE_URL
 *    - SUPABASE_ANON_KEY
 */

// ─────────────────────────────────────────────────────────────
// CONFIG — substitua com suas credenciais do Supabase
// ─────────────────────────────────────────────────────────────
const SUPABASE_URL = window.ENV_SUPABASE_URL || 'https://SEU_PROJETO.supabase.co';
const SUPABASE_ANON_KEY = window.ENV_SUPABASE_ANON_KEY || 'SUA_ANON_KEY_AQUI';

// ─────────────────────────────────────────────────────────────
// Inicializa o cliente Supabase (via CDN)
// ─────────────────────────────────────────────────────────────
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// ─────────────────────────────────────────────────────────────
// Helper: verifica se Supabase está configurado
// ─────────────────────────────────────────────────────────────
function isSupabaseConfigured() {
  return !SUPABASE_URL.includes('SEU_PROJETO') && !SUPABASE_ANON_KEY.includes('SUA_ANON_KEY');
}

// ─────────────────────────────────────────────────────────────
// API Helper — substitui as chamadas tables/ da versão anterior
// ─────────────────────────────────────────────────────────────
const DB = {
  /**
   * Listar registros de uma tabela
   * @param {string} table - Nome da tabela
   * @param {object} opts - { search, sort, page, limit, filters }
   */
  async list(table, opts = {}) {
    let query = supabaseClient.from(table).select('*');

    if (opts.filters) {
      for (const [col, val] of Object.entries(opts.filters)) {
        query = query.eq(col, val);
      }
    }

    if (opts.search && opts.searchCol) {
      query = query.ilike(opts.searchCol, `%${opts.search}%`);
    }

    if (opts.sort) {
      query = query.order(opts.sort, { ascending: opts.ascending !== false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    if (opts.limit) {
      const page = opts.page || 1;
      const from = (page - 1) * opts.limit;
      const to = from + opts.limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return data || [];
  },

  /**
   * Buscar registro por ID
   */
  async get(table, id) {
    const { data, error } = await supabaseClient
      .from(table)
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Criar novo registro
   */
  async create(table, payload) {
    const { data, error } = await supabaseClient
      .from(table)
      .insert([payload])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Atualizar registro
   */
  async update(table, id, payload) {
    const { data, error } = await supabaseClient
      .from(table)
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Excluir registro
   */
  async delete(table, id) {
    const { error } = await supabaseClient
      .from(table)
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  /**
   * Upsert (criar ou atualizar)
   */
  async upsert(table, payload, conflictCol = 'id') {
    const { data, error } = await supabaseClient
      .from(table)
      .upsert(payload, { onConflict: conflictCol })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

// ─────────────────────────────────────────────────────────────
// Storage Helper — upload de arquivos
// ─────────────────────────────────────────────────────────────
const Storage = {
  BUCKET_FOTOS: 'fotos',
  BUCKET_LOGOS: 'logos',
  BUCKET_DOCS: 'documentos',

  /**
   * Upload de arquivo para o Supabase Storage
   * @param {string} bucket - Nome do bucket
   * @param {string} path - Caminho dentro do bucket
   * @param {File} file - Arquivo
   * @returns {string} URL pública do arquivo
   */
  async upload(bucket, path, file) {
    const { data, error } = await supabaseClient.storage
      .from(bucket)
      .upload(path, file, { upsert: true });
    if (error) throw error;

    const { data: urlData } = supabaseClient.storage
      .from(bucket)
      .getPublicUrl(data.path);
    return urlData.publicUrl;
  },

  /**
   * Obter URL pública de um arquivo
   */
  getPublicUrl(bucket, path) {
    const { data } = supabaseClient.storage
      .from(bucket)
      .getPublicUrl(path);
    return data.publicUrl;
  },

  /**
   * Excluir arquivo
   */
  async delete(bucket, path) {
    const { error } = await supabaseClient.storage
      .from(bucket)
      .remove([path]);
    if (error) throw error;
    return true;
  }
};

// ─────────────────────────────────────────────────────────────
// Auth Helper
// ─────────────────────────────────────────────────────────────
const Auth = {
  /**
   * Login com email e senha
   */
  async login(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  },

  /**
   * Logout
   */
  async logout() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
  },

  /**
   * Sessão atual
   */
  async getSession() {
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  /**
   * Usuário atual
   */
  async getUser() {
    const { data, error } = await supabaseClient.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  /**
   * Resetar senha (envia email)
   */
  async resetPassword(email) {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login.html`
    });
    if (error) throw error;
  },

  /**
   * Atualizar senha
   */
  async updatePassword(newPassword) {
    const { error } = await supabaseClient.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
  },

  /**
   * Listener de mudanças de auth
   */
  onAuthStateChange(callback) {
    return supabaseClient.auth.onAuthStateChange(callback);
  }
};

// ─────────────────────────────────────────────────────────────
// Realtime Helper
// ─────────────────────────────────────────────────────────────
const Realtime = {
  /**
   * Assinar mudanças em tempo real de uma tabela
   */
  subscribe(table, callback) {
    return supabaseClient
      .channel(`public:${table}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table },
        callback
      )
      .subscribe();
  },

  /**
   * Cancelar assinatura
   */
  unsubscribe(channel) {
    supabaseClient.removeChannel(channel);
  }
};

// Exporta para uso global
window.SupaDB = DB;
window.SupaStorage = Storage;
window.SupaAuth = Auth;
window.SupaRealtime = Realtime;
window.supabaseClient = supabaseClient;

console.log('[Supabase] Cliente inicializado.', isSupabaseConfigured() ? '✅ Configurado' : '⚠️ Configure as credenciais em js/supabase.js');
