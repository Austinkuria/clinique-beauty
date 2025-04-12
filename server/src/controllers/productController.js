import asyncHandler from '../utils/asyncHandler.js';
import { supabase } from '../config/db.js';
import { validateProduct } from '../models/Product.js';

export const getProducts = asyncHandler(async (req, res) => {
    const { data, error } = await supabase
        .from('products')
        .select('*');

    if (error) {
        res.status(500);
        throw new Error(error.message);
    }

    res.json(data);
});

export const getProductById = asyncHandler(async (req, res) => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', req.params.id)
        .single();

    if (error || !data) {
        res.status(404);
        throw new Error('Product not found');
    }

    res.json(data);
});

export const createProduct = asyncHandler(async (req, res) => {
    const { name, price, image, description, category, stock } = req.body;

    // Validate product data
    const validation = validateProduct(req.body);
    if (!validation.valid) {
        res.status(400);
        throw new Error(validation.error);
    }

    const { data, error } = await supabase
        .from('products')
        .insert([{
            name, price, image, description, category, stock
        }])
        .select();

    if (error) {
        res.status(400);
        throw new Error(error.message);
    }

    res.status(201).json(data[0]);
});
