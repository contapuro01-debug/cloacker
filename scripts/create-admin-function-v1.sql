-- Criar função para buscar status de admin do usuário
-- Esta função é necessária porque auth.users não é diretamente acessível

CREATE OR REPLACE FUNCTION get_user_admin_status(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_admin_result BOOLEAN;
BEGIN
  SELECT is_admin INTO is_admin_result
  FROM auth.users
  WHERE id = user_id;
  
  RETURN COALESCE(is_admin_result, false);
END;
$$;

-- Dar permissão para usuários autenticados executarem a função
GRANT EXECUTE ON FUNCTION get_user_admin_status(UUID) TO authenticated;
