import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function ProductForm({ onCreated }){
  const [form, setForm] = useState({ name: '', price: '', buyerName: '', buyerAddress: '', buyerPhone: '' });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = user?.token;
      const resp = await axios.post(`${API_BASE}/api/v1/products`, {
        name: form.name,
        price: Number(form.price),
        buyerName: form.buyerName,
        buyerAddress: form.buyerAddress,
        buyerPhone: form.buyerPhone,
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Product created');
      setForm({ name: '', price: '', buyerName: '', buyerAddress: '', buyerPhone: '' });
      if (onCreated) onCreated(resp.data.product);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Create product failed');
    } finally { setLoading(false); }
  };

  return (
    <Form onSubmit={submit}>
      <Form.Group className="mb-2">
        <Form.Label>Product name</Form.Label>
        <Form.Control value={form.name} onChange={e=>setForm({...form, name: e.target.value})} required />
      </Form.Group>
      <Form.Group className="mb-2">
        <Form.Label>Price</Form.Label>
        <Form.Control type="number" min={0} value={form.price} onChange={e=>setForm({...form, price: e.target.value})} required />
      </Form.Group>
      <Form.Group className="mb-2">
        <Form.Label>Buyer name</Form.Label>
        <Form.Control value={form.buyerName} onChange={e=>setForm({...form, buyerName: e.target.value})} />
      </Form.Group>
      <Form.Group className="mb-2">
        <Form.Label>Buyer address</Form.Label>
        <Form.Control as="textarea" rows={2} value={form.buyerAddress} onChange={e=>setForm({...form, buyerAddress: e.target.value})} required />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Buyer phone</Form.Label>
        <Form.Control value={form.buyerPhone} onChange={e=>setForm({...form, buyerPhone: e.target.value})} required />
      </Form.Group>
      <div className="d-grid">
        <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create product'}</Button>
      </div>
    </Form>
  );
}
