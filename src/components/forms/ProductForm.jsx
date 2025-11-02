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
      <Form onSubmit={submit}>
        <div className="enhanced-form-group">
          <label className="enhanced-form-label">{t('products.productName')}</label>
          <Form.Control 
            className="enhanced-form-control"
            value={form.name} 
            onChange={e=>setForm({...form, name: e.target.value})} 
            required 
            placeholder={`${t('common.name')}...`}
          />
        </div>
        
        <div className="enhanced-form-group">
          <label className="enhanced-form-label">{t('common.price')}</label>
          <div className="input-group">
            <Form.Control 
              className="enhanced-form-control"
              type="number" 
              min={0} 
              step="0.01"
              value={form.price} 
              onChange={e=>setForm({...form, price: e.target.value})} 
              required 
              placeholder="0.00"
            />
            <span className="currency-addon">TND</span>
          </div>
        </div>
        
        <div className="enhanced-form-group">
          <label className="enhanced-form-label">{t('products.buyerName')}</label>
          <Form.Control 
            className="enhanced-form-control"
            value={form.buyerName} 
            onChange={e=>setForm({...form, buyerName: e.target.value})} 
            placeholder={`${t('products.buyerName')}...`}
          />
        </div>
        
        <div className="enhanced-form-group">
          <label className="enhanced-form-label">{t('products.buyerAddress')}</label>
          <Form.Control 
            className="enhanced-textarea"
            as="textarea" 
            rows={3} 
            value={form.buyerAddress} 
            onChange={e=>setForm({...form, buyerAddress: e.target.value})} 
            required 
            placeholder={`${t('products.buyerAddress')}...`}
          />
        </div>
        
        <div className="enhanced-form-group">
          <label className="enhanced-form-label">{t('products.buyerPhone')}</label>
          <Form.Control 
            className="enhanced-form-control"
            value={form.buyerPhone} 
            onChange={e=>setForm({...form, buyerPhone: e.target.value})} 
            required 
            placeholder="+216 XX XXX XXX"
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={loading}
          className="enhanced-submit-btn"
        >
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              Creating Product...
            </>
          ) : (
            t('products.createProduct')
          )}
        </Button>
      </Form>
    </>
  );
}
