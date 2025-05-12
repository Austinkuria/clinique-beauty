import React, { useState } from 'react';
import { Card, Table, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { commissionApi } from '../../../data/commissionApi';

const CommissionRates = ({ commissionData, loading, onUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [updatedRates, setUpdatedRates] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Initialize updated rates with current data when commissionData changes
  React.useEffect(() => {
    if (commissionData && commissionData.categoryRates) {
      const initialRates = {};
      commissionData.categoryRates.forEach(category => {
        initialRates[category.id] = category.rate;
      });
      setUpdatedRates(initialRates);
    }
  }, [commissionData]);

  const handleRateChange = (categoryId, value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      setUpdatedRates({
        ...updatedRates,
        [categoryId]: numValue
      });
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      // Prepare data for API
      const updatedCategoryRates = Object.entries(updatedRates).map(([id, rate]) => ({
        id,
        rate
      }));
      
      // Simulate API call for now
      // await commissionApi.updateCategoryRates(updatedCategoryRates);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onUpdate) {
        onUpdate({
          ...commissionData,
          categoryRates: commissionData.categoryRates.map(category => ({
            ...category,
            rate: updatedRates[category.id] || category.rate
          }))
        });
      }
      
      setSuccess(true);
      setEditMode(false);
      
    } catch (err) {
      setError('Failed to update commission rates. Please try again.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original rates
    if (commissionData && commissionData.categoryRates) {
      const originalRates = {};
      commissionData.categoryRates.forEach(category => {
        originalRates[category.id] = category.rate;
      });
      setUpdatedRates(originalRates);
    }
    setEditMode(false);
    setError(null);
    setSuccess(false);
  };

  if (loading) {
    return <div className="text-center p-5"><Spinner animation="border" /></div>;
  }

  if (!commissionData || !commissionData.categoryRates) {
    return <Alert variant="info">No commission data available</Alert>;
  }

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h4 className="mb-0">Commission Rates by Category</h4>
        {!editMode ? (
          <Button variant="primary" onClick={() => setEditMode(true)}>
            Edit Rates
          </Button>
        ) : (
          <div>
            <Button variant="secondary" onClick={handleCancel} className="me-2" disabled={saving}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />{' '}
                  Saving...
                </>
              ) : 'Save Changes'}
            </Button>
          </div>
        )}
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">Commission rates updated successfully!</Alert>}
        
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Category</th>
              <th>Commission Rate (%)</th>
              {editMode && <th>New Rate (%)</th>}
            </tr>
          </thead>
          <tbody>
            {commissionData.categoryRates.map(category => (
              <tr key={category.id}>
                <td>{category.name}</td>
                <td>{category.rate}%</td>
                {editMode && (
                  <td>
                    <Form.Control
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={updatedRates[category.id] || ''}
                      onChange={(e) => handleRateChange(category.id, e.target.value)}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default CommissionRates;
