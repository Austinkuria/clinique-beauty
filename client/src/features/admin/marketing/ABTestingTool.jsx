import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Backdrop,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as StartIcon,
  Stop as StopIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Flag as FlagIcon,
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useApi } from '../../../api/apiClient';
import { toast } from 'react-hot-toast';
import { abTestingApi } from '../../../data/abTestingApi';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Main component
const ABTestingTool = () => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTest, setSelectedTest] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target: 'all_users',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 14*24*60*60*1000).toISOString().split('T')[0], // 2 weeks from now
    variants: [
      { name: 'Control', description: 'Original version', trafficAllocation: 50 },
      { name: 'Variant A', description: 'Test version', trafficAllocation: 50 }
    ],
    testGoal: 'conversion_rate'
  });

  // Fetch tests on component mount
  useEffect(() => {
    fetchTests();
  }, []);

  // Function to fetch tests from API
  const fetchTests = async () => {
    setLoading(true);
    try {
      const response = await abTestingApi.getTests();
      setTests(response.data);
      
      // Select the first active test by default if any
      const activeTest = response.data.find(test => test.status === 'active');
      if (activeTest) {
        setSelectedTest(activeTest);
      } else if (response.data.length > 0) {
        setSelectedTest(response.data[0]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching A/B tests:', err);
      setError('Failed to load A/B tests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle tab changes
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // View test details
  const handleViewTestDetails = (test) => {
    setSelectedTest(test);
    setActiveTab(1); // Switch to Results tab
  };

  // Start a test
  const handleStartTest = async (testId) => {
    try {
      await abTestingApi.startTest(testId);
      toast.success('Test started successfully');
      fetchTests();
    } catch (error) {
      console.error('Error starting test:', error);
      toast.error('Failed to start test');
    }
  };

  // Stop a test
  const handleStopTest = async (testId) => {
    try {
      await abTestingApi.stopTest(testId);
      toast.success('Test stopped successfully');
      fetchTests();
    } catch (error) {
      console.error('Error stopping test:', error);
      toast.error('Failed to stop test');
    }
  };

  // Delete a test
  const handleDeleteTest = async (testId) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      try {
        await abTestingApi.deleteTest(testId);
        toast.success('Test deleted successfully');
        if (selectedTest && selectedTest.id === testId) {
          setSelectedTest(null);
        }
        fetchTests();
      } catch (error) {
        console.error('Error deleting test:', error);
        toast.error('Failed to delete test');
      }
    }
  };

  // Handle form changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle variant changes
  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[index] = {
      ...updatedVariants[index],
      [field]: value
    };
    setFormData({
      ...formData,
      variants: updatedVariants
    });
  };

  // Add a new variant
  const addVariant = () => {
    if (formData.variants.length >= 4) {
      toast.error('Maximum 4 variants allowed');
      return;
    }
    // Recalculate traffic allocation
    const newAllocation = Math.floor(100 / (formData.variants.length + 1));
    const updatedVariants = formData.variants.map(variant => ({
      ...variant,
      trafficAllocation: newAllocation
    }));
    updatedVariants.push({
      name: `Variant ${String.fromCharCode(65 + updatedVariants.length - 1)}`, // A, B, C...
      description: 'New variant',
      trafficAllocation: newAllocation
    });
    setFormData({
      ...formData,
      variants: updatedVariants
    });
  };

  // Remove a variant
  const removeVariant = (index) => {
    if (formData.variants.length <= 2) {
      toast.error('Minimum 2 variants required');
      return;
    }
    const updatedVariants = [...formData.variants];
    updatedVariants.splice(index, 1);
    // Recalculate traffic allocation
    const newAllocation = Math.floor(100 / updatedVariants.length);
    updatedVariants.forEach(variant => {
      variant.trafficAllocation = newAllocation;
    });
    // Adjust to make sure it adds up to 100%
    updatedVariants[0].trafficAllocation += 100 - (newAllocation * updatedVariants.length);
    
    setFormData({
      ...formData,
      variants: updatedVariants
    });
  };

  const handleCreateTestClick = () => {
    setCreateDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setCreateDialogOpen(false);
  };

  const createTest = async () => {
    try {
      await abTestingApi.createTest(formData);
      toast.success('A/B test created successfully');
      setCreateDialogOpen(false); // Close the dialog instead
      fetchTests();
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        target: 'all_users',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 14*24*60*60*1000).toISOString().split('T')[0],
        variants: [
          { name: 'Control', description: 'Original version', trafficAllocation: 50 },
          { name: 'Variant A', description: 'Test version', trafficAllocation: 50 }
        ],
        testGoal: 'conversion_rate'
      });
    } catch (error) {
      console.error('Error creating test:', error);
      toast.error('Failed to create test');
    }
  };

  // Status chip component
  const getStatusChip = (status) => {
    switch (status) {
      case 'active':
        return <Chip icon={<StartIcon />} label="Active" color="success" size="small" />;
      case 'scheduled':
        return <Chip icon={<FlagIcon />} label="Scheduled" color="primary" size="small" />;
      case 'completed':
        return <Chip icon={<CheckCircleOutlineIcon />} label="Completed" color="default" size="small" />;
      case 'draft':
        return <Chip label="Draft" color="info" size="small" />;
      default:
        return <Chip label={status} color="default" size="small" />;
    }
  };

  // Loading state
  if (loading && tests.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Render the tests list tab
  const renderTestsList = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">A/B Testing</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleCreateTestClick} // Use the new handler
        >
          Create New Test
        </Button>
      </Box>

      {/* Overview cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Active Tests</Typography>
              <Typography variant="h4">{tests.filter(test => test.status === 'active').length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Scheduled Tests</Typography>
              <Typography variant="h4">{tests.filter(test => test.status === 'scheduled').length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Completed Tests</Typography>
              <Typography variant="h4">{tests.filter(test => test.status === 'completed').length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>Total Users in Tests</Typography>
              <Typography variant="h4">
                {tests.reduce((total, test) => total + (test.participants || 0), 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tests table */}
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Test Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Goal</TableCell>
              <TableCell>Date Range</TableCell>
              <TableCell>Participants</TableCell>
              <TableCell>Variants</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No A/B tests found.
                </TableCell>
              </TableRow>
            ) : (
              tests.map((test) => (
                <TableRow key={test.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="subtitle2">{test.name}</Typography>
                      <Typography variant="body2" color="textSecondary">{test.description}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{getStatusChip(test.status)}</TableCell>
                  <TableCell>
                    {test.testGoal === 'conversion_rate' ? 'Conversion Rate' :
                     test.testGoal === 'avg_order_value' ? 'Avg Order Value' :
                     test.testGoal === 'revenue' ? 'Revenue' :
                     test.testGoal === 'clicks' ? 'Click Rate' : test.testGoal}
                  </TableCell>
                  <TableCell>
                    {new Date(test.startDate).toLocaleDateString()} - {new Date(test.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{test.participants?.toLocaleString() || '0'}</TableCell>
                  <TableCell>
                    {test.variants.map((variant, index) => (
                      <Chip 
                        key={index} 
                        label={`${variant.name} (${variant.trafficAllocation}%)`} 
                        size="small" 
                        sx={{ mr: 0.5, mb: 0.5 }} 
                      />
                    ))}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleViewTestDetails(test)}>
                      <BarChartIcon />
                    </IconButton>
                    {test.status === 'active' ? (
                      <IconButton color="error" onClick={() => handleStopTest(test.id)}>
                        <StopIcon />
                      </IconButton>
                    ) : test.status === 'scheduled' || test.status === 'draft' ? (
                      <IconButton color="success" onClick={() => handleStartTest(test.id)}>
                        <StartIcon />
                      </IconButton>
                    ) : null}
                    <IconButton color="error" onClick={() => handleDeleteTest(test.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Test Dialog - Replaces the inline form */}
      <Dialog 
        open={createDialogOpen} 
        onClose={handleCloseDialog}
        fullScreen={fullScreen}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Create New A/B Test</Typography>
            <IconButton edge="end" color="inherit" onClick={handleCloseDialog} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Test Name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Test Goal</InputLabel>
                <Select
                  name="testGoal"
                  value={formData.testGoal}
                  onChange={handleFormChange}
                  label="Test Goal"
                >
                  <MenuItem value="conversion_rate">Conversion Rate</MenuItem>
                  <MenuItem value="avg_order_value">Average Order Value</MenuItem>
                  <MenuItem value="revenue">Revenue per User</MenuItem>
                  <MenuItem value="clicks">Click-through Rate</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Target Audience</InputLabel>
                <Select
                  name="target"
                  value={formData.target}
                  onChange={handleFormChange}
                  label="Target Audience"
                >
                  <MenuItem value="all_users">All Users</MenuItem>
                  <MenuItem value="new_users">New Users</MenuItem>
                  <MenuItem value="returning_users">Returning Users</MenuItem>
                  <MenuItem value="mobile_users">Mobile Users</MenuItem>
                  <MenuItem value="desktop_users">Desktop Users</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Sample Size (% of traffic)"
                name="sampleSize"
                type="number"
                value={formData.sampleSize || 100}
                onChange={handleFormChange}
                InputProps={{ inputProps: { min: 1, max: 100 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleFormChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleFormChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Test Variants</Typography>
          
          {formData.variants.map((variant, index) => (
            <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Variant Name"
                    value={variant.name}
                    onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={variant.description}
                    onChange={(e) => handleVariantChange(index, 'description', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    fullWidth
                    label="Traffic %"
                    type="number"
                    value={variant.trafficAllocation}
                    onChange={(e) => handleVariantChange(index, 'trafficAllocation', e.target.value)}
                    InputProps={{ inputProps: { min: 1, max: 100 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {index > 1 && (
                    <IconButton color="error" onClick={() => removeVariant(index)}>
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Grid>
              </Grid>
            </Box>
          ))}
          
          <Box sx={{ mb: 3 }}>
            <Button 
              variant="outlined" 
              startIcon={<AddIcon />} 
              onClick={addVariant}
              disabled={formData.variants.length >= 4}
            >
              Add Variant
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            variant="outlined" 
            onClick={handleCloseDialog}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={createTest}
            disabled={!formData.name || !formData.startDate || !formData.endDate}
          >
            Create Test
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  // Render the test results tab
  const renderTestResults = () => {
    if (!selectedTest) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">Select a test to view results</Typography>
        </Box>
      );
    }

    // Calculate which variant is performing best
    let bestVariant = null;
    let bestPerformance = 0;
    
    if (selectedTest.results) {
      selectedTest.results.forEach(result => {
        const metric = 
          selectedTest.testGoal === 'conversion_rate' ? result.conversionRate :
          selectedTest.testGoal === 'avg_order_value' ? result.avgOrderValue :
          selectedTest.testGoal === 'revenue' ? result.revenue : 
          result.clickRate;
        
        if (metric > bestPerformance) {
          bestPerformance = metric;
          bestVariant = result.variant;
        }
      });
    }

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">{selectedTest.name}</Typography>
          <Box>
            {selectedTest.status === 'active' ? (
              <Button 
                variant="contained" 
                color="error" 
                startIcon={<StopIcon />}
                onClick={() => handleStopTest(selectedTest.id)}
              >
                Stop Test
              </Button>
            ) : selectedTest.status === 'scheduled' || selectedTest.status === 'draft' ? (
              <Button 
                variant="contained" 
                color="success" 
                startIcon={<StartIcon />}
                onClick={() => handleStartTest(selectedTest.id)}
              >
                Start Test
              </Button>
            ) : null}
          </Box>
        </Box>

        <Paper sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="textSecondary">Status</Typography>
              <Box sx={{ mt: 1 }}>{getStatusChip(selectedTest.status)}</Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="textSecondary">Test Goal</Typography>
              <Typography variant="body1">
                {selectedTest.testGoal === 'conversion_rate' ? 'Conversion Rate' :
                 selectedTest.testGoal === 'avg_order_value' ? 'Avg Order Value' :
                 selectedTest.testGoal === 'revenue' ? 'Revenue' :
                 selectedTest.testGoal === 'clicks' ? 'Click Rate' : selectedTest.testGoal}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="textSecondary">Start Date</Typography>
              <Typography variant="body1">{new Date(selectedTest.startDate).toLocaleDateString()}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="textSecondary">End Date</Typography>
              <Typography variant="body1">{new Date(selectedTest.endDate).toLocaleDateString()}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="textSecondary">Description</Typography>
              <Typography variant="body1">{selectedTest.description}</Typography>
            </Grid>
          </Grid>
        </Paper>

        {selectedTest.results && (
          <>
            {/* Results summary */}
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>Results Summary</Typography>
              
              {bestVariant && (
                <Alert 
                  severity="success" 
                  icon={<TrendingUpIcon />}
                  sx={{ mb: 3 }}
                >
                  <Typography variant="subtitle1">
                    {bestVariant} is currently the best performing variant
                  </Typography>
                  {selectedTest.confidence && (
                    <Typography variant="body2">
                      Statistical confidence: {selectedTest.confidence}%
                    </Typography>
                  )}
                </Alert>
              )}
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Performance by Variant</Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={selectedTest.results}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="variant" />
                        <YAxis 
                          label={{ 
                            value: selectedTest.testGoal === 'conversion_rate' ? 'Conversion Rate (%)' :
                                   selectedTest.testGoal === 'avg_order_value' ? 'Avg Order Value ($)' :
                                   selectedTest.testGoal === 'revenue' ? 'Revenue ($)' :
                                   'Click Rate (%)',
                            angle: -90,
                            position: 'insideLeft' 
                          }} 
                        />
                        <Tooltip />
                        <Legend />
                        <Bar 
                          dataKey={
                            selectedTest.testGoal === 'conversion_rate' ? 'conversionRate' :
                            selectedTest.testGoal === 'avg_order_value' ? 'avgOrderValue' :
                            selectedTest.testGoal === 'revenue' ? 'revenue' :
                            'clickRate'
                          } 
                          name={
                            selectedTest.testGoal === 'conversion_rate' ? 'Conversion Rate (%)' :
                            selectedTest.testGoal === 'avg_order_value' ? 'Avg Order Value ($)' :
                            selectedTest.testGoal === 'revenue' ? 'Revenue ($)' :
                            'Click Rate (%)'
                          }
                          fill="#8884d8" 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>User Participation</Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={selectedTest.results}
                          dataKey="participants"
                          nameKey="variant"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {selectedTest.results.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </>
        )}
      </Box>
    );
  };

  // Main component render
  return (
    <Box>
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Tests List" />
          <Tab label="Test Results" disabled={!selectedTest} />
        </Tabs>
      </Paper>
      
      {activeTab === 0 ? renderTestsList() : renderTestResults()}
    </Box>
  );
};

export default ABTestingTool;
