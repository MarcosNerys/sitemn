# 🦉 MN Imperialowls — Guia de Deploy: Netlify + Supabase

> Guia completo para colocar o sistema no ar em menos de 30 minutos.

---

## ✅ Pré-requisitos

- Conta no [Netlify](https://netlify.com) (plano Free funciona)
- Conta no [Supabase](https://supabase.com) (plano Free funciona)
- Opcional: conta no GitHub (para deploy contínuo)

---

## PARTE 1 — Configurar o Supabase

### 1.1 Criar o Projeto

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Clique em **"New Project"**
3. Preencha:
   - **Name:** `mn-imperialowls` (ou outro nome)
   - **Database Password:** crie uma senha forte e **guarde-a**
   - **Region:** `South America (São Paulo)` — melhor latência para o Brasil
4. Clique em **"Create new project"** e aguarde ~2 minutos

### 1.2 Executar o Schema SQL

1. No dashboard do Supabase, acesse **SQL Editor** → **New query**
2. Copie todo o conteúdo do arquivo `supabase/schema.sql`
3. Cole no editor e clique em **"Run"** (ou Ctrl+Enter)
4. Verifique que não há erros em vermelho
5. Acesse **Table Editor** para confirmar que as tabelas foram criadas

### 1.3 Criar o Usuário Master (Primeiro Acesso)

1. No Supabase, vá em **Authentication** → **Users** → **"Invite user"**
2. Digite o e-mail do usuário master (ex: `master@mnimperialowls.com`) e clique em **Send Invite**
   - OU use **"Add user"** e crie com email + senha diretamente
3. Após criar, **copie o UUID** do usuário (aparece na lista)
4. Volte ao **SQL Editor** e execute:

```sql
INSERT INTO public.usuarios (auth_id, username, nome, email, perfil, grau)
VALUES (
  'UUID_COPIADO_AQUI',   -- substitua pelo UUID do Auth
  'master',
  'Master Admin',
  'master@mnimperialowls.com',
  'master',
  1
);
```

### 1.4 Criar os Buckets de Storage

1. No Supabase, acesse **Storage**
2. Clique em **"New bucket"**
3. Crie os seguintes buckets:
   - **`fotos`** — marque **Public** (fotos de atletas e Funko)
   - **`logos`** — marque **Public** (logos do projeto)
   - **`documentos`** — deixe **Private** (documentos internos)

### 1.5 Obter as Credenciais da API

1. No Supabase, acesse **Project Settings** → **API**
2. Anote:
   - **Project URL:** `https://XXXXXXXXXXXX.supabase.co`
   - **anon / public key:** começa com `eyJhbGci...`
3. **Nunca compartilhe** a `service_role key` — ela bypassa o RLS

---

## PARTE 2 — Configurar o Projeto

### 2.1 Atualizar as Credenciais no Código

Abra o arquivo `js/supabase.js` e substitua:

```javascript
const SUPABASE_URL = 'https://SEU_PROJETO.supabase.co';
const SUPABASE_ANON_KEY = 'SUA_ANON_KEY_AQUI';
```

Pelos valores que você anotou no passo 1.5.

> **Dica segura para produção:** Use variáveis de ambiente do Netlify (veja Parte 3).

---

## PARTE 3 — Deploy no Netlify

### Opção A — Deploy Manual (mais rápido)

1. Acesse [app.netlify.com/drop](https://app.netlify.com/drop)
2. **Arraste a pasta inteira do projeto** para a área indicada
3. Aguarde o upload (~30 segundos)
4. Seu site estará no ar com uma URL `random-name.netlify.app`
5. Renomeie o site em **Site Settings** → **Domain management**

### Opção B — Deploy via Git (recomendado para atualizações)

1. Crie um repositório no GitHub e faça push de todos os arquivos
2. No Netlify, clique em **"Add new site"** → **"Import an existing project"**
3. Conecte com o GitHub e selecione o repositório
4. Configurações de build:
   - **Build command:** deixe em branco (site estático)
   - **Publish directory:** `.` (raiz do projeto)
5. Clique em **"Deploy site"**

### 3.1 Configurar Variáveis de Ambiente no Netlify (Seguro)

Em vez de colocar as credenciais no código, configure como variáveis:

1. No Netlify, acesse o site → **Site settings** → **Environment variables**
2. Clique em **"Add a variable"** e adicione:
   - `SUPABASE_URL` → `https://SEU_PROJETO.supabase.co`
   - `SUPABASE_ANON_KEY` → sua chave anon

3. Crie um arquivo `js/env.js` para injetar as variáveis:

```javascript
// Este arquivo é gerado pelo build do Netlify
// Para uso local, configure manualmente
window.ENV_SUPABASE_URL = ''; // deixe vazio — usa js/supabase.js
window.ENV_SUPABASE_ANON_KEY = '';
```

> Para injeção automática de variáveis do Netlify em sites estáticos,
> use Netlify Edge Functions ou snippet injection nas configurações de deploy.

### 3.2 Configurar Domínio Personalizado (Opcional)

1. No Netlify, acesse **Domain settings** → **Add custom domain**
2. Digite seu domínio (ex: `mnimperialowls.com`)
3. Configure os registros DNS conforme indicado
4. O HTTPS é configurado automaticamente pelo Netlify

---

## PARTE 4 — Configurar o Supabase Auth

### 4.1 URL de Redirecionamento

1. No Supabase, acesse **Authentication** → **URL Configuration**
2. Em **Site URL**, coloque a URL do seu site Netlify:
   ```
   https://seu-site.netlify.app
   ```
3. Em **Redirect URLs**, adicione:
   ```
   https://seu-site.netlify.app/login.html
   https://seu-site.netlify.app/dashboard.html
   ```

### 4.2 Configurações de E-mail

1. Acesse **Authentication** → **Providers** → **Email**
2. Desmarque "Confirm email" se quiser login imediato (não recomendado em produção)
3. Para envio de e-mails reais (reset de senha), configure um SMTP:
   - Acesse **Project Settings** → **Auth** → **SMTP Settings**
   - Use Resend, SendGrid, Gmail SMTP ou similar

---

## PARTE 5 — Cadastrar Usuários

### Perfis disponíveis:

| Perfil | Acesso |
|--------|--------|
| `master` | Acesso total |
| `ceo` | Amplo acesso, sem excluir usuários |
| `dir_executivo` | Planejamento e gestão estratégica |
| `dir_marketing` | Marketing, vendas e Funko MAG |
| `dir_organizacao` | Operação: atletas, equipes, logística |
| `usuario` | Somente leitura |

### Processo para cada novo usuário:

1. **Supabase Auth** → Authentication → Users → Add user
   - E-mail + senha provisória
2. **SQL Editor** → insira o registro na tabela `usuarios`:
   ```sql
   INSERT INTO public.usuarios (auth_id, username, nome, email, perfil, grau)
   VALUES ('UUID_DO_AUTH', 'nome_usuario', 'Nome Completo', 'email@exemplo.com', 'dir_marketing', 3);
   ```
3. **Ou use o painel**: login com master → módulo Usuários → Novo Usuário

---

## PARTE 6 — Checklist Final de Produção

- [ ] Schema SQL executado sem erros
- [ ] Buckets de storage criados (fotos, logos, documentos)
- [ ] Usuário master criado no Auth + tabela usuarios
- [ ] Credenciais do Supabase atualizadas no `js/supabase.js`
- [ ] Site publicado no Netlify
- [ ] URL de redirecionamento configurada no Supabase Auth
- [ ] Login testado com usuário master
- [ ] Troca de tema claro/escuro funcionando
- [ ] Formulários do site público testados
- [ ] Upload de foto no Funko MAG testado
- [ ] Permissões por perfil verificadas

---

## 🔧 Solução de Problemas Comuns

### "Invalid API Key"
- Verifique se a `SUPABASE_ANON_KEY` em `js/supabase.js` está correta
- Confirme que não há espaços extras

### Login não redireciona para dashboard
- Verifique a URL de redirecionamento nas configurações do Supabase Auth
- Certifique-se de que o usuário existe na tabela `usuarios` com o `auth_id` correto

### "Row-level security violation"
- O usuário está autenticado mas não tem registro na tabela `usuarios`
- Execute o INSERT do usuário na tabela `usuarios` com o `auth_id` correto

### Fotos não carregam no Funko MAG
- Verifique se o bucket `fotos` está criado no Supabase Storage
- Confirme que a política de storage permite upload de usuários autenticados

### Site público não carrega conteúdo dinâmico
- Verifique se a política `site_content_select` permite leitura anônima (`anon`)
- Confirme as credenciais em `js/supabase.js`

---

## 📞 Suporte

- Documentação Supabase: [supabase.com/docs](https://supabase.com/docs)
- Documentação Netlify: [docs.netlify.com](https://docs.netlify.com)
- SQL Editor: [app.supabase.com](https://app.supabase.com) → seu projeto → SQL Editor

---

*MN Imperialowls © 2025 — Sistema de Gestão Esportiva Social*
