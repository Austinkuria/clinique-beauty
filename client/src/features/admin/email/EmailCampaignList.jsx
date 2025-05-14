import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, Chip, TextField, InputAdornment, IconButton, Grid, Card, CardContent,
  MenuItem, Select, FormControl, InputLabel, CircularProgress, Tooltip, Menu
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  MoreVert as MoreIcon,
  Send as SendIcon,
  Schedule as ScheduleIcon,
  Visibility as ViewIcon,
  Assessment as StatsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { emailCampaigns } from '../../../data/mockEmailCampaignData';

const EmailCampaignList = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    draft: 0,
    sent: 0,
    scheduled: 0
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCampaigns(emailCampaigns);
      
      // Calculate stats
      const newStats = {
        total: emailCampaigns.length,
        active: emailCampaigns.filter(c => c.status === 'active').length,
        draft: emailCampaigns.filter(c => c.status === 'draft').length,
        sent: emailCampaigns.filter(c => c.status === 'sent').length,
        scheduled: emailCampaigns.filter(c => c.status === 'scheduled').length
      };
      
      setStats(newStats);
      setLoading(false);
    }, 800);
  }, []);
  
  useEffect(() => {
    if (campaigns.length > 0) {
      let filtered = [...campaigns];
      
      // Apply search filter
      if (searchTerm) {
        filtered = filtered.filter(campaign => 
          campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          campaign.subject?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Apply status filter
      if (statusFilter !== 'all') {
        filtered = filtered.filter(campaign => campaign.status === statusFilter);
      }
      
      setFilteredCampaigns(filtered);
    }
  }, [campaigns, searchTerm, statusFilter]);
  
  const handleCreateCampaign = () => {
    navigate('/admin/email-marketing/create');
  };
  
  const handleEditCampaign = (id) => {
    navigate(`/admin/email-marketing/edit/${id}`);
  };
  
  const handleViewCampaign = (id) => {
    navigate(`/admin/email-marketing/view/${id}`);
  };
  
  const handleCampaignStats = (id) => {
    navigate(`/admin/email-marketing/stats/${id}`);
  };
  
  const handleDeleteCampaign = (id) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      // In a real app, this would be an API call
      setCampaigns(campaigns.filter(campaign => campaign.id !== id));
    }
  };
  
  const handleDuplicateCampaign = (id) => {
    const campaignToDuplicate = campaigns.find(c => c.id === id);
    if (campaignToDuplicate) {
      const newCampaign = {
        ...campaignToDuplicate,
        id: `em-${Date.now()}`,
        name: `Copy of ${campaignToDuplicate.name}`,
        status: 'draft',
        performance: {
          delivered: 0,
          opened: 0,
          clicked: 0,
          openRate: 0,
          clickRate: 0,
          revenue: 0
        }
      };
      
      setCampaigns([...campaigns, newCampaign]);
    }
  };
  
  const handleMenuOpen = (event, campaign) => {
    setAnchorEl(event.currentTarget);
    setSelectedCampaign(campaign);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCampaign(null);
  };
  
  const getStatusChip = (status) => {
    switch (status) {
      case 'draft':
        return <Chip label="Draft" color="default" size="small" />;
      case 'scheduled':
        return <Chip label="Scheduled" color="primary" size="small" />;
      case 'active':
        return <Chip label="Active" color="success" size="small" />;
      case 'sent':
        return <Chip label="Sent" color="info" size="small" />;
      default:
        return <Chip label={status} color="default" size="small" />;
    }
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Email Campaigns</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateCampaign}
        >
          Create Campaign
        </Button>
      </Box>
      
      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Total Campaigns
              </Typography>
              <Typography variant="h4">{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Active Automations
              </Typography>
              <Typography variant="h4">{stats.active}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Scheduled
              </Typography>
              <Typography variant="h4">{stats.scheduled}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Sent
              </Typography>
              <Typography variant="h4">{stats.sent}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography color="textSecondary" gutterBottom variant="body2">
                Drafts
              </Typography>
              <Typography variant="h4">{stats.draft}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Filters */}
      <Box mb={3} display="flex" gap={2}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search campaigns"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flexGrow: 1 }}
        />
        
        <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Status"
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="scheduled">Scheduled</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="sent">Sent</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {/* Campaigns Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Campaign Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Recipients</TableCell>
              <TableCell>Open Rate</TableCell>
              <TableCell>Click Rate</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCampaigns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body1" py={2}>
                    No campaigns found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredCampaigns.map((campaign) => (
                <TableRow key={campaign.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">{campaign.name}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {campaign.subject || 'No subject'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {campaign.automationType ? (
                      <Chip 
                        label={campaign.automationType.replace('_', ' ')} 
                        size="small" 
                        color="warning"
                      />
                    ) : (
                      <Chip label="Regular" size="small" color="default" />
                    )}
                  </TableCell>
                  <TableCell>{getStatusChip(campaign.status)}</TableCell>
                  <TableCell>
                    {campaign.recipients.count ? (
                      campaign.recipients.count
                    ) : (
                      campaign.recipients.segmentName || 'Dynamic'
                    )}
                  </TableCell>
                  <TableCell>
                    {campaign.performance?.openRate ? `${campaign.performance.openRate}%` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {campaign.performance?.clickRate ? `${campaign.performance.clickRate}%` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {campaign.status === 'sent' ? (
                      new Date(campaign.sentDate).toLocaleDateString()
                    ) : campaign.status === 'scheduled' ? (
                      new Date(campaign.scheduledDate).toLocaleDateString()
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" justifyContent="flex-end">
                      <Tooltip title="View">
                        <IconButton onClick={() => handleViewCampaign(campaign.id)} size="small">
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      {(campaign.status === 'sent' || campaign.status === 'active') && (
                        <Tooltip title="Statistics">
                          <IconButton onClick={() => handleCampaignStats(campaign.id)} size="small">
                            <StatsIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {campaign.status === 'draft' && (
                        <Tooltip title="Edit">
                          <IconButton onClick={() => handleEditCampaign(campaign.id)} size="small">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      <IconButton 
                        onClick={(e) => handleMenuOpen(e, campaign)} 
                        size="small"
                      >
                        <MoreIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedCampaign && selectedCampaign.status === 'draft' && (
          <MenuItem onClick={() => {
            handleEditCampaign(selectedCampaign.id);
            handleMenuClose();
          }}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Edit
          </MenuItem>
        )}
        
        <MenuItem onClick={() => {
          handleDuplicateCampaign(selectedCampaign?.id);
          handleMenuClose();
        }}>
          <DuplicateIcon fontSize="small" sx={{ mr: 1 }} />
          Duplicate
        </MenuItem>
        
        {selectedCampaign && selectedCampaign.status === 'draft' && (
          <MenuItem onClick={() => {
            // Logic to send now would go here
            handleMenuClose();
          }}>
            <SendIcon fontSize="small" sx={{ mr: 1 }} />
            Send Now
          </MenuItem>
        )}
        
        {selectedCampaign && selectedCampaign.status === 'draft' && (
          <MenuItem onClick={() => {
            // Logic to schedule would go here
            handleMenuClose();
          }}>
            <ScheduleIcon fontSize="small" sx={{ mr: 1 }} />
            Schedule
          </MenuItem>
        )}
        
        <MenuItem onClick={() => {
          handleDeleteCampaign(selectedCampaign?.id);
          handleMenuClose();
        }} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default EmailCampaignList;
