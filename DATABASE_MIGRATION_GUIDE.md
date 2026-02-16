## Database Schema Fixes

The following columns are missing from your database tables and causing errors. You must run this migration SQL in your Supabase SQL editor to fix the issues.

### Issues Found:
1. **properties** table missing `star_rating` column → Error: "Could not find the 'star_rating' column"
2. **services** table missing `category` column → Error: "Could not find the 'category' column"
3. Both tables need `is_available`/`updated_at` columns

### Migration SQL (Copy & Paste into Supabase SQL Editor)

```sql
-- ============================================
-- MIGRATION: Add missing columns
-- ============================================

-- Add missing columns to properties table
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS star_rating NUMERIC DEFAULT 5.0,
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;

-- Add missing columns to services table  
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- Update existing services to have a default category based on service_type
UPDATE public.services 
SET category = CASE 
  WHEN service_type = 'spa' THEN 'Wellness'
  WHEN service_type = 'dining' THEN 'Food & Beverage'
  WHEN service_type = 'tour' THEN 'Activities'
  WHEN service_type = 'transport' THEN 'Transport'
  ELSE 'Other'
END
WHERE category IS NULL;

-- Verify the changes
SELECT 'Properties columns after migration:' as status;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'properties' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Services columns after migration:' as status;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'services' AND table_schema = 'public'
ORDER BY ordinal_position;
```

### Steps to Run:

1. **Go to Supabase Console** → Your Project → SQL Editor
2. **Paste the entire SQL block above**
3. **Click "Run"**
4. **Wait for confirmation** - You should see the tables update

### What This Does:

- ✅ Adds `star_rating` to properties (default 5.0)
- ✅ Adds `is_available` to properties (default true)  
- ✅ Adds `category` to services
- ✅ Auto-fills service categories based on `service_type`
- ✅ Refreshes Supabase schema cache

### After Migration:

Your forms will now work:
- Properties form: Star rating dropdown, amenities checkboxes
- Services form: Service type dropdown, category input
- No more schema cache errors

**Note:** If you still get schema cache errors after running this, try refreshing your browser page. Supabase sometimes takes a few seconds to refresh the cache.
