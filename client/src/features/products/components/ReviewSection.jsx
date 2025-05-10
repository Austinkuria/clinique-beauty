import React, { useState, useContext } from 'react';
import { Box, Typography, Rating, TextField, Button, List, ListItem, ListItemText, Divider, Paper, Link } from '@mui/material';
import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/clerk-react";
import { ThemeContext } from '../../../context/ThemeContext';
// Import mockReviewsData from the separate file
import { mockReviewsData } from '../../../data/mockReviewsData';

// Mock function to simulate checking purchase history
// In a real app, this would involve an API call to your backend
const checkIfUserPurchased = (userId, productId) => {
    console.log(`Checking if user ${userId} purchased product ${productId}`);
    // Replace with actual logic. Example: return true if user purchased.
    // For demonstration, let's assume the user purchased products with ID < 10
    return productId < 10;
};

function ReviewSection({ productId }) {
    const { theme, colorValues } = useContext(ThemeContext);
    const { user, isSignedIn } = useUser(); // Get user and signedIn status
    const [reviews, setReviews] = useState(mockReviewsData[productId] || []);
    const [newRating, setNewRating] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [error, setError] = useState('');

    // Determine if the signed-in user has purchased this product
    // We check isSignedIn as user object might be available briefly even after sign out
    const hasPurchased = isSignedIn && user ? checkIfUserPurchased(user.id, productId) : false;

    const handleReviewSubmit = (e) => {
        e.preventDefault();
        if (newRating === 0) {
            setError('Please select a star rating.');
            return;
        }
        if (!newComment.trim()) {
            setError('Please enter your review comment.');
            return;
        }
        setError('');

        // Simulate adding a review (in a real app, send to backend)
        const newReview = {
            id: Date.now(), // Simple unique ID
            user: user?.firstName || user?.username || 'Anonymous', // Use Clerk user info
            rating: newRating,
            comment: newComment,
        };
        setReviews(prevReviews => [newReview, ...prevReviews]);

        // Reset form
        setNewRating(0);
        setNewComment('');

        // Update mock data (for demo purposes, not ideal for real app)
        if (!mockReviewsData[productId]) {
            mockReviewsData[productId] = [];
        }
        mockReviewsData[productId].unshift(newReview);
    };

    return (
        <Box sx={{ color: colorValues.textPrimary }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                Customer Reviews
            </Typography>

            {/* Review Submission Area */}
            <SignedIn>
                {hasPurchased ? (
                    // Show form only if user has purchased
                    <Paper elevation={theme === 'dark' ? 2 : 1} sx={{ p: 3, mb: 4, backgroundColor: colorValues.bgPaper, borderRadius: 2 }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>Leave a Review</Typography>
                        <Box component="form" onSubmit={handleReviewSubmit} noValidate>
                            <Rating
                                name="new-rating"
                                value={newRating}
                                onChange={(event, newValue) => {
                                    setNewRating(newValue);
                                    if (newValue > 0) setError(''); // Clear error when rating is selected
                                }}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                label="Your Review"
                                multiline
                                rows={4}
                                fullWidth
                                variant="outlined"
                                value={newComment}
                                onChange={(e) => {
                                    setNewComment(e.target.value);
                                    if (e.target.value.trim()) setError(''); // Clear error when typing
                                }}
                                required
                                sx={{
                                    mb: 2,
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': { borderColor: colorValues.textSecondary },
                                        '&:hover fieldset': { borderColor: colorValues.primary },
                                        '&.Mui-focused fieldset': { borderColor: colorValues.primary },
                                    },
                                    '& .MuiInputLabel-root': { color: colorValues.textSecondary },
                                    '& .MuiInputBase-input': { color: colorValues.textPrimary },
                                }}
                            />
                            {error && <Typography color="error" variant="body2" sx={{ mb: 2 }}>{error}</Typography>}
                            <Button
                                type="submit"
                                variant="contained"
                                sx={{
                                    backgroundColor: colorValues.primary,
                                    '&:hover': { backgroundColor: colorValues.primaryDark }
                                }}
                            >
                                Submit Review
                            </Button>
                        </Box>
                    </Paper>
                ) : (
                    // Show message if user has not purchased
                    <Paper elevation={theme === 'dark' ? 2 : 1} sx={{ p: 3, mb: 4, backgroundColor: colorValues.bgPaper, borderRadius: 2 }}>
                        <Typography variant="body1" sx={{ color: colorValues.textSecondary }}>
                            You must purchase this product to leave a review.
                        </Typography>
                    </Paper>
                )}
            </SignedIn>

            {/* Sign In Prompt (Visible only when signed out) */}
            <SignedOut>
                <Paper elevation={theme === 'dark' ? 2 : 1} sx={{ p: 3, mb: 4, backgroundColor: colorValues.bgPaper, borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        Want to share your thoughts on this product?
                    </Typography>
                    <SignInButton mode="modal">
                        <Button variant="outlined" sx={{ color: colorValues.primary, borderColor: colorValues.primary }}>
                            Sign in to leave a review
                        </Button>
                    </SignInButton>
                </Paper>
            </SignedOut>

            {/* Display Existing Reviews */}
            <Box>
                {reviews.length > 0 ? (
                    <List sx={{ width: '100%' }}>
                        {reviews.map((review, index) => (
                            <React.Fragment key={review.id}>
                                <ListItem alignItems="flex-start">
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mr: 1 }}>{review.user}</Typography>
                                                <Rating value={review.rating} readOnly size="small" />
                                            </Box>
                                        }
                                        secondary={
                                            <Typography variant="body2" sx={{ color: colorValues.textSecondary }}>
                                                {review.comment}
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                                {index < reviews.length - 1 && <Divider variant="inset" component="li" />}
                            </React.Fragment>
                        ))}
                    </List>
                ) : (
                    <Typography sx={{ color: colorValues.textSecondary, mt: 2 }}>
                        No reviews yet for this product.
                        <SignedIn> Be the first to share your experience!</SignedIn>
                        <SignedOut> Sign in to be the first!</SignedOut>
                    </Typography>
                )}
            </Box>
        </Box>
    );
}

export default ReviewSection;