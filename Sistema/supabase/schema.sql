-- ═══════════════════════════════════════════════════════════
-- MN Imperialowls — Schema Supabase (PostgreSQL)
-- Execute no SQL Editor do Supabase: https://supabase.com/dashboard
-- ═══════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────
-- EXTENSÕES
-- ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- TABELA: usuarios
-- Perfis e permissões dos usuários do sistema
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.usuarios (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  username    TEXT UNIQUE NOT NULL,
  nome        TEXT,
  email       TEXT NOT NULL,
  perfil      TEXT NOT NULL DEFAULT 'usuario'
    CHECK (perfil IN ('master','ceo','dir_executivo','dir_marketing','dir_organizacao','usuario')),
  grau        INTEGER DEFAULT 4 CHECK (grau BETWEEN 1 AND 4),
  ativo       BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABELA: equipes
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.equipes (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome_equipe  TEXT NOT NULL,
  categoria    TEXT,
  local_treino TEXT,
  horarios     TEXT,
  tecnico      TEXT,
  descricao    TEXT,
  numero_atletas INTEGER DEFAULT 0,
  ativo        BOOLEAN DEFAULT TRUE,
  updated_by   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABELA: atletas
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.atletas (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome        TEXT NOT NULL,
  data_nasc   DATE,
  responsavel TEXT,
  cidade      TEXT,
  posicao     TEXT,
  modalidade  TEXT,
  contato     TEXT,
  email       TEXT,
  historico   TEXT,
  camisa      INTEGER,
  equipe_id   UUID REFERENCES public.equipes(id) ON DELETE SET NULL,
  equipe_nome TEXT,
  xp          INTEGER DEFAULT 0,
  nivel       INTEGER DEFAULT 0,
  ativo       BOOLEAN DEFAULT TRUE,
  foto_url    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABELA: organograma
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.organograma (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cargo_id     TEXT NOT NULL,
  titulo       TEXT,
  responsavel  TEXT,
  email        TEXT,
  telefone     TEXT,
  area         TEXT,
  observacoes  TEXT,
  status       TEXT DEFAULT 'ativo',
  updated_by   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABELA: site_content
-- Conteúdo dinâmico do site público
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.site_content (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chave       TEXT UNIQUE NOT NULL,
  valor       TEXT,
  secao       TEXT,
  tipo        TEXT DEFAULT 'texto',
  label       TEXT,
  updated_by  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABELA: logo_projeto
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.logo_projeto (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome         TEXT,
  tipo         TEXT,
  dados_base64 TEXT,
  updated_by   TEXT,
  ativo        BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABELA: revisoes
-- Revisões quinzenal / mensal / semestral
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.revisoes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo            TEXT NOT NULL CHECK (tipo IN ('quinzenal','mensal','semestral')),
  realizado       TEXT,
  pontos_melhoria TEXT,
  proximas_acoes  TEXT,
  status          TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho','aprovado','reprovado')),
  responsavel     TEXT,
  aprovado_por    TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABELA: planejamento_anual
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.planejamento_anual (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conteudo   TEXT,
  ano        INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  status     TEXT DEFAULT 'rascunho',
  autor      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABELA: logistica_itens
-- Solicitações de materiais
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.logistica_itens (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item             TEXT NOT NULL,
  quantidade       INTEGER DEFAULT 1,
  urgencia         TEXT DEFAULT 'normal' CHECK (urgencia IN ('normal','urgente','critico')),
  data_necessidade DATE,
  justificativa    TEXT,
  solicitante      TEXT,
  status           TEXT DEFAULT 'pending' CHECK (status IN ('pending','aprovado','reprovado')),
  aprovado_por     TEXT,
  obs_aprovacao    TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABELA: gestao_swot
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.gestao_swot (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  forcas         TEXT,
  fraquezas      TEXT,
  oportunidades  TEXT,
  ameacas        TEXT,
  estrategia_so  TEXT,
  estrategia_wo  TEXT,
  estrategia_st  TEXT,
  estrategia_wt  TEXT,
  responsavel    TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABELA: gestao_pdca
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.gestao_pdca (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan        TEXT,
  do          TEXT,
  check_fase  TEXT,
  act         TEXT,
  indicadores TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABELA: gestao_bsc
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.gestao_bsc (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  financeira_obj      TEXT, financeira_meta    TEXT, financeira_ini     TEXT,
  clientes_obj        TEXT, clientes_meta      TEXT, clientes_ini       TEXT,
  processos_obj       TEXT, processos_meta     TEXT, processos_ini      TEXT,
  aprendizado_obj     TEXT, aprendizado_meta   TEXT, aprendizado_ini    TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABELA: gestao_spliss
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.gestao_spliss (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  p1           INTEGER DEFAULT 5,
  p2           INTEGER DEFAULT 5,
  p3           INTEGER DEFAULT 5,
  p4           INTEGER DEFAULT 5,
  p5           INTEGER DEFAULT 5,
  p6           INTEGER DEFAULT 5,
  p7           INTEGER DEFAULT 5,
  p8           INTEGER DEFAULT 5,
  p9           INTEGER DEFAULT 5,
  observacoes  TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABELA: gestao_canvas
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.gestao_canvas (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposta        TEXT,
  segmentos       TEXT,
  relacionamento  TEXT,
  canais          TEXT,
  atividades      TEXT,
  recursos        TEXT,
  parceiros       TEXT,
  custos          TEXT,
  receitas        TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABELAS: pmo_projetos e pmo_riscos
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pmo_projetos (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome         TEXT NOT NULL,
  descricao    TEXT,
  responsavel  TEXT,
  status       TEXT DEFAULT 'planejamento',
  progresso    INTEGER DEFAULT 0 CHECK (progresso BETWEEN 0 AND 100),
  prazo        DATE,
  orcamento    DECIMAL(12,2),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pmo_riscos (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  descricao     TEXT NOT NULL,
  probabilidade TEXT CHECK (probabilidade IN ('alto','medio','baixo')),
  impacto       TEXT CHECK (impacto IN ('alto','medio','baixo')),
  mitigacao     TEXT,
  projeto_id    UUID REFERENCES public.pmo_projetos(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABELA: competicao_edicoes
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.competicao_edicoes (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome_torneio     TEXT,
  edicao           TEXT,
  modalidade       TEXT,
  equipe_mandante  TEXT,
  equipe_visitante TEXT,
  placar           TEXT,
  fase             TEXT,
  data_partida     TIMESTAMPTZ,
  local            TEXT,
  arbitro          TEXT,
  observacoes      TEXT,
  created_by       TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABELA: produtos e vendas
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.produtos (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome       TEXT NOT NULL,
  categoria  TEXT,
  preco      DECIMAL(10,2) DEFAULT 0,
  estoque    INTEGER DEFAULT 0,
  descricao  TEXT,
  imagem_url TEXT,
  ativo      BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.vendas (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  produto_id   UUID REFERENCES public.produtos(id) ON DELETE SET NULL,
  produto_nome TEXT,
  quantidade   INTEGER NOT NULL DEFAULT 1,
  preco_unit   DECIMAL(10,2) DEFAULT 0,
  total        DECIMAL(10,2) DEFAULT 0,
  cliente      TEXT,
  pagamento    TEXT,
  vendedor     TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.campanhas (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo     TEXT NOT NULL,
  descricao  TEXT,
  ativa      BOOLEAN DEFAULT TRUE,
  inicio     DATE,
  fim        DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABELA: pedidos_funko
-- Funko Pop MAG
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pedidos_funko (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome_cliente TEXT NOT NULL,
  contato      TEXT,
  email        TEXT,
  foto_url     TEXT,
  camisa       TEXT,
  numero       INTEGER,
  tipo         TEXT CHECK (tipo IN ('chaveiro','bancada','ambos')),
  pose         TEXT,
  acessorios   TEXT,
  observacoes  TEXT,
  valor        DECIMAL(10,2),
  prazo        DATE,
  status       TEXT DEFAULT 'pendente' CHECK (status IN ('pendente','em_producao','pronto','entregue')),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABELA: contatos
-- Formulários do site público
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contatos (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo       TEXT NOT NULL CHECK (tipo IN ('patrocinador','voluntario','atleta','geral')),
  nome       TEXT NOT NULL,
  email      TEXT NOT NULL,
  dados      JSONB,
  lido       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- TABELA: estatuto_docs
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.estatuto_docs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conteudo   TEXT,
  versao     TEXT DEFAULT '1.0',
  autor      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.usuarios          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atletas           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organograma       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_content      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logo_projeto      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revisoes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planejamento_anual ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistica_itens   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gestao_swot       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gestao_pdca       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gestao_bsc        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gestao_spliss     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gestao_canvas     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pmo_projetos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pmo_riscos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competicao_edicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendas            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campanhas         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos_funko     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contatos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estatuto_docs     ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────
-- FUNÇÃO auxiliar: obter perfil do usuário logado
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_user_profile()
RETURNS TEXT AS $$
  SELECT perfil FROM public.usuarios WHERE auth_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_user_grau()
RETURNS INTEGER AS $$
  SELECT grau FROM public.usuarios WHERE auth_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ─────────────────────────────────────────────────────────────
-- POLÍTICAS: Usuários autenticados leem dados internos
-- ─────────────────────────────────────────────────────────────

-- usuarios: leitura para autenticados, escrita para master/ceo
CREATE POLICY "usuarios_select" ON public.usuarios FOR SELECT TO authenticated USING (true);
CREATE POLICY "usuarios_insert" ON public.usuarios FOR INSERT TO authenticated WITH CHECK ((SELECT get_user_grau()) <= 2);
CREATE POLICY "usuarios_update" ON public.usuarios FOR UPDATE TO authenticated USING ((SELECT get_user_grau()) <= 2);
CREATE POLICY "usuarios_delete" ON public.usuarios FOR DELETE TO authenticated USING ((SELECT get_user_profile()) = 'master');

-- equipes, atletas: leitura para todos autenticados; escrita para grau <= 3
CREATE POLICY "equipes_select" ON public.equipes FOR SELECT TO authenticated USING (true);
CREATE POLICY "equipes_write"  ON public.equipes FOR ALL    TO authenticated USING ((SELECT get_user_grau()) <= 3);

CREATE POLICY "atletas_select" ON public.atletas FOR SELECT TO authenticated USING (true);
CREATE POLICY "atletas_write"  ON public.atletas FOR ALL    TO authenticated USING ((SELECT get_user_grau()) <= 3);

-- site_content: leitura pública (anon); escrita para grau <= 2
CREATE POLICY "site_content_select" ON public.site_content FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "site_content_write"  ON public.site_content FOR ALL    TO authenticated USING ((SELECT get_user_grau()) <= 2);

-- logo_projeto: leitura pública; escrita para grau <= 2
CREATE POLICY "logo_select" ON public.logo_projeto FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "logo_write"  ON public.logo_projeto FOR ALL    TO authenticated USING ((SELECT get_user_grau()) <= 2);

-- revisoes: autenticados leem; diretores ou acima escrevem
CREATE POLICY "revisoes_select" ON public.revisoes FOR SELECT TO authenticated USING (true);
CREATE POLICY "revisoes_write"  ON public.revisoes FOR ALL    TO authenticated USING ((SELECT get_user_grau()) <= 3);

-- logistica: todos autenticados leem; leitura geral + escrita para grau <=3
CREATE POLICY "logistica_select" ON public.logistica_itens FOR SELECT TO authenticated USING (true);
CREATE POLICY "logistica_write"  ON public.logistica_itens FOR ALL    TO authenticated USING ((SELECT get_user_grau()) <= 3);

-- gestão estratégica: autenticados leem; grau <=3 escreve
CREATE POLICY "swot_rw"   ON public.gestao_swot   FOR ALL TO authenticated USING (true) WITH CHECK ((SELECT get_user_grau()) <= 3);
CREATE POLICY "pdca_rw"   ON public.gestao_pdca   FOR ALL TO authenticated USING (true) WITH CHECK ((SELECT get_user_grau()) <= 3);
CREATE POLICY "bsc_rw"    ON public.gestao_bsc    FOR ALL TO authenticated USING (true) WITH CHECK ((SELECT get_user_grau()) <= 3);
CREATE POLICY "spliss_rw" ON public.gestao_spliss FOR ALL TO authenticated USING (true) WITH CHECK ((SELECT get_user_grau()) <= 3);
CREATE POLICY "canvas_rw" ON public.gestao_canvas FOR ALL TO authenticated USING (true) WITH CHECK ((SELECT get_user_grau()) <= 3);

-- pmo: autenticados
CREATE POLICY "pmo_projetos_rw" ON public.pmo_projetos FOR ALL TO authenticated USING (true);
CREATE POLICY "pmo_riscos_rw"   ON public.pmo_riscos   FOR ALL TO authenticated USING (true);

-- competição: autenticados
CREATE POLICY "competicao_rw" ON public.competicao_edicoes FOR ALL TO authenticated USING (true);

-- produtos, vendas, campanhas: marketing
CREATE POLICY "produtos_select" ON public.produtos  FOR SELECT TO authenticated USING (true);
CREATE POLICY "produtos_write"  ON public.produtos  FOR ALL    TO authenticated USING ((SELECT get_user_grau()) <= 3);
CREATE POLICY "vendas_rw"       ON public.vendas    FOR ALL    TO authenticated USING ((SELECT get_user_grau()) <= 3);
CREATE POLICY "campanhas_rw"    ON public.campanhas FOR ALL    TO authenticated USING ((SELECT get_user_grau()) <= 3);

-- pedidos_funko: autenticados
CREATE POLICY "funko_select" ON public.pedidos_funko FOR SELECT TO authenticated USING (true);
CREATE POLICY "funko_insert" ON public.pedidos_funko FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "funko_update" ON public.pedidos_funko FOR UPDATE TO authenticated USING ((SELECT get_user_grau()) <= 3);
CREATE POLICY "funko_delete" ON public.pedidos_funko FOR DELETE TO authenticated USING ((SELECT get_user_grau()) <= 2);

-- contatos: inserção pública (site); leitura apenas para autenticados
CREATE POLICY "contatos_insert" ON public.contatos FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "contatos_select" ON public.contatos FOR SELECT TO authenticated USING ((SELECT get_user_grau()) <= 3);

-- estatuto: leitura para autenticados; escrita para grau <=2
CREATE POLICY "estatuto_select" ON public.estatuto_docs FOR SELECT TO authenticated USING (true);
CREATE POLICY "estatuto_write"  ON public.estatuto_docs FOR ALL    TO authenticated USING ((SELECT get_user_grau()) <= 2);

-- organograma
CREATE POLICY "organograma_select" ON public.organograma FOR SELECT TO authenticated USING (true);
CREATE POLICY "organograma_write"  ON public.organograma FOR ALL    TO authenticated USING ((SELECT get_user_grau()) <= 3);

-- planejamento
CREATE POLICY "planejamento_select" ON public.planejamento_anual FOR SELECT TO authenticated USING (true);
CREATE POLICY "planejamento_write"  ON public.planejamento_anual FOR ALL    TO authenticated USING ((SELECT get_user_grau()) <= 2);

-- ═══════════════════════════════════════════════════════════
-- STORAGE BUCKETS
-- Execute separadamente no Supabase ou via API
-- ═══════════════════════════════════════════════════════════

/*
-- Criar buckets via SQL (Supabase Storage API)
INSERT INTO storage.buckets (id, name, public) VALUES ('fotos', 'fotos', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('documentos', 'documentos', false) ON CONFLICT DO NOTHING;

-- Políticas de Storage
CREATE POLICY "fotos_upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'fotos');
CREATE POLICY "fotos_read"   ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'fotos');
CREATE POLICY "logos_upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'logos');
CREATE POLICY "logos_read"   ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'logos');
*/

-- ═══════════════════════════════════════════════════════════
-- DADOS INICIAIS — Usuário Master
-- ═══════════════════════════════════════════════════════════
-- ATENÇÃO: Primeiro crie o usuário no Supabase Auth (Authentication → Users)
-- com o e-mail desejado, depois execute este INSERT com o UUID gerado.
-- Substitua 'SEU_AUTH_UUID_AQUI' pelo UUID do usuário criado no Auth.

/*
INSERT INTO public.usuarios (auth_id, username, nome, email, perfil, grau)
VALUES (
  'SEU_AUTH_UUID_AQUI',
  'master',
  'Master Admin',
  'master@mnimperialowls.com',
  'master',
  1
);
*/

-- ═══════════════════════════════════════════════════════════
-- TRIGGERS: updated_at automático
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplica trigger nas tabelas com updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['usuarios','equipes','atletas','organograma','site_content',
    'revisoes','planejamento_anual','logistica_itens','gestao_swot','gestao_pdca',
    'gestao_bsc','gestao_spliss','gestao_canvas','pmo_projetos','produtos',
    'pedidos_funko','estatuto_docs'] LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS trigger_updated_at ON public.%I;
      CREATE TRIGGER trigger_updated_at
        BEFORE UPDATE ON public.%I
        FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
    ', t, t);
  END LOOP;
END $$;
