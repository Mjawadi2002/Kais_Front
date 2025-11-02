import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Modal, Card, Badge, Col, Row } from 'react-bootstrap';
import { BsBox, BsQrCode, BsPerson, BsCalendar, BsTruck } from 'react-icons/bs';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import QRCode from 'react-qr-code';
import './MyProducts.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Get status badge variant
const getStatusVariant = (status) => {
  switch (status) {
    case 'In Stock': return 'secondary';
    case 'Picked': return 'info';
    case 'Out for Delivery': return 'primary';
    case 'Delivered': return 'success';
    case 'Problem': return 'warning';
    case 'Failed/Returned': return 'danger';
    default: return 'secondary';
  }
};

export default function MyProducts(){
  const { user } = useAuth();
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = async ()=>{
    setLoading(true);
    try{
      const token = user?.token;
      const resp = await axios.get(`${API_BASE}/api/v1/products`, { headers: { Authorization: `Bearer ${token}` } });
      setProducts(resp.data.products || []);
    }catch(err){ console.error(err); }
    setLoading(false);
  };

  useEffect(()=>{ load(); }, []);

  const open = (p)=>{ setSelected(p); setShow(true); };

  return (
    <Container fluid className="my-products-container">
      {/* Enhanced Header Section */}
      <div className="my-products-header">
        <h1 className="page-title">My Products</h1>
        <p className="page-subtitle">View and manage your product inventory with delivery tracking</p>
      </div>

      {/* Enhanced Products Table */}
      <Card className="products-table-card">
        <div className="products-table-header">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="table-title">
              <BsBox />
              Products Inventory
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
              <p className="loading-text">Loading your products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <BsBox size={48} className="empty-state-icon" />
              <h5 className="empty-state-title">No products yet</h5>
              <p className="empty-state-subtitle">Start by adding your first product to track deliveries</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table className="enhanced-products-table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>QR Code</th>
                    <th>Created Date</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p=> (
                    <tr key={p._id} className="product-row">
                      <td>
                        <div className="product-info">
                          <BsBox className="text-primary" />
                          <span className="product-name">{p.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="product-price">{p.price} TND</span>
                      </td>
                      <td>
                        <Badge 
                          bg={getStatusVariant(p.status)} 
                          className="status-badge-enhanced"
                        >
                          {p.status}
                        </Badge>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Button 
                            className="qr-button" 
                            size="sm" 
                            onClick={()=>open(p)}
                          >
                            <BsQrCode className="me-1" />
                            View QR
                          </Button>
                        </div>
                      </td>
                      <td>
                        <div className="created-at">
                          <BsCalendar className="me-1" />
                          {new Date(p.createdAt).toLocaleDateString()}
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

      {/* Enhanced Modal */}
      <Modal show={show} onHide={()=>setShow(false)} size="lg" centered>
        <Modal.Header closeButton className="enhanced-modal-header">
          <Modal.Title className="enhanced-modal-title">
            <BsQrCode />
            Product QR & Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="enhanced-modal-body">
          {selected && (
            <Row className="g-4">
              <Col lg={5} md={12}>
                <div className="qr-container">
                  <QRCode value={selected.qrData} size={200} />
                </div>
              </Col>
              <Col lg={7} md={12}>
                <div className="product-details">
                  <h3 className="product-detail-title">{selected.name}</h3>
                  <div className="detail-item">
                    <span className="detail-label">Price:</span>
                    <span className="detail-price">{selected.price} TND</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Buyer:</span>
                    <span className="detail-value">{selected.buyerName || 'Not specified'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Address:</span>
                    <span className="detail-value">{selected.buyerAddress || 'Not specified'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">{selected.buyerPhone || 'Not specified'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <Badge 
                      bg={getStatusVariant(selected.status)} 
                      className="status-badge-enhanced"
                    >
                      {selected.status}
                    </Badge>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Assigned To:</span>
                    <span className="detail-value">
                      {selected.assignedTo ? (
                        <div className="d-flex align-items-center">
                          <BsTruck className="me-1 text-success" />
                          {selected.assignedTo.name}
                        </div>
                      ) : (
                        <Badge bg="secondary">Unassigned</Badge>
                      )}
                    </span>
                  </div>
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}
