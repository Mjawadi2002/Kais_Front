import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Modal, Card, Badge, Col, Row } from 'react-bootstrap';
import { BsBox, BsQrCode, BsPerson, BsCalendar, BsTruck, BsPrinter } from 'react-icons/bs';
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

  // Generate QR Code data for product
  const generateQRCode = (product) => {
    return JSON.stringify({
      id: product._id,
      name: product.name,
      status: product.status,
      deliveryCode: product.deliveryCode || Math.random().toString(36).substring(7),
      assignedTo: product.assignedTo?.name || 'Unassigned',
      client: product.client?.name || product.client?.email || user?.name || 'Unknown',
      buyer: {
        name: product.buyerName || 'N/A',
        phone: product.buyerPhone || 'N/A', 
        address: product.buyerAddress || 'N/A'
      }
    });
  };

  // Print Invoice function
  const printInvoice = (product) => {
    const qrData = generateQRCode(product);
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;
    const currentDate = new Date().toLocaleDateString();
    
    // Calculate total with delivery fee
    const deliveryFee = 7; // 7 TND delivery fee
    const totalAmount = parseFloat(product.price) + deliveryFee;
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Delivery Invoice - ${product.name}</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 20px;
              background-color: #f5f5f5;
            }
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            .invoice-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 3px solid #007bff;
            }
            .company-info {
              text-align: left;
            }
            .company-info div {
              font-size: 24px;
              font-weight: bold;
              color: #007bff;
              margin-top: 5px;
            }
            .invoice-title {
              font-size: 32px;
              font-weight: bold;
              color: #333;
              text-align: right;
            }
            .invoice-details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin-bottom: 30px;
            }
            .invoice-info, .product-info {
              padding: 20px;
              background-color: #f8f9fa;
              border-radius: 8px;
              border: 1px solid #dee2e6;
            }
            .invoice-info h4, .product-info h4 {
              margin-top: 0;
              color: #007bff;
              font-size: 18px;
              border-bottom: 2px solid #007bff;
              padding-bottom: 5px;
            }
            .qr-section {
              text-align: center;
              margin: 30px 0;
              padding: 20px;
              background-color: #f1f3f4;
              border-radius: 8px;
            }
            .qr-section h4 {
              color: #333;
              margin-bottom: 15px;
            }
            .product-details {
              margin: 30px 0;
              padding: 20px;
              background-color: #fff;
              border: 2px solid #007bff;
              border-radius: 8px;
            }
            .product-details h4 {
              color: #007bff;
              margin-bottom: 20px;
              text-align: center;
              font-size: 20px;
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
                <p><strong>Client:</strong> ${user?.name || 'N/A'}</p>
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
                <span>${deliveryFee} TND</span>
              </div>
              <div class="detail-row">
                <span>Total Amount:</span>
                <span>${totalAmount} TND</span>
              </div>
            </div>
            
            <div class="footer">
              <p><strong>Thank you for choosing our delivery service!</strong></p>
              <p style="font-size: 12px; color: #666;">
                This invoice serves as confirmation of delivery service for the above product.
              </p>
              <p style="font-size: 12px; color: #666; margin-top: 10px;">
                For questions or support, please contact our customer service team.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

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
                          <Button 
                            className="print-button ms-2" 
                            size="sm" 
                            variant="outline-success"
                            onClick={()=>printInvoice(p)}
                          >
                            <BsPrinter className="me-1" />
                            Print Invoice
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
                  <QRCode value={generateQRCode(selected)} size={200} />
                </div>
                <div className="text-center mt-3">
                  <Button 
                    className="print-invoice-btn" 
                    variant="success"
                    onClick={()=>printInvoice(selected)}
                  >
                    <BsPrinter className="me-1" />
                    Print Invoice
                  </Button>
                </div>
              </Col>
              <Col lg={7} md={12}>
                <div className="product-details">
                  <h3 className="product-detail-title">{selected.name}</h3>
                  <div className="detail-item">
                    <span className="detail-label">Product Price:</span>
                    <span className="detail-price">{selected.price} TND</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Delivery Fee:</span>
                    <span className="detail-value text-info">7 TND</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Total Amount:</span>
                    <span className="detail-price text-success fw-bold">{parseFloat(selected.price) + 7} TND</span>
                  </div>
                  <hr className="my-3" />
                  <h5 className="text-muted mb-3">
                    <BsPerson className="me-2" />
                    Buyer Information
                  </h5>
                  <div className="detail-item">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">{selected.buyerName || 'Not specified'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">{selected.buyerPhone || 'Not specified'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Address:</span>
                    <span className="detail-value">{selected.buyerAddress || 'Not specified'}</span>
                  </div>
                  <hr className="my-3" />
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
