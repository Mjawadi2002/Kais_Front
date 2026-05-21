import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BsBoxSeam, BsTruck, BsCheckCircle, BsQrCode, BsExclamationTriangle, BsGeoAlt, BsSearch, BsX, BsFilter } from 'react-icons/bs';
import axios from 'axios';
import QRCode from 'react-qr-code';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import PageWrapper from '../../components/common/PageWrapper';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const PRODUCT_STATUSES = ['Picked', 'Out for Delivery', 'Delivered', 'Problem', 'Failed/Returned'];

function Modal({ show, onClose, title, children }) {
  useEffect(() => {
    document.body.style.overflow = show ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [show]);
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm animate-slide-up">
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

export default function AssignedDeliveries() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [qrProduct, setQrProduct] = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);

  const getToken = () => localStorage.getItem('rf_access_token') || user?.token;

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/v1/products`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const all = res.data.products || [];
      setProducts(all.filter(p => p.assignedTo?._id === user.id || p.assignedTo === user.id));
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (product, status) => {
    try {
      await axios.patch(`${API_BASE}/api/v1/products/${product._id}/status`, { status }, { headers: { Authorization: `Bearer ${getToken()}` } });
      toast.success(`Status updated to "${status}"`);
      if (detailProduct?._id === product._id) setDetailProduct(prev => ({ ...prev, status }));
      await load();
    } catch (err) {
      if (err.response?.status === 403) toast.error('Not authorized to change this status.');
      else toast.error(err.response?.data?.message || 'Status update failed');
    }
  };

  const filtered = useMemo(() => products.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.name?.toLowerCase().includes(q) || p.buyerName?.toLowerCase().includes(q) || p.buyerAddress?.toLowerCase().includes(q);
    }
    return true;
  }), [products, search, statusFilter]);

  const selectClass = 'px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors';

  return (
    <PageWrapper>
      {/* Header banner */}
      <div className="relative mb-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6 overflow-hidden shadow-lg">
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2"><BsTruck size={22} />My Deliveries</h1>
            <p className="text-emerald-100 mt-1 text-sm">{products.length} products assigned to you</p>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-center">
              <p className="text-2xl font-extrabold text-white">{products.filter(p => p.status === 'Delivered').length}</p>
              <p className="text-xs text-emerald-200">Delivered</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-extrabold text-white">{products.filter(p => p.status === 'Out for Delivery').length}</p>
              <p className="text-xs text-emerald-200">Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 mb-5">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <BsSearch size={13} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search by product or buyer..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full ps-9 pe-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors placeholder-slate-400" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={selectClass}>
            <option value="all">All Statuses</option>
            {PRODUCT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {(search || statusFilter !== 'all') && (
            <button onClick={() => { setSearch(''); setStatusFilter('all'); }}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <BsX size={15} />Clear
            </button>
          )}
        </div>
      </div>

      {/* Products */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h5 className="font-semibold text-slate-900 dark:text-white text-sm">Assigned Products</h5>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full">{filtered.length}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 dark:border-slate-600 border-t-emerald-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <BsBoxSeam size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm text-slate-400">No deliveries found</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                    <th className="px-4 py-3 text-start text-xs font-bold uppercase tracking-wide text-slate-500">Product</th>
                    <th className="px-4 py-3 text-start text-xs font-bold uppercase tracking-wide text-slate-500">Buyer</th>
                    <th className="px-4 py-3 text-start text-xs font-bold uppercase tracking-wide text-slate-500">Address</th>
                    <th className="px-4 py-3 text-start text-xs font-bold uppercase tracking-wide text-slate-500">Status</th>
                    <th className="px-4 py-3 text-start text-xs font-bold uppercase tracking-wide text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {filtered.map(p => (
                    <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{p.name}</td>
                      <td className="px-4 py-3">
                        <p className="text-slate-700 dark:text-slate-300">{p.buyerName || '—'}</p>
                        <p className="text-xs text-slate-400">{p.buyerPhone}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 max-w-[180px] truncate">
                        <span className="flex items-center gap-1"><BsGeoAlt size={11} className="flex-shrink-0" />{p.buyerAddress || '—'}</span>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setDetailProduct(p)}
                            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors">
                            Update
                          </button>
                          <button onClick={() => setQrProduct(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors">
                            <BsQrCode size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700/50">
              {filtered.map(p => (
                <div key={p._id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{p.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{p.buyerName} · {p.buyerPhone}</p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1"><BsGeoAlt size={10} />{p.buyerAddress}</p>
                  <div className="flex gap-2">
                    {PRODUCT_STATUSES.filter(s => s !== p.status).slice(0, 2).map(s => (
                      <button key={s} onClick={() => changeStatus(p, s)}
                        className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors truncate px-2">
                        {s}
                      </button>
                    ))}
                    <button onClick={() => setQrProduct(p)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors">
                      QR
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* QR Modal */}
      <Modal show={!!qrProduct} onClose={() => setQrProduct(null)} title={`QR — ${qrProduct?.name}`}>
        <div className="p-6 flex flex-col items-center gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <QRCode
              value={qrProduct ? JSON.stringify({ id: qrProduct._id, name: qrProduct.name, status: qrProduct.status, buyer: { name: qrProduct.buyerName, phone: qrProduct.buyerPhone, address: qrProduct.buyerAddress } }) : ''}
              size={160}
            />
          </div>
          <div className="text-center">
            <p className="font-semibold text-slate-900 dark:text-white">{qrProduct?.name}</p>
            <p className="text-sm text-slate-500 mt-0.5">{qrProduct?.buyerName}</p>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center justify-center gap-1"><BsGeoAlt size={10} />{qrProduct?.buyerAddress}</p>
          </div>
        </div>
      </Modal>

      {/* Detail / Status Update Modal */}
      <Modal show={!!detailProduct} onClose={() => setDetailProduct(null)} title={detailProduct?.name}>
        {detailProduct && (
          <div className="p-6 space-y-4">
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Current Status</span>
                <StatusBadge status={detailProduct.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Buyer</span>
                <span className="font-medium text-slate-900 dark:text-white">{detailProduct.buyerName || '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Phone</span>
                <span className="font-medium text-slate-900 dark:text-white">{detailProduct.buyerPhone || '—'}</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-slate-500 flex-shrink-0">Address</span>
                <span className="font-medium text-slate-900 dark:text-white text-right">{detailProduct.buyerAddress || '—'}</span>
              </div>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Update Status</p>
            <div className="grid grid-cols-1 gap-2">
              {PRODUCT_STATUSES.map(s => (
                <button key={s} onClick={() => changeStatus(detailProduct, s)} disabled={detailProduct.status === s}
                  className={`w-full py-2.5 px-4 text-sm font-medium rounded-xl border transition-colors ${detailProduct.status === s ? 'bg-emerald-600 text-white border-emerald-600 cursor-default' : 'border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                  {s} {detailProduct.status === s && '✓'}
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </PageWrapper>
  );
}
