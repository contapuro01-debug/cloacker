-- Script para corrigir acesso admin
-- Execute este script no Supabase SQL Editor

-- 1. Criar registro de subscription para todos os usuários existentes (se não existir)
INSERT INTO public.user_subscriptions (user_id, is_admin, plan_type, plan_expires_at)
SELECT 
  id,
  false, -- não é admin por padrão
  'free',
  NOW() + INTERVAL '365 days' -- 1 ano de acesso
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_subscriptions)
ON CONFLICT (user_id) DO NOTHING;

-- 2. Tornar o PRIMEIRO usuário cadastrado como ADMIN com acesso VITALÍCIO
UPDATE public.user_subscriptions
SET 
  is_admin = true,
  plan_type = 'lifetime',
  plan_expires_at = NOW() + INTERVAL '100 years' -- acesso vitalício
WHERE user_id = (
  SELECT id 
  FROM auth.users 
  ORDER BY created_at ASC 
  LIMIT 1
);

-- 3. Verificar se funcionou (deve mostrar seu usuário como admin)
SELECT 
  u.email,
  us.is_admin,
  us.plan_type,
  us.plan_expires_at
FROM auth.users u
LEFT JOIN public.user_subscriptions us ON u.id = us.user_id
ORDER BY u.created_at ASC;
