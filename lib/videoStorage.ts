import { supabase } from './supabase';

const BUCKET_NAME = 'legacy-videos';

export interface VideoUploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

export async function uploadRecordedVideo(
  blob: Blob,
  title: string
): Promise<VideoUploadResult> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const timestamp = Date.now();
    const cleanTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 60);
    const fileName = `${timestamp}-${cleanTitle}.webm`;
    const filePath = `${user.id}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, blob, {
        contentType: 'video/webm',
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading video:', error);
      return { success: false, error: error.message };
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return { success: true, url: urlData.publicUrl, path: data.path };
  } catch (err) {
    console.error('Error in uploadRecordedVideo:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
