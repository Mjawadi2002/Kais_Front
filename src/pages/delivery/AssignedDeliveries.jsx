import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Row, Col, Table, Badge, Button, Modal, Form, InputGroup } from 'react-bootstrap';
import { 
  BsBoxSeam, 
  BsTruck, 
  BsCheckCircle, 
  BsQrCode, 
  BsExclamationTriangle,
  BsArrowUp,
  BsPerson,
  BsCalendar,
  BsGeoAlt,
  BsFilter,
  BsSearch
} from 'react-icons/bs';
import axios from 'axios';
import QRCode from 'react-qr-code';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import './AssignedDeliveries.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Backend defined delivery statuses (from DeliveryModel.js enum)
const DELIVERY_STATUSES = [
  'pending',
  'assigned', 
  'in_transit',
  'delivered',
  'cancelled',
  'failed'
];

// Backend defined product statuses (must match ProductController.js updateStatus allowed array)
const PRODUCT_STATUSES = [
  'Picked',
  'Out for Delivery', 
  'Delivered',
  'Problem',
  'Failed/Returned'
];

// All possible statuses from ProductModel (including 'In Stock' which is default but not updatable by delivery person)
const ALL_PRODUCT_STATUSES = [
  'In Stock',
  'Picked',
  'Out for Delivery',
  'Delivered',
  'Problem',
  'Failed/Returned'
];

function StatusBadge({ status, product, onStatusChange, isDeliveryPerson = false }){
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'in_transit': return 'primary';
      case 'assigned': return 'info';
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
      case 'failed': return 'dark';
      // Legacy product statuses (for backward compatibility)
      case 'Delivered': return 'success';
      case 'Out for Delivery': return 'primary';
      case 'Picked': return 'info';
      case 'Problem': return 'danger';
      case 'In Stock': return 'warning';
      case 'Failed/Returned': return 'dark';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return <BsCheckCircle />;
      case 'in_transit': return <BsTruck />;
      case 'assigned': return <BsArrowUp />;
      case 'pending': return <BsBoxSeam />;
      case 'cancelled': return <BsExclamationTriangle />;
      case 'failed': return <BsExclamationTriangle />;
      // Legacy product statuses (for backward compatibility)
      case 'Delivered': return <BsCheckCircle />;
      case 'Out for Delivery': return <BsTruck />;
      case 'Picked': return <BsArrowUp />;
      case 'Problem': return <BsExclamationTriangle />;
      default: return <BsBoxSeam />;
    }
  };

  // Render as simple badge without dropdown
  return (
    <Badge 
      bg={getStatusBadgeVariant(status)}
      className="d-flex align-items-center gap-1 px-3 py-2"
      style={{ fontSize: '0.875rem', fontWeight: '500' }}
    >
      {getStatusIcon(status)}
      <span>{status}</span>
    </Badge>
  );
}

export default function AssignedDeliveries() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');

  const headers = useCallback(() => ({ headers: { Authorization: `Bearer ${user?.token}` } }), [user?.token]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await axios.get(`${API_BASE}/api/v1/products`, headers());
      const allProducts = resp.data.products || [];
      // Filter products assigned to current delivery person
      const assigned = allProducts.filter(p => 
        p.assignedTo?._id === user?.id || 
        p.deliveryPerson?._id === user?.id
      );
      setProducts(assigned);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.token]);

  const generateQRCode = useCallback((product) => {
    const qrData = JSON.stringify({
      id: product._id,
      name: product.name,
      status: product.status,
      deliveryCode: product.deliveryCode || Math.random().toString(36).substring(7),
      assignedTo: product.assignedTo?.username || user?.username,
      client: product.client?.name || product.client?.email || 'Unknown',
      buyer: {
        name: product.buyerName || 'N/A',
        phone: product.buyerPhone || 'N/A', 
        address: product.buyerAddress || 'N/A'
      }
    });
    
    setQrCode(qrData);
    setSelectedProduct(product);
    setQrModalOpen(true);
  }, [user?.username]);

  const changeStatus = useCallback(async (product, status) => {
    try {
      console.log('Updating product status:', { 
        productId: product._id, 
        currentStatus: product.status,
        newStatus: status,
        apiUrl: `${API_BASE}/api/v1/products/${product._id}/status`,
        headers: headers()
      });
      
      const response = await axios.patch(`${API_BASE}/api/v1/products/${product._id}/status`, { status }, headers());
      console.log('Status update response:', response.data);
      
      // Show success message
      toast.success(`Status successfully changed from "${product.status}" to "${status}"`);
      
      await load();
    } catch (err) {
      console.error('Status update failed:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      if (err.response?.status === 400) {
        toast.error(`Invalid status "${status}". Backend only allows: Picked, Out for Delivery, Delivered, Problem, Failed/Returned`);
      } else if (err.response?.status === 403) {
        toast.error('You are not authorized to change this product status.');
      } else {
        toast.error(`Status update failed: ${err.response?.data?.message || err.message}`);
      }
    }
  }, [headers, load]);

  // Derive unique clients from products
  const clients = useMemo(() => {
    const clientMap = {};
    products.forEach(p => {
      if (p.client) clientMap[p.client._id] = p.client;
    });
    return Object.values(clientMap);
  }, [products]);

  // Filter products based on search, status, and client
  const filteredProducts = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    return products.filter(p => {
      // Status filter
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      
      // Client filter
      if (clientFilter !== 'all' && String(p.client?._id) !== String(clientFilter)) return false;
      
      // Search filter
      if (!searchTerm) return true;
      const productName = (p.name || '').toLowerCase();
      const clientName = (p.client?.name || p.client?.email || '').toLowerCase();
      return productName.includes(searchTerm) || clientName.includes(searchTerm);
    });
  }, [products, search, statusFilter, clientFilter]);

  const getActionButtons = (product) => {
    const buttons = [];

    // QR Code button - always available
    buttons.push(
      <Button
        key="qr"
        className="enhanced-action-btn btn-outline-info"
        size="sm"
        onClick={() => generateQRCode(product)}
      >
        <BsQrCode />
        QR Code
      </Button>
    );

    // Status update buttons - only if not delivered
    if (product.status !== 'Delivered') {
      if (product.status === 'In Stock' || product.status === 'Pending') {
        buttons.push(
          <Button
            key="pickup"
            className="enhanced-action-btn btn-outline-success"
            size="sm"
            onClick={() => changeStatus(product, 'Picked')}
          >
            <BsArrowUp />
            Pick Up
          </Button>
        );
      }

      if (product.status === 'Picked') {
        buttons.push(
          <Button
            key="deliver"
            className="enhanced-action-btn btn-outline-info"
            size="sm"
            onClick={() => changeStatus(product, 'Out for Delivery')}
          >
            <BsTruck />
            Out for Delivery
          </Button>
        );
      }

      if (product.status === 'Out for Delivery') {
        buttons.push(
          <Button
            key="delivered"
            className="enhanced-action-btn btn-outline-success"
            size="sm"
            onClick={() => changeStatus(product, 'Delivered')}
          >
            <BsCheckCircle />
            Mark Delivered
          </Button>
        );
      }

      // Problem button - always available for non-delivered items
      buttons.push(
        <Button
          key="problem"
          className="enhanced-action-btn btn-outline-warning"
          size="sm"
          onClick={() => changeStatus(product, 'Problem')}
        >
          <BsExclamationTriangle />
          Report Problem
        </Button>
      );
    }

    return buttons;
  };

  useEffect(() => {
    if (user?.id) {
      load();
    }
  }, [user?.id, load]);

  return (
    <Container fluid className="assigned-deliveries-container">
      {/* Enhanced Header Section */}
      <div className="assigned-deliveries-header">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h1 className="assigned-deliveries-title">
              <BsBoxSeam className="me-3" />
              Assigned Deliveries
            </h1>
            <p className="assigned-deliveries-subtitle">
              Manage your delivery assignments and track progress
            </p>
          </div>
          <div className="text-white text-end">
            <div className="h5 mb-1">{filteredProducts.length} deliveries</div>
            <div className="small opacity-75">
              {products.filter(p => p.status === 'Delivered').length} completed
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <Row className="g-3">
          <Col md={4}>
            <h6>
              <BsFilter className="me-2" />
              Status Filter
            </h6>
            <Form.Select 
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              {ALL_PRODUCT_STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={4}>
            <h6>
              <BsPerson className="me-2" />
              Client Filter
            </h6>
            <Form.Select 
              className="filter-select"
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
            >
              <option value="all">All Clients</option>
              {clients.map(client => (
                <option key={client._id} value={client._id}>
                  {client.name || client.email}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={4}>
            <h6>
              <BsSearch className="me-2" />
              Search
            </h6>
            <InputGroup>
              <Form.Control
                className="filter-select"
                placeholder="Search products or clients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </InputGroup>
          </Col>
        </Row>
      </div>

      {/* Deliveries Table */}
      <div className="deliveries-table-card">
        <div className="deliveries-table-header">
          <h5>
            <BsTruck className="me-2" />
            Your Deliveries ({filteredProducts.length})
          </h5>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading your assigned deliveries...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <BsBoxSeam size={48} className="empty-state-icon" />
            <h5 className="empty-state-title">
              No deliveries found
            </h5>
            <p className="empty-state-subtitle">
              {search || statusFilter !== 'all' || clientFilter !== 'all'
                ? 'Try adjusting your filters to see more deliveries'
                : 'Your assigned deliveries will appear here when available'
              }
            </p>
          </div>
        ) : (
          <Table className="enhanced-deliveries-table" hover>
            <thead>
              <tr>
                <th>
                  <BsBoxSeam className="me-2" />
                  Product Details
                </th>
                <th>Price</th>
                <th>
                  <BsPerson className="me-2" />
                  Client
                </th>
                <th>
                  <BsCheckCircle className="me-2" />
                  Status
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product._id} data-product-id={product._id}>
                  <td>
                    <div className="product-info">
                      <h6>{product.name}</h6>
                      <div className="text-muted">
                        ID: {product._id.slice(-6).toUpperCase()}
                      </div>
                      <div className="text-muted small">
                        <BsCalendar className="me-1" />
                        {new Date(product.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="fw-medium">${product.price}</div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="rounded-circle bg-light p-2 me-2">
                        <BsPerson className="text-muted" />
                      </div>
                      <div>
                        <div className="fw-medium">
                          {product.client?.name || product.client?.email || 'N/A'}
                        </div>
                        <div className="text-muted small">
                          {product.client?.email || 'No email'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <StatusBadge 
                      status={product.status} 
                      product={product}
                      onStatusChange={changeStatus}
                      isDeliveryPerson={true}
                    />
                  </td>
                  <td>
                    <div className="action-buttons">
                      {getActionButtons(product)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      {/* Enhanced QR Code Modal */}
      <Modal 
        show={qrModalOpen} 
        onHide={() => setQrModalOpen(false)} 
        centered
        className="enhanced-qr-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <BsQrCode className="me-2" />
            Delivery QR Code
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {qrCode && (
            <div className="qr-code-container">
              <QRCode 
                value={qrCode} 
                size={200} 
                bgColor="#ffffff"
                fgColor="#2d3748"
              />
            </div>
          )}
          {selectedProduct && (
            <div className="qr-product-info">
              <h6>
                <BsBoxSeam className="me-2" />
                {selectedProduct.name}
              </h6>
              <div className="row g-2 text-start">
                <div className="col-6">
                  <strong>Status:</strong><br />
                  <StatusBadge 
                    status={selectedProduct.status} 
                    product={selectedProduct}
                    onStatusChange={changeStatus}
                    isDeliveryPerson={true}
                  />
                </div>
                <div className="col-6">
                  <strong>Price:</strong><br />
                  <span>${selectedProduct.price}</span>
                </div>
                <div className="col-12">
                  <strong>Client:</strong><br />
                  <span>{selectedProduct.client?.name || selectedProduct.client?.email || 'Unknown'}</span>
                </div>
                <div className="col-12">
                  <strong>Product ID:</strong><br />
                  <code>{selectedProduct._id}</code>
                </div>
                <div className="col-12">
                  <hr className="my-2" />
                  <strong>
                    <BsPerson className="me-2" />
                    Buyer Information:
                  </strong>
                </div>
                <div className="col-12">
                  <strong>Name:</strong><br />
                  <span>{selectedProduct.buyerName || 'N/A'}</span>
                </div>
                <div className="col-6">
                  <strong>Phone:</strong><br />
                  <span>{selectedProduct.buyerPhone || 'N/A'}</span>
                </div>
                <div className="col-6">
                  <strong>Address:</strong><br />
                  <span>{selectedProduct.buyerAddress || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}
          <p className="text-muted mt-3 mb-0">
            Present this QR code to verify delivery completion
          </p>
        </Modal.Body>
      </Modal>
    </Container>
  );
}
