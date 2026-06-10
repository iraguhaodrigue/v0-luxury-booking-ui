import { createClient } from '@/lib/supabase/client'

/**
 * Upload an image to Supabase Storage
 * @param file - The image file to upload
 * @param folder - Folder path (e.g., 'properties', 'rooms', 'cars', 'services')
 * @returns Public URL of the uploaded image, or null if upload fails
 */
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

/**
 * Delete an image from Supabase Storage
 * @param url - Full public URL of the image to delete
 * @returns true if deletion succeeded or URL was invalid, false if deletion failed
 */
export async function deleteImage(url: string): Promise<boolean> {
  try {
    if (!url) {
      console.log('[v0] No URL provided for deletion')
      return true
    }

    const supabase = createClient()

    // Extract file path from public URL
    // Format: https://xxxx.supabase.co/storage/v1/object/public/images/folder/filename
    const match = url.match(/\/storage\/v1\/object\/public\/images\/(.+)$/)
    
    if (!match || !match[1]) {
      console.warn('[v0] Invalid image URL format:', url)
      return true
    }

    const filePath = match[1]
    console.log(`[v0] Deleting image: ${filePath}`)

    const { error } = await supabase.storage
      .from('images')
      .remove([filePath])

    if (error) {
      console.error(`[v0] Delete failed for ${filePath}:`, error.message)
      return false
    }
    
    console.log(`[v0] Image deleted successfully: ${filePath}`)
    return true
  } catch (err) {
    console.error('[v0] Delete error:', err)
    return false
  }
}

/**
 * Get public URL from a file path (without uploading)
 * Useful for generating URLs for files already in storage
 */
export function getPublicImageUrl(folder: string, fileName: string): string {
  const supabase = createClient()
  const { data } = supabase.storage
    .from('images')
    .getPublicUrl(`${folder}/${fileName}`)
  return data.publicUrl
}
