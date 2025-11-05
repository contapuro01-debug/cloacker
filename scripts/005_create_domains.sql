-- Custom domains table
create table if not exists public.domains (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  domain text unique not null,
  is_verified boolean default false,
  verification_token text unique not null,
  
  -- CNAME verification
  cname_target text,
  dns_verified_at timestamp with time zone,
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.domains enable row level security;

create policy "Users can view own domains"
  on public.domains for select
  using (auth.uid() = user_id);

create policy "Users can create own domains"
  on public.domains for insert
  with check (auth.uid() = user_id);

create policy "Users can update own domains"
  on public.domains for update
  using (auth.uid() = user_id);

create policy "Users can delete own domains"
  on public.domains for delete
  using (auth.uid() = user_id);

-- Index
create index domains_user_id_idx on public.domains(user_id);
create index domains_domain_idx on public.domains(domain);
