# Image Handling Code Examples - Corrected & Working

## Complete Working Examples for Your Application

### 1. Upload Function (Corrected)

**File:** `/lib/supabase/storage.ts`

The upload function now includes:
- ✅ Better error handling
- ✅ Unique filename generation
- ✅ Debug logging with [v0] prefix
- ✅ Proper public URL generation
- ✅ Try/catch blocks for safety

```typescript
export async function uploadImage(file: File, folder: string): Promise<string | null> {
  try {
    const supabase = createClient()
    
    // Generate unique filename
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
    
    console.log(`[v0] Uploading image to: images/${fileName}`)

    // Upload to 'images' bucket
    const { data, error } = await supabase.storage
      .from('images')
      .upload(fileName, file, { 
        cacheControl: '3600',  // 1 hour cache
        upsert: false 
      })

    if (error) {
      console.error(`[v0] Upload failed for ${fileName}:`, error.message)
      return null
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(fileName)

    const publicUrl = urlData.publicUrl
    console.log(`[v0] Image uploaded successfully:`, publicUrl)
    
    return publicUrl
  } catch (err) {
    console.error('[v0] Upload error:', err)
    return null
  }
}
```

---

### 2. Save URL to Database

**Used in all admin pages: Properties, Rooms, Cars, Services**

This pattern shows how to upload and save:

```typescript
const handleSave = async () => {
  // Validate inputs
  if (!form.name || !form.location || !form.base_price_per_night) { 
    setError('Required fields are missing'); 
    return 
  }

  setSaving(true)
  const supabase = createClient()
  
  // Step 1: Upload image if provided
  let images = editing?.images || []  // Keep existing images if editing
  if (imageFile) { 
    const url = await uploadImage(imageFile, 'properties')
    if (url) images = [url]  // Store as array for properties
  }

  // Step 2: Prepare database payload
  const payload = { 
    name: form.name, 
    property_type: form.property_type, 
    location: form.location,
    images: images,  // Save the uploaded URL
    is_active: true
    // ... other fields
  }

  // Step 3: Save to database
  const { error: dbError } = editing
    ? await supabase.from('properties').update(payload).eq('id', editing.id)
    : await supabase.from('properties').insert(payload)

  if (dbError) { 
    setError(dbError.message)
    setSaving(false)
    return 
  }

  setSaving(false)
  setDialogOpen(false)
  fetchItems()  // Refresh the list
}
```

**For Rooms, Cars, Services** (single image field):
```typescript
let imageUrl = editing?.image_url || null
if (imageFile) { 
  const url = await uploadImage(imageFile, 'rooms')
  if (url) imageUrl = url  // Store as single string
}

const payload = {
  // ...
  image_url: imageUrl  // Single string field
}
```

---

### 3. Display Images in Admin Tables

**Example from Properties Admin Page:**

```typescript
// In table body
{items.map(item => (
  <TableRow key={item.id}>
    {/* Image column */}
    <TableCell>
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
    </TableCell>
    {/* Other columns */}
    <TableCell className="font-medium">{item.name}</TableCell>
    {/* ... */}
  </TableRow>
))}
```

**For single image field (Rooms, Cars, Services):**
```typescript
<TableCell>
  {item.image_url ? (
    <img 
      src={item.image_url} 
      alt={item.name} 
      className="h-12 w-16 object-cover rounded" 
      onError={(e) => {
        console.log("[v0] Image failed to load:", item.image_url)
        e.currentTarget.style.display = 'none'
      }} 
    />
  ) : (
    <div className="h-12 w-16 bg-muted rounded flex items-center justify-center">
      <ImageIcon className="h-5 w-5 text-muted-foreground" />
    </div>
  )}
</TableCell>
```

---

### 4. Image Preview in Forms

**When editing, show the existing image:**

```typescript
const openEdit = (item: Property) => {
  setEditing(item)
  setForm({ /* form fields */ })
  
  // Set image preview from existing image
  setImagePreview(item.images && item.images.length > 0 ? item.images[0] : null)
  
  setImageFile(null)
  setError('')
  setDialogOpen(true)
}

// In the dialog form:
<div>
  <Label>Image</Label>
  <Input 
    type="file" 
    accept="image/*" 
    onChange={e => {
      const f = e.target.files?.[0]
      if (f) { 
        setImageFile(f)
        setImagePreview(URL.createObjectURL(f))
      }
    }} 
  />
  {imagePreview && (
    <img 
      src={imagePreview} 
      alt="Preview" 
      className="mt-2 h-32 w-full object-cover rounded border" 
    />
  )}
</div>
```

---

### 5. Frontend Display Components

**Property Card Component:**

```typescript
export function PropertyCard({ property }: PropertyCardProps) {
  const { id, name, location, price_per_night, images, rating } = property
  
  return (
    <div className="card-luxury group">
      <Link href={`/properties/${id}`} className="relative h-64 mb-4 block">
        <img
          src={images?.[0] || '/placeholder-image.jpg'}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110"
          onError={(e) => {
            console.log("[v0] Property image failed:", images?.[0])
            e.currentTarget.src = '/placeholder-image.jpg'
          }}
        />
      </Link>
      {/* Rest of card */}
    </div>
  )
}
```

**With Next.js Image Component (Optimized):**

```typescript
import Image from 'next/image'

export function PropertyCard({ property }: PropertyCardProps) {
  const { id, name, images } = property
  
  return (
    <div className="card-luxury">
      <Image
        src={images?.[0] || '/placeholder-image.jpg'}
        alt={name}
        width={400}
        height={300}
        className="w-full h-64 object-cover"
        onError={(e) => {
          console.log("[v0] Image failed:", images?.[0])
        }}
      />
    </div>
  )
}
```

---

### 6. Delete Image When Updating

**When replacing an image, delete the old one:**

```typescript
const handleSave = async () => {
  // ... validation ...

  const supabase = createClient()
  let images = editing?.images || []

  // If uploading a new image, delete the old one
  if (imageFile && editing?.images?.[0]) {
    console.log('[v0] Deleting old image:', editing.images[0])
    await deleteImage(editing.images[0])
  }

  // Upload new image
  if (imageFile) { 
    const url = await uploadImage(imageFile, 'properties')
    if (url) images = [url]
  }

  // Save to database
  const payload = { /* ... */ images: images }
  
  const { error } = editing
    ? await supabase.from('properties').update(payload).eq('id', editing.id)
    : await supabase.from('properties').insert(payload)

  if (error) { setError(error.message); setSaving(false); return }
  
  setSaving(false)
  setDialogOpen(false)
  fetchItems()
}
```

---

### 7. Error Handling Patterns

**Complete error handling:**

```typescript
const handleSave = async () => {
  // 1. Input validation
  if (!form.name) {
    setError('Name is required')
    return
  }

  setSaving(true)
  setError('')
  
  try {
    const supabase = createClient()

    // 2. Image upload with error handling
    let imageUrl = null
    if (imageFile) {
      imageUrl = await uploadImage(imageFile, 'properties')
      if (!imageUrl) {
        // Don't fail - continue without image
        console.warn('[v0] Image upload failed, continuing without image')
      }
    }

    // 3. Database save with error handling
    const payload = { name: form.name, image_url: imageUrl }
    
    const { error: dbError } = await supabase
      .from('properties')
      .insert(payload)

    if (dbError) {
      // 4. Show user-friendly error
      setError(`Failed to save: ${dbError.message}`)
      setSaving(false)
      return
    }

    // 5. Success handling
    setSaving(false)
    setDialogOpen(false)
    fetchItems()

  } catch (err) {
    // 6. Catch unexpected errors
    console.error('[v0] Unexpected error:', err)
    setError('An unexpected error occurred')
    setSaving(false)
  }
}
```

---

### 8. Image Validation

**Add client-side validation:**

```typescript
const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  
  if (!file) return

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    setError('Image must be less than 5MB')
    return
  }

  // Check file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) {
    setError('Only JPG, PNG, and WebP images are allowed')
    return
  }

  // File is valid
  setImageFile(file)
  setImagePreview(URL.createObjectURL(file))
  setError('')
}
```

---

### 9. Batch Operations

**Delete multiple images:**

```typescript
export async function deleteImages(urls: string[]): Promise<void> {
  for (const url of urls) {
    await deleteImage(url)
  }
}

// Usage when deleting a property
const handleDelete = async () => {
  if (!deleting) return
  
  // 1. Delete all images from storage
  if (deleting.images && deleting.images.length > 0) {
    await deleteImages(deleting.images)
  }

  // 2. Delete database record
  await supabase.from('properties').delete().eq('id', deleting.id)
  
  fetchItems()
}
```

---

### 10. Debugging Checklist

Add these debug logs to verify your implementation:

```typescript
// 1. Check if upload function is called
console.log('[v0] Image file selected:', imageFile.name)

// 2. Check upload result
const uploadedUrl = await uploadImage(imageFile, 'properties')
console.log('[v0] Upload returned URL:', uploadedUrl)

// 3. Check database save
console.log('[v0] Saving to database:', payload)

// 4. Check if URL is in database
console.log('[v0] Item from DB:', items[0].images)

// 5. Check if image renders
console.log('[v0] Rendering image src:', item.images[0])

// 6. Check for CORS errors
// Open browser DevTools → Console tab
// Look for any error messages about image loading
```

---

## Summary: Complete Flow

```
User selects image
        ↓
[handleImageChange] - Create preview
        ↓
User clicks Save
        ↓
[handleSave] - Call uploadImage()
        ↓
uploadImage() - Upload to Supabase Storage, return public URL
        ↓
Save URL to database (images[] or image_url)
        ↓
[fetchItems] - Reload from database
        ↓
Display image in table from database URL
```

---

## Quick Reference

| Operation | Function | Returns | Saves To |
|-----------|----------|---------|----------|
| Upload | `uploadImage(file, folder)` | Public URL | `images` or `image_url` field |
| Delete | `deleteImage(url)` | boolean | N/A |
| Display | Direct `<img src={url}>` | Renders | Browser |
| Preview | `URL.createObjectURL(file)` | Local preview | State only |
| Validate | `handleImageChange()` | Error msg | State |

Your application now has complete, working image handling! 🎉
