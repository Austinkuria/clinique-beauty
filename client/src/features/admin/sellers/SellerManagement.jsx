import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Nav, Tab, Alert } from 'react-bootstrap';
import { sellerApi } from '../../../data/sellerApi';
import SellerVerification from './SellerVerification';
import SellerOnboarding from './SellerOnboarding';
import SellerList from './SellerList';

const SellerManagement = () => {
  const [activeTab, setActiveTab] = useState('sellers');
  const [sellers, setSellers] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        setLoading(true);
        const [sellersData, verificationData] = await Promise.all([
          sellerApi.getSellers(),
          sellerApi.getVerificationRequests()
        ]);
        setSellers(sellersData);
        setPendingVerifications(verificationData);
        setError(null);
      } catch (err) {
        setError('Failed to load seller data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, []);

  const handleVerificationComplete = async () => {
    // Refresh the verification requests
    try {
      const verificationData = await sellerApi.getVerificationRequests();
      setPendingVerifications(verificationData);
    } catch (err) {
      console.error('Failed to refresh verification requests:', err);
    }
  };

  return (
    <Container fluid className="p-4">
      <h1 className="mb-4">Seller Management</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Tab.Container id="seller-management-tabs" activeKey={activeTab} onSelect={setActiveTab}>
        <Row>
          <Col md={3}>
            <Nav variant="pills" className="flex-column">
              <Nav.Item>
                <Nav.Link eventKey="sellers">All Sellers</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="verification">
                  Verification Requests
                  {pendingVerifications.length > 0 && (
                    <span className="badge bg-primary ms-2">{pendingVerifications.length}</span>
                  )}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="onboarding">Seller Onboarding</Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
          <Col md={9}>
            <Tab.Content>
              <Tab.Pane eventKey="sellers">
                <SellerList sellers={sellers} loading={loading} />
              </Tab.Pane>
              <Tab.Pane eventKey="verification">
                <SellerVerification 
                  requests={pendingVerifications} 
                  loading={loading}
                  onVerificationComplete={handleVerificationComplete}
                />
              </Tab.Pane>
              <Tab.Pane eventKey="onboarding">
                <SellerOnboarding />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
};

export default SellerManagement;
