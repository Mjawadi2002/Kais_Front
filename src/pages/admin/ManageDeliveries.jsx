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
import { useTranslation } from 'react-i18next';
import apiClient from '../../config/apiClient';
import './ManageDeliveries.css';

export default function ManageDeliveries() {
  const { user } = useAuth();
  const { t } = useTranslation();
  
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
    { value: '', label: t('deliveries.allStatuses') },
    { value: 'In Stock', label: t('status.inStock'), variant: 'secondary' },
    { value: 'Picked', label: t('status.picked'), variant: 'info' },
    { value: 'Out for Delivery', label: t('status.outForDelivery'), variant: 'primary' },
    { value: 'Delivered', label: t('status.delivered'), variant: 'success' },
    { value: 'Problem', label: t('status.problem'), variant: 'warning' },
    { value: 'Failed/Returned', label: t('status.failed'), variant: 'danger' }
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
      toast.error(t('errors.loadProductsFailed'));
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
      await apiClient.patch(`/api/v1/products/${productId}/status`, { status: newStatus });
      toast.success(t('messages.statusUpdated'));
      loadProducts();
    } catch (error) {
      console.error('Failed to update product status:', error);
      toast.error(t('errors.updateStatusFailed'));
    }
  };

  return (
    <Container fluid className="manage-deliveries-container">
      {/* Enhanced Header Section */}
      <div className="deliveries-header">
        <h1 className="page-title">{t('deliveries.manageDeliveries')}</h1>
        <p className="page-subtitle">
          {t('deliveries.subtitle')} - Monitor and manage product assignments and track delivery progress
        </p>
      </div>

      {/* Enhanced Filters Section */}
      <Card className="filters-card mb-4">
        <Card.Body className="filters-section">
          <Row className="g-4">
            <Col lg={4} md={6}>
              <InputGroup>
                <InputGroup.Text className="bg-light border-0">
                  <BsSearch />
                </InputGroup.Text>
                <Form.Control
                  className="filter-input"
                  placeholder={t('deliveries.searchPlaceholder')}
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </InputGroup>
            </Col>
            
            <Col lg={2} md={6}>
              <Form.Select 
                className="filter-select"
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
            
            <Col lg={2} md={6}>
              <Form.Select 
                className="filter-select"
                value={filters.client} 
                onChange={(e) => handleFilterChange('client', e.target.value)}
              >
                <option value="">{t('deliveries.allClients')}</option>
                {clients.map(client => (
                  <option key={client._id} value={client._id}>
                    {client.username}
                  </option>
                ))}
              </Form.Select>
            </Col>
            
            <Col lg={3} md={6}>
              <Form.Select 
                className="filter-select"
                value={filters.deliveryPerson} 
                onChange={(e) => handleFilterChange('deliveryPerson', e.target.value)}
              >
                <option value="">{t('deliveries.allDeliveryPersons')}</option>
                {deliveryPersons.map(person => (
                  <option key={person._id} value={person._id}>
                    {person.username}
                  </option>
                ))}
              </Form.Select>
            </Col>
            
            <Col lg={1} md={12}>
              <Button className="clear-filters-btn w-100" onClick={clearFilters}>
                <BsX className="me-1" />
                Clear
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Enhanced Products Table */}
      <Card className="deliveries-table-card">
        <div className="deliveries-table-header">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="table-title">
              <BsBox className="me-2" />
              {t('navigation.products')}
            </h2>
            <Badge className="product-count-badge">
              {products.length} products
            </Badge>
          </div>
        </div>
        <Card.Body className="p-0">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">{t('common.loading')}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="no-deliveries-found">
              <BsBox size={48} className="no-deliveries-icon" />
              <h5 className="no-deliveries-title">{t('deliveries.noProductsFound')}</h5>
              <p className="no-deliveries-subtitle">{t('deliveries.adjustFilters')}</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table className="enhanced-deliveries-table">
                <thead>
                  <tr>
                    <th>{t('products.productName')}</th>
                    <th>{t('common.price')}</th>
                    <th>{t('products.deliveryPerson')}</th>
                    <th>{t('common.client')}</th>
                    <th>{t('common.status')}</th>
                    <th>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product._id} className="delivery-row">
                      <td>
                        <div className="product-info">
                          <BsBox className="me-2 text-primary" />
                          <span className="product-name">{product.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="price-display">
                          {product.price} TND
                        </span>
                      </td>
                      <td>
                        {product.assignedTo ? (
                          <div className="assignee-info">
                            <BsTruck className="me-2 text-success" />
                            <div className="assignee-details">
                              <div className="assignee-name">{product.assignedTo.username}</div>
                              <div className="assignee-email">{product.assignedTo.email}</div>
                            </div>
                          </div>
                        ) : (
                          <Badge bg="secondary">{t('products.notAssigned')}</Badge>
                        )}
                      </td>
                      <td>
                        <div className="assignee-info">
                          <BsPerson className="me-2 text-info" />
                          <div className="assignee-details">
                            <div className="assignee-name">
                              {product.client?.username || product.buyerName || 'N/A'}
                            </div>
                            {product.client?.email && (
                              <div className="assignee-email">{product.client.email}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle 
                            as={Badge}
                            bg={getStatusVariant(product.status)}
                            className="status-badge"
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
                        <div className="action-buttons">
                          <Dropdown>
                            <Dropdown.Toggle 
                              size="sm" 
                              className="enhanced-action-btn"
                              variant="outline-primary"
                            >
                              {t('common.actions')}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item 
                                onClick={() => handleUpdateStatus(product._id, 'Picked')}
                                disabled={product.status === 'Picked'}
                              >
                                <BsCheck2Circle className="me-2" />
                                {t('deliveries.markAsPicked')}
                              </Dropdown.Item>
                              <Dropdown.Item 
                                onClick={() => handleUpdateStatus(product._id, 'Out for Delivery')}
                                disabled={product.status === 'Out for Delivery'}
                              >
                                <BsTruck className="me-2" />
                                {t('deliveries.outForDelivery')}
                              </Dropdown.Item>
                              <Dropdown.Item 
                                onClick={() => handleUpdateStatus(product._id, 'Delivered')}
                                disabled={product.status === 'Delivered'}
                              >
                                <BsCheckCircle className="me-2" />
                                {t('deliveries.markAsDelivered')}
                              </Dropdown.Item>
                              <Dropdown.Divider />
                              <Dropdown.Item 
                                onClick={() => handleUpdateStatus(product._id, 'Problem')}
                                className="text-warning"
                              >
                                <BsExclamationTriangle className="me-2" />
                                {t('deliveries.reportProblem')}
                              </Dropdown.Item>
                              <Dropdown.Item 
                                onClick={() => handleUpdateStatus(product._id, 'Failed/Returned')}
                                className="text-danger"
                              >
                                <BsX className="me-2" />
                                {t('deliveries.markAsFailed')}
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}