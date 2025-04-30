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
import defaultProductImage from '../../assets/images/placeholder.webp'; // Fallback image
import LocalMallIcon from '@mui/icons-material/LocalMall'; // Import Buy Now icon
// Import react-share components and icons
import {
    FacebookShareButton,
    TwitterShareButton,
    PinterestShareButton,
    WhatsappShareButton,
    EmailShareButton, // Add EmailShareButton back
} from "react-share";
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import PinterestIcon from '@mui/icons-material/Pinterest';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email'; // Add Email icon back
import ContentCopyIcon from '@mui/icons-material/ContentCopy'; // Add Copy icon back
import { motion, AnimatePresence } from 'framer-motion'; // Add Framer Motion import

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

// --- Helper moved outside component ---
// Safely parse JSON fields, ensuring an array or null is returned
const parseJsonField = (field) => {
    if (!field) return null;
    try {
        if (Array.isArray(field)) return field;
        if (typeof field === 'object' && field !== null) {
             console.warn("[parseJsonField] Expected JSON array string or array, but received object:", field);
             return null;
        }
        if (typeof field === 'string') {
            const parsed = JSON.parse(field);
            return Array.isArray(parsed) ? parsed : null;
        }
        console.warn("[parseJsonField] Field is not a parsable string, array, or expected object:", field);
        return null;
    } catch (e) {
        console.error("[parseJsonField] Error parsing JSON field:", field, e);
        return null;
    }
};
// --- End Helper ---

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
    const { isSignedIn } = useUser(); // Get Clerk user status
    const { isInWishlist, toggleWishlist, loading: wishlistLoading } = useWishlist(); // Use Wishlist context
    const [imageError, setImageError] = useState(false);
    const [currentUrl, setCurrentUrl] = useState(''); // State for current URL

    // Animation variants
    const fadeIn = {
        hidden: { opacity: 0, scale: 0.98 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
    };
    
    const buttonHover = {
        rest: { scale: 1 },
        hover: { scale: 1.05, transition: { duration: 0.2 } },
        tap: { scale: 0.95 }
    };
    
    const shareIconHover = {
        rest: { scale: 1 },
        hover: { scale: 1.15, transition: { duration: 0.2 } },
        tap: { scale: 0.9 }
    };
    
    const tabContentVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
        exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
    };

    useEffect(() => {
        // Set the current URL when the component mounts or id changes
        setCurrentUrl(window.location.href);

        const fetchProductData = async () => {
            // Add ID to logs for clarity
            console.log(`[Effect ${id}] START`);
            setLoading(true);
            setError(null);
            setProduct(null);
            setRelatedProducts([]);
            setImageError(false);
            setSelectedShade(null);
            // Reset stock status
            setIsOutOfStock(false);

            try {
                console.log(`[Effect ${id}] TRY block entered`);
                const fetchedProduct = await api.getProductById(id);
                console.log(`[Effect ${id}] Fetched product:`, fetchedProduct ? 'Yes' : 'No');

                if (!fetchedProduct) {
                    throw new Error('Product not found');
                }
                // Set product state *before* parsing its fields
                setProduct(fetchedProduct);
                console.log(`[Effect ${id}] setProduct called`);

                // --- Add stock check ---
                if (fetchedProduct.stock !== undefined && fetchedProduct.stock <= 0) {
                    setIsOutOfStock(true);
                    console.log(`[Effect ${id}] setIsOutOfStock called (true)`);
                } else {
                    setIsOutOfStock(false); // Ensure it's false if stock > 0 or undefined
                    console.log(`[Effect ${id}] setIsOutOfStock called (false)`);
                }
                // --- End stock check ---

                // Pre-select first shade using the moved helper
                const parsedShades = parseJsonField(fetchedProduct.shades);
                if (Array.isArray(parsedShades) && parsedShades.length > 0) {
                    setSelectedShade(parsedShades[0]);
                    console.log(`[Effect ${id}] setSelectedShade called with:`, parsedShades[0]);
                } else {
                    console.log(`[Effect ${id}] No shades to pre-select or parse error`);
                }

                // Fetch related products
                if (fetchedProduct?.category) {
                    console.log(`[Effect ${id}] Fetching related products...`);
                    const allProducts = await api.getProducts(fetchedProduct.category);
                    const related = allProducts.filter(p => p.id !== fetchedProduct.id).slice(0, 4);
                    setRelatedProducts(related);
                    console.log(`[Effect ${id}] setRelatedProducts called`);
                } else {
                    console.log(`[Effect ${id}] No category for related products`);
                }
                console.log(`[Effect ${id}] TRY block finished successfully`);

            } catch (err) {
                console.error(`[Effect ${id}] CATCH block error:`, err); // Log any caught errors
                setError(err.message || 'Failed to load product details.');
            } finally {
                // This log is crucial - does it appear?
                console.log(`[Effect ${id}] FINALLY block entered, setting loading false`);
                setLoading(false);
            }
        };

        fetchProductData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]); // Remove `api` from the dependency array

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

    // Handle Buy Now action
    const handleBuyNow = () => {
        if (!product || quantity < 1 || isOutOfStock) return;

        // Create product object to pass to context, including selected shade
        const productToAdd = {
            ...product,
            ...(selectedShade && { selectedShade: selectedShade }) // Add shade info if selected
        };

        // Add the item to the cart
        cartContext.addToCart(productToAdd, quantity);

        // Immediately navigate to checkout
        // Ensure the cart update is processed before navigating if needed,
        // but often immediate navigation is fine as context updates happen quickly.
        navigate('/checkout');
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

    // Handler for copying the link
    const handleCopyLink = () => {
        navigator.clipboard.writeText(currentUrl)
            .then(() => {
                toast.success('Link copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy link: ', err);
                toast.error('Failed to copy link.');
            });
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

    // Use the refined parseJsonField
    const benefits = parseJsonField(product.benefits);
    const ingredients = parseJsonField(product.ingredients);
    const shades = parseJsonField(product.shades); // Parsed shades (should be array or null)

    // Determine if a shade selection is required and not yet made
    const shadeSelectionRequired = Array.isArray(shades) && shades.length > 0 && !selectedShade;

    const shareTitle = product ? `${product.name} - Clinique Beauty` : 'Check out this product!';
    const shareImage = product?.image || defaultProductImage; // Use product image or fallback

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
                        {/* Link to the main category page */}
                        {product?.category && (
                            <Link component={RouterLink} underline="hover" color="inherit" to={`/products/${product.category.toLowerCase()}`}>
                                {product.category}
                            </Link>
                        )}
                        {/* Link to subcategory */}
                        {product.subcategory && (
                            <Link component={RouterLink} underline="hover" color="inherit" to={`/products/${product.category.toLowerCase()}?subcategory=${encodeURIComponent(product.subcategory)}`}>
                                {product.subcategory}
                            </Link>
                        )}
                        <Typography color={colorValues.textPrimary}>{product?.name || 'Product'}</Typography>
                    </Breadcrumbs>
                </Box>

                <Grid container spacing={4}>
                    {/* Product Image with Fade-in Animation */}
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
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                variants={fadeIn}
                            >
                                <Box
                                    component="img"
                                    src={imageError ? defaultProductImage : product.image}
                                    alt={product.name}
                                    sx={{
                                        width: '100%',
                                        maxHeight: 400,
                                        objectFit: 'contain',
                                        borderRadius: 1
                                    }}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        // Correct path: Assume 'placeholder.webp' is in the public folder
                                        setImageError(true);
                                    }}
                                />
                            </motion.div>
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
                                    <motion.span
                                        initial="rest"
                                        whileHover="hover"
                                        whileTap="tap" 
                                        variants={shareIconHover}
                                    >
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
                                    </motion.span>
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
                                Category: {product.category} {product.subcategory ? `> ${product.subcategory}` : ''}
                            </Typography>

                            {/* Shade Selector */}
                            {/* Add logging right before the conditional check */}
                            {console.log("[Render Check] Checking parsed shades:", shades)}
                            {/* --- CHANGE THIS CONDITION --- */}
                            {Array.isArray(shades) && shades.length > 0 ? (
                            // --- END CHANGE ---
                                <Box sx={{ my: 3 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                                        Shade: {selectedShade ? selectedShade.name : 'Select a shade'}
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {/* Use the parsed 'shades' variable here */}
                                        {shades.map((shade) => (
                                            <Tooltip title={shade.name} key={shade.name} arrow>
                                                <motion.div
                                                    whileHover={{ 
                                                        scale: 1.1,
                                                        boxShadow: '0px 3px 8px rgba(0,0,0,0.25)' 
                                                    }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
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
                                                </motion.div>
                                            </Tooltip>
                                        ))}
                                    </Box>
                                </Box>
                            ) : (
                                // Optional: Log when the condition is false
                                console.log("[Render Check] Condition for shades (Array.isArray) is FALSE.")
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

                            <Box sx={{ mt: 'auto', pt: 2, display: 'flex', gap: 2 }}> {/* Use flexbox and gap */}
                                {/* Add to Cart Button */}
                                <motion.div
                                    initial="rest"
                                    whileHover={!(isOutOfStock || quantity < 1 || shadeSelectionRequired || cartContext.loading) ? "hover" : "rest"}
                                    whileTap={!(isOutOfStock || quantity < 1 || shadeSelectionRequired || cartContext.loading) ? "tap" : "rest"}
                                    variants={buttonHover}
                                    style={{ flex: 1 }}
                                >
                                    <Button
                                        variant="contained"
                                        size="large"
                                        fullWidth // Keep fullWidth or adjust based on desired layout
                                        startIcon={<ShoppingCartIcon />}
                                        onClick={handleAddToCart}
                                        // Updated disabled logic
                                        disabled={isOutOfStock || quantity < 1 || shadeSelectionRequired || cartContext.loading}
                                        sx={{
                                            backgroundColor: colorValues.primary,
                                            color: '#ffffff',
                                            py: 1.5,
                                            // fontSize: '1.1rem', // Consider slightly smaller font if needed
                                            borderRadius: '50px',
                                            '&:hover': {
                                                backgroundColor: colorValues.primaryDark,
                                            },
                                            opacity: (isOutOfStock || quantity < 1 || shadeSelectionRequired || cartContext.loading) ? 0.6 : 1,
                                            flex: 1, // Allow button to grow
                                        }}
                                    >
                                        {/* Updated text logic */}
                                        {cartContext.loading ? 'Adding...' :
                                            isOutOfStock ? 'Out of Stock' :
                                                shadeSelectionRequired ? 'Select Shade' : // Check parsed shades requirement
                                                    `Add ${quantity} to Cart`}
                                    </Button>
                                </motion.div>

                                {/* Buy Now Button */}
                                <motion.div
                                    initial="rest"
                                    whileHover={!(isOutOfStock || quantity < 1 || shadeSelectionRequired || cartContext.loading) ? "hover" : "rest"}
                                    whileTap={!(isOutOfStock || quantity < 1 || shadeSelectionRequired || cartContext.loading) ? "tap" : "rest"}
                                    variants={buttonHover}
                                    style={{ flex: 1 }}
                                >
                                    <Button
                                        variant="outlined" // Use outlined or another style to differentiate
                                        size="large"
                                        fullWidth // Keep fullWidth or adjust
                                        startIcon={<LocalMallIcon />} // Use a different icon
                                        onClick={handleBuyNow}
                                        // Updated disabled logic
                                        disabled={isOutOfStock || quantity < 1 || shadeSelectionRequired || cartContext.loading} // Same disable conditions
                                        sx={{
                                            borderColor: colorValues.primary, // Match primary color
                                            color: colorValues.primary,
                                            py: 1.5,
                                            // fontSize: '1.1rem',
                                            borderRadius: '50px',
                                            '&:hover': {
                                                backgroundColor: colorValues.buttonHover, // Use theme hover color
                                                borderColor: colorValues.primaryDark,
                                            },
                                            opacity: (isOutOfStock || quantity < 1 || shadeSelectionRequired || cartContext.loading) ? 0.6 : 1,
                                            flex: 1, // Allow button to grow
                                        }}
                                    >
                                        {/* Updated text logic */}
                                        {isOutOfStock ? 'Out of Stock' :
                                            shadeSelectionRequired ? 'Select Shade' : // Check parsed shades requirement
                                                'Buy Now'}
                                    </Button>
                                </motion.div>
                            </Box>

                            {/* Share Buttons Section */}
                            {/* Ensure borderTop uses colorValues.divider */}
                            <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${colorValues.divider}`, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                <Typography variant="body2" sx={{ color: colorValues.textSecondary, mr: 1, width: '100%', mb: 1 }}>Share:</Typography>
                                <Tooltip title="Share on Facebook">
                                    <motion.div initial="rest" whileHover="hover" whileTap="tap" variants={shareIconHover}>
                                        <FacebookShareButton url={currentUrl} quote={shareTitle}>
                                            <IconButton size="small" aria-label="Share on Facebook" sx={{ color: '#1877F2' }}>
                                                <FacebookIcon />
                                            </IconButton>
                                        </FacebookShareButton>
                                    </motion.div>
                                </Tooltip>
                                <Tooltip title="Share on Twitter">
                                    <motion.div initial="rest" whileHover="hover" whileTap="tap" variants={shareIconHover}>
                                        <TwitterShareButton url={currentUrl} title={shareTitle}>
                                            <IconButton size="small" aria-label="Share on Twitter" sx={{ color: '#1DA1F2' }}>
                                                <TwitterIcon />
                                            </IconButton>
                                        </TwitterShareButton>
                                    </motion.div>
                                </Tooltip>
                                <Tooltip title="Share on Pinterest">
                                    <motion.div initial="rest" whileHover="hover" whileTap="tap" variants={shareIconHover}>
                                        {/* Pinterest requires media URL */}
                                        <PinterestShareButton url={currentUrl} media={shareImage} description={shareTitle}>
                                            <IconButton size="small" aria-label="Share on Pinterest" sx={{ color: '#E60023' }}>
                                                <PinterestIcon />
                                            </IconButton>
                                        </PinterestShareButton>
                                    </motion.div>
                                </Tooltip>
                                <Tooltip title="Share on WhatsApp">
                                    <motion.div initial="rest" whileHover="hover" whileTap="tap" variants={shareIconHover}>
                                        <WhatsappShareButton url={currentUrl} title={shareTitle} separator=":: ">
                                            <IconButton size="small" aria-label="Share on WhatsApp" sx={{ color: '#25D366' }}>
                                                <WhatsAppIcon />
                                            </IconButton>
                                        </WhatsappShareButton>
                                    </motion.div>
                                </Tooltip>
                                {/* Add Email Button Back */}
                                <Tooltip title="Share via Email">
                                    <motion.div initial="rest" whileHover="hover" whileTap="tap" variants={shareIconHover}>
                                        <EmailShareButton url={currentUrl} subject={shareTitle} body={`Check out this product: ${currentUrl}`}>
                                            <IconButton size="small" aria-label="Share via Email" sx={{ color: colorValues.primary }}>
                                                <EmailIcon />
                                            </IconButton>
                                        </EmailShareButton>
                                    </motion.div>
                                </Tooltip>
                                {/* Add Copy Link Button Back */}
                                <Tooltip title="Copy Link">
                                    <motion.div initial="rest" whileHover="hover" whileTap="tap" variants={shareIconHover}>
                                        <IconButton size="small" onClick={handleCopyLink} aria-label="Copy product link" sx={{ color: colorValues.textSecondary }}>
                                            <ContentCopyIcon />
                                        </IconButton>
                                    </motion.div>
                                </Tooltip>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Product Tabs with Animated Content Transitions */}
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

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={tabValue}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={tabContentVariants}
                        >
                            <TabPanel value={tabValue} index={0}>
                                <Typography variant="body1">
                                    {product.description}
                                </Typography>
                            </TabPanel>

                            <TabPanel value={tabValue} index={1}>
                                <Box component="ul" sx={{ pl: 2 }}>
                                    {Array.isArray(benefits) && benefits.length > 0 ? (
                                        benefits.map((benefit, index) => (
                                            <Typography component="li" key={index} sx={{ mb: 1 }}>
                                                {benefit}
                                            </Typography>
                                        ))
                                    ) : (
                                        <Typography>No benefits information available.</Typography>
                                    )}
                                </Box>
                            </TabPanel>

                            <TabPanel value={tabValue} index={2}>
                                <Box component="ul" sx={{ pl: 2 }}>
                                    {Array.isArray(ingredients) && ingredients.length > 0 ? (
                                        ingredients.map((ingredient, index) => (
                                            <Typography component="li" key={index} sx={{ mb: 1 }}>
                                                {ingredient}
                                            </Typography>
                                        ))
                                    ) : (
                                        <Typography>No ingredient information available.</Typography>
                                    )}
                                </Box>
                            </TabPanel>

                            {/* Reviews Tab Panel */}
                            <TabPanel value={tabValue} index={3}>
                                <ReviewSection productId={product?.id} />
                            </TabPanel>
                        </motion.div>
                    </AnimatePresence>
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
                                    <motion.div
                                        whileHover={{ 
                                            y: -10,
                                            boxShadow: theme === 'dark' ? '0 12px 20px rgba(0,0,0,0.4)' : '0 10px 15px rgba(0,0,0,0.15)'
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Paper
                                            elevation={theme === 'dark' ? 3 : 1}
                                            sx={{
                                                backgroundColor: colorValues.bgPaper,
                                                borderRadius: 2,
                                                height: '100%',
                                                // Remove hover effects from here since they're handled by motion
                                            }}
                                        >
                                            {/* Use ProductCard for consistency */}
                                            <ProductCard product={relatedProduct} />
                                        </Paper>
                                    </motion.div>
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