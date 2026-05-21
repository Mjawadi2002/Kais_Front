import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import QRCode from 'react-qr-code';
import { BsBoxSeam, BsSearch, BsTruck, BsQrCode, BsX, BsPerson, BsChevronRight } from 'react-icons/bs';
import StatusBadge from '../../components/common/StatusBadge';
import PageWrapper from '../../components/common/PageWrapper';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const STATUS_OPTIONS = ['In Stock', 'Picked', 'Out for Delivery', 'Delivered', 'Problem', 'Failed/Returned'];

const inputClass = 'w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors placeholder-slate-400';

function Modal({ show, onClose, title, children, maxW = 'max-w-md' }) {
  useEffect(() => {
    document.body.style.overflow = show ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [show]);
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full ${maxW} animate-slide-up`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h5 className="font-semibold text-slate-900 dark:text-white text-sm">{title}</h5>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors">
            <BsX size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function StatusDropdown({ product, onUpdate }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1.5">
        <StatusBadge status={product.status} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 min-w-[180px]">
            {STATUS_OPTIONS.map(s => (
              <button key={s} onClick={() => { onUpdate(product._id, s); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${product.status === s ? 'opacity-50 cursor-default' : ''}`}
                disabled={product.status === s}>
                <StatusBadge status={s} />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminProducts() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrProduct, setQrProduct] = useState(null);
  const [assignProduct, setAssignProduct] = useState(null);
  const [assignPersonId, setAssignPersonId] = useState('');

  const getToken = () => localStorage.getItem('rf_access_token') || user?.token;
  const headers = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, clientRes, delivRes] = await Promise.all([
        axios.get(`${API_BASE}/api/v1/products`, headers()),
        axios.get(`${API_BASE}/api/v1/users?role=client`, headers()),
        axios.get(`${API_BASE}/api/v1/users?role=delivery`, headers()),
      ]);
      setProducts(prodRes.data.products || []);
      setClients(clientRes.data.users || []);
      setDeliveryPersons(delivRes.data.users || []);
    } catch { toast.error(t('errors.loadProductsFailed')); }
    setLoading(false);
  }, [user]);

  useEffect(() => { if (user) load(); }, [user]);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`${API_BASE}/api/v1/products/${id}/status`, { status }, headers());
      toast.success(t('messages.statusUpdated'));
      load();
    } catch { toast.error(t('errors.updateStatusFailed')); }
  };

  const assignDelivery = async () => {
    if (!assignPersonId) { toast.error(t('admin.selectDeliveryPerson')); return; }
    try {
      await axios.post(`${API_BASE}/api/v1/products/${assignProduct._id}/assign`, { deliveryPersonId: assignPersonId }, headers());
      toast.success(t('products.assigned'));
      setAssignProduct(null);
      setAssignPersonId('');
      load();
    } catch { toast.error(t('errors.assignFailed')); }
  };

  const printInvoice = (p) => {
    const html = `<!DOCTYPE html><html><head><title>Invoice - ${p.name}</title>
    <style>body{font-family:sans-serif;padding:32px;max-width:600px;margin:0 auto}h2{color:#4f46e5}table{width:100%;border-collapse:collapse}td{padding:8px 12px;border-bottom:1px solid #e2e8f0}td:first-child{font-weight:600;color:#64748b;width:40%}</style>
    </head><body><h2>RouteFlow — Invoice</h2>
    <table><tr><td>Product</td><td>${p.name}</td></tr>
    <tr><td>Price</td><td>${p.price} TND</td></tr>
    <tr><td>Status</td><td>${p.status}</td></tr>
    <tr><td>Buyer</td><td>${p.buyerName || 'N/A'}</td></tr>
    <tr><td>Phone</td><td>${p.buyerPhone || 'N/A'}</td></tr>
    <tr><td>Address</td><td>${p.buyerAddress || 'N/A'}</td></tr>
    <tr><td>Assigned To</td><td>${p.assignedTo?.name || 'Unassigned'}</td></tr>
    </table><p style="margin-top:32px;color:#94a3b8;font-size:12px">Generated by RouteFlow on ${new Date().toLocaleDateString()}</p>
    </body></html>`;
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    w.print();
  };

  const filtered = products.filter(p => {
    if (selectedClient && p.client?._id !== selectedClient) return false;
    if (query && !p.name?.toLowerCase().includes(query.toLowerCase()) && !p.buyerName?.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const clientProductCount = (cid) => products.filter(p => p.client?._id === cid).length;

  return (
    <PageWrapper>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BsBoxSeam size={22} className="text-indigo-500" />
          {t('navigation.products')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{t('admin.manageProducts')}</p>
      </div>

      <div className="flex gap-4 flex-col lg:flex-row">
        {/* Client sidebar */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{t('admin.clients')}</p>
            </div>
            <div className="py-1">
              <button
                onClick={() => setSelectedClient(null)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${!selectedClient ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
              >
                <span className="flex items-center gap-2"><BsPerson size={14} />{t('admin.allClients')}</span>
                <span className="text-xs font-bold">{products.length}</span>
              </button>
              {clients.map(c => (
                <button
                  key={c._id}
                  onClick={() => setSelectedClient(c._id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${selectedClient === c._id ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                >
                  <span className="truncate">{c.name}</span>
                  <span className="text-xs font-bold ml-2 flex-shrink-0">{clientProductCount(c._id)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products panel */}
        <div className="flex-1 min-w-0">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <div className="relative flex-1">
                <BsSearch size={13} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder={t('admin.searchProducts')} value={query} onChange={e => setQuery(e.target.value)}
                  className="w-full ps-9 pe-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors placeholder-slate-400" />
              </div>
              <span className="text-xs text-slate-500 whitespace-nowrap">{filtered.length} {t('common.products')}</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 dark:border-slate-600 border-t-indigo-500" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center">
                <BsBoxSeam size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm text-slate-400">{t('admin.noProductsFound')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                      <th className="px-4 py-3 text-start text-xs font-bold uppercase tracking-wide text-slate-500">{t('products.productName')}</th>
                      <th className="px-4 py-3 text-start text-xs font-bold uppercase tracking-wide text-slate-500">{t('common.client')}</th>
                      <th className="px-4 py-3 text-start text-xs font-bold uppercase tracking-wide text-slate-500">{t('common.price')}</th>
                      <th className="px-4 py-3 text-start text-xs font-bold uppercase tracking-wide text-slate-500">{t('common.status')}</th>
                      <th className="px-4 py-3 text-start text-xs font-bold uppercase tracking-wide text-slate-500">{t('products.assignedTo')}</th>
                      <th className="px-4 py-3 text-start text-xs font-bold uppercase tracking-wide text-slate-500">{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {filtered.map(p => (
                      <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{p.name}</td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{p.client?.name || '—'}</td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium">{p.price} TND</td>
                        <td className="px-4 py-3">
                          <StatusDropdown product={p} onUpdate={updateStatus} />
                        </td>
                        <td className="px-4 py-3">
                          {p.assignedTo ? (
                            <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                              <BsTruck size={12} />{p.assignedTo.name}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">{t('products.notAssigned')}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => { setAssignProduct(p); setAssignPersonId(p.assignedTo?._id || ''); }}
                              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors flex items-center gap-1">
                              <BsTruck size={11} />{t('products.assign')}
                            </button>
                            <button onClick={() => setQrProduct(p)}
                              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors flex items-center gap-1">
                              <BsQrCode size={11} />QR
                            </button>
                            <button onClick={() => printInvoice(p)}
                              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors">
                              {t('common.print')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Modal */}
      <Modal show={!!qrProduct} onClose={() => setQrProduct(null)} title={`QR — ${qrProduct?.name}`}>
        <div className="p-6 flex flex-col items-center gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <QRCode value={qrProduct ? JSON.stringify({ id: qrProduct._id, name: qrProduct.name, status: qrProduct.status, buyer: qrProduct.buyerName, phone: qrProduct.buyerPhone }) : ''} size={180} />
          </div>
          <div className="text-center">
            <p className="font-semibold text-slate-900 dark:text-white">{qrProduct?.name}</p>
            <p className="text-sm text-slate-500 mt-0.5">{qrProduct?.buyerName} · {qrProduct?.buyerPhone}</p>
          </div>
        </div>
      </Modal>

      {/* Assign Modal */}
      <Modal show={!!assignProduct} onClose={() => { setAssignProduct(null); setAssignPersonId(''); }} title={t('products.assignDeliveryPerson')}>
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">{t('products.assigningProduct')}: <span className="font-semibold text-slate-900 dark:text-white">{assignProduct?.name}</span></p>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('admin.deliveryPerson')}</label>
            <select value={assignPersonId} onChange={e => setAssignPersonId(e.target.value)} className={inputClass}>
              <option value="">{t('admin.selectDeliveryPerson')}</option>
              {deliveryPersons.map(d => (
                <option key={d._id} value={d._id}>{d.name} ({d.email})</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => { setAssignProduct(null); setAssignPersonId(''); }}
              className="flex-1 py-2.5 px-4 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium">
              {t('common.cancel')}
            </button>
            <button onClick={assignDelivery}
              className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors text-sm font-medium">
              {t('products.assign')}
            </button>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  );
}
