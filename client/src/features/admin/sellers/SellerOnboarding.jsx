import React, { useState } from 'react';
import { Form, Button, Card, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { sellerApi } from '../../../data/sellerApi';

const SellerOnboarding = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    registrationNumber: '',
    taxId: '',
    documents: [],
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    accountHolder: '',
    termsAccepted: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      setFormData({
        ...formData,
        documents: [...formData.documents, ...Array.from(files)]
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Create FormData object to handle file uploads
      const data = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key !== 'documents') {
          data.append(key, formData[key]);
        }
      });
      
      // Add all documents
      formData.documents.forEach(file => {
        data.append('documents', file);
      });
      
      // Submit to API (stub - you'd need to create this endpoint)
      // await sellerApi.createSeller(data);
      
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      
      // Reset form after success
      setFormData({
        businessName: '',
        businessType: '',
        contactName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        registrationNumber: '',
        taxId: '',
        documents: [],
        bankName: '',
        accountNumber: '',
        routingNumber: '',
        accountHolder: '',
        termsAccepted: false
      });
      
      // Go back to first step
      setStep(1);
      
    } catch (err) {
      setError('Failed to submit seller application. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <Card>
            <Card.Header>
              <h4>Business Information</h4>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Business Name</Form.Label>
                <Form.Control
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Business Type</Form.Label>
                <Form.Select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select type...</option>
                  <option value="Individual">Individual</option>
                  <option value="LLC">LLC</option>
                  <option value="Corporation">Corporation</option>
                  <option value="Partnership">Partnership</option>
                </Form.Select>
              </Form.Group>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Registration Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tax ID</Form.Label>
                    <Form.Control
                      type="text"
                      name="taxId"
                      value={formData.taxId}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>State/Province</Form.Label>
                    <Form.Control
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Postal/ZIP Code</Form.Label>
                    <Form.Control
                      type="text"
                      name="zip"
                      value={formData.zip}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Country</Form.Label>
                    <Form.Control
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
            <Card.Footer className="d-flex justify-content-end">
              <Button variant="primary" onClick={nextStep}>
                Next
              </Button>
            </Card.Footer>
          </Card>
        );
        
      case 2:
        return (
          <Card>
            <Card.Header>
              <h4>Contact Information</h4>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Contact Person Name</Form.Label>
                <Form.Control
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Upload Documents</Form.Label>
                <Form.Control
                  type="file"
                  multiple
                  name="documents"
                  onChange={handleChange}
                />
                <Form.Text className="text-muted">
                  Please upload business registration, ID proof, and other relevant documents.
                </Form.Text>
              </Form.Group>
              
              {formData.documents.length > 0 && (
                <div className="mb-3">
                  <p><strong>Selected Documents:</strong></p>
                  <ul>
                    {formData.documents.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card.Body>
            <Card.Footer className="d-flex justify-content-between">
              <Button variant="secondary" onClick={prevStep}>
                Back
              </Button>
              <Button variant="primary" onClick={nextStep}>
                Next
              </Button>
            </Card.Footer>
          </Card>
        );
        
      case 3:
        return (
          <Card>
            <Card.Header>
              <h4>Payment Information</h4>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Bank Name</Form.Label>
                <Form.Control
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Account Holder Name</Form.Label>
                <Form.Control
                  type="text"
                  name="accountHolder"
                  value={formData.accountHolder}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Account Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Routing Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="routingNumber"
                      value={formData.routingNumber}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  label="I accept the terms and conditions for seller registration"
                  required
                />
              </Form.Group>
            </Card.Body>
            <Card.Footer className="d-flex justify-content-between">
              <Button variant="secondary" onClick={prevStep}>
                Back
              </Button>
              <Button 
                variant="success" 
                type="submit" 
                disabled={loading || !formData.termsAccepted}
                onClick={handleSubmit}
              >
                {loading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />{' '}
                    Processing...
                  </>
                ) : 'Submit Application'}
              </Button>
            </Card.Footer>
          </Card>
        );
        
      default:
        return null;
    }
  };

  return (
    <div>
      <h2>Seller Onboarding</h2>
      <p className="text-muted">Complete the form to register a new seller</p>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">Seller application submitted successfully!</Alert>}
      
      <div className="progress-indicator mb-4">
        <div className="d-flex justify-content-between">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-title">Business Information</div>
          </div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-title">Contact Details</div>
          </div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-title">Payment Information</div>
          </div>
        </div>
      </div>
      
      <Form onSubmit={handleSubmit}>
        {renderStep()}
      </Form>
    </div>
  );
};

export default SellerOnboarding;
