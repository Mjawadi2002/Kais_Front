import React, { useState, useEffect } from 'react';
import { BsBox, BsPerson, BsTruck, BsGeoAlt, BsTelephone, BsCalendar, BsX } from 'react-icons/bs';
import { toast } from 'react-toastify';
import apiClient from '../config/apiClient';

const inputClass = 'w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors placeholder-slate-400 disabled:opacity-50 disabled:cursor-not-allowed';
const labelClass = 'block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1';

const STATUS_OPTIONS = ['pending', 'assigned', 'in_transit', 'delivered', 'cancelled', 'failed'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent'];

export default function DeliveryModal({ show, onHide, delivery = null, type = 'view', onSuccess }) {
  const [formData, setFormData] = useState({
    product: '', client: '', deliveryPerson: '', priority: 'medium', status: 'pending',
    deliveryAddress: { street: '', city: '', state: '', zipCode: '', country: 'Tunisia' },
    clientPhone: '', deliveryFee: '', notes: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    document.body.style.overflow = show ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [show]);

  useEffect(() => {
    if (delivery && type !== 'create') {
      setFormData({
        product: delivery.product?._id || '',
        client: delivery.client?._id || '',
        deliveryPerson: delivery.deliveryPerson?._id || '',
        priority: delivery.priority || 'medium',
        status: delivery.status || 'pending',
        deliveryAddress: {
          street: delivery.deliveryAddress?.street || '',
          city: delivery.deliveryAddress?.city || '',
          state: delivery.deliveryAddress?.state || '',
          zipCode: delivery.deliveryAddress?.zipCode || '',
          country: delivery.deliveryAddress?.country || 'Tunisia',
        },
        clientPhone: delivery.clientPhone || '',
        deliveryFee: delivery.deliveryFee?.toString() || '',
        notes: delivery.notes || '',
      });
    } else if (type === 'create') {
      setFormData({ product: '', client: '', deliveryPerson: '', priority: 'medium', status: 'pending', deliveryAddress: { street: '', city: '', state: '', zipCode: '', country: 'Tunisia' }, clientPhone: '', deliveryFee: '', notes: '' });
    }
    setErrors({});
  }, [delivery, type]);

  useEffect(() => {
    if (!show) return;
    Promise.all([
      apiClient.get('/api/v1/users?role=client'),
      apiClient.get('/api/v1/users?role=delivery'),
      apiClient.get('/api/v1/products'),
    ]).then(([c, d, p]) => {
      setClients(c.data.users || []);
      setDeliveryPersons(d.data.users || []);
      setProducts(p.data.products || []);
    }).catch(() => toast.error('Failed to load form data'));
  }, [show]);

  const set = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(f => ({ ...f, [parent]: { ...f[parent], [child]: value } }));
    } else {
      setFormData(f => ({ ...f, [field]: value }));
    }
    if (errors[field]) setErrors(e => ({ ...e, [field]: null }));
  };

  const validate = () => {
    const e = {};
    if (!formData.product) e.product = 'Required';
    if (!formData.client) e.client = 'Required';
    if (!formData.deliveryAddress.street) e['deliveryAddress.street'] = 'Required';
    if (!formData.deliveryAddress.city) e['deliveryAddress.city'] = 'Required';
    if (!formData.deliveryAddress.zipCode) e['deliveryAddress.zipCode'] = 'Required';
    if (!formData.clientPhone) e.clientPhone = 'Required';
    if (!formData.deliveryFee || isNaN(+formData.deliveryFee)) e.deliveryFee = 'Required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) { toast.error('Please fix the form errors'); return; }
    setLoading(true);
    try {
      const body = { ...formData, deliveryFee: parseFloat(formData.deliveryFee) };
      if (type === 'create') await apiClient.post('/api/v1/deliveries', body);
      else await apiClient.put(`/api/v1/deliveries/${delivery._id}`, body);
      toast.success(type === 'create' ? 'Delivery created' : 'Delivery updated');
      onSuccess?.();
      onHide();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save delivery');
    } finally { setLoading(false); }
  };

  const isReadOnly = type === 'view';
  const selectedProduct = products.find(p => p._id === formData.product);
  const selectedClient = clients.find(c => c._id === formData.client);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl my-4 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h5 className="font-semibold text-slate-900 dark:text-white">
            {type === 'create' && 'Create New Delivery'}
            {type === 'edit' && 'Edit Delivery'}
            {type === 'view' && `Delivery Details${delivery?.trackingNumber ? ` — ${delivery.trackingNumber}` : ''}`}
          </h5>
          <button onClick={onHide} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors">
            <BsX size={18} />
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product */}
            <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4 space-y-3">
              <h6 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"><BsBox size={14} />Product</h6>
              <div>
                <label className={labelClass}>Product *</label>
                <select value={formData.product} onChange={e => set('product', e.target.value)} disabled={isReadOnly} className={`${inputClass} ${errors.product ? 'border-red-400' : ''}`}>
                  <option value="">Select a product</option>
                  {products.map(p => <option key={p._id} value={p._id}>{p.name} — {p.price} TND</option>)}
                </select>
                {errors.product && <p className="text-xs text-red-500 mt-1">{errors.product}</p>}
              </div>
              {selectedProduct && <div className="text-xs text-slate-500 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">Price: {selectedProduct.price} TND</div>}
            </div>

            {/* Client */}
            <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4 space-y-3">
              <h6 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"><BsPerson size={14} />Client</h6>
              <div>
                <label className={labelClass}>Client *</label>
                <select value={formData.client} onChange={e => set('client', e.target.value)} disabled={isReadOnly} className={`${inputClass} ${errors.client ? 'border-red-400' : ''}`}>
                  <option value="">Select a client</option>
                  {clients.map(c => <option key={c._id} value={c._id}>{c.name} ({c.email})</option>)}
                </select>
                {errors.client && <p className="text-xs text-red-500 mt-1">{errors.client}</p>}
              </div>
              <div>
                <label className={labelClass}>Phone *</label>
                <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                  <span className="flex items-center px-3 bg-slate-50 dark:bg-slate-700 border-e border-slate-200 dark:border-slate-600 text-slate-400"><BsTelephone size={13} /></span>
                  <input type="tel" value={formData.clientPhone} onChange={e => set('clientPhone', e.target.value)} disabled={isReadOnly} placeholder="+216 XX XXX XXX"
                    className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none placeholder-slate-400 disabled:opacity-50" />
                </div>
                {errors.clientPhone && <p className="text-xs text-red-500 mt-1">{errors.clientPhone}</p>}
              </div>
              {selectedClient && <div className="text-xs text-slate-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">{selectedClient.email}</div>}
            </div>

            {/* Delivery Address */}
            <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4 space-y-3">
              <h6 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"><BsGeoAlt size={14} />Delivery Address</h6>
              {[['street', 'Street *'], ['city', 'City *'], ['state', 'State'], ['zipCode', 'Zip Code *'], ['country', 'Country']].map(([key, lbl]) => (
                <div key={key}>
                  <label className={labelClass}>{lbl}</label>
                  <input type="text" value={formData.deliveryAddress[key]} disabled={isReadOnly}
                    onChange={e => set(`deliveryAddress.${key}`, e.target.value)}
                    className={`${inputClass} ${errors[`deliveryAddress.${key}`] ? 'border-red-400' : ''}`} />
                  {errors[`deliveryAddress.${key}`] && <p className="text-xs text-red-500 mt-1">{errors[`deliveryAddress.${key}`]}</p>}
                </div>
              ))}
            </div>

            {/* Delivery Settings */}
            <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4 space-y-3">
              <h6 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"><BsTruck size={14} />Delivery Settings</h6>
              <div>
                <label className={labelClass}>Delivery Person</label>
                <select value={formData.deliveryPerson} onChange={e => set('deliveryPerson', e.target.value)} disabled={isReadOnly} className={inputClass}>
                  <option value="">Unassigned</option>
                  {deliveryPersons.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Priority</label>
                <select value={formData.priority} onChange={e => set('priority', e.target.value)} disabled={isReadOnly} className={inputClass}>
                  {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
              {type !== 'create' && (
                <div>
                  <label className={labelClass}>Status</label>
                  <select value={formData.status} onChange={e => set('status', e.target.value)} disabled={isReadOnly} className={inputClass}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className={labelClass}>Delivery Fee (TND) *</label>
                <input type="number" step="0.01" min="0" value={formData.deliveryFee} disabled={isReadOnly}
                  onChange={e => set('deliveryFee', e.target.value)} placeholder="0.00"
                  className={`${inputClass} ${errors.deliveryFee ? 'border-red-400' : ''}`} />
                {errors.deliveryFee && <p className="text-xs text-red-500 mt-1">{errors.deliveryFee}</p>}
              </div>
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className={labelClass}>Notes</label>
              <textarea rows={3} value={formData.notes} disabled={isReadOnly} onChange={e => set('notes', e.target.value)}
                placeholder="Any special delivery instructions..." className={`${inputClass} resize-none`} />
            </div>

            {/* Timeline (view mode) */}
            {type === 'view' && delivery && (
              <div className="md:col-span-2 bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4">
                <h6 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3"><BsCalendar size={14} />Timeline</h6>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  {[['Created', delivery.createdAt], ['Updated', delivery.updatedAt], ['Est. Delivery', delivery.estimatedDeliveryDate]].map(([lbl, date]) => (
                    <div key={lbl}>
                      <p className="text-xs text-slate-500 mb-0.5">{lbl}</p>
                      <p className="font-medium text-slate-900 dark:text-white">{date ? new Date(date).toLocaleString() : 'Not set'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700">
            <button type="button" onClick={onHide}
              className="flex-1 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium">
              {isReadOnly ? 'Close' : 'Cancel'}
            </button>
            {!isReadOnly && (
              <button type="submit" disabled={loading}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2">
                {loading && <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />}
                {type === 'create' ? 'Create Delivery' : 'Update Delivery'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
