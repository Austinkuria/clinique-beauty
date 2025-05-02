import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/orders
 * @desc    Get all orders for the authenticated user
 * @access  Private
 */
router.get('/', authMiddleware, (req, res) => {
  res.status(200).json({ message: 'Get all orders' });
});

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID
 * @access  Private
 */
router.get('/:id', authMiddleware, (req, res) => {
  res.status(200).json({ message: `Get order ${req.params.id}` });
});

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Private
 */
router.post('/', authMiddleware, (req, res) => {
  res.status(201).json({ message: 'Create order' });
});

/**
 * @route   PUT /api/orders/:id
 * @desc    Update order status
 * @access  Private/Admin
 */
router.put('/:id', authMiddleware, (req, res) => {
  res.status(200).json({ message: `Update order ${req.params.id}` });
});

/**
 * @route   DELETE /api/orders/:id
 * @desc    Cancel/delete an order
 * @access  Private/Admin
 */
router.delete('/:id', authMiddleware, (req, res) => {
  res.status(200).json({ message: `Delete order ${req.params.id}` });
});

// Export the router as the default export
export default router;
