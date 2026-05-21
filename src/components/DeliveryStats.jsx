import React, { useState, useEffect } from 'react';
import { BsTruck, BsClock, BsCheckCircle, BsXCircle, BsExclamationTriangle, BsPerson, BsGraphUp } from 'react-icons/bs';
import apiClient from '../config/apiClient';

const STAT_STYLES = [
  { iconBg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' },
  { iconBg: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' },
  { iconBg: 'bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400' },
  { iconBg: 'bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400' },
  { iconBg: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' },
  { iconBg: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400' },
];

function StatCard({ title, value, icon: Icon, styleIdx = 0, loading }) {
  const { iconBg } = STAT_STYLES[styleIdx % STAT_STYLES.length];
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
      <div className="flex items-center gap-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-0.5">{title}</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">
            {loading ? <span className="inline-block w-8 h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /> : (value ?? 0)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DeliveryStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient.get('/api/v1/deliveries/stats')
      .then(r => setStats(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (error) return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3 text-sm text-red-700 dark:text-red-300">
      <BsExclamationTriangle />Failed to load delivery statistics
    </div>
  );

  const CARDS = [
    { title: 'Total Deliveries', value: stats?.totalDeliveries, icon: BsTruck },
    { title: 'Pending', value: stats?.pendingDeliveries, icon: BsClock },
    { title: 'In Transit', value: stats?.inTransitDeliveries, icon: BsTruck },
    { title: 'Delivered', value: stats?.deliveredDeliveries, icon: BsCheckCircle },
    { title: 'Cancelled', value: stats?.cancelledDeliveries, icon: BsXCircle },
    { title: 'Failed', value: stats?.failedDeliveries, icon: BsExclamationTriangle },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {CARDS.map((c, i) => <StatCard key={c.title} {...c} styleIdx={i} loading={loading} />)}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: BsPerson, label: 'Delivery Persons', val: stats?.deliveryPersonCount },
          { icon: BsPerson, label: 'Active Now', val: stats?.activeDeliveryPersons },
          { icon: BsGraphUp, label: 'Avg Fee', val: stats?.averageDeliveryFee ? `${stats.averageDeliveryFee} TND` : null },
        ].map(({ icon: Icon, label, val }) => (
          <div key={label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
              <Icon size={16} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white">{loading ? '—' : val ?? 0}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
