# Supabase Image Storage Configuration Guide

## Complete Setup for Public Image Storage & Display

### 1. Supabase Storage Bucket Configuration

Your images are stored in the `images` bucket (set up in `/lib/supabase/storage.ts`). To make them publicly accessible:

#### Step 1: Create/Verify the Images Bucket in Supabase Dashboard
1. Go to **Supabase Dashboard** → **Storage**
2. Create a bucket named `images` (if it doesn't exist)
3. **CRITICAL:** Set the bucket to **PUBLIC** access

#### Step 2: Configure Row Level Security (RLS) Policies
In Supabase Dashboard, go to **Storage** → **images bucket** → **Policies**:

**Policy 1: Allow Public Read Access**
```sql
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'images');
```

**Policy 2: Allow Authenticated Users to Upload**
```sql
CREATE POLICY "Authenticated Upload" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'images' 
    AND auth.role() = 'authenticated'
  );
```

**Policy 3: Allow Users to Delete Their Own Files**
```sql
CREATE POLICY "User Delete" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'images'
    AND auth.role() = 'authenticated'
  );
```

### 2. Understanding the Upload & URL System

#### How Images Are Uploaded
Located in `/lib/supabase/storage.ts`:

```typescript
export async function uploadImage(file: File, folder: string): Promise<string | null> {
  const supabase = createClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

  // Upload file to 'images' bucket
  const { error } = await supabase.storage
    .from('images')
    .upload(fileName, file, { cacheControl: '3600', upsert: false })

  if (error) {
    console.error('Upload error:', error.message)
    return null
  }

  // Get the PUBLIC URL (works without authentication)
  const { data: urlData } = supabase.storage
    .from('images')
    .getPublicUrl(fileName)

  return urlData.publicUrl  // Example: https://xxxx.supabase.co/storage/v1/object/public/images/properties/1234-abc.jpg
}
```

**Key Points:**
- Files are organized by folder: `properties/`, `rooms/`, `cars/`, `services/`
- Each filename includes timestamp + random string to avoid collisions
- `getPublicUrl()` returns a public URL that works everywhere (no auth needed)
- URLs are automatically cached for 1 hour

### 3. Database Storage Pattern

Images are stored in database records as:

**Properties Table:**
```json
{
  "id": 1,
  "name": "Villa Luxury",
  "images": ["https://xxxx.supabase.co/storage/v1/object/public/images/properties/1234-abc.jpg"],
  // ...
}
```

**Rooms, Cars, Services Tables:**
```json
{
  "id": 1,
  "name": "Deluxe Room",
  "image_url": "https://xxxx.supabase.co/storage/v1/object/public/images/rooms/5678-def.jpg",
  // ...
}
```

### 4. Frontend Display Implementation

#### Admin Dashboard (Table View)
Example from `/app/admin/properties/page.tsx`:

```tsx
{item.images && item.images.length > 0 && item.images[0] ? (
  <img 
    src={item.images[0]} 
    alt={item.name} 
    className="h-12 w-16 object-cover rounded" 
    onError={(e) => {
      console.log("[v0] Image failed to load:", item.images[0])
      e.currentTarget.style.display = 'none'
    }} 
  />
) : (
  <div className="h-12 w-16 bg-muted rounded flex items-center justify-center">
    <ImageIcon className="h-5 w-5 text-muted-foreground" />
  </div>
)}
```

#### Edit Form (Image Preview)
```tsx
const openEdit = (item: Property) => {
  setEditing(item)
  setImagePreview(item.images && item.images.length > 0 ? item.images[0] : null)
  setDialogOpen(true)
}
```

### 5. Common Issues & Solutions

#### ❌ Images Show 404 Error
**Cause:** Bucket is not PUBLIC
**Solution:** 
1. Go to Supabase Dashboard → Storage → images bucket
2. Click the bucket name → Settings
3. Change to PUBLIC access
4. Re-upload or use existing URLs (they should now work)

#### ❌ Images Upload But Don't Save to Database
**Cause:** Image URL is not being saved
**Solution:** Check that `uploadImage()` returns a URL and it's included in the database payload:
```tsx
const url = await uploadImage(imageFile, 'properties')
if (url) images = [url]  // Must save to database
```

#### ❌ CORS Error When Loading Images
**Cause:** Image bucket doesn't allow public access
**Solution:** Ensure bucket is PUBLIC and RLS policies allow SELECT without auth

#### ❌ Images Load Slowly
**Cause:** Need image optimization
**Solution:** Use Next.js Image component for frontend:
```tsx
import Image from 'next/image'

<Image
  src={item.images[0]}
  alt={item.name}
  width={100}
  height={75}
  className="object-cover rounded"
/>
```

### 6. Best Practices for Production

1. **Image Organization**
   - Use folder prefixes: `properties/`, `rooms/`, `cars/`, `services/`
   - Enables easy cleanup and organization

2. **Cache Control**
   - Current setting: `cacheControl: '3600'` (1 hour cache)
   - For static images: Use `cacheControl: '31536000'` (1 year)

3. **File Naming**
   - Current: `{timestamp}-{random}.{ext}` (prevents collisions)
   - Always include a unique identifier

4. **Error Handling**
   - Always add `onError` handler to img tags
   - Log failed URLs for debugging
   - Show placeholder when image fails

5. **Delete Old Images**
   - When replacing an image, delete the old one from storage:
   ```tsx
   await deleteImage(oldImageUrl)  // From /lib/supabase/storage.ts
   ```

### 7. Verification Checklist

- [ ] Supabase bucket named `images` exists
- [ ] Bucket is set to PUBLIC
- [ ] RLS policies allow public SELECT
- [ ] Images upload without errors
- [ ] Database saves URLs correctly
- [ ] URLs load in browser (test directly in URL bar)
- [ ] Admin tables show images
- [ ] Frontend components display images
- [ ] Image preview works in edit forms

### 8. Testing Image Upload

1. Go to Admin → Properties (or any admin page)
2. Click "Add Property"
3. Fill in all fields
4. Select an image file
5. You should see preview
6. Click "Create"
7. Go back to Properties list
8. You should see the image in the table

### 9. URL Format Reference

All public image URLs follow this pattern:
```
https://{your-project-id}.supabase.co/storage/v1/object/public/images/{folder}/{filename}
```

Example:
```
https://villas-booking.supabase.co/storage/v1/object/public/images/properties/1708901234567-abc123def.jpg
```

### 10. Support & Debugging

Enable debug logging in `storage.ts`:
```tsx
console.log('[v0] Upload URL:', urlData.publicUrl)
console.log('[v0] Upload error:', error?.message)
```

Monitor browser DevTools:
- **Network tab:** Check if image URLs return 200 OK
- **Console:** Look for `[v0]` debug messages
- **Storage:** Check if `image_url` or `images` fields have values

---

## Quick Setup Reference

```bash
# Files involved in image handling:
lib/supabase/storage.ts          # Upload & delete functions
lib/supabase/client.ts           # Supabase client creation
app/admin/properties/page.tsx     # Properties image management
app/admin/rooms/page.tsx          # Rooms image management
app/admin/cars/page.tsx           # Cars image management
app/admin/services/page.tsx       # Services image management
```

Your app is now configured for complete image management with Supabase Storage!
