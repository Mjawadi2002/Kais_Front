import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BsBox, BsTruck, BsCheckCircle, BsExclamationTriangle, BsClockHistory, BsBoxSeam, BsBarChart, BsGraphUp, BsCalendar, BsPlus } from 'react-icons/bs';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, ArcElement,
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../config/apiClient';
import StatusBadge from '../../components/common/StatusBadge';
import PageWrapper from '../../components/common/PageWrapper';
import { useNavigate } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const STAT_STYLES = [
  { iconBg: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' },
  { iconBg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' },
  { iconBg: 'bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400' },
  { iconBg: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' },
];

function StatCard({ icon, title, value, styleIdx = 0, loading }) {
  const { iconBg } = STAT_STYLES[styleIdx];
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>{icon}</div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-0.5">{title}</p>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none">
            {loading ? <span className="inline-block w-10 h-7 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /> : (value ?? 0)}
          </p>
        </div>
      </div>
    </div>
  );
}

const DOUGHNUT_COLORS = ['#64748b', '#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ef4444'];

export default function ClientDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await apiClient.get('/api/v1/stats/client');
      setStats(res.data);
      setError(null);
    } catch { setError(true); }
    finally { setLoading(false); }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const doughnutData = useMemo(() => ({
    labels: ['In Stock', 'Picked', 'Out for Delivery', 'Delivered', 'Problem', 'Failed/Returned'],
    datasets: [{ data: [stats?.inStock||0, stats?.picked||0, stats?.inTransit||0, stats?.delivered||0, stats?.problem||0, stats?.failed||0], backgroundColor: DOUGHNUT_COLORS, borderWidth: 0 }],
  }), [stats]);

  const barData = {
    labels: ['Last 7d', 'Last 14d', 'Last 30d', 'All Time'],
    datasets: [
      { label: 'Delivered', data: [stats?.timeline?.last7Days||0, stats?.timeline?.last14Days||0, stats?.timeline?.last30Days||0, stats?.delivered||0], backgroundColor: '#10b981', borderColor: '#10b981', borderWidth: 2 },
      { label: 'Problems', data: [stats?.timeline?.problems7Days||0, stats?.timeline?.problems14Days||0, stats?.timeline?.problems30Days||0, stats?.problem||0], backgroundColor: '#f59e0b', borderColor: '#f59e0b', borderWidth: 2 },
    ],
  };

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
    return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  });
  const lineData = {
    labels: last6Months,
    datasets: [{ label: 'Products Added', data: stats?.monthlyData || Array(6).fill(0), borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', tension: 0.4, fill: true }],
  };

  const chartOptions = (title) => ({
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, font: { size: 11 } } }, title: { display: !!title, text: title, font: { size: 12 } } },
    scales: title ? { y: { beginAtZero: true, ticks: { stepSize: 1 } } } : undefined,
  });

  if (error) return (
    <PageWrapper>
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3 text-sm text-red-700 dark:text-red-300">
        <BsExclamationTriangle />{t('errors.loadDataFailed')}
      </div>
    </PageWrapper>
  );

  return (
    <PageWrapper>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BsBarChart size={22} className="text-blue-500" />
          {t('dashboard.title')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{t('dashboard.subtitle')}</p>
      </div>

      {/* Main stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard icon={<BsBox size={22} />} title={t('dashboard.totalProducts')} value={stats?.totalProducts} styleIdx={0} loading={loading} />
        <StatCard icon={<BsCheckCircle size={22} />} title={t('dashboard.delivered')} value={stats?.delivered} styleIdx={1} loading={loading} />
        <StatCard icon={<BsTruck size={22} />} title={t('dashboard.inTransit')} value={stats?.inTransit} styleIdx={2} loading={loading} />
        <StatCard icon={<BsExclamationTriangle size={22} />} title={t('dashboard.issues')} value={stats?.problem} styleIdx={3} loading={loading} />
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        {[
          { icon: <BsBoxSeam size={20} className="text-slate-500" />, label: 'In Stock', val: stats?.inStock },
          { icon: <BsClockHistory size={20} className="text-sky-500" />, label: 'Picked', val: stats?.picked },
          { icon: <BsGraphUp size={20} className="text-emerald-500" />, label: 'Success Rate', val: `${stats?.metrics?.successRate || 0}%` },
          { icon: <BsCalendar size={20} className="text-blue-500" />, label: 'This Month', val: stats?.monthlyData?.[5] || 0 },
        ].map(({ icon, label, val }) => (
          <div key={label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-center shadow-sm">
            <div className="flex justify-center mb-1.5">{icon}</div>
            <p className="text-xs text-slate-500 mb-0.5">{label}</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">{loading ? '—' : val ?? 0}</p>
          </div>
        ))}

        {/* Delivery rate bar — spans 2 cols */}
        <div className="col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Delivery Rate</p>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{stats?.metrics?.deliveryRate || 0}%</span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${stats?.metrics?.deliveryRate || 0}%` }} />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>0%</span><span>100%</span>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <h5 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2"><BsBox size={14} />Status Distribution</h5>
          </div>
          <div className="p-5" style={{ height: '300px' }}>
            <Doughnut data={doughnutData} options={{ ...chartOptions(null), plugins: { legend: { position: 'bottom', labels: { padding: 12, usePointStyle: true, font: { size: 11 } } } } }} />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <h5 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2"><BsGraphUp size={14} />Delivery Timeline</h5>
          </div>
          <div className="p-5" style={{ height: '300px' }}>
            <Bar data={barData} options={chartOptions('Performance Over Time')} />
          </div>
        </div>
      </div>

      {/* Monthly trend + recent products */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-5">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <h5 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2"><BsCalendar size={14} />Monthly Trend</h5>
          </div>
          <div className="p-5" style={{ height: '250px' }}>
            <Line data={lineData} options={chartOptions('Monthly Additions')} />
          </div>
        </div>
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h5 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2"><BsBox size={14} />Recent Products</h5>
            <span className="text-xs font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full">{stats?.recentProducts?.length || 0}</span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-6 w-6 border-4 border-slate-200 dark:border-slate-600 border-t-blue-500" />
            </div>
          ) : !stats?.recentProducts?.length ? (
            <div className="py-10 text-center">
              <BsBox size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm text-slate-400">{t('products.noProducts')}</p>
            </div>
          ) : (
            <div className="overflow-auto" style={{ maxHeight: '250px' }}>
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900/50">
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="px-4 py-2.5 text-start text-xs font-bold uppercase tracking-wide text-slate-500">{t('common.product')}</th>
                    <th className="px-4 py-2.5 text-start text-xs font-bold uppercase tracking-wide text-slate-500">{t('common.price')}</th>
                    <th className="px-4 py-2.5 text-start text-xs font-bold uppercase tracking-wide text-slate-500">{t('common.status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {stats.recentProducts.map(p => (
                    <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-slate-900 dark:text-white">{p.name}</p>
                        <p className="text-xs text-slate-400">{p.buyerName}</p>
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-emerald-600 dark:text-emerald-400">{p.price} TND</td>
                      <td className="px-4 py-2.5"><StatusBadge status={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h5 className="font-semibold text-slate-900 dark:text-white text-sm">{t('dashboard.quickActions')}</h5>
            <p className="text-xs text-slate-400 mt-0.5">{t('dashboard.manageProductsDeliveries')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => navigate('/client/add-product')}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors">
              <BsPlus size={16} />{t('products.addProduct')}
            </button>
            <button onClick={() => navigate('/client/products')}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <BsTruck size={14} />{t('dashboard.trackDelivery')}
            </button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
