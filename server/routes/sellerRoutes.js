import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/db.js';
import { SupabaseStorageHelper, DocumentHelper } from '../utils/supabaseStorageHelper.js';

const router = express.Router();

// Configure multer for handling file uploads in memory (for Supabase Storage)
const storage = multer.memoryStorage(); // Store files in memory for Supabase upload

// Initialize multer upload
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Max 5 files
  },
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only .jpeg, .jpg, .png, .pdf, .doc and .docx files are allowed!'));
    }
  }
});

// Apply as a seller
router.post('/apply', upload.array('documents', 5), async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      businessName,
      businessType,
      contactName,
      email,
      phone,
      address,
      city,
      state,
      zip,
      country,
      registrationNumber,
      taxId,
      bankName,
      accountNumber,
      routingNumber,
      accountHolder,
      categories
    } = req.body;

    // Validate required fields
    if (!businessName || !email || !contactName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Process categories (might be JSON string)
    let parsedCategories;
    try {
      parsedCategories = categories ? JSON.parse(categories) : [];
    } catch (e) {
      parsedCategories = [];
    }

    // Ensure Supabase Storage bucket exists
    await SupabaseStorageHelper.ensureBucketExists();

    // Upload documents to Supabase Storage using helper
    const documents = req.files || [];
    const uploadedDocs = [];
    
    for (const file of documents) {
      try {
        // Validate file
        const validation = DocumentHelper.validateFile(file);
        if (!validation.isValid) {
          console.error(`File validation failed for ${file.originalname}:`, validation.errors);
          continue; // Skip invalid files
        }
        
        console.log(`Uploading file ${file.originalname} to Supabase Storage...`);
        
        // Upload using helper
        const uploadResult = await SupabaseStorageHelper.uploadFile(userId, file);
        
        if (uploadResult.success) {
          uploadedDocs.push(uploadResult.data);
          console.log(`✅ Successfully uploaded ${file.originalname} to Supabase Storage`);
        } else {
          console.error(`❌ Failed to upload ${file.originalname}:`, uploadResult.error);
          // Continue with other files, but log the error
        }
      } catch (uploadError) {
        console.error(`Failed to upload ${file.originalname}:`, uploadError);
        // Continue with other files, but log the error
      }
    }

    // Check if seller application already exists
    const { data: existingSeller, error: lookupError } = await supabase
      .from('sellers')
      .select('*')
      .eq('email', email)
      .single();
    
    if (lookupError && lookupError.code !== 'PGRST116') {
      throw lookupError;
    }
    
    if (existingSeller) {
      // If application exists but was rejected, allow reapplication
      if (existingSeller.status === 'rejected') {
        const { data, error } = await supabase
          .from('sellers')
          .update({
            business_name: businessName,
            business_type: businessType,
            contact_name: contactName,
            phone,
            location: JSON.stringify({ address, city, state, zip, country }),
            product_categories: parsedCategories,
            categories: parsedCategories, // Adding both columns to ensure compatibility
            registration_number: registrationNumber || null,
            tax_id: taxId || null,
            bank_info: {
              bank_name: bankName,
              account_number: accountNumber,
              routing_number: routingNumber,
              account_holder: accountHolder
            },
            documents: uploadedDocs,
            status: 'pending',
            rejection_reason: null,
            updated_at: new Date()
          })
          .eq('id', existingSeller.id)
          .select();

        if (error) {
          throw error;
        }

        // Update user role to seller_pending
        await supabase
          .from('users')
          .update({ role: 'seller_pending' })
          .eq('clerk_id', userId);

        return res.json({
          success: true,
          message: 'Seller application updated successfully',
          data: data[0],
          status: 'pending'
        });
      } else {
        return res.status(409).json({
          success: false,
          message: `You already have a seller application with status: ${existingSeller.status}`,
          status: existingSeller.status
        });
      }
    }

    // Create new seller application
    const { data, error } = await supabase
      .from('sellers')
      .insert({
        business_name: businessName,
        business_type: businessType,
        contact_name: contactName,
        email,
        phone,
        location: JSON.stringify({ address, city, state, zip, country }),
        product_categories: parsedCategories,
        categories: parsedCategories, // Adding both columns to ensure compatibility
        registration_number: registrationNumber || null,
        tax_id: taxId || null,
        bank_info: {
          bank_name: bankName,
          account_number: accountNumber,
          routing_number: routingNumber,
          account_holder: accountHolder
        },
        documents: uploadedDocs,
        status: 'pending',
        clerk_id: userId
      })
      .select();

    if (error) {
      throw error;
    }
    
    // Update user role to seller_pending
    await supabase
      .from('users')
      .update({ role: 'seller_pending' })
      .eq('clerk_id', userId);

    res.status(201).json({
      success: true,
      message: 'Seller application submitted successfully',
      data: data[0],
      status: 'pending'
    });
  } catch (error) {
    console.error('Error submitting seller application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit seller application',
      error: error.message
    });
  }
});

// Get seller application status
router.get('/application/status', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('clerk_id', userId)
      .single();
    
    if (userError) {
      throw userError;
    }
    
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check for seller application
    const { data: sellerData, error: sellerError } = await supabase
      .from('sellers')
      .select('*')
      .eq('email', userData.email)
      .single();
    
    if (sellerError && sellerError.code !== 'PGRST116') {
      throw sellerError;
    }
    
    if (!sellerData) {
      return res.status(404).json({
        success: false,
        message: 'No seller application found',
        hasApplied: false
      });
    }
    
    res.json({
      success: true,
      hasApplied: true,
      status: sellerData.status,
      applicationDate: sellerData.created_at,
      updateDate: sellerData.updated_at,
      rejectionReason: sellerData.rejection_reason
    });
  } catch (error) {
    console.error('Error fetching seller application status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application status',
      error: error.message
    });
  }
});

// Get seller profile (for approved sellers)
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user email
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email, role')
      .eq('clerk_id', userId)
      .single();
    
    if (userError) {
      throw userError;
    }
    
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user is a seller
    if (userData.role !== 'seller' && userData.role !== 'seller_pending') {
      return res.status(403).json({
        success: false,
        message: 'You are not registered as a seller'
      });
    }
    
    // Get seller profile
    const { data: sellerData, error: sellerError } = await supabase
      .from('sellers')
      .select('*')
      .eq('email', userData.email)
      .single();
    
    if (sellerError) {
      throw sellerError;
    }
    
    if (!sellerData) {
      return res.status(404).json({
        success: false,
        message: 'Seller profile not found'
      });
    }
    
    res.json({
      success: true,
      ...sellerData
    });
  } catch (error) {
    console.error('Error fetching seller profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch seller profile',
      error: error.message
    });
  }
});

// Admin route to get all seller applications (requires admin role)
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('clerk_id', userId)
      .single();
    
    if (userError || !userData || userData.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Get query parameters for filtering
    const { status, search } = req.query;
    
    // Build query
    let query = supabase.from('sellers').select('*');
    
    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    if (search) {
      query = query.or(`business_name.ilike.%${search}%,contact_name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    
    // Order by creation date, newest first
    query = query.order('created_at', { ascending: false });
    
    const { data: sellers, error: sellersError } = await query;
    
    if (sellersError) {
      throw sellersError;
    }
    
    res.json({
      success: true,
      data: sellers || []
    });
  } catch (error) {
    console.error('Error fetching sellers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sellers',
      error: error.message
    });
  }
});

// Admin route to get pending verification requests
router.get('/verification/pending', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('clerk_id', userId)
      .single();
    
    if (userError || !userData || userData.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Get pending seller applications
    const { data: pendingApplications, error: applicationsError } = await supabase
      .from('sellers')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (applicationsError) {
      throw applicationsError;
    }
    
    res.json({
      success: true,
      data: pendingApplications || []
    });
  } catch (error) {
    console.error('Error fetching pending verification requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending verification requests',
      error: error.message
    });
  }
});

// Admin route to update seller verification status
router.patch('/:id/verification', async (req, res) => {
  try {
    const userId = req.user.id;
    const sellerId = req.params.id;
    const { status, notes } = req.body;
    
    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('clerk_id', userId)
      .single();
    
    if (userError || !userData || userData.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, approved, rejected'
      });
    }

    // Update seller status
    const updateData = {
      status,
      updated_at: new Date(),
      verification_date: status === 'approved' ? new Date() : null
    };

    // Add rejection reason if status is rejected
    if (status === 'rejected' && notes) {
      updateData.rejection_reason = notes;
    } else if (status !== 'rejected') {
      updateData.rejection_reason = null;
    }

    const { data: updatedSeller, error: updateError } = await supabase
      .from('sellers')
      .update(updateData)
      .eq('id', sellerId)
      .select()
      .single();
    
    if (updateError) {
      throw updateError;
    }

    if (!updatedSeller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    // Update user role if seller is approved
    if (status === 'approved') {
      await supabase
        .from('users')
        .update({ role: 'seller' })
        .eq('email', updatedSeller.email);
    } else if (status === 'rejected') {
      // Reset user role to customer if rejected
      await supabase
        .from('users')
        .update({ role: 'customer' })
        .eq('email', updatedSeller.email);
    }
    
    res.json({
      success: true,
      message: `Seller application ${status} successfully`,
      data: updatedSeller
    });
  } catch (error) {
    console.error('Error updating seller verification status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update seller verification status',
      error: error.message
    });
  }
});

// Admin route to download seller documents (requires admin role)
router.get('/documents/:sellerId/:filename', async (req, res) => {
  try {
    const userId = req.user.id;
    const { sellerId, filename } = req.params;
    
    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('clerk_id', userId)
      .single();
    
    if (userError || !userData || userData.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Verify that the document belongs to the specified seller
    const { data: sellerData, error: sellerError } = await supabase
      .from('sellers')
      .select('documents')
      .eq('id', sellerId)
      .single();
    
    if (sellerError || !sellerData) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    // Check if the filename exists in the seller's documents
    const documents = sellerData.documents || [];
    const document = documents.find(doc => doc.filename === filename);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Handle different storage types (Supabase Storage vs Legacy local storage)
    if (document.storage === 'supabase' || document.url) {
      // New Supabase Storage documents - redirect to public URL or create signed URL
      try {
        let downloadUrl = document.url;
        
        // If no public URL stored, generate it
        if (!downloadUrl) {
          const { data: { publicUrl } } = supabase.storage
            .from('seller-documents')
            .getPublicUrl(document.path);
          downloadUrl = publicUrl;
        }
        
        // For secure downloads, you might want to create a signed URL instead
        // const { data: { signedUrl } } = await supabase.storage
        //   .from('seller-documents')
        //   .createSignedUrl(document.path, 3600); // 1 hour expiry
        
        return res.redirect(downloadUrl);
      } catch (storageError) {
        console.error('Error accessing Supabase Storage:', storageError);
        return res.status(500).json({
          success: false,
          message: 'Failed to access document in storage'
        });
      }
    } else {
      // Legacy local storage documents
      const filePath = document.path || path.join(process.cwd(), 'uploads', 'seller_documents', filename);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'File not found on server'
        });
      }

      // Set appropriate headers for download
      res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
      res.setHeader('Content-Type', document.mimetype || 'application/octet-stream');
      
      // Send the file
      return res.sendFile(path.resolve(filePath));
    }
  } catch (error) {
    console.error('Error downloading seller document:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download document',
      error: error.message
    });
  }
});

export default router;
