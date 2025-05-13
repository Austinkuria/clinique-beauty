import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { marketingApi } from '../../../data/marketingApi';

const CampaignList = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [analytics, setAnalytics] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [campaignsResponse, analyticsResponse] = await Promise.all([
          marketingApi.getCampaigns(),
          marketingApi.getMarketingAnalytics()
        ]);
        
        setCampaigns(campaignsResponse.data);
        setAnalytics(analyticsResponse.data.campaigns);
      } catch (error) {
        console.error('Error fetching campaign data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateCampaign = () => {
    navigate('/admin/marketing/campaigns/new');
  };

  const handleEditCampaign = (id) => {
    navigate(`/admin/marketing/campaigns/edit/${id}`);
  };

  const handleViewCampaign = (id) => {
    navigate(`/admin/marketing/campaigns/${id}`);
  };

  const handleDeleteCampaign = async (id) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await marketingApi.deleteCampaign(id);
        setCampaigns(campaigns.filter(campaign => campaign.id !== id));
      } catch (error) {
        console.error('Error deleting campaign:', error);
      }
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'active':
        return <Chip label="Active" color="success" size="small" />;
      case 'scheduled':
        return <Chip label="Scheduled" color="primary" size="small" />;
      case 'ended':
        return <Chip label="Ended" color="default" size="small" />;
      case 'draft':
        return <Chip label="Draft" color="info" size="small" />;
      default:
        return <Chip label={status} color="default" size="small" />;
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Marketing Campaigns</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleCreateCampaign}
        >
          Create Campaign
        </Button>
      </Box>

      {/* Analytics Overview */}
      {analytics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="textSecondary" gutterBottom>Active Campaigns</Typography>
                <Typography variant="h4">{analytics.active}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="textSecondary" gutterBottom>Total Revenue</Typography>
                <Typography variant="h4">${analytics.totalRevenue.toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="textSecondary" gutterBottom>Conversions</Typography>
                <Typography variant="h4">{analytics.totalConversions.toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography color="textSecondary" gutterBottom>Conversion Rate</Typography>
                <Typography variant="h4">{analytics.conversionRate}%</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
        <TextField
          placeholder="Search campaigns"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1 }}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <FormControl sx={{ minWidth: 200 }} size="small">
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Status"
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="scheduled">Scheduled</MenuItem>
            <MenuItem value="ended">Ended</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Campaigns Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Period</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Discount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Performance</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCampaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No campaigns found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCampaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <Typography variant="subtitle2">{campaign.name}</Typography>
                      <Typography variant="body2" color="textSecondary">{campaign.description}</Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{campaign.type}</TableCell>
                    <TableCell>
                      {campaign.discountType === 'percentage' 
                        ? `${campaign.discountValue}%` 
                        : `$${campaign.discountValue}`}
                    </TableCell>
                    <TableCell>{getStatusChip(campaign.status)}</TableCell>
                    <TableCell>
                      {campaign.status !== 'scheduled' && campaign.stats ? (
                        <Box>
                          <Typography variant="body2">
                            <TrendingUpIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                            ${campaign.stats.revenue.toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {campaign.stats.conversions} conversions
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="textSecondary">Not started</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        color="primary" 
                        size="small"
                        onClick={() => handleViewCampaign(campaign.id)}
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton 
                        color="secondary" 
                        size="small"
                        onClick={() => handleEditCampaign(campaign.id)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        size="small"
                        onClick={() => handleDeleteCampaign(campaign.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default CampaignList;
