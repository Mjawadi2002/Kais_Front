import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Modal, Row, Col, ListGroup, Form } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import QRCode from 'react-qr-code';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function AdminProducts(){
  const { user } = useAuth();
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

  return (
    <Container>
      <h3 className="mb-3">Clients & Products</h3>
      <Row>
        <Col md={3} className="mb-3">
          <ListGroup>
            {clients.map(c=> (
              <ListGroup.Item key={c._id} action active={selectedClient?._id===c._id} onClick={()=>setSelectedClient(c)}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-bold">{c.name}</div>
                    <div className="small text-muted">{c.email}</div>
                  </div>
                  <div className="small">{/* placeholder for count */}</div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
        <Col md={9}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5>{selectedClient ? `Products for ${selectedClient.name}` : 'Select a client'}</h5>
          </div>
          <Table hover className="shadow-sm">
            <thead><tr><th>Name</th><th>Price</th><th>Assigned To</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {products.map(p=> (
                <tr key={p._id} className="table-row-hover">
                  <td>{p.name}</td>
                  <td>{p.price}</td>
                  <td>{p.assignedTo?.name || '-'}</td>
                  <td>{p.status}</td>
                  <td>
                    <Button size="sm" variant="outline-primary" className="me-2" onClick={()=>openQR(p)}>QR</Button>
                    <Button size="sm" onClick={()=>openAssign(p)}>Assign</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>

      {/* QR Modal */}
      <Modal show={showQR} onHide={()=>setShowQR(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>Product QR & Details</Modal.Title></Modal.Header>
        <Modal.Body>
          {selected && (
            <div className="d-flex gap-4 align-items-start">
              <div style={{background:'#fff', padding:12}}>
                <QRCode value={selected.qrData} size={200} />
              </div>
              <div>
                <h5>{selected.name}</h5>
                <p><strong>Price:</strong> {selected.price}</p>
                <p><strong>Buyer:</strong> {selected.buyerName || '-'}</p>
                <p><strong>Address:</strong> {selected.buyerAddress}</p>
                <p><strong>Phone:</strong> {selected.buyerPhone}</p>
                <p><strong>Status:</strong> {selected.status}</p>
                <p><strong>Assigned To:</strong> {selected.assignedTo?.name || '-'}</p>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>

      {/* Assign Modal */}
      <Modal show={showAssign} onHide={()=>setShowAssign(false)}>
        <Modal.Header closeButton><Modal.Title>Assign Delivery Person</Modal.Title></Modal.Header>
        <Modal.Body>
          {assignProduct && (
            <div>
              <p><strong>Product:</strong> {assignProduct.name}</p>
              <Form.Select value={assignTo} onChange={(e)=>setAssignTo(e.target.value)}>
                <option value="">-- Select Delivery Person --</option>
                {deliveryPersons.map(d=> (
                  <option key={d._id} value={d._id}>{d.name} ({d.email})</option>
                ))}
              </Form.Select>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={()=>setShowAssign(false)}>Cancel</Button>
          <Button variant="primary" onClick={doAssign}>Assign</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
