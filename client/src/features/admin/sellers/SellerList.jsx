import React, { useState } from 'react';
import { Table, Badge, Button, Form, InputGroup, Spinner } from 'react-bootstrap';

const SellerList = ({ sellers, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge bg="success">Approved</Badge>;
      case 'pending':
        return <Badge bg="warning">Pending</Badge>;
      case 'rejected':
        return <Badge bg="danger">Rejected</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };
  
  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = 
      seller.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.email.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = filterStatus === 'all' || seller.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="text-center p-5"><Spinner animation="border" /></div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Sellers</h2>
        <Button variant="primary">Export List</Button>
      </div>
      
      <div className="mb-4 d-flex">
        <InputGroup className="me-3" style={{ maxWidth: '400px' }}>
          <InputGroup.Text>
            <i className="bi bi-search"></i>
          </InputGroup.Text>
          <Form.Control 
            placeholder="Search by name, email, etc." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        
        <Form.Select 
          style={{ maxWidth: '200px' }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </Form.Select>
      </div>
      
      {filteredSellers.length === 0 ? (
        <p className="text-center py-4">No sellers found matching your criteria.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Business Name</th>
              <th>Contact Person</th>
              <th>Email</th>
              <th>Registration Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSellers.map(seller => (
              <tr key={seller.id}>
                <td>{seller.businessName}</td>
                <td>{seller.contactName}</td>
                <td>{seller.email}</td>
                <td>{new Date(seller.registrationDate).toLocaleDateString()}</td>
                <td>{getStatusBadge(seller.status)}</td>
                <td>
                  <Button variant="outline-primary" size="sm" className="me-2">
                    View
                  </Button>
                  <Button variant="outline-secondary" size="sm">
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default SellerList;
