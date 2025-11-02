import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Modal, Row, Col, ListGroup, Form, Card, Badge, Dropdown } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { BsPerson, BsBoxSeam, BsTruck, BsQrCode, BsPersonPlus, BsCheck2Circle, BsCheckCircle, BsExclamationTriangle, BsX } from 'react-icons/bs';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import QRCode from 'react-qr-code';
import './AdminProducts.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function AdminProducts(){
  const { user } = useAuth();
  const { t } = useTranslation();
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [products, setProducts] = useState([]);
  const [deliveryPersons, setDeliveryPersons] = useState([]);

  const [showQR, setShowQR] = useState(false);
  const [selected, setSelected] = useState(null);

  const [showAssign, setShowAssign] = useState(false);
  const [assignProduct, setAssignProduct] = useState(null);
  const [assignTo, setAssignTo] = useState('');

  const headers = () => ({ headers: { Authorization: `Bearer ${user?.token}` } });

  const loadClients = async ()=>{
    try{
      const resp = await axios.get(`${API_BASE}/api/v1/users/clients`, headers());
      setClients(resp.data.clients || []);
      if (resp.data.clients && resp.data.clients.length) setSelectedClient(resp.data.clients[0]);
    }catch(err){ console.error('loadClients', err); }
  };

  const loadDeliveryPersons = async ()=>{
    try{
      const resp = await axios.get(`${API_BASE}/api/v1/users/delivery-persons`, headers());
      setDeliveryPersons(resp.data.delivery || []);
    }catch(err){ console.error('loadDelivery', err); }
  };

  const loadProducts = async (clientId)=>{
    try{
      const url = clientId ? `${API_BASE}/api/v1/products?client=${clientId}` : `${API_BASE}/api/v1/products`;
      const resp = await axios.get(url, headers());
      setProducts(resp.data.products || []);
    }catch(err){ console.error('loadProducts', err); }
  };

  useEffect(()=>{ loadClients(); loadDeliveryPersons(); }, []);

  useEffect(()=>{ if (selectedClient) loadProducts(selectedClient._id); }, [selectedClient]);

  const openQR = (p)=>{ setSelected(p); setShowQR(true); };

  const openAssign = (p)=>{ setAssignProduct(p); setAssignTo(p.assignedTo?._id || ''); setShowAssign(true); };

  const doAssign = async ()=>{
    if (!assignTo) return alert('Select a delivery person');
    try{
      await axios.post(`${API_BASE}/api/v1/products/${assignProduct._id}/assign`, { deliveryPersonId: assignTo }, headers());
      setShowAssign(false);
      // refresh
      loadProducts(selectedClient?._id);
      loadDeliveryPersons();
    }catch(err){ console.error('assign', err); alert('Assign failed'); }
  };

  // Status options for dropdown
  const statusOptions = [
    { value: 'In Stock', label: 'In Stock', variant: 'secondary' },
    { value: 'Picked', label: 'Picked', variant: 'info' },
    { value: 'Out for Delivery', label: 'Out for Delivery', variant: 'primary' },
    { value: 'Delivered', label: 'Delivered', variant: 'success' },
    { value: 'Problem', label: 'Problem', variant: 'warning' },
    { value: 'Failed/Returned', label: 'Failed/Returned', variant: 'danger' }
  ];

  // Get status badge variant
  const getStatusVariant = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption?.variant || 'secondary';
  };

  // Handle status update
  const handleUpdateStatus = async (productId, newStatus) => {
    try {
      await axios.put(`${API_BASE}/api/v1/products/${productId}`, { status: newStatus }, headers());
      // Refresh products after status update
      loadProducts(selectedClient?._id);
    } catch (error) {
      console.error('Failed to update product status:', error);
      alert('Failed to update status');
    }
  };

  return (
    <>
      <Container fluid className="admin-products-container">
        {/* Header Section */}
        <div className="header-section mb-4">
          <h3 className="page-title">{t('admin.clientsAndProducts')}</h3>
          <p className="page-subtitle text-muted">Manage product assignments and track delivery progress</p>
        </div>

        <Row className="g-4">
          {/* Clients Sidebar */}
          <Col lg={3} md={4}>
            <Card className="clients-card shadow-lg border-0">
              <Card.Header className="clients-header">
                <div className="d-flex align-items-center">
                  <BsPerson className="me-2" size={20} />
                  <span className="fw-bold">Clients ({clients.length})</span>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="clients-list">
                  {clients.map(c=> (
                    <div 
                      key={c._id} 
                      className={`client-item ${selectedClient?._id===c._id ? 'active' : ''}`}
                      onClick={()=>setSelectedClient(c)}
                    >
                      <div className="client-avatar">
                        <BsPerson size={24} />
                      </div>
                      <div className="client-info">
                        <div className="client-name">{c.name}</div>
                        <div className="client-email">{c.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Products Section */}
          <Col lg={9} md={8}>
            <Card className="products-card shadow-lg border-0">
              <Card.Header className="products-header">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <BsBoxSeam className="me-2" size={20} />
                    <span className="fw-bold">
                      {selectedClient ? `${t('admin.productsForClient')} ${selectedClient.name}` : 'Select a client to view products'}
                    </span>
                  </div>
                  <Badge bg="primary" className="product-count-badge">
                    {products.length} products
                  </Badge>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                {selectedClient ? (
                  <div className="products-table-wrapper">
                    <Table className="products-table mb-0">
                      <thead>
                        <tr>
                          <th>{t('common.name')}</th>
                          <th>{t('common.price')}</th>
                          <th>{t('admin.assignedTo')}</th>
                          <th>{t('common.status')}</th>
                          <th>{t('common.actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(p=> (
                          <tr key={p._id} className="product-row">
                            <td>
                              <div className="product-info">
                                <BsBoxSeam className="me-2 text-primary" size={16} />
                                <span className="product-name">{p.name}</span>
                              </div>
                            </td>
                            <td>
                              <span className="price-display">{p.price} {t('common.currency')}</span>
                            </td>
                            <td>
                              {p.assignedTo ? (
                                <div className="assignee-info">
                                  <BsTruck className="me-2 text-success" size={14} />
                                  <span>{p.assignedTo.name}</span>
                                </div>
                              ) : (
                                <Badge bg="secondary" className="unassigned-badge">
                                  {t('products.unassigned')}
                                </Badge>
                              )}
                            </td>
                            <td>
                              <Dropdown align="start">
                                <Dropdown.Toggle 
                                  as={Badge}
                                  bg={getStatusVariant(p.status)}
                                  className="status-badge-clickable"
                                  style={{ cursor: 'pointer', border: 'none' }}
                                >
                                  {p.status}
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="status-dropdown-menu">
                                  {statusOptions.map(option => (
                                    <Dropdown.Item
                                      key={option.value}
                                      onClick={() => handleUpdateStatus(p._id, option.value)}
                                      active={p.status === option.value}
                                      className="status-dropdown-item"
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
                                <Button 
                                  size="sm" 
                                  variant="outline-info" 
                                  className="qr-button me-2" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openQR(p);
                                  }}
                                >
                                  <BsQrCode className="me-1" />
                                  {t('admin.qr')}
                                </Button>
                                <Dropdown align="end">
                                  <Dropdown.Toggle 
                                    size="sm" 
                                    variant="primary"
                                    className="assign-button"
                                  >
                                    <BsPersonPlus className="me-1" />
                                    Actions
                                  </Dropdown.Toggle>
                                  <Dropdown.Menu className="actions-dropdown-menu">
                                    <Dropdown.Item 
                                      onClick={() => openAssign(p)}
                                      className="action-dropdown-item"
                                    >
                                      <BsPersonPlus className="me-2" />
                                      {t('admin.assign')}
                                    </Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item 
                                      onClick={() => handleUpdateStatus(p._id, 'Picked')}
                                      disabled={p.status === 'Picked'}
                                      className="action-dropdown-item"
                                    >
                                      <BsCheck2Circle className="me-2" />
                                      Mark as Picked
                                    </Dropdown.Item>
                                    <Dropdown.Item 
                                      onClick={() => handleUpdateStatus(p._id, 'Out for Delivery')}
                                      disabled={p.status === 'Out for Delivery'}
                                      className="action-dropdown-item"
                                    >
                                      <BsTruck className="me-2" />
                                      Out for Delivery
                                    </Dropdown.Item>
                                    <Dropdown.Item 
                                      onClick={() => handleUpdateStatus(p._id, 'Delivered')}
                                      disabled={p.status === 'Delivered'}
                                      className="action-dropdown-item"
                                    >
                                      <BsCheckCircle className="me-2" />
                                      Mark as Delivered
                                    </Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item 
                                      onClick={() => handleUpdateStatus(p._id, 'Problem')}
                                      className="action-dropdown-item text-warning"
                                    >
                                      <BsExclamationTriangle className="me-2" />
                                      Report Problem
                                    </Dropdown.Item>
                                    <Dropdown.Item 
                                      onClick={() => handleUpdateStatus(p._id, 'Failed/Returned')}
                                      className="action-dropdown-item text-danger"
                                    >
                                      <BsX className="me-2" />
                                      Mark as Failed
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
                ) : (
                  <div className="no-client-selected">
                    <BsPerson size={48} className="text-muted mb-3" />
                    <h5 className="text-muted">{t('admin.selectClient')}</h5>
                    <p className="text-muted mb-0">{t('admin.selectClientSubtitle')}</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* QR Modal */}
      <Modal show={showQR} onHide={()=>setShowQR(false)} size="lg" centered>
        <Modal.Header closeButton className="modal-header-enhanced">
          <Modal.Title className="d-flex align-items-center">
            <BsQrCode className="me-2" />
            {t('admin.productQrDetails')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-enhanced">
          {selected && (
            <div className="d-flex gap-4 align-items-start">
              <div className="qr-container">
                <QRCode value={selected.qrData} size={200} />
              </div>
              <div className="product-details">
                <h5 className="product-title">{selected.name}</h5>
                <div className="detail-item">
                  <strong>Price:</strong> <span className="price-value">{selected.price} {t('common.currency')}</span>
                </div>
                <div className="detail-item">
                  <strong>Buyer:</strong> {selected.buyerName || '-'}
                </div>
                <div className="detail-item">
                  <strong>Address:</strong> {selected.buyerAddress}
                </div>
                <div className="detail-item">
                  <strong>Phone:</strong> {selected.buyerPhone}
                </div>
                <div className="detail-item">
                  <strong>Status:</strong> 
                  <Badge bg={selected.status === 'Delivered' ? 'success' : 'primary'} className="ms-2">
                    {selected.status}
                  </Badge>
                </div>
                <div className="detail-item">
                  <strong>Assigned To:</strong> {selected.assignedTo?.name || 'Unassigned'}
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Assign Modal */}
      <Modal show={showAssign} onHide={()=>setShowAssign(false)} centered>
        <Modal.Header closeButton className="modal-header-enhanced">
          <Modal.Title className="d-flex align-items-center">
            <BsPersonPlus className="me-2" />
            {t('admin.assignDeliveryPerson')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-enhanced">
          {assignProduct && (
            <div>
              <div className="assign-product-info mb-3">
                <h6 className="mb-2">{t('admin.productDetails')}</h6>
                <div className="product-summary">
                  <BsBoxSeam className="me-2 text-primary" />
                  <span className="fw-bold">{assignProduct.name}</span>
                  <span className="text-muted ms-2">({assignProduct.price} {t('common.currency')})</span>
                </div>
              </div>
              <Form.Group>
                <Form.Label className="fw-bold">{t('admin.selectDeliveryPerson')}</Form.Label>
                <Form.Select 
                  value={assignTo} 
                  onChange={(e)=>setAssignTo(e.target.value)}
                  className="enhanced-select"
                >
                  <option value="">-- Select Delivery Person --</option>
                  {deliveryPersons.map(d=> (
                    <option key={d._id} value={d._id}>{d.name} ({d.email})</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="modal-footer-enhanced">
          <Button variant="outline-secondary" onClick={()=>setShowAssign(false)} className="enhanced-cancel-btn">
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={doAssign} className="enhanced-assign-btn">
            <BsPersonPlus className="me-1" />
            {t('admin.assign')}
          </Button>
        </Modal.Footer>
      </Modal>


    </>
  );
}
