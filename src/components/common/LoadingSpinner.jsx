import React from 'react';

const SIZE_MAP = { sm: 24, md: 40, lg: 64 };

export default function LoadingSpinner({ size = 'md', text = '' }) {
  const dim = SIZE_MAP[size] || SIZE_MAP.md;
  return (
    <div className="flex flex-col items-center justify-center p-6 gap-3">
      <div
        className="animate-spin rounded-full border-4 border-slate-200 dark:border-slate-600 border-t-indigo-500"
        style={{ width: dim, height: dim }}
        role="status"
        aria-label="Loading"
      />
      {text && <p className="text-sm text-slate-500 dark:text-slate-400">{text}</p>}
    </div>
  );
}
