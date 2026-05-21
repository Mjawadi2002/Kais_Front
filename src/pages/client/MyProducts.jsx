import React, { useEffect, useState } from 'react';
import { BsBox, BsQrCode, BsTruck, BsPrinter, BsX, BsSearch } from 'react-icons/bs';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import QRCode from 'react-qr-code';
import StatusBadge from '../../components/common/StatusBadge';
import PageWrapper from '../../components/common/PageWrapper';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const DELIVERY_FEE = parseFloat(process.env.REACT_APP_DELIVERY_FEE) || 7;

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

export default function MyProducts() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('rf_access_token') || user?.token;
      const res = await axios.get(`${API_BASE}/api/v1/products`, { headers: { Authorization: `Bearer ${token}` } });
      setProducts(res.data.products || []);
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const printInvoice = (p) => {
    const total = parseFloat(p.price) + DELIVERY_FEE;
    const html = `<!DOCTYPE html><html><head><title>Invoice - ${p.name}</title>
    <style>
      body{font-family:sans-serif;padding:32px;background:#f5f5f5}
      .wrap{max-width:680px;margin:0 auto;background:#fff;padding:40px;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,.1)}
      h2{color:#6366f1;margin:0}
      .hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #6366f1;padding-bottom:20px;margin-bottom:30px}
      .badge{display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;background:#6366f1;color:#fff}
      table{width:100%;border-collapse:collapse;margin-bottom:20px}
      td,th{padding:10px 14px;border-bottom:1px solid #e2e8f0;font-size:14px}
      th{text-align:left;font-weight:700;color:#64748b;font-size:11px;text-transform:uppercase}
      .total{font-weight:700;font-size:16px;color:#6366f1}
      .footer{margin-top:30px;padding-top:20px;border-top:1px solid #e2e8f0;font-size:12px;color:#94a3b8}
    </style></head>
    <body><div class="wrap">
      <div class="hdr"><div><h2>RouteFlow</h2><div style="font-size:12px;color:#64748b;margin-top:4px">Delivery Invoice</div></div>
      <div style="text-align:right"><div style="font-size:24px;font-weight:800;color:#333">INVOICE</div>
      <div style="font-size:12px;color:#64748b;margin-top:4px">${new Date().toLocaleDateString()}</div></div></div>
      <table><tr><th>Field</th><th>Details</th></tr>
        <tr><td>Product</td><td><b>${p.name}</b></td></tr>
        <tr><td>Buyer</td><td>${p.buyerName || 'N/A'}</td></tr>
        <tr><td>Phone</td><td>${p.buyerPhone || 'N/A'}</td></tr>
        <tr><td>Address</td><td>${p.buyerAddress || 'N/A'}</td></tr>
        <tr><td>Status</td><td><span class="badge">${p.status}</span></td></tr>
        <tr><td>Assigned To</td><td>${p.assignedTo?.name || 'Unassigned'}</td></tr>
      </table>
      <table><tr><th>Description</th><th style="text-align:right">Amount</th></tr>
        <tr><td>Product Price</td><td style="text-align:right">${p.price} TND</td></tr>
        <tr><td>Delivery Fee</td><td style="text-align:right">${DELIVERY_FEE} TND</td></tr>
        <tr><td class="total">Total</td><td class="total" style="text-align:right">${total.toFixed(2)} TND</td></tr>
      </table>
      <div class="footer">Thank you for choosing RouteFlow · All deliveries insured in transit</div>
    </div></body></html>`;
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    w.print();
  };

  const filtered = products.filter(p => {
    if (!query) return true;
    const q = query.toLowerCase();
    return p.name?.toLowerCase().includes(q) || p.buyerName?.toLowerCase().includes(q);
  });

  return (
    <PageWrapper>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BsBox size={22} className="text-blue-500" />
          {t('products.myProducts')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{t('products.manageYourProducts')}</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-700">
          <div className="relative flex-1">
            <BsSearch size={13} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder={t('admin.searchNameOrEmail')} value={query} onChange={e => setQuery(e.target.value)}
              className="w-full ps-9 pe-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors placeholder-slate-400" />
          </div>
          <span className="text-xs text-slate-500">{filtered.length} {t('common.products')}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 dark:border-slate-600 border-t-blue-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <BsBox size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm text-slate-400">{t('products.noProducts')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                  <th className="px-4 py-3 text-start text-xs font-bold uppercase tracking-wide text-slate-500">{t('products.productName')}</th>
                  <th className="px-4 py-3 text-start text-xs font-bold uppercase tracking-wide text-slate-500">{t('common.price')}</th>
                  <th className="px-4 py-3 text-start text-xs font-bold uppercase tracking-wide text-slate-500">{t('products.buyerName')}</th>
                  <th className="px-4 py-3 text-start text-xs font-bold uppercase tracking-wide text-slate-500">{t('common.status')}</th>
                  <th className="px-4 py-3 text-start text-xs font-bold uppercase tracking-wide text-slate-500">{t('products.assignedTo')}</th>
                  <th className="px-4 py-3 text-start text-xs font-bold uppercase tracking-wide text-slate-500">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filtered.map(p => (
                  <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{p.name}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">{p.price} TND</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{p.buyerName || '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3">
                      {p.assignedTo ? (
                        <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                          <BsTruck size={12} />{p.assignedTo.name}
                        </span>
                      ) : <span className="text-xs text-slate-400">{t('products.notAssigned')}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setSelected(p)}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors flex items-center gap-1">
                          <BsQrCode size={11} />QR
                        </button>
                        <button onClick={() => printInvoice(p)}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors flex items-center gap-1">
                          <BsPrinter size={11} />{t('common.print')}
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

      <Modal show={!!selected} onClose={() => setSelected(null)} title={`QR — ${selected?.name}`}>
        <div className="p-6 flex flex-col items-center gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <QRCode
              value={selected ? JSON.stringify({ id: selected._id, name: selected.name, status: selected.status, buyer: { name: selected.buyerName, phone: selected.buyerPhone, address: selected.buyerAddress } }) : ''}
              size={160}
            />
          </div>
          <div className="text-center">
            <p className="font-semibold text-slate-900 dark:text-white">{selected?.name}</p>
            <p className="text-sm text-slate-500 mt-0.5">{selected?.buyerName} · {selected?.buyerPhone}</p>
          </div>
          <button onClick={() => printInvoice(selected)}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
            <BsPrinter size={15} />{t('common.printInvoice')}
          </button>
        </div>
      </Modal>
    </PageWrapper>
  );
}
