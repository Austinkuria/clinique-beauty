import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { 
  generateToken, 
  stkPush, 
  queryTransactionStatus, 
  handleCallback 
} from '../controllers/mpesaController.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

// Generate token for M-Pesa API
router.get('/token', authMiddleware, asyncHandler(generateToken));

// Initiate STK Push
router.post('/stkpush', authMiddleware, asyncHandler(stkPush));

// Query transaction status
router.post('/query', authMiddleware, asyncHandler(queryTransactionStatus));

// Callback URL for M-Pesa - no auth required as it's called by Safaricom
router.post('/callback', asyncHandler(handleCallback));

export default router;
