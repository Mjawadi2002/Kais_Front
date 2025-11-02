import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Row, 
  Col, 
  Button, 
  Alert,
  Badge,
  Card,
  InputGroup
} from 'react-bootstrap';
import { 
  BsBox, 
  BsPerson, 
  BsTruck, 
  BsGeoAlt, 
  BsTelephone,
  BsCalendar,
  BsTextareaT,
  BsCurrencyDollar
} from 'react-icons/bs';
import { toast } from 'react-toastify';
import apiClient from '../config/apiClient';

export default function DeliveryModal({ 
  show, 
  onHide, 
  delivery = null, 
  type = 'view', // 'view', 'edit', 'create'
  onSuccess 
}) {
  const [formData, setFormData] = useState({
    product: '',
    client: '',
    deliveryPerson: '',
    priority: 'medium',
    status: 'pending',
    deliveryAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Tunisia'
    },
    clientPhone: '',
    deliveryFee: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [products, setProducts] = useState([]);

  const statusOptions = [
    { value: 'pending', label: 'Pending', variant: 'warning' },
    { value: 'assigned', label: 'Assigned', variant: 'info' },
    { value: 'in_transit', label: 'In Transit', variant: 'primary' },
    { value: 'delivered', label: 'Delivered', variant: 'success' },
    { value: 'cancelled', label: 'Cancelled', variant: 'danger' },
    { value: 'failed', label: 'Failed', variant: 'dark' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', variant: 'success' },
    { value: 'medium', label: 'Medium', variant: 'info' },
    { value: 'high', label: 'High', variant: 'warning' },
    { value: 'urgent', label: 'Urgent', variant: 'danger' }
  ];

  // Load form data when delivery changes
  useEffect(() => {
    if (delivery && (type === 'view' || type === 'edit')) {
      setFormData({
        product: delivery.product?._id || '',
        client: delivery.client?._id || '',
        deliveryPerson: delivery.deliveryPerson?._id || '',
        priority: delivery.priority || 'medium',
        status: delivery.status || 'pending',
        deliveryAddress: {
          street: delivery.deliveryAddress?.street || '',
          city: delivery.deliveryAddress?.city || '',
          state: delivery.deliveryAddress?.state || '',
          zipCode: delivery.deliveryAddress?.zipCode || '',
          country: delivery.deliveryAddress?.country || 'Tunisia'
        },
        clientPhone: delivery.clientPhone || '',
        deliveryFee: delivery.deliveryFee?.toString() || '',
        notes: delivery.notes || ''
      });
    } else if (type === 'create') {
      // Reset form for create
      setFormData({
        product: '',
        client: '',
        deliveryPerson: '',
        priority: 'medium',
        status: 'pending',
        deliveryAddress: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'Tunisia'
        },
        clientPhone: '',
        deliveryFee: '',
        notes: ''
      });
    }
    setErrors({});
  }, [delivery, type]);

  // Load dropdown data
  useEffect(() => {
    if (show) {
      loadDropdownData();
    }
  }, [show]);

  const loadDropdownData = async () => {
    try {
      const [clientsRes, deliveryPersonsRes, productsRes] = await Promise.all([
        apiClient.get('/api/v1/users?role=client'),
        apiClient.get('/api/v1/users?role=delivery'),
        apiClient.get('/api/v1/products')
      ]);
      
      setClients(clientsRes.data.users || clientsRes.data || []);
      setDeliveryPersons(deliveryPersonsRes.data.users || deliveryPersonsRes.data || []);
      setProducts(productsRes.data.products || productsRes.data || []);
    } catch (error) {
      console.error('Failed to load dropdown data:', error);
      toast.error('Failed to load form data');
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.product) newErrors.product = 'Product is required';
    if (!formData.client) newErrors.client = 'Client is required';
    if (!formData.deliveryAddress.street) newErrors['deliveryAddress.street'] = 'Street address is required';
    if (!formData.deliveryAddress.city) newErrors['deliveryAddress.city'] = 'City is required';
    if (!formData.deliveryAddress.zipCode) newErrors['deliveryAddress.zipCode'] = 'Zip code is required';
    if (!formData.clientPhone) newErrors.clientPhone = 'Client phone is required';
    if (!formData.deliveryFee || isNaN(parseFloat(formData.deliveryFee)) || parseFloat(formData.deliveryFee) < 0) {
      newErrors.deliveryFee = 'Valid delivery fee is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        deliveryFee: parseFloat(formData.deliveryFee)
      };

      if (type === 'create') {
        await apiClient.post('/api/v1/deliveries', submitData);
        toast.success('Delivery created successfully');
      } else if (type === 'edit') {
        await apiClient.put(`/api/v1/deliveries/${delivery._id}`, submitData);
        toast.success('Delivery updated successfully');
      }

      onSuccess?.();
      onHide();
    } catch (error) {
      console.error('Failed to save delivery:', error);
      toast.error(error.response?.data?.message || 'Failed to save delivery');
    } finally {
      setLoading(false);
    }
  };

  // Get field error
  const getFieldError = (field) => {
    return errors[field];
  };

  const isReadOnly = type === 'view';
  const selectedClient = clients.find(c => c._id === formData.client);
  const selectedProduct = products.find(p => p._id === formData.product);
  const selectedDeliveryPerson = deliveryPersons.find(p => p._id === formData.deliveryPerson);

  return (
    <Modal show={show} onHide={onHide} size="xl" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          {type === 'create' && 'Create New Delivery'}
          {type === 'edit' && 'Edit Delivery'}
          {type === 'view' && (
            <div className="d-flex align-items-center gap-2">
              Delivery Details
              {delivery?.trackingNumber && (
                <Badge bg="primary">{delivery.trackingNumber}</Badge>
              )}
            </div>
          )}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className="g-4">
            {/* Product Selection */}
            <Col md={6}>
              <Card className="h-100">
                <Card.Header>
                  <BsBox className="me-2" />
                  Product Information
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Product *</Form.Label>
                    <Form.Select
                      value={formData.product}
                      onChange={(e) => handleInputChange('product', e.target.value)}
                      isInvalid={!!getFieldError('product')}
                      disabled={isReadOnly}
                    >
                      <option value="">Select a product</option>
                      {products.map(product => (
                        <option key={product._id} value={product._id}>
                          {product.name} - ${product.price}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {getFieldError('product')}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {selectedProduct && (
                    <Alert variant="info" className="small">
                      <strong>Category:</strong> {selectedProduct.category}<br />
                      <strong>Price:</strong> ${selectedProduct.price}<br />
                      <strong>Description:</strong> {selectedProduct.description}
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Client Selection */}
            <Col md={6}>
              <Card className="h-100">
                <Card.Header>
                  <BsPerson className="me-2" />
                  Client Information
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Client *</Form.Label>
                    <Form.Select
                      value={formData.client}
                      onChange={(e) => handleInputChange('client', e.target.value)}
                      isInvalid={!!getFieldError('client')}
                      disabled={isReadOnly}
                    >
                      <option value="">Select a client</option>
                      {clients.map(client => (
                        <option key={client._id} value={client._id}>
                          {client.name} ({client.email})
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {getFieldError('client')}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Client Phone *</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <BsTelephone />
                      </InputGroup.Text>
                      <Form.Control
                        type="tel"
                        value={formData.clientPhone}
                        onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                        placeholder="Enter client phone number"
                        isInvalid={!!getFieldError('clientPhone')}
                        disabled={isReadOnly}
                      />
                      <Form.Control.Feedback type="invalid">
                        {getFieldError('clientPhone')}
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>

                  {selectedClient && (
                    <Alert variant="info" className="small">
                      <strong>Email:</strong> {selectedClient.email}<br />
                      <strong>Role:</strong> {selectedClient.role}
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Delivery Address */}
            <Col md={6}>
              <Card className="h-100">
                <Card.Header>
                  <BsGeoAlt className="me-2" />
                  Delivery Address
                </Card.Header>
                <Card.Body>
                  <Row className="g-3">
                    <Col xs={12}>
                      <Form.Group>
                        <Form.Label>Street Address *</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.deliveryAddress.street}
                          onChange={(e) => handleInputChange('deliveryAddress.street', e.target.value)}
                          placeholder="Enter street address"
                          isInvalid={!!getFieldError('deliveryAddress.street')}
                          disabled={isReadOnly}
                        />
                        <Form.Control.Feedback type="invalid">
                          {getFieldError('deliveryAddress.street')}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>City *</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.deliveryAddress.city}
                          onChange={(e) => handleInputChange('deliveryAddress.city', e.target.value)}
                          placeholder="Enter city"
                          isInvalid={!!getFieldError('deliveryAddress.city')}
                          disabled={isReadOnly}
                        />
                        <Form.Control.Feedback type="invalid">
                          {getFieldError('deliveryAddress.city')}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>State/Province</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.deliveryAddress.state}
                          onChange={(e) => handleInputChange('deliveryAddress.state', e.target.value)}
                          placeholder="Enter state"
                          disabled={isReadOnly}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Zip Code *</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.deliveryAddress.zipCode}
                          onChange={(e) => handleInputChange('deliveryAddress.zipCode', e.target.value)}
                          placeholder="Enter zip code"
                          isInvalid={!!getFieldError('deliveryAddress.zipCode')}
                          disabled={isReadOnly}
                        />
                        <Form.Control.Feedback type="invalid">
                          {getFieldError('deliveryAddress.zipCode')}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Country</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.deliveryAddress.country}
                          onChange={(e) => handleInputChange('deliveryAddress.country', e.target.value)}
                          disabled={isReadOnly}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            {/* Delivery Settings */}
            <Col md={6}>
              <Card className="h-100">
                <Card.Header>
                  <BsTruck className="me-2" />
                  Delivery Settings
                </Card.Header>
                <Card.Body>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Delivery Person</Form.Label>
                        <Form.Select
                          value={formData.deliveryPerson}
                          onChange={(e) => handleInputChange('deliveryPerson', e.target.value)}
                          disabled={isReadOnly}
                        >
                          <option value="">Unassigned</option>
                          {deliveryPersons.map(person => (
                            <option key={person._id} value={person._id}>
                              {person.name} ({person.email})
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Priority</Form.Label>
                        <Form.Select
                          value={formData.priority}
                          onChange={(e) => handleInputChange('priority', e.target.value)}
                          disabled={isReadOnly}
                        >
                          {priorityOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    {type !== 'create' && (
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Status</Form.Label>
                          <Form.Select
                            value={formData.status}
                            onChange={(e) => handleInputChange('status', e.target.value)}
                            disabled={isReadOnly}
                          >
                            {statusOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    )}

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Delivery Fee *</Form.Label>
                        <InputGroup>
                          <InputGroup.Text>
                            <BsCurrencyDollar />
                          </InputGroup.Text>
                          <Form.Control
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.deliveryFee}
                            onChange={(e) => handleInputChange('deliveryFee', e.target.value)}
                            placeholder="0.00"
                            isInvalid={!!getFieldError('deliveryFee')}
                            disabled={isReadOnly}
                          />
                          <Form.Control.Feedback type="invalid">
                            {getFieldError('deliveryFee')}
                          </Form.Control.Feedback>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  {selectedDeliveryPerson && (
                    <Alert variant="info" className="small mt-3">
                      <strong>Assigned to:</strong> {selectedDeliveryPerson.name}<br />
                      <strong>Contact:</strong> {selectedDeliveryPerson.email}
                    </Alert>
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Notes */}
            <Col xs={12}>
              <Card>
                <Card.Header>
                  <BsTextareaT className="me-2" />
                  Additional Notes
                </Card.Header>
                <Card.Body>
                  <Form.Group>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Any special delivery instructions or notes..."
                      disabled={isReadOnly}
                    />
                  </Form.Group>
                </Card.Body>
              </Card>
            </Col>

            {/* Additional Info for View Mode */}
            {type === 'view' && delivery && (
              <Col xs={12}>
                <Card>
                  <Card.Header>
                    <BsCalendar className="me-2" />
                    Delivery Timeline
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={4}>
                        <strong>Created:</strong><br />
                        <span className="text-muted">
                          {new Date(delivery.createdAt).toLocaleString()}
                        </span>
                      </Col>
                      <Col md={4}>
                        <strong>Last Updated:</strong><br />
                        <span className="text-muted">
                          {new Date(delivery.updatedAt).toLocaleString()}
                        </span>
                      </Col>
                      <Col md={4}>
                        <strong>Estimated Delivery:</strong><br />
                        <span className="text-muted">
                          {delivery.estimatedDeliveryDate 
                            ? new Date(delivery.estimatedDeliveryDate).toLocaleString()
                            : 'Not set'
                          }
                        </span>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            )}
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            {isReadOnly ? 'Close' : 'Cancel'}
          </Button>
          {!isReadOnly && (
            <Button 
              type="submit" 
              variant="primary" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  {type === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                type === 'create' ? 'Create Delivery' : 'Update Delivery'
              )}
            </Button>
          )}
        </Modal.Footer>
      </Form>
    </Modal>
  );
}