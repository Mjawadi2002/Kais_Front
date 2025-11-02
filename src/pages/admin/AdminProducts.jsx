import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Modal, Row, Col, ListGroup, Form, Card, Badge, Dropdown } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { BsPerson, BsBoxSeam, BsTruck, BsQrCode, BsPersonPlus, BsCheck2Circle, BsCheckCircle, BsExclamationTriangle, BsX, BsPrinter } from 'react-icons/bs';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import QRCode from 'react-qr-code';
import logo from '../../assets/images/KMDelivery.png';
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
      // Assign the product to delivery person
      await axios.post(`${API_BASE}/api/v1/products/${assignProduct._id}/assign`, { deliveryPersonId: assignTo }, headers());
      
      // Automatically update status to "Picked" when assigned
      await axios.patch(`${API_BASE}/api/v1/products/${assignProduct._id}/status`, { status: 'Picked' }, headers());
      
      setShowAssign(false);
      setAssignTo('');
      setAssignProduct(null);
      
      // refresh
      loadProducts(selectedClient?._id);
      loadDeliveryPersons();
      
      // Show success message
      alert('Product assigned successfully and status updated to "Picked"');
    }catch(err){ 
      console.error('assign', err); 
      alert('Assignment failed'); 
    }
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
      await axios.patch(`${API_BASE}/api/v1/products/${productId}/status`, { status: newStatus }, headers());
      // Refresh products after status update
      loadProducts(selectedClient?._id);
      alert('Status updated successfully!');
    } catch (error) {
      console.error('Failed to update product status:', error);
      alert('Failed to update status');
    }
  };

  const printInvoice = (product) => {
    // Create a new window for the invoice
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    const currentDate = new Date().toLocaleDateString();
    
    // Try to generate QR code SVG using online service
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(product.qrData)}`;
    
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${product.name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
            }
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              border: 2px solid #333;
              padding: 30px;
            }
            .invoice-header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .company-info {
              text-align: center;
              margin-bottom: 20px;
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              color: #333;
              margin-bottom: 5px;
            }
            .invoice-title {
              font-size: 32px;
              font-weight: bold;
              color: #007bff;
              margin: 10px 0;
            }
            .invoice-details {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }
            .invoice-info, .product-info {
              flex: 1;
            }
            .qr-section {
              text-align: center;
              margin: 20px 0;
              padding: 20px;
              border: 2px dashed #007bff;
              background: #f8f9fa;
            }
            .product-details {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #ddd;
            }
            .detail-row:last-child {
              border-bottom: none;
              font-weight: bold;
              font-size: 18px;
              color: #007bff;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #333;
            }

            @media print {
              body { margin: 0; }
              .invoice-container { border: none; box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="invoice-header">
              <div class="company-info">
                <img src="${window.location.origin}/logo.png" alt="KM Delivery Logo" style="height: 60px; width: auto; margin-bottom: 10px;" />
                <div>Professional Delivery Solutions</div>
              </div>
              <div class="invoice-title">DELIVERY INVOICE</div>
              <div>Date: ${currentDate}</div>
            </div>
            
            <div class="invoice-details">
              <div class="invoice-info">
                <h4>Product Information:</h4>
                <p><strong>Product:</strong> ${product.name}</p>
                <p><strong>Assigned To:</strong> ${product.assignedTo?.name || 'Unassigned'}</p>
              </div>
              <div class="product-info">
                <h4>Customer Details:</h4>
                <p><strong>Customer:</strong> ${product.buyerName || 'N/A'}</p>
                <p><strong>Phone:</strong> ${product.buyerPhone || 'N/A'}</p>
                <p><strong>Address:</strong> ${product.buyerAddress || 'N/A'}</p>
              </div>
            </div>
            
            <div class="qr-section">
              <h4>Product QR Code</h4>
              <div style="display: inline-block; padding: 10px; background: white; border: 2px solid #333;">
                <img src="${qrApiUrl}" alt="QR Code for ${product.name}" style="width: 120px; height: 120px; display: block;" 
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                <div style="width: 120px; height: 120px; border: 1px dashed #ccc; display: none; align-items: center; justify-content: center; font-size: 12px; color: #666; text-align: center;">
                  QR Code<br/>for<br/>${product.name}
                </div>
              </div>
              <p style="margin-top: 10px; font-size: 12px; color: #666;">
                Scan this QR code for product tracking and verification
              </p>
            </div>
            
            <div class="product-details">
              <h4>Financial Details</h4>
              <div class="detail-row">
                <span>Product Price:</span>
                <span>${product.price} TND</span>
              </div>
              <div class="detail-row">
                <span>Delivery Fee:</span>
                <span>0 TND</span>
              </div>
              <div class="detail-row">
                <span>Total Amount:</span>
                <span>${product.price} TND</span>
              </div>
            </div>
            
            <div class="footer">
              <p><strong>Thank you for choosing our delivery service!</strong></p>
              <p style="font-size: 12px; color: #666;">
                This invoice serves as confirmation of delivery service for the above product.
                Keep this document for your records.
              </p>
            </div>
          </div>
          
          <script>
            // Auto print when page loads
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
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
                                {p.assignedTo ? (
                                  <Button 
                                    size="sm" 
                                    variant="success"
                                    className="assigned-button"
                                    disabled
                                  >
                                    <BsCheckCircle className="me-1" />
                                    {t('admin.assigned')}
                                  </Button>
                                ) : (
                                  <Button 
                                    size="sm" 
                                    variant="primary"
                                    className="assign-button"
                                    onClick={() => openAssign(p)}
                                  >
                                    <BsPersonPlus className="me-1" />
                                    {t('admin.assign')}
                                  </Button>
                                )}
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
            <div>
              <div className="d-flex gap-4 align-items-start mb-3">
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
              <div className="text-center mt-3">
                <Button 
                  onClick={() => printInvoice(selected)}
                  className="print-invoice-btn"
                  size="md"
                >
                  <BsPrinter className="me-2" />
                  {t('admin.printInvoice') || 'Print Invoice'}
                </Button>
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
                <div className="mt-3 p-2 bg-light rounded">
                  <small className="text-muted">
                    <BsCheck2Circle className="me-1 text-success" />
                    <strong>Note:</strong> {t('admin.assignmentNote')}
                  </small>
                </div>
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
