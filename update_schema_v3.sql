-- Add visit_date and visit_type columns to enquiries table
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS visit_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS visit_type TEXT CHECK (visit_type IN ('walkin', 'call'));
