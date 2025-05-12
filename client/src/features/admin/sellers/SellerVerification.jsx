import React, { useState } from 'react';
import { Card, Button, Badge, Form, Modal, Spinner, Alert } from 'react-bootstrap';
import { sellerApi } from '../../../data/sellerApi';

const SellerVerification = ({ requests, loading, onVerificationComplete }) => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleReview = (request) => {
    setSelectedRequest(request);
    setVerificationNotes('');
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
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

  if (loading) {
    return <div className="text-center p-5"><Spinner animation="border" /></div>;
  }

  return (
    <div>
      <h2>Seller Verification Requests</h2>
      
      {requests.length === 0 ? (
        <Alert variant="info">No pending verification requests</Alert>
      ) : (
        <div className="verification-list">
          {requests.map(request => (
            <Card key={request.id} className="mb-3">
              <Card.Body>
                <Card.Title>{request.businessName}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  Submitted by: {request.contactName}
                </Card.Subtitle>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <Badge bg="info">Submitted: {new Date(request.submittedAt).toLocaleDateString()}</Badge>
                  </div>
                  <Button 
                    variant="primary" 
                    onClick={() => handleReview(request)}
                  >
                    Review Application
                  </Button>
                </div>
                <Card.Text>
                  <strong>Contact Email:</strong> {request.email}<br />
                  <strong>Contact Phone:</strong> {request.phone}<br />
                  <strong>Business Type:</strong> {request.businessType}
                </Card.Text>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* Verification Review Modal */}
      <Modal show={showModal} onHide={handleClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Seller Verification Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          {selectedRequest && (
            <>
              <h5>{selectedRequest.businessName}</h5>
              <p className="text-muted">Application ID: {selectedRequest.id}</p>
              
              <hr />
              
              <div className="mb-4">
                <h6>Business Information</h6>
                <p><strong>Type:</strong> {selectedRequest.businessType}</p>
                <p><strong>Address:</strong> {selectedRequest.address}</p>
                <p><strong>Registration Number:</strong> {selectedRequest.registrationNumber}</p>
                <p><strong>Tax ID:</strong> {selectedRequest.taxId}</p>
              </div>
              
              <div className="mb-4">
                <h6>Contact Information</h6>
                <p><strong>Name:</strong> {selectedRequest.contactName}</p>
                <p><strong>Email:</strong> {selectedRequest.email}</p>
                <p><strong>Phone:</strong> {selectedRequest.phone}</p>
              </div>
              
              <div className="mb-4">
                <h6>Documents</h6>
                <div className="d-flex flex-wrap">
                  {selectedRequest.documents.map((doc, index) => (
                    <div key={index} className="document-preview me-3 mb-3">
                      <a href={doc.url} target="_blank" rel="noreferrer">
                        {doc.type} Document
                      </a>
                    </div>
                  ))}
                </div>
              </div>
              
              <Form.Group className="mb-3">
                <Form.Label>Verification Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={verificationNotes}
                  onChange={e => setVerificationNotes(e.target.value)}
                  placeholder="Add notes about this verification review..."
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={processing}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={() => handleUpdateStatus('rejected')}
            disabled={processing}
          >
            {processing ? <Spinner animation="border" size="sm" /> : 'Reject'}
          </Button>
          <Button 
            variant="success" 
            onClick={() => handleUpdateStatus('approved')}
            disabled={processing}
          >
            {processing ? <Spinner animation="border" size="sm" /> : 'Approve'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SellerVerification;
