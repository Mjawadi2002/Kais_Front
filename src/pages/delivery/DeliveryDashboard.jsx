import React, { useState, useEffect, useCallback } from 'react';
import { BsTruck, BsBoxSeam, BsCheckCircle, BsExclamationTriangle, BsClockHistory, BsArrowRight } from 'react-icons/bs';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import StatusBadge from '../../components/common/StatusBadge';
import PageWrapper from '../../components/common/PageWrapper';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const STAT_STYLES = [
  { iconBg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' },
  { iconBg: 'bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400' },
  { iconBg: 'bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400' },
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

export default function DeliveryDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('rf_access_token') || user?.token;
      const res = await axios.get(`${API_BASE}/api/v1/products`, { headers: { Authorization: `Bearer ${token}` } });
      const all = res.data.products || [];
      const mine = all.filter(p => p.assignedTo?._id === user.id || p.assignedTo === user.id);

      const delivered = mine.filter(p => p.status === 'Delivered').length;
      const outForDelivery = mine.filter(p => p.status === 'Out for Delivery').length;
      const picked = mine.filter(p => p.status === 'Picked').length;
      const problems = mine.filter(p => p.status === 'Problem').length;
      const total = mine.length;

      setStats({
        total, delivered, outForDelivery, picked, problems,
        completionRate: total > 0 ? ((delivered / total) * 100).toFixed(1) : 0,
        problemRate: total > 0 ? ((problems / total) * 100).toFixed(1) : 0,
      });

      setRecentActivities(
        mine.filter(p => p.updatedAt)
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, 6)
      );
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  return (
    <PageWrapper>
      {/* Hero banner */}
      <div className="relative mb-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6 overflow-hidden shadow-lg">
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -left-4 w-24 h-24 rounded-full bg-white/10" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2"><BsTruck size={22} />Delivery Dashboard</h1>
            <p className="text-emerald-100 mt-1 text-sm">Welcome back, {user?.name}. Here's your performance overview.</p>
          </div>
          <button onClick={() => navigate('/delivery/assigned')}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-xl border border-white/30 transition-colors">
            My Deliveries <BsArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <StatCard icon={<BsBoxSeam size={22} />} title="Total Assigned" value={stats?.total} styleIdx={0} loading={loading} />
        <StatCard icon={<BsTruck size={22} />} title="Out for Delivery" value={stats?.outForDelivery} styleIdx={1} loading={loading} />
        <StatCard icon={<BsCheckCircle size={22} />} title="Delivered" value={stats?.delivered} styleIdx={2} loading={loading} />
        <StatCard icon={<BsExclamationTriangle size={22} />} title="Problems" value={stats?.problems} styleIdx={3} loading={loading} />
      </div>

      {/* Performance + recent */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Performance card */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
            <h5 className="font-semibold text-slate-900 dark:text-white text-sm">Performance Overview</h5>
          </div>
          <div className="p-5 space-y-4">
            {[
              { label: 'Completion Rate', value: `${stats?.completionRate || 0}%`, color: 'text-emerald-600 dark:text-emerald-400', bar: stats?.completionRate, barColor: 'bg-emerald-500' },
              { label: 'Problem Rate', value: `${stats?.problemRate || 0}%`, color: 'text-amber-600 dark:text-amber-400', bar: stats?.problemRate, barColor: 'bg-amber-500' },
            ].map(({ label, value, color, bar, barColor }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
                  <span className={`text-sm font-bold ${color}`}>{loading ? '—' : value}</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full ${barColor} rounded-full transition-all duration-700`} style={{ width: `${bar || 0}%` }} />
                </div>
              </div>
            ))}
            <div className="pt-2 grid grid-cols-2 gap-3">
              {[
                { label: 'Picked', value: stats?.picked, color: 'text-sky-600 dark:text-sky-400' },
                { label: 'Active', value: stats?.outForDelivery, color: 'text-emerald-600 dark:text-emerald-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-center">
                  <p className={`text-2xl font-extrabold ${color}`}>{loading ? '—' : value ?? 0}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent activities */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h5 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <BsClockHistory size={14} className="text-emerald-500" />Recent Activities
            </h5>
            <button onClick={() => navigate('/delivery/assigned')} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium">View all</button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 dark:border-slate-600 border-t-emerald-500" />
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="py-12 text-center">
              <BsBoxSeam size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm text-slate-400">No recent activities</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {recentActivities.map(p => (
                <div key={p._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                    <BsTruck size={14} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white text-sm truncate">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.buyerName} · {new Date(p.updatedAt).toLocaleTimeString()}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
