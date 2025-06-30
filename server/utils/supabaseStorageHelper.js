import { supabase } from '../config/db.js';

/**
 * Configuration for Supabase Storage migration
 */
export const STORAGE_CONFIG = {
  // Supabase Storage bucket name
  BUCKET_NAME: 'seller-documents',
  
  // File type configurations
  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  
  // File size limits (in bytes)
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  
  // Migration settings
  MIGRATION: {
    BATCH_SIZE: 10, // Process sellers in batches
    RETRY_ATTEMPTS: 3,
    LEGACY_UPLOADS_PATHS: [
      'uploads/seller_documents',
      'uploads',
      'seller_documents'
    ]
  }
};

/**
 * Helper functions for Supabase Storage operations
 */
export class SupabaseStorageHelper {
  
  /**
   * Check if Supabase Storage bucket exists and create if needed
   */
  static async ensureBucketExists() {
    try {
      // Check if bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        throw listError;
      }
      
      const bucketExists = buckets.some(bucket => bucket.name === STORAGE_CONFIG.BUCKET_NAME);
      
      if (!bucketExists) {
        console.log(`Creating Supabase Storage bucket: ${STORAGE_CONFIG.BUCKET_NAME}`);
        
        const { data, error } = await supabase.storage.createBucket(STORAGE_CONFIG.BUCKET_NAME, {
          public: true,
          allowedMimeTypes: STORAGE_CONFIG.ALLOWED_MIME_TYPES,
          fileSizeLimit: STORAGE_CONFIG.MAX_FILE_SIZE
        });
        
        if (error) {
          throw error;
        }
        
        console.log(`✅ Created bucket: ${STORAGE_CONFIG.BUCKET_NAME}`);
        return { created: true, bucket: data };
      } else {
        console.log(`✅ Bucket already exists: ${STORAGE_CONFIG.BUCKET_NAME}`);
        return { created: false, bucket: buckets.find(b => b.name === STORAGE_CONFIG.BUCKET_NAME) };
      }
    } catch (error) {
      console.error('❌ Failed to ensure bucket exists:', error);
      throw error;
    }
  }
  
  /**
   * Upload a file to Supabase Storage
   */
  static async uploadFile(sellerId, file, options = {}) {
    const {
      filename = file.originalname || file.name,
      mimetype = file.mimetype || file.type,
      buffer = file.buffer,
      upsert = false
    } = options;
    
    try {
      // Generate file path
      const fileExt = filename.split('.').pop();
      const timestamp = Date.now();
      const uniqueFilename = `${timestamp}-${filename}`;
      const filePath = `seller-documents/${sellerId}/${uniqueFilename}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(STORAGE_CONFIG.BUCKET_NAME)
        .upload(filePath, buffer, {
          contentType: mimetype,
          upsert
        });
      
      if (error) {
        throw error;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_CONFIG.BUCKET_NAME)
        .getPublicUrl(filePath);
      
      return {
        success: true,
        data: {
          filename: uniqueFilename,
          originalName: filename,
          path: filePath,
          url: publicUrl,
          mimetype,
          size: buffer.length,
          storage: 'supabase',
          uploadedAt: new Date().toISOString()
        }
      };
      
    } catch (error) {
      console.error('Failed to upload file to Supabase Storage:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Get a file from Supabase Storage
   */
  static async getFile(filePath) {
    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_CONFIG.BUCKET_NAME)
        .download(filePath);
      
      if (error) {
        throw error;
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Failed to get file from Supabase Storage:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get public URL for a file
   */
  static getPublicUrl(filePath) {
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .getPublicUrl(filePath);
    
    return publicUrl;
  }
  
  /**
   * Create a signed URL for private access (optional)
   */
  static async createSignedUrl(filePath, expiresIn = 3600) {
    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_CONFIG.BUCKET_NAME)
        .createSignedUrl(filePath, expiresIn);
      
      if (error) {
        throw error;
      }
      
      return { success: true, signedUrl: data.signedUrl };
    } catch (error) {
      console.error('Failed to create signed URL:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Delete a file from Supabase Storage
   */
  static async deleteFile(filePath) {
    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_CONFIG.BUCKET_NAME)
        .remove([filePath]);
      
      if (error) {
        throw error;
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Failed to delete file from Supabase Storage:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * List files in a seller's folder
   */
  static async listSellerFiles(sellerId) {
    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_CONFIG.BUCKET_NAME)
        .list(`seller-documents/${sellerId}`, {
          limit: 100,
          offset: 0
        });
      
      if (error) {
        throw error;
      }
      
      return { success: true, files: data };
    } catch (error) {
      console.error('Failed to list seller files:', error);
      return { success: false, error: error.message };
    }
  }
}

/**
 * Document utilities for hybrid storage handling
 */
export class DocumentHelper {
  
  /**
   * Check if a document is stored in Supabase Storage
   */
  static isSupabaseDocument(document) {
    return document.storage === 'supabase' || !!document.url;
  }
  
  /**
   * Get download URL for a document (handles both storage types)
   */
  static getDownloadUrl(document) {
    if (this.isSupabaseDocument(document)) {
      return document.url || SupabaseStorageHelper.getPublicUrl(document.path);
    }
    
    // For legacy documents, return null (needs server-side handling)
    return null;
  }
  
  /**
   * Get document display information
   */
  static getDocumentInfo(document) {
    return {
      filename: document.originalName || document.filename,
      type: document.mimetype || 'Unknown',
      size: document.size ? `${Math.round(document.size / 1024)}KB` : 'Unknown',
      storage: this.isSupabaseDocument(document) ? 'Cloud Storage' : 'Legacy Storage',
      isSupabase: this.isSupabaseDocument(document),
      downloadable: this.isSupabaseDocument(document) || !!document.path
    };
  }
  
  /**
   * Validate file for upload
   */
  static validateFile(file) {
    const errors = [];
    
    // Check file size
    if (file.size > STORAGE_CONFIG.MAX_FILE_SIZE) {
      errors.push(`File size exceeds ${STORAGE_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
    }
    
    // Check file type
    if (!STORAGE_CONFIG.ALLOWED_MIME_TYPES.includes(file.mimetype || file.type)) {
      errors.push('File type not allowed');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default {
  STORAGE_CONFIG,
  SupabaseStorageHelper,
  DocumentHelper
};
