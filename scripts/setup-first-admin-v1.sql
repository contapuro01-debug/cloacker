-- Script para tornar o primeiro usuário como admin
-- Execute este script DEPOIS de criar sua conta

-- Tornar o primeiro usuário (você) como admin com plano vitalício
UPDATE auth.users 
SET 
  is_admin = true,
  plan_type = 'lifetime',
  plan_expires_at = NULL
WHERE id = (
  SELECT id FROM auth.users 
  ORDER BY created_at ASC 
  LIMIT 1
);

-- Verificar se funcionou
SELECT 
  id, 
  email, 
  is_admin, 
  plan_type, 
  plan_expires_at 
FROM auth.users 
WHERE is_admin = true;
