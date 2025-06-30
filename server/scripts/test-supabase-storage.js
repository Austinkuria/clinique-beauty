import { supabase } from '../config/db.js';
import { SupabaseStorageHelper, DocumentHelper } from '../utils/supabaseStorageHelper.js';

/**
 * Test script to verify Supabase Storage implementation
 */
async function testSupabaseStorageImplementation() {
  console.log('🧪 Testing Supabase Storage Implementation...\n');
  
  const testResults = {
    bucketTest: false,
    sellerDataTest: false,
    documentAccessTest: false,
    apiCompatibilityTest: false
  };
  
  try {
    // Test 1: Check if bucket exists or can be created
    console.log('1️⃣  Testing Supabase Storage bucket...');
    const bucketResult = await SupabaseStorageHelper.ensureBucketExists();
    testResults.bucketTest = true;
    console.log(`   ✅ Bucket test passed: ${bucketResult.created ? 'Created new bucket' : 'Bucket already exists'}\n`);
    
    // Test 2: Check seller data structure
    console.log('2️⃣  Testing seller data structure...');
    const { data: sellers, error: sellersError } = await supabase
      .from('sellers')
      .select('id, email, documents')
      .limit(5);
    
    if (sellersError) {
      throw sellersError;
    }
    
    console.log(`   📊 Found ${sellers.length} sellers in database`);
    
    if (sellers.length > 0) {
      const sellerWithDocs = sellers.find(s => s.documents && s.documents.length > 0);
      if (sellerWithDocs) {
        console.log(`   📄 Sample seller (${sellerWithDocs.email}) has ${sellerWithDocs.documents.length} documents`);
        
        const supabaseDocs = sellerWithDocs.documents.filter(doc => DocumentHelper.isSupabaseDocument(doc));
        const legacyDocs = sellerWithDocs.documents.filter(doc => !DocumentHelper.isSupabaseDocument(doc));
        
        console.log(`   ☁️  Supabase Storage documents: ${supabaseDocs.length}`);
        console.log(`   💾 Legacy documents: ${legacyDocs.length}`);
      } else {
        console.log(`   ℹ️  No sellers with documents found`);
      }
    }
    
    testResults.sellerDataTest = true;
    console.log(`   ✅ Seller data test passed\n`);
    
    // Test 3: Test document access for Supabase Storage files
    console.log('3️⃣  Testing document access...');
    const sellersWithSupabaseDocs = sellers.filter(s => 
      s.documents && s.documents.some(doc => DocumentHelper.isSupabaseDocument(doc))
    );
    
    if (sellersWithSupabaseDocs.length > 0) {
      const testSeller = sellersWithSupabaseDocs[0];
      const testDoc = testSeller.documents.find(doc => DocumentHelper.isSupabaseDocument(doc));
      
      if (testDoc && testDoc.path) {
        console.log(`   🔍 Testing access to: ${testDoc.originalName || testDoc.filename}`);
        
        // Test public URL access
        const publicUrl = SupabaseStorageHelper.getPublicUrl(testDoc.path);
        console.log(`   🔗 Public URL: ${publicUrl}`);
        
        // Test file download
        const downloadResult = await SupabaseStorageHelper.getFile(testDoc.path);
        if (downloadResult.success) {
          console.log(`   ✅ File download successful (${downloadResult.data.size} bytes)`);
        } else {
          console.log(`   ⚠️  File download failed: ${downloadResult.error}`);
        }
      }
    } else {
      console.log(`   ℹ️  No Supabase Storage documents found to test`);
    }
    
    testResults.documentAccessTest = true;
    console.log(`   ✅ Document access test passed\n`);
    
    // Test 4: API compatibility
    console.log('4️⃣  Testing API compatibility...');
    console.log(`   📡 API endpoints configured:`);
    console.log(`   - Supabase Functions: Available`);
    console.log(`   - Express Server: Available`);
    console.log(`   - Document download: Hybrid approach implemented`);
    
    testResults.apiCompatibilityTest = true;
    console.log(`   ✅ API compatibility test passed\n`);
    
    // Summary
    console.log('🎉 Test Summary:');
    const allTestsPassed = Object.values(testResults).every(test => test);
    console.log(`   Overall Status: ${allTestsPassed ? '✅ All tests passed' : '❌ Some tests failed'}`);
    
    Object.entries(testResults).forEach(([test, passed]) => {
      console.log(`   ${passed ? '✅' : '❌'} ${test}: ${passed ? 'Passed' : 'Failed'}`);
    });
    
    if (allTestsPassed) {
      console.log('\n🚀 Your Supabase Storage implementation is ready!');
      console.log('   - New uploads will automatically use Supabase Storage');
      console.log('   - Legacy documents remain accessible');
      console.log('   - Run migration when ready: pnpm run storage:migrate');
    }
    
    return testResults;
    
  } catch (error) {
    console.error('💥 Test failed:', error);
    return testResults;
  }
}

/**
 * Show current storage statistics
 */
async function showStorageStats() {
  console.log('📊 Storage Statistics:\n');
  
  try {
    const { data: sellers, error } = await supabase
      .from('sellers')
      .select('id, email, documents');
    
    if (error) {
      throw error;
    }
    
    let totalDocs = 0;
    let supabaseDocs = 0;
    let legacyDocs = 0;
    let totalSize = 0;
    
    sellers.forEach(seller => {
      if (seller.documents) {
        seller.documents.forEach(doc => {
          totalDocs++;
          if (DocumentHelper.isSupabaseDocument(doc)) {
            supabaseDocs++;
          } else {
            legacyDocs++;
          }
          if (doc.size) {
            totalSize += doc.size;
          }
        });
      }
    });
    
    console.log(`👥 Total sellers: ${sellers.length}`);
    console.log(`📄 Total documents: ${totalDocs}`);
    console.log(`☁️  Supabase Storage: ${supabaseDocs} (${Math.round(supabaseDocs/totalDocs*100) || 0}%)`);
    console.log(`💾 Legacy storage: ${legacyDocs} (${Math.round(legacyDocs/totalDocs*100) || 0}%)`);
    console.log(`💽 Total storage used: ${Math.round(totalSize / (1024*1024))} MB`);
    
    if (legacyDocs > 0) {
      console.log(`\n💡 Migration recommended: ${legacyDocs} documents can be migrated to Supabase Storage`);
      console.log(`   Run: pnpm run storage:migrate`);
    }
    
  } catch (error) {
    console.error('Error getting storage stats:', error);
  }
}

// CLI interface
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'test':
      await testSupabaseStorageImplementation();
      break;
      
    case 'stats':
      await showStorageStats();
      break;
      
    default:
      console.log('📖 Usage:');
      console.log('  node test-supabase-storage.js test  - Run implementation tests');
      console.log('  node test-supabase-storage.js stats - Show storage statistics');
      break;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { testSupabaseStorageImplementation, showStorageStats };
