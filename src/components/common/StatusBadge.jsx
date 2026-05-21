import React from 'react';

const STATUS_CLASSES = {
  'In Stock':         'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  'Picked':           'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  'Out for Delivery': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  'Delivered':        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  'Problem':          'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  'Failed/Returned':  'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

const STATUS_DOTS = {
  'In Stock':         'bg-slate-400',
  'Picked':           'bg-sky-500',
  'Out for Delivery': 'bg-indigo-500',
  'Delivered':        'bg-emerald-500',
  'Problem':          'bg-amber-500',
  'Failed/Returned':  'bg-red-500',
};

export default function StatusBadge({ status }) {
  const cls = STATUS_CLASSES[status] || STATUS_CLASSES['In Stock'];
  const dot = STATUS_DOTS[status] || STATUS_DOTS['In Stock'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
      {status}
    </span>
  );
}
