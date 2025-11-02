import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Table, 
  Form, 
  Button, 
  Badge, 
  Alert,
  InputGroup,
  Pagination,
  Dropdown
} from 'react-bootstrap';
import { 
  BsSearch, 
  BsTruck,
  BsBox,
  BsPerson,
  BsCurrencyDollar,
  BsCheck2Circle,
  BsCheckCircle,
  BsExclamationTriangle,
  BsX
} from 'react-icons/bs';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../config/apiClient';

export default function ManageDeliveries() {
  const { user } = useAuth();
  
  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter and search states
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    client: '',
    deliveryPerson: ''
  });
  
  // Dropdown data
  const [clients, setClients] = useState([]);
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  
  // Status options based on ProductModel
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'In Stock', label: 'In Stock', variant: 'secondary' },
    { value: 'Picked', label: 'Picked', variant: 'info' },
    { value: 'Out for Delivery', label: 'Out for Delivery', variant: 'primary' },
    { value: 'Delivered', label: 'Delivered', variant: 'success' },
    { value: 'Problem', label: 'Problem', variant: 'warning' },
    { value: 'Failed/Returned', label: 'Failed/Returned', variant: 'danger' }
  ];

  // Load products assigned to delivery persons
  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/v1/products');
      
      let filteredProducts = response.data.products || response.data || [];
      
      // Apply filters
      if (filters.search) {
        filteredProducts = filteredProducts.filter(product => 
          product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          product.buyerName?.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      if (filters.status) {
        filteredProducts = filteredProducts.filter(product => product.status === filters.status);
      }
      
      if (filters.client) {
        filteredProducts = filteredProducts.filter(product => product.client?._id === filters.client);
      }
      
      if (filters.deliveryPerson) {
        filteredProducts = filteredProducts.filter(product => product.assignedTo?._id === filters.deliveryPerson);
      }
      
      setProducts(filteredProducts);
    } catch (error) {
      console.error('Failed to load products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Load dropdown data
  const loadDropdownData = async () => {
    try {
      const [clientsRes, deliveryPersonsRes] = await Promise.all([
        apiClient.get('/api/v1/users?role=client'),
        apiClient.get('/api/v1/users?role=delivery')
      ]);
      
      setClients(clientsRes.data.users || clientsRes.data || []);
      setDeliveryPersons(deliveryPersonsRes.data.users || deliveryPersonsRes.data || []);
    } catch (error) {
      console.error('Failed to load dropdown data:', error);
    }
  };

  // Initial load
  useEffect(() => {
    loadProducts();
    loadDropdownData();
  }, []);

  // Reload when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 300); // Debounce search

    return () => clearTimeout(timer);
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      client: '',
      deliveryPerson: ''
    });
  };

  // Get status badge variant
  const getStatusVariant = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption?.variant || 'secondary';
  };

  // Handle status update
  const handleUpdateStatus = async (productId, newStatus) => {
    try {
      await apiClient.put(`/api/v1/products/${productId}`, { status: newStatus });
      toast.success('Product status updated successfully');
      loadProducts();
    } catch (error) {
      console.error('Failed to update product status:', error);
      toast.error('Failed to update product status');
    }
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h3 className="mb-1">Manage Deliveries</h3>
              <p className="text-muted mb-0">
                Monitor and manage products assigned to delivery persons
              </p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Filters */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <Row className="g-3">
                <Col md={4}>
                  <InputGroup>
                    <InputGroup.Text>
                      <BsSearch />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Search by product name or client name..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                  </InputGroup>
                </Col>
                
                <Col md={2}>
                  <Form.Select 
                    value={filters.status} 
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                
                <Col md={2}>
                  <Form.Select 
                    value={filters.client} 
                    onChange={(e) => handleFilterChange('client', e.target.value)}
                  >
                    <option value="">All Clients</option>
                    {clients.map(client => (
                      <option key={client._id} value={client._id}>
                        {client.username}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                
                <Col md={3}>
                  <Form.Select 
                    value={filters.deliveryPerson} 
                    onChange={(e) => handleFilterChange('deliveryPerson', e.target.value)}
                  >
                    <option value="">All Delivery Persons</option>
                    {deliveryPersons.map(person => (
                      <option key={person._id} value={person._id}>
                        {person.username}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                
                <Col md={1}>
                  <Button variant="outline-secondary" onClick={clearFilters}>
                    Clear
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Products Table */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <BsBox className="me-2" />
                  Products ({products.length})
                </h5>
              </div>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : products.length === 0 ? (
                <Alert variant="info" className="text-center">
                  <BsBox size={48} className="mb-3 text-muted" />
                  <h5>No products found</h5>
                  <p className="mb-0">Try adjusting your filters.</p>
                </Alert>
              ) : (
                <div className="table-responsive">
                  <Table hover>
                    <thead className="table-light">
                      <tr>
                        <th>Product Name</th>
                        <th>Price</th>
                        <th>Delivery Person</th>
                        <th>Client</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(product => (
                        <tr key={product._id} className="table-row-hover">
                          <td>
                            <div className="d-flex align-items-center">
                              <BsBox className="me-2 text-muted" />
                              <strong>{product.name}</strong>
                            </div>
                          </td>
                          <td>
                            <span className="text-success fw-bold">
                              {product.price} TND
                            </span>
                          </td>
                          <td>
                            {product.assignedTo ? (
                              <div className="d-flex align-items-center">
                                <BsTruck className="me-2 text-muted" />
                                <div>
                                  <div className="fw-medium">{product.assignedTo.username}</div>
                                  <div className="small text-muted">{product.assignedTo.email}</div>
                                </div>
                              </div>
                            ) : (
                              <Badge bg="secondary">Not assigned</Badge>
                            )}
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <BsPerson className="me-2 text-muted" />
                              <div>
                                <div className="fw-medium">
                                  {product.client?.username || product.buyerName || 'N/A'}
                                </div>
                                {product.client?.email && (
                                  <div className="small text-muted">{product.client.email}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <Dropdown>
                              <Dropdown.Toggle 
                                as={Badge}
                                bg={getStatusVariant(product.status)}
                                style={{ cursor: 'pointer' }}
                              >
                                {product.status}
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                {statusOptions.slice(1).map(option => (
                                  <Dropdown.Item
                                    key={option.value}
                                    onClick={() => handleUpdateStatus(product._id, option.value)}
                                    active={product.status === option.value}
                                  >
                                    <Badge bg={option.variant} className="me-2">
                                      {option.label}
                                    </Badge>
                                  </Dropdown.Item>
                                ))}
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                          <td>
                            <Dropdown>
                              <Dropdown.Toggle size="sm" variant="outline-primary">
                                Actions
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item 
                                  onClick={() => handleUpdateStatus(product._id, 'Picked')}
                                  disabled={product.status === 'Picked'}
                                >
                                  <BsCheck2Circle className="me-2" />
                                  Mark as Picked
                                </Dropdown.Item>
                                <Dropdown.Item 
                                  onClick={() => handleUpdateStatus(product._id, 'Out for Delivery')}
                                  disabled={product.status === 'Out for Delivery'}
                                >
                                  <BsTruck className="me-2" />
                                  Out for Delivery
                                </Dropdown.Item>
                                <Dropdown.Item 
                                  onClick={() => handleUpdateStatus(product._id, 'Delivered')}
                                  disabled={product.status === 'Delivered'}
                                >
                                  <BsCheckCircle className="me-2" />
                                  Mark as Delivered
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item 
                                  onClick={() => handleUpdateStatus(product._id, 'Problem')}
                                  className="text-warning"
                                >
                                  <BsExclamationTriangle className="me-2" />
                                  Report Problem
                                </Dropdown.Item>
                                <Dropdown.Item 
                                  onClick={() => handleUpdateStatus(product._id, 'Failed/Returned')}
                                  className="text-danger"
                                >
                                  <BsX className="me-2" />
                                  Mark as Failed
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}