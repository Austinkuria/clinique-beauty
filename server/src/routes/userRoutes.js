import express from 'express';
import { syncUser, getUsers, getUserById } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/sync', syncUser);

// Protected routes (require authentication)
router.get('/', authMiddleware, getUsers);
router.get('/:id', authMiddleware, getUserById);

export default router;
