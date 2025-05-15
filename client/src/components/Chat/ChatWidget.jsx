import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@clerk/clerk-react';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const { userId, isSignedIn } = useAuth();
  
  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'bot',
          text: 'Hello! Welcome to Clinique Beauty. How can I help you today?',
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, [messages]);
  
  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(BACKEND_URL);
    
    newSocket.on('connect', () => {
      console.log('Connected to chat server');
    });
    
    newSocket.on('chat_response', (response) => {
      setIsTyping(false);
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: response.text,
          timestamp: new Date().toISOString(),
          data: response.products || null
        }
      ]);
    });
    
    newSocket.on('bot_typing', (typing) => {
      setIsTyping(typing);
    });
    
    newSocket.on('chat_error', (error) => {
      setIsTyping(false);
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: `error-${Date.now()}`,
          sender: 'bot',
          text: 'Sorry, I encountered an error. Please try again.',
          isError: true,
          timestamp: new Date().toISOString()
        }
      ]);
    });
    
    newSocket.on('disconnect', () => {
      console.log('Disconnected from chat server');
    });
    
    setSocket(newSocket);
    
    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    // Add user message
    setMessages(prevMessages => [
      ...prevMessages,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: newMessage,
        timestamp: new Date().toISOString()
      }
    ]);
    
    // Show typing indicator
    setIsTyping(true);
    
    // Send message to server
    if (socket) {
      socket.emit('chat_message', {
        text: newMessage,
        userId: userId || 'guest',
        isAuthenticated: isSignedIn
      });
    }
    
    // Clear input
    setNewMessage('');
  };
  
  const toggleChat = () => {
    setIsOpen(!isOpen);
    
    // If opening chat and we need to reconnect socket
    if (!isOpen && socket?.disconnected) {
      socket.connect();
    }
  };
  
  // Render product suggestions if available
  const renderProductContent = (message) => {
    if (!message.data) return null;
    
    return (
      <div className="mt-2 product-suggestions">
        {message.data.map((product, index) => (
          <div key={product.id} className="p-2 mb-2 border rounded-md bg-white">
            <p className="font-medium">{product.name}</p>
            <p className="text-sm text-green-600">${product.price}</p>
            <button 
              className="mt-1 text-xs text-blue-600 hover:underline"
              onClick={() => window.location.href = `/product/${product.id}`}
            >
              View details
            </button>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat toggle button */}
      <button
        onClick={toggleChat}
        className="p-4 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <CloseIcon fontSize="small" /> : <ChatBubbleOutlineIcon fontSize="small" />}
      </button>
      
      {/* Chat window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 sm:w-96 h-[450px] bg-white rounded-lg shadow-xl flex flex-col overflow-hidden border border-gray-200">
          {/* Chat header */}
          <div className="p-3 bg-primary-600 text-white">
            <h3 className="font-semibold">Clinique Beauty Assistant</h3>
            <p className="text-xs opacity-80">Ask me anything about our products</p>
          </div>
          
          {/* Messages container */}
          <div className="flex-1 p-3 overflow-y-auto bg-gray-50">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`mb-3 max-w-[85%] ${message.sender === 'user' ? 'ml-auto' : 'mr-auto'}`}
              >
                <div 
                  className={`p-2 rounded-lg ${
                    message.sender === 'user' 
                      ? 'bg-primary-100 text-gray-800 rounded-br-none' 
                      : 'bg-white border border-gray-200 text-gray-700 rounded-bl-none shadow-sm'
                  } ${message.isError ? 'bg-red-50 border-red-200 text-red-600' : ''}`}
                >
                  <p>{message.text}</p>
                  {message.sender === 'bot' && renderProductContent(message)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-center mb-3 max-w-[85%] mr-auto">
                <div className="p-3 bg-gray-100 rounded-lg flex space-x-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></span>
                </div>
              </div>
            )}
            
            {/* Invisible element for auto-scroll */}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Message input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 flex">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button 
              type="submit"
              className="p-2 bg-primary-600 text-white rounded-r-md hover:bg-primary-700"
              disabled={!newMessage.trim()}
            >
              <SendIcon fontSize="small" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
