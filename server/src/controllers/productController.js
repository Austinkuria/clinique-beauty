import asyncHandler from '../utils/asyncHandler.js';
import Product from '../models/Product.js';

export const getProducts = asyncHandler(async (req, res) => 
    { const products = await Product.find({}); 
res.json(products); });

export const getProductById = asyncHandler(async (req, res) => 
    { const product = await Product.findById(req.params.id); 
        if (product) { res.json(product); 

        } else { 
            res.status(404); 
            throw new Error('Product not found'); 
        } 
    });
    
    export const createProduct = asyncHandler(async (req, res) => 
        { 
            const 
            { 
                name, price, image, description, category, stock 
            } = req.body; 

    const product = new Product({ 
        name, price, image, description, category, stock 
    });

    const createdProduct = await product.save(); 
    res.status(201).json(createdProduct); 
});
