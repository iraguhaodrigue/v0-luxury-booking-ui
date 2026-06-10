# Database & Form Fixes Required

## Step 1: Run the SQL Migration

Copy and paste this entire SQL script into your **Supabase SQL Editor** and run it:

**File Path:** `/scripts/005_complete_schema_fixes.sql`

This will:
- ✅ Create amenities template table with 10 predefined services
- ✅ Add missing columns to all tables
- ✅ Fix schema cache issues
- ✅ Set up RLS policies

**The migration adds:**
- `service_templates` table - predefined services you can select from
- `property_type` column (was missing)
- `star_rating` column (was missing)
- `price_per_day` column in cars
- `property_id` FK in rooms (links rooms to properties)
- All columns have proper defaults

---

## Step 2: Code Fixes Applied

### Properties Page ✅
- Fixed: `type` → `property_type` (database column name)
- Works with star_rating and amenities dropdowns
- Form submits correctly to Supabase

### Cars Page ✅
- Fixed: `daily_rate` → `price_per_day` (database column name)
- Fixed: `seats` → `capacity` (database column name)
- Form now submits without schema cache errors

### Services Page ✅
- Fixed: `price` → `price_per_day` (database column name)
- Service names still editable (user can enter custom names)
- Added `service_type` dropdown (Spa, Dining, Tour, Transport)

### Rooms Page ❌
**ISSUE:** Rooms require `property_id` - you MUST select a property first
**TODO:** Need to rebuild rooms form to show property dropdown

### Users Page ❌
**ISSUE:** Not showing users from database
**TODO:** Need to check auth.users + profiles query

---

## Step 3: What's Still Needed

1. **Rooms Form:**
   - Add property selector (dropdown of existing properties)
   - Room can only be created AFTER selecting a property
   
2. **Services Form:**
   - Option to select from `service_templates` predefined services
   - OR enter custom service name manually
   
3. **Users Page:**
   - Query both `auth.users` and `profiles` tables correctly
   - Display all users with their roles and status

4. **After Migration:**
   - Refresh browser
   - All "schema cache" errors should be gone
   - Forms should submit successfully

---

## Quick Checklist

- [ ] Run migration SQL from `/scripts/005_complete_schema_fixes.sql`
- [ ] Wait for migration to complete
- [ ] Refresh browser
- [ ] Try adding a property (should work now)
- [ ] Try adding a car (should work now)
- [ ] Try adding a service (should work now)
- [ ] Rooms will need property first - select a property, then add room

---

If any errors persist after running the migration, it means:
1. Migration didn't run completely - check Supabase for errors
2. Browser cache issue - hard refresh (Ctrl+Shift+R)
3. Still have old schema cache - Supabase will clear this within a few minutes
