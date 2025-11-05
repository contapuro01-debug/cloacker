-- Add tags and groups system
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS group_name TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS offer_name TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_campaigns_tags ON campaigns USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_campaigns_group_name ON campaigns (group_name);
CREATE INDEX IF NOT EXISTS idx_campaigns_offer_name ON campaigns (offer_name);
