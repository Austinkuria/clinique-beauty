import React, { useState, useEffect } from 'react';
import {
  Container, Box, Grid, Paper, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, TextField,
  Select, MenuItem, Button, Tabs, Tab, Alert, LinearProgress,
  FormControl, InputLabel, Card, CardContent, List, ListItem, ListItemText,
  Divider
} from '@mui/material';
import {
  Warning as WarningIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Description as DescriptionIcon,
  Email as EmailIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

const ComplianceMonitoring = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [complianceIssues, setComplianceIssues] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    // Mock data - in a real app, fetch from API
    const mockSellers = [
      { 
        id: 1, 
        name: 'Beauty Essentials Co', 
        complianceScore: 95,
        verificationStatus: 'verified',
        lastAudit: '2023-09-15',
        pendingIssues: 0,
        productCount: 78,
        nonCompliantProducts: 2
      },
      { 
        id: 2, 
        name: 'Luxury Cosmetics', 
        complianceScore: 87,
        verificationStatus: 'verified',
        lastAudit: '2023-08-22',
        pendingIssues: 3,
        productCount: 45,
        nonCompliantProducts: 5
      },
      { 
        id: 3, 
        name: 'Natural Beauty Products', 
        complianceScore: 98,
        verificationStatus: 'verified',
        lastAudit: '2023-10-01',
        pendingIssues: 0,
        productCount: 112,
        nonCompliantProducts: 1
      },
      { 
        id: 4, 
        name: 'Skincare Specialists', 
        complianceScore: 72,
        verificationStatus: 'provisional',
        lastAudit: '2023-09-05',
        pendingIssues: 7,
        productCount: 38,
        nonCompliantProducts: 8
      },
    ];

    const mockIssues = [
      {
        id: 'COMP-1001',
        sellerId: 2,
        sellerName: 'Luxury Cosmetics',
        type: 'product_description',
        severity: 'medium',
        description: 'Product claims are not substantiated with proper documentation',
        status: 'open',
        createdAt: '2023-10-05',
        affectedProducts: ['Product X', 'Product Y']
      },
      {
        id: 'COMP-1002',
        sellerId: 2,
        sellerName: 'Luxury Cosmetics',
        type: 'ingredient_listing',
        severity: 'high',
        description: 'Incomplete ingredient list for skincare products',
        status: 'open',
        createdAt: '2023-10-02',
        affectedProducts: ['Product Z']
      },
      {
        id: 'COMP-1003',
        sellerId: 2,
        sellerName: 'Luxury Cosmetics',
        type: 'shipping_policy',
        severity: 'low',
        description: 'Shipping policy does not meet marketplace requirements',
        status: 'open',
        createdAt: '2023-09-28',
        affectedProducts: []
      },
      {
        id: 'COMP-1004',
        sellerId: 4,
        sellerName: 'Skincare Specialists',
        type: 'product_safety',
        severity: 'critical',
        description: 'Product safety certificates not provided for new skincare line',
        status: 'open',
        createdAt: '2023-10-01',
        affectedProducts: ['Brightening Serum', 'Anti-Aging Cream', 'Vitamin C Cleanser']
      },
      {
        id: 'COMP-1005',
        sellerId: 4,
        sellerName: 'Skincare Specialists',
        type: 'returns_policy',
        severity: 'medium',
        description: 'Return policy is not consistent with marketplace standards',
        status: 'open',
        createdAt: '2023-09-29',
        affectedProducts: []
      },
      {
        id: 'COMP-1006',
        sellerId: 4,
        sellerName: 'Skincare Specialists',
        type: 'product_image',
        severity: 'low',
        description: 'Product images do not show all required angles',
        status: 'open',
        createdAt: '2023-09-25',
        affectedProducts: ['Night Cream', 'Facial Toner', 'Clay Mask']
      },
      {
        id: 'COMP-998',
        sellerId: 3,
        sellerName: 'Natural Beauty Products',
        type: 'ingredient_listing',
        severity: 'medium',
        description: 'Missing allergen warning for essential oil content',
        status: 'resolved',
        createdAt: '2023-09-15',
        resolvedAt: '2023-09-18',
        affectedProducts: ['Lavender Body Oil']
      },
      {
        id: 'COMP-985',
        sellerId: 1,
        sellerName: 'Beauty Essentials Co',
        type: 'product_description',
        severity: 'medium',
        description: 'Misleading efficacy claims',
        status: 'resolved',
        createdAt: '2023-08-28',
        resolvedAt: '2023-09-05',
        affectedProducts: ['Collagen Boosting Cream']
      }
    ];

    setTimeout(() => {
      setSellers(mockSellers);
      setComplianceIssues(mockIssues);
      setLoading(false);
    }, 500);
  }, []);

  const getComplianceScoreColor = (score) => {
    if (score >= 90) return 'success';
    if (score >= 80) return 'primary';
    if (score >= 70) return 'warning';
    return 'error';
  };

  const getVerificationStatusChip = (status) => {
    switch(status) {
      case 'verified':
        return <Chip label="Verified" color="success" size="small" />;
      case 'provisional':
        return <Chip label="Provisional" color="warning" size="small" />;
      case 'suspended':
        return <Chip label="Suspended" color="error" size="small" />;
      default:
        return <Chip label="Pending" color="default" size="small" />;
    }
  };

  const getSeverityChip = (severity) => {
    switch(severity) {
      case 'critical':
        return <Chip label="Critical" color="error" size="small" />;
      case 'high':
        return <Chip label="High" color="warning" size="small" />;
      case 'medium':
        return <Chip label="Medium" color="info" size="small" />;
      case 'low':
        return <Chip label="Low" color="default" size="small" />;
      default:
        return <Chip label="Unknown" color="default" size="small" />;
    }
  };

  const handleSellerSelect = (seller) => {
    setSelectedSeller(seller);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const filteredIssues = selectedSeller 
    ? complianceIssues.filter(issue => 
        issue.sellerId === selectedSeller.id && 
        (filterStatus === 'all' || issue.status === filterStatus))
    : [];

  const initiateAudit = (sellerId) => {
    // Logic to initiate a new audit would go here
    alert(`Initiating audit for seller ID: ${sellerId}`);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Compliance Monitoring</Typography>
      
      <Paper sx={{ mb: 4 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">Seller Compliance Overview</Typography>
        </Box>
        <TableContainer>
          {loading ? (
            <Box sx={{ p: 2 }}>
              <Typography>Loading compliance data...</Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Seller</TableCell>
                  <TableCell>Compliance Score</TableCell>
                  <TableCell>Verification Status</TableCell>
                  <TableCell>Last Audit</TableCell>
                  <TableCell>Products</TableCell>
                  <TableCell>Non-Compliant</TableCell>
                  <TableCell>Pending Issues</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sellers.map(seller => (
                  <TableRow key={seller.id}>
                    <TableCell>{seller.name}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: 170 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={seller.complianceScore} 
                          color={getComplianceScoreColor(seller.complianceScore)}
                          sx={{ width: 100, mr: 1 }}
                        />
                        <Typography variant="body2">{seller.complianceScore}%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{getVerificationStatusChip(seller.verificationStatus)}</TableCell>
                    <TableCell>{seller.lastAudit}</TableCell>
                    <TableCell>{seller.productCount}</TableCell>
                    <TableCell>
                      {seller.nonCompliantProducts > 0 ? (
                        <Typography color="error">{seller.nonCompliantProducts}</Typography>
                      ) : (
                        <Typography color="success.main">0</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {seller.pendingIssues > 0 ? (
                        <Chip label={seller.pendingIssues} color="warning" size="small" />
                      ) : (
                        <Chip label="None" color="success" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => handleSellerSelect(seller)}
                        >
                          Details
                        </Button>
                        <Button 
                          variant="outlined" 
                          color="secondary"
                          size="small"
                          onClick={() => initiateAudit(seller.id)}
                        >
                          Audit
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      </Paper>

      {selectedSeller && (
        <Paper>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Compliance Details: {selectedSeller.name}</Typography>
            <Box>
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={<DescriptionIcon />}
                sx={{ mr: 1 }}
              >
                Generate Report
              </Button>
              <Button 
                variant="outlined" 
                color="secondary"
                size="small"
                startIcon={<EmailIcon />}
              >
                Contact Seller
              </Button>
            </Box>
          </Box>
          <Divider />
          <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Compliance Issues" />
                <Tab label="Compliance Documents" />
                <Tab label="Audit History" />
              </Tabs>
            </Box>
            <Box sx={{ p: 3 }}>
              {tabValue === 0 && (
                <>
                  <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <FormControl sx={{ width: 200 }}>
                      <InputLabel id="status-filter-label">Filter</InputLabel>
                      <Select
                        labelId="status-filter-label"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        size="small"
                        label="Filter"
                      >
                        <MenuItem value="all">All Issues</MenuItem>
                        <MenuItem value="open">Open Issues</MenuItem>
                        <MenuItem value="resolved">Resolved Issues</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <Button 
                      variant="contained" 
                      color="success" 
                      size="small"
                      startIcon={<CheckIcon />}
                    >
                      Mark as Resolved
                    </Button>
                  </Box>
                  
                  {filteredIssues.length === 0 ? (
                    <Alert severity="info">
                      No {filterStatus !== 'all' ? filterStatus : ''} compliance issues found for this seller.
                    </Alert>
                  ) : (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Severity</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredIssues.map(issue => (
                            <TableRow key={issue.id}>
                              <TableCell>{issue.id}</TableCell>
                              <TableCell>{issue.type.replace('_', ' ')}</TableCell>
                              <TableCell>{getSeverityChip(issue.severity)}</TableCell>
                              <TableCell>{issue.description}</TableCell>
                              <TableCell>
                                {issue.status === 'open' ? (
                                  <Chip label="Open" color="error" size="small" />
                                ) : (
                                  <Chip label="Resolved" color="success" size="small" />
                                )}
                              </TableCell>
                              <TableCell>{issue.status === 'open' ? issue.createdAt : issue.resolvedAt}</TableCell>
                              <TableCell>
                                <Button variant="outlined" color="info" size="small">Details</Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </>
              )}
              {tabValue === 1 && (
                <>
                  <Typography paragraph>Seller's compliance documents would be listed here...</Typography>
                  <List>
                    <ListItem>
                      <ListItemText primary="Business Registration" />
                      <Chip label="Verified" color="success" size="small" />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText primary="Product Certifications" />
                      <Chip label="Verified" color="success" size="small" />
                    </ListItem>
                    <Divider />
                    <ListItem>
                      <ListItemText primary="Tax Documents" />
                      <Chip label="Under Review" color="warning" size="small" />
                    </ListItem>
                  </List>
                </>
              )}
              {tabValue === 2 && (
                <Typography paragraph>Audit history would be displayed here...</Typography>
              )}
            </Box>
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default ComplianceMonitoring;
