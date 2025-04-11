import React, { useContext } from 'react';
import { Box, Typography, Button, Card, CardMedia, CardContent, CardActions, Rating } from '@mui/material';
import { ThemeContext } from '../../../context/ThemeContext';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

function ProductCard({ product, onAddToCart }) {
  const { theme, colorValues } = useContext(ThemeContext);
  
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        border: 'none',
        backgroundColor: 'transparent',
        boxShadow: 'none'
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={product.image}
        alt={product.name}
        sx={{ 
          borderRadius: '8px',
          objectFit: 'cover'
        }}
      />
      
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography 
          variant="h6" 
          component="h3" 
          sx={{ 
            fontWeight: 500,
            mb: 1,
            color: colorValues.textPrimary
          }}
        >
          {product.name}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Rating 
            value={product.rating} 
            precision={0.1} 
            readOnly 
            size="small"
            sx={{ color: colorValues.primary }}
          />
          <Typography 
            variant="body2" 
            sx={{ ml: 1, color: colorValues.textSecondary }}
          >
            ({product.rating})
          </Typography>
        </Box>
        
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            color: colorValues.primary
          }}
        >
          ${product.price.toFixed(2)}
        </Typography>
      </CardContent>
      
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={<ShoppingCartIcon />}
          onClick={onAddToCart}
          sx={{
            backgroundColor: colorValues.primary,
            color: '#ffffff',
            borderRadius: '50px',
            textTransform: 'none',
            fontWeight: 500,
            boxShadow: theme === 'dark' ? '0 4px 6px rgba(0,0,0,0.4)' : '0 2px 4px rgba(0,0,0,0.1)',
            '&:hover': {
              backgroundColor: colorValues.primaryDark,
              boxShadow: theme === 'dark' ? '0 6px 8px rgba(0,0,0,0.5)' : '0 4px 6px rgba(0,0,0,0.2)',
            },
            py: 1
          }}
        >
          Add to Cart
        </Button>
      </CardActions>
    </Card>
  );
}

export default ProductCard;