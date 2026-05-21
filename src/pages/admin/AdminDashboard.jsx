import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import UserManagement from './UserManagement';
import { BsBoxSeam, BsClockHistory, BsPeople, BsTruck, BsSpeedometer2 } from 'react-icons/bs';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import PageWrapper from '../../components/common/PageWrapper';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const STAT_STYLES = [
  { iconBg: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' },
  { iconBg: 'bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400' },
  { iconBg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' },
  { iconBg: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' },
];

function StatCard({ icon, title, value, styleIdx = 0 }) {
  const { iconBg } = STAT_STYLES[styleIdx] || STAT_STYLES[0];
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-0.5">{title}</p>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none">
            {value ?? <span className="inline-block w-8 h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />}
          </p>
        </div>
      </div>
    </div>
  );
}

const BREAKDOWN = [
  { key: 'picked',        labelKey: 'admin.picked',        color: 'text-sky-600 dark:text-sky-400',     bg: 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-700' },
  { key: 'outForDelivery',labelKey: 'admin.outForDelivery', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700' },
  { key: 'delivered',     labelKey: 'admin.delivered',      color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700' },
  { key: 'problem',       labelKey: 'admin.problems',       color: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700' },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('rf_access_token') || user.token;
    axios.get(`${API_BASE}/api/v1/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => setStats(r.data)).catch(err => console.error('load stats', err));
  }, [user]);

  return (
    <PageWrapper>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BsSpeedometer2 size={22} className="text-indigo-500" />
          {t('admin.title')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{t('admin.overview')}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={<BsBoxSeam size={22} />}      title={t('admin.totalProducts')}   value={stats?.totalProducts}   styleIdx={0} />
        <StatCard icon={<BsClockHistory size={22} />}  title={t('admin.totalDeliveries')} value={stats?.totalDeliveries} styleIdx={1} />
        <StatCard icon={<BsPeople size={22} />}        title={t('admin.totalClients')}    value={stats?.totalClients}    styleIdx={2} />
        <StatCard icon={<BsTruck size={22} />}         title={t('admin.deliveryPersons')} value={stats?.deliveryPersons} styleIdx={3} />
      </div>

      {/* Status breakdown */}
      {stats?.breakdown && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <h5 className="font-semibold text-slate-900 dark:text-white text-sm">{t('admin.productStatusBreakdown')}</h5>
          </div>
          <div className="p-5 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {BREAKDOWN.map(item => (
              <div key={item.key} className={`rounded-xl border p-4 text-center ${item.bg}`}>
                <p className={`text-2xl font-extrabold ${item.color}`}>{stats.breakdown[item.key] ?? 0}</p>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{t(item.labelKey)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User management */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h5 className="font-semibold text-slate-900 dark:text-white text-sm">{t('admin.users')}</h5>
        </div>
        <UserManagement />
      </div>
    </PageWrapper>
  );
}
