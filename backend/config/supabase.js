const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('[Supabase Error] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing from environment.');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

const BUCKET_AUDIO = 'music-tracks';
const BUCKET_COVERS = 'music-covers';

/**
 * Initialize storage buckets if they do not exist
 */
const initSupabaseStorage = async () => {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.error('[Supabase Storage Warning]: Could not list buckets:', error.message);
      return;
    }

    const bucketNames = buckets.map(b => b.name);

    if (!bucketNames.includes(BUCKET_AUDIO)) {
      await supabase.storage.createBucket(BUCKET_AUDIO, { public: true });
      console.log(`[Supabase Storage] Created bucket '${BUCKET_AUDIO}'`);
    }

    if (!bucketNames.includes(BUCKET_COVERS)) {
      await supabase.storage.createBucket(BUCKET_COVERS, { public: true });
      console.log(`[Supabase Storage] Created bucket '${BUCKET_COVERS}'`);
    }

    console.log('[Supabase Storage] Storage buckets active and verified.');
  } catch (err) {
    console.error('[Supabase Storage Error]:', err.message);
  }
};

/**
 * Upload buffer to specified bucket
 */
const uploadToSupabase = async (bucket, filePath, fileBuffer, contentType) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, fileBuffer, {
      contentType: contentType,
      upsert: true
    });

  if (error) throw new Error(`Supabase upload failed: ${error.message}`);

  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return {
    path: data.path,
    publicUrl: publicUrlData.publicUrl
  };
};

/**
 * Delete file from bucket
 */
const deleteFromSupabase = async (bucket, filePath) => {
  if (!filePath) return;
  const { error } = await supabase.storage.from(bucket).remove([filePath]);
  if (error) {
    console.error(`[Supabase Storage Delete Error]:`, error.message);
  }
};

module.exports = {
  supabase,
  initSupabaseStorage,
  uploadToSupabase,
  deleteFromSupabase,
  BUCKET_AUDIO,
  BUCKET_COVERS
};
