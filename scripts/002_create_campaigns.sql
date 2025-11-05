-- Campaigns table
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  safe_page_url text not null,
  offer_page_url text not null,
  slug text unique not null,
  custom_domain text,
  
  -- Targeting
  countries text[] default '{}',
  languages text[] default '{}',
  devices text[] default '{}', -- mobile, desktop, tablet
  traffic_sources text[] default '{}', -- tiktok, facebook, google
  
  -- Stats
  total_clicks integer default 0,
  bot_clicks integer default 0,
  real_clicks integer default 0,
  conversions integer default 0,
  
  -- Status
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.campaigns enable row level security;

-- RLS Policies
create policy "Users can view own campaigns"
  on public.campaigns for select
  using (auth.uid() = user_id);

create policy "Users can create own campaigns"
  on public.campaigns for insert
  with check (auth.uid() = user_id);

create policy "Users can update own campaigns"
  on public.campaigns for update
  using (auth.uid() = user_id);

create policy "Users can delete own campaigns"
  on public.campaigns for delete
  using (auth.uid() = user_id);

-- Index for performance
create index campaigns_user_id_idx on public.campaigns(user_id);
create index campaigns_slug_idx on public.campaigns(slug);
