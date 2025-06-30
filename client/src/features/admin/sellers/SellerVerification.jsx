import React, { useState } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  Modal,
  CircularProgress,
  Alert,
  Grid,
  Divider,
  Link
} from '@mui/material';
import { sellerApi, useSellerApi } from '../../../data/sellerApi';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 800,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh',
  overflow: 'auto'
};

const SellerVerification = ({ requests, loading, onVerificationComplete }) => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [open, setOpen] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const { downloadSellerDocument } = useSellerApi();

  const handleReview = (request) => {
    setSelectedRequest(request);
    setVerificationNotes('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRequest(null);
    setError(null);
  };

  const handleUpdateStatus = async (status) => {
    try {
      setProcessing(true);
      setError(null);
      await sellerApi.updateVerificationStatus(
        selectedRequest.id,
        status,
        verificationNotes
      );
      
      if (onVerificationComplete) {
        onVerificationComplete();
      }
      
      handleClose();
    } catch (err) {
      setError('Failed to update verification status. Please try again.');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadDocument = async (doc) => {
    try {
      const response = await downloadSellerDocument(selectedRequest.id, doc.filename);
      
      // Create blob URL and trigger download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.originalName || doc.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading document:', err);
      setError('Failed to download document. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Seller Verification Requests</Typography>
      
      {requests.length === 0 ? (
        <Alert severity="info">No pending verification requests</Alert>
      ) : (
        <Box>
          {requests.map(request => (
            <Card key={request.id} sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6">{request.businessName}</Typography>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Submitted by: {request.contactName}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Chip 
                    label={`Submitted: ${
                      request.submittedAt || request.registrationDate 
                        ? new Date(request.submittedAt || request.registrationDate).toLocaleDateString()
                        : 'Unknown Date'
                    }`} 
                    color="info"
                    size="small"
                  />
                  <Button 
                    variant="contained" 
                    onClick={() => handleReview(request)}
                  >
                    Review Application
                  </Button>
                </Box>
                <Box>
                  <Typography variant="body2"><strong>Contact Email:</strong> {request.email}</Typography>
                  <Typography variant="body2"><strong>Contact Phone:</strong> {request.phone}</Typography>
                  <Typography variant="body2"><strong>Business Type:</strong> {request.businessType || 'Not specified'}</Typography>
                  <Typography variant="body2"><strong>Status:</strong> {request.status || 'pending'}</Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Verification Review Modal */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Typography variant="h5" component="h2" gutterBottom>
            Seller Verification Review
          </Typography>
          
          {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
          
          {selectedRequest && (
            <>
              <Typography variant="h6">{selectedRequest.businessName}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Application ID: {selectedRequest.id}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Business Information</Typography>
                <Typography variant="body2"><strong>Type:</strong> {selectedRequest.businessType}</Typography>
                <Typography variant="body2"><strong>Address:</strong> {selectedRequest.address}</Typography>
                <Typography variant="body2"><strong>Registration Number:</strong> {selectedRequest.registrationNumber}</Typography>
                <Typography variant="body2"><strong>Tax ID:</strong> {selectedRequest.taxId}</Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Contact Information</Typography>
                <Typography variant="body2"><strong>Name:</strong> {selectedRequest.contactName}</Typography>
                <Typography variant="body2"><strong>Email:</strong> {selectedRequest.email}</Typography>
                <Typography variant="body2"><strong>Phone:</strong> {selectedRequest.phone}</Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Documents</Typography>
                <Grid container spacing={2}>
                  {selectedRequest.documents && selectedRequest.documents.length > 0 ? (
                    selectedRequest.documents.map((doc, index) => (
                      <Grid item key={index} xs={12} sm={6}>
                        <Box sx={{ 
                          p: 2, 
                          border: 1, 
                          borderColor: 'grey.300', 
                          borderRadius: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {doc.originalName || doc.filename}
                            </Typography>
                            <Chip 
                              label={doc.storage === 'supabase' ? 'Cloud' : 'Legacy'} 
                              size="small" 
                              color={doc.storage === 'supabase' ? 'success' : 'warning'}
                              variant="outlined"
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            Type: {doc.mimetype || 'Unknown'} • Size: {doc.size ? `${Math.round(doc.size / 1024)}KB` : 'Unknown'}
                          </Typography>
                          <Button 
                            variant="outlined"
                            size="small"
                            onClick={() => handleDownloadDocument(doc)}
                            fullWidth
                          >
                            Download Document
                          </Button>
                        </Box>
                      </Grid>
                    ))
                  ) : (
                    <Grid item>
                      <Typography variant="body2" color="text.secondary">
                        No documents uploaded
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
              
              <TextField
                label="Verification Notes"
                multiline
                rows={3}
                value={verificationNotes}
                onChange={e => setVerificationNotes(e.target.value)}
                placeholder="Add notes about this verification review..."
                fullWidth
                sx={{ mb: 3 }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button onClick={handleClose} disabled={processing}>
                  Cancel
                </Button>
                <Button 
                  variant="outlined" 
                  color="error" 
                  onClick={() => handleUpdateStatus('rejected')}
                  disabled={processing}
                  startIcon={processing && <CircularProgress size={20} />}
                >
                  Reject
                </Button>
                <Button 
                  variant="contained" 
                  color="success" 
                  onClick={() => handleUpdateStatus('approved')}
                  disabled={processing}
                  startIcon={processing && <CircularProgress size={20} />}
                >
                  Approve
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default SellerVerification;
