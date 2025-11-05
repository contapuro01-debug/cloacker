-- Clicks tracking table
create table if not exists public.clicks (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  
  -- Detection results
  is_bot boolean not null,
  confidence_score integer not null, -- 0-100
  detection_reason text,
  
  -- Device fingerprint
  fingerprint_hash text not null,
  user_agent text,
  ip_address text,
  country text,
  city text,
  device_type text, -- mobile, desktop, tablet
  browser text,
  os text,
  
  -- Tracking params
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referrer text,
  
  -- Pixel IDs
  fbclid text,
  gclid text,
  ttclid text,
  
  -- Timestamps
  created_at timestamp with time zone default now()
);

-- Enable RLS - clicks are viewable by campaign owner
alter table public.clicks enable row level security;

create policy "Users can view clicks for own campaigns"
  on public.clicks for select
  using (
    exists (
      select 1 from public.campaigns
      where campaigns.id = clicks.campaign_id
      and campaigns.user_id = auth.uid()
    )
  );

-- Indexes for performance
create index clicks_campaign_id_idx on public.clicks(campaign_id);
create index clicks_created_at_idx on public.clicks(created_at desc);
create index clicks_is_bot_idx on public.clicks(is_bot);
create index clicks_fingerprint_idx on public.clicks(fingerprint_hash);
