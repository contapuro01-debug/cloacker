-- Detailed bot detection logs
create table if not exists public.bot_detections (
  id uuid primary key default gen_random_uuid(),
  click_id uuid not null references public.clicks(id) on delete cascade,
  
  -- Detection checks
  user_agent_check jsonb,
  referrer_check jsonb,
  headless_check jsonb,
  webdriver_check jsonb,
  canvas_check jsonb,
  webgl_check jsonb,
  plugins_check jsonb,
  storage_check jsonb,
  fonts_check jsonb,
  
  -- Device fingerprint details
  screen_resolution text,
  color_depth integer,
  timezone text,
  language text,
  platform text,
  cores integer,
  memory integer,
  webgl_vendor text,
  webgl_renderer text,
  canvas_fingerprint text,
  installed_fonts text[],
  
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.bot_detections enable row level security;

create policy "Users can view bot detections for own campaigns"
  on public.bot_detections for select
  using (
    exists (
      select 1 from public.clicks
      join public.campaigns on campaigns.id = clicks.campaign_id
      where clicks.id = bot_detections.click_id
      and campaigns.user_id = auth.uid()
    )
  );

-- Index
create index bot_detections_click_id_idx on public.bot_detections(click_id);
