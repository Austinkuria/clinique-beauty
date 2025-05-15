import express from 'express';
import { getChatHistory, getChatbotAnalytics } from '../services/chatbotService.js';
import { clerkMiddleware } from '../middleware/clerkMiddleware.js';

const router = express.Router();

// Get chat history for a user (requires authentication)
router.get('/history', clerkMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await getChatHistory(userId);
    
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error retrieving chat history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve chat history',
      error: error.message
    });
  }
});

// Submit feedback about a chatbot response
router.post('/feedback', async (req, res) => {
  try {
    const { messageId, rating, comment, userId } = req.body;
    
    if (!messageId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Message ID and rating are required'
      });
    }
    
    // Store feedback in the database
    const { data, error } = await supabase
      .from('chat_feedback')
      .insert([
        {
          message_id: messageId,
          rating,
          comment,
          user_id: userId || 'anonymous',
          timestamp: new Date().toISOString()
        }
      ]);
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      data
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.message
    });
  }
});

// Add training data to the chatbot (admin only)
router.post('/train', clerkMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can add training data'
      });
    }
    
    const { query, response, category } = req.body;
    
    if (!query || !response) {
      return res.status(400).json({
        success: false,
        message: 'Query and response are required'
      });
    }
    
    // Store training data in the database
    const { data, error } = await supabase
      .from('chatbot_training')
      .insert([
        {
          query,
          response,
          category: category || 'general',
          created_by: req.user.id,
          timestamp: new Date().toISOString()
        }
      ]);
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Training data added successfully',
      data
    });
  } catch (error) {
    console.error('Error adding training data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add training data',
      error: error.message
    });
  }
});

// Get chatbot analytics (admin only)
router.get('/analytics', clerkMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can access analytics'
      });
    }
    
    const analytics = await getChatbotAnalytics();
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error retrieving chatbot analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve analytics',
      error: error.message
    });
  }
});

export default router;
