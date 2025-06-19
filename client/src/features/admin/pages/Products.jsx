import React, { useState, useEffect, useContext } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    IconButton,
    Button,
    TextField,
    InputAdornment,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Tooltip,
    Grid,
    CircularProgress,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Avatar,
    Tabs,
    Tab,
    Checkbox,
    Divider,
    Switch,
    FormControlLabel,
    Menu,
    ListItemIcon,
    ListItemText,
    Card,
    CardContent,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Snackbar,
    Alert,
    Badge
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    FilterList as FilterListIcon,
    Clear as ClearIcon,
    CloudUpload as CloudUploadIcon,
    CloudDownload as CloudDownloadIcon,
    ExpandMore as ExpandMoreIcon,
    Star as StarIcon,
    StarBorder as StarBorderIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Pending as PendingIcon,
    Assignment as AssignmentIcon,
    Label as LabelIcon,
    Category as CategoryIcon,
    Language as LanguageIcon
} from '@mui/icons-material';
import { ThemeContext } from '../../../context/ThemeContext';
import { useAdminApi } from '../../../api/apiClient';
import defaultProductImage from '../../../assets/images/placeholder.webp';

// Import mock data
import mockAdminProducts,
 { 
    categories, 
    tags, 
    productStatuses, 
    approvalStatuses, 
    visibilityOptions 
} from '../../../data/mockProductsAdmin';

// Tab panel component for different sections
function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`admin-tabpanel-${index}`}
            aria-labelledby={`admin-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

function AdminProducts() {
    const { theme, colorValues } = useContext(ThemeContext);
    const adminApi = useAdminApi();
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterApproval, setFilterApproval] = useState('');
    const [filterTag, setFilterTag] = useState('');
    const [filterFeatured, setFilterFeatured] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [bulkActionAnchorEl, setBulkActionAnchorEl] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [seoDialogOpen, setSeoDialogOpen] = useState(false);
    const [selectedProductSeo, setSelectedProductSeo] = useState(null);
    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
    const [tagDialogOpen, setTagDialogOpen] = useState(false);
    const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
    const [selectedProductApproval, setSelectedProductApproval] = useState(null);
    const [addProductDialogOpen, setAddProductDialogOpen] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [importOptions, setImportOptions] = useState({
        updateExisting: false,
        skipErrors: false,
        sendNotification: false,
    });    const [newProductData, setNewProductData] = useState({
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
    const [imagePreview, setImagePreview] = useState(null);
      useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                // Fetch data from your API
                const data = await adminApi.getProducts(); // Using adminApi for admin dashboard
                if (data) {
                    setProducts(data);
                } else {
                    setProducts([]); // Set to empty array if data is null/undefined
                    console.warn('fetchProducts: Received null or undefined data from adminApi.getProducts()');
                }
            } catch (error) {
                console.error('Error fetching products:', error);
                setProducts([]); // Set to empty array on error
                setSnackbar({
                    open: true,
                    message: `Error fetching products: ${error.message}`,
                    severity: 'error'
                });
            } finally {
                setLoading(false);
            }
        };        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array - fetch products only once on mount
    
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    
    const handleSearchChange = (event) => {
        setSearch(event.target.value);
        setPage(0);
    };
    
    const handleCategoryFilterChange = (event) => {
        setFilterCategory(event.target.value);
        setPage(0);
    };
    
    const handleStatusFilterChange = (event) => {
        setFilterStatus(event.target.value);
        setPage(0);
    };

    const handleApprovalFilterChange = (event) => {
        setFilterApproval(event.target.value);
        setPage(0);
    };

    const handleTagFilterChange = (event) => {
        setFilterTag(event.target.value);
        setPage(0);
    };

    const handleFeaturedFilterChange = (event) => {
        setFilterFeatured(event.target.value);
        setPage(0);
    };
    
    const handleOpenDeleteDialog = (product) => {
        setProductToDelete(product);
        setDeleteDialogOpen(true);
    };
    
    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setProductToDelete(null);
    };
    
    const handleDeleteProduct = () => {
        // In a real app, you would call your API to delete the product
        // await api.deleteProduct(productToDelete.id);
        
        // For now, we'll just filter the product out of our local state
        setProducts(products.filter(p => p.id !== productToDelete.id));
        handleCloseDeleteDialog();
        setSnackbar({
            open: true,
            message: 'Product deleted successfully',
            severity: 'success'
        });
    };
    
    const handleClearFilters = () => {
        setSearch('');
        setFilterCategory('');
        setFilterStatus('');
        setFilterApproval('');
        setFilterTag('');
        setFilterFeatured('');
    };

    const handleSelectProduct = (id) => {
        const selectedIndex = selectedProducts.indexOf(id);
        let newSelected = [];
        
        if (selectedIndex === -1) {
            newSelected = [...selectedProducts, id];
        } else {
            newSelected = selectedProducts.filter(productId => productId !== id);
        }
        
        setSelectedProducts(newSelected);
    };

    const handleSelectAllProducts = (event) => {
        if (event.target.checked) {
            const newSelecteds = filteredProducts.map((product) => product.id);
            setSelectedProducts(newSelecteds);
            setSelectAll(true);
        } else {
            setSelectedProducts([]);
            setSelectAll(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleBulkActionClick = (event) => {
        setBulkActionAnchorEl(event.currentTarget);
    };

    const handleBulkActionClose = () => {
        setBulkActionAnchorEl(null);
    };

    const handleBulkDelete = () => {
        setProducts(products.filter(p => !selectedProducts.includes(p.id)));
        setSelectedProducts([]);
        handleBulkActionClose();
        setSnackbar({
            open: true,
            message: `${selectedProducts.length} products deleted successfully`,
            severity: 'success'
        });
    };

    const handleBulkFeature = (featured) => {
        setProducts(products.map(p => {
            if (selectedProducts.includes(p.id)) {
                return { ...p, featured };
            }
            return p;
        }));
        handleBulkActionClose();
        setSnackbar({
            open: true,
            message: `${selectedProducts.length} products updated successfully`,
            severity: 'success'
        });
    };

    const handleBulkApprovalStatus = (approvalStatus) => {
        setProducts(products.map(p => {
            if (selectedProducts.includes(p.id)) {
                return { ...p, approvalStatus };
            }
            return p;
        }));
        handleBulkActionClose();
        setSnackbar({
            open: true,
            message: `${selectedProducts.length} products updated successfully`,
            severity: 'success'
        });
    };

    const handleUploadDialogOpen = () => {
        setUploadDialogOpen(true);
    };

    const handleUploadDialogClose = () => {
        setUploadDialogOpen(false);
        setUploadedFile(null); // Reset file on close
        setImportOptions({ // Reset options on close
            updateExisting: false,
            skipErrors: false,
            sendNotification: false,
        });
    };

    const handleFileChange = (event) => {
        console.log('[AdminProducts] handleFileChange triggered.');
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            console.log('[AdminProducts] File selected:', file);
            console.log('[AdminProducts] File name:', file.name);
            setUploadedFile(file);
        } else {
            console.log('[AdminProducts] No file selected or files array empty.');
            setUploadedFile(null);
        }
    };

    // Add this log to see the state on re-renders
    console.log('[AdminProducts] Rendering, uploadedFile state:', uploadedFile);

    const handleImportOptionChange = (event) => {
        setImportOptions(prev => ({ ...prev, [event.target.name]: event.target.checked }));
    };

    const handleUploadProducts = async () => {
        if (!uploadedFile) {
            setSnackbar({
                open: true,
                message: 'Please select a file to upload.',
                severity: 'error',
            });
            return;
        }

        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('updateExisting', importOptions.updateExisting);
        formData.append('skipErrors', importOptions.skipErrors);
        formData.append('sendNotification', importOptions.sendNotification);        setLoading(true);
        try {
            const response = await adminApi.importProducts(formData); // Use adminApi for admin operations

            setSnackbar({
                open: true,
                message: response.message || 'Products imported successfully!', // Use actual response message
                severity: 'success',
            });
            handleUploadDialogClose();
            // Optionally, refresh the product list:
            // const data = await adminApi.getProducts();
            // if (data) setProducts(data);
        } catch (error) {
            console.error('Error importing products:', error);
            setSnackbar({
                open: true,
                message: `Error importing products: ${error.message || 'Unknown error'}`,
                severity: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenSeoDialog = (product) => {
        setSelectedProductSeo(product);
        setSeoDialogOpen(true);
    };

    const handleCloseSeoDialog = () => {
        setSeoDialogOpen(false);
        setSelectedProductSeo(null);
    };

    const handleSaveSeo = () => {
        // In a real app, you would update the product's SEO data
        setSeoDialogOpen(false);
        setSnackbar({
            open: true,
            message: 'SEO data updated successfully',
            severity: 'success'
        });
    };

    const handleCategoryDialogOpen = () => {
        setCategoryDialogOpen(true);
    };

    const handleCategoryDialogClose = () => {
        setCategoryDialogOpen(false);
    };

    const handleTagDialogOpen = () => {
        setTagDialogOpen(true);
    };

    const handleTagDialogClose = () => {
        setTagDialogOpen(false);
    };

    const handleOpenApprovalDialog = (product) => {
        setSelectedProductApproval(product);
        setApprovalDialogOpen(true);
    };

    const handleCloseApprovalDialog = () => {
        setApprovalDialogOpen(false);
        setSelectedProductApproval(null);
    };

    const handleUpdateApproval = (status) => {
        setProducts(products.map(p => {
            if (p.id === selectedProductApproval.id) {
                return { ...p, approvalStatus: status };
            }
            return p;
        }));
        setApprovalDialogOpen(false);
        setSnackbar({
            open: true,
            message: `Product approval status updated to ${status}`,
            severity: 'success'
        });
    };

    const handleToggleFeature = (product) => {
        setProducts(products.map(p => {
            if (p.id === product.id) {
                return { ...p, featured: !p.featured };
            }
            return p;
        }));
        setSnackbar({
            open: true,
            message: `Product ${product.featured ? 'removed from' : 'added to'} featured listings`,
            severity: 'success'
        });
    };

    const handleSnackbarClose = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleOpenAddProductDialog = () => {
        setAddProductDialogOpen(true);
    };    const handleCloseAddProductDialog = () => {
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
            stock_quantity: '', // Changed to match form field name
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
            setNewProductData(prev => ({ ...prev, image: file }));
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        setNewProductData(prev => ({ ...prev, image: null }));
        setImagePreview(null);
        // Reset the file input
        const fileInput = document.getElementById('add-product-image-upload');
        if (fileInput) {
            fileInput.value = '';
        }
    };    const handleSaveNewProduct = async () => {
        // Check required fields with proper field names
        if (!newProductData.name || !newProductData.description || !newProductData.price || !newProductData.category || !newProductData.stock_quantity) {
            alert('Please fill in all required fields: Product Name, Description, Price, Category, and Stock Quantity.');
            return;
        }

        const formData = new FormData();
        formData.append('name', newProductData.name);
        formData.append('description', newProductData.description);        formData.append('price', newProductData.price);
        formData.append('category', newProductData.category);
        formData.append('brand', newProductData.brand);
        // Use correct field name for stock quantity
        formData.append('stock_quantity', newProductData.stock_quantity);
        formData.append('tags', JSON.stringify(newProductData.tags)); // Assuming tags are an array of strings
        formData.append('image', newProductData.image); // The File object
        if (newProductData.sku) formData.append('sku', newProductData.sku);
        if (newProductData.weight) formData.append('weight', newProductData.weight);
        if (newProductData.dimensions) formData.append('dimensions', newProductData.dimensions);
        if (newProductData.color) formData.append('color', newProductData.color);
        if (newProductData.material) formData.append('material', newProductData.material);
        if (newProductData.manufacturer) formData.append('manufacturer', newProductData.manufacturer);
        if (newProductData.releaseDate) formData.append('releaseDate', newProductData.releaseDate);

        try {
            console.log("Products.jsx: Attempting to create product with formData:", Object.fromEntries(formData.entries()));            // Use the adminApi to create the product
            const response = await adminApi.createProduct(formData);
            console.log("Products.jsx: Product created successfully:", response);

            // Assuming the response contains the newly created product data
            // You might want to update your local state or refetch products here
            // For now, just log and close the dialog
            // Example: dispatch(fetchProducts()); // If using Redux or similar

            handleCloseAddProductDialog();
            // Optionally, refresh the product list or show a success message
            alert('Product added successfully!'); 
            // TODO: Refresh product list - for now, we can manually refresh or implement a fetchProducts call

        } catch (error) {
            console.error('Products.jsx: Error creating product:', error);
            alert(`Failed to add product: ${error.message}`);
        }
    };

    // Filter and search products
    const filteredProducts = products.filter(product => {
        const matchesSearch = search === '' || 
            (product.name && product.name.toLowerCase().includes(search.toLowerCase())) ||
            (product.category && product.category.toLowerCase().includes(search.toLowerCase())) ||
            (product.sku && product.sku.toLowerCase().includes(search.toLowerCase())); // Safely access SKU
            
        const matchesCategory = filterCategory === '' || product.category === filterCategory;
        const matchesStatus = filterStatus === '' || product.status === filterStatus;
        const matchesApproval = filterApproval === '' || product.approvalStatus === filterApproval;
        const matchesTag = filterTag === '' || (product.tags && product.tags.includes(filterTag));
        const matchesFeatured = filterFeatured === '' || 
            (filterFeatured === 'Featured' && product.featured) || 
            (filterFeatured === 'Not Featured' && !product.featured);
        
        return matchesSearch && matchesCategory && matchesStatus && 
               matchesApproval && matchesTag && matchesFeatured;
    });
    
    const isProductSelected = (id) => selectedProducts.indexOf(id) !== -1;
    
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }
    
    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Products</Typography>
                <Box>
                    <Button
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                        onClick={handleUploadDialogOpen}
                        sx={{ mr: 2, borderRadius: '8px', textTransform: 'none' }}
                    >
                        Import Products
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleOpenAddProductDialog} // <-- Connect button to open dialog
                        sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            px: 3
                        }}
                    >
                        Add New Product
                    </Button>
                </Box>
            </Box>
            
            {/* Tab Navigation */}
            <Paper
                elevation={theme === 'dark' ? 3 : 1}
                sx={{
                    bgcolor: colorValues.bgPaper,
                    borderRadius: 2,
                    mb: 4
                }}
            >
                <Tabs 
                    value={tabValue} 
                    onChange={handleTabChange} 
                    indicatorColor="primary"
                    textColor="primary"
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab label="Products" />
                    <Tab label="Categories" />
                    <Tab label="Tags" />
                </Tabs>
            </Paper>
            
            {/* Products Tab */}
            <TabPanel value={tabValue} index={0}>
                {/* Filters and Search */}
                <Paper
                    elevation={theme === 'dark' ? 3 : 1}
                    sx={{
                        p: 3,
                        mb: 4,
                        bgcolor: colorValues.bgPaper,
                        borderRadius: 2
                    }}
                >
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Search products..."
                                value={search}
                                onChange={handleSearchChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth>
                                <InputLabel id="category-filter-label">Category</InputLabel>
                                <Select
                                    labelId="category-filter-label"
                                    value={filterCategory}
                                    onChange={handleCategoryFilterChange}
                                    label="Category"
                                >
                                    <MenuItem value="">All Categories</MenuItem>
                                    {categories.map((category) => (
                                        <MenuItem key={category.id} value={category.name}>
                                            {category.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth>
                                <InputLabel id="tag-filter-label">Tag</InputLabel>
                                <Select
                                    labelId="tag-filter-label"
                                    value={filterTag}
                                    onChange={handleTagFilterChange}
                                    label="Tag"
                                >
                                    <MenuItem value="">All Tags</MenuItem>
                                    {tags.map((tag) => (
                                        <MenuItem key={tag.id} value={tag.name}>
                                            {tag.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth>
                                <InputLabel id="status-filter-label">Status</InputLabel>
                                <Select
                                    labelId="status-filter-label"
                                    value={filterStatus}
                                    onChange={handleStatusFilterChange}
                                    label="Status"
                                >
                                    <MenuItem value="">All Statuses</MenuItem>
                                    {productStatuses.map((status, index) => (
                                        <MenuItem key={index} value={status}>
                                            {status}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth>
                                <InputLabel id="approval-filter-label">Approval</InputLabel>
                                <Select
                                    labelId="approval-filter-label"
                                    value={filterApproval}
                                    onChange={handleApprovalFilterChange}
                                    label="Approval"
                                >
                                    <MenuItem value="">All</MenuItem>
                                    {approvalStatuses.map((status, index) => (
                                        <MenuItem key={index} value={status}>
                                            {status}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={1}>
                            <Button
                                variant="outlined"
                                startIcon={<ClearIcon />}
                                onClick={handleClearFilters}
                                sx={{ width: '100%' }}
                            >
                                Clear
                            </Button>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2} alignItems="center" sx={{ mt: 1 }}>
                        <Grid item xs={12} md={3}>
                            <FormControl component="fieldset">
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={filterFeatured === 'Featured'}
                                            onChange={(e) => setFilterFeatured(e.target.checked ? 'Featured' : '')}
                                            color="primary"
                                        />
                                    }
                                    label="Featured Only"
                                />
                            </FormControl>
                        </Grid>
                        {selectedProducts.length > 0 && (
                            <Grid item xs={12} md={9} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Typography variant="body2" sx={{ mr: 2, alignSelf: 'center' }}>
                                    {selectedProducts.length} selected
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleBulkActionClick}
                                    endIcon={<ExpandMoreIcon />}
                                >
                                    Bulk Actions
                                </Button>
                                <Menu
                                    anchorEl={bulkActionAnchorEl}
                                    open={Boolean(bulkActionAnchorEl)}
                                    onClose={handleBulkActionClose}
                                >
                                    <MenuItem onClick={() => handleBulkFeature(true)}>
                                        <ListItemIcon>
                                            <StarIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText>Mark as Featured</ListItemText>
                                    </MenuItem>
                                    <MenuItem onClick={() => handleBulkFeature(false)}>
                                        <ListItemIcon>
                                            <StarBorderIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText>Remove from Featured</ListItemText>
                                    </MenuItem>
                                    <Divider />
                                    <MenuItem onClick={() => handleBulkApprovalStatus('Approved')}>
                                        <ListItemIcon>
                                            <CheckCircleIcon fontSize="small" color="success" />
                                        </ListItemIcon>
                                        <ListItemText>Approve</ListItemText>
                                    </MenuItem>
                                    <MenuItem onClick={() => handleBulkApprovalStatus('Pending')}>
                                        <ListItemIcon>
                                            <PendingIcon fontSize="small" color="warning" />
                                        </ListItemIcon>
                                        <ListItemText>Mark as Pending</ListItemText>
                                    </MenuItem>
                                    <MenuItem onClick={() => handleBulkApprovalStatus('Rejected')}>
                                        <ListItemIcon>
                                            <CancelIcon fontSize="small" color="error" />
                                        </ListItemIcon>
                                        <ListItemText>Reject</ListItemText>
                                    </MenuItem>
                                    <Divider />
                                    <MenuItem onClick={handleBulkDelete}>
                                        <ListItemIcon>
                                            <DeleteIcon fontSize="small" color="error" />
                                        </ListItemIcon>
                                        <ListItemText>Delete</ListItemText>
                                    </MenuItem>
                                </Menu>
                            </Grid>
                        )}
                    </Grid>
                </Paper>
                
                {/* Products Table */}
                <Paper
                    elevation={theme === 'dark' ? 3 : 1}
                    sx={{
                        width: '100%',
                        overflow: 'hidden',
                        bgcolor: colorValues.bgPaper,
                        borderRadius: 2
                    }}
                >
                    <TableContainer>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            color="primary"
                                            indeterminate={selectedProducts.length > 0 && selectedProducts.length < filteredProducts.length}
                                            checked={filteredProducts.length > 0 && selectedProducts.length === filteredProducts.length}
                                            onChange={handleSelectAllProducts}
                                        />
                                    </TableCell>
                                    <TableCell>Product</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Tags</TableCell>
                                    <TableCell align="right">Price</TableCell>
                                    <TableCell align="right">Stock</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Approval</TableCell>
                                    <TableCell>Featured</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredProducts
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((product) => {
                                        const isSelected = isProductSelected(product.id);
                                        return (
                                            <TableRow 
                                                key={product.id} 
                                                hover
                                                selected={isSelected}
                                            >
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        color="primary"
                                                        checked={isSelected}
                                                        onChange={() => handleSelectProduct(product.id)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Avatar 
                                                            src={product.image} 
                                                            alt={product.name}
                                                            variant="rounded"
                                                            sx={{ width: 40, height: 40, mr: 2 }}
                                                            onError={(e) => { e.target.src = defaultProductImage; }}
                                                        />
                                                        <Box>
                                                            <Typography variant="body2">{product.name}</Typography>
                                                            <Typography variant="caption" color="textSecondary">
                                                                SKU: {product.sku}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{product.category}</TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                        {product.tags?.map((tag, index) => (
                                                            <Chip 
                                                                key={index} 
                                                                label={tag} 
                                                                size="small" 
                                                                variant="outlined"
                                                            />
                                                        ))}
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="right">
                                                    {product.salePrice ? (
                                                        <Box>
                                                            <Typography 
                                                                variant="body2" 
                                                                component="span" 
                                                                sx={{ 
                                                                    textDecoration: 'line-through',
                                                                    color: 'text.secondary',
                                                                    mr: 1
                                                                }}
                                                            >
                                                                ${product.price.toFixed(2)}
                                                            </Typography>
                                                            <Typography variant="body2" component="span" color="error">
                                                                ${product.salePrice.toFixed(2)}
                                                            </Typography>
                                                        </Box>
                                                    ) : (
                                                        <Typography variant="body2">
                                                            ${product.price.toFixed(2)}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell align="right">{product.stock}</TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={product.status} 
                                                        size="small"
                                                        sx={{
                                                            bgcolor: 
                                                                product.status === 'Active' ? 'success.main' :
                                                                product.status === 'Low Stock' ? 'warning.main' :
                                                                product.status === 'Out of Stock' ? 'error.main' :
                                                                product.status === 'Discontinued' ? 'text.disabled' :
                                                                'info.main',
                                                            color: 'white'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={product.approvalStatus} 
                                                        size="small"
                                                        sx={{
                                                            bgcolor: 
                                                                product.approvalStatus === 'Approved' ? 'success.main' :
                                                                product.approvalStatus === 'Pending' ? 'warning.main' :
                                                                product.approvalStatus === 'Rejected' ? 'error.main' :
                                                                'text.disabled',
                                                            color: 'white'
                                                        }}
                                                        onClick={() => handleOpenApprovalDialog(product)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        color={product.featured ? 'warning' : 'default'}
                                                        onClick={() => handleToggleFeature(product)}
                                                    >
                                                        {product.featured ? <StarIcon /> : <StarBorderIcon />}
                                                    </IconButton>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Tooltip title="View Product">
                                                        <IconButton size="small" color="primary">
                                                            <VisibilityIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Edit Product">
                                                        <IconButton size="small" color="info">
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="SEO Settings">
                                                        <IconButton 
                                                            size="small" 
                                                            color="success"
                                                            onClick={() => handleOpenSeoDialog(product)}
                                                        >
                                                            <LanguageIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete Product">
                                                        <IconButton 
                                                            size="small" 
                                                            color="error" 
                                                            onClick={() => handleOpenDeleteDialog(product)}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                {filteredProducts.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={10} align="center">
                                            <Typography variant="body1" sx={{ py: 2 }}>
                                                No products found
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        component="div"
                        count={filteredProducts.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
            </TabPanel>
            
            {/* Categories Tab */}
            <TabPanel value={tabValue} index={1}>
                <Paper
                    elevation={theme === 'dark' ? 3 : 1}
                    sx={{
                        p: 3,
                        mb: 4,
                        bgcolor: colorValues.bgPaper,
                        borderRadius: 2
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6">Category Management</Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleCategoryDialogOpen}
                        >
                            Add Category
                        </Button>
                    </Box>
                    <Grid container spacing={3}>
                        {categories.map((category) => (
                            <Grid item xs={12} sm={6} md={4} key={category.id}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <CategoryIcon sx={{ mr: 1 }} />
                                                <Typography variant="h6">{category.name}</Typography>
                                            </Box>
                                            <Badge badgeContent={category.productCount} color="primary" />
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            Slug: {category.slug}
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                            <IconButton size="small" color="info" sx={{ mr: 1 }}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" color="error">
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Paper>
            </TabPanel>
            
            {/* Tags Tab */}
            <TabPanel value={tabValue} index={2}>
                <Paper
                    elevation={theme === 'dark' ? 3 : 1}
                    sx={{
                        p: 3,
                        mb: 4,
                        bgcolor: colorValues.bgPaper,
                        borderRadius: 2
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6">Tag Management</Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleTagDialogOpen}
                        >
                            Add Tag
                        </Button>
                    </Box>
                    <Grid container spacing={3}>
                        {tags.map((tag) => (
                            <Grid item xs={12} sm={6} md={4} key={tag.id}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <LabelIcon sx={{ mr: 1 }} />
                                                <Typography variant="h6">{tag.name}</Typography>
                                            </Box>
                                            <Badge badgeContent={tag.productCount} color="primary" />
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            Slug: {tag.slug}
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                            <IconButton size="small" color="info" sx={{ mr: 1 }}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" color="error">
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Paper>
            </TabPanel>
            
            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleCloseDeleteDialog}
            >
                <DialogTitle>
                    Delete Product
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
                    <Button onClick={handleDeleteProduct} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* Bulk Upload Dialog */}
            <Dialog
                open={uploadDialogOpen}
                onClose={handleUploadDialogClose}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Import Products
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 3 }}>
                        Upload a CSV or Excel file with your product data. You can also download a template to see the required format.
                    </DialogContentText>
                    
                    <Box sx={{ textAlign: 'center', py: 4, border: '2px dashed', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
                        <input
                            accept=".csv,.xlsx,.xls"
                            style={{ display: 'none' }}
                            id="raised-button-file"
                            type="file"
                            onChange={handleFileChange} // Added onChange handler
                        />
                        <label htmlFor="raised-button-file">
                            <Button
                                variant="contained"
                                component="span"
                                startIcon={<CloudUploadIcon />}
                            >
                                Choose File
                            </Button>
                        </label>
                        <Typography variant="body2" sx={{ mt: 2 }}>
                            Or drop files here
                        </Typography>
                    </Box>

                    {/* Display selected file name and clear button */}
                    {uploadedFile && (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                            <Typography variant="body1" sx={{ mr: 1 }}>
                                Selected: {uploadedFile.name}
                            </Typography>
                            <Chip
                                label="Clear"
                                onClick={() => {
                                    setUploadedFile(null);
                                    const fileInput = document.getElementById('raised-button-file');
                                    if (fileInput) {
                                        fileInput.value = ''; // Reset the actual file input
                                    }
                                }}
                                size="small"
                            />
                        </Box>
                    )}
                    
                    <Button
                        variant="outlined"
                        startIcon={<CloudDownloadIcon />}
                        sx={{ mb: 2 }}
                        // onClick={handleDownloadTemplate} // Placeholder for download template functionality
                    >
                        Download Template
                    </Button>
                    
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>Import Options</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={<Checkbox name="updateExisting" checked={importOptions.updateExisting} onChange={handleImportOptionChange} />}
                                        label="Update existing products if SKU matches"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={<Checkbox name="skipErrors" checked={importOptions.skipErrors} onChange={handleImportOptionChange} />}
                                        label="Skip rows with errors"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={<Checkbox name="sendNotification" checked={importOptions.sendNotification} onChange={handleImportOptionChange} />}
                                        label="Send email notification when import is complete"
                                    />
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleUploadDialogClose}>Cancel</Button>
                    <Button 
                        onClick={handleUploadProducts} 
                        variant="contained" 
                        color="primary"
                        disabled={!uploadedFile || loading} // Disable if no file or loading
                    >
                        {loading ? <CircularProgress size={24} /> : 'Import'}
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* SEO Dialog */}
            <Dialog
                open={seoDialogOpen}
                onClose={handleCloseSeoDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    SEO Settings: {selectedProductSeo?.name}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="SEO Title"
                                variant="outlined"
                                defaultValue={selectedProductSeo?.seo?.title}
                                helperText="Recommended length: 50-60 characters"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Meta Description"
                                variant="outlined"
                                multiline
                                rows={3}
                                defaultValue={selectedProductSeo?.seo?.description}
                                helperText="Recommended length: 150-160 characters"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Keywords"
                                variant="outlined"
                                defaultValue={selectedProductSeo?.seo?.keywords}
                                helperText="Separate keywords with commas"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{ mb: 2 }}>SEO Preview</Typography>
                            <Paper variant="outlined" sx={{ p: 2 }}>
                                <Typography 
                                    variant="subtitle1" 
                                    color="primary" 
                                    sx={{ mb: 0.5 }}
                                >
                                    {selectedProductSeo?.seo?.title || selectedProductSeo?.name}
                                </Typography>
                                <Typography 
                                    variant="body2" 
                                    color="success.main" 
                                    sx={{ mb: 0.5 }}
                                >
                                    www.yourstore.com/products/{selectedProductSeo?.slug}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {selectedProductSeo?.seo?.description || 'No description available.'}
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseSeoDialog}>Cancel</Button>
                    <Button 
                        onClick={handleSaveSeo} 
                        variant="contained" 
                        color="primary"
                    >
                        Save SEO Settings
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* Category Dialog */}
            <Dialog
                open={categoryDialogOpen}
                onClose={handleCategoryDialogClose}
            >
                <DialogTitle>
                    Add New Category
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Category Name"
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Slug"
                                variant="outlined"
                                helperText="Will be generated automatically if left empty"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Description"
                                variant="outlined"
                                multiline
                                rows={3}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCategoryDialogClose}>Cancel</Button>
                    <Button 
                        onClick={handleCategoryDialogClose} 
                        variant="contained" 
                        color="primary"
                    >
                        Save Category
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* Tag Dialog */}
            <Dialog
                open={tagDialogOpen}
                onClose={handleTagDialogClose}
            >
                <DialogTitle>
                    Add New Tag
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Tag Name"
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Slug"
                                variant="outlined"
                                helperText="Will be generated automatically if left empty"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Description"
                                variant="outlined"
                                multiline
                                rows={3}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleTagDialogClose}>Cancel</Button>
                    <Button 
                        onClick={handleTagDialogClose} 
                        variant="contained" 
                        color="primary"
                    >
                        Save Tag
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* Approval Status Dialog */}
            <Dialog
                open={approvalDialogOpen}
                onClose={handleCloseApprovalDialog}
            >
                <DialogTitle>
                    Update Approval Status
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 3 }}>
                        Current status: <strong>{selectedProductApproval?.approvalStatus}</strong>
                    </DialogContentText>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="success"
                                startIcon={<CheckCircleIcon />}
                                onClick={() => handleUpdateApproval('Approved')}
                                sx={{ mb: 1, justifyContent: 'flex-start', py: 1 }}
                            >
                                Approve
                            </Button>
                            <Typography variant="caption" sx={{ display: 'block', ml: 2, mb: 2 }}>
                                Product will be visible and purchasable on the store.
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="warning"
                                startIcon={<PendingIcon />}
                                onClick={() => handleUpdateApproval('Pending')}
                                sx={{ mb: 1, justifyContent: 'flex-start', py: 1 }}
                            >
                                Set as Pending
                            </Button>
                            <Typography variant="caption" sx={{ display: 'block', ml: 2, mb: 2 }}>
                                Product will not be visible until approved by an administrator.
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="error"
                                startIcon={<CancelIcon />}
                                onClick={() => handleUpdateApproval('Rejected')}
                                sx={{ mb: 1, justifyContent: 'flex-start', py: 1 }}
                            >
                                Reject
                            </Button>
                            <Typography variant="caption" sx={{ display: 'block', ml: 2, mb: 2 }}>
                                Product will be rejected and not visible on the store.
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<AssignmentIcon />}
                                onClick={() => handleUpdateApproval('Draft')}
                                sx={{ justifyContent: 'flex-start', py: 1 }}
                            >
                                Save as Draft
                            </Button>
                            <Typography variant="caption" sx={{ display: 'block', ml: 2 }}>
                                Product will be saved as a draft for later editing.
                            </Typography>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseApprovalDialog}>Cancel</Button>
                </DialogActions>
            </Dialog>

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
                                            {/* Assuming 'categories' is available in this component's scope */}
                                            {/* You might need to fetch or pass categories */}
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
                                    <TextField
                                        fullWidth
                                        label="SKU (Optional)"
                                        name="sku"
                                        value={newProductData.sku}
                                        onChange={handleNewProductChange}
                                        variant="outlined"
                                    />
                                </Grid>
                            </Grid>
                            {/* Using Autocomplete for tags if available, or simple TextField */}
                            <TextField 
                                fullWidth
                                label="Tags (comma-separated)"
                                name="tags"
                                value={newProductData.tags.join(',')} // Display as string
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
}

export default AdminProducts;
