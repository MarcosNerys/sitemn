# 🦉 MN Imperialowls — Sistema de Gestão Esportiva Social

**Stack:** HTML5 + CSS3 + JavaScript (Vanilla) | **Backend:** Supabase (PostgreSQL + Auth + Storage) | **Hosting:** Netlify

---

## ✅ Funcionalidades Implementadas

### 🌗 Tema Claro/Escuro
- Toggle em todas as páginas com persistência no `localStorage`
- Paleta oficial: Ciano `#00c8e0` | Chumbo `#3a3f4b` | Preto `#0a0c0f` | Branco `#fff`

### 🔐 Autenticação com Supabase
- Login via email + senha (Supabase Auth)
- Sessão persistente com `autoRefreshToken`
- Reset de senha por e-mail
- Fallback demo (modo offline sem Supabase)

### 👥 Hierarquia de Perfis e Permissões

| Perfil | Grau | Permissões |
|--------|------|-----------|
| **Master** | 1 | Acesso total, excluir usuários |
| **CEO** | 2 | Tudo exceto excluir usuários |
| **Dir. Executivo** | 3 | Planejamento, revisões, gestão estratégica, estatuto |
| **Dir. Marketing** | 3 | Marketing, vendas, Funko MAG, atletas |
| **Dir. Organização** | 3 | Equipes, atletas, organograma, logística, competição |
| **Usuário** | 4 | Somente leitura |

### 📋 Módulos do Painel Administrativo

| Módulo | Descrição |
|--------|-----------|
| **Dashboard** | KPIs em tempo real, atividade recente, ações rápidas |
| **Usuários** | CRUD de usuários com controle de perfis |
| **Atletas** | CRUD, gamificação (XP/nível), uniformes, ranking |
| **Equipes** | Gestão de equipes com exclusão de atletas |
| **Organograma** | Hierarquia visual interativa |
| **Planejamento Anual** | Documento editável com controle de versão |
| **Revisões** | Quinzenal, mensal e semestral com fluxo de aprovação |
| **Estatuto & Docs** | Editor de documentos institucionais |
| **SWOT** | Análise com 4 quadrantes + 4 estratégias |
| **PDCA** | Ciclo Plan/Do/Check/Act com indicadores |
| **BSC** | Balanced Scorecard com 4 perspectivas |
| **SPLISS** | 9 pilares de política esportiva |
| **Canvas** | Project Model Canvas visual |
| **PMO** | Portfólio de projetos + registro de riscos |
| **Logística** | Solicitações com fluxo de aprovação CEO/Master |
| **Competição MN Cup** | Súmulas e histórico de partidas |
| **Marketing & Vendas** | Catálogo, vendas, campanhas, relatórios |
| **Funko Pop MAG** | Pedidos com upload de foto do cliente |
| **Editor do Site** | Edição de todas as seções do site público |

### 🌐 Site Público (index.html)
- Hero animado com partículas
- Seções: Sobre, Missão/Visão/Valores, Equipes, Impacto Social, Contato
- **Formulários segmentados de contato:**
  - ⭐ Patrocinador (com CNPJ, tipo e faixa de investimento)
  - 💚 Voluntário (com áreas de atuação e disponibilidade)
  - 🏃 Atleta (com modalidade, nível e histórico)
  - 📨 Contato Geral (com categorias de assunto)
- Conteúdo carregado dinamicamente via Supabase
- Tema claro/escuro

---

## 🗂️ Estrutura de Arquivos

```
index.html              — Site público institucional
login.html              — Tela de login com animações
dashboard.html          — Painel administrativo
netlify.toml            — Configuração do Netlify (headers, redirects)
_redirects              — Redirects simplificados
.env.example            — Template de variáveis de ambiente
.gitignore              — Arquivos ignorados pelo Git
supabase/
  schema.sql            — Schema completo (tabelas + RLS + triggers)
SETUP.md                — Guia passo a passo de deploy
css/
  style.css             — Paleta oficial, componentes globais, temas
  dashboard.css         — Layout do painel (sidebar, topbar, módulos)
js/
  supabase.js           — Cliente Supabase (DB, Storage, Auth, Realtime)
  auth.js               — Autenticação, sessão, permissões e tema
  utils.js              — Toast, modais, formatação, helpers
  dashboard.js          — Navegação, roteamento de módulos
  modules/
    dashboard_home.js   — Dashboard com KPIs e atividade recente
    usuarios.js         — CRUD de usuários
    atletas.js          — Atletas + Equipes (gamificação, uniformes)
    gestao.js           — SWOT, PDCA, BSC, SPLISS, Canvas, PMO,
                          Planejamento, Revisões, Estatuto, Organograma,
                          Logística, Competição
    marketing.js        — Catálogo, vendas, campanhas, relatórios
    funko.js            — Funko Pop MAG (upload de foto)
    site_editor.js      — Editor do site público
```

---

## 📡 Tabelas Supabase

| Tabela | Uso |
|--------|-----|
| `usuarios` | Perfis e permissões dos usuários |
| `equipes` | Times do projeto |
| `atletas` | Cadastro de atletas com gamificação |
| `organograma` | Estrutura organizacional |
| `site_content` | Conteúdo do site público (dinâmico) |
| `logo_projeto` | Logo/mascote do projeto |
| `revisoes` | Revisões quinzenal/mensal/semestral |
| `planejamento_anual` | Planejamento anual do projeto |
| `logistica_itens` | Solicitações de materiais |
| `gestao_swot` | Análise SWOT |
| `gestao_pdca` | Ciclo PDCA |
| `gestao_bsc` | Balanced Scorecard |
| `gestao_spliss` | SPLISS (9 pilares) |
| `gestao_canvas` | Project Model Canvas |
| `pmo_projetos` | Portfólio de projetos |
| `pmo_riscos` | Registro de riscos |
| `competicao_edicoes` | Súmulas e partidas |
| `produtos` | Catálogo de produtos |
| `vendas` | Registro de vendas |
| `campanhas` | Campanhas de marketing |
| `pedidos_funko` | Pedidos Funko Pop MAG |
| `contatos` | Formulários do site público |
| `estatuto_docs` | Estatuto e documentos |

---

## 🔗 URLs do Sistema

| URL | Descrição |
|-----|-----------|
| `/` ou `/index.html` | Site público institucional |
| `/login.html` | Tela de login |
| `/dashboard.html` | Painel administrativo |
| `/dashboard.html#dashboard` | Home do painel |
| `/dashboard.html#atletas` | Módulo atletas |
| `/dashboard.html#equipes` | Módulo equipes |
| `/dashboard.html#marketing` | Marketing & Vendas |
| `/dashboard.html#funko` | Funko Pop MAG |
| `/dashboard.html#swot` | Análise SWOT |
| `/dashboard.html#bsc` | Balanced Scorecard |
| `/dashboard.html#competicao` | Competição MN Cup |
| `/dashboard.html#site-editor` | Editor do site |

---

## 🚀 Deploy Rápido

### 1. Netlify (drag-and-drop)
Arraste a pasta do projeto em [app.netlify.com/drop](https://app.netlify.com/drop)

### 2. Supabase
Crie o projeto e execute `supabase/schema.sql` no SQL Editor

### 3. Conectar
Atualize `js/supabase.js` com a URL e anon key do seu projeto

**Ver guia completo:** [SETUP.md](./SETUP.md)

---

## 🗄️ Supabase Storage — Buckets

| Bucket | Acesso | Uso |
|--------|--------|-----|
| `fotos` | Público | Fotos de atletas e Funko MAG |
| `logos` | Público | Logo e imagens do projeto |
| `documentos` | Privado | Documentos internos |

---

## 🏗️ Próximos Passos Recomendados

1. **Notificações por e-mail** — usar Resend/SendGrid para notificar revisões e logística
2. **PWA** — adicionar `manifest.json` e Service Worker para instalação como app
3. **Exportação PDF** — integrar jsPDF para documentos e súmulas
4. **Calendário** — visualização de treinos e eventos
5. **Chat interno** — usando Supabase Realtime
6. **Relatórios avançados** — dashboards com Chart.js e ECharts
7. **App Mobile** — React Native ou PWA instalável

---

*Última atualização: Abril 2025 — MN Imperialowls © 2025*
