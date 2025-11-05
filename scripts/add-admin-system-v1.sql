-- Adicionar campos de plano e expiração aos usuários
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'free';
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS created_by_admin UUID REFERENCES auth.users(id);

-- Criar tabela de planos
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  duration_days INTEGER NOT NULL,
  price DECIMAL(10,2),
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir planos padrão
INSERT INTO plans (name, duration_days, price, features) VALUES
  ('Mensal', 30, 97.00, '{"campaigns": "unlimited", "domains": "unlimited", "clicks": "unlimited"}'),
  ('Trimestral', 90, 247.00, '{"campaigns": "unlimited", "domains": "unlimited", "clicks": "unlimited"}'),
  ('Semestral', 180, 447.00, '{"campaigns": "unlimited", "domains": "unlimited", "clicks": "unlimited"}'),
  ('Anual', 365, 797.00, '{"campaigns": "unlimited", "domains": "unlimited", "clicks": "unlimited"}')
ON CONFLICT DO NOTHING;

-- Criar tabela de histórico de pagamentos
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  transaction_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_users_plan_expires ON auth.users(plan_expires_at);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON auth.users(is_admin);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
