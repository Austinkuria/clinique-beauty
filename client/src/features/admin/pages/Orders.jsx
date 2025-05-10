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
    StepLabel
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
    DateRange as DateRangeIcon
} from '@mui/icons-material';
import { ThemeContext } from '../../../context/ThemeContext';
import { useApi } from '../../../api/apiClient';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import OrderFulfillmentChart from '../components/charts/OrderFulfillmentChart';
import { mockDashboardData } from '../../../data/mockDashboardData';
// Import the mock orders data
import { mockOrders } from '../../../data/mockOrdersData';

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
        setViewOrderDialog(true);
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
        
        const actionText = actionType === 'ship' ? 'shipped' : 
                          actionType === 'cancel' ? 'cancelled' : '';
        toast.success(`Order ${selectedOrder.id} has been ${actionText}.`);
        
        handleCloseActionDialog();
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
            
            {/* Add Order Fulfillment Overview */}
            {fulfillmentData && (
                <Paper
                    elevation={theme === 'dark' ? 3 : 1}
                    sx={{
                        p: 3,
                        mb: 4,
                        bgcolor: colorValues.bgPaper,
                        borderRadius: 2
                    }}
                >
                    <Typography variant="h6" sx={{ mb: 2 }}>Order Fulfillment Overview</Typography>
                    <OrderFulfillmentChart fulfillmentData={fulfillmentData} />
                </Paper>
            )}
            
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
                                                            onClick={() => handleOpenActionDialog(order, 'ship')}
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
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredOrders.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
            
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
                            Order {selectedOrder.id}
                        </DialogTitle>
                        <DialogContent dividers>
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
        </Box>
    );
}

export default AdminOrders;
