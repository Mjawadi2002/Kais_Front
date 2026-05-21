import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const inputClass = `w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl
  bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm
  focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
  transition-all placeholder-slate-400 dark:placeholder-slate-500`;

const labelClass = 'block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5';

export default function ProductForm({ onCreated }) {
  const [form, setForm] = useState({ name: '', price: '', buyerName: '', buyerAddress: '', buyerPhone: '' });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { t } = useTranslation();

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('rf_access_token') || user?.token;
      const resp = await axios.post(`${API_BASE}/api/v1/products`, {
        name: form.name,
        price: Number(form.price),
        buyerName: form.buyerName,
        buyerAddress: form.buyerAddress,
        buyerPhone: form.buyerPhone,
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(t('products.productCreated'));
      setForm({ name: '', price: '', buyerName: '', buyerAddress: '', buyerPhone: '' });
      if (onCreated) onCreated(resp.data.product);
    } catch (err) {
      toast.error(err?.response?.data?.message || t('products.createProductFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label className={labelClass}>{t('products.productName')}</label>
        <input
          type="text"
          value={form.name}
          onChange={set('name')}
          required
          placeholder={`${t('common.name')}...`}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>{t('common.price')}</label>
        <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.price}
            onChange={set('price')}
            required
            placeholder="0.00"
            className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none placeholder-slate-400 dark:placeholder-slate-500"
          />
          <span className="px-4 flex items-center bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-sm font-medium border-s border-slate-200 dark:border-slate-600">
            {t('common.currency')}
          </span>
        </div>
      </div>

      <div>
        <label className={labelClass}>{t('products.buyerName')}</label>
        <input
          type="text"
          value={form.buyerName}
          onChange={set('buyerName')}
          placeholder={`${t('products.buyerName')}...`}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>{t('products.buyerAddress')}</label>
        <textarea
          rows={3}
          value={form.buyerAddress}
          onChange={set('buyerAddress')}
          required
          placeholder={`${t('products.buyerAddress')}...`}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div>
        <label className={labelClass}>{t('products.buyerPhone')}</label>
        <input
          type="tel"
          value={form.buyerPhone}
          onChange={set('buyerPhone')}
          required
          placeholder="+216 XX XXX XXX"
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-6 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none text-sm"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
            {t('products.creating')}
          </span>
        ) : t('products.createProduct')}
      </button>
    </form>
  );
}
