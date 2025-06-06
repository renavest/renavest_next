-- SQL script to trim names in the pending_therapists table
-- This script removes leading/trailing whitespace and handles special trailing characters

BEGIN;

-- Update all names to remove leading and trailing whitespace
UPDATE pending_therapists 
SET name = TRIM(name)
WHERE name IS NOT NULL 
  AND name != TRIM(name);

-- Update names that have trailing single quotes or other unwanted characters
-- This handles cases like "Monica Bradshaw '"
UPDATE pending_therapists 
SET name = TRIM(TRAILING '''' FROM name)
WHERE name IS NOT NULL 
  AND name LIKE '%''%';

-- Additional cleanup for other potential trailing characters
UPDATE pending_therapists 
SET name = TRIM(TRAILING '"' FROM name)
WHERE name IS NOT NULL 
  AND name LIKE '%"%';

-- Remove any trailing periods
UPDATE pending_therapists 
SET name = TRIM(TRAILING '.' FROM name)
WHERE name IS NOT NULL 
  AND name LIKE '%.';

-- Remove any trailing commas
UPDATE pending_therapists 
SET name = TRIM(TRAILING ',' FROM name)
WHERE name IS NOT NULL 
  AND name LIKE '%,';

-- Final cleanup: ensure no double spaces exist within names
UPDATE pending_therapists 
SET name = REGEXP_REPLACE(name, '\s+', ' ', 'g')
WHERE name IS NOT NULL 
  AND name ~ '\s\s+';

-- Update the updated_at timestamp for all modified records
UPDATE pending_therapists 
SET updated_at = NOW()
WHERE name IS NOT NULL;

-- Display the results for verification
SELECT 
    id,
    name,
    clerk_email,
    updated_at
FROM pending_therapists 
ORDER BY updated_at DESC;

COMMIT;

-- Optional: Show count of records that were updated
SELECT 
    COUNT(*) as total_records,
    COUNT(CASE WHEN name IS NOT NULL THEN 1 END) as records_with_names
FROM pending_therapists; 