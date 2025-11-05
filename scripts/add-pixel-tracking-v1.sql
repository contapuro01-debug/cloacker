-- Add pixel configuration fields to campaigns table
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS meta_pixel_id TEXT,
ADD COLUMN IF NOT EXISTS meta_access_token TEXT,
ADD COLUMN IF NOT EXISTS tiktok_pixel_id TEXT,
ADD COLUMN IF NOT EXISTS tiktok_access_token TEXT,
ADD COLUMN IF NOT EXISTS google_ads_id TEXT,
ADD COLUMN IF NOT EXISTS google_conversion_label TEXT;

-- Create pixel_events table to track all events sent
CREATE TABLE IF NOT EXISTS pixel_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  click_id UUID REFERENCES clicks(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'meta', 'tiktok', 'google'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  error_message TEXT,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for pixel_events
ALTER TABLE pixel_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view pixel events for own campaigns"
  ON pixel_events FOR SELECT
  USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE user_id = auth.uid()
    )
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_pixel_events_campaign_id ON pixel_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_pixel_events_click_id ON pixel_events(click_id);
CREATE INDEX IF NOT EXISTS idx_pixel_events_created_at ON pixel_events(created_at DESC);
