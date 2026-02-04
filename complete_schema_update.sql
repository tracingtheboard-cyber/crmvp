-- Complete schema update for Enquiry to Enrollment conversion flow
-- Run this in Supabase SQL Editor

-- 1. Update enquiries table status to include 'visit'
DO $$ 
BEGIN
    -- Drop existing constraint if it exists
    ALTER TABLE enquiries DROP CONSTRAINT IF EXISTS enquiries_status_check;
    
    -- Add new constraint with 'visit' status
    ALTER TABLE enquiries ADD CONSTRAINT enquiries_status_check 
    CHECK (status IN ('open', 'in_progress', 'visit', 'resolved', 'closed'));
END $$;

-- 2. Add visit_date and visit_type columns to enquiries table
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS visit_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS visit_type TEXT CHECK (visit_type IN ('walkin', 'call'));

-- 3. Add intake column to enrolments table
ALTER TABLE enrolments ADD COLUMN IF NOT EXISTS intake TEXT CHECK (intake IN ('February', 'May', 'August', 'November'));

-- Verify changes
SELECT 
    'enquiries' as table_name,
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'enquiries' 
  AND column_name IN ('status', 'visit_date', 'visit_type')
UNION ALL
SELECT 
    'enrolments' as table_name,
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'enrolments' 
  AND column_name = 'intake'
ORDER BY table_name, column_name;
