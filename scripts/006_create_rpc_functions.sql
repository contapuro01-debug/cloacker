-- RPC function to increment campaign stats atomically
create or replace function increment_campaign_stats(
  p_campaign_id uuid,
  p_is_bot boolean
)
returns void
language plpgsql
security definer
as $$
begin
  update campaigns
  set 
    total_clicks = total_clicks + 1,
    bot_clicks = case when p_is_bot then bot_clicks + 1 else bot_clicks end,
    real_clicks = case when not p_is_bot then real_clicks + 1 else real_clicks end,
    updated_at = now()
  where id = p_campaign_id;
end;
$$;
