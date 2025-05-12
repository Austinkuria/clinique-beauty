import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import { commissionApi } from '../../../data/commissionApi';

const CommissionHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    sellerId: '',
    status: 'all'
  });

  useEffect(() => {
    const fetchCommissionHistory = async () => {
      try {
        setLoading(true);
        const data = await commissionApi.getCommissionHistory(filters);
        setHistory(data);
        setError(null);
      } catch (err) {
        setError('Failed to load commission history. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommissionHistory();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      sellerId: '',
      status: 'all'
    });
  };

  return (
    <Card>
      <Card.Header>
        <h4>Commission Payment History</h4>
      </Card.Header>
      <Card.Body>
        <div className="filters mb-4">
          <h5>Filter Commission Records</h5>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Seller ID</Form.Label>
                <Form.Control
                  type="text"
                  name="sellerId"
                  value={filters.sellerId}
                  onChange={handleFilterChange}
                  placeholder="Enter seller ID"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Payment Status</Form.Label>
                <Form.Select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={resetFilters}>Reset Filters</Button>
          </div>
        </div>
        
        {error && <Alert variant="danger">{error}</Alert>}
        
        {loading ? (
          <div className="text-center p-5"><Spinner animation="border" /></div>
        ) : history.length === 0 ? (
          <Alert variant="info">No commission records found matching your criteria.</Alert>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Seller</th>
                <th>Amount</th>
                <th>Commission Rate</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map(record => (
                <tr key={record.id}>
                  <td>{record.id}</td>
                  <td>
                    {record.sellerName}
                    <div className="text-muted small">{record.sellerId}</div>
                  </td>
                  <td>${record.amount.toFixed(2)}</td>
                  <td>{record.rate}%</td>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge bg-${
                      record.status === 'paid' ? 'success' : 
                      record.status === 'pending' ? 'warning' : 'danger'
                    }`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
};

export default CommissionHistory;
