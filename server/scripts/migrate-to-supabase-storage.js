import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const LEGACY_UPLOADS_DIR = path.join(__dirname, '..', 'uploads', 'seller_documents');
const SUPABASE_BUCKET = 'seller-documents';

/**
 * Migrate legacy local files to Supabase Storage
 */
async function migrateSellerDocumentsToSupabase() {
  console.log('🚀 Starting migration of seller documents to Supabase Storage...');
  
  try {
    // Get all sellers with documents
    const { data: sellers, error: sellersError } = await supabase
      .from('sellers')
      .select('id, email, documents')
      .not('documents', 'is', null);
    
    if (sellersError) {
      throw sellersError;
    }
    
    console.log(`Found ${sellers.length} sellers with documents to potentially migrate`);
    
    let migrationStats = {
      totalSellers: sellers.length,
      sellersProcessed: 0,
      documentsProcessed: 0,
      documentsMigrated: 0,
      documentsSkipped: 0,
      errors: []
    };
    
    for (const seller of sellers) {
      console.log(`\n📋 Processing seller: ${seller.email} (ID: ${seller.id})`);
      
      const documents = seller.documents || [];
      const updatedDocuments = [];
      let sellerHasChanges = false;
      
      for (const doc of documents) {
        migrationStats.documentsProcessed++;
        
        // Skip documents already migrated to Supabase Storage
        if (doc.storage === 'supabase' || doc.url) {
          console.log(`   ✅ Document ${doc.filename} already in Supabase Storage`);
          updatedDocuments.push(doc);
          migrationStats.documentsSkipped++;
          continue;
        }
        
        // Try to migrate legacy document
        try {
          const migrationResult = await migrateSingleDocument(seller.id, doc);
          
          if (migrationResult.success) {
            updatedDocuments.push(migrationResult.document);
            sellerHasChanges = true;
            migrationStats.documentsMigrated++;
            console.log(`   ✅ Migrated: ${doc.filename}`);
          } else {
            // Keep original document info if migration failed
            updatedDocuments.push(doc);
            migrationStats.errors.push({
              sellerId: seller.id,
              filename: doc.filename,
              error: migrationResult.error
            });
            console.log(`   ❌ Failed to migrate: ${doc.filename} - ${migrationResult.error}`);
          }
        } catch (error) {
          updatedDocuments.push(doc);
          migrationStats.errors.push({
            sellerId: seller.id,
            filename: doc.filename,
            error: error.message
          });
          console.log(`   ❌ Error migrating: ${doc.filename} - ${error.message}`);
        }
      }
      
      // Update seller record if any documents were migrated
      if (sellerHasChanges) {
        const { error: updateError } = await supabase
          .from('sellers')
          .update({ documents: updatedDocuments })
          .eq('id', seller.id);
        
        if (updateError) {
          console.log(`   ❌ Failed to update seller record: ${updateError.message}`);
          migrationStats.errors.push({
            sellerId: seller.id,
            error: `Failed to update seller record: ${updateError.message}`
          });
        } else {
          console.log(`   ✅ Updated seller record with migrated documents`);
        }
      }
      
      migrationStats.sellersProcessed++;
    }
    
    // Print migration summary
    console.log('\n🎉 Migration Summary:');
    console.log(`📊 Sellers processed: ${migrationStats.sellersProcessed}/${migrationStats.totalSellers}`);
    console.log(`📄 Documents processed: ${migrationStats.documentsProcessed}`);
    console.log(`✅ Documents migrated: ${migrationStats.documentsMigrated}`);
    console.log(`⏭️  Documents skipped (already migrated): ${migrationStats.documentsSkipped}`);
    console.log(`❌ Errors: ${migrationStats.errors.length}`);
    
    if (migrationStats.errors.length > 0) {
      console.log('\n❌ Migration Errors:');
      migrationStats.errors.forEach((error, index) => {
        console.log(`${index + 1}. Seller ID: ${error.sellerId}, File: ${error.filename || 'N/A'}`);
        console.log(`   Error: ${error.error}`);
      });
    }
    
    return migrationStats;
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  }
}

/**
 * Migrate a single document to Supabase Storage
 */
async function migrateSingleDocument(sellerId, document) {
  try {
    // Determine the local file path
    let localFilePath;
    
    if (document.path && fs.existsSync(document.path)) {
      localFilePath = document.path;
    } else {
      // Try common locations
      const possiblePaths = [
        path.join(LEGACY_UPLOADS_DIR, document.filename),
        path.join(LEGACY_UPLOADS_DIR, sellerId.toString(), document.filename),
        path.join(__dirname, '..', 'uploads', document.filename)
      ];
      
      localFilePath = possiblePaths.find(p => fs.existsSync(p));
    }
    
    if (!localFilePath) {
      return {
        success: false,
        error: 'Local file not found'
      };
    }
    
    // Read the file
    const fileBuffer = fs.readFileSync(localFilePath);
    const fileStats = fs.statSync(localFilePath);
    
    // Generate new path in Supabase Storage
    const fileExt = path.extname(document.filename);
    const supabaseFilePath = `seller-documents/${sellerId}/${document.filename}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(supabaseFilePath, fileBuffer, {
        contentType: document.mimetype || 'application/octet-stream',
        upsert: false // Don't overwrite if already exists
      });
    
    if (error) {
      // If file already exists, that's okay - just get the public URL
      if (error.message.includes('already exists')) {
        console.log(`     📝 File already exists in Supabase Storage: ${document.filename}`);
      } else {
        return {
          success: false,
          error: `Supabase upload error: ${error.message}`
        };
      }
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(SUPABASE_BUCKET)
      .getPublicUrl(supabaseFilePath);
    
    // Return updated document object
    return {
      success: true,
      document: {
        ...document,
        path: supabaseFilePath, // Supabase Storage path
        url: publicUrl, // Public URL for downloads
        storage: 'supabase', // Mark as migrated
        size: document.size || fileStats.size,
        migratedAt: new Date().toISOString()
      }
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Verify migration - check that all documents can be accessed from Supabase Storage
 */
async function verifyMigration() {
  console.log('🔍 Verifying migration...');
  
  try {
    const { data: sellers, error: sellersError } = await supabase
      .from('sellers')
      .select('id, email, documents')
      .not('documents', 'is', null);
    
    if (sellersError) {
      throw sellersError;
    }
    
    let verificationStats = {
      totalDocuments: 0,
      supabaseDocuments: 0,
      legacyDocuments: 0,
      accessibleDocuments: 0,
      inaccessibleDocuments: 0,
      errors: []
    };
    
    for (const seller of sellers) {
      const documents = seller.documents || [];
      
      for (const doc of documents) {
        verificationStats.totalDocuments++;
        
        if (doc.storage === 'supabase' || doc.url) {
          verificationStats.supabaseDocuments++;
          
          // Test if document is accessible
          try {
            const { data, error } = await supabase.storage
              .from(SUPABASE_BUCKET)
              .download(doc.path);
            
            if (error) {
              verificationStats.inaccessibleDocuments++;
              verificationStats.errors.push({
                sellerId: seller.id,
                filename: doc.filename,
                error: `Cannot download from Supabase: ${error.message}`
              });
            } else {
              verificationStats.accessibleDocuments++;
            }
          } catch (error) {
            verificationStats.inaccessibleDocuments++;
            verificationStats.errors.push({
              sellerId: seller.id,
              filename: doc.filename,
              error: `Download test failed: ${error.message}`
            });
          }
        } else {
          verificationStats.legacyDocuments++;
        }
      }
    }
    
    console.log('\n🔍 Verification Results:');
    console.log(`📄 Total documents: ${verificationStats.totalDocuments}`);
    console.log(`☁️  Supabase Storage: ${verificationStats.supabaseDocuments}`);
    console.log(`💾 Legacy storage: ${verificationStats.legacyDocuments}`);
    console.log(`✅ Accessible: ${verificationStats.accessibleDocuments}`);
    console.log(`❌ Inaccessible: ${verificationStats.inaccessibleDocuments}`);
    
    if (verificationStats.errors.length > 0) {
      console.log('\n❌ Access Errors:');
      verificationStats.errors.forEach((error, index) => {
        console.log(`${index + 1}. Seller ID: ${error.sellerId}, File: ${error.filename}`);
        console.log(`   Error: ${error.error}`);
      });
    }
    
    return verificationStats;
    
  } catch (error) {
    console.error('💥 Verification failed:', error);
    throw error;
  }
}

/**
 * Create the Supabase Storage bucket if it doesn't exist
 */
async function createStorageBucket() {
  console.log('🪣 Setting up Supabase Storage bucket...');
  
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      throw listError;
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === SUPABASE_BUCKET);
    
    if (!bucketExists) {
      // Create bucket
      const { data, error } = await supabase.storage.createBucket(SUPABASE_BUCKET, {
        public: true, // Allow public access to files
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      });
      
      if (error) {
        throw error;
      }
      
      console.log(`✅ Created Supabase Storage bucket: ${SUPABASE_BUCKET}`);
    } else {
      console.log(`✅ Supabase Storage bucket already exists: ${SUPABASE_BUCKET}`);
    }
  } catch (error) {
    console.error('❌ Failed to setup storage bucket:', error);
    throw error;
  }
}

// CLI interface
async function main() {
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'setup':
        await createStorageBucket();
        break;
        
      case 'migrate':
        await createStorageBucket();
        await migrateSellerDocumentsToSupabase();
        break;
        
      case 'verify':
        await verifyMigration();
        break;
        
      case 'full':
        await createStorageBucket();
        await migrateSellerDocumentsToSupabase();
        await verifyMigration();
        break;
        
      default:
        console.log('📖 Usage:');
        console.log('  node migrate-to-supabase-storage.js setup   - Create Supabase Storage bucket');
        console.log('  node migrate-to-supabase-storage.js migrate - Migrate files to Supabase Storage');
        console.log('  node migrate-to-supabase-storage.js verify  - Verify migrated files');
        console.log('  node migrate-to-supabase-storage.js full    - Run setup + migrate + verify');
        process.exit(1);
    }
  } catch (error) {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { migrateSellerDocumentsToSupabase, verifyMigration, createStorageBucket };
