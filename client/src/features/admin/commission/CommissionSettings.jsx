import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';

const CommissionSettings = ({ commissionData, loading, onUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [settingsForm, setSettingsForm] = useState({
    defaultCommissionRate: 0,
    minimumPayoutAmount: 0,
    payoutSchedule: 'monthly',
    tierBased: false,
    tiers: []
  });
  
  // Initialize form with data when it changes
  React.useEffect(() => {
    if (commissionData && commissionData.settings) {
      setSettingsForm({
        defaultCommissionRate: commissionData.settings.defaultCommissionRate || 0,
        minimumPayoutAmount: commissionData.settings.minimumPayoutAmount || 0,
        payoutSchedule: commissionData.settings.payoutSchedule || 'monthly',
        tierBased: commissionData.settings.tierBased || false,
        tiers: commissionData.settings.tiers || []
      });
    }
  }, [commissionData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettingsForm({
      ...settingsForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleTierChange = (index, field, value) => {
    const updatedTiers = [...settingsForm.tiers];
    updatedTiers[index] = {
      ...updatedTiers[index],
      [field]: value
    };
    setSettingsForm({
      ...settingsForm,
      tiers: updatedTiers
    });
  };
  
  const addTier = () => {
    setSettingsForm({
      ...settingsForm,
      tiers: [
        ...settingsForm.tiers,
        { name: `Tier ${settingsForm.tiers.length + 1}`, minSales: 0, rate: 0 }
      ]
    });
  };
  
  const removeTier = (index) => {
    const updatedTiers = [...settingsForm.tiers];
    updatedTiers.splice(index, 1);
    setSettingsForm({
      ...settingsForm,
      tiers: updatedTiers
    });
  };
  
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onUpdate) {
        onUpdate({
          ...commissionData,
          settings: settingsForm
        });
      }
      
      setSuccess(true);
      setEditMode(false);
      
    } catch (err) {
      setError('Failed to update commission settings. Please try again.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  const handleCancel = () => {
    // Reset to original settings
    if (commissionData && commissionData.settings) {
      setSettingsForm({
        defaultCommissionRate: commissionData.settings.defaultCommissionRate || 0,
        minimumPayoutAmount: commissionData.settings.minimumPayoutAmount || 0,
        payoutSchedule: commissionData.settings.payoutSchedule || 'monthly',
        tierBased: commissionData.settings.tierBased || false,
        tiers: commissionData.settings.tiers || []
      });
    }
    setEditMode(false);
    setError(null);
    setSuccess(false);
  };

  if (loading) {
    return <div className="text-center p-5"><Spinner animation="border" /></div>;
  }

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h4 className="mb-0">Commission Settings</h4>
        {!editMode ? (
          <Button variant="primary" onClick={() => setEditMode(true)}>
            Edit Settings
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
        {success && <Alert variant="success">Commission settings updated successfully!</Alert>}
        
        <Form>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Default Commission Rate (%)</Form.Label>
                <Form.Control
                  type="number"
                  name="defaultCommissionRate"
                  value={settingsForm.defaultCommissionRate}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  min="0"
                  max="100"
                  step="0.1"
                />
                <Form.Text className="text-muted">
                  Applied when no specific category rate is set
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Minimum Payout Amount ($)</Form.Label>
                <Form.Control
                  type="number"
                  name="minimumPayoutAmount"
                  value={settingsForm.minimumPayoutAmount}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  min="0"
                  step="0.01"
                />
                <Form.Text className="text-muted">
                  Minimum amount required for payout processing
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>Payout Schedule</Form.Label>
            <Form.Select 
              name="payoutSchedule"
              value={settingsForm.payoutSchedule}
              onChange={handleInputChange}
              disabled={!editMode}
            >
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </Form.Select>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              name="tierBased"
              checked={settingsForm.tierBased}
              onChange={handleInputChange}
              disabled={!editMode}
              label="Enable Tier-Based Commission Structure"
            />
            <Form.Text className="text-muted">
              Commission rates will be based on seller performance tiers
            </Form.Text>
          </Form.Group>
          
          {settingsForm.tierBased && (
            <div className="tier-settings mt-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Performance Tiers</h5>
                {editMode && (
                  <Button variant="outline-primary" size="sm" onClick={addTier}>
                    Add Tier
                  </Button>
                )}
              </div>
              
              {settingsForm.tiers.map((tier, index) => (
                <Card key={index} className="mb-3">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6>Tier {index + 1}</h6>
                      {editMode && (
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => removeTier(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    
                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Tier Name</Form.Label>
                          <Form.Control
                            type="text"
                            value={tier.name}
                            onChange={(e) => handleTierChange(index, 'name', e.target.value)}
                            disabled={!editMode}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Minimum Sales ($)</Form.Label>
                          <Form.Control
                            type="number"
                            value={tier.minSales}
                            onChange={(e) => handleTierChange(index, 'minSales', Number(e.target.value))}
                            disabled={!editMode}
                            min="0"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Commission Rate (%)</Form.Label>
                          <Form.Control
                            type="number"
                            value={tier.rate}
                            onChange={(e) => handleTierChange(index, 'rate', Number(e.target.value))}
                            disabled={!editMode}
                            min="0"
                            max="100"
                            step="0.1"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}
              
              {settingsForm.tiers.length === 0 && (
                <Alert variant="info">
                  No tiers defined. {editMode && 'Click "Add Tier" to create performance tiers.'}
                </Alert>
              )}
            </div>
          )}
        </Form>
      </Card.Body>
    </Card>
  );
};

export default CommissionSettings;
