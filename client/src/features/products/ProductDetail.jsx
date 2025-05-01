import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
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
    Breadcrumbs,
    Link,
    Tooltip
} from "@mui/material";
import toast from 'react-hot-toast';
import { ThemeContext } from "../../context/ThemeContext.jsx";
import { useCart } from "../../context/CartContext";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useApi } from "../../api/apiClient";
import ReviewSection from "./components/ReviewSection";
import ProductCard from "./components/ProductCard";
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useUser } from "@clerk/clerk-react";
import { useWishlist } from "../../context/WishlistContext";
import defaultProductImage from '../../assets/images/placeholder.webp';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import {
    FacebookShareButton,
    TwitterShareButton,
    PinterestShareButton,
    WhatsappShareButton,
    EmailShareButton,
} from "react-share";
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import PinterestIcon from '@mui/icons-material/Pinterest';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { motion, AnimatePresence } from 'framer-motion';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';

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

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { theme, colorValues } = useContext(ThemeContext);
    const cartContext = useCart();
    const api = useApi();
    const [tabValue, setTabValue] = useState(0);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isOutOfStock, setIsOutOfStock] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [selectedShade, setSelectedShade] = useState(null);
    const { isSignedIn } = useUser();
    const { isInWishlist, toggleWishlist, loading: wishlistLoading } = useWishlist();
    const [imageError, setImageError] = useState(false);
    const [currentUrl, setCurrentUrl] = useState('');
    const imageContainerRef = useRef(null);
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0, clientX: 0, clientY: 0 });
    const [showMagnifier, setShowMagnifier] = useState(false);
    const mainImgRef = useRef(null); // Ref for main image
    const magnifierSize = 100; // Size for magnifier
    const zoomLevel = 2.5; // Magnification level
    const [selectedImage, setSelectedImage] = useState(null); // Track current main image
    
    // Change static array to state
    const [productImages, setProductImages] = useState([]);

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

    const thumbnailHover = {
        rest: { scale: 1, opacity: 0.8 },
        hover: { scale: 1.1, opacity: 1, transition: { duration: 0.2 } },
        tap: { scale: 0.95 }
    };

    useEffect(() => {
        setCurrentUrl(window.location.href);

        const fetchProductData = async () => {
            console.log(`[Effect ${id}] START`);
            setLoading(true);
            setError(null);
            setProduct(null);
            setRelatedProducts([]);
            setImageError(false);
            setSelectedShade(null);
            setIsOutOfStock(false);
            setProductImages([]); // Reset product images

            try {
                console.log(`[Effect ${id}] TRY block entered`);
                const fetchedProduct = await api.getProductById(id);
                console.log(`[Effect ${id}] Fetched product:`, fetchedProduct);

                if (!fetchedProduct) {
                    throw new Error('Product not found');
                }
                setProduct(fetchedProduct);
                
                // Set the main image
                const mainImageUrl = fetchedProduct.image || defaultProductImage;
                setSelectedImage(mainImageUrl);
                
                // Build the product images array
                let imagesArray = [
                    { url: mainImageUrl, alt: `${fetchedProduct.name} - Main` }
                ];
                
                // Check if the product has an images array from the API
                if (fetchedProduct.images && Array.isArray(fetchedProduct.images) && fetchedProduct.images.length > 0) {
                    console.log(`[Effect ${id}] Product has ${fetchedProduct.images.length} additional images`);
                    
                    // Add each image from the API to our images array
                    fetchedProduct.images.forEach((imageUrl, index) => {
                        if (imageUrl && typeof imageUrl === 'string') {
                            imagesArray.push({
                                url: imageUrl,
                                alt: `${fetchedProduct.name} - View ${index + 1}`
                            });
                        }
                    });
                } else {
                    console.log(`[Effect ${id}] No additional images found for this product`);
                    
                    // If we need to have at least a few images for testing, we can keep some placeholders
                    // These should be removed in production if you want to show only actual product images
                    if (process.env.NODE_ENV === 'development') {
                        console.log(`[Effect ${id}] Adding placeholder images for development`);
                        imagesArray.push(
                            { url: '/assets/images/hands-with-cleanser.jpg', alt: `${fetchedProduct.name} - Applied on Hands` },
                            { url: '/assets/images/cleanser-side-view.jpg', alt: `${fetchedProduct.name} - Side View` }
                        );
                    }
                }
                
                // Update the product images state
                setProductImages(imagesArray);
                
                console.log(`[Effect ${id}] Set product images array with ${imagesArray.length} images`);

                // Log image data for debugging
                console.log(`[Effect ${id}] Main Image:`, fetchedProduct.image);
                console.log(`[Effect ${id}] Product Images:`, fetchedProduct.images);

                if (fetchedProduct.stock !== undefined && fetchedProduct.stock <= 0) {
                    setIsOutOfStock(true);
                    console.log(`[Effect ${id}] setIsOutOfStock called (true)`);
                } else {
                    setIsOutOfStock(false);
                    console.log(`[Effect ${id}] setIsOutOfStock called (false)`);
                }

                const parsedShades = parseJsonField(fetchedProduct.shades);
                if (Array.isArray(parsedShades) && parsedShades.length > 0) {
                    setSelectedShade(parsedShades[0]);
                    console.log(`[Effect ${id}] setSelectedShade called with:`, parsedShades[0]);
                } else {
                    console.log(`[Effect ${id}] No shades to pre-select or parse error`);
                }

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
                console.error(`[Effect ${id}] CATCH block error:`, err);
                setError(err.message || 'Failed to load product details.');
            } finally {
                console.log(`[Effect ${id}] FINALLY block entered, setting loading false`);
                setLoading(false);
            }
        };

        fetchProductData();
    }, [id, api]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleQuantityChange = (event) => {
        let value = parseInt(event.target.value, 10);

        if (isNaN(value) || value < 1) {
            value = 1;
        }

        if (product && product.stock !== undefined && value > product.stock) {
            value = product.stock;
        }

        if (isOutOfStock) {
            value = 0;
        }

        setQuantity(value);
    };

    const handleIncrement = () => {
        setQuantity(prevQuantity => {
            const maxQuantity = (product && product.stock !== undefined) ? product.stock : Infinity;
            return Math.min(prevQuantity + 1, maxQuantity);
        });
    };

    const handleDecrement = () => {
        setQuantity(prevQuantity => Math.max(1, prevQuantity - 1));
    };

    const handleShadeSelect = (shade) => {
        setSelectedShade(shade);
    };

    const handleAddToCart = () => {
        if (!product || quantity < 1 || isOutOfStock) return;

        const productToAdd = {
            ...product,
            ...(selectedShade && { selectedShade: selectedShade })
        };

        cartContext.addToCart(productToAdd, quantity);

        if (!isOutOfStock) {
            setQuantity(1);
        }
    };

    const handleBuyNow = () => {
        if (!product || quantity < 1 || isOutOfStock) return;

        const productToAdd = {
            ...product,
            ...(selectedShade && { selectedShade: selectedShade })
        };

        cartContext.addToCart(productToAdd, quantity);
        navigate('/checkout');
    };

    const handleWishlistClick = () => {
        if (!product) return;

        if (!isSignedIn) {
            toast("Sign in to sync your wishlist across devices!");
            toggleWishlist(product.id);
        } else {
            toggleWishlist(product.id);
        }
    };

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

    // Handle thumbnail click to update main image
    const handleThumbnailClick = (imageUrl) => {
        setSelectedImage(imageUrl);
        setShowMagnifier(false); // Reset magnifier when switching images
    };

    // Handle mouse move for magnifying glass effect
    const handleImageMouseMove = (e) => {
        if (!mainImgRef.current || !imageContainerRef.current) return;

        const containerRect = imageContainerRef.current.getBoundingClientRect();
        const { left, top, width, height } = mainImgRef.current.getBoundingClientRect();

        // Calculate cursor position relative to the image
        const x = e.clientX - left;
        const y = e.clientY - top;

        // Check if cursor is within image boundaries
        if (x < 0 || x > width || y < 0 || y > height) {
            setShowMagnifier(false);
            return;
        }

        // Calculate magnifier position relative to container
        const containerX = e.clientX - containerRect.left;
        const containerY = e.clientY - containerRect.top;

        setShowMagnifier(true);

        const xPercent = (x / width) * 100;
        const yPercent = (y / height) * 100;

        setCursorPosition({
            x: xPercent,
            y: yPercent,
            clientX: containerX,
            clientY: containerY,
        });
    };

    if (loading) {
        return (
            <Container sx={{ py: 4, minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography>Loading product details...</Typography>
            </Container>
        );
    }

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

    console.log("[Render] Product State:", product);
    console.log("[Render] Product Shades:", product?.shades);
    console.log("[Render] Selected Shade State:", selectedShade);
    console.log("[Render] Is In Wishlist (from context):", isInWishlist(product.id));
    console.log("[Render] Selected Image:", selectedImage);

    const isProductInWishlist = product ? isInWishlist(product.id) : false;

    console.log("[Render] Product Loaded:", !!product);
    console.log("[Render] Is Signed In:", isSignedIn);
    console.log("[Render] Is Product In Wishlist (from context):", isProductInWishlist);
    console.log("[Render] Wishlist Loading State:", wishlistLoading);

    const benefits = parseJsonField(product.benefits);
    const ingredients = parseJsonField(product.ingredients);
    const shades = parseJsonField(product.shades);

    const shadeSelectionRequired = Array.isArray(shades) && shades.length > 0 && !selectedShade;

    const shareTitle = product ? `${product.name} - Clinique Beauty` : 'Check out this product!';
    const shareImage = selectedImage || defaultProductImage;

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
                        onClick={() => navigate(-1)}
                        aria-label="Go back"
                        sx={{ mr: 1, color: colorValues.textSecondary }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Breadcrumbs aria-label="breadcrumb" sx={{ color: colorValues.textSecondary }}>
                        <Link component={RouterLink} underline="hover" color="inherit" to="/">
                            Home
                        </Link>
                        {product?.category && (
                            <Link component={RouterLink} underline="hover" color="inherit" to={`/products/${product.category.toLowerCase()}`}>
                                {product.category}
                            </Link>
                        )}
                        {product.subcategory && (
                            <Link component={RouterLink} underline="hover" color="inherit" to={`/products/${product.category.toLowerCase()}?subcategory=${encodeURIComponent(product.subcategory)}`}>
                                {product.subcategory}
                            </Link>
                        )}
                        <Typography color={colorValues.textPrimary}>{product?.name || 'Product'}</Typography>
                    </Breadcrumbs>
                </Box>

                <Grid container spacing={4}>
                    {/* Product Images with Thumbnail Gallery */}
                    <Grid item xs={12} md={6}>
                        <Paper
                            elevation={theme === 'dark' ? 3 : 1}
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                backgroundColor: colorValues.bgPaper,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                position: 'relative',
                                overflow: 'hidden',
                                minHeight: 400,
                                width: '100%',
                            }}
                            ref={imageContainerRef}
                        >
                            <Tooltip title="Hover to magnify details" arrow>
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 10,
                                        right: 10,
                                        backgroundColor: 'rgba(0,0,0,0.5)',
                                        borderRadius: '50%',
                                        p: 1,
                                        zIndex: 5,
                                        color: 'white',
                                    }}
                                >
                                    <ZoomOutMapIcon fontSize="small" />
                                </Box>
                            </Tooltip>

                            {/* Main Image */}
                            <Box
                                sx={{
                                    width: '100%',
                                    maxHeight: '350px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    mb: 2,
                                    cursor: showMagnifier ? 'none' : 'zoom-in',
                                }}
                                onMouseMove={handleImageMouseMove}
                                onMouseEnter={() => mainImgRef.current && setShowMagnifier(true)}
                                onMouseLeave={() => setShowMagnifier(false)}
                            >
                                <img
                                    ref={mainImgRef}
                                    src={imageError ? defaultProductImage : selectedImage}
                                    alt={`${product.name} - Main Image`}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '350px',
                                        objectFit: 'contain',
                                        borderRadius: '4px',
                                    }}
                                    onError={() => setImageError(true)}
                                />
                            </Box>

                            {/* Thumbnail Gallery */}
                            <Box sx={{ 
                                display: 'flex', 
                                gap: 1, 
                                flexWrap: 'wrap', 
                                justifyContent: 'center',
                                maxWidth: '100%',
                                overflowX: 'auto',
                                py: 1
                            }}>
                                {productImages.map((image, index) => (
                                    <motion.div
                                        key={index}
                                        initial="rest"
                                        whileHover="hover"
                                        whileTap="tap"
                                        variants={thumbnailHover}
                                    >
                                        <Box
                                            sx={{
                                                width: 60,
                                                height: 60,
                                                borderRadius: '4px',
                                                overflow: 'hidden',
                                                cursor: 'pointer',
                                                border: selectedImage === image.url
                                                    ? `2px solid ${colorValues.primary}`
                                                    : `1px solid ${colorValues.textSecondary}`,
                                                transition: 'border 0.2s ease-in-out',
                                            }}
                                            onClick={() => handleThumbnailClick(image.url)}
                                        >
                                            <img
                                                src={image.url}
                                                alt={image.alt}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                }}
                                                onError={(e) => {
                                                    e.target.onerror = null; 
                                                    e.target.src = defaultProductImage;
                                                }}
                                            />
                                        </Box>
                                    </motion.div>
                                ))}
                            </Box>

                            {/* Magnifying Glass */}
                            {showMagnifier && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        left: `${cursorPosition.clientX}px`,
                                        top: `${cursorPosition.clientY}px`,
                                        width: `${magnifierSize}px`,
                                        height: `${magnifierSize}px`,
                                        border: `2px solid ${colorValues.primary}`,
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        backgroundColor: colorValues.bgPaper,
                                        boxShadow: '0 3px 10px rgba(0,0,0,0.25)',
                                        zIndex: 10,
                                        pointerEvents: 'none',
                                        transform: 'translate(-50%, -50%)',
                                    }}
                                >
                                    <Box
                                        component="div"
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                            backgroundImage: `url(${imageError ? defaultProductImage : selectedImage})`,
                                            backgroundPosition: `${cursorPosition.x}% ${cursorPosition.y}%`,
                                            backgroundRepeat: 'no-repeat',
                                            backgroundSize: `${zoomLevel * 100}%`,
                                        }}
                                    />
                                </Box>
                            )}
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
                                        <span>
                                            <IconButton
                                                onClick={handleWishlistClick}
                                                disabled={wishlistLoading || !product}
                                                aria-label={isProductInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                                                sx={{
                                                    color: isProductInWishlist ? (theme === 'light' ? '#d32f2f' : '#ef5350') : colorValues.textSecondary,
                                                    transition: 'color 0.2s, transform 0.1s',
                                                    '&:hover': {
                                                        color: isProductInWishlist ? (theme === 'light' ? '#c62828' : '#e57373') : colorValues.primary,
                                                        transform: 'scale(1.1)',
                                                    },
                                                    '&:disabled': {
                                                        color: colorValues.textSecondary,
                                                        opacity: 0.5,
                                                    }
                                                }}
                                            >
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

                            {Array.isArray(shades) && shades.length > 0 ? (
                                <Box sx={{ my: 3 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                                        Shade: {selectedShade ? selectedShade.name : 'Select a shade'}
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
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
                                                                ? `3px solid ${colorValues.primary}`
                                                                : `1px solid ${colorValues.textSecondary}`,
                                                            outline: selectedShade?.name === shade.name
                                                                ? `1px solid ${colorValues.bgPaper}`
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
                                console.log("[Render Check] Condition for shades (Array.isArray) is FALSE.")
                            )}

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
                                            max: product.stock,
                                            style: { textAlign: 'center', width: '40px', MozAppearance: 'textfield' },
                                        }}
                                        sx={{
                                            mx: 0.5,
                                            '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                                WebkitAppearance: 'none',
                                                margin: 0,
                                            },
                                        }}
                                    />
                                    <IconButton
                                        onClick={handleIncrement}
                                        size="small"
                                        aria-label="Increase quantity"
                                        sx={{ border: `1px solid ${colorValues.textSecondary}`, borderRadius: 1, ml: 1 }}
                                        disabled={product.stock !== undefined && quantity >= product.stock}
                                    >
                                        <AddIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            )}

                            <Box sx={{ mt: 'auto', pt: 2, display: 'flex', gap: 2 }}>
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
                                        fullWidth
                                        startIcon={<ShoppingCartIcon />}
                                        onClick={handleAddToCart}
                                        disabled={isOutOfStock || quantity < 1 || shadeSelectionRequired || cartContext.loading}
                                        sx={{
                                            backgroundColor: colorValues.primary,
                                            color: '#ffffff',
                                            py: 1.5,
                                            borderRadius: '50px',
                                            '&:hover': {
                                                backgroundColor: colorValues.primaryDark,
                                            },
                                            opacity: (isOutOfStock || quantity < 1 || shadeSelectionRequired || cartContext.loading) ? 0.6 : 1,
                                            flex: 1,
                                        }}
                                    >
                                        {cartContext.loading ? 'Adding...' :
                                            isOutOfStock ? 'Out of Stock' :
                                                shadeSelectionRequired ? 'Select Shade' :
                                                    `Add ${quantity} to Cart`}
                                    </Button>
                                </motion.div>

                                <motion.div
                                    initial="rest"
                                    whileHover={!(isOutOfStock || quantity < 1 || shadeSelectionRequired || cartContext.loading) ? "hover" : "rest"}
                                    whileTap={!(isOutOfStock || quantity < 1 || shadeSelectionRequired || cartContext.loading) ? "tap" : "rest"}
                                    variants={buttonHover}
                                    style={{ flex: 1 }}
                                >
                                    <Button
                                        variant="outlined"
                                        size="large"
                                        fullWidth
                                        startIcon={<LocalMallIcon />}
                                        onClick={handleBuyNow}
                                        disabled={isOutOfStock || quantity < 1 || shadeSelectionRequired || cartContext.loading}
                                        sx={{
                                            borderColor: colorValues.primary,
                                            color: colorValues.primary,
                                            py: 1.5,
                                            borderRadius: '50px',
                                            '&:hover': {
                                                backgroundColor: colorValues.buttonHover,
                                                borderColor: colorValues.primaryDark,
                                            },
                                            opacity: (isOutOfStock || quantity < 1 || shadeSelectionRequired || cartContext.loading) ? 0.6 : 1,
                                            flex: 1,
                                        }}
                                    >
                                        {isOutOfStock ? 'Out of Stock' :
                                            shadeSelectionRequired ? 'Select Shade' :
                                                'Buy Now'}
                                    </Button>
                                </motion.div>
                            </Box>

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
                                <Tooltip title="Share via Email">
                                    <motion.div initial="rest" whileHover="hover" whileTap="tap" variants={shareIconHover}>
                                        <EmailShareButton url={currentUrl} subject={shareTitle} body={`Check out this product: ${currentUrl}`}>
                                            <IconButton size="small" aria-label="Share via Email" sx={{ color: colorValues.primary }}>
                                                <EmailIcon />
                                            </IconButton>
                                        </EmailShareButton>
                                    </motion.div>
                                </Tooltip>
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
                        <Tab label="Reviews" id="product-tab-3" aria-controls="product-tabpanel-3" />
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

                            <TabPanel value={tabValue} index={3}>
                                <ReviewSection productId={product?.id} />
                            </TabPanel>
                        </motion.div>
                    </AnimatePresence>
                </Paper>

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
                                            }}
                                        >
                                            <ProductCard product={relatedProduct} />
                                        </Paper>
                                    </motion.div>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                ) : (
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