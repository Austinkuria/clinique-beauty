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
    Avatar
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    FilterList as FilterListIcon,
    Clear as ClearIcon
} from '@mui/icons-material';
import { ThemeContext } from '../../../context/ThemeContext';
import { useApi } from '../../../api/apiClient';
import defaultProductImage from '../../../assets/images/placeholder.webp';

// Mock data (replace with actual API calls)
const mockProducts = [
    { 
        id: 1, 
        name: 'Moisturizing Cream', 
        category: 'Skincare',
        price: 29.99,
        stock: 45,
        status: 'Active',
        image: 'https://via.placeholder.com/50'
    },
    { 
        id: 2, 
        name: 'Liquid Foundation', 
        category: 'Makeup',
        price: 39.99,
        stock: 28,
        status: 'Active',
        image: 'https://via.placeholder.com/50'
    },
    { 
        id: 3, 
        name: 'Citrus Perfume', 
        category: 'Fragrance',
        price: 89.99,
        stock: 12,
        status: 'Low Stock',
        image: 'https://via.placeholder.com/50'
    },
    { 
        id: 4, 
        name: 'Hair Repair Mask', 
        category: 'Hair',
        price: 24.99,
        stock: 0,
        status: 'Out of Stock',
        image: 'https://via.placeholder.com/50'
    },
    { 
        id: 5, 
        name: 'Cleansing Gel', 
        category: 'Skincare',
        price: 19.99,
        stock: 57,
        status: 'Active',
        image: 'https://via.placeholder.com/50'
    },
];

function AdminProducts() {
    const { theme, colorValues } = useContext(ThemeContext);
    const api = useApi();
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                // In a real app, you would fetch data from your API
                // const data = await api.getAdminProducts();
                // setProducts(data);
                
                // For now, we'll use mock data with a loading simulation
                setTimeout(() => {
                    setProducts(mockProducts);
                    setLoading(false);
                }, 1000);
            } catch (error) {
                console.error('Error fetching products:', error);
                setLoading(false);
            }
        };
        
        fetchProducts();
    }, [api]);
    
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
    };
    
    const handleClearFilters = () => {
        setSearch('');
        setFilterCategory('');
        setFilterStatus('');
    };
    
    // Filter and search products
    const filteredProducts = products.filter(product => {
        const matchesSearch = search === '' || 
            product.name.toLowerCase().includes(search.toLowerCase()) ||
            product.category.toLowerCase().includes(search.toLowerCase());
            
        const matchesCategory = filterCategory === '' || product.category === filterCategory;
        const matchesStatus = filterStatus === '' || product.status === filterStatus;
        
        return matchesSearch && matchesCategory && matchesStatus;
    });
    
    // Get unique categories and statuses for filters
    const categories = ['', ...new Set(products.map(p => p.category))];
    const statuses = ['', ...new Set(products.map(p => p.status))];
    
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
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    sx={{
                        borderRadius: '8px',
                        textTransform: 'none',
                        px: 3
                    }}
                >
                    Add New Product
                </Button>
            </Box>
            
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
                    <Grid item xs={12} md={4}>
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
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel id="category-filter-label">Category</InputLabel>
                            <Select
                                labelId="category-filter-label"
                                value={filterCategory}
                                onChange={handleCategoryFilterChange}
                                label="Category"
                            >
                                {categories.map((category, index) => (
                                    <MenuItem key={index} value={category}>
                                        {category || 'All Categories'}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel id="status-filter-label">Status</InputLabel>
                            <Select
                                labelId="status-filter-label"
                                value={filterStatus}
                                onChange={handleStatusFilterChange}
                                label="Status"
                            >
                                {statuses.map((status, index) => (
                                    <MenuItem key={index} value={status}>
                                        {status || 'All Statuses'}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Button
                            variant="outlined"
                            startIcon={<ClearIcon />}
                            onClick={handleClearFilters}
                            sx={{ width: '100%' }}
                        >
                            Clear Filters
                        </Button>
                    </Grid>
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
                                <TableCell>Product</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell align="right">Price</TableCell>
                                <TableCell align="right">Stock</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredProducts
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((product) => (
                                    <TableRow key={product.id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Avatar 
                                                    src={product.image} 
                                                    alt={product.name}
                                                    variant="rounded"
                                                    sx={{ width: 40, height: 40, mr: 2 }}
                                                    onError={(e) => { e.target.src = defaultProductImage; }}
                                                />
                                                <Typography variant="body2">{product.name}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{product.category}</TableCell>
                                        <TableCell align="right">${product.price.toFixed(2)}</TableCell>
                                        <TableCell align="right">{product.stock}</TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={product.status} 
                                                size="small"
                                                sx={{
                                                    bgcolor: 
                                                        product.status === 'Active' ? 'success.main' :
                                                        product.status === 'Low Stock' ? 'warning.main' :
                                                        'error.main',
                                                    color: 'white'
                                                }}
                                            />
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
                                ))}
                            {filteredProducts.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
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
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredProducts.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
            
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
        </Box>
    );
}

export default AdminProducts;
