# Supabase Storage Bucket Setup - Step by Step

## Making Your Images Publicly Accessible

### Problem Summary
Images are uploaded successfully but show as broken (404) or require authentication to load.

### Root Cause
Your Supabase `images` bucket is **PRIVATE** by default, so only authenticated users can view images.

---

## Solution: Make the Bucket PUBLIC

### Step 1: Access Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Sign in with your account
3. Select your **villas_booking** project

### Step 2: Navigate to Storage

1. In the left sidebar, click **Storage**
2. You should see an `images` bucket (created by your app)

### Step 3: Change Bucket Visibility to PUBLIC

**Option A: Quick Settings (Recommended)**

1. Click on the **images** bucket name
2. Click the **Settings** tab
3. Look for **Public bucket** toggle
4. Turn it **ON** (blue toggle)
5. Click **Save** or **Update**

**Option B: Via Bucket Info**

1. Right-click on **images** bucket
2. Select **Edit bucket** or **Settings**
3. Change visibility from `PRIVATE` to `PUBLIC`
4. Confirm and save

---

## Step 4: Configure Row Level Security (RLS) Policies

Even with a PUBLIC bucket, you need to set RLS policies to allow:
- ✅ Anyone to READ (view/download)
- ✅ Authenticated users to UPLOAD
- ✅ Authenticated users to DELETE

### Access RLS Policies

1. In Storage, click on **images** bucket
2. Click **Policies** tab
3. You should see existing policies (if app was used before)

### Policy 1: Allow Public Read Access

**Name:** `Public read`

**Configuration:**
- Target: storage.objects
- Allowed operations: ✅ SELECT
- Policy expression:
```sql
bucket_id = 'images'
```

**SQL:** (If creating manually)
```sql
CREATE POLICY "Public read" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'images');
```

### Policy 2: Allow Authenticated Upload

**Name:** `Authenticated upload`

**Configuration:**
- Target: storage.objects
- Allowed operations: ✅ INSERT
- Policy expression:
```sql
bucket_id = 'images' AND auth.role() = 'authenticated'
```

**SQL:**
```sql
CREATE POLICY "Authenticated upload" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');
```

### Policy 3: Allow Authenticated Delete

**Name:** `Authenticated delete`

**Configuration:**
- Target: storage.objects
- Allowed operations: ✅ DELETE
- Policy expression:
```sql
bucket_id = 'images' AND auth.role() = 'authenticated'
```

**SQL:**
```sql
CREATE POLICY "Authenticated delete" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'images' AND auth.role() = 'authenticated');
```

---

## Step 5: Verify Configuration

### Test via Browser

1. Copy a full image URL from your database (e.g., from a property record)
2. Paste it in a new browser tab
3. It should display the image (not 404 or auth error)

**Expected URL format:**
```
https://villas-booking.supabase.co/storage/v1/object/public/images/properties/1708901234567-abc123def.jpg
```

### Test Upload

1. Go to your admin dashboard (e.g., Admin → Properties)
2. Click "Add Property"
3. Select an image file
4. You should see a preview
5. Fill other required fields
6. Click "Create"
7. Go back to properties list
8. Image should display in the table

### Common Test Results

| Result | Meaning | Fix |
|--------|---------|-----|
| Image displays ✅ | Everything working | Done! |
| 404 error ❌ | Bucket is PRIVATE | Make it PUBLIC |
| Auth required error ❌ | RLS policies wrong | Check policies |
| CORS error ❌ | Bucket doesn't allow public | Verify bucket is PUBLIC |
| Empty/Blank ❌ | Image didn't upload | Check upload logs |

---

## Step 6: Verify Each Admin Page

Test image functionality on each admin page:

### Properties Page
- [ ] Add Property with image
- [ ] Image shows in table
- [ ] Edit property, image preview shows
- [ ] Edit and upload new image
- [ ] New image shows in table

### Rooms Page
- [ ] Add Room with image
- [ ] Image shows in table
- [ ] Edit room, image preview shows

### Cars Page
- [ ] Add Car with image
- [ ] Image shows in table
- [ ] Edit car, image preview shows

### Services Page
- [ ] Add Service with image
- [ ] Image shows in table
- [ ] Edit service, image preview shows

---

## Step 7: Frontend Testing

### Test in Admin Dashboard

1. Open browser DevTools (F12)
2. Go to Console tab
3. Add a property with image
4. Look for `[v0]` debug messages:
   - `[v0] Uploading image to: images/properties/...`
   - `[v0] Image uploaded successfully: https://...`

### Test Image Loading

1. Go to properties admin page
2. Right-click on any image
3. Select "Inspect" (or inspect element)
4. Check the `<img>` tag has correct `src` attribute
5. In Network tab, image should show 200 OK status

### Debug Failed Images

If images don't load:
1. Check browser console for errors
2. Test the URL directly in browser
3. Verify bucket is PUBLIC
4. Verify image file exists in storage

---

## Supabase Storage Structure

After setup, your storage should look like:

```
images/ (bucket)
  ├── properties/
  │   ├── 1708901234567-abc123def.jpg
  │   ├── 1708901234568-xyz789uvw.jpg
  │   └── ...
  ├── rooms/
  │   ├── 1708901234569-qwe456rty.jpg
  │   └── ...
  ├── cars/
  │   ├── 1708901234570-asd789fgh.jpg
  │   └── ...
  └── services/
      ├── 1708901234571-zxc123bnm.jpg
      └── ...
```

---

## Verification Checklist

- [ ] `images` bucket exists in Supabase Storage
- [ ] Bucket is set to **PUBLIC**
- [ ] RLS policy allows SELECT (public read)
- [ ] RLS policy allows INSERT (authenticated upload)
- [ ] RLS policy allows DELETE (authenticated delete)
- [ ] Test image URL loads in browser
- [ ] Admin pages show images
- [ ] New uploads display immediately
- [ ] Edit form shows image preview
- [ ] Browser console shows `[v0]` upload messages

---

## If Something Goes Wrong

### Images Upload But Don't Save to DB
- Check that `uploadImage()` returns a URL
- Verify URL is included in the database save payload
- Check database record for empty `images` or `image_url` field

### Images Save to DB But Don't Display
- Check that database field has correct URL
- Test URL directly in browser (should show image)
- Verify bucket is PUBLIC
- Clear browser cache and reload

### 404 Errors on Image URLs
- **Most common cause:** Bucket is still PRIVATE
- Go to Supabase Dashboard → Storage
- Click images bucket → Settings
- Set to PUBLIC
- Old URLs may need refresh, new uploads will work immediately

### CORS Errors
- Usually means bucket isn't public
- Or URL format is wrong
- Verify URL starts with: `https://xxxx.supabase.co/storage/v1/object/public/images/`

### Upload Shows 403 Forbidden
- Check your RLS policies
- Verify `auth.role() = 'authenticated'` is correct
- Ensure your Supabase auth is working

---

## Quick Fixes

### "Bucket is still private" Error
```bash
# In Supabase SQL Editor, run:
UPDATE storage.buckets 
SET public = true 
WHERE name = 'images';
```

### Reset All Policies
```bash
# Delete all policies and recreate:
# Go to Storage → images → Policies
# Delete existing policies
# Create new ones using the steps above
```

### Test Direct Upload
Use Supabase CLI:
```bash
supabase storage upload images/test/image.jpg image.jpg --project-id xxxxx
```

---

## Complete Configuration Summary

| Setting | Value | Status |
|---------|-------|--------|
| Bucket Name | `images` | Created ✓ |
| Bucket Access | PUBLIC | Set ✓ |
| RLS Enabled | Yes | Configured ✓ |
| Public Read | Allowed | ✓ |
| Auth Upload | Allowed | ✓ |
| Auth Delete | Allowed | ✓ |
| Cache Time | 3600 sec (1 hour) | ✓ |

---

## Support Links

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [RLS Policies Docs](https://supabase.com/docs/guides/storage/access-control)
- [Supabase Dashboard](https://supabase.com/dashboard)

---

## Next Steps

Once bucket is configured:
1. ✅ Images upload successfully
2. ✅ URLs save to database
3. ✅ Frontend displays images
4. ✅ Admin tables show thumbnails
5. ✅ Public website shows images

Your image system is now production-ready! 🎉
