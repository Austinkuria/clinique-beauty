import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Box, Grid, Paper, Divider, Button, 
  TextField, FormControlLabel, Checkbox, RadioGroup, Radio, 
  FormControl, FormLabel, CircularProgress, Alert, Stepper,
  Step, StepLabel, Card, CardContent, IconButton, MenuItem, Select, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useCart } from '../../context/CartContext';
import { useApi } from '../../api/apiClient';
import { useUser } from '@clerk/clerk-react';
import { ThemeContext } from '../../context/ThemeContext';
import { prepareCheckout, createCheckoutSession } from './checkoutApi';
import { initiateSTKPush, querySTKStatus, formatPhoneNumber } from '../../api/mpesaService';
import defaultProductImage from '../../assets/images/placeholder.webp';
import DOMPurify from 'dompurify'; // Import DOMPurify for sanitization

// Define shipping method options with Ksh currency
const SHIPPING_METHODS = [
  { id: 'standard', name: 'Standard Shipping', price: 0, estimatedDays: '5-7' },
  { id: 'express', name: 'Express Shipping', price: 1299, estimatedDays: '2-3' },
  { id: 'overnight', name: 'Overnight Shipping', price: 2499, estimatedDays: '1' }
];

// Payment methods available in Kenya
const PAYMENT_METHODS = [
  { id: 'mpesa', name: 'M-Pesa' },
  { id: 'card', name: 'Credit/Debit Card' },
  { id: 'bank', name: 'Bank Transfer' },
  { id: 'paypal', name: 'PayPal' }
];

// Kenya counties data
const KENYA_COUNTIES = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo Marakwet', 'Embu', 'Garissa', 
  'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 
  'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos', 
  'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi', 
  'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya', 
  'Taita Taveta', 'Tana River', 'Tharaka Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu', 
  'Vihiga', 'Wajir', 'West Pokot'
];

// Major cities by county
const KENYA_CITIES = {
  'Baringo': ['Kabarnet', 'Eldama Ravine', 'Marigat'],
  'Bomet': ['Bomet', 'Sotik'],
  'Bungoma': ['Bungoma', 'Kimilili', 'Webuye'],
  'Busia': ['Busia', 'Malaba', 'Nambale'],
  'Elgeyo Marakwet': ['Iten', 'Kapsowar', 'Chepkorio'],
  'Embu': ['Embu', 'Runyenjes', 'Manyatta'],
  'Garissa': ['Garissa', 'Dadaab', 'Masalani'],
  'Homa Bay': ['Homa Bay', 'Kendu Bay', 'Oyugis'],
  'Isiolo': ['Isiolo', 'Merti', 'Garbatulla'],
  'Kajiado': ['Kajiado', 'Ngong', 'Ongata Rongai', 'Kitengela'],
  'Kakamega': ['Kakamega', 'Mumias', 'Butere'],
  'Kericho': ['Kericho', 'Londiani', 'Kipkelion'],
  'Kiambu': ['Kiambu', 'Thika', 'Kikuyu', 'Ruiru', 'Limuru', 'Juja'],
  'Kilifi': ['Kilifi', 'Malindi', 'Mtwapa', 'Mariakani'],
  'Kirinyaga': ['Kerugoya', 'Sagana', 'Kagio'],
  'Kisii': ['Kisii', 'Ogembo', 'Suneka'],
  'Kisumu': ['Kisumu', 'Awasi', 'Ahero'],
  'Kitui': ['Kitui', 'Mwingi', 'Mutomo'],
  'Kwale': ['Kwale', 'Msambweni', 'Ukunda'],
  'Laikipia': ['Nanyuki', 'Nyahururu', 'Rumuruti'],
  'Lamu': ['Lamu', 'Mpeketoni', 'Witu'],
  'Machakos': ['Machakos', 'Athi River', 'Kangundo', 'Matuu'],
  'Makueni': ['Wote', 'Mtito Andei', 'Emali'],
  'Mandera': ['Mandera', 'Rhamu', 'Elwak'],
  'Marsabit': ['Marsabit', 'Moyale', 'Laisamis'],
  'Meru': ['Meru', 'Nkubu', 'Maua'],
  'Migori': ['Migori', 'Rongo', 'Awendo'],
  'Mombasa': ['Mombasa', 'Nyali', 'Kisauni', 'Likoni', 'Changamwe'],
  'Murang\'a': ['Murang\'a', 'Kangema', 'Maragua'],
  'Nairobi': ['Nairobi CBD', 'Westlands', 'Karen', 'Eastleigh', 'Kasarani', 'Kayole', 'South B', 'South C', 'Kilimani', 'Lavington', 'Dagoretti', 'Kawangware', 'Kangemi', 'Githurai', 'Ruaka', 'Embakasi', 'Donholm', 'Buruburu', 'Komarock', 'Utawala', 'Kileleshwa'],
  'Nakuru': ['Nakuru', 'Naivasha', 'Molo', 'Gilgil'],
  'Nandi': ['Kapsabet', 'Nandi Hills', 'Kaptumo'],
  'Narok': ['Narok', 'Kilgoris', 'Ololulunga'],
  'Nyamira': ['Nyamira', 'Nyansiongo', 'Keroka'],
  'Nyandarua': ['Ol Kalou', 'Engineer', 'Njabini'],
  'Nyeri': ['Nyeri', 'Karatina', 'Othaya'],
  'Samburu': ['Maralal', 'Baragoi', 'Archer\'s Post'],
  'Siaya': ['Siaya', 'Bondo', 'Yala'],
  'Taita Taveta': ['Voi', 'Wundanyi', 'Taveta'],
  'Tana River': ['Hola', 'Madogo', 'Bura'],
  'Tharaka Nithi': ['Chuka', 'Marimanti', 'Nkondi'],
  'Trans Nzoia': ['Kitale', 'Kiminini', 'Endebess'],
  'Turkana': ['Lodwar', 'Kakuma', 'Lokichogio'],
  'Uasin Gishu': ['Eldoret', 'Burnt Forest', 'Turbo'],
  'Vihiga': ['Vihiga', 'Luanda', 'Majengo'],
  'Wajir': ['Wajir', 'Habaswein', 'Bute'],
  'West Pokot': ['Kapenguria', 'Sigor', 'Chepareria']
};

// Postal codes for major cities
const KENYA_POSTAL_CODES = {
  'Nairobi CBD': '00100',
  'Westlands': '00800',
  'Karen': '00502',
  'Eastleigh': '00610',
  'Kasarani': '00608',
  'Kayole': '00518',
  'Kilimani': '00619',
  'Lavington': '00603',
  'Mombasa': '80100',
  'Nyali': '80118',
  'Kisauni': '80122',
  'Likoni': '80110',
  'Kisumu': '40100',
  'Nakuru': '20100',
  'Eldoret': '30100',
  'Thika': '01000',
  'Ruiru': '00232',
  'Kikuyu': '00902',
  'Machakos': '90100',
  'Athi River': '00204',
  'Garissa': '70100',
  'Kakamega': '50100',
  'Meru': '60200',
  'Nyeri': '10100',
  'Kiambu': '00900',
  'Kitale': '30200',
  'Kericho': '20200',
  'Embu': '60100',
  'Bungoma': '50200',
  'Malindi': '80200',
  'Kitui': '90200',
  'Naivasha': '20117',
  'Voi': '80300',
  'Namanga': '00207',
  'Kilifi': '80108'
};

// Default postal code
const DEFAULT_POSTAL_CODE = '00100';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart, loadCart } = useCart();
  const { isSignedIn, user } = useUser();
  const { theme, colorValues } = useContext(ThemeContext);
  const api = useApi();
  
  // Create a ref for tracking component mount
  const mounted = useRef(false);
  
  // Form state
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderIssues, setOrderIssues] = useState([]);
  
  // Customer information
  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    county: '',
    postalCode: '',
    sameAsBilling: true,
    billingAddress: {
      firstName: '',
      lastName: '',
      address: '',
      apartment: '',
      city: '',
      county: '',
      postalCode: '',
    },
    orderNotes: '',
    agreeToTerms: false
  });
  
  // Shipping and payment state
  const [selectedShipping, setSelectedShipping] = useState('standard');
  const [selectedPayment, setSelectedPayment] = useState('mpesa');
  const [mpesaNumber, setMpesaNumber] = useState('');
  
  // New state for managing dependent dropdowns
  const [availableCities, setAvailableCities] = useState([]);
  
  // Add state for M-Pesa payment flow
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [checkoutRequestId, setCheckoutRequestId] = useState(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentPollingInterval, setPaymentPollingInterval] = useState(null);
  
  // Add state for input validation
  const [validationErrors, setValidationErrors] = useState({});
  
  // Format currency helper
  const formatCurrency = (amount) => {
    return `Ksh${Number(amount).toFixed(2)}`;
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = cartTotal || 0;
    const shippingMethod = SHIPPING_METHODS.find(method => method.id === selectedShipping);
    const shippingCost = shippingMethod ? shippingMethod.price : 0;
    const tax = Math.round(subtotal * 0.16); // 16% VAT for Kenya
    const total = subtotal + shippingCost + tax;
    
    return {
      subtotal,
      shippingCost,
      tax,
      total
    };
  };
  
  const { subtotal, shippingCost, tax, total } = calculateTotals();
  
  // Load cart and checkout options
  useEffect(() => {
    const prepareCheckoutData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Make sure cart is loaded
        if (loadCart && !cartItems.length) {
          console.log("Loading cart data since it's empty");
          await loadCart();
        } else {
          console.log("Cart already has items, skipping load");
        }
        
        // Validate cart and get shipping options
        // Only call prepareCheckout if we have items and haven't already processed issues
        if (cartItems.length > 0 && orderIssues.length === 0) {
          console.log("Preparing checkout with existing cart items");
          const checkoutData = await prepareCheckout();
          
          if (!checkoutData.valid) {
            setOrderIssues(checkoutData.issues || []);
          }
        }
        
        // Pre-fill user data if signed in
        if (isSignedIn && user && 
            (!customerInfo.email || !customerInfo.firstName || !customerInfo.lastName)) {
          console.log("Pre-filling user data");
          setCustomerInfo(prev => ({
            ...prev,
            email: user.primaryEmailAddress?.emailAddress || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            phone: user.phoneNumbers?.[0]?.phoneNumber || ''
          }));
        }
        
        // Initialize available cities if county is already selected
        if (customerInfo.county) {
          setAvailableCities(KENYA_CITIES[customerInfo.county] || []);
        }
        
      } catch (err) {
        console.error('Error preparing checkout:', err);
        setError(err.message || 'Failed to prepare checkout');
      } finally {
        setLoading(false);
      }
    };
    
    // Only run this effect once when the component mounts
    if (!mounted.current) {
      mounted.current = true;
      prepareCheckoutData();
    }
  }, []); // Empty dependency array to run only once
  
  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    // Validate Kenya phone number format
    const phoneRegex = /^(0|\+?254|0?7)\d{8,9}$/;
    return phoneRegex.test(phone);
  };
  
  const validateName = (name) => {
    // Name should be at least 2 characters and contain only letters, spaces, and hyphens
    const nameRegex = /^[A-Za-z\s-]{2,}$/;
    return nameRegex.test(name);
  };
  
  const validateRequired = (value) => {
    return value && value.trim().length > 0;
  };
  
  // Sanitize input to prevent XSS
  const sanitizeInput = (input) => {
    if (typeof input === 'string') {
      return DOMPurify.sanitize(input.trim());
    }
    return input;
  };
  
  // Real-time validation
  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'email':
        if (!validateEmail(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'phone':
      case 'mpesaNumber':
        if (!validatePhone(value)) {
          error = 'Please enter a valid Kenyan phone number';
        }
        break;
      case 'firstName':
      case 'lastName':
      case 'billing.firstName':
      case 'billing.lastName':
        if (!validateName(value)) {
          error = 'Please enter a valid name';
        }
        break;
      case 'address':
      case 'billing.address':
        if (!validateRequired(value)) {
          error = 'Address is required';
        }
        break;
      default:
        // Other required fields
        if (name !== 'apartment' && 
            name !== 'billing.apartment' && 
            name !== 'orderNotes' && 
            !validateRequired(value)) {
          error = 'This field is required';
        }
    }
    
    return error;
  };

  // Enhanced handleInputChange with validation
  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;
    
    // Validate input in real-time
    if (type !== 'checkbox') {
      const error = validateField(name, value);
      setValidationErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
    
    if (name.startsWith('billing.')) {
      // Handle billing address fields
      const billingField = name.replace('billing.', '');
      setCustomerInfo({
        ...customerInfo,
        billingAddress: {
          ...customerInfo.billingAddress,
          [billingField]: inputValue
        }
      });
    } else if (name === 'sameAsBilling') {
      // Handle same as billing checkbox
      setCustomerInfo({
        ...customerInfo,
        sameAsBilling: checked
      });
    } else if (name === 'agreeToTerms') {
      // Handle terms checkbox
      setCustomerInfo({
        ...customerInfo,
        agreeToTerms: checked
      });
    } else {
      // Handle regular fields
      setCustomerInfo({
        ...customerInfo,
        [name]: inputValue
      });
    }
  };
  
  // Validate entire form
  const validateForm = () => {
    const errors = {};
    
    // Validate customer info
    errors.firstName = validateField('firstName', customerInfo.firstName);
    errors.lastName = validateField('lastName', customerInfo.lastName);
    errors.email = validateField('email', customerInfo.email);
    errors.phone = validateField('phone', customerInfo.phone);
    errors.address = validateField('address', customerInfo.address);
    errors.county = validateField('county', customerInfo.county);
    errors.city = validateField('city', customerInfo.city);
    
    // Validate billing if not same as shipping
    if (!customerInfo.sameAsBilling) {
      errors['billing.firstName'] = validateField('billing.firstName', customerInfo.billingAddress.firstName);
      errors['billing.lastName'] = validateField('billing.lastName', customerInfo.billingAddress.lastName);
      errors['billing.address'] = validateField('billing.address', customerInfo.billingAddress.address);
      errors['billing.county'] = validateField('billing.county', customerInfo.billingAddress.county);
      errors['billing.city'] = validateField('billing.city', customerInfo.billingAddress.city);
    }
    
    // Validate M-Pesa number if selected
    if (selectedPayment === 'mpesa') {
      errors.mpesaNumber = validateField('mpesaNumber', mpesaNumber);
    }
    
    // Validate terms agreement
    if (!customerInfo.agreeToTerms) {
      errors.agreeToTerms = 'You must agree to the Terms and Conditions';
    }
    
    setValidationErrors(errors);
    
    // Check if there are any errors
    return Object.values(errors).every(error => !error);
  };
  
  // Sanitize all form data before submission
  const sanitizeFormData = () => {
    const sanitizedInfo = {
      ...customerInfo,
      email: sanitizeInput(customerInfo.email),
      phone: sanitizeInput(customerInfo.phone),
      firstName: sanitizeInput(customerInfo.firstName),
      lastName: sanitizeInput(customerInfo.lastName),
      address: sanitizeInput(customerInfo.address),
      apartment: sanitizeInput(customerInfo.apartment || ''),
      orderNotes: sanitizeInput(customerInfo.orderNotes || ''),
      billingAddress: {
        ...customerInfo.billingAddress,
        firstName: sanitizeInput(customerInfo.billingAddress.firstName),
        lastName: sanitizeInput(customerInfo.billingAddress.lastName),
        address: sanitizeInput(customerInfo.billingAddress.address),
        apartment: sanitizeInput(customerInfo.billingAddress.apartment || '')
      }
    };
    
    return sanitizedInfo;
  };

  // Enhanced version of handleCountyChange with validation
  const handleCountyChange = (e) => {
    const selectedCounty = e.target.value;
    const countyCities = KENYA_CITIES[selectedCounty] || [];
    
    setCustomerInfo({
      ...customerInfo,
      county: selectedCounty,
      city: '', // Reset city when county changes
      postalCode: '' // Reset postal code when county changes
    });
    
    setAvailableCities(countyCities);
    
    // Clear city validation error when county changes
    setValidationErrors(prev => ({
      ...prev,
      city: ''
    }));
  };
  
  // Enhanced version of handleCityChange with validation
  const handleCityChange = (e) => {
    const selectedCity = e.target.value;
    const cityPostalCode = KENYA_POSTAL_CODES[selectedCity] || DEFAULT_POSTAL_CODE;
    
    console.log(`City selected: ${selectedCity}, Postal code: ${cityPostalCode}`);
    
    setCustomerInfo({
      ...customerInfo,
      city: selectedCity,
      postalCode: cityPostalCode // Ensure postal code is updated when city changes
    });
    
    // Clear city validation error when city is selected
    setValidationErrors(prev => ({
      ...prev,
      city: ''
    }));
  };
  
  // Handle billing county selection
  const handleBillingCountyChange = (e) => {
    const selectedCounty = e.target.value;
    const billingCities = KENYA_CITIES[selectedCounty] || [];
    
    setCustomerInfo({
      ...customerInfo,
      billingAddress: {
        ...customerInfo.billingAddress,
        county: selectedCounty,
        city: '',
        postalCode: ''
      }
    });
  };
  
  // Handle billing city selection
  const handleBillingCityChange = (e) => {
    const selectedCity = e.target.value;
    const cityPostalCode = KENYA_POSTAL_CODES[selectedCity] || DEFAULT_POSTAL_CODE;
    
    console.log(`Billing city selected: ${selectedCity}, Postal code: ${cityPostalCode}`);
    
    setCustomerInfo({
      ...customerInfo,
      billingAddress: {
        ...customerInfo.billingAddress,
        city: selectedCity,
        postalCode: cityPostalCode // Ensure postal code is updated when city changes
      }
    });
  };
  
  // Handle shipping method selection
  const handleShippingChange = (e) => {
    setSelectedShipping(e.target.value);
  };
  
  // Handle payment method selection
  const handlePaymentChange = (e) => {
    setSelectedPayment(e.target.value);
  };
  
  // Validate current step before proceeding
  const validateStep = (step) => {
    let errors = {};
    
    if (step === 0) {
      // Validate customer information and shipping address
      errors.firstName = validateField('firstName', customerInfo.firstName);
      errors.lastName = validateField('lastName', customerInfo.lastName);
      errors.email = validateField('email', customerInfo.email);
      errors.phone = validateField('phone', customerInfo.phone);
      errors.address = validateField('address', customerInfo.address);
      errors.county = validateField('county', customerInfo.county);
      errors.city = validateField('city', customerInfo.city);
    } else if (step === 1) {
      // Validate shipping and payment method
      if (selectedPayment === 'mpesa') {
        errors.mpesaNumber = validateField('mpesaNumber', mpesaNumber);
      }
      
      // Validate billing info if different from shipping
      if (!customerInfo.sameAsBilling) {
        errors['billing.firstName'] = validateField('billing.firstName', customerInfo.billingAddress.firstName);
        errors['billing.lastName'] = validateField('billing.lastName', customerInfo.billingAddress.lastName);
        errors['billing.address'] = validateField('billing.address', customerInfo.billingAddress.address);
        errors['billing.county'] = validateField('billing.county', customerInfo.billingAddress.county);
        errors['billing.city'] = validateField('billing.city', customerInfo.billingAddress.city);
      }
    }
    
    // Update validation errors state
    setValidationErrors(errors);
    
    // Return true if all fields are valid (no errors)
    return Object.values(errors).every(error => !error);
  };

  // Navigate through checkout steps
  const handleNext = () => {
    // Validate current step
    const isValid = validateStep(activeStep);
    
    if (isValid) {
      // Only proceed if validation passes
      setActiveStep((prevStep) => prevStep + 1);
      window.scrollTo(0, 0); // Scroll to top when moving to next step
    } else {
      // Display a message or highlight the errors
      // We're already setting the errors state
      
      // Scroll to the first form element with an error
      setTimeout(() => {
        const firstErrorElement = document.querySelector('.Mui-error');
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    window.scrollTo(0, 0); // Scroll to top when going back
  };

  // Enhanced handleSubmitOrder with validation and sanitization
  const handleSubmitOrder = async () => {
    // Validate the final step before submitting
    const isValid = validateForm();
    
    if (!isValid) {
      // Scroll to the first error
      setTimeout(() => {
        const firstErrorElement = document.querySelector('.Mui-error');
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return; // Don't proceed with order submission
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Sanitize all input data
      const sanitizedInfo = sanitizeFormData();
      // Get sanitized M-Pesa number
      const sanitizedMpesaNumber = sanitizeInput(mpesaNumber);
      
      // Create order data with sanitized inputs
      const orderData = {
        orderId: 'ORD-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        customer: {
          email: sanitizedInfo.email,
          firstName: sanitizedInfo.firstName,
          lastName: sanitizedInfo.lastName,
          phone: sanitizedInfo.phone
        },
        shipping: {
          address: sanitizedInfo.address,
          apartment: sanitizedInfo.apartment,
          city: sanitizedInfo.city,
          county: sanitizedInfo.county,
          postalCode: sanitizedInfo.postalCode,
          method: selectedShipping
        },
        billing: sanitizedInfo.sameAsBilling 
          ? { 
              ...sanitizedInfo, 
              apartment: sanitizedInfo.apartment 
            }
          : { 
              ...sanitizedInfo.billingAddress 
            },
        payment: {
          method: selectedPayment,
          mpesaNumber: sanitizedMpesaNumber
        },
        orderNotes: sanitizedInfo.orderNotes,
        totals: {
          subtotal,
          shipping: shippingCost,
          tax,
          total
        }
      };
      
      // Handle different payment methods
      if (selectedPayment === 'mpesa') {
        setLoading(false); // Turn off main loading as we'll use the dialog
        console.log('Processing M-Pesa payment for order:', orderData.orderId);
        // Force the payment dialog to appear even in production
        await handleMpesaPayment(orderData);
        
        // The rest of the process is handled by the handleMpesaPayment function
        // which includes navigation to confirmation page upon success
      } else {
        // Handle other payment methods (mock success for now)
        const result = await createCheckoutSession(orderData);
        
        if (result.success) {
          // Clear the cart and navigate to confirmation
          await clearCart();
          navigate('/checkout/confirmation', { 
            state: { 
              orderId: result.sessionId || orderData.orderId,
              orderDetails: orderData
            } 
          });
        } else {
          throw new Error(result.message || 'Failed to create checkout session');
        }
      }
    } catch (err) {
      console.error('Error submitting order:', err);
      setError(err.message || 'Failed to submit order');
      window.scrollTo(0, 0); // Scroll to top to see error
      setLoading(false);
    }
  };

  // Enhanced handleMpesaPayment with sanitization
  const handleMpesaPayment = async (orderData) => {
    try {
      setPaymentProcessing(true);
      setPaymentStatus({ status: 'processing', message: 'Initiating M-Pesa payment...' });
      setPaymentDialogOpen(true);
      
      // Log that we're initiating payment (debug)
      console.log('Initiating M-Pesa payment:', { 
        phoneNumber: orderData.payment.mpesaNumber, 
        amount: orderData.totals.total,
        environment: import.meta.env.PROD ? 'production' : 'development',
        orderId: orderData.orderId
      });
      
      // Format and sanitize the phone number
      const formattedPhone = formatPhoneNumber(orderData.payment.mpesaNumber);
      
      // Sanitize description to prevent injection
      const sanitizedDescription = sanitizeInput(`Payment for order at Clinique Beauty`);
      
      // Initiate STK push with sanitized data
      const stkResponse = await initiateSTKPush({
        phoneNumber: formattedPhone,
        amount: orderData.totals.total,
        orderId: orderData.orderId,
        description: sanitizedDescription
      });
      
      console.log('STK push response received:', stkResponse);
      
      if (stkResponse.success) {
        setCheckoutRequestId(stkResponse.checkoutRequestId);
        setPaymentStatus({ 
          status: 'waiting', 
          message: 'Please check your phone and enter M-Pesa PIN to complete payment' 
        });
        
        // Start polling for payment status
        const intervalId = setInterval(async () => {
          try {
            console.log('Polling payment status for:', stkResponse.checkoutRequestId);
            const statusResponse = await querySTKStatus(stkResponse.checkoutRequestId);
            console.log('Status response received:', statusResponse);
            
            if (statusResponse.success) {
              // Check if payment is completed based on ResultCode
              if (statusResponse.ResultCode === 0) {
                // Payment successful
                clearInterval(intervalId);
                setPaymentPollingInterval(null);
                setPaymentStatus({ 
                  status: 'success', 
                  message: 'Payment processed successfully!' 
                });
                
                // Wait 2 seconds then proceed to confirmation
                setTimeout(() => {
                  setPaymentDialogOpen(false);
                  setPaymentProcessing(false);
                  
                  // Clear the cart and navigate to confirmation
                  clearCart();
                  navigate('/checkout/confirmation', { 
                    state: { 
                      orderId: orderData.orderId,
                      orderDetails: orderData
                    } 
                  });
                }, 2000);
              } else if (statusResponse.ResultCode === 1032) {
                // Payment cancelled by user
                clearInterval(intervalId);
                setPaymentPollingInterval(null);
                setPaymentStatus({ 
                  status: 'error', 
                  message: 'Payment cancelled. Please try again.' 
                });
                
                // Allow retrying
                setPaymentProcessing(false);
              } else if (statusResponse.ResultCode) {
                // Other error
                clearInterval(intervalId);
                setPaymentPollingInterval(null);
                setPaymentStatus({ 
                  status: 'error', 
                  message: `Payment failed: ${statusResponse.ResultDesc || 'Unknown error'}` 
                });
                
                // Allow retrying
                setPaymentProcessing(false);
              }
            }
          } catch (statusError) {
            console.error('Error checking payment status:', statusError);
            // Don't stop polling on error, just continue
          }
        }, 5000); // Check every 5 seconds
        
        setPaymentPollingInterval(intervalId);
      } else {
        // STK push failed
        setPaymentStatus({ 
          status: 'error', 
          message: stkResponse.message || 'Failed to initiate payment. Please try again.' 
        });
        setPaymentProcessing(false);
      }
      
    } catch (error) {
      console.error('M-Pesa payment error:', error);
      setPaymentStatus({ 
        status: 'error', 
        message: error.message || 'Failed to process payment. Please try again.' 
      });
      setPaymentProcessing(false);
    }
  };

  // Clean up interval on component unmount
  useEffect(() => {
    return () => {
      if (paymentPollingInterval) {
        clearInterval(paymentPollingInterval);
      }
    };
  }, [paymentPollingInterval]);

  // Handle dialog close
  const handlePaymentDialogClose = () => {
    // Only allow closing if not processing
    if (!paymentProcessing) {
      setPaymentDialogOpen(false);
      
      // Clean up interval
      if (paymentPollingInterval) {
        clearInterval(paymentPollingInterval);
        setPaymentPollingInterval(null);
      }
    }
  };

  // Get content for current step - enhancing input fields with more explicit validation
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Customer Information
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                id="firstName"
                name="firstName"
                label="First Name"
                fullWidth
                variant="outlined"
                value={customerInfo.firstName}
                onChange={handleInputChange}
                error={!!validationErrors.firstName}
                helperText={validationErrors.firstName || "Required"}
                inputProps={{ maxLength: 50 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                id="lastName"
                name="lastName"
                label="Last Name"
                fullWidth
                variant="outlined"
                value={customerInfo.lastName}
                onChange={handleInputChange}
                error={!!validationErrors.lastName}
                helperText={validationErrors.lastName || "Required"}
                inputProps={{ maxLength: 50 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                id="email"
                name="email"
                label="Email Address"
                fullWidth
                variant="outlined"
                value={customerInfo.email}
                onChange={handleInputChange}
                error={!!validationErrors.email}
                helperText={validationErrors.email || "Required"}
                inputProps={{ maxLength: 100 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                id="phone"
                name="phone"
                label="Phone Number"
                fullWidth
                variant="outlined"
                value={customerInfo.phone}
                onChange={handleInputChange}
                error={!!validationErrors.phone}
                helperText={validationErrors.phone || "Format: 254XXXXXXXXX or 07XXXXXXXX"}
                inputProps={{ maxLength: 15 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Shipping Address
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                id="address"
                name="address"
                label="Address Line 1"
                fullWidth
                variant="outlined"
                value={customerInfo.address}
                onChange={handleInputChange}
                error={!!validationErrors.address}
                helperText={validationErrors.address || "Required"}
                inputProps={{ maxLength: 100 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="apartment"
                name="apartment"
                label="Apartment, suite, etc. (optional)"
                fullWidth
                variant="outlined"
                value={customerInfo.apartment}
                onChange={handleInputChange}
                error={!!validationErrors.apartment}
                helperText={validationErrors.apartment}
                inputProps={{ maxLength: 100 }}
              />
            </Grid>
            {/* County dropdown */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!validationErrors.county}>
                <InputLabel id="county-label">County</InputLabel>
                <Select
                  labelId="county-label"
                  id="county"
                  value={customerInfo.county}
                  label="County"
                  onChange={handleCountyChange}
                >
                  {KENYA_COUNTIES.map((county) => (
                    <MenuItem key={county} value={county}>{county}</MenuItem>
                  ))}
                </Select>
                {validationErrors.county && (
                  <Typography variant="caption" color="error">
                    {validationErrors.county}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            {/* City dropdown - dynamically populated based on county */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required disabled={!customerInfo.county} error={!!validationErrors.city}>
                <InputLabel id="city-label">City</InputLabel>
                <Select
                  labelId="city-label"
                  id="city"
                  value={customerInfo.city}
                  label="City"
                  onChange={handleCityChange}
                >
                  {availableCities.map((city) => (
                    <MenuItem key={city} value={city}>{city}</MenuItem>
                  ))}
                </Select>
                {validationErrors.city && (
                  <Typography variant="caption" color="error">
                    {validationErrors.city}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            {/* Postal code automatically filled based on city */}
            <Grid item xs={12} sm={6}>
              <TextField
                required
                id="postalCode"
                name="postalCode"
                label="Postal Code"
                fullWidth
                variant="outlined"
                value={customerInfo.postalCode}
                disabled={true}
                helperText="Automatically filled based on city selection"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="sameAsBilling"
                    checked={customerInfo.sameAsBilling}
                    onChange={handleInputChange}
                    color="primary"
                  />
                }
                label="Billing address same as shipping address"
              />
            </Grid>
            {!customerInfo.sameAsBilling && (
              <>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Billing Address
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    id="billing.firstName"
                    name="billing.firstName"
                    label="First Name"
                    fullWidth
                    variant="outlined"
                    value={customerInfo.billingAddress.firstName}
                    onChange={handleInputChange}
                    error={!!validationErrors['billing.firstName']}
                    helperText={validationErrors['billing.firstName'] || "Required"}
                    inputProps={{ maxLength: 50 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    id="billing.lastName"
                    name="billing.lastName"
                    label="Last Name"
                    fullWidth
                    variant="outlined"
                    value={customerInfo.billingAddress.lastName}
                    onChange={handleInputChange}
                    error={!!validationErrors['billing.lastName']}
                    helperText={validationErrors['billing.lastName'] || "Required"}
                    inputProps={{ maxLength: 50 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    id="billing.address"
                    name="billing.address"
                    label="Address"
                    fullWidth
                    variant="outlined"
                    value={customerInfo.billingAddress.address}
                    onChange={handleInputChange}
                    error={!!validationErrors['billing.address']}
                    helperText={validationErrors['billing.address'] || "Required"}
                    inputProps={{ maxLength: 100 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    id="billing.apartment"
                    name="billing.apartment"
                    label="Apartment, suite, etc. (optional)"
                    fullWidth
                    variant="outlined"
                    value={customerInfo.billingAddress.apartment}
                    onChange={handleInputChange}
                    error={!!validationErrors['billing.apartment']}
                    helperText={validationErrors['billing.apartment']}
                    inputProps={{ maxLength: 100 }}
                  />
                </Grid>
                {/* Billing County dropdown */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel id="billing-county-label">County</InputLabel>
                    <Select
                      labelId="billing-county-label"
                      id="billing.county"
                      value={customerInfo.billingAddress.county}
                      label="County"
                      onChange={handleBillingCountyChange}
                    >
                      {KENYA_COUNTIES.map((county) => (
                        <MenuItem key={county} value={county}>{county}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                {/* Billing City dropdown */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required disabled={!customerInfo.billingAddress.county}>
                    <InputLabel id="billing-city-label">City</InputLabel>
                    <Select
                      labelId="billing-city-label"
                      id="billing.city"
                      value={customerInfo.billingAddress.city}
                      label="City"
                      onChange={handleBillingCityChange}
                    >
                      {customerInfo.billingAddress.county && 
                        KENYA_CITIES[customerInfo.billingAddress.county]?.map((city) => (
                          <MenuItem key={city} value={city}>{city}</MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
                {/* Billing Postal code automatically filled */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    id="billing.postalCode"
                    name="billing.postalCode"
                    label="Postal Code"
                    fullWidth
                    variant="outlined"
                    value={customerInfo.billingAddress.postalCode}
                    disabled={true}
                    helperText="Automatically filled based on city selection"
                  />
                </Grid>
              </>
            )}
                
            <Grid item xs={12}>
              <TextField
                id="orderNotes"
                name="orderNotes"
                label="Order Notes (optional)"
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                value={customerInfo.orderNotes}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Shipping Method
              </Typography>
              <FormControl component="fieldset">
                <RadioGroup
                  name="shipping"
                  value={selectedShipping}
                  onChange={handleShippingChange}
                >
                  {SHIPPING_METHODS.map((method) => (
                    <Paper
                      key={method.id}
                      elevation={selectedShipping === method.id ? 3 : 1}
                      sx={{ 
                        mb: 2, 
                        p: 2, 
                        borderRadius: 2, 
                        border: selectedShipping === method.id ? `2px solid ${colorValues.primary}` : 'none',
                        backgroundColor: colorValues.bgPaper
                      }}
                    >
                      <FormControlLabel
                        value={method.id}
                        control={<Radio color="primary" />}
                        label={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="subtitle1">{method.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                Estimated Delivery: {method.estimatedDays} {method.estimatedDays === '1' ? 'day' : 'days'}
                              </Typography>
                            </Box>
                            <Typography variant="subtitle1">
                              {method.price === 0 ? 'FREE' : formatCurrency(method.price)}
                            </Typography>
                          </Box>
                        }
                        sx={{ width: '100%', margin: 0 }}
                      />
                    </Paper>
                  ))}
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Payment Method
              </Typography>
              <FormControl component="fieldset">
                <RadioGroup
                  name="payment"
                  value={selectedPayment}
                  onChange={handlePaymentChange}
                >
                  {PAYMENT_METHODS.map((method) => (
                    <Paper
                      key={method.id}
                      elevation={selectedPayment === method.id ? 3 : 1}
                      sx={{ 
                        mb: 2, 
                        p: 2, 
                        borderRadius: 2, 
                        border: selectedPayment === method.id ? `2px solid ${colorValues.primary}` : 'none',
                        backgroundColor: colorValues.bgPaper
                      }}
                    >
                      <FormControlLabel
                        value={method.id}
                        control={<Radio color="primary" />}
                        label={method.name}
                        sx={{ width: '100%', margin: 0 }}
                      />
                    </Paper>
                  ))}
                </RadioGroup>
              </FormControl>
            </Grid>
            {selectedPayment === 'mpesa' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  id="mpesaNumber"
                  label="M-Pesa Number"
                  fullWidth
                  variant="outlined"
                  value={mpesaNumber}
                  onChange={(e) => {
                    setMpesaNumber(e.target.value);
                    const error = validateField('mpesaNumber', e.target.value);
                    setValidationErrors(prev => ({
                      ...prev,
                      mpesaNumber: error
                    }));
                  }}
                  placeholder="e.g., 254712345678"
                  helperText={validationErrors.mpesaNumber || "Required - format: 254XXXXXXXXX"}
                  error={!!validationErrors.mpesaNumber}
                  inputProps={{ maxLength: 15 }}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="agreeToTerms"
                    checked={customerInfo.agreeToTerms}
                    onChange={handleInputChange}
                    color="primary"
                    required
                  />
                }
                label={
                  <Typography variant="body2">
                    I agree to the Terms and Conditions and Privacy Policy
                  </Typography>
                }
              />
              {validationErrors.agreeToTerms && (
                <Typography variant="caption" color="error" display="block">
                  {validationErrors.agreeToTerms}
                </Typography>
              )}
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Order Review
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Customer Information
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1">
                  {customerInfo.firstName} {customerInfo.lastName}
                </Typography>
                <Typography variant="body2">{customerInfo.email}</Typography>
                <Typography variant="body2">{customerInfo.phone}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom>
                Shipping Address
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">{customerInfo.address}</Typography>
                {customerInfo.apartment && (
                  <Typography variant="body2">{customerInfo.apartment}</Typography>
                )}
                <Typography variant="body2">
                  {customerInfo.city}, {customerInfo.county} {customerInfo.postalCode}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom>
                Billing Address
              </Typography>
              <Box sx={{ mb: 2 }}>
                {customerInfo.sameAsBilling ? (
                  <Typography variant="body2">Same as shipping address</Typography>
                ) : (
                  <>
                    <Typography variant="body2">
                      {customerInfo.billingAddress.firstName} {customerInfo.billingAddress.lastName}
                    </Typography>
                    <Typography variant="body2">{customerInfo.billingAddress.address}</Typography>
                    {customerInfo.billingAddress.apartment && (
                      <Typography variant="body2">{customerInfo.billingAddress.apartment}</Typography>
                    )}
                    <Typography variant="body2">
                      {customerInfo.billingAddress.city}, {customerInfo.billingAddress.county} {customerInfo.billingAddress.postalCode}
                    </Typography>
                  </>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom>
                Shipping Method
              </Typography>
              <Box sx={{ mb: 2 }}>
                {SHIPPING_METHODS.find(method => method.id === selectedShipping)?.name || ''}
                {' - '}
                {selectedShipping === 'standard' ? 'FREE' : formatCurrency(
                  SHIPPING_METHODS.find(method => method.id === selectedShipping)?.price || 0
                )}
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom>
                Payment Method
              </Typography>
              <Box sx={{ mb: 2 }}>
                {PAYMENT_METHODS.find(method => method.id === selectedPayment)?.name || ''}
                {selectedPayment === 'mpesa' && mpesaNumber && (
                  <Typography variant="body2">M-Pesa Number: {mpesaNumber}</Typography>
                )}
              </Box>
            </Grid>
            {customerInfo.orderNotes && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Order Notes
                </Typography>
                <Typography variant="body2">{customerInfo.orderNotes}</Typography>
              </Grid>
            )}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Order Items
              </Typography>
            </Grid>
            <Grid item xs={12}>
              {cartItems.map((item) => (
                <Box key={item.id} sx={{ display: 'flex', mb: 2, alignItems: 'center' }}>
                  <Box
                    component="img"
                    src={item.image || defaultProductImage}
                    alt={item.name}
                    sx={{ width: 60, height: 60, objectFit: 'contain', mr: 2, borderRadius: 1 }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1">{item.name}</Typography>
                    {item.selectedShade && (
                      <Typography variant="body2" color="text.secondary">
                        Shade: {item.selectedShade.name}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      Quantity: {item.quantity}
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {formatCurrency(item.price * item.quantity)}
                  </Typography>
                </Box>
              ))}
            </Grid>
          </Grid>
        );
      default:
        return 'Unknown step';
    }
  };

  // Render the page
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button 
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/cart')}
        sx={{ mb: 4 }}
      >
        Return to Cart
      </Button>

      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        Checkout
      </Typography>

      {/* Show errors */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Show cart issues */}
      {orderIssues.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2">
            We've found some issues with your order:
          </Typography>
          <ul>
            {orderIssues.map((issue, idx) => (
              <li key={idx}>{issue.message}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Loading state */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Empty cart warning */}
      {!loading && cartItems.length === 0 && (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center', backgroundColor: colorValues.bgPaper }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Your cart is empty.</Typography>
          <Button variant="contained" onClick={() => navigate('/products')} sx={{ backgroundColor: colorValues.primary, '&:hover': { backgroundColor: colorValues.primaryDark } }}>
            Continue Shopping
          </Button>
        </Paper>
      )}

      {/* Main checkout flow */}
      {!loading && cartItems.length > 0 && (
        <Grid container spacing={4}>
          {/* Left side: Checkout steps */}
          <Grid item xs={12} md={8}>
            <Paper elevation={theme === 'dark' ? 3 : 1} sx={{ p: 3, backgroundColor: colorValues.bgPaper }}>
              <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                <Step>
                  <StepLabel>Customer Information</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Shipping & Payment</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Review Order</StepLabel>
                </Step>
              </Stepper>
              <Box sx={{ mt: 2 }}>
                {getStepContent(activeStep)}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                {activeStep !== 0 && (
                  <Button
                    onClick={handleBack}
                    sx={{ mr: 1 }}
                  >
                    Back
                  </Button>
                )}
                <Box sx={{ flex: '1 1 auto' }} />
                
                {activeStep === 2 ? (
                  <Button
                    variant="contained"
                    onClick={handleSubmitOrder}
                    disabled={!customerInfo.agreeToTerms || loading}
                    sx={{ 
                      backgroundColor: colorValues.primary, 
                      '&:hover': { backgroundColor: colorValues.primaryDark },
                      px: 4
                    }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Place Order'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{ 
                      backgroundColor: colorValues.primary, 
                      '&:hover': { backgroundColor: colorValues.primaryDark } 
                    }}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </Paper>
          </Grid>
          {/* Right side: Order summary */}
          <Grid item xs={12} md={4}>
            <Card elevation={theme === 'dark' ? 3 : 1} sx={{ backgroundColor: colorValues.bgPaper, position: 'sticky', top: 20 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Order Summary
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {cartItems.map((item) => (
                    <Box key={item.id} sx={{ display: 'flex', mb: 2, alignItems: 'center' }}>
                      <Box
                        component="img"
                        src={item.image || defaultProductImage}
                        alt={item.name}
                        sx={{ width: 40, height: 40, objectFit: 'contain', mr: 2, borderRadius: 1 }}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" noWrap sx={{ maxWidth: '150px' }}>
                          {item.name} {item.quantity > 1 && `(${item.quantity})`}
                        </Typography>
                      </Box>
                      <Typography variant="body2">
                        {formatCurrency(item.price * item.quantity)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Subtotal</Typography>
                  <Typography variant="body2">{formatCurrency(subtotal)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Shipping</Typography>
                  <Typography variant="body2">
                    {shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">VAT (16%)</Typography>
                  <Typography variant="body2">{formatCurrency(tax)}</Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Total</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {formatCurrency(total)}
                  </Typography>
                </Box>
                <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LockIcon fontSize="small" sx={{ mr: 1, color: colorValues.success }} />
                  <Typography variant="caption" color="text.secondary">
                    Secure checkout powered by trusted payment providers
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* M-Pesa Payment Dialog */}
      <Dialog 
        open={paymentDialogOpen} 
        onClose={handlePaymentDialogClose}
        disableEscapeKeyDown={paymentProcessing}
        fullWidth
      >
        <DialogTitle>
          M-Pesa Payment
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {paymentStatus?.status === 'processing' && (
              <>
                <CircularProgress size={24} sx={{ mr: 2 }} />
                {paymentStatus.message}
              </>
            )}
            
            {paymentStatus?.status === 'waiting' && (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1">
                    <strong>A payment request has been sent to your phone.</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Please check your phone {mpesaNumber} and enter your M-Pesa PIN to complete the payment.
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CircularProgress size={30} sx={{ mr: 2 }} />
                  <Typography variant="body2">
                    Waiting for payment confirmation...
                  </Typography>
                </Box>
              </>
            )}
            
            {paymentStatus?.status === 'success' && (
              <Box sx={{ textAlign: 'center' }}>
                <CheckCircleIcon sx={{ color: 'success.main', fontSize: 48, mb: 2 }} />
                <Typography variant="body1">
                  {paymentStatus.message}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Redirecting to confirmation page...
                </Typography>
              </Box>
            )}
            
            {paymentStatus?.status === 'error' && (
              <Box>
                <Typography variant="body1" color="error">
                  {paymentStatus.message}
                </Typography>
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {!paymentProcessing && paymentStatus?.status !== 'success' && (
            <Button onClick={handlePaymentDialogClose}>
              Close
            </Button>
          )}
          {paymentStatus?.status === 'error' && (
            <Button 
              onClick={() => handleMpesaPayment({
                orderId: 'ORD-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
                totals: { total }
              })}
              variant="contained"
              color="primary"
            >
              Try Again
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CheckoutPage;
