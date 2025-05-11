import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, 
  Chip, Alert, Card, CardHeader, CardContent, 
  Button, IconButton, Badge, Divider, Tabs, Tab, 
  List, ListItem, ListItemText, ListItemAvatar, 
  Avatar, ListItemSecondaryAction, Tooltip
} from '@mui/material';
import { 
  Notifications as NotificationsIcon,
  Warning as WarningIcon, 
  Inventory as InventoryIcon,
  HistoryToggleOff as HistoryIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  AssignmentReturn as ReturnIcon,
  RemoveCircle as RemoveIcon,
  Archive as ArchiveIcon
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import { useTheme } from '@mui/material/styles';
import { stockMovements, lowStockAlerts, stockSettings } from '../../../data/mockInventoryData';
import StockAdjustmentTool from '../components/StockAdjustmentTool';
import AddStockForm from '../components/AddStockForm';
import ProcessReturnForm from '../components/ProcessReturnForm';
import AuditLog from '../components/AuditLog';

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`inventory-tabpanel-${index}`}
      aria-labelledby={`inventory-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Inventory page component
const Inventory = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false);
  const [addStockDialogOpen, setAddStockDialogOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [auditLogOpen, setAuditLogOpen] = useState(false);

  // Load initial data
  useEffect(() => {
    // In a real app, this would fetch from an API
    setAlerts(lowStockAlerts);
    setMovements(stockMovements);
    
    // Count unresolved alerts
    setNotificationCount(lowStockAlerts.filter(alert => !alert.resolved).length);
    
    // Set up real-time updates (simulated)
    const interval = setInterval(() => {
      // Simulate receiving a new alert
      if (Math.random() > 0.95) {
        const newAlert = {
          id: `LSA-${Math.floor(Math.random() * 1000)}`,
          productId: Math.floor(Math.random() * 10) + 1,
          productName: `Sample Product ${Math.floor(Math.random() * 10) + 1}`,
          currentStock: Math.floor(Math.random() * 5),
          threshold: 10,
          status: 'active',
          createdAt: new Date().toISOString().slice(0, 10),
          resolved: false
        };
        
        setAlerts(prev => [newAlert, ...prev]);
        setNotificationCount(prev => prev + 1);
        
        // Show notification
        toast.custom((t) => (
          <Alert 
            severity="warning" 
            onClose={() => toast.dismiss(t.id)}
            sx={{ width: '100%' }}
          >
            Low stock alert: {newAlert.productName} ({newAlert.currentStock} remaining)
          </Alert>
        ));
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const markAlertResolved = (alertId) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { 
              ...alert, 
              resolved: true, 
              resolvedAt: new Date().toISOString().slice(0, 10),
              resolvedBy: 'Current User'
            } 
          : alert
      )
    );
    setNotificationCount(prev => Math.max(0, prev - 1));
    toast.success("Alert marked as resolved");
  };

  const orderProduct = (productName) => {
    toast.success(`Reorder request sent for ${productName}`);
  };

  const openAdjustmentDialog = () => {
    setAdjustmentDialogOpen(true);
  };

  const closeAdjustmentDialog = () => {
    setAdjustmentDialogOpen(false);
  };

  const handleAdjustmentSave = (adjustment) => {
    // In a real app, this would update the database
    // For now, we'll just update our local state
    setMovements(prev => [adjustment, ...prev]);
    // Close the dialog
    setAdjustmentDialogOpen(false);
  };

  // Add these new handlers for the add stock form
  const openAddStockDialog = () => {
    setAddStockDialogOpen(true);
  };

  const closeAddStockDialog = () => {
    setAddStockDialogOpen(false);
  };

  const handleAddStockSave = (stockMovement) => {
    // In a real app, this would update the database
    // For now, we'll just update our local state
    setMovements(prev => [stockMovement, ...prev]);
    // Close the dialog
    setAddStockDialogOpen(false);
  };

  // Add these new handlers for the returns form
  const openReturnDialog = () => {
    setReturnDialogOpen(true);
  };

  const closeReturnDialog = () => {
    setReturnDialogOpen(false);
  };

  const handleReturnSave = (returnMovement) => {
    // In a real app, this would update the database
    // For now, we'll just update our local state
    setMovements(prev => [returnMovement, ...prev]);
    // Close the dialog
    setReturnDialogOpen(false);
  };

  const openAuditLog = () => {
    setAuditLogOpen(true);
  };

  const closeAuditLog = () => {
    setAuditLogOpen(false);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return theme.palette.warning.main;
      case 'critical': return theme.palette.error.main;
      case 'outOfStock': return theme.palette.error.dark;
      default: return theme.palette.grey[500];
    }
  };

  // Render alerts section
  const renderAlerts = () => (
    <Card variant="outlined" sx={{ mb: 4 }}>
      <CardHeader 
        title={
          <Box display="flex" alignItems="center">
            <Badge badgeContent={notificationCount} color="error" sx={{ mr: 2 }}>
              <NotificationsIcon />
            </Badge>
            <Typography variant="h6">Low Stock Alerts</Typography>
          </Box>
        }
        action={
          <Tooltip title="Configure alert settings">
            <IconButton aria-label="settings">
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        }
      />
      <CardContent>
        <List>
          {alerts
            .filter(alert => !alert.resolved)
            .map(alert => (
              <ListItem 
                key={alert.id}
                secondaryAction={
                  <Box>
                    <Button 
                      size="small" 
                      variant="contained" 
                      sx={{ mr: 1 }}
                      onClick={() => orderProduct(alert.productName)}
                    >
                      Order
                    </Button>
                    <Button 
                      size="small" 
                      variant="outlined"
                      onClick={() => markAlertResolved(alert.id)}
                    >
                      Resolve
                    </Button>
                  </Box>
                }
                sx={{ 
                  mb: 1, 
                  bgcolor: alpha(getStatusColor(alert.status), 0.1), 
                  borderLeft: `4px solid ${getStatusColor(alert.status)}`,
                  borderRadius: 1
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: getStatusColor(alert.status) }}>
                    <WarningIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={alert.productName}
                  secondary={
                    <>
                      <Typography component="span" variant="body2">
                        Current Stock: <strong>{alert.currentStock}</strong> (Threshold: {alert.threshold})
                      </Typography>
                      <br />
                      <Typography component="span" variant="caption" color="textSecondary">
                        {alert.createdAt}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          {alerts.filter(alert => !alert.resolved).length === 0 && (
            <Alert severity="success">No active alerts - stock levels are healthy!</Alert>
          )}
        </List>
      </CardContent>
    </Card>
  );

  // Render stock movement history
  const renderStockMovements = () => (
    <Card variant="outlined">
      <CardHeader 
        title={
          <Box display="flex" alignItems="center">
            <HistoryIcon sx={{ mr: 2 }} />
            <Typography variant="h6">Recent Stock Movements</Typography>
          </Box>
        }
      />
      <CardContent>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell>User</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {movements.slice(0, 8).map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>{movement.date}</TableCell>
                  <TableCell>{movement.productName}</TableCell>
                  <TableCell>
                    <Chip 
                      label={movement.type} 
                      size="small"
                      color={
                        movement.type === 'purchase' || movement.type === 'return' 
                          ? 'success' 
                          : movement.type === 'sale' 
                          ? 'primary'
                          : 'default'
                      }
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right" sx={{
                    color: movement.quantity > 0 ? 'success.main' : 'error.main',
                    fontWeight: 'bold'
                  }}>
                    {movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity}
                  </TableCell>
                  <TableCell>{movement.user}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  // Helper function to get alpha color with transparency
  const alpha = (color, opacity) => {
    return theme.palette.mode === 'light' 
      ? `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, ${opacity})`
      : color;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Inventory Management
        </Typography>
        <Box>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            sx={{ mr: 1 }}
            onClick={openAddStockDialog}
          >
            Add Stock
          </Button>
          <Button 
            variant="outlined"
            startIcon={<ReturnIcon />}
            sx={{ mr: 1 }}
            onClick={openReturnDialog}
          >
            Process Return
          </Button>
          <Button 
            variant="outlined"
            startIcon={<RemoveIcon />}
            color="secondary"
            sx={{ mr: 1 }}
            onClick={openAdjustmentDialog}
          >
            Adjust Stock
          </Button>
          <Button 
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={openAuditLog}
          >
            Audit Log
          </Button>
        </Box>
      </Box>
      
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tab icon={<NotificationsIcon />} label="Alerts" iconPosition="start" />
        <Tab icon={<HistoryIcon />} label="Stock History" iconPosition="start" />
        <Tab icon={<SettingsIcon />} label="Settings" iconPosition="start" />
      </Tabs>
      
      <TabPanel value={tabValue} index={0}>
        {renderAlerts()}
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Critical Items" />
              <CardContent>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell align="right">Stock</TableCell>
                        <TableCell align="right">Threshold</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {alerts
                        .filter(alert => ['critical', 'outOfStock'].includes(alert.status))
                        .slice(0, 5)
                        .map(item => (
                          <TableRow key={item.id}>
                            <TableCell>{item.productName}</TableCell>
                            <TableCell align="right">{item.currentStock}</TableCell>
                            <TableCell align="right">{item.threshold}</TableCell>
                            <TableCell>
                              <Chip 
                                label={item.status === 'outOfStock' ? 'Out of Stock' : 'Critical'} 
                                color="error" 
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Notification Settings" />
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Low Stock Threshold" 
                      secondary={`Alert when stock falls below ${stockSettings.lowStockThreshold} units`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Critical Stock Threshold" 
                      secondary={`Mark as critical when below ${stockSettings.criticalStockThreshold} units`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Auto-Order Threshold" 
                      secondary={`Automatically create order when below ${stockSettings.autoOrderThreshold} units`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Email Notifications" 
                      secondary={stockSettings.notificationRecipients.join(', ')} 
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        {renderStockMovements()}
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardHeader title="Inventory Settings" />
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Configure how stock alerts and notifications work
            </Typography>
            
            <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
              This feature allows you to set automated notifications when products fall below specified thresholds
            </Alert>
            
            <Divider sx={{ my: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Thresholds
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Low Stock Threshold" secondary="When to show warning" />
                    <Typography>{stockSettings.lowStockThreshold} units</Typography>
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Critical Stock" secondary="When to alert as critical" />
                    <Typography>{stockSettings.criticalStockThreshold} units</Typography>
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Auto-Order" secondary="When to create purchase order" />
                    <Typography>{stockSettings.autoOrderThreshold} units</Typography>
                  </ListItem>
                </List>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Notification Settings
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText primary="Auto-Notifications" />
                    <Chip label={stockSettings.autoNotify ? "Enabled" : "Disabled"} 
                          color={stockSettings.autoNotify ? "success" : "default"} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Auto-Order" />
                    <Chip label={stockSettings.autoOrder.enabled ? "Enabled" : "Disabled"} 
                          color={stockSettings.autoOrder.enabled ? "success" : "default"} />
                  </ListItem>
                  <ListItem>
                    <ListItemText primary="Approval Required" secondary="For auto-generated orders" />
                    <Chip label={stockSettings.autoOrder.approvalRequired ? "Yes" : "No"} />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>
      
      {/* Add all dialogs */}
      <StockAdjustmentTool 
        open={adjustmentDialogOpen}
        onClose={closeAdjustmentDialog}
        onSave={handleAdjustmentSave}
      />
      
      <AddStockForm
        open={addStockDialogOpen}
        onClose={closeAddStockDialog}
        onSave={handleAddStockSave}
      />
      
      <ProcessReturnForm
        open={returnDialogOpen}
        onClose={closeReturnDialog}
        onSave={handleReturnSave}
      />
      
      <AuditLog
        open={auditLogOpen}
        onClose={closeAuditLog}
      />
    </Box>
  );
};

export default Inventory;
