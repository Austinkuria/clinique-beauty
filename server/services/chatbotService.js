import axios from 'axios';
import { supabase } from '../config/db.js';

// Cache for product information to reduce database queries
let productCache = {
  data: [],
  lastUpdated: null,
  expiresIn: 3600000 // 1 hour
};

// Predefined responses for common questions
const predefinedResponses = {
  greeting: [
    "Hello! Welcome to Clinique Beauty. How can I assist you today?",
    "Hi there! I'm your Clinique Beauty assistant. What can I help you with?",
    "Welcome to Clinique Beauty! I'm here to help with any questions about our products."
  ],
  thanks: [
    "You're welcome! Is there anything else I can help you with?",
    "Happy to help! Let me know if you need anything else.",
    "My pleasure! Do you have any other questions about our products?"
  ],
  goodbye: [
    "Thank you for chatting with us! Have a great day.",
    "Goodbye! Feel free to return if you have more questions.",
    "Take care! We hope to see you again soon."
  ],
  default: [
    "I'm not sure I understand. Could you rephrase your question?",
    "I'd like to help, but I'm not sure what you're asking. Can you provide more details?",
    "I didn't quite catch that. Could you try asking in a different way?"
  ]
};

// AI-based response generation (can be replaced with actual AI service)
const generateAIResponse = async (message, userId) => {
  try {
    // If you're using an AI service like OpenAI
    if (process.env.OPENAI_API_KEY) {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful beauty advisor for Clinique Beauty e-commerce store. Provide concise, helpful responses about skincare, makeup, and beauty products.'
            },
            { role: 'user', content: message.text }
          ],
          max_tokens: 150,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return {
        text: response.data.choices[0].message.content.trim(),
        source: 'ai'
      };
    }
    
    // Fallback to rule-based responses if no AI service is available
    return generateRuleBasedResponse(message, userId);
  } catch (error) {
    console.error('Error generating AI response:', error);
    // Fallback to rule-based if AI fails
    return generateRuleBasedResponse(message, userId);
  }
};

// Rule-based response generation for common queries
const generateRuleBasedResponse = async (message, userId) => {
  const text = message.text.toLowerCase();
  
  // Check for greetings
  if (text.match(/\b(hi|hello|hey|greetings)\b/)) {
    return {
      text: getRandomResponse('greeting'),
      source: 'rule'
    };
  }
  
  // Check for gratitude
  if (text.match(/\b(thanks|thank you|thx)\b/)) {
    return {
      text: getRandomResponse('thanks'),
      source: 'rule'
    };
  }
  
  // Check for farewells
  if (text.match(/\b(bye|goodbye|see you|farewell)\b/)) {
    return {
      text: getRandomResponse('goodbye'),
      source: 'rule'
    };
  }
  
  // Product search
  if (text.match(/\b(product|find|looking for)\b/)) {
    return await handleProductSearch(text);
  }
  
  // Skincare advice
  if (text.match(/\b(skin|acne|wrinkle|moisturize|cleanser)\b/)) {
    return await handleSkincareAdvice(text);
  }
  
  // Order status
  if (text.match(/\b(order|status|shipping|delivery)\b/)) {
    return await handleOrderStatus(text, userId);
  }
  
  // Default response
  return {
    text: getRandomResponse('default'),
    source: 'rule'
  };
};

// Helper to get a random response from predefined categories
const getRandomResponse = (category) => {
  const responses = predefinedResponses[category] || predefinedResponses.default;
  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
};

// Product search handler
const handleProductSearch = async (text) => {
  try {
    // Refresh product cache if needed
    if (!productCache.lastUpdated || Date.now() - productCache.lastUpdated > productCache.expiresIn) {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, description, category, price')
        .limit(100);
      
      if (error) throw error;
      
      productCache.data = data;
      productCache.lastUpdated = Date.now();
    }
    
    // Extract potential product keywords
    const keywords = text.split(' ')
      .filter(word => word.length > 3)
      .map(word => word.replace(/[^a-zA-Z0-9]/g, ''));
    
    // Search products by keywords
    const matchingProducts = productCache.data.filter(product => {
      const productText = `${product.name} ${product.description} ${product.category}`.toLowerCase();
      return keywords.some(keyword => productText.includes(keyword.toLowerCase()));
    });
    
    if (matchingProducts.length > 0) {
      // Limit to top 3 products
      const topProducts = matchingProducts.slice(0, 3);
      
      let response = "I found these products that might interest you:\n\n";
      topProducts.forEach((product, index) => {
        response += `${index + 1}. ${product.name} - $${product.price}\n`;
      });
      
      response += "\nWould you like more details about any of these products?";
      
      return {
        text: response,
        source: 'products',
        products: topProducts
      };
    } else {
      return {
        text: "I couldn't find any products matching your description. Could you provide more details about what you're looking for?",
        source: 'rule'
      };
    }
  } catch (error) {
    console.error('Error searching products:', error);
    return {
      text: "I'm having trouble searching our product catalog right now. Please try again later or browse our products page.",
      source: 'error'
    };
  }
};

// Skincare advice handler
const handleSkincareAdvice = async (text) => {
  // Extract skin concerns
  let concern = '';
  
  if (text.includes('acne') || text.includes('pimple') || text.includes('breakout')) {
    concern = 'acne';
  } else if (text.includes('wrinkle') || text.includes('aging') || text.includes('fine line')) {
    concern = 'aging';
  } else if (text.includes('dry') || text.includes('flaky')) {
    concern = 'dryness';
  } else if (text.includes('oily') || text.includes('shine')) {
    concern = 'oiliness';
  } else if (text.includes('sensitive') || text.includes('irritation') || text.includes('redness')) {
    concern = 'sensitivity';
  }
  
  // Provide targeted advice based on skin concern
  switch (concern) {
    case 'acne':
      return {
        text: "For acne-prone skin, I recommend products with salicylic acid or benzoyl peroxide. Our Acne Solutions line might be perfect for you. Would you like me to show you some specific products?",
        source: 'skincare'
      };
    case 'aging':
      return {
        text: "For anti-aging concerns, look for products with retinol, peptides, and antioxidants. Our Smart Clinical Repair line is designed to target fine lines and wrinkles. Would you like some product recommendations?",
        source: 'skincare'
      };
    case 'dryness':
      return {
        text: "For dry skin, I recommend our Moisture Surge line which provides 72-hour hydration. Look for products with hyaluronic acid and glycerin. Would you like to see our top moisturizers?",
        source: 'skincare'
      };
    case 'oiliness':
      return {
        text: "For oily skin, try our Oil-Free line which helps control shine without over-drying. Products with clay or charcoal can help absorb excess oil. Would you like some specific recommendations?",
        source: 'skincare'
      };
    case 'sensitivity':
      return {
        text: "For sensitive skin, our Redness Solutions line is formulated without common irritants. Look for products labeled 'fragrance-free' and with soothing ingredients like aloe. Would you like to see our gentle skincare options?",
        source: 'skincare'
      };
    default:
      return {
        text: "I'd be happy to help with your skincare concerns. Could you tell me more about your skin type (dry, oily, combination, sensitive) and what specific issues you're trying to address?",
        source: 'skincare'
      };
  }
};

// Order status handler (simplified - would need user authentication in production)
const handleOrderStatus = async (text, userId) => {
  // In a real implementation, you would verify the user and check their actual orders
  // This is a simplified example
  
  return {
    text: "To check your order status, please log in to your account and visit the 'My Orders' section. Alternatively, you can provide your order number and I can look it up for you. For privacy reasons, I need to verify your identity first.",
    source: 'order'
  };
};

// Store chat history in the database
const storeChatHistory = async (message, response, userId) => {
  try {
    const { data, error } = await supabase
      .from('chat_history')
      .insert([
        {
          user_id: userId,
          message: message.text,
          response: response.text,
          response_source: response.source,
          timestamp: new Date().toISOString()
        }
      ]);
    
    if (error) {
      console.error('Error storing chat history:', error);
    }
  } catch (error) {
    console.error('Failed to store chat history:', error);
  }
};

// Main handler for chat messages
export const handleChatMessage = async (message, socketId) => {
  try {
    // Generate a response - either AI-based or rule-based
    const response = await generateAIResponse(message, socketId);
    
    // Store the interaction in the database for analytics and improvement
    await storeChatHistory(message, response, socketId);
    
    return response;
  } catch (error) {
    console.error('Error in handleChatMessage:', error);
    return {
      text: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
      source: 'error'
    };
  }
};

// Export other functions for use in API endpoints
export const getChatHistory = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error retrieving chat history:', error);
    throw error;
  }
};

export const getChatbotAnalytics = async () => {
  try {
    // Get overall usage statistics
    const { data: totalInteractions, error: countError } = await supabase
      .from('chat_history')
      .select('count');
    
    if (countError) throw countError;
    
    // Get popular topics/queries
    const { data: commonQueries, error: queriesError } = await supabase
      .rpc('get_common_chat_queries');
    
    if (queriesError) throw queriesError;
    
    // Get source distribution
    const { data: sourceDistribution, error: sourceError } = await supabase
      .rpc('get_response_source_distribution');
    
    if (sourceError) throw sourceError;
    
    return {
      totalInteractions: totalInteractions[0].count,
      commonQueries,
      sourceDistribution
    };
  } catch (error) {
    console.error('Error retrieving chatbot analytics:', error);
    throw error;
  }
};
