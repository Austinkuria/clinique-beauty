import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
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
  FormHelperText
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
  Science as ScienceIcon
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
import { validateABTest, prepareTestData } from '../../../utils/abTestValidation';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ABTestingTool = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTest, setSelectedTest] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
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

  useEffect(() => {
    fetchTests();
  }, []);

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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleViewTestDetails = (test) => {
    setSelectedTest(test);
    setActiveTab(1); // Switch to Results tab
  };

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

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when changed
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

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
    
    // Clear variant errors when changed
    if (formErrors.variantErrors?.[index]?.[field]) {
      const newVariantErrors = [...(formErrors.variantErrors || [])];
      if (newVariantErrors[index]) {
        newVariantErrors[index] = {
          ...newVariantErrors[index],
          [field]: undefined
        };
      }
      
      setFormErrors(prev => ({
        ...prev,
        variantErrors: newVariantErrors
      }));
    }
    
    // Clear total allocation error when any allocation changes
    if (field === 'trafficAllocation' && formErrors.totalAllocation) {
      setFormErrors(prev => ({
        ...prev,
        totalAllocation: undefined
      }));
    }
  };

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
    
    // Clear variant errors when adding a new variant
    if (formErrors.variants || formErrors.totalAllocation) {
      setFormErrors(prev => ({
        ...prev,
        variants: undefined,
        totalAllocation: undefined
      }));
    }
  };

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
    
    // Clear variant errors when removing a variant
    if (formErrors.variants || formErrors.totalAllocation) {
      setFormErrors(prev => ({
        ...prev,
        variants: undefined,
        totalAllocation: undefined
      }));
    }
  };

  const createTest = async () => {
    // Validate form data before submission
    const validation = validateABTest(formData);
    
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      toast.error('Please fix the errors in the form');
      return;
    }
    
    // Prepare data for submission
    const testData = prepareTestData(formData);
    
    setIsSubmitting(true);
    try {
      await abTestingApi.createTest(testData);
      toast.success('A/B test created successfully');
      setCreateModalOpen(false);
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
      
      // Clear form errors
      setFormErrors({});
    } catch (error) {
      console.error('Error creating test:', error);
      toast.error('Failed to create test: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (loading && tests.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const renderTestsList = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">A/B Testing</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => setCreateModalOpen(true)}
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

      {/* Create new test form */}
      {createModalOpen && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <ScienceIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Create New A/B Test</Typography>
          </Box>
          
          {formErrors.totalAllocation && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {formErrors.totalAllocation}
            </Alert>
          )}
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Test Name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.testGoal}>
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
                {formErrors.testGoal && (
                  <FormHelperText>{formErrors.testGoal}</FormHelperText>
                )}
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
                error={!!formErrors.description}
                helperText={formErrors.description}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.target}>
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
                {formErrors.target && (
                  <FormHelperText>{formErrors.target}</FormHelperText>
                )}
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
                error={!!formErrors.sampleSize}
                helperText={formErrors.sampleSize}
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
                required
                error={!!formErrors.startDate}
                helperText={formErrors.startDate}
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
                required
                error={!!formErrors.endDate}
                helperText={formErrors.endDate}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Test Variants</Typography>
            {formErrors.variants && (
              <Typography color="error">{formErrors.variants}</Typography>
            )}
          </Box>
          
          {formData.variants.map((variant, index) => (
            <Box 
              key={index} 
              sx={{ 
                mb: 3, 
                p: 2, 
                border: '1px solid', 
                borderColor: formErrors.variantErrors?.[index] ? 'error.main' : '#e0e0e0', 
                borderRadius: 1 
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Variant Name"
                    value={variant.name}
                    onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                    required
                    error={!!formErrors.variantErrors?.[index]?.name}
                    helperText={formErrors.variantErrors?.[index]?.name}
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
                    error={!!formErrors.variantErrors?.[index]?.trafficAllocation}
                    helperText={formErrors.variantErrors?.[index]?.trafficAllocation}
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
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button 
              variant="outlined" 
              onClick={() => {
                setCreateModalOpen(false);
                setFormErrors({});
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              onClick={createTest}
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isSubmitting ? 'Creating...' : 'Create Test'}
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );

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
                        <Tooltip formatter={(value) => [`${value} users`, 'Participants']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Performance over time */}
            {selectedTest.timeSeries && (
              <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>Performance Over Time</Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={selectedTest.timeSeries}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
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
                      {selectedTest.variants.map((variant, index) => (
                        <Line
                          key={variant.name}
                          type="monotone"
                          dataKey={`${variant.name}`}
                          name={variant.name}
                          stroke={COLORS[index % COLORS.length]}
                          activeDot={{ r: 8 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            )}

            {/* Detailed metrics */}
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>Detailed Metrics</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Variant</TableCell>
                      <TableCell>Participants</TableCell>
                      <TableCell>Conversion Rate</TableCell>
                      <TableCell>Avg Order Value</TableCell>
                      <TableCell>Revenue</TableCell>
                      <TableCell>Statistical Significance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedTest.results.map((result, index) => (
                      <TableRow key={index}>
                        <TableCell>{result.variant}</TableCell>
                        <TableCell>{result.participants.toLocaleString()}</TableCell>
                        <TableCell>{result.conversionRate}%</TableCell>
                        <TableCell>${result.avgOrderValue.toFixed(2)}</TableCell>
                        <TableCell>${result.revenue.toFixed(2)}</TableCell>
                        <TableCell>
                          {result.significant ? (
                            <Chip 
                              icon={<CheckCircleOutlineIcon />} 
                              label="Significant" 
                              color="success" 
                              size="small" 
                            />
                          ) : (
                            <Chip 
                              label="Not Significant" 
                              color="default" 
                              size="small" 
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        )}
      </Box>
    );
  };

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
