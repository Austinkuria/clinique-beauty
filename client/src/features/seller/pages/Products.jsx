import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Alert,
  Fab,
  InputAdornment,
  Menu,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Avatar,
  CircularProgress,
  Snackbar,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  PhotoCamera as PhotoIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Pending as PendingIcon,
  Inventory as StockIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  CloudUpload as CloudUploadIcon,
  ContentCopy as DuplicateIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { ThemeContext } from '../../../context/ThemeContext';
import { useSellerApi } from '../../../api/apiClient';
import defaultProductImage from '../../../assets/images/placeholder.webp';
import { debugSellerProducts } from '../../../debug/sellerProductsDebug';

const SellerProducts = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { theme, colorValues } = useContext(ThemeContext);
  const sellerApi = useSellerApi();
  
  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProductForMenu, setSelectedProductForMenu] = useState(null);
  
  // Product form dialogs
  const [addProductDialogOpen, setAddProductDialogOpen] = useState(false);
  const [editProductDialogOpen, setEditProductDialogOpen] = useState(false);
  const [viewProductDialogOpen, setViewProductDialogOpen] = useState(false);
  
  // Form data states
  const [newProductData, setNewProductData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    brand: '',
    sku: '',
    stock_quantity: '',
    tags: [],
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    image: null,
  });
  
  const [editProductData, setEditProductData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    brand: '',
    sku: '',
    stock_quantity: '',
    tags: [],
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    status: 'Active',
    featured: false
  });
  
  const [imagePreview, setImagePreview] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Mock categories and tags (in real app, fetch from API)
  const categories = [
    { id: 1, name: 'Skincare' },
    { id: 2, name: 'Makeup' },
    { id: 3, name: 'Fragrance' },
    { id: 4, name: 'Hair' },
    { id: 5, name: 'Body' }
  ];

  const tags = [
    { id: 1, name: 'New Arrival' },
    { id: 2, name: 'Best Seller' },
    { id: 3, name: 'Limited Edition' },
    { id: 4, name: 'Sale' },
    { id: 5, name: 'Organic' },
    { id: 6, name: 'Vegan' }
  ];

  // Track if we've already fetched products to prevent multiple calls
  const hasFetchedRef = useRef(false);
  const sellerApiRef = useRef(sellerApi);
  
  // Update the ref when sellerApi changes
  useEffect(() => {
    sellerApiRef.current = sellerApi;
  }, [sellerApi]);

  // Load products data
  useEffect(() => {
    let isMounted = true;
    
    const loadProducts = async () => {
      // Prevent multiple simultaneous calls
      if (hasFetchedRef.current) {
        console.log('Skipping duplicate API call - already fetched');
        return;
      }
      
      hasFetchedRef.current = true;
      setLoading(true);
      setError(null); // Clear any previous errors
      
      try {
        console.log('Loading seller products from API...');
        
        // Run debug helper
        debugSellerProducts();
        
        // Add detailed logging
        const startTime = Date.now();
        console.log(`[${new Date().toISOString()}] Starting API call to getSellerProducts`);
        
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('API call timed out after 15 seconds')), 15000);
        });
        
        // Use the ref to access the current sellerApi
        const apiPromise = sellerApiRef.current.getSellerProducts();
        
        const productsData = await Promise.race([apiPromise, timeoutPromise]);
        
        // Check if component is still mounted
        if (!isMounted) {
          console.log('Component unmounted, skipping state update');
          return;
        }
        
        const endTime = Date.now();
        console.log(`[${new Date().toISOString()}] API call completed in ${endTime - startTime}ms`);
        console.log('Loaded products:', productsData);
        
        // Handle different response formats
        let actualProducts = Array.isArray(productsData) ? productsData : 
                            productsData?.data ? productsData.data : 
                            productsData?.products ? productsData.products : [];
        
        console.log('Actual products array:', actualProducts);
        
        // Transform the API data to match the component's expected format
        const transformedProducts = actualProducts.map(product => ({
          id: product.id,
          name: product.name,
          category: product.category,
          subcategory: product.subcategory,
          price: product.price,
          stock: product.stock,
          status: product.status === 'active' ? 'Active' : 
                  product.stock === 0 ? 'Out of Stock' :
                  product.stock < 10 ? 'Low Stock' : 'Active',
          approvalStatus: product.approval_status === 'approved' ? 'Approved' :
                         product.approval_status === 'pending' ? 'Pending' : 'Rejected',
          featured: product.featured,
          image: product.image || '/api/placeholder/200/200',
          sku: product.sku,
          created: new Date(product.created_at).toLocaleDateString(),
          sales: 0, // TODO: Add sales tracking
          revenue: 0, // TODO: Calculate revenue
          rating: product.rating || 0,
          reviews: product.reviews_count || 0,
          description: product.description,
          brand: product.brand,
          tags: product.tags || []
        }));
        
        console.log('Transformed products:', transformedProducts);
        setProducts(transformedProducts);
      } catch (error) {
        // Only update state if component is still mounted
        if (!isMounted) {
          console.log('Component unmounted, skipping error state update');
          return;
        }
        
        console.error('Error loading products:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          stack: error.stack,
          name: error.name
        });
        
        // Show clear error message for all errors (no mock data fallback)
        let errorMessage = `Failed to load products: ${error.message}`;
        
        // Provide more specific error messages for common issues
        if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
          errorMessage = 'Unable to connect to the server. Please check your internet connection and ensure the backend server is running.';
        } else if (error.message.includes('CORS')) {
          errorMessage = 'CORS error detected. Please check the backend CORS configuration.';
        } else if (error.message.includes('timed out')) {
          errorMessage = 'Request timed out. The server may be slow or unavailable.';
        }
        
        setError(errorMessage);
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error'
        });
        setProducts([]);
        
        // Reset the fetch flag on error so retry can work
        hasFetchedRef.current = false;
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log('Loading state set to false');
        }
      }
    };

    // Only load on mount, with a small delay to ensure sellerApi is ready
    const timeoutId = setTimeout(loadProducts, 100);
    
    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []); // Empty dependency array - only run once on mount

  // Retry function for failed API calls
  const handleRetry = async () => {
    // Reset the fetch flag to allow retry
    hasFetchedRef.current = false;
    setLoading(true);
    setError(null);
    try {
      console.log('Retrying API call...');
      const startTime = Date.now();
      console.log(`[${new Date().toISOString()}] Retrying API call to getSellerProducts`);
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('API call timed out after 15 seconds')), 15000);
      });
      
      const apiPromise = sellerApiRef.current.getSellerProducts();
      const productsData = await Promise.race([apiPromise, timeoutPromise]);
      
      const endTime = Date.now();
      console.log(`[${new Date().toISOString()}] Retry API call completed in ${endTime - startTime}ms`);
      
      let actualProducts = Array.isArray(productsData) ? productsData : 
                          productsData?.data ? productsData.data : 
                          productsData?.products ? productsData.products : [];
      
      const transformedProducts = actualProducts.map(product => ({
        id: product.id,
        name: product.name,
        category: product.category,
        subcategory: product.subcategory,
        price: product.price,
        stock: product.stock,
        status: product.status === 'active' ? 'Active' : 
                product.stock === 0 ? 'Out of Stock' :
                product.stock < 10 ? 'Low Stock' : 'Active',
        approvalStatus: product.approval_status === 'approved' ? 'Approved' :
                       product.approval_status === 'pending' ? 'Pending' : 'Rejected',
        featured: product.featured,
        image: product.image || '/api/placeholder/200/200',
        sku: product.sku,
        created: new Date(product.created_at).toLocaleDateString(),
        sales: 0,
        revenue: 0,
        rating: product.rating || 0,
        reviews: product.reviews_count || 0,
        description: product.description,
        brand: product.brand,
        tags: product.tags || []
      }));
      
      setProducts(transformedProducts);
      hasFetchedRef.current = true; // Mark as successfully fetched
      setSnackbar({
        open: true,
        message: 'Products loaded successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Retry failed:', error);
      let errorMessage = `Failed to load products: ${error.message}`;
      
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        errorMessage = 'Unable to connect to the server. Please check your internet connection and ensure the backend server is running.';
      } else if (error.message.includes('CORS')) {
        errorMessage = 'CORS error detected. Please check the backend CORS configuration.';
      } else if (error.message.includes('timed out')) {
        errorMessage = 'Request timed out. The server may be slow or unavailable.';
      }
      
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = !search || 
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !filterStatus || product.status === filterStatus;
    const matchesCategory = !filterCategory || product.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Get unique product categories for filter (from actual product data)
  const productCategories = [...new Set(products.map(p => p.category))];

  // Status badge helpers
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Low Stock': return 'warning';
      case 'Out of Stock': return 'error';
      case 'Draft': return 'default';
      default: return 'default';
    }
  };

  const getApprovalStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Pending': return 'warning';
      case 'Rejected': return 'error';
      default: return 'default';
    }
  };

  const getApprovalStatusIcon = (status) => {
    switch (status) {
      case 'Approved': return <CheckIcon fontSize="small" />;
      case 'Pending': return <PendingIcon fontSize="small" />;
      case 'Rejected': return <CloseIcon fontSize="small" />;
      default: return null;
    }
  };

  // Event handlers
  const handleMenuOpen = (event, product) => {
    setAnchorEl(event.currentTarget);
    setSelectedProductForMenu(product);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProductForMenu(null);
  };

  const handleDeleteProduct = async () => {
    if (selectedProduct) {
      try {
        setLoading(true);
        await sellerApi.deleteProduct(selectedProduct.id);
        setProducts(products.filter(p => p.id !== selectedProduct.id));
        setSnackbar({
          open: true,
          message: 'Product deleted successfully',
          severity: 'success'
        });
      } catch (error) {
        console.error('Error deleting product:', error);
        setSnackbar({
          open: true,
          message: `Error deleting product: ${error.message}`,
          severity: 'error'
        });
      } finally {
        setLoading(false);
        setDeleteDialogOpen(false);
        setSelectedProduct(null);
      }
    }
  };

  const handleEditProduct = (product) => {
    navigate(`/seller/products/${product.id}/edit`);
    handleMenuClose();
  };

  const handleViewProduct = (product) => {
    navigate(`/seller/products/${product.id}`);
    handleMenuClose();
  };
  const handleDuplicateProduct = (product) => {
    navigate(`/seller/products/new?duplicate=${product.id}`);
    handleMenuClose();
  };

  // Product form handlers
  const handleOpenAddProductDialog = () => {
    setAddProductDialogOpen(true);
  };

  const handleCloseAddProductDialog = () => {
    setAddProductDialogOpen(false);
    // Reset form data and image preview
    setNewProductData({
      name: '',
      description: '',
      price: '',
      category: '',
      subcategory: '',
      brand: '',
      sku: '',
      stock_quantity: '',
      tags: [],
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      image: null,
    });
    setImagePreview(null);
  };

  const handleNewProductChange = (event) => {
    const { name, value } = event.target;
    setNewProductData(prev => ({ ...prev, [name]: value }));
  };

  const handleNewProductTagsChange = (event, newValue) => {
    setNewProductData(prev => ({ ...prev, tags: newValue }));
  };

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const preview = URL.createObjectURL(file);
      
      // Check if we're in add or edit mode based on which dialog is open
      if (addProductDialogOpen) {
        setNewProductData(prev => ({ ...prev, image: file }));
      } else if (editProductDialogOpen) {
        setEditProductData(prev => ({ ...prev, image: file }));
      }
      setImagePreview(preview);
    }
  };

  const handleRemoveImage = () => {
    // Check if we're in add or edit mode based on which dialog is open
    if (addProductDialogOpen) {
      setNewProductData(prev => ({ ...prev, image: null }));
      // Reset the file input for add dialog
      const fileInput = document.getElementById('add-product-image-upload');
      if (fileInput) {
        fileInput.value = '';
      }
    } else if (editProductDialogOpen) {
      setEditProductData(prev => ({ ...prev, image: null }));
      // Reset the file input for edit dialog
      const fileInput = document.getElementById('edit-product-image-upload');
      if (fileInput) {
        fileInput.value = '';
      }
    }
    setImagePreview(null);
  };

  // SKU generation function
  const generateSKU = (productName, category, brand) => {
    // Create SKU starting with category for better organization
    const categoryPrefix = category.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '').padEnd(3, 'X'); // 3-4 chars
    const namePrefix = productName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '').padEnd(3, 'X'); // 3 chars
    const brandPrefix = brand ? brand.substring(0, 2).toUpperCase().replace(/[^A-Z]/g, '') : ''; // 2 chars
    const timestamp = Date.now().toString().slice(-3); // Last 3 digits of timestamp
    const randomSuffix = Math.floor(Math.random() * 100).toString().padStart(2, '0'); // 2 digits
    
    // Format: CATEGORY-PRODUCT-BRAND-TIMESTAMP-RANDOM
    // Example: SKIN-LIP-MAC-123-45 for Skincare > Lipstick > MAC brand
    const sku = `${categoryPrefix}-${namePrefix}${brandPrefix ? `-${brandPrefix}` : ''}-${timestamp}${randomSuffix}`;
    return sku.substring(0, 15); // Keep it reasonable length
  };

  // Auto-generate SKU when product details change
  const handleAutoGenerateSKU = () => {
    if (newProductData.name && newProductData.category) {
      const autoSKU = generateSKU(newProductData.name, newProductData.category, newProductData.brand);
      setNewProductData(prev => ({ ...prev, sku: autoSKU }));
      setSnackbar({
        open: true,
        message: `Auto-generated SKU: ${autoSKU}`,
        severity: 'info'
      });
    } else {
      setSnackbar({
        open: true,
        message: 'Please enter product name and category first',
        severity: 'warning'
      });
    }
  };

  const handleSaveNewProduct = async () => {
    // Check required fields with proper field names
    if (!newProductData.name || !newProductData.description || !newProductData.price || !newProductData.category || !newProductData.stock_quantity) {
      setSnackbar({
        open: true,
        message: 'Please fill in all required fields: Product Name, Description, Price, Category, and Stock Quantity.',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    
    // Auto-generate SKU if not provided
    let productSKU = newProductData.sku;
    if (!productSKU && newProductData.name && newProductData.category) {
      productSKU = generateSKU(newProductData.name, newProductData.category, newProductData.brand);
      console.log("SellerProducts: Auto-generated SKU:", productSKU);
    }
    
    formData.append('name', newProductData.name);
    formData.append('description', newProductData.description);
    formData.append('price', newProductData.price);
    formData.append('category', newProductData.category);
    if (newProductData.subcategory) formData.append('subcategory', newProductData.subcategory);
    if (newProductData.brand) formData.append('brand', newProductData.brand);
    formData.append('stock_quantity', newProductData.stock_quantity);
    formData.append('tags', JSON.stringify(newProductData.tags));
    if (newProductData.image) formData.append('image', newProductData.image);
    if (productSKU) formData.append('sku', productSKU);
    if (newProductData.meta_title) formData.append('meta_title', newProductData.meta_title);
    if (newProductData.meta_description) formData.append('meta_description', newProductData.meta_description);
    if (newProductData.meta_keywords) formData.append('meta_keywords', JSON.stringify(newProductData.meta_keywords.split(',').map(k => k.trim())));

    try {
      console.log("SellerProducts: Attempting to create product with formData");
      
      // Use the sellerApi to create the product
      const response = await sellerApi.createProduct(formData);
      console.log("SellerProducts: Product created successfully:", response);

      // Transform the response to match component format and add to products list
      const newProduct = {
        id: response.id,
        name: response.name,
        category: response.category,
        subcategory: response.subcategory,
        price: response.price,
        stock: response.stock,
        status: response.status === 'active' ? 'Active' : 'Draft',
        approvalStatus: response.approval_status === 'approved' ? 'Approved' :
                       response.approval_status === 'pending' ? 'Pending' : 'Rejected',
        featured: response.featured,
        image: response.image || '/api/placeholder/200/200',
        sku: response.sku,
        created: new Date(response.created_at).toLocaleDateString(),
        sales: 0,
        revenue: 0,
        rating: response.rating || 0,
        reviews: response.reviews_count || 0,
        description: response.description,
        brand: response.brand,
        tags: response.tags || []
      };

      setProducts(prev => [newProduct, ...prev]);

      // Close dialog and reset form
      handleCloseAddProductDialog();
      
      // Show success message with SKU info
      const successMessage = productSKU !== newProductData.sku 
        ? `Product added successfully! Auto-generated SKU: ${productSKU} 🎉 (Pending approval)`
        : 'Product added successfully! 🎉 (Pending approval)';
      
      setSnackbar({
        open: true,
        message: successMessage,
        severity: 'success'
      });

    } catch (error) {
      console.error('SellerProducts: Error creating product:', error);
      setSnackbar({
        open: true,
        message: `Failed to add product: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Edit Product handlers
  const handleOpenEditDialog = (product) => {
    setSelectedProduct(product);
    setEditProductData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || '',
      subcategory: product.subcategory || '',
      brand: product.brand || '',
      sku: product.sku || '',
      stock_quantity: product.stock || '',
      tags: product.tags || [],
      meta_title: product.meta_title || '',
      meta_description: product.meta_description || '',
      meta_keywords: product.meta_keywords || '',
      status: product.status || 'Active',
      featured: product.featured || false
    });
    setEditProductDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditProductDialogOpen(false);
    setSelectedProduct(null);
    setEditProductData({});
    setImagePreview(null);
  };

  const handleEditProductChange = (field, value) => {
    setEditProductData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEditProduct = async () => {
    if (!selectedProduct) return;

    setLoading(true);
    try {
      const formData = new FormData();
      
      // Add all fields to FormData
      Object.keys(editProductData).forEach(key => {
        if (key === 'tags' && Array.isArray(editProductData[key])) {
          formData.append(key, JSON.stringify(editProductData[key]));
        } else if (key === 'meta_keywords' && typeof editProductData[key] === 'string') {
          formData.append(key, JSON.stringify(editProductData[key].split(',').map(k => k.trim())));
        } else if (editProductData[key] !== null && editProductData[key] !== undefined && editProductData[key] !== '') {
          formData.append(key, editProductData[key]);
        }
      });

      // Add image if a new one was uploaded
      if (editProductData.image) {
        formData.append('image', editProductData.image);
      }

      const updatedProduct = await sellerApi.updateProduct(selectedProduct.id, formData);
      
      // Transform the response and update the products list
      const transformedProduct = {
        id: updatedProduct.id,
        name: updatedProduct.name,
        category: updatedProduct.category,
        subcategory: updatedProduct.subcategory,
        price: updatedProduct.price,
        stock: updatedProduct.stock,
        status: updatedProduct.status === 'active' ? 'Active' : 
                updatedProduct.stock === 0 ? 'Out of Stock' :
                updatedProduct.stock < 10 ? 'Low Stock' : 'Active',
        approvalStatus: updatedProduct.approval_status === 'approved' ? 'Approved' :
                       updatedProduct.approval_status === 'pending' ? 'Pending' : 'Rejected',
        featured: updatedProduct.featured,
        image: updatedProduct.image || '/api/placeholder/200/200',
        sku: updatedProduct.sku,
        created: new Date(updatedProduct.created_at).toLocaleDateString(),
        sales: 0, // TODO: Add sales tracking
        revenue: 0, // TODO: Calculate revenue
        rating: updatedProduct.rating || 0,
        reviews: updatedProduct.reviews_count || 0,
        description: updatedProduct.description,
        brand: updatedProduct.brand,
        tags: updatedProduct.tags || []
      };

      setProducts(products.map(p => 
        p.id === selectedProduct.id ? transformedProduct : p
      ));

      setSnackbar({
        open: true,
        message: 'Product updated successfully (pending approval for changes)',
        severity: 'success'
      });

      handleCloseEditDialog();
    } catch (error) {
      console.error('Error updating product:', error);
      setSnackbar({
        open: true,
        message: `Error updating product: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // View Product handlers
  const handleOpenViewDialog = (product) => {
    setSelectedProduct(product);
    setViewProductDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewProductDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Loading skeleton for grid view
  const ProductSkeleton = () => (
    <Card>
      <Skeleton variant="rectangular" height={200} />
      <CardContent>
        <Skeleton variant="text" height={24} />
        <Skeleton variant="text" height={16} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Skeleton variant="text" width={60} />
          <Skeleton variant="text" width={40} />
        </Box>
      </CardContent>
    </Card>
  );

  // Grid view component
  const ProductGrid = () => (
    <Grid container spacing={3}>
      {loading
        ? Array.from(new Array(6)).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <ProductSkeleton />
            </Grid>
          ))
        : filteredProducts
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.image}
                    alt={product.name}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" component="h2" noWrap sx={{ flex: 1, mr: 1 }}>
                        {product.name}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, product)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {product.category} • {product.sku}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip
                        label={product.status}
                        color={getStatusColor(product.status)}
                        size="small"
                      />
                      <Chip
                        label={product.approvalStatus}
                        color={getApprovalStatusColor(product.approvalStatus)}
                        size="small"
                        icon={getApprovalStatusIcon(product.approvalStatus)}
                      />
                      {product.featured && (
                        <Chip label="Featured" color="primary" size="small" />
                      )}
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" color="primary.main">
                        ${product.price}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <StockIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {product.stock}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <StarIcon fontSize="small" color="warning" />
                        <Typography variant="body2">
                          {product.rating} ({product.reviews})
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {product.sales} sold
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
    </Grid>
  );

  // Table view component
  const ProductTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Product</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Stock</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Approval</TableCell>
            <TableCell>Sales</TableCell>
            <TableCell>Rating</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading
            ? Array.from(new Array(5)).map((_, index) => (
                <TableRow key={index}>
                  {Array.from(new Array(9)).map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton variant="text" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : filteredProducts
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((product) => (
                  <TableRow key={product.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <img
                          src={product.image}
                          alt={product.name}
                          style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
                        />
                        <Box>
                          <Typography variant="subtitle2">{product.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {product.sku}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>${product.price}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <Chip
                        label={product.status}
                        color={getStatusColor(product.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={product.approvalStatus}
                        color={getApprovalStatusColor(product.approvalStatus)}
                        size="small"
                        icon={getApprovalStatusIcon(product.approvalStatus)}
                      />
                    </TableCell>
                    <TableCell>{product.sales}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <StarIcon fontSize="small" color="warning" />
                        <Typography variant="body2">
                          {product.rating}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, product)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          My Products
        </Typography>        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddProductDialog}
          size="large"
        >
          Add Product
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Total Products
              </Typography>
              <Typography variant="h4" color="primary.main">
                {products.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Active Products
              </Typography>
              <Typography variant="h4" color="success.main">
                {products.filter(p => p.status === 'Active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Low Stock
              </Typography>
              <Typography variant="h4" color="warning.main">
                {products.filter(p => p.status === 'Low Stock').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Pending Approval
              </Typography>
              <Typography variant="h4" color="warning.main">
                {products.filter(p => p.approvalStatus === 'Pending').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Low Stock">Low Stock</MenuItem>
                <MenuItem value="Out of Stock">Out of Stock</MenuItem>
                <MenuItem value="Draft">Draft</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filterCategory}
                label="Category"
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>                {productCategories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={viewMode === 'grid' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('grid')}
                size="small"
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'table' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('table')}
                size="small"
              >
                Table
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Products Display */}
      {filteredProducts.length === 0 && !loading ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          {error ? (
            // Error state
            <>
              <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
              <Typography variant="h6" color="error.main" gutterBottom>
                Failed to Load Products
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
                {error}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={handleRetry}
                  color="primary"
                >
                  Try Again
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleOpenAddProductDialog}
                >
                  Add Product Manually
                </Button>
              </Box>
            </>
          ) : (
            // Empty state (no products but no error)
            <>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No products found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {search || filterStatus || filterCategory
                  ? 'Try adjusting your search criteria'
                  : 'Start by adding your first product to your store'}
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenAddProductDialog}
              >
                Add Product
              </Button>
            </>
          )}
        </Paper>
      ) : (
        <>
          {viewMode === 'grid' ? <ProductGrid /> : <ProductTable />}
          
          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <TablePagination
              component="div"
              count={filteredProducts.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </Box>
        </>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >        <MenuItem onClick={() => handleViewProduct(selectedProductForMenu)}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleOpenEditDialog(selectedProductForMenu)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Product</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleDuplicateProduct(selectedProductForMenu)}>
          <ListItemIcon>
            <DuplicateIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => {
            setSelectedProduct(selectedProductForMenu);
            setDeleteDialogOpen(true);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedProduct?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteProduct} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        aria-label="add product"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', md: 'none' }
        }}
        onClick={handleOpenAddProductDialog}
      >
        <AddIcon />
      </Fab>

      {/* Add New Product Dialog */}
      <Dialog
        open={addProductDialogOpen}
        onClose={handleCloseAddProductDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Product</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Product Name"
                name="name"
                value={newProductData.name}
                onChange={handleNewProductChange}
                variant="outlined"
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={newProductData.description}
                onChange={handleNewProductChange}
                variant="outlined"
                multiline
                rows={4}
                required
                sx={{ mb: 2 }}
              />
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Price"
                    name="price"
                    type="number"
                    value={newProductData.price}
                    onChange={handleNewProductChange}
                    variant="outlined"
                    required
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Stock Quantity"
                    name="stock_quantity"
                    type="number"
                    value={newProductData.stock_quantity}
                    onChange={handleNewProductChange}
                    variant="outlined"
                    required
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel id="add-product-category-label">Category</InputLabel>
                    <Select
                      labelId="add-product-category-label"
                      name="category"
                      value={newProductData.category}
                      onChange={handleNewProductChange}
                      label="Category"
                    >
                      {categories.map((cat) => (
                        <MenuItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Subcategory (Optional)"
                    name="subcategory"
                    value={newProductData.subcategory}
                    onChange={handleNewProductChange}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Brand (Optional)"
                    name="brand"
                    value={newProductData.brand}
                    onChange={handleNewProductChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'end' }}>
                    <TextField
                      fullWidth
                      label="SKU"
                      name="sku"
                      value={newProductData.sku}
                      onChange={handleNewProductChange}
                      variant="outlined"
                      helperText="Leave empty to auto-generate"
                    />
                    <Button
                      variant="outlined"
                      onClick={handleAutoGenerateSKU}
                      sx={{ 
                        minWidth: 'auto',
                        px: 2,
                        height: '56px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Auto
                    </Button>
                  </Box>
                </Grid>
              </Grid>
              <TextField 
                fullWidth
                label="Tags (comma-separated)"
                name="tags"
                value={Array.isArray(newProductData.tags) ? newProductData.tags.join(',') : ''}
                onChange={(e) => setNewProductData(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()) }))}
                variant="outlined"
                helperText="Enter tags separated by commas"
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" gutterBottom>Product Image</Typography>
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 2,
                  textAlign: 'center',
                  mb: 2,
                  minHeight: 150,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  position: 'relative'
                }}
              >
                {imagePreview ? (
                  <>
                    <Avatar
                      src={imagePreview}
                      alt="Product Preview"
                      variant="rounded"
                      sx={{ width: 120, height: 120, mb: 1 }}
                    />
                    <Button onClick={handleRemoveImage} size="small" color="error">
                      Remove Image
                    </Button>
                  </>
                ) : (
                  <Typography color="textSecondary">Image Preview</Typography>
                )}
              </Box>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<CloudUploadIcon />}
              >
                Upload Image
                <input
                  id="add-product-image-upload"
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{mt: 2}}>SEO (Optional)</Typography>
              <TextField
                fullWidth
                label="Meta Title"
                name="meta_title"
                value={newProductData.meta_title}
                onChange={handleNewProductChange}
                variant="outlined"
                sx={{ mb: 2 }}
                helperText="If empty, product name will be used."
              />
              <TextField
                fullWidth
                label="Meta Description"
                name="meta_description"
                value={newProductData.meta_description}
                onChange={handleNewProductChange}
                variant="outlined"
                multiline
                rows={3}
                sx={{ mb: 2 }}
                helperText="If empty, the start of the product description will be used."
              />
              <TextField
                fullWidth
                label="Meta Keywords (comma-separated)"
                name="meta_keywords"
                value={newProductData.meta_keywords}
                onChange={handleNewProductChange}
                variant="outlined"
                helperText="Enter relevant keywords separated by commas."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddProductDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveNewProduct} 
            variant="contained" 
            color="primary"
            disabled={loading || !newProductData.name || !newProductData.description || !newProductData.price || !newProductData.category || !newProductData.stock_quantity}
          >
            {loading ? <CircularProgress size={24} /> : 'Save Product'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog
        open={editProductDialogOpen}
        onClose={handleCloseEditDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Product: {selectedProduct?.name}</DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Product Name"
                name="name"
                value={editProductData.name}
                onChange={e => handleEditProductChange('name', e.target.value)}
                variant="outlined"
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={editProductData.description}
                onChange={e => handleEditProductChange('description', e.target.value)}
                variant="outlined"
                multiline
                rows={4}
                required
                sx={{ mb: 2 }}
              />
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Price"
                    name="price"
                    type="number"
                    value={editProductData.price}
                    onChange={e => handleEditProductChange('price', e.target.value)}
                    variant="outlined"
                    required
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Stock Quantity"
                    name="stock_quantity"
                    type="number"
                    value={editProductData.stock_quantity}
                    onChange={e => handleEditProductChange('stock_quantity', e.target.value)}
                    variant="outlined"
                    required
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel id="edit-product-category-label">Category</InputLabel>
                    <Select
                      labelId="edit-product-category-label"
                      name="category"
                      value={editProductData.category}
                      onChange={e => handleEditProductChange('category', e.target.value)}
                      label="Category"
                    >
                      {categories.map((cat) => (
                        <MenuItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Subcategory (Optional)"
                    name="subcategory"
                    value={editProductData.subcategory}
                    onChange={e => handleEditProductChange('subcategory', e.target.value)}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Brand (Optional)"
                    name="brand"
                    value={editProductData.brand}
                    onChange={e => handleEditProductChange('brand', e.target.value)}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'end' }}>
                    <TextField
                      fullWidth
                      label="SKU"
                      name="sku"
                      value={editProductData.sku}
                      onChange={e => handleEditProductChange('sku', e.target.value)}
                      variant="outlined"
                      helperText="Leave empty to auto-generate"
                    />
                    <Button
                      variant="outlined"
                      onClick={() => {
                        if (editProductData.name && editProductData.category) {
                          const autoSKU = generateSKU(editProductData.name, editProductData.category, editProductData.brand);
                          handleEditProductChange('sku', autoSKU);
                          setSnackbar({
                            open: true,
                            message: `Auto-generated SKU: ${autoSKU}`,
                            severity: 'info'
                          });
                        } else {
                          setSnackbar({
                            open: true,
                            message: 'Please enter product name and category first',
                            severity: 'warning'
                          });
                        }
                      }}
                      sx={{ 
                        minWidth: 'auto',
                        px: 2,
                        height: '56px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Auto
                    </Button>
                  </Box>
                </Grid>
              </Grid>
              <TextField 
                fullWidth
                label="Tags (comma-separated)"
                name="tags"
                value={Array.isArray(editProductData.tags) ? editProductData.tags.join(',') : ''}
                onChange={(e) => handleEditProductChange('tags', e.target.value.split(',').map(t => t.trim()))}
                variant="outlined"
                helperText="Enter tags separated by commas"
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" gutterBottom>Product Image</Typography>
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 2,
                  textAlign: 'center',
                  mb: 2,
                  minHeight: 150,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  position: 'relative'
                }}
              >
                {imagePreview ? (
                  <>
                    <Avatar
                      src={imagePreview}
                      alt="Product Preview"
                      variant="rounded"
                      sx={{ width: 120, height: 120, mb: 1 }}
                    />
                    <Button onClick={handleRemoveImage} size="small" color="error">
                      Remove Image
                    </Button>
                  </>
                ) : (
                  <>
                    <Avatar
                      src={selectedProduct?.image}
                      alt="Product Image"
                      variant="rounded"
                      sx={{ width: 120, height: 120, mb: 1 }}
                      onError={(e) => { e.target.src = defaultProductImage; }}
                    />
                    <Typography color="textSecondary" variant="caption">Current Image</Typography>
                  </>
                )}
              </Box>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<CloudUploadIcon />}
              >
                Upload New Image
                <input
                  id="edit-product-image-upload"
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{mt: 2}}>SEO (Optional)</Typography>
              <TextField
                fullWidth
                label="Meta Title"
                name="meta_title"
                value={editProductData.meta_title}
                onChange={e => handleEditProductChange('meta_title', e.target.value)}
                variant="outlined"
                sx={{ mb: 2 }}
                helperText="If empty, product name will be used."
              />
              <TextField
                fullWidth
                label="Meta Description"
                name="meta_description"
                value={editProductData.meta_description}
                onChange={e => handleEditProductChange('meta_description', e.target.value)}
                variant="outlined"
                multiline
                rows={3}
                sx={{ mb: 2 }}
                helperText="If empty, the start of the product description will be used."
              />
              <TextField
                fullWidth
                label="Meta Keywords (comma-separated)"
                name="meta_keywords"
                value={editProductData.meta_keywords}
                onChange={e => handleEditProductChange('meta_keywords', e.target.value)}
                variant="outlined"
                helperText="Enter relevant keywords separated by commas."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveEditProduct} 
            variant="contained" 
            color="primary"
            disabled={loading || !editProductData.name || !editProductData.description || !editProductData.price || !editProductData.category || !editProductData.stock_quantity}
          >
            {loading ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Product Dialog */}
      <Dialog
        open={viewProductDialogOpen}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          View Product: {selectedProduct?.name}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>Product Details</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>SKU:</strong> {selectedProduct?.sku}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Category:</strong> {selectedProduct?.category}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Tags:</strong> {selectedProduct?.tags?.join(', ')}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Status:</strong>
                <Chip 
                  label={selectedProduct?.status} 
                  size="small"
                  color={getStatusColor(selectedProduct?.status)}
                  sx={{ ml: 1 }}
                />
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Approval Status:</strong>
                <Chip 
                  label={selectedProduct?.approvalStatus} 
                  size="small"
                  color={getApprovalStatusColor(selectedProduct?.approvalStatus)}
                  icon={getApprovalStatusIcon(selectedProduct?.approvalStatus)}
                  sx={{ ml: 1 }}
                />
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Price:</strong> ${selectedProduct?.price?.toFixed(2)}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Stock Quantity:</strong> {selectedProduct?.stock}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Sales:</strong> {selectedProduct?.sales} sold
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Revenue:</strong> ${selectedProduct?.revenue?.toFixed(2)}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Rating:</strong> {selectedProduct?.rating} ({selectedProduct?.reviews} reviews)
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>Product Image</Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 2,
                  minHeight: 200,
                  position: 'relative'
                }}
              >
                <Avatar
                  src={selectedProduct?.image}
                  alt={selectedProduct?.name}
                  variant="rounded"
                  sx={{ width: 120, height: 120 }}
                  onError={(e) => { e.target.src = defaultProductImage; }}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Description</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedProduct?.description}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
          <Button onClick={() => {
            handleCloseViewDialog();
            handleOpenEditDialog(selectedProduct);
          }} variant="contained">
            Edit Product
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SellerProducts;
