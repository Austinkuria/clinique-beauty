import React, { useState, useEffect, useContext } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    IconButton,
    Button,
    TextField,
    InputAdornment,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Tooltip,
    Grid,
    CircularProgress,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Collapse,
    Stepper,
    Step,
    StepLabel,
    Tabs,
    Tab,
    Badge,
    Checkbox,
    ButtonGroup,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Snackbar,
    Alert,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    RadioGroup,
    Radio,
    FormControlLabel
} from '@mui/material';
import {
    Search as SearchIcon,
    Visibility as VisibilityIcon,
    LocalShipping as ShippingIcon,
    ReceiptLong as InvoiceIcon,
    Cancel as CancelIcon,
    Clear as ClearIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    DateRange as DateRangeIcon,
    Payment as PaymentIcon,
    AssignmentReturn as ReturnIcon,
    Print as PrintIcon,
    Check as CheckIcon,
    Warning as WarningIcon,
    Notifications as NotificationIcon,
    Chat as ChatIcon,
    History as HistoryIcon,
    Add as AddIcon,
    AttachMoney as AttachMoneyIcon,
    VerifiedUser as VerifiedUserIcon,
    CreditCard as CreditCardIcon,
    LocalPrintshop as LocalPrintshopIcon,
    QrCode as QrCodeIcon,
    LocalShippingOutlined as TrackingIcon,
    ContentCopy as CopyIcon,
    Assignment as AssignmentIcon,
    MoneyOff as RefundIcon,
    ReceiptLong as ReceiptIcon,
    ReportProblem as ProblemIcon,
    Support as SupportIcon,
    Comment as CommentIcon,
    QuestionAnswer as QuestionAnswerIcon,
    PlaylistAddCheck as ResolutionIcon
} from '@mui/icons-material';
import { 
    Timeline,
    TimelineItem,
    TimelineOppositeContent,
    TimelineSeparator,
    TimelineDot,
    TimelineConnector,
    TimelineContent 
} from '@mui/lab';
import { ThemeContext } from '../../../context/ThemeContext';
import { useApi } from '../../../api/apiClient';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import OrderFulfillmentChart from '../components/charts/OrderFulfillmentChart';
import { mockDashboardData } from '../../../data/mockDashboardData';
// Import the mock orders data and order history
import { mockOrders, getOrderHistory, shippingCarriers } from '../../../data/mockOrdersData';

// Tab panel component
function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`order-tabpanel-${index}`}
            aria-labelledby={`order-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

function AdminOrders() {
    const { theme, colorValues } = useContext(ThemeContext);
    const api = useApi();
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPaymentStatus, setFilterPaymentStatus] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [viewOrderDialog, setViewOrderDialog] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [actionDialogOpen, setActionDialogOpen] = useState(false);
    const [actionType, setActionType] = useState('');
    const [fulfillmentData, setFulfillmentData] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [orderHistory, setOrderHistory] = useState([]);
    const [processingOrders, setProcessingOrders] = useState([]);
    const [pendingPaymentOrders, setPendingPaymentOrders] = useState([]);
    const [batchProcessingItems, setBatchProcessingItems] = useState([]);
    const [showBatchActions, setShowBatchActions] = useState(false);
    const [noteDialogOpen, setNoteDialogOpen] = useState(false);
    const [newNote, setNewNote] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [detailsTabValue, setDetailsTabValue] = useState(0);
    const [verifyPaymentDialog, setVerifyPaymentDialog] = useState(false);
    const [reconciliationNote, setReconciliationNote] = useState('');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const [shippingLabelDialog, setShippingLabelDialog] = useState(false);
    const [selectedShippingCarrier, setSelectedShippingCarrier] = useState('fedex');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [trackingUrl, setTrackingUrl] = useState('');
    const [shippingDetailsExpanded, setShippingDetailsExpanded] = useState(false);
    const [returnsData, setReturnsData] = useState([]);
    const [issuesData, setIssuesData] = useState([]);
    const [selectedReturn, setSelectedReturn] = useState(null);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [returnDialogOpen, setReturnDialogOpen] = useState(false);
    const [issueDialogOpen, setIssueDialogOpen] = useState(false);
    const [refundDialogOpen, setRefundDialogOpen] = useState(false);
    const [refundAmount, setRefundAmount] = useState('');
    const [refundReason, setRefundReason] = useState('');
    const [issueResolutionNote, setIssueResolutionNote] = useState('');
    const [issueStatus, setIssueStatus] = useState('');
    
    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                // In a real app, you would fetch data from your API
                // const data = await api.getAdminOrders();
                // setOrders(data);
                
                // For now, we'll use mock data with a loading simulation
                setTimeout(() => {
                    setOrders(mockOrders);
                    // Also set fulfillment data from our mock dashboard data
                    setFulfillmentData(mockDashboardData.fulfillmentData);
                    
                    // Get processing orders
                    setProcessingOrders(mockOrders.filter(order => order.status === 'Processing'));
                    
                    // Get pending payment orders
                    setPendingPaymentOrders(mockOrders.filter(order => order.paymentStatus === 'Pending'));
                    
                    // Mock returns data
                    setReturnsData([
                        {
                            id: 'RET-001',
                            orderId: 'ORD-1001',
                            customer: 'Emma Watson',
                            reason: 'Wrong size',
                            status: 'Pending',
                            dateRequested: '2023-09-20',
                            items: [
                                { id: 1, name: 'Moisturizing Cream', quantity: 1, price: 29.99 }
                            ],
                            total: 29.99
                        },
                        {
                            id: 'RET-002',
                            orderId: 'ORD-1003',
                            customer: 'Alice Smith',
                            reason: 'Damaged product',
                            status: 'Approved',
                            dateRequested: '2023-09-19',
                            items: [
                                { id: 7, name: 'Shower Gel', quantity: 1, price: 18.99 }
                            ],
                            total: 18.99
                        },
                        {
                            id: 'RET-003',
                            orderId: 'ORD-1002',
                            customer: 'John Doe',
                            reason: 'Changed mind',
                            status: 'Completed',
                            dateRequested: '2023-09-18',
                            dateProcessed: '2023-09-21',
                            items: [
                                { id: 4, name: 'Eye Cream', quantity: 1, price: 34.99 }
                            ],
                            total: 34.99,
                            refundAmount: 34.99
                        }
                    ]);
                    
                    // Mock issues data
                    setIssuesData([
                        {
                            id: 'ISS-001',
                            orderId: 'ORD-1001',
                            customer: 'Emma Watson',
                            type: 'Shipping Delay',
                            status: 'Open',
                            priority: 'Medium',
                            dateReported: '2023-09-21',
                            description: 'Order has not been received yet'
                        },
                        {
                            id: 'ISS-002',
                            orderId: 'ORD-1004',
                            customer: 'Robert Brown',
                            type: 'Wrong Items',
                            status: 'In Progress',
                            priority: 'High',
                            dateReported: '2023-09-20',
                            description: 'Received different products than ordered'
                        },
                        {
                            id: 'ISS-003',
                            orderId: 'ORD-1003',
                            customer: 'Alice Smith',
                            type: 'Payment Issue',
                            status: 'Resolved',
                            priority: 'Low',
                            dateReported: '2023-09-19',
                            dateResolved: '2023-09-20',
                            description: 'Double charged for order',
                            resolution: 'Refund issued for duplicate charge'
                        }
                    ]);
                    
                    setLoading(false);
                }, 1000);
            } catch (error) {
                console.error('Error fetching orders:', error);
                setLoading(false);
            }
        };
        
        fetchOrders();
    }, [api]);
    
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    
    const handleSearchChange = (event) => {
        setSearch(event.target.value);
        setPage(0);
    };
    
    const handleStatusFilterChange = (event) => {
        setFilterStatus(event.target.value);
        setPage(0);
    };
    
    const handlePaymentStatusFilterChange = (event) => {
        setFilterPaymentStatus(event.target.value);
        setPage(0);
    };
    
    const handleClearFilters = () => {
        setSearch('');
        setFilterStatus('');
        setFilterPaymentStatus('');
        setStartDate(null);
        setEndDate(null);
    };
    
    const handleExpandRow = (orderId) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };
    
    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setOrderHistory(getOrderHistory(order.id));
        setViewOrderDialog(true);
        setDetailsTabValue(0);
    };
    
    const handleCloseViewDialog = () => {
        setViewOrderDialog(false);
    };
    
    const handleOpenActionDialog = (order, action) => {
        setSelectedOrder(order);
        setActionType(action);
        setActionDialogOpen(true);
    };
    
    const handleCloseActionDialog = () => {
        setActionDialogOpen(false);
        setSelectedOrder(null);
        setActionType('');
    };
    
    const handlePerformAction = () => {
        // In a real app, you would call your API to perform the action
        // if (actionType === 'ship') await api.shipOrder(selectedOrder.id);
        // else if (actionType === 'cancel') await api.cancelOrder(selectedOrder.id);
        
        // For now, we'll just update the local state
        const updatedOrders = orders.map(order => {
            if (order.id === selectedOrder.id) {
                return {
                    ...order,
                    status: actionType === 'ship' ? 'Shipped' : 
                            actionType === 'cancel' ? 'Cancelled' : order.status,
                    paymentStatus: actionType === 'cancel' ? 'Refunded' : order.paymentStatus
                };
            }
            return order;
        });
        
        setOrders(updatedOrders);
        
        // Update processing orders
        setProcessingOrders(updatedOrders.filter(order => order.status === 'Processing'));
        
        const actionText = actionType === 'ship' ? 'shipped' : 
                          actionType === 'cancel' ? 'cancelled' : '';
        toast.success(`Order ${selectedOrder.id} has been ${actionText}.`);
        
        // Add to order history
        const newHistoryItem = {
            id: orderHistory.length + 1,
            date: new Date().toISOString(),
            status: actionType === 'ship' ? 'Shipped' : 'Cancelled',
            user: 'Admin User',
            note: `Order ${actionType === 'ship' ? 'marked as shipped' : 'cancelled by admin'}`
        };
        
        setOrderHistory([...orderHistory, newHistoryItem]);
        setSnackbar({
            open: true,
            message: `Order ${selectedOrder.id} has been ${actionText}`,
            severity: 'success'
        });
        
        handleCloseActionDialog();
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleDetailsTabChange = (event, newValue) => {
        setDetailsTabValue(newValue);
    };

    const handleBatchItemToggle = (orderId) => {
        const currentIndex = batchProcessingItems.indexOf(orderId);
        const newChecked = [...batchProcessingItems];

        if (currentIndex === -1) {
            newChecked.push(orderId);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setBatchProcessingItems(newChecked);
        setShowBatchActions(newChecked.length > 0);
    };

    const handleBatchProcess = (action) => {
        // In a real app, you would process the batch action
        let message = '';
        
        if (action === 'ship') {
            // Update orders status to shipped
            const updatedOrders = orders.map(order => {
                if (batchProcessingItems.includes(order.id)) {
                    return { ...order, status: 'Shipped' };
                }
                return order;
            });
            setOrders(updatedOrders);
            setProcessingOrders(updatedOrders.filter(order => order.status === 'Processing'));
            message = `${batchProcessingItems.length} orders have been marked as shipped`;
        } else if (action === 'verify') {
            // Update payment status to paid
            const updatedOrders = orders.map(order => {
                if (batchProcessingItems.includes(order.id)) {
                    return { ...order, paymentStatus: 'Paid' };
                }
                return order;
            });
            setOrders(updatedOrders);
            setPendingPaymentOrders(updatedOrders.filter(order => order.paymentStatus === 'Pending'));
            message = `${batchProcessingItems.length} payments have been verified`;
        } else if (action === 'print') {
            message = `Printing labels for ${batchProcessingItems.length} orders`;
        }
        
        // Clear batch selection and show notification
        setBatchProcessingItems([]);
        setShowBatchActions(false);
        setSnackbar({
            open: true,
            message,
            severity: 'success'
        });
    };

    const handleAddOrderNote = () => {
        setNoteDialogOpen(true);
    };

    const handleCloseNoteDialog = () => {
        setNoteDialogOpen(false);
        setNewNote('');
    };

    const handleSaveNote = () => {
        if (!newNote.trim()) return;
        
        // Add note to order history
        const newNoteItem = {
            id: orderHistory.length + 1,
            date: new Date().toISOString(),
            status: 'Note Added',
            user: 'Admin User',
            note: newNote
        };
        
        setOrderHistory([...orderHistory, newNoteItem]);
        setNewNote('');
        setNoteDialogOpen(false);
        setSnackbar({
            open: true,
            message: 'Note added to order history',
            severity: 'success'
        });
    };

    const handleSnackbarClose = () => {
        setSnackbar({ ...snackbar, open: false });
    };
    
    // Filter and search orders
    const filteredOrders = orders.filter(order => {
        const matchesSearch = search === '' || 
            order.id.toLowerCase().includes(search.toLowerCase()) ||
            order.customer.toLowerCase().includes(search.toLowerCase()) ||
            order.email.toLowerCase().includes(search.toLowerCase());
            
        const matchesStatus = filterStatus === '' || order.status === filterStatus;
        const matchesPaymentStatus = filterPaymentStatus === '' || order.paymentStatus === filterPaymentStatus;
        
        // Date filtering
        let matchesDateRange = true;
        if (startDate && endDate) {
            const orderDate = new Date(order.date);
            matchesDateRange = orderDate >= startDate && orderDate <= endDate;
        } else if (startDate) {
            const orderDate = new Date(order.date);
            matchesDateRange = orderDate >= startDate;
        } else if (endDate) {
            const orderDate = new Date(order.date);
            matchesDateRange = orderDate <= endDate;
        }
        
        return matchesSearch && matchesStatus && matchesPaymentStatus && matchesDateRange;
    });
    
    // Get unique statuses for filters
    const statuses = ['', ...new Set(orders.map(o => o.status))];
    const paymentStatuses = ['', ...new Set(orders.map(o => o.paymentStatus))];
    
    // Generate dialog content based on action type
    const getDialogContent = () => {
        if (actionType === 'ship') {
            return {
                title: 'Ship Order',
                content: `Are you sure you want to mark order "${selectedOrder?.id}" as shipped?`,
                confirmText: 'Mark as Shipped',
                confirmColor: 'primary'
            };
        } else if (actionType === 'cancel') {
            return {
                title: 'Cancel Order',
                content: `Are you sure you want to cancel order "${selectedOrder?.id}"? This will refund the payment.`,
                confirmText: 'Cancel Order',
                confirmColor: 'error'
            };
        }
        return {};
    };
    
    const dialogContent = getDialogContent();
    
    // Get status step for stepper
    const getOrderStep = (status) => {
        switch (status) {
            case 'Processing': return 0;
            case 'Shipped': return 1;
            case 'Delivered': return 2;
            case 'Cancelled': return -1;
            default: return 0;
        }
    };
    
    // Payment verification handlers
    const handleOpenPaymentVerification = (order) => {
        setSelectedOrder(order);
        setSelectedPaymentMethod(order.paymentMethod || 'creditCard');
        setVerifyPaymentDialog(true);
    };
    
    const handleClosePaymentVerification = () => {
        setVerifyPaymentDialog(false);
        setReconciliationNote('');
    };
    
    const handleVerifyPayment = () => {
        // In a real app, you would call your API to verify the payment
        const updatedOrders = orders.map(order => {
            if (order.id === selectedOrder.id) {
                return {
                    ...order,
                    paymentStatus: 'Paid',
                    paymentMethod: selectedPaymentMethod,
                    paymentVerifiedAt: new Date().toISOString(),
                    paymentNote: reconciliationNote
                };
            }
            return order;
        });
        
        setOrders(updatedOrders);
        setPendingPaymentOrders(updatedOrders.filter(order => order.paymentStatus === 'Pending'));
        
        // Add to order history
        const newHistoryItem = {
            id: orderHistory.length + 1,
            date: new Date().toISOString(),
            status: 'Payment Verified',
            user: 'Admin User',
            note: reconciliationNote || 'Payment verified and reconciled'
        };
        
        setOrderHistory([...orderHistory, newHistoryItem]);
        setSnackbar({
            open: true,
            message: `Payment for order ${selectedOrder.id} has been verified`,
            severity: 'success'
        });
        
        handleClosePaymentVerification();
    };
    
    // Shipping label handlers
    const handleOpenShippingLabel = (order) => {
        setSelectedOrder(order);
        setTrackingNumber(order.trackingNumber || generateTrackingNumber());
        setTrackingUrl(getTrackingUrl(selectedShippingCarrier, trackingNumber));
        setShippingLabelDialog(true);
    };
    
    const handleCloseShippingLabel = () => {
        setShippingLabelDialog(false);
    };
    
    const handleGenerateShippingLabel = () => {
        // In a real app, you would call your API to generate a shipping label
        const updatedOrders = orders.map(order => {
            if (order.id === selectedOrder.id) {
                return {
                    ...order,
                    status: 'Shipped',
                    trackingNumber,
                    shippingCarrier: selectedShippingCarrier,
                    shippedAt: new Date().toISOString()
                };
            }
            return order;
        });
        
        setOrders(updatedOrders);
        setProcessingOrders(updatedOrders.filter(order => order.status === 'Processing'));
        
        // Add to order history
        const newHistoryItem = {
            id: orderHistory.length + 1,
            date: new Date().toISOString(),
            status: 'Shipping Label Generated',
            user: 'Admin User',
            note: `Shipping label generated with ${selectedShippingCarrier.toUpperCase()}. Tracking: ${trackingNumber}`
        };
        
        setOrderHistory([...orderHistory, newHistoryItem]);
        setSnackbar({
            open: true,
            message: `Shipping label generated for order ${selectedOrder.id}`,
            severity: 'success'
        });
        
        handleCloseShippingLabel();
    };
    
    const handleCarrierChange = (event) => {
        const carrier = event.target.value;
        setSelectedShippingCarrier(carrier);
        setTrackingUrl(getTrackingUrl(carrier, trackingNumber));
    };
    
    const handleShippingDetailsToggle = () => {
        setShippingDetailsExpanded(!shippingDetailsExpanded);
    };
    
    // Helper functions
    const generateTrackingNumber = () => {
        // This would be generated by a shipping API in a real app
        const prefix = 
            selectedShippingCarrier === 'fedex' ? 'FDX' :
            selectedShippingCarrier === 'ups' ? 'UPS' : 
            selectedShippingCarrier === 'usps' ? 'USPS' :
            selectedShippingCarrier === 'sendy' ? 'SENDY' :
            selectedShippingCarrier === 'g4s' ? 'G4SKE' :
            selectedShippingCarrier === 'posta' ? 'PKENA' :
            selectedShippingCarrier === 'wells' ? 'WFKEN' :
            selectedShippingCarrier === 'aramex' ? 'ARMX' :
            selectedShippingCarrier === 'dhl' ? 'DHL' : 'TRK';
        const random = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
        return `${prefix}${random}`;
    };
    
    const getTrackingUrl = (carrier, number) => {
        if (!number) return '';
        // These would be real tracking URLs in a production app
        switch (carrier) {
            case 'fedex': return `https://www.fedex.com/fedextrack/?trknbr=${number}`;
            case 'ups': return `https://www.ups.com/track?tracknum=${number}`;
            case 'usps': return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${number}`;
            case 'dhl': return `https://www.dhl.com/us-en/home/tracking/tracking-parcel.html?submit=1&tracking-id=${number}`;
            case 'sendy': return `https://www.sendyit.com/tracking?tracking_id=${number}`;
            case 'g4s': return `https://www.g4s.com/en-ke/courier/track-and-trace?waybill=${number}`;
            case 'posta': return `https://www.posta.co.ke/track-trace?tracking=${number}`;
            case 'wells': return `https://wells.co.ke/tracking?awb=${number}`;
            case 'aramex': return `https://www.aramex.com/track/results?ShipmentNumber=${number}`;
            default: return '';
        }
    };
    
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setSnackbar({
            open: true,
            message: 'Copied to clipboard',
            severity: 'success'
        });
    };
    
    // Returns and Issues handlers
    const handleViewReturn = (returnItem) => {
        setSelectedReturn(returnItem);
        setReturnDialogOpen(true);
    };
    
    const handleCloseReturnDialog = () => {
        setReturnDialogOpen(false);
        setSelectedReturn(null);
    };
    
    const handleViewIssue = (issue) => {
        setSelectedIssue(issue);
        setIssueStatus(issue.status);
        setIssueResolutionNote(issue.resolution || '');
        setIssueDialogOpen(true);
    };
    
    const handleCloseIssueDialog = () => {
        setIssueDialogOpen(false);
        setSelectedIssue(null);
        setIssueResolutionNote('');
    };
    
    const handleApproveReturn = (returnItem) => {
        const updatedReturns = returnsData.map(item => {
            if (item.id === returnItem.id) {
                return { ...item, status: 'Approved' };
            }
            return item;
        });
        setReturnsData(updatedReturns);
        setSnackbar({
            open: true,
            message: `Return ${returnItem.id} has been approved`,
            severity: 'success'
        });
        setReturnDialogOpen(false);
    };
    
    const handleDenyReturn = (returnItem) => {
        const updatedReturns = returnsData.map(item => {
            if (item.id === returnItem.id) {
                return { ...item, status: 'Denied' };
            }
            return item;
        });
        setReturnsData(updatedReturns);
        setSnackbar({
            open: true,
            message: `Return ${returnItem.id} has been denied`,
            severity: 'warning'
        });
        setReturnDialogOpen(false);
    };
    
    const handleRefundReturn = (returnItem) => {
        setSelectedReturn(returnItem);
        setRefundAmount(returnItem.total.toFixed(2));
        setRefundDialogOpen(true);
    };
    
    const handleCloseRefundDialog = () => {
        setRefundDialogOpen(false);
        setRefundAmount('');
        setRefundReason('');
    };
    
    const handleProcessRefund = () => {
        if (!refundAmount || parseFloat(refundAmount) <= 0) {
            setSnackbar({
                open: true,
                message: 'Please enter a valid refund amount',
                severity: 'error'
            });
            return;
        }
        
        const updatedReturns = returnsData.map(item => {
            if (item.id === selectedReturn.id) {
                return { 
                    ...item, 
                    status: 'Completed', 
                    refundAmount: parseFloat(refundAmount),
                    dateProcessed: format(new Date(), 'yyyy-MM-dd')
                };
            }
            return item;
        });
        
        setReturnsData(updatedReturns);
        setSnackbar({
            open: true,
            message: `Refund of $${refundAmount} processed for ${selectedReturn.id}`,
            severity: 'success'
        });
        
        handleCloseRefundDialog();
    };
    
    const handleResolveIssue = () => {
        const updatedIssues = issuesData.map(item => {
            if (item.id === selectedIssue.id) {
                return { 
                    ...item, 
                    status: issueStatus,
                    resolution: issueResolutionNote,
                    dateResolved: issueStatus === 'Resolved' ? format(new Date(), 'yyyy-MM-dd') : item.dateResolved
                };
            }
            return item;
        });
        
        setIssuesData(updatedIssues);
        setSnackbar({
            open: true,
            message: `Issue ${selectedIssue.id} has been updated`,
            severity: 'success'
        });
        
        handleCloseIssueDialog();
    };
    
    const getReturnStatusChipColor = (status) => {
        switch (status) {
            case 'Pending': return 'warning';
            case 'Approved': return 'info';
            case 'Completed': return 'success';
            case 'Denied': return 'error';
            default: return 'default';
        }
    };
    
    const getIssueStatusChipColor = (status) => {
        switch (status) {
            case 'Open': return 'error';
            case 'In Progress': return 'warning';
            case 'Resolved': return 'success';
            default: return 'default';
        }
    };
    
    const getIssuePriorityChipColor = (priority) => {
        switch (priority) {
            case 'High': return 'error';
            case 'Medium': return 'warning';
            case 'Low': return 'info';
            default: return 'default';
        }
    };
    
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }
    
    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Orders</Typography>
            
            {/* Tab Navigation */}
            <Paper
                elevation={theme === 'dark' ? 3 : 1}
                sx={{
                    bgcolor: colorValues.bgPaper,
                    borderRadius: 2,
                    mb: 4
                }}
            >
                <Tabs 
                    value={tabValue} 
                    onChange={handleTabChange} 
                    indicatorColor="primary"
                    textColor="primary"
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab label="All Orders" />
                    <Tab 
                        label={
                            <Badge badgeContent={processingOrders.length} color="warning">
                                Processing
                            </Badge>
                        }
                    />
                    <Tab 
                        label={
                            <Badge badgeContent={pendingPaymentOrders.length} color="error">
                                Pending Payment
                            </Badge>
                        }
                    />
                    <Tab 
                        label={
                            <Badge badgeContent={returnsData.filter(r => r.status === 'Pending').length} color="primary">
                                Returns & Refunds
                            </Badge>
                        }
                    />
                    <Tab 
                        label={
                            <Badge badgeContent={issuesData.filter(i => i.status !== 'Resolved').length} color="error">
                                Order Issues
                            </Badge>
                        }
                    />
                </Tabs>
            </Paper>
            
            {/* Order Overview Statistics */}
            {tabValue === 0 && fulfillmentData && (
                <Paper
                    elevation={theme === 'dark' ? 3 : 1}
                    sx={{
                        p: 3,
                        mb: 4,
                        bgcolor: colorValues.bgPaper,
                        borderRadius: 2
                    }}
                >
                    <Typography variant="h6" sx={{ mb: 2 }}>Order Processing Dashboard</Typography>
                    <Grid container spacing={3}>
                        {/* Order Status Chart */}
                        <Grid item xs={12} md={8}>
                            <OrderFulfillmentChart fulfillmentData={fulfillmentData} />
                        </Grid>
                        
                        {/* Quick Actions Card */}
                        <Grid item xs={12} md={4}>
                            <Card variant="outlined" sx={{ height: '100%' }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>Quick Actions</Typography>
                                    <List>
                                        <ListItem>
                                            <ListItemIcon>
                                                <ShippingIcon color="primary" />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="Orders Awaiting Shipment" 
                                                secondary={`${processingOrders.length} orders`}
                                            />
                                            <Button 
                                                variant="outlined" 
                                                size="small" 
                                                onClick={() => setTabValue(1)}
                                            >
                                                View
                                            </Button>
                                        </ListItem>
                                        <ListItem>
                                            <ListItemIcon>
                                                <PaymentIcon color="error" />
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary="Pending Payments" 
                                                secondary={`${pendingPaymentOrders.length} orders`}
                                            />
                                            <Button 
                                                variant="outlined" 
                                                size="small" 
                                                onClick={() => setTabValue(2)}
                                            >
                                                View
                                            </Button>
                                        </ListItem>
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Paper>
            )}
                
            {/* All Orders Tab */}
            <TabPanel value={tabValue} index={0}>
                {/* Filters and Search */}
                <Paper
                    elevation={theme === 'dark' ? 3 : 1}
                    sx={{
                        p: 3,
                        mb: 4,
                        bgcolor: colorValues.bgPaper,
                        borderRadius: 2
                    }}
                >
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder="Search orders..."
                                    value={search}
                                    onChange={handleSearchChange}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <FormControl fullWidth>
                                    <InputLabel id="status-filter-label">Status</InputLabel>
                                    <Select
                                        labelId="status-filter-label"
                                        value={filterStatus}
                                        onChange={handleStatusFilterChange}
                                        label="Status"
                                    >
                                        {statuses.map((status, index) => (
                                            <MenuItem key={index} value={status}>
                                                {status || 'All Statuses'}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <FormControl fullWidth>
                                    <InputLabel id="payment-status-filter-label">Payment</InputLabel>
                                    <Select
                                        labelId="payment-status-filter-label"
                                        value={filterPaymentStatus}
                                        onChange={handlePaymentStatusFilterChange}
                                        label="Payment"
                                    >
                                        {paymentStatuses.map((status, index) => (
                                            <MenuItem key={index} value={status}>
                                                {status || 'All Payment Statuses'}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <DatePicker
                                    label="From Date"
                                    value={startDate}
                                    onChange={setStartDate}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                    inputFormat="MM/dd/yyyy"
                                />
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <DatePicker
                                    label="To Date"
                                    value={endDate}
                                    onChange={setEndDate}
                                    renderInput={(params) => <TextField {...params} fullWidth />}
                                    inputFormat="MM/dd/yyyy"
                                />
                            </Grid>
                            <Grid item xs={12} md={1}>
                                <Button
                                    variant="outlined"
                                    startIcon={<ClearIcon />}
                                    onClick={handleClearFilters}
                                    fullWidth
                                    sx={{ height: '100%', minHeight: '56px' }}
                                >
                                    Clear
                                </Button>
                            </Grid>
                        </Grid>
                    </LocalizationProvider>
                </Paper>
                
                {/* Orders Table */}
                <Paper
                    elevation={theme === 'dark' ? 3 : 1}
                    sx={{
                        width: '100%',
                        overflow: 'hidden',
                        bgcolor: colorValues.bgPaper,
                        borderRadius: 2
                    }}
                >
                    <TableContainer>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox" />
                                    <TableCell>Order ID</TableCell>
                                    <TableCell>Customer</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell align="right">Total</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Payment</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredOrders
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((order) => (
                                        <React.Fragment key={order.id}>
                                            <TableRow hover>
                                                <TableCell padding="checkbox">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleExpandRow(order.id)}
                                                    >
                                                        {expandedOrderId === order.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                                    </IconButton>
                                                </TableCell>
                                                <TableCell>{order.id}</TableCell>
                                                <TableCell>
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                            {order.customer}
                                                        </Typography>
                                                        <Typography variant="caption" color="textSecondary">
                                                            {order.email}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{order.date}</TableCell>
                                                <TableCell align="right">${order.total.toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={order.status} 
                                                        size="small"
                                                        sx={{
                                                            bgcolor: 
                                                                order.status === 'Delivered' ? 'success.main' :
                                                                order.status === 'Shipped' ? 'info.main' :
                                                                order.status === 'Processing' ? 'warning.main' :
                                                                'error.main',
                                                            color: 'white'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={order.paymentStatus} 
                                                        size="small"
                                                        sx={{
                                                            bgcolor: 
                                                                order.paymentStatus === 'Paid' ? 'success.main' :
                                                                order.paymentStatus === 'Pending' ? 'warning.main' :
                                                                'primary.main',
                                                            color: 'white'
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Tooltip title="View Order">
                                                        <IconButton 
                                                            size="small" 
                                                            color="primary"
                                                            onClick={() => handleViewOrder(order)}
                                                        >
                                                            <VisibilityIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    {order.status === 'Processing' && (
                                                        <Tooltip title="Mark as Shipped">
                                                            <IconButton 
                                                                size="small" 
                                                                color="info"
                                                                onClick={() => handleOpenShippingLabel(order)}
                                                            >
                                                                <ShippingIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                    <Tooltip title="Download Invoice">
                                                        <IconButton size="small" color="default">
                                                            <InvoiceIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    {(order.status === 'Processing' || order.status === 'Shipped') && (
                                                        <Tooltip title="Cancel Order">
                                                            <IconButton 
                                                                size="small" 
                                                                color="error"
                                                                onClick={() => handleOpenActionDialog(order, 'cancel')}
                                                            >
                                                                <CancelIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell sx={{ py: 0 }} colSpan={8}>
                                                    <Collapse in={expandedOrderId === order.id} timeout="auto" unmountOnExit>
                                                        <Box sx={{ my: 2, px: 4 }}>
                                                            <Typography variant="h6" gutterBottom component="div">
                                                                Order Items
                                                            </Typography>
                                                            <Table size="small" aria-label="order items">
                                                                <TableHead>
                                                                    <TableRow>
                                                                        <TableCell>Product</TableCell>
                                                                        <TableCell align="right">Quantity</TableCell>
                                                                        <TableCell align="right">Price</TableCell>
                                                                        <TableCell align="right">Subtotal</TableCell>
                                                                    </TableRow>
                                                                </TableHead>
                                                                <TableBody>
                                                                    {order.items.map((item) => (
                                                                        <TableRow key={item.id}>
                                                                            <TableCell component="th" scope="row">
                                                                                {item.name}
                                                                            </TableCell>
                                                                            <TableCell align="right">{item.quantity}</TableCell>
                                                                            <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                                                                            <TableCell align="right">
                                                                                ${(item.price * item.quantity).toFixed(2)}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                    <TableRow>
                                                                        <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>
                                                                            Total:
                                                                        </TableCell>
                                                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                                                            ${order.total.toFixed(2)}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                </TableBody>
                                                            </Table>
                                                        </Box>
                                                    </Collapse>
                                                </TableCell>
                                            </TableRow>
                                        </React.Fragment>
                                    ))}
                                {filteredOrders.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">
                                            <Typography variant="body1" sx={{ py: 2 }}>
                                                No orders found
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        component="div"
                        count={filteredOrders.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
            </TabPanel>
            
            {/* Processing Orders Tab */}
            <TabPanel value={tabValue} index={1}>
                <Paper
                    elevation={theme === 'dark' ? 3 : 1}
                    sx={{
                        p: 3,
                        mb: 4,
                        bgcolor: colorValues.bgPaper,
                        borderRadius: 2
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6">Orders Awaiting Shipment</Typography>
                        {showBatchActions && (
                            <Box>
                                <Typography variant="body2" sx={{ mr: 2, display: 'inline' }}>
                                    {batchProcessingItems.length} orders selected
                                </Typography>
                                <ButtonGroup variant="outlined" size="small">
                                    <Button 
                                        startIcon={<ShippingIcon />}
                                        onClick={() => handleBatchProcess('ship')}
                                    >
                                        Mark as Shipped
                                    </Button>
                                    <Button 
                                        startIcon={<PrintIcon />}
                                        onClick={() => handleBatchProcess('print')}
                                    >
                                        Print Labels
                                    </Button>
                                </ButtonGroup>
                            </Box>
                        )}
                    </Box>
                    
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox">
                                        <Checkbox 
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setBatchProcessingItems(processingOrders.map(o => o.id));
                                                    setShowBatchActions(true);
                                                } else {
                                                    setBatchProcessingItems([]);
                                                    setShowBatchActions(false);
                                                }
                                            }}
                                            checked={batchProcessingItems.length === processingOrders.length && processingOrders.length > 0}
                                            indeterminate={batchProcessingItems.length > 0 && batchProcessingItems.length < processingOrders.length}
                                        />
                                    </TableCell>
                                    <TableCell>Order ID</TableCell>
                                    <TableCell>Customer</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell align="right">Total</TableCell>
                                    <TableCell>Items</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {processingOrders.map((order) => (
                                    <TableRow key={order.id} hover>
                                        <TableCell padding="checkbox">
                                            <Checkbox 
                                                checked={batchProcessingItems.indexOf(order.id) !== -1}
                                                onChange={() => handleBatchItemToggle(order.id)}
                                            />
                                        </TableCell>
                                        <TableCell>{order.id}</TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                    {order.customer}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    {order.email}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{order.date}</TableCell>
                                        <TableCell align="right">${order.total.toFixed(2)}</TableCell>
                                        <TableCell>{order.items.length} items</TableCell>
                                        <TableCell align="center">
                                            <ButtonGroup variant="outlined" size="small">
                                                <Button
                                                    startIcon={<VisibilityIcon />}
                                                    onClick={() => handleViewOrder(order)}
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    startIcon={<ShippingIcon />}
                                                    onClick={() => handleOpenShippingLabel(order)}
                                                >
                                                    Ship
                                                </Button>
                                                <Button
                                                    startIcon={<PrintIcon />}
                                                >
                                                    Label
                                                </Button>
                                            </ButtonGroup>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {processingOrders.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            <Typography variant="body1" sx={{ py: 2 }}>
                                                No orders awaiting shipment
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </TabPanel>
            
            {/* Pending Payment Tab */}
            <TabPanel value={tabValue} index={2}>
                <Paper
                    elevation={theme === 'dark' ? 3 : 1}
                    sx={{
                        p: 3,
                        mb: 4,
                        bgcolor: colorValues.bgPaper,
                        borderRadius: 2
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6">Pending Payments</Typography>
                        {batchProcessingItems.length > 0 && (
                            <Box>
                                <Typography variant="body2" sx={{ mr: 2, display: 'inline' }}>
                                    {batchProcessingItems.length} payments selected
                                </Typography>
                                <Button 
                                    variant="outlined" 
                                    size="small"
                                    startIcon={<CheckIcon />}
                                    onClick={() => handleBatchProcess('verify')}
                                >
                                    Verify Selected Payments
                                </Button>
                            </Box>
                        )}
                    </Box>
                    
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox">
                                        <Checkbox 
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setBatchProcessingItems(pendingPaymentOrders.map(o => o.id));
                                                } else {
                                                    setBatchProcessingItems([]);
                                                }
                                            }}
                                            checked={batchProcessingItems.length === pendingPaymentOrders.length && pendingPaymentOrders.length > 0}
                                            indeterminate={batchProcessingItems.length > 0 && batchProcessingItems.length < pendingPaymentOrders.length}
                                        />
                                    </TableCell>
                                    <TableCell>Order ID</TableCell>
                                    <TableCell>Customer</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pendingPaymentOrders.map((order) => (
                                    <TableRow key={order.id} hover>
                                        <TableCell padding="checkbox">
                                            <Checkbox 
                                                checked={batchProcessingItems.indexOf(order.id) !== -1}
                                                onChange={() => handleBatchItemToggle(order.id)}
                                            />
                                        </TableCell>
                                        <TableCell>{order.id}</TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                    {order.customer}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    {order.email}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{order.date}</TableCell>
                                        <TableCell align="right">${order.total.toFixed(2)}</TableCell>
                                        <TableCell align="center">
                                            <ButtonGroup variant="outlined" size="small">
                                                <Button
                                                    startIcon={<VisibilityIcon />}
                                                    onClick={() => handleViewOrder(order)}
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    startIcon={<CheckIcon />}
                                                    color="success"
                                                    onClick={() => handleOpenPaymentVerification(order)}
                                                >
                                                    Verify
                                                </Button>
                                                <Button
                                                    startIcon={<CancelIcon />}
                                                    color="error"
                                                    onClick={() => handleOpenActionDialog(order, 'cancel')}
                                                >
                                                    Cancel
                                                </Button>
                                            </ButtonGroup>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {pendingPaymentOrders.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            <Typography variant="body1" sx={{ py: 2 }}>
                                                No pending payments
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </TabPanel>
            
            {/* Returns & Refunds Tab */}
            <TabPanel value={tabValue} index={3}>
                <Paper
                    elevation={theme === 'dark' ? 3 : 1}
                    sx={{
                        p: 3,
                        mb: 4,
                        bgcolor: colorValues.bgPaper,
                        borderRadius: 2
                    }}
                >
                    <Typography variant="h6" gutterBottom>Returns & Refunds</Typography>
                    
                    <Box sx={{ mb: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card variant="outlined" sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
                                    <CardContent>
                                        <Typography variant="h5" gutterBottom>
                                            {returnsData.filter(r => r.status === 'Pending').length}
                                        </Typography>
                                        <Typography variant="body2">Pending Returns</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card variant="outlined" sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
                                    <CardContent>
                                        <Typography variant="h5" gutterBottom>
                                            {returnsData.filter(r => r.status === 'Completed').length}
                                        </Typography>
                                        <Typography variant="body2">Completed Returns</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card variant="outlined" sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                                    <CardContent>
                                        <Typography variant="h5" gutterBottom>
                                            {returnsData.filter(r => r.status === 'Approved').length}
                                        </Typography>
                                        <Typography variant="body2">Approved Returns</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card variant="outlined" sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
                                    <CardContent>
                                        <Typography variant="h5" gutterBottom>
                                            {returnsData.filter(r => r.status === 'Denied').length}
                                        </Typography>
                                        <Typography variant="body2">Denied Returns</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
                    
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Return ID</TableCell>
                                    <TableCell>Order ID</TableCell>
                                    <TableCell>Customer</TableCell>
                                    <TableCell>Date Requested</TableCell>
                                    <TableCell>Reason</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {returnsData.map((returnItem) => (
                                    <TableRow key={returnItem.id} hover>
                                        <TableCell>{returnItem.id}</TableCell>
                                        <TableCell>{returnItem.orderId}</TableCell>
                                        <TableCell>{returnItem.customer}</TableCell>
                                        <TableCell>{returnItem.dateRequested}</TableCell>
                                        <TableCell>{returnItem.reason}</TableCell>
                                        <TableCell align="right">${returnItem.total.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={returnItem.status} 
                                                color={getReturnStatusChipColor(returnItem.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <ButtonGroup variant="outlined" size="small">
                                                <Button
                                                    startIcon={<VisibilityIcon />}
                                                    onClick={() => handleViewReturn(returnItem)}
                                                >
                                                    View
                                                </Button>
                                                {returnItem.status === 'Pending' && (
                                                    <Button
                                                        startIcon={<CheckIcon />}
                                                        color="success"
                                                        onClick={() => handleApproveReturn(returnItem)}
                                                    >
                                                        Approve
                                                    </Button>
                                                )}
                                                {returnItem.status === 'Approved' && (
                                                    <Button
                                                        startIcon={<AttachMoneyIcon />}
                                                        color="primary"
                                                        onClick={() => handleRefundReturn(returnItem)}
                                                    >
                                                        Process Refund
                                                    </Button>
                                                )}
                                            </ButtonGroup>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {returnsData.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">
                                            <Typography variant="body1" sx={{ py: 2 }}>
                                                No returns found
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </TabPanel>
            
            {/* Order Issues Tab */}
            <TabPanel value={tabValue} index={4}>
                <Paper
                    elevation={theme === 'dark' ? 3 : 1}
                    sx={{
                        p: 3,
                        mb: 4,
                        bgcolor: colorValues.bgPaper,
                        borderRadius: 2
                    }}
                >
                    <Typography variant="h6" gutterBottom>Order Issues</Typography>
                    
                    <Box sx={{ mb: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={4}>
                                <Card variant="outlined" sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
                                    <CardContent>
                                        <Typography variant="h5" gutterBottom>
                                            {issuesData.filter(i => i.status === 'Open').length}
                                        </Typography>
                                        <Typography variant="body2">Open Issues</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Card variant="outlined" sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                                    <CardContent>
                                        <Typography variant="h5" gutterBottom>
                                            {issuesData.filter(i => i.status === 'In Progress').length}
                                        </Typography>
                                        <Typography variant="body2">In Progress</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Card variant="outlined" sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
                                    <CardContent>
                                        <Typography variant="h5" gutterBottom>
                                            {issuesData.filter(i => i.status === 'Resolved').length}
                                        </Typography>
                                        <Typography variant="body2">Resolved</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
                    
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Issue ID</TableCell>
                                    <TableCell>Order ID</TableCell>
                                    <TableCell>Customer</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Reported</TableCell>
                                    <TableCell>Priority</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {issuesData.map((issue) => (
                                    <TableRow key={issue.id} hover>
                                        <TableCell>{issue.id}</TableCell>
                                        <TableCell>{issue.orderId}</TableCell>
                                        <TableCell>{issue.customer}</TableCell>
                                        <TableCell>{issue.type}</TableCell>
                                        <TableCell>{issue.dateReported}</TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={issue.priority} 
                                                color={getIssuePriorityChipColor(issue.priority)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={issue.status} 
                                                color={getIssueStatusChipColor(issue.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <ButtonGroup variant="outlined" size="small">
                                                <Button
                                                    startIcon={<VisibilityIcon />}
                                                    onClick={() => handleViewIssue(issue)}
                                                >
                                                    View
                                                </Button>
                                                {issue.status !== 'Resolved' && (
                                                    <Button
                                                        startIcon={<ResolutionIcon />}
                                                        color="primary"
                                                        onClick={() => handleViewIssue(issue)}
                                                    >
                                                        Resolve
                                                    </Button>
                                                )}
                                            </ButtonGroup>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {issuesData.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">
                                            <Typography variant="body1" sx={{ py: 2 }}>
                                                No issues found
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </TabPanel>
            
            {/* View Order Dialog */}
            <Dialog
                open={viewOrderDialog}
                onClose={handleCloseViewDialog}
                maxWidth="md"
                fullWidth
            >
                {selectedOrder && (
                    <>
                        <DialogTitle>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6">
                                    Order {selectedOrder.id}
                                </Typography>
                                <Box>
                                    <Chip 
                                        label={selectedOrder.status} 
                                        sx={{
                                            mr: 1,
                                            bgcolor: 
                                                selectedOrder.status === 'Delivered' ? 'success.main' :
                                                selectedOrder.status === 'Shipped' ? 'info.main' :
                                                selectedOrder.status === 'Processing' ? 'warning.main' :
                                                'error.main',
                                            color: 'white'
                                        }}
                                    />
                                    <Chip 
                                        label={selectedOrder.paymentStatus} 
                                        sx={{
                                            bgcolor: 
                                                selectedOrder.paymentStatus === 'Paid' ? 'success.main' :
                                                selectedOrder.paymentStatus === 'Pending' ? 'warning.main' :
                                                'primary.main',
                                            color: 'white'
                                        }}
                                    />
                                </Box>
                            </Box>
                        </DialogTitle>
                        <DialogContent dividers>
                            <Tabs
                                value={detailsTabValue}
                                onChange={handleDetailsTabChange}
                                indicatorColor="primary"
                                textColor="primary"
                                sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
                            >
                                <Tab label="Order Details" />
                                <Tab label="Order History" />
                            </Tabs>

                            {/* Order Details Tab */}
                            {detailsTabValue === 0 && (
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Customer Information
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Name:</strong> {selectedOrder.customer}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Email:</strong> {selectedOrder.email}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Order Information
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Date:</strong> {selectedOrder.date}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Total:</strong> ${selectedOrder.total.toFixed(2)}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Status:</strong> {selectedOrder.status}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Payment:</strong> {selectedOrder.paymentStatus}
                                        </Typography>
                                    </Grid>
                                    
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Order Progress
                                        </Typography>
                                        <Stepper 
                                            activeStep={getOrderStep(selectedOrder.status)}
                                            sx={{ mb: 3 }}
                                        >
                                            <Step completed={getOrderStep(selectedOrder.status) >= 0}>
                                                <StepLabel>Processing</StepLabel>
                                            </Step>
                                            <Step completed={getOrderStep(selectedOrder.status) >= 1}>
                                                <StepLabel>Shipped</StepLabel>
                                            </Step>
                                            <Step completed={getOrderStep(selectedOrder.status) >= 2}>
                                                <StepLabel>Delivered</StepLabel>
                                            </Step>
                                        </Stepper>
                                        
                                        {selectedOrder.status === 'Cancelled' && (
                                            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                                                This order was cancelled.
                                            </Typography>
                                        )}
                                    </Grid>
                                    
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Order Items
                                        </Typography>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Product</TableCell>
                                                    <TableCell align="right">Quantity</TableCell>
                                                    <TableCell align="right">Price</TableCell>
                                                    <TableCell align="right">Subtotal</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {selectedOrder.items.map((item) => (
                                                    <TableRow key={item.id}>
                                                        <TableCell>{item.name}</TableCell>
                                                        <TableCell align="right">{item.quantity}</TableCell>
                                                        <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                                                        <TableCell align="right">
                                                            ${(item.price * item.quantity).toFixed(2)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                <TableRow>
                                                    <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>
                                                        Total:
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                                        ${selectedOrder.total.toFixed(2)}
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </Grid>
                                </Grid>
                            )}

                            {/* Order History Tab */}
                            {detailsTabValue === 1 && (
                                <Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="subtitle1">Order Timeline</Typography>
                                        <Button 
                                            startIcon={<AddIcon />} 
                                            variant="outlined" 
                                            size="small"
                                            onClick={handleAddOrderNote}
                                        >
                                            Add Note
                                        </Button>
                                    </Box>
                                    <Timeline position="alternate">
                                        {orderHistory.map((event) => (
                                            <TimelineItem key={event.id}>
                                                <TimelineOppositeContent color="text.secondary">
                                                    {new Date(event.date).toLocaleString()}
                                                </TimelineOppositeContent>
                                                <TimelineSeparator>
                                                    <TimelineDot 
                                                        color={
                                                            event.status === 'Order Placed' ? 'success' :
                                                            event.status === 'Payment Received' ? 'primary' :
                                                            event.status === 'Processing' ? 'warning' :
                                                            event.status === 'Shipped' ? 'info' :
                                                            event.status === 'Delivered' ? 'success' :
                                                            event.status === 'Cancelled' ? 'error' :
                                                            'grey'
                                                        }
                                                    >
                                                        {event.status === 'Note Added' ? <ChatIcon /> : <HistoryIcon />}
                                                    </TimelineDot>
                                                    {event.id !== orderHistory.length && <TimelineConnector />}
                                                </TimelineSeparator>
                                                <TimelineContent>
                                                    <Typography variant="subtitle2">{event.status}</Typography>
                                                    <Typography variant="body2">{event.note}</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        By: {event.user}
                                                    </Typography>
                                                </TimelineContent>
                                            </TimelineItem>
                                        ))}
                                    </Timeline>
                                </Box>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseViewDialog}>Close</Button>
                            {selectedOrder.status === 'Processing' && (
                                <Button 
                                    color="primary" 
                                    variant="contained"
                                    onClick={() => {
                                        handleCloseViewDialog();
                                        handleOpenActionDialog(selectedOrder, 'ship');
                                    }}
                                >
                                    Mark as Shipped
                                </Button>
                            )}
                            {(selectedOrder.status === 'Processing' || selectedOrder.status === 'Shipped') && (
                                <Button 
                                    color="error" 
                                    variant="contained"
                                    onClick={() => {
                                        handleCloseViewDialog();
                                        handleOpenActionDialog(selectedOrder, 'cancel');
                                    }}
                                >
                                    Cancel Order
                                </Button>
                            )}
                        </DialogActions>
                    </>
                )}
            </Dialog>
            
            {/* Action Confirmation Dialog */}
            <Dialog
                open={actionDialogOpen}
                onClose={handleCloseActionDialog}
            >
                <DialogTitle>
                    {dialogContent.title}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {dialogContent.content}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseActionDialog}>Cancel</Button>
                    <Button 
                        onClick={handlePerformAction} 
                        color={dialogContent.confirmColor}
                        variant="contained"
                    >
                        {dialogContent.confirmText}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add Note Dialog */}
            <Dialog
                open={noteDialogOpen}
                onClose={handleCloseNoteDialog}
            >
                <DialogTitle>
                    Add Note to Order
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Add a note to the order history for {selectedOrder?.id}
                    </DialogContentText>
                    <TextField
                        autoFocus
                        multiline
                        rows={4}
                        fullWidth
                        label="Note"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseNoteDialog}>Cancel</Button>
                    <Button 
                        onClick={handleSaveNote} 
                        color="primary"
                        variant="contained"
                        disabled={!newNote.trim()}
                    >
                        Add Note
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Payment Verification Dialog */}
            <Dialog
                open={verifyPaymentDialog}
                onClose={handleClosePaymentVerification}
                maxWidth="md"
                fullWidth
            >
                {selectedOrder && (
                    <>
                        <DialogTitle>
                            Verify Payment for Order {selectedOrder.id}
                        </DialogTitle>
                        <DialogContent dividers>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Payment Information
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Order ID:</strong> {selectedOrder.id}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Customer:</strong> {selectedOrder.customer}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Amount:</strong> ${selectedOrder.total.toFixed(2)}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Date:</strong> {selectedOrder.date}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Payment Method
                                    </Typography>
                                    <RadioGroup
                                        value={selectedPaymentMethod}
                                        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                    >
                                        <FormControlLabel 
                                            value="creditCard" 
                                            control={<Radio />} 
                                            label={
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <CreditCardIcon sx={{ mr: 1 }} />
                                                    <span>Credit Card</span>
                                                </Box>
                                            } 
                                        />
                                        <FormControlLabel 
                                            value="bankTransfer" 
                                            control={<Radio />} 
                                            label={
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <AttachMoneyIcon sx={{ mr: 1 }} />
                                                    <span>Bank Transfer</span>
                                                </Box>
                                            } 
                                        />
                                        <FormControlLabel 
                                            value="paypal" 
                                            control={<Radio />} 
                                            label={
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <PaymentIcon sx={{ mr: 1 }} />
                                                    <span>PayPal</span>
                                                </Box>
                                            } 
                                        />
                                    </RadioGroup>
                                </Grid>
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle1" gutterBottom>
                                        Reconciliation Notes
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={4}
                                        placeholder="Add payment verification notes"
                                        value={reconciliationNote}
                                        onChange={(e) => setReconciliationNote(e.target.value)}
                                    />
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClosePaymentVerification}>Cancel</Button>
                            <Button 
                                onClick={handleVerifyPayment} 
                                variant="contained" 
                                color="success"
                                startIcon={<VerifiedUserIcon />}
                            >
                                Verify Payment
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
            
            {/* Shipping Label Dialog */}
            <Dialog
                open={shippingLabelDialog}
                onClose={handleCloseShippingLabel}
                maxWidth="md"
                fullWidth
            >
                {selectedOrder && (
                    <>
                        <DialogTitle>
                            Generate Shipping Label for Order {selectedOrder.id}
                        </DialogTitle>
                        <DialogContent dividers>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Shipping Information
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Order ID:</strong> {selectedOrder.id}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Customer:</strong> {selectedOrder.customer}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Items:</strong> {selectedOrder.items.length} items
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Date:</strong> {selectedOrder.date}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Shipping Carrier
                                    </Typography>
                                    <RadioGroup
                                        value={selectedShippingCarrier}
                                        onChange={handleCarrierChange}
                                    >
                                        {shippingCarriers.map((carrier) => (
                                            <FormControlLabel 
                                                key={carrier.value}
                                                value={carrier.value} 
                                                control={<Radio />} 
                                                label={carrier.label} 
                                            />
                                        ))}
                                    </RadioGroup>
                                </Grid>
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Button
                                        variant="outlined"
                                        onClick={handleShippingDetailsToggle}
                                        endIcon={shippingDetailsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                        sx={{ mb: 2 }}
                                    >
                                        {shippingDetailsExpanded ? 'Hide Shipping Details' : 'Show Shipping Details'}
                                    </Button>
                                    <Collapse in={shippingDetailsExpanded}>
                                        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                                            <Typography variant="subtitle2" gutterBottom>
                                                Shipping Address
                                            </Typography>
                                            <Typography variant="body2">
                                                {selectedOrder.customer}
                                            </Typography>
                                            <Typography variant="body2">
                                                123 Main Street
                                            </Typography>
                                            <Typography variant="body2">
                                                Apt 4B
                                            </Typography>
                                            <Typography variant="body2">
                                                New York, NY 10001
                                            </Typography>
                                            <Typography variant="body2">
                                                United States
                                            </Typography>
                                        </Paper>
                                    </Collapse>
                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle2" gutterBottom>
                                                    Tracking Information
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} md={8}>
                                                <TextField
                                                    fullWidth
                                                    label="Tracking Number"
                                                    value={trackingNumber}
                                                    onChange={(e) => {
                                                        setTrackingNumber(e.target.value);
                                                        setTrackingUrl(getTrackingUrl(selectedShippingCarrier, e.target.value));
                                                    }}
                                                    InputProps={{
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                <IconButton onClick={() => copyToClipboard(trackingNumber)}>
                                                                    <CopyIcon fontSize="small" />
                                                                </IconButton>
                                                            </InputAdornment>
                                                        )
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={4}>
                                                <Button 
                                                    fullWidth 
                                                    variant="outlined"
                                                    startIcon={<QrCodeIcon />}
                                                    disabled={!trackingNumber}
                                                >
                                                    Show QR Code
                                                </Button>
                                            </Grid>
                                            <Grid item xs={12}>
                                                {trackingUrl && (
                                                    <Button
                                                        variant="text"
                                                        color="primary"
                                                        startIcon={<TrackingIcon />}
                                                        component="a"
                                                        href={trackingUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        Track Package
                                                    </Button>
                                                )}
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseShippingLabel}>Cancel</Button>
                            <Button 
                                onClick={handleGenerateShippingLabel} 
                                variant="contained" 
                                color="primary"
                                startIcon={<LocalPrintshopIcon />}
                            >
                                Generate Label & Ship
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
            
            {/* Return Detail Dialog */}
            <Dialog
                open={returnDialogOpen}
                onClose={handleCloseReturnDialog}
                maxWidth="md"
                fullWidth
            >
                {selectedReturn && (
                    <>
                        <DialogTitle>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6">
                                    Return {selectedReturn.id}
                                </Typography>
                                <Chip 
                                    label={selectedReturn.status} 
                                    color={getReturnStatusChipColor(selectedReturn.status)}
                                />
                            </Box>
                        </DialogTitle>
                        <DialogContent dividers>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Return Information
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Order ID:</strong> {selectedReturn.orderId}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Customer:</strong> {selectedReturn.customer}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Date Requested:</strong> {selectedReturn.dateRequested}
                                    </Typography>
                                    {selectedReturn.dateProcessed && (
                                        <Typography variant="body2">
                                            <strong>Date Processed:</strong> {selectedReturn.dateProcessed}
                                        </Typography>
                                    )}
                                    <Typography variant="body2">
                                        <strong>Reason:</strong> {selectedReturn.reason}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Financial Summary
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Items Total:</strong> ${selectedReturn.total.toFixed(2)}
                                    </Typography>
                                    {selectedReturn.refundAmount && (
                                        <Typography variant="body2">
                                            <strong>Refund Amount:</strong> ${selectedReturn.refundAmount.toFixed(2)}
                                        </Typography>
                                    )}
                                </Grid>
                                
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Return Items
                                    </Typography>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Product</TableCell>
                                                <TableCell align="right">Quantity</TableCell>
                                                <TableCell align="right">Price</TableCell>
                                                <TableCell align="right">Subtotal</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {selectedReturn.items.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>{item.name}</TableCell>
                                                    <TableCell align="right">{item.quantity}</TableCell>
                                                    <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                                                    <TableCell align="right">
                                                        ${(item.price * item.quantity).toFixed(2)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow>
                                                <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>
                                                    Total:
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                                    ${selectedReturn.total.toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </Grid>
                                
                                {selectedReturn.status === 'Pending' && (
                                    <Grid item xs={12}>
                                        <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: 'background.default' }}>
                                            <Typography variant="subtitle2" gutterBottom>
                                                Return Approval Decision
                                            </Typography>
                                            <Typography variant="body2" paragraph>
                                                Please review the return request and decide whether to approve or deny it.
                                            </Typography>
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    onClick={() => handleDenyReturn(selectedReturn)}
                                                >
                                                    Deny Return
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    onClick={() => handleApproveReturn(selectedReturn)}
                                                >
                                                    Approve Return
                                                </Button>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                )}
                                
                                {selectedReturn.status === 'Approved' && (
                                    <Grid item xs={12}>
                                        <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: 'background.default' }}>
                                            <Typography variant="subtitle2" gutterBottom>
                                                Process Refund
                                            </Typography>
                                            <Typography variant="body2" paragraph>
                                                Return has been approved. Process the refund when items have been received.
                                            </Typography>
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={() => handleRefundReturn(selectedReturn)}
                                                    startIcon={<RefundIcon />}
                                                >
                                                    Process Refund
                                                </Button>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                )}
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseReturnDialog}>Close</Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
            
            {/* Issue Detail Dialog */}
            <Dialog
                open={issueDialogOpen}
                onClose={handleCloseIssueDialog}
                maxWidth="md"
                fullWidth
            >
                {selectedIssue && (
                    <>
                        <DialogTitle>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6">
                                    Issue {selectedIssue.id}
                                </Typography>
                                <Chip 
                                    label={selectedIssue.status} 
                                    color={getIssueStatusChipColor(selectedIssue.status)}
                                />
                            </Box>
                        </DialogTitle>
                        <DialogContent dividers>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Issue Information
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Order ID:</strong> {selectedIssue.orderId}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Customer:</strong> {selectedIssue.customer}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Type:</strong> {selectedIssue.type}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Priority:</strong> {selectedIssue.priority}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Date Reported:</strong> {selectedIssue.dateReported}
                                    </Typography>
                                    {selectedIssue.dateResolved && (
                                        <Typography variant="body2">
                                            <strong>Date Resolved:</strong> {selectedIssue.dateResolved}
                                        </Typography>
                                    )}
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Card variant="outlined" sx={{ height: '100%' }}>
                                        <CardContent>
                                            <Typography variant="subtitle1" gutterBottom>
                                                Issue Description
                                            </Typography>
                                            <Typography variant="body2">
                                                {selectedIssue.description}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle1" gutterBottom>
                                        Resolution Process
                                    </Typography>
                                    
                                    <FormControl fullWidth sx={{ mb: 2 }}>
                                        <InputLabel id="issue-status-label">Status</InputLabel>
                                        <Select
                                            labelId="issue-status-label"
                                            value={issueStatus}
                                            onChange={(e) => setIssueStatus(e.target.value)}
                                            label="Status"
                                            disabled={selectedIssue.status === 'Resolved'}
                                        >
                                            <MenuItem value="Open">Open</MenuItem>
                                            <MenuItem value="In Progress">In Progress</MenuItem>
                                            <MenuItem value="Resolved">Resolved</MenuItem>
                                        </Select>
                                    </FormControl>
                                    
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={4}
                                        label="Resolution Notes"
                                        value={issueResolutionNote}
                                        onChange={(e) => setIssueResolutionNote(e.target.value)}
                                        placeholder="Enter details about how this issue was resolved or next steps"
                                        disabled={selectedIssue.status === 'Resolved'}
                                        sx={{ mb: 2 }}
                                    />
                                    
                                    {selectedIssue.status === 'Resolved' && selectedIssue.resolution && (
                                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
                                            <Typography variant="subtitle2" gutterBottom>
                                                Resolution Details
                                            </Typography>
                                            <Typography variant="body2">
                                                {selectedIssue.resolution}
                                            </Typography>
                                        </Paper>
                                    )}
                                </Grid>
                                
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                        <Button
                                            startIcon={<SupportIcon />}
                                            variant="outlined"
                                        >
                                            Contact Customer
                                        </Button>
                                        
                                        {selectedIssue.status !== 'Resolved' && (
                                            <Button
                                                startIcon={<ReturnIcon />}
                                                variant="outlined"
                                                color="primary"
                                            >
                                                Create Return
                                            </Button>
                                        )}
                                    </Box>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseIssueDialog}>Cancel</Button>
                            {selectedIssue.status !== 'Resolved' && (
                                <Button 
                                    onClick={handleResolveIssue} 
                                    variant="contained" 
                                    color="primary"
                                    disabled={!issueResolutionNote.trim() && issueStatus === 'Resolved'}
                                >
                                    Save Changes
                                </Button>
                            )}
                        </DialogActions>
                    </>
                )}
            </Dialog>
            
            {/* Refund Dialog */}
            <Dialog
                open={refundDialogOpen}
                onClose={handleCloseRefundDialog}
            >
                <DialogTitle>
                    Process Refund for {selectedReturn?.id}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Enter the refund amount and reason for the return.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Refund Amount"
                        type="number"
                        fullWidth
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(e.target.value)}
                        sx={{ mb: 2 }}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                    />
                    <TextField
                        margin="dense"
                        label="Refund Reason"
                        type="text"
                        fullWidth
                        multiline
                        rows={3}
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseRefundDialog}>Cancel</Button>
                    <Button 
                        onClick={handleProcessRefund} 
                        color="primary"
                        variant="contained"
                    >
                        Process Refund
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert 
                    onClose={handleSnackbarClose} 
                    severity={snackbar.severity}
                    variant="filled"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default AdminOrders;
