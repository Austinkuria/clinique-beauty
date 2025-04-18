import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom"; // Import RouterLink
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
    TextField,
    Breadcrumbs, // Import Breadcrumbs
    Link, // Import Link for Breadcrumbs
    Tooltip // Import Tooltip
} from "@mui/material";
import toast from 'react-hot-toast'; // Import toast
import { ThemeContext } from "../../context/ThemeContext.jsx";
import { useCart } from "../../context/CartContext";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Import Back icon
import { useApi } from "../../api/apiClient"; // Import useApi
import ReviewSection from "./components/ReviewSection"; // Import ReviewSection
import ProductCard from "./components/ProductCard"; // Import ProductCard
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'; // Wishlist outlined icon
import FavoriteIcon from '@mui/icons-material/Favorite'; // Wishlist filled icon
import { useUser } from "@clerk/clerk-react"; // Keep useUser
import { useWishlist } from "../../context/WishlistContext"; // Import Wishlist context hook

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
    const cartContext = useCart(); // Get cart context methods
    const api = useApi(); // Get API methods
    const [tabValue, setTabValue] = useState(0);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // Add error state
    const [quantity, setQuantity] = useState(1); // State for quantity
    const [isOutOfStock, setIsOutOfStock] = useState(false); // State for stock status
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [selectedShade, setSelectedShade] = useState(null); // State for selected shade
    const { user, isSignedIn } = useUser(); // Get Clerk user status
    const { isInWishlist, toggleWishlist, loading: wishlistLoading } = useWishlist(); // Use Wishlist context

    useEffect(() => {
        const fetchProductData = async () => {
            setLoading(true);
            setError(null); // Reset error on new fetch
            try {
                const fetchedProduct = await api.getProductById(id);
                console.log("[Effect] Fetched Product:", fetchedProduct);
                setProduct(fetchedProduct);

                // Check stock status
                if (fetchedProduct && fetchedProduct.stock !== undefined && fetchedProduct.stock <= 0) {
                    setIsOutOfStock(true);
                    setQuantity(0);
                } else if (fetchedProduct) {
                    setIsOutOfStock(false);
                    setQuantity(1);
                }

                // Initialize selected shade
                if (fetchedProduct?.shades?.length > 0) {
                    setSelectedShade(fetchedProduct.shades[0]);
                } else {
                    setSelectedShade(null);
                }

                // Fetch related products (using API)
                if (fetchedProduct?.category) {
                    const allProducts = await api.getProducts(fetchedProduct.category); // Fetch by category
                    const related = allProducts
                        .filter(p => p.id !== fetchedProduct.id) // Exclude current product
                        .slice(0, 4);
                    console.log("Related Products Found (API):", related);
                    setRelatedProducts(related);
                } else {
                    setRelatedProducts([]);
                }

            } catch (err) {
                console.error("Error fetching product:", err);
                setError(err.message || 'Failed to load product'); // Set error state
                setProduct(null); // Ensure product is null on error
            } finally {
                setLoading(false);
            }
        };

        fetchProductData();
    }, [id, api]); // Add api as dependency

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

    const handleShadeSelect = (shade) => {
        setSelectedShade(shade);
    };

    // Use CartContext's addToCart function
    const handleAddToCart = () => {
        if (!product || quantity < 1 || isOutOfStock) return;

        // Create product object to pass to context, including selected shade
        const productToAdd = {
            ...product,
            ...(selectedShade && { selectedShade: selectedShade }) // Add shade info if selected
        };

        // Call the context function
        cartContext.addToCart(productToAdd, quantity);

        // Reset quantity input after adding
        if (!isOutOfStock) {
            setQuantity(1);
        }
    };

    const handleWishlistClick = () => {
        if (!product) return; // Don't do anything if product isn't loaded

        if (!isSignedIn) {
            // Optionally prompt anonymous users to sign in, or let context handle local storage
            toast("Sign in to sync your wishlist across devices!"); // Example prompt
            // Allow context to handle local storage update anyway
            toggleWishlist(product.id);
        } else {
            // Signed-in user: context handles Clerk metadata update
            toggleWishlist(product.id);
        }
    };

    if (loading) {
        return (
            <Container sx={{ py: 4, minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography>Loading product details...</Typography>
            </Container>
        );
    }

    // Display error message if fetching failed
    if (error) {
        return (
            <Container sx={{ py: 4, minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="h5" color="error" sx={{ mb: 2 }}>Error loading product</Typography>
                <Typography sx={{ mb: 2 }}>{error}</Typography>
                <Button variant="outlined" onClick={() => navigate('/products')}>
                    Back to Products
                </Button>
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

    // Add logging right before the return statement for the main component render
    console.log("[Render] Product State:", product);
    console.log("[Render] Product Shades:", product?.shades);
    console.log("[Render] Selected Shade State:", selectedShade);
    console.log("[Render] Is In Wishlist (from context):", isInWishlist(product.id));

    // Determine wishlist status using context function
    const isProductInWishlist = product ? isInWishlist(product.id) : false;

    // --- Add Debugging Logs ---
    console.log("[Render] Product Loaded:", !!product);
    console.log("[Render] Is Signed In:", isSignedIn);
    console.log("[Render] Is Product In Wishlist (from context):", isProductInWishlist);
    console.log("[Render] Wishlist Loading State:", wishlistLoading);
    // --- End Debugging Logs ---

    return (
        <Box sx={{
            backgroundColor: colorValues.bgDefault,
            color: colorValues.textPrimary,
            py: 4,
            minHeight: '100vh'
        }}>
            <Container>
                {/* Back Button and Breadcrumbs */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <IconButton
                        onClick={() => navigate(-1)} // Go back to previous page
                        aria-label="Go back"
                        sx={{ mr: 1, color: colorValues.textSecondary }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Breadcrumbs aria-label="breadcrumb" sx={{ color: colorValues.textSecondary }}>
                        <Link component={RouterLink} underline="hover" color="inherit" to="/">
                            Home
                        </Link>
                        <Link component={RouterLink} underline="hover" color="inherit" to="/products">
                            Products
                        </Link>
                        {/* Display category if available */}
                        {product?.category && (
                            <Link component={RouterLink} underline="hover" color="inherit" to={`/products?category=${product.category}`}>
                                {product.category}
                            </Link>
                        )}
                        <Typography color={colorValues.textPrimary}>{product?.name || 'Product'}</Typography>
                    </Breadcrumbs>
                </Box>

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
                            {/* Product Title and Wishlist Button */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Typography variant="h4" component="h1" sx={{ fontWeight: 600, flexGrow: 1, pr: 1 }}>
                                    {product.name}
                                </Typography>
                                <Tooltip title={isProductInWishlist ? "Remove from Wishlist" : "Add to Wishlist"} arrow>
                                    <span> {/* Span needed for tooltip when button is disabled */}
                                        <IconButton
                                            onClick={handleWishlistClick} // Use the handler
                                            disabled={wishlistLoading || !product} // Disable while loading or if product not loaded
                                            aria-label={isProductInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                                            sx={{
                                                // Use theme colors
                                                color: isProductInWishlist ? (theme === 'light' ? '#d32f2f' : '#ef5350') : colorValues.textSecondary, // Use error color when in wishlist, secondary otherwise
                                                transition: 'color 0.2s, transform 0.1s',
                                                '&:hover': {
                                                    color: isProductInWishlist ? (theme === 'light' ? '#c62828' : '#e57373') : colorValues.primary, // Darker error on hover, primary on hover otherwise
                                                    transform: 'scale(1.1)',
                                                },
                                                '&:disabled': {
                                                    color: colorValues.textSecondary, // Ensure disabled state has a neutral color
                                                    opacity: 0.5,
                                                }
                                            }}
                                        >
                                            {/* Use context state to determine icon */}
                                            {isProductInWishlist ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </Box>

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

                            {/* Shade Selector */}
                            {/* Add logging right before the conditional check */}
                            {console.log("[Render Check] Checking for shades:", product?.shades)}
                            {product.shades && product.shades.length > 0 ? (
                                <Box sx={{ my: 3 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                                        Shade: {selectedShade ? selectedShade.name : 'Select a shade'}
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {product.shades.map((shade) => (
                                            <Tooltip title={shade.name} key={shade.name} arrow>
                                                <Box
                                                    onClick={() => handleShadeSelect(shade)}
                                                    sx={{
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: '50%',
                                                        backgroundColor: shade.color,
                                                        cursor: 'pointer',
                                                        border: selectedShade?.name === shade.name
                                                            ? `3px solid ${colorValues.primary}` // Highlight selected
                                                            : `1px solid ${colorValues.textSecondary}`,
                                                        outline: selectedShade?.name === shade.name
                                                            ? `1px solid ${colorValues.bgPaper}` // Inner outline for contrast
                                                            : 'none',
                                                        outlineOffset: '-3px',
                                                        transition: 'border 0.2s ease-in-out',
                                                        '&:hover': {
                                                            transform: 'scale(1.1)',
                                                            boxShadow: '0px 2px 5px rgba(0,0,0,0.2)'
                                                        }
                                                    }}
                                                    aria-label={`Select shade ${shade.name}`}
                                                    role="button"
                                                />
                                            </Tooltip>
                                        ))}
                                    </Box>
                                </Box>
                            ) : (
                                // Optional: Log when the condition is false
                                console.log("[Render Check] Condition for shades is FALSE.")
                            )}

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
                                    onClick={handleAddToCart} // Use the updated handler
                                    disabled={isOutOfStock || quantity < 1 || (product.shades?.length > 0 && !selectedShade) || cartContext.loading} // Also disable if cart context is loading
                                    sx={{
                                        backgroundColor: colorValues.primary,
                                        color: '#ffffff',
                                        py: 1.5,
                                        fontSize: '1.1rem',
                                        borderRadius: '50px',
                                        '&:hover': {
                                            backgroundColor: colorValues.primaryDark,
                                        },
                                        opacity: (isOutOfStock || quantity < 1 || (product.shades?.length > 0 && !selectedShade) || cartContext.loading) ? 0.6 : 1, // Indicate disabled state visually
                                    }}
                                >
                                    {/* Adjust button text based on state */}
                                    {cartContext.loading ? 'Adding...' : // Show loading state from context
                                        isOutOfStock ? 'Out of Stock' :
                                            (product.shades?.length > 0 && !selectedShade) ? 'Select a Shade' :
                                                `Add ${quantity} to Cart`}
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
                        <Tab label="Reviews" id="product-tab-3" aria-controls="product-tabpanel-3" /> {/* Add Reviews Tab */}
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

                    {/* Reviews Tab Panel */}
                    <TabPanel value={tabValue} index={3}>
                        <ReviewSection productId={product?.id} />
                    </TabPanel>
                </Paper>

                {/* Related Products Section */}
                {relatedProducts.length > 0 ? (
                    <Box sx={{ mt: 6 }}>
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: colorValues.textPrimary }}>
                            Related Products
                        </Typography>
                        <Grid container spacing={3}>
                            {relatedProducts.map((relatedProduct) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={relatedProduct.id}>
                                    <Paper
                                        elevation={theme === 'dark' ? 3 : 1}
                                        sx={{
                                            backgroundColor: colorValues.bgPaper,
                                            borderRadius: 2,
                                            height: '100%',
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: theme === 'dark' ? 8 : 4
                                            }
                                        }}
                                    >
                                        {/* Use ProductCard for consistency */}
                                        <ProductCard product={relatedProduct} />
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                ) : (
                    // Optional: Show a message if no related products were found after loading
                    !loading && product && (
                        <Typography sx={{ mt: 4, color: colorValues.textSecondary, textAlign: 'center' }}>
                            No other products found in this category.
                        </Typography>
                    )
                )}
            </Container>
        </Box>
    );
}

export default ProductDetail;