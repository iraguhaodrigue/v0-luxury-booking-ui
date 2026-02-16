import { createClient } from '@/lib/supabase/client'

export async function uploadImage(file: File, folder: string): Promise<string | null> {
  const supabase = createClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

  const { error } = await supabase.storage
    .from('images')
    .upload(fileName, file, { cacheControl: '3600', upsert: false })

  if (error) {
    console.error('Upload error:', error.message)
    return null
  }

  const { data: urlData } = supabase.storage
    .from('images')
    .getPublicUrl(fileName)

  return urlData.publicUrl
}

export async function deleteImage(url: string): Promise<boolean> {
  if (!url) return true
  const supabase = createClient()

  // Extract path from the full URL
  const match = url.match(/\/storage\/v1\/object\/public\/images\/(.+)$/)
  if (!match) return true

  const { error } = await supabase.storage
    .from('images')
    .remove([match[1]])

  if (error) {
    console.error('Delete error:', error.message)
    return false
  }
  return true
}
