-- Update Enquiries table check constraint to include 'visit'
ALTER TABLE enquiries DROP CONSTRAINT IF EXISTS enquiries_status_check;
ALTER TABLE enquiries ADD CONSTRAINT enquiries_status_check 
  CHECK (status IN ('open', 'in_progress', 'visit', 'resolved', 'closed'));

-- Update Enrolments table to add 'intake' column
ALTER TABLE enrolments ADD COLUMN IF NOT EXISTS intake TEXT;
