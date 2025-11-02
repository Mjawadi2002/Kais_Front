import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import './ProductForm.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function ProductForm({ onCreated }){
  const [form, setForm] = useState({ name: '', price: '', buyerName: '', buyerAddress: '', buyerPhone: '' });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { t } = useTranslation();

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
      toast.success(t('products.productCreated'));
      setForm({ name: '', price: '', buyerName: '', buyerAddress: '', buyerPhone: '' });
      if (onCreated) onCreated(resp.data.product);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || t('products.createProductFailed'));
    } finally { setLoading(false); }
  };

  return (
    <>
      <Form onSubmit={submit} className="enhanced-product-form">
        <Form.Group className="mb-3 form-group-enhanced">
          <Form.Label className="form-label-enhanced">{t('products.productName')}</Form.Label>
          <Form.Control 
            className="form-control-enhanced"
            value={form.name} 
            onChange={e=>setForm({...form, name: e.target.value})} 
            required 
            placeholder={`${t('common.name')}...`}
          />
        </Form.Group>
        
        <Form.Group className="mb-3 form-group-enhanced">
          <Form.Label className="form-label-enhanced">{t('common.price')}</Form.Label>
          <div className="input-group">
            <Form.Control 
              className="form-control-enhanced"
              type="number" 
              min={0} 
              step="0.01"
              value={form.price} 
              onChange={e=>setForm({...form, price: e.target.value})} 
              required 
              placeholder="0.00"
            />
            <span className="input-group-text">{t('common.currency')}</span>
          </div>
        </Form.Group>
        
        <Form.Group className="mb-3 form-group-enhanced">
          <Form.Label className="form-label-enhanced">{t('products.buyerName')}</Form.Label>
          <Form.Control 
            className="form-control-enhanced"
            value={form.buyerName} 
            onChange={e=>setForm({...form, buyerName: e.target.value})} 
            placeholder={`${t('products.buyerName')}...`}
          />
        </Form.Group>
        
        <Form.Group className="mb-3 form-group-enhanced">
          <Form.Label className="form-label-enhanced">{t('products.buyerAddress')}</Form.Label>
          <Form.Control 
            className="form-control-enhanced"
            as="textarea" 
            rows={3} 
            value={form.buyerAddress} 
            onChange={e=>setForm({...form, buyerAddress: e.target.value})} 
            required 
            placeholder={`${t('products.buyerAddress')}...`}
          />
        </Form.Group>
        
        <Form.Group className="mb-4 form-group-enhanced">
          <Form.Label className="form-label-enhanced">{t('products.buyerPhone')}</Form.Label>
          <Form.Control 
            className="form-control-enhanced"
            value={form.buyerPhone} 
            onChange={e=>setForm({...form, buyerPhone: e.target.value})} 
            required 
            placeholder="+216 XX XXX XXX"
          />
        </Form.Group>
        
        <div className="d-grid">
          <Button 
            type="submit" 
            disabled={loading}
            className="btn-create-product"
            size="lg"
          >
            {loading ? t('products.creating') : t('products.createProduct')}
          </Button>
        </div>
      </Form>
    </>
  );
}
