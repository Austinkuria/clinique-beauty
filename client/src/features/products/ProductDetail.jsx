import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    Rating,
    Paper,
    Tabs,
    Tab,
    Divider,
    IconButton,
    TextField // Import TextField
} from "@mui/material";
import { ThemeContext } from "../../context/ThemeContext.jsx";
import { useCart } from "../../context/CartContext";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AddIcon from '@mui/icons-material/Add'; // Keep Add icon
import RemoveIcon from '@mui/icons-material/Remove'; // Keep Remove icon
import mockProducts from "../../data/mockProducts";  // Import centralized products

// Helper component for tab panels
function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`product-tabpanel-${index}`}
            aria-labelledby={`product-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { theme, colorValues } = useContext(ThemeContext);
    const { cartItems, setCartItems } = useCart();
    const [tabValue, setTabValue] = useState(0);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1); // State for quantity
    const [isOutOfStock, setIsOutOfStock] = useState(false); // State for stock status

    useEffect(() => {
        // Find product by ID from the centralized mock data
        const foundProduct = mockProducts.find(p => p.id === parseInt(id));

        // Simulate API call delay
        setTimeout(() => {
            setProduct(foundProduct || null);
            setLoading(false);
            // Check stock status once product loads
            if (foundProduct && foundProduct.stock !== undefined && foundProduct.stock <= 0) {
                setIsOutOfStock(true);
                setQuantity(0); // Set quantity to 0 if out of stock initially
            } else if (foundProduct) {
                setIsOutOfStock(false);
                setQuantity(1); // Reset to 1 if in stock
            }
        }, 500);
    }, [id]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleQuantityChange = (event) => {
        let value = parseInt(event.target.value, 10);

        if (isNaN(value) || value < 1) {
            value = 1; // Default to 1 if input is invalid or less than 1
        }

        // Check against stock if available
        if (product && product.stock !== undefined && value > product.stock) {
            value = product.stock; // Cap at max stock
        }

        // Prevent setting quantity if out of stock
        if (isOutOfStock) {
            value = 0;
        }

        setQuantity(value);
    };

    const handleIncrement = () => {
        setQuantity(prevQuantity => {
            const maxQuantity = (product && product.stock !== undefined) ? product.stock : Infinity;
            return Math.min(prevQuantity + 1, maxQuantity); // Increment but not beyond stock
        });
    };

    const handleDecrement = () => {
        setQuantity(prevQuantity => Math.max(1, prevQuantity - 1)); // Prevent quantity < 1
    };

    const addToCart = () => {
        if (!product) return;

        const existingItemIndex = cartItems.findIndex(item => item.id === product.id);

        if (existingItemIndex >= 0) {
            // Item already exists, update quantity by adding the selected quantity
            const newCartItems = [...cartItems];
            newCartItems[existingItemIndex].quantity = (newCartItems[existingItemIndex].quantity || 0) + quantity; // Add selected quantity
            setCartItems(newCartItems);
        } else {
            // Add new item with the selected quantity
            setCartItems([...cartItems, { ...product, quantity: quantity }]);
        }
        // Reset quantity only if not out of stock
        if (!isOutOfStock) {
            setQuantity(1);
        }
    };

    if (loading) {
        return (
            <Container sx={{ py: 4, minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography>Loading product details...</Typography>
            </Container>
        );
    }

    if (!product) {
        return (
            <Container sx={{ py: 4, minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ mb: 2 }}>Product not found</Typography>
                <Button variant="outlined" onClick={() => navigate('/products')}>
                    Back to Products
                </Button>
            </Container>
        );
    }

    return (
        <Box sx={{
            backgroundColor: colorValues.bgDefault,
            color: colorValues.textPrimary,
            py: 4,
            minHeight: '100vh'
        }}>
            <Container>
                <Grid container spacing={4}>
                    {/* Product Image */}
                    <Grid item xs={12} md={6}>
                        <Paper
                            elevation={theme === 'dark' ? 3 : 1}
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                backgroundColor: colorValues.bgPaper,
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Box
                                component="img"
                                src={product.image}
                                alt={product.name}
                                sx={{
                                    width: '100%',
                                    maxHeight: 400,
                                    objectFit: 'contain',
                                    borderRadius: 1
                                }}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/src/assets/images/products/cleanser.webp";
                                }}
                            />
                        </Paper>
                    </Grid>

                    {/* Product Details */}
                    <Grid item xs={12} md={6}>
                        <Paper
                            elevation={theme === 'dark' ? 3 : 1}
                            sx={{
                                p: 3,
                                borderRadius: 2,
                                backgroundColor: colorValues.bgPaper,
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
                                {product.name}
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Rating value={product.rating} precision={0.1} readOnly />
                                <Typography variant="body2" sx={{ ml: 1, color: colorValues.textSecondary }}>
                                    ({product.rating} stars)
                                </Typography>
                            </Box>

                            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: colorValues.primary }}>
                                ${product.price.toFixed(2)}
                            </Typography>

                            <Typography variant="body1" sx={{ mb: 3 }}>
                                {product.description}
                            </Typography>

                            <Typography variant="body2" sx={{ mb: 1, color: colorValues.textSecondary }}>
                                Category: {product.category}
                            </Typography>

                            {/* Stock Status */}
                            {product && product.stock !== undefined && (
                                <Typography
                                    variant="body2"
                                    sx={{
                                        mb: 2,
                                        color: isOutOfStock ? colorValues.error : colorValues.success,
                                        fontWeight: 500
                                    }}
                                >
                                    {isOutOfStock ? 'Out of Stock' : `In Stock (${product.stock} available)`}
                                </Typography>
                            )}

                            {/* Quantity Selector - Conditionally render if not out of stock */}
                            {!isOutOfStock && product && (
                                <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
                                    <Typography variant="body1" sx={{ mr: 2 }}>Quantity:</Typography>
                                    <IconButton
                                        onClick={handleDecrement}
                                        disabled={quantity <= 1}
                                        size="small"
                                        aria-label="Decrease quantity"
                                        sx={{ border: `1px solid ${colorValues.textSecondary}`, borderRadius: 1, mr: 1 }}
                                    >
                                        <RemoveIcon fontSize="small" />
                                    </IconButton>
                                    <TextField
                                        value={quantity}
                                        onChange={handleQuantityChange}
                                        type="number"
                                        size="small"
                                        aria-label="Product quantity"
                                        inputProps={{
                                            min: 1,
                                            max: product.stock, // Set max based on stock
                                            style: { textAlign: 'center', width: '40px', MozAppearance: 'textfield' }, // Basic styling
                                        }}
                                        sx={{
                                            mx: 0.5,
                                            '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                                WebkitAppearance: 'none', // Hide spinners in Chrome/Safari
                                                margin: 0,
                                            },
                                        }}
                                    />
                                    <IconButton
                                        onClick={handleIncrement}
                                        size="small"
                                        aria-label="Increase quantity"
                                        sx={{ border: `1px solid ${colorValues.textSecondary}`, borderRadius: 1, ml: 1 }}
                                        // Disable if quantity reaches stock limit
                                        disabled={product.stock !== undefined && quantity >= product.stock}
                                    >
                                        <AddIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            )}

                            <Box sx={{ mt: 'auto', pt: 2 }}> {/* Adjusted padding top */}
                                <Button
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    startIcon={<ShoppingCartIcon />}
                                    onClick={addToCart}
                                    disabled={isOutOfStock || quantity < 1} // Disable if out of stock or quantity is invalid
                                    sx={{
                                        backgroundColor: colorValues.primary,
                                        color: '#ffffff',
                                        py: 1.5,
                                        fontSize: '1.1rem',
                                        borderRadius: '50px',
                                        '&:hover': {
                                            backgroundColor: colorValues.primaryDark,
                                        },
                                        opacity: (isOutOfStock || quantity < 1) ? 0.6 : 1, // Indicate disabled state visually
                                    }}
                                >
                                    {isOutOfStock ? 'Out of Stock' : `Add ${quantity} to Cart`} {/* Update button text */}
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Product Tabs */}
                <Paper
                    elevation={theme === 'dark' ? 3 : 1}
                    sx={{
                        mt: 4,
                        borderRadius: 2,
                        backgroundColor: colorValues.bgPaper
                    }}
                >
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        variant="fullWidth"
                        sx={{
                            borderBottom: 1,
                            borderColor: 'divider',
                            '& .MuiTab-root': {
                                fontWeight: 500,
                                py: 2
                            },
                            '& .Mui-selected': {
                                color: colorValues.primary + ' !important'
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: colorValues.primary
                            }
                        }}
                    >
                        <Tab label="Details" id="product-tab-0" aria-controls="product-tabpanel-0" />
                        <Tab label="Benefits" id="product-tab-1" aria-controls="product-tabpanel-1" />
                        <Tab label="Ingredients" id="product-tab-2" aria-controls="product-tabpanel-2" />
                    </Tabs>

                    <TabPanel value={tabValue} index={0}>
                        <Typography variant="body1">
                            {product.description}
                        </Typography>
                    </TabPanel>

                    <TabPanel value={tabValue} index={1}>
                        <Box component="ul" sx={{ pl: 2 }}>
                            {product.benefits?.map((benefit, index) => (
                                <Typography component="li" key={index} sx={{ mb: 1 }}>
                                    {benefit}
                                </Typography>
                            )) || <Typography>No benefits information available.</Typography>}
                        </Box>
                    </TabPanel>

                    <TabPanel value={tabValue} index={2}>
                        <Box component="ul" sx={{ pl: 2 }}>
                            {product.ingredients?.map((ingredient, index) => (
                                <Typography component="li" key={index} sx={{ mb: 1 }}>
                                    {ingredient}
                                </Typography>
                            )) || <Typography>No ingredient information available.</Typography>}
                        </Box>
                    </TabPanel>
                </Paper>
            </Container>
        </Box>
    );
}

export default ProductDetail;