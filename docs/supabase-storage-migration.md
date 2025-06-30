# Supabase Storage Migration Guide

This guide walks you through implementing and migrating to Supabase Storage for seller document uploads in your Clinique Beauty application.

## Overview

The application now supports a **hybrid storage approach**:
- **New uploads** automatically go to Supabase Storage
- **Legacy files** remain accessible from local storage
- **Migration utilities** help move legacy files to Supabase Storage
- **Enhanced admin interface** shows storage type indicators

## Features Implemented

### ✅ Hybrid Storage System
- New seller applications automatically upload documents to Supabase Storage
- Legacy documents remain accessible via Express server
- Admin interface shows storage type indicators ("Cloud" vs "Legacy")
- Automatic fallback handling for downloads

### ✅ Migration Tools
- Comprehensive migration script to move legacy files to Supabase Storage
- Verification tools to ensure migration success
- Batch processing for large datasets
- Error handling and retry logic

### ✅ Enhanced Admin Experience
- Visual indicators for document storage types
- Improved document cards with file information
- Better error handling for downloads
- Seamless access to both storage types

## Quick Start

### 1. Setup Supabase Storage

```bash
cd server
pnpm run storage:setup
```

This will:
- Create the `seller-documents` bucket in Supabase Storage
- Configure appropriate permissions and file type restrictions

### 2. Test New Uploads

New seller applications will automatically use Supabase Storage. Test by:
1. Having a seller submit a new application with documents
2. Check the admin verification tab - documents should show "Cloud" indicator
3. Download documents to verify they work correctly

### 3. Migrate Legacy Files (Optional)

To migrate existing local files to Supabase Storage:

```bash
# Run full migration (setup + migrate + verify)
pnpm run storage:full

# Or run steps individually:
pnpm run storage:setup    # Create bucket
pnpm run storage:migrate  # Migrate files
pnpm run storage:verify   # Verify migration
```

## Migration Process Details

### What Gets Migrated

The migration script will:
- Scan all sellers in the database
- Identify documents not yet in Supabase Storage
- Upload local files to Supabase Storage
- Update database records with new URLs
- Preserve original file metadata

### File Organization

Supabase Storage structure:
```
seller-documents/
├── [sellerId]/
│   ├── [timestamp]-[filename1].pdf
│   ├── [timestamp]-[filename2].jpg
│   └── ...
└── [anotherSellerId]/
    └── ...
```

### Migration Output

The migration script provides detailed reporting:
```
🎉 Migration Summary:
📊 Sellers processed: 25/25
📄 Documents processed: 87
✅ Documents migrated: 82
⏭️  Documents skipped (already migrated): 3
❌ Errors: 2
```

## API Changes

### Document Upload Flow

**New Applications:**
1. Files uploaded via `multer.memoryStorage()`
2. Files validated against allowed types/sizes
3. Files uploaded to Supabase Storage using helper utilities
4. Public URLs stored in database with `storage: 'supabase'` marker

### Document Download Flow

**Frontend Download Process:**
1. First attempts to get document metadata from Supabase Functions
2. If document is in Supabase Storage, redirects to public URL
3. Falls back to Express server for legacy documents
4. Handles both blob downloads and direct redirects

**Backend Download Process:**
1. Verifies admin permissions
2. Checks if document exists in seller's record
3. For Supabase Storage: Returns redirect to public URL
4. For legacy storage: Serves file from local disk

## Configuration

### Storage Helper Configuration

Key settings in `server/utils/supabaseStorageHelper.js`:

```javascript
export const STORAGE_CONFIG = {
  BUCKET_NAME: 'seller-documents',
  ALLOWED_MIME_TYPES: [
    'image/jpeg', 'image/jpg', 'image/png',
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  // ... other settings
};
```

### Environment Variables

Ensure your Supabase configuration is properly set:
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Troubleshooting

### Common Issues

**1. Migration Errors**
- Check file permissions on local upload directories
- Verify Supabase Storage bucket exists and has proper permissions
- Ensure sufficient Supabase Storage quota

**2. Download Issues**
- Check CORS settings on Supabase Storage bucket
- Verify public access is enabled for the bucket
- Test URLs manually in browser

**3. Upload Issues**
- Check file size limits (10MB default)
- Verify file types are in allowed list
- Check Supabase Storage quotas

### Verification Commands

```bash
# Check migration status
pnpm run storage:verify

# Test specific seller documents
node scripts/test-seller-documents.js [sellerId]

# Check Supabase Storage bucket contents
node scripts/list-storage-contents.js
```

## Best Practices

### For New Deployments
1. Run `pnpm run storage:setup` before first seller application
2. Test document upload/download flow thoroughly
3. Monitor Supabase Storage usage and quotas

### For Existing Applications
1. Start with `pnpm run storage:setup` 
2. Test new uploads work correctly
3. Run migration during low-traffic period
4. Keep legacy files as backup initially
5. Verify migration completely before removing local files

### Monitoring
- Monitor Supabase Storage usage via Supabase dashboard
- Set up alerts for storage quota limits
- Regularly verify document accessibility

## Future Enhancements

### Signed URLs (Optional)
For enhanced security, you can implement signed URLs for private document access:

```javascript
// Create temporary signed URL for secure access
const { signedUrl } = await SupabaseStorageHelper.createSignedUrl(document.path, 3600);
```

### Cleanup Legacy Files (Optional)
After successful migration and verification:

```bash
# CAUTION: This permanently deletes local files
node scripts/cleanup-legacy-files.js --confirm
```

### Advanced Features
- Automatic file optimization (compression, format conversion)
- Virus scanning integration
- Document versioning
- Audit trails for document access

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review migration logs for specific error messages
3. Verify Supabase Storage configuration and quotas
4. Test with small batches before full migration

The hybrid approach ensures zero downtime during migration while providing immediate benefits for new uploads.
