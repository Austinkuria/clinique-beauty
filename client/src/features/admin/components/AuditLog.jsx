import React, { useState } from 'react';
import {
  Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Grid, Chip, FormControl, InputLabel, Select, MenuItem, TextField,
  Card, CardHeader, CardContent, Divider, IconButton, Tooltip
} from '@mui/material';
import { 
  History as HistoryIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  GetApp as ExportIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { STOCK_MOVEMENT_TYPES } from '../../../data/mockInventoryData';
import { format, subDays } from 'date-fns';

// Generate more comprehensive audit log data
const generateAuditLogData = (days = 30) => {
  const logs = [];
  const users = ['David Mutua', 'Njeri Mwangi', 'James Kamau', 'Faith Mwende', 'System'];
  const products = [
    'Moisturizing Cream', 'Anti-Aging Serum', 'Citrus Perfume', 'Hair Repair Mask', 
    'Shower Gel', 'Day Cream SPF 30', 'Body Butter', 'Face Mask', 'Night Repair Serum'
  ];
  const actions = [
    { type: 'inventory.add', label: 'Added Inventory' },
    { type: 'inventory.remove', label: 'Removed Inventory' },
    { type: 'inventory.adjust', label: 'Adjusted Inventory' },
    { type: 'inventory.return', label: 'Processed Return' },
    { type: 'order.create', label: 'Created Order' },
    { type: 'order.approve', label: 'Approved Order' },
    { type: 'supplier.add', label: 'Added Supplier' },
    { type: 'supplier.update', label: 'Updated Supplier' },
    { type: 'settings.update', label: 'Updated Settings' }
  ];
  
  for (let i = 0; i < 50; i++) {
    const date = subDays(new Date(), Math.floor(Math.random() * days));
    const user = users[Math.floor(Math.random() * users.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const product = action.type.startsWith('inventory') ? 
      products[Math.floor(Math.random() * products.length)] : null;
    const quantity = action.type.startsWith('inventory') ? 
      Math.floor(Math.random() * 50) * (Math.random() > 0.3 ? 1 : -1) : null;
    
    let details = {};
    if (action.type.startsWith('inventory')) {
      details = {
        product,
        quantity,
        reason: action.type === 'inventory.adjust' ? 'Inventory count adjustment' : 
                action.type === 'inventory.return' ? 'Customer return' : null
      };
    } else if (action.type.startsWith('order')) {
      details = {
        orderNumber: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
        supplier: ['Kenya Cosmetics Ltd.', 'Nairobi Fragrances', 'Skin Protectors Ltd', 'Hair Care Kenya'][Math.floor(Math.random() * 4)],
        items: Math.floor(Math.random() * 10) + 1
      };
    } else if (action.type.startsWith('supplier')) {
      details = {
        supplier: ['Kenya Cosmetics Ltd.', 'Nairobi Fragrances', 'Skin Protectors Ltd', 'Hair Care Kenya'][Math.floor(Math.random() * 4)],
        contact: action.type === 'supplier.add' ? 'New contact added' : 'Contact details updated'
      };
    } else if (action.type === 'settings.update') {
      details = {
        setting: ['Thresholds', 'Email Notifications', 'Auto-Order Settings'][Math.floor(Math.random() * 3)]
      };
    }
    
    logs.push({
      id: `LOG-${i+1000}`,
      timestamp: format(date, 'yyyy-MM-dd HH:mm:ss'),
      user,
      actionType: action.type,
      actionLabel: action.label,
      details,
      ip: `192.168.1.${Math.floor(Math.random() * 255)}`
    });
  }
  
  // Sort by timestamp (most recent first)
  return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

const AuditLog = ({ open, onClose }) => {
  const [logs, setLogs] = useState(generateAuditLogData());
  const [filteredLogs, setFilteredLogs] = useState(logs);
  const [filterUser, setFilterUser] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState(null);
  const [filterDateTo, setFilterDateTo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get unique users for filter
  const uniqueUsers = [...new Set(logs.map(log => log.user))];
  
  // Get unique action types for filter
  const uniqueActions = [...new Set(logs.map(log => log.actionType))].map(actionType => {
    return {
      type: actionType,
      label: logs.find(log => log.actionType === actionType)?.actionLabel
    };
  });
  
  // Apply filters
  const applyFilters = () => {
    let filtered = [...logs];
    
    // Filter by user
    if (filterUser) {
      filtered = filtered.filter(log => log.user === filterUser);
    }
    
    // Filter by action type
    if (filterAction) {
      filtered = filtered.filter(log => log.actionType === filterAction);
    }
    
    // Filter by date range
    if (filterDateFrom) {
      filtered = filtered.filter(log => new Date(log.timestamp) >= filterDateFrom);
    }
    
    if (filterDateTo) {
      const endDate = new Date(filterDateTo);
      endDate.setHours(23, 59, 59);
      filtered = filtered.filter(log => new Date(log.timestamp) <= endDate);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log => 
        log.user.toLowerCase().includes(query) ||
        log.actionLabel.toLowerCase().includes(query) ||
        (log.details.product && log.details.product.toLowerCase().includes(query)) ||
        (log.details.supplier && log.details.supplier.toLowerCase().includes(query)) ||
        (log.details.orderNumber && log.details.orderNumber.toLowerCase().includes(query))
      );
    }
    
    setFilteredLogs(filtered);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilterUser('');
    setFilterAction('');
    setFilterDateFrom(null);
    setFilterDateTo(null);
    setSearchQuery('');
    setFilteredLogs(logs);
  };
  
  // Export logs to CSV
  const exportLogs = () => {
    // Get headers
    const headers = ['ID', 'Timestamp', 'User', 'Action', 'Details', 'IP'];
    
    // Format data
    const csvData = filteredLogs.map(log => {
      let details = '';
      if (log.details.product) {
        details = `Product: ${log.details.product}, Quantity: ${log.details.quantity}`;
        if (log.details.reason) details += `, Reason: ${log.details.reason}`;
      } else if (log.details.orderNumber) {
        details = `Order: ${log.details.orderNumber}, Supplier: ${log.details.supplier}, Items: ${log.details.items}`;
      } else if (log.details.supplier) {
        details = `Supplier: ${log.details.supplier}, ${log.details.contact}`;
      } else if (log.details.setting) {
        details = `Setting: ${log.details.setting}`;
      }
      
      return [
        log.id,
        log.timestamp,
        log.user,
        log.actionLabel,
        details,
        log.ip
      ];
    });
    
    // Combine headers and data
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_log_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Format details for display
  const formatDetails = (log) => {
    if (log.details.product) {
      return (
        <>
          <strong>Product:</strong> {log.details.product}<br />
          <strong>Quantity:</strong> {log.details.quantity > 0 ? `+${log.details.quantity}` : log.details.quantity}
          {log.details.reason && <><br /><strong>Reason:</strong> {log.details.reason}</>}
        </>
      );
    } else if (log.details.orderNumber) {
      return (
        <>
          <strong>Order:</strong> {log.details.orderNumber}<br />
          <strong>Supplier:</strong> {log.details.supplier}<br />
          <strong>Items:</strong> {log.details.items}
        </>
      );
    } else if (log.details.supplier) {
      return (
        <>
          <strong>Supplier:</strong> {log.details.supplier}<br />
          <strong>{log.details.contact}</strong>
        </>
      );
    } else if (log.details.setting) {
      return (
        <>
          <strong>Setting:</strong> {log.details.setting}
        </>
      );
    }
    return null;
  };
  
  // Get chip color for action type
  const getActionColor = (actionType) => {
    if (actionType.startsWith('inventory.add') || actionType === 'supplier.add' || actionType === 'order.approve') {
      return 'success';
    } else if (actionType.startsWith('inventory.remove') || actionType === 'inventory.adjust') {
      return 'warning';
    } else if (actionType === 'settings.update') {
      return 'info';
    } else if (actionType === 'order.create') {
      return 'primary';
    }
    return 'default';
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{ sx: { height: '80vh' } }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <HistoryIcon sx={{ mr: 1 }} />
            <Typography variant="h6">System Audit Log</Typography>
          </Box>
          <Button 
            variant="outlined" 
            startIcon={<ExportIcon />} 
            onClick={exportLogs}
          >
            Export
          </Button>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="user-filter-label">User</InputLabel>
                <Select
                  labelId="user-filter-label"
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                  label="User"
                >
                  <MenuItem value="">All Users</MenuItem>
                  {uniqueUsers.map(user => (
                    <MenuItem key={user} value={user}>{user}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="action-filter-label">Action</InputLabel>
                <Select
                  labelId="action-filter-label"
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                  label="Action"
                >
                  <MenuItem value="">All Actions</MenuItem>
                  {uniqueActions.map(action => (
                    <MenuItem key={action.type} value={action.type}>{action.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.5}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="From Date"
                  value={filterDateFrom}
                  onChange={(newValue) => setFilterDateFrom(newValue)}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2.5}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="To Date"
                  value={filterDateTo}
                  onChange={(newValue) => setFilterDateTo(newValue)}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      size="small"
                      onClick={() => setSearchQuery('')}
                      style={{ visibility: searchQuery ? 'visible' : 'hidden' }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={6} sm={3} md={1}>
              <Button 
                variant="contained" 
                startIcon={<FilterIcon />} 
                onClick={applyFilters}
                fullWidth
              >
                Filter
              </Button>
            </Grid>
            
            <Grid item xs={6} sm={3} md={1}>
              <Button 
                variant="outlined" 
                onClick={clearFilters}
                fullWidth
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </Paper>
        
        <TableContainer component={Paper} sx={{ maxHeight: 'calc(80vh - 220px)', overflow: 'auto' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Details</TableCell>
                <TableCell align="right">IP Address</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{log.timestamp}</TableCell>
                  <TableCell>{log.user}</TableCell>
                  <TableCell>
                    <Chip
                      label={log.actionLabel}
                      size="small"
                      color={getActionColor(log.actionType)}
                    />
                  </TableCell>
                  <TableCell>{formatDetails(log)}</TableCell>
                  <TableCell align="right">{log.ip}</TableCell>
                </TableRow>
              ))}
              {filteredLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body1" sx={{ py: 2 }}>
                      No records found matching your filters
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Box mt={2} display="flex" justifyContent="space-between">
          <Typography variant="body2" color="textSecondary">
            Showing {filteredLogs.length} of {logs.length} records
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Logs are retained for 90 days
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AuditLog;
