import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Nav, Tab } from 'react-bootstrap';
import CommissionRates from './CommissionRates';
import CommissionSettings from './CommissionSettings';
import CommissionHistory from './CommissionHistory';
import { commissionApi } from '../../../data/commissionApi';

const CommissionManagement = () => {
  const [commissionData, setCommissionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('rates');

  useEffect(() => {
    const fetchCommissionData = async () => {
      try {
        setLoading(true);
        const data = await commissionApi.getCommissionStructure();
        setCommissionData(data);
        setError(null);
      } catch (err) {
        setError('Failed to load commission data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommissionData();
  }, []);

  const handleCommissionUpdate = async (updatedData) => {
    try {
      setLoading(true);
      // This would need to be implemented properly based on what's being updated
      const data = await commissionApi.updateCommissionTiers(updatedData);
      setCommissionData(data);
      setError(null);
    } catch (err) {
      setError('Failed to update commission structure. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="p-4">
      <h1 className="mb-4">Commission Management</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Commission Overview</Card.Title>
          <Row>
            <Col md={4}>
              <div className="stat-card">
                <h3>Average Commission Rate</h3>
                <p className="display-4">
                  {loading ? <Spinner animation="border" size="sm" /> : 
                    commissionData ? `${commissionData.averageRate}%` : 'N/A'}
                </p>
              </div>
            </Col>
            <Col md={4}>
              <div className="stat-card">
                <h3>Commission Paid (Month)</h3>
                <p className="display-4">
                  {loading ? <Spinner animation="border" size="sm" /> : 
                    commissionData ? `$${commissionData.monthlyPaid.toLocaleString()}` : 'N/A'}
                </p>
              </div>
            </Col>
            <Col md={4}>
              <div className="stat-card">
                <h3>Active Sellers</h3>
                <p className="display-4">
                  {loading ? <Spinner animation="border" size="sm" /> : 
                    commissionData ? commissionData.activeSellers.toLocaleString() : 'N/A'}
                </p>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      <Tab.Container id="commission-tabs" activeKey={activeTab} onSelect={setActiveTab}>
        <Row>
          <Col md={3}>
            <Nav variant="pills" className="flex-column">
              <Nav.Item>
                <Nav.Link eventKey="rates">Commission Rates</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="settings">Commission Settings</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="history">Commission History</Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
          <Col md={9}>
            <Tab.Content>
              <Tab.Pane eventKey="rates">
                <CommissionRates 
                  commissionData={commissionData} 
                  loading={loading}
                  onUpdate={handleCommissionUpdate}
                />
              </Tab.Pane>
              <Tab.Pane eventKey="settings">
                <CommissionSettings 
                  commissionData={commissionData} 
                  loading={loading}
                  onUpdate={handleCommissionUpdate}
                />
              </Tab.Pane>
              <Tab.Pane eventKey="history">
                <CommissionHistory />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
};

export default CommissionManagement;
