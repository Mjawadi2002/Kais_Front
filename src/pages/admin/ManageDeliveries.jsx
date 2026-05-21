import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import apiClient from '../../config/apiClient';
import { BsTruck, BsSearch, BsX, BsBox, BsCheck2Circle, BsCheckCircle, BsExclamationTriangle, BsPerson } from 'react-icons/bs';
import StatusBadge from '../../components/common/StatusBadge';
import PageWrapper from '../../components/common/PageWrapper';

const STATUS_OPTIONS = [
  { value: '', label: 'deliveries.allStatuses' },
  { value: 'In Stock', label: 'status.inStock' },
  { value: 'Picked', label: 'status.picked' },
  { value: 'Out for Delivery', label: 'status.outForDelivery' },
  { value: 'Delivered', label: 'status.delivered' },
  { value: 'Problem', label: 'status.problem' },
  { value: 'Failed/Returned', label: 'status.failed' },
];

function StatusMenu({ product, onUpdate }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button onClick={() => setOpen(o => !o)}><StatusBadge status={product.status} /></button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 min-w-[180px]">
            {STATUS_OPTIONS.slice(1).map(s => (
              <button key={s.value} disabled={product.status === s.value}
                onClick={() => { onUpdate(product._id, s.value); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-40">
                <StatusBadge status={s.value} />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function ManageDeliveries() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: '', client: '', deliveryPerson: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, cliRes, delRes] = await Promise.all([
        apiClient.get('/api/v1/products'),
        apiClient.get('/api/v1/users?role=client'),
        apiClient.get('/api/v1/users?role=delivery'),
      ]);
      setProducts(prodRes.data.products || prodRes.data || []);
      setClients(cliRes.data.users || []);
      setDeliveryPersons(delRes.data.users || []);
    } catch { toast.error(t('errors.loadProductsFailed')); }
    setLoading(false);
  }, [user]);

  useEffect(() => { if (user) load(); }, [user]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [filters]);

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }));
  const clearFilters = () => setFilters({ search: '', status: '', client: '', deliveryPerson: '' });

  const updateStatus = async (id, status) => {
    try {
      await apiClient.patch(`/api/v1/products/${id}/status`, { status });
      toast.success(t('messages.statusUpdated'));
      load();
    } catch { toast.error(t('errors.updateStatusFailed')); }
  };

  const filtered = products.filter(p => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!p.name?.toLowerCase().includes(q) && !p.buyerName?.toLowerCase().includes(q)) return false;
    }
    if (filters.status && p.status !== filters.status) return false;
    if (filters.client && p.client?._id !== filters.client) return false;
    if (filters.deliveryPerson && p.assignedTo?._id !== filters.deliveryPerson) return false;
    return true;
  });

  const selectClass = 'px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors';

  return (
    <PageWrapper>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BsTruck size={22} className="text-indigo-500" />
          {t('deliveries.manageDeliveries')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{t('admin.monitorDeliveries')}</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 mb-5">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <BsSearch size={13} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder={t('deliveries.searchPlaceholder')} value={filters.search}
              onChange={e => setFilter('search', e.target.value)}
              className="w-full ps-9 pe-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors placeholder-slate-400" />
          </div>
          <select value={filters.status} onChange={e => setFilter('status', e.target.value)} className={selectClass}>
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{t(o.label)}</option>)}
          </select>
          <select value={filters.client} onChange={e => setFilter('client', e.target.value)} className={selectClass}>
            <option value="">{t('deliveries.allClients')}</option>
            {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select value={filters.deliveryPerson} onChange={e => setFilter('deliveryPerson', e.target.value)} className={selectClass}>
            <option value="">{t('deliveries.allDeliveryPersons')}</option>
            {deliveryPersons.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
          {(filters.search || filters.status || filters.client || filters.deliveryPerson) && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <BsX size={15} />{t('common.clear')}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h5 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <BsBox size={15} className="text-indigo-500" />{t('navigation.products')}
          </h5>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full">{filtered.length}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 dark:border-slate-600 border-t-indigo-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <BsBox size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm text-slate-400">{t('deliveries.noProductsFound')}</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                    <th className="px-4 py-3 text-start text-xs font-bold uppercase tracking-wide text-slate-500">{t('products.productName')}</th>
                    <th className="px-4 py-3 text-start text-xs font-bold uppercase tracking-wide text-slate-500">{t('common.price')}</th>
                    <th className="px-4 py-3 text-start text-xs font-bold uppercase tracking-wide text-slate-500">{t('common.client')}</th>
                    <th className="px-4 py-3 text-start text-xs font-bold uppercase tracking-wide text-slate-500">{t('products.deliveryPerson')}</th>
                    <th className="px-4 py-3 text-start text-xs font-bold uppercase tracking-wide text-slate-500">{t('common.status')}</th>
                    <th className="px-4 py-3 text-start text-xs font-bold uppercase tracking-wide text-slate-500">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {filtered.map(p => (
                    <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{p.name}</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{p.price} TND</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{p.client?.name || p.buyerName || '—'}</td>
                      <td className="px-4 py-3">
                        {p.assignedTo ? (
                          <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-medium"><BsTruck size={12} />{p.assignedTo.name}</span>
                        ) : <span className="text-xs text-slate-400">{t('products.notAssigned')}</span>}
                      </td>
                      <td className="px-4 py-3"><StatusMenu product={p} onUpdate={updateStatus} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => updateStatus(p._id, 'Picked')} disabled={p.status === 'Picked'}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/30 disabled:opacity-30 transition-colors" title={t('deliveries.markAsPicked')}>
                            <BsCheck2Circle size={14} />
                          </button>
                          <button onClick={() => updateStatus(p._id, 'Delivered')} disabled={p.status === 'Delivered'}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 disabled:opacity-30 transition-colors" title={t('deliveries.markAsDelivered')}>
                            <BsCheckCircle size={14} />
                          </button>
                          <button onClick={() => updateStatus(p._id, 'Problem')} disabled={p.status === 'Problem'}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 disabled:opacity-30 transition-colors" title={t('deliveries.reportProblem')}>
                            <BsExclamationTriangle size={14} />
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
                      <p className="text-xs text-slate-500 mt-0.5">{p.price} TND</p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><BsPerson size={11} />{p.client?.name || '—'}</span>
                    {p.assignedTo && <span className="flex items-center gap-1 text-emerald-600"><BsTruck size={11} />{p.assignedTo.name}</span>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => updateStatus(p._id, 'Delivered')}
                      className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors">
                      {t('deliveries.markAsDelivered')}
                    </button>
                    <button onClick={() => updateStatus(p._id, 'Problem')}
                      className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 hover:bg-amber-100 transition-colors">
                      {t('deliveries.reportProblem')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </PageWrapper>
  );
}
