# 🔧 Configuração do Sistema Admin - GhostLayer

## 📋 Passo a Passo para Configurar o Admin

### 1️⃣ Executar Scripts SQL

Você precisa executar 3 scripts SQL na ordem correta:

#### **Script 1: Adicionar Pixel Tracking**
📁 Arquivo: `scripts/add-pixel-tracking-v1.sql`

**Como executar:**
1. Acesse o Supabase Dashboard: https://supabase.com/dashboard
2. Selecione seu projeto GhostLayer
3. Vá em **SQL Editor** (menu lateral esquerdo)
4. Clique em **New Query**
5. Copie e cole TODO o conteúdo do arquivo `scripts/add-pixel-tracking-v1.sql`
6. Clique em **Run** (ou pressione Ctrl+Enter)
7. Aguarde a mensagem de sucesso ✅

#### **Script 2: Adicionar Sistema Admin**
📁 Arquivo: `scripts/add-admin-system-v1.sql`

**Como executar:**
1. No SQL Editor do Supabase
2. Clique em **New Query**
3. Copie e cole TODO o conteúdo do arquivo `scripts/add-admin-system-v1.sql`
4. Clique em **Run**
5. Aguarde a mensagem de sucesso ✅

#### **Script 3: Criar Função Admin**
📁 Arquivo: `scripts/create-admin-function-v1.sql`

**Como executar:**
1. No SQL Editor do Supabase
2. Clique em **New Query**
3. Copie e cole TODO o conteúdo do arquivo `scripts/create-admin-function-v1.sql`
4. Clique em **Run**
5. Aguarde a mensagem de sucesso ✅

#### **Script 4: Tornar Você Admin**
📁 Arquivo: `scripts/setup-first-admin-v1.sql`

**Como executar:**
1. No SQL Editor do Supabase
2. Clique em **New Query**
3. Copie e cole TODO o conteúdo do arquivo `scripts/setup-first-admin-v1.sql`
4. Clique em **Run**
5. Aguarde a mensagem de sucesso ✅

**Este script vai:**
- Tornar o primeiro usuário (você) como admin
- Dar plano vitalício (sem expiração)
- Permitir acesso total ao sistema

---

### 2️⃣ Fazer Logout e Login Novamente

Depois de executar todos os scripts:

1. Faça **logout** do sistema
2. Faça **login** novamente
3. Agora você terá acesso ao painel admin!

---

### 3️⃣ Acessar o Painel Admin

Após fazer login novamente, você verá um novo item no menu:

**📍 URL do Admin:** `/admin`

Ou clique no botão **"Admin"** que aparecerá no menu de navegação (apenas para admins).

---

## 🎯 O que você pode fazer no Admin

- ✅ Criar novos usuários
- ✅ Definir planos (30, 60, 90, 180, 365 dias)
- ✅ Gerenciar acessos
- ✅ Visualizar todos os usuários
- ✅ Renovar planos expirados
- ✅ Bloquear/desbloquear usuários

---

## ⚠️ Problemas Comuns

### "Acesso Expirado" após executar scripts
**Solução:** Faça logout e login novamente. O sistema precisa recarregar suas permissões.

### Botão "Admin" não aparece no menu
**Solução:** 
1. Verifique se executou o script `setup-first-admin-v1.sql`
2. Faça logout e login novamente
3. Verifique no SQL Editor se você é admin:
\`\`\`sql
SELECT id, email, is_admin, plan_type FROM auth.users WHERE email = 'seu-email@exemplo.com';
\`\`\`

### Erro ao executar scripts
**Solução:** Execute os scripts na ordem correta (1 → 2 → 3 → 4)

---

## 📞 Suporte

Se tiver problemas, verifique:
1. Todos os scripts foram executados com sucesso
2. Você fez logout e login após executar os scripts
3. Seu email está correto no banco de dados

---

**Pronto! Agora você tem acesso total ao sistema admin do GhostLayer! 🚀**
