import React, { useEffect, useState, useMemo } from 'react';
import { Container, Row, Col, Table, Button, Dropdown, Form, InputGroup, Badge } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import QRCode from 'react-qr-code';
import { FaQrcode, FaEllipsisV } from 'react-icons/fa';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function StatusBadge({ status }){
  const map = {
    'Picked': 'secondary',
    'Out for Delivery': 'info',
    'Delivered': 'success',
    'Problem': 'danger',
    'In Stock': 'warning',
    'Failed/Returned': 'dark'
  };
  const variant = map[status] || 'secondary';
  return <Badge bg={variant}>{status}</Badge>;
}

export default function AssignedDeliveries(){
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [qrOpen, setQrOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('all');

  const headers = () => ({ headers: { Authorization: `Bearer ${user?.token}` } });

  const load = async ()=>{
    try{
      const resp = await axios.get(`${API_BASE}/api/v1/products`, headers());
      // products are expected to include populated client
      setProducts(resp.data.products || []);
    }catch(err){ console.error('load assigned', err); }
  };

  useEffect(()=>{ if (user) load(); }, [user]);

  const openQR = (p)=>{ setSelected(p); setQrOpen(true); };

  const changeStatus = async (p, status)=>{
    try{
      await axios.patch(`${API_BASE}/api/v1/products/${p._id}/status`, { status }, headers());
      await load();
    }catch(err){ console.error('status update', err); alert('Update failed'); }
  };

  // derive client list from assigned products (unique)
  const clients = useMemo(()=>{
    const map = {};
    products.forEach(p=>{
      if (p.client) map[p.client._id] = p.client;
    });
    return Object.values(map);
  }, [products]);

  const filtered = useMemo(()=>{
    const q = search.trim().toLowerCase();
    return products.filter(p=>{
      if (clientFilter !== 'all' && String(p.client?._id) !== String(clientFilter)) return false;
      if (!q) return true;
      const pn = (p.name || '').toLowerCase();
      const cn = (p.client?.name || p.client?.email || '').toLowerCase();
      return pn.includes(q) || cn.includes(q);
    });
  }, [products, search, clientFilter]);

  return (
    <Container>
      <Row className="mb-3 align-items-center">
        <Col>
          <h3>Assigned Deliveries</h3>
          <div className="small-muted">Your assigned deliveries and quick actions</div>
        </Col>
        <Col md={6} className="text-end">
          <InputGroup className="mb-2">
            <Form.Select value={clientFilter} onChange={e=>setClientFilter(e.target.value)} style={{maxWidth:220}}>
              <option value="all">All clients</option>
              {clients.map(c=> <option key={c._id} value={c._id}>{c.name || c.email}</option>)}
            </Form.Select>
            <Form.Control placeholder="Search product or client" value={search} onChange={e=>setSearch(e.target.value)} />
          </InputGroup>
        </Col>
      </Row>

      <div className="bg-white shadow-sm rounded p-2 mb-3">
        <Table hover responsive className="mb-0">
          <thead className="table-light"><tr><th>Name</th><th>Price</th><th>Client</th><th>Status</th><th className="text-end">Actions</th></tr></thead>
          <tbody>
            {filtered.length===0 && (
              <tr><td colSpan={5} className="text-center py-4">No deliveries found</td></tr>
            )}
            {filtered.map(p=> (
              <tr key={p._id} className="align-middle">
                <td style={{minWidth:220}}>{p.name}</td>
                <td>{p.price}</td>
                <td>{p.client?.name || p.client?.email}</td>
                <td><StatusBadge status={p.status} /></td>
                <td className="text-end">
                  <Button size="sm" variant="outline-primary" className="me-2" title="Show QR" onClick={()=>openQR(p)}><FaQrcode /></Button>
                  <Dropdown align="end">
                    <Dropdown.Toggle size="sm" variant="secondary"><FaEllipsisV /></Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={()=>changeStatus(p,'Picked')}>Mark as Picked</Dropdown.Item>
                      <Dropdown.Item onClick={()=>changeStatus(p,'Out for Delivery')}>Mark Out for Delivery</Dropdown.Item>
                      <Dropdown.Item onClick={()=>changeStatus(p,'Delivered')}>Mark Delivered</Dropdown.Item>
                      <Dropdown.Item onClick={()=>changeStatus(p,'Problem')}>Report Problem</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* QR Modal small */}
      {qrOpen && selected && (
        <div className="qr-floating-modal">
          <div className="qr-card p-3 bg-white shadow rounded">
            <div style={{background:'#fff', padding:12}}>
              <QRCode value={selected.qrData} size={160} />
            </div>
            <div className="mt-2">
              <h6>{selected.name}</h6>
              <div><strong>Client:</strong> {selected.client?.name || selected.client?.email}</div>
              <div><strong>Status:</strong> <StatusBadge status={selected.status} /></div>
              <div className="mt-2 d-flex justify-content-end">
                <Button variant="secondary" size="sm" onClick={()=>setQrOpen(false)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
