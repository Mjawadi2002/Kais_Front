import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import QRCode from 'react-qr-code';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function MyProducts(){
  const { user } = useAuth();
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
    <Container>
      <h3 className="mb-3">My Products</h3>
      <Table hover>
        <thead><tr><th>Name</th><th>Price</th><th>Status</th><th>QR</th><th>Actions</th></tr></thead>
        <tbody>
          {products.map(p=> (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td>{p.price}</td>
              <td>{p.status}</td>
              <td><Button size="sm" onClick={()=>open(p)}>View QR</Button></td>
              <td><small className="small-muted">{new Date(p.createdAt).toLocaleString()}</small></td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={show} onHide={()=>setShow(false)} size="lg">
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
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}
