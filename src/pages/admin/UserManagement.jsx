import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { BsPencil, BsTrash, BsPlus, BsSearch, BsX } from 'react-icons/bs';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const inputClass = 'w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors placeholder-slate-400';
const labelClass = 'block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5';

const ROLE_BADGE = {
  admin:    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  client:   'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  delivery: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
};

function FormField({ label, children }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

function Modal({ show, onClose, title, children }) {
  useEffect(() => {
    document.body.style.overflow = show ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [show]);

  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h5 className="font-semibold text-slate-900 dark:text-white text-sm">{title}</h5>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <BsX size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function UserManagement() {
  const { user: authUser } = useAuth();
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client' });
  const [query, setQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const getToken = () => localStorage.getItem('rf_access_token') || authUser?.token;
  const headers = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

  const load = useCallback(async () => {
    try {
      const roleParam = filterRole === 'all' ? '' : `?role=${filterRole}`;
      const resp = await axios.get(`${API_BASE}/api/v1/users${roleParam}`, headers());
      setUsers(resp.data.users || []);
    } catch {
      toast.error(t('admin.failedToLoadUsers'));
    }
  }, [authUser, filterRole, t]);

  useEffect(() => { if (authUser) load(); }, [authUser, filterRole]);

  const openCreate = () => { setForm({ name: '', email: '', password: '', role: 'client' }); setShowCreate(true); };

  const submitCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/api/v1/users`, form, headers());
      toast.success(t('admin.userCreated'));
      setShowCreate(false);
      load();
    } catch { toast.error(t('admin.createFailed')); }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_BASE}/api/v1/users/${editUser._id}`, { name: editUser.name, email: editUser.email, role: editUser.role }, headers());
      toast.success(t('admin.userUpdated'));
      setShowEdit(false);
      setEditUser(null);
      load();
    } catch { toast.error(t('admin.updateFailed')); }
  };

  const remove = async (id) => {
    const u = users.find(x => x._id === id);
    let msg = t('admin.deleteUser');
    if (u?.role === 'client') msg += '\n\n⚠️ ' + t('admin.deleteClientWarning');
    else if (u?.role === 'delivery') msg += '\n\n⚠️ ' + t('admin.deleteDeliveryWarning');
    if (!window.confirm(msg)) return;
    try {
      const resp = await axios.delete(`${API_BASE}/api/v1/users/${id}`, headers());
      toast.success(resp.data.cascadeInfo ? `${t('admin.cascadeCompleted')}: ${resp.data.cascadeInfo}` : t('admin.userDeleted'), { autoClose: 5000 });
      load();
    } catch { toast.error(t('admin.deleteFailed')); }
  };

  const filtered = users.filter(u => {
    if (!query) return true;
    const q = query.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-700">
        <div className="relative flex-1 min-w-[200px]">
          <BsSearch size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t('admin.searchNameOrEmail')}
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full ps-9 pe-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors placeholder-slate-400"
          />
        </div>
        <select
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
        >
          <option value="all">{t('admin.allRoles')}</option>
          <option value="client">{t('admin.clients')}</option>
          <option value="delivery">{t('admin.deliveryPersons')}</option>
          <option value="admin">{t('admin.admins')}</option>
        </select>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <BsPlus size={18} />
          {t('admin.create')}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <th className="px-4 py-3 text-start text-xs font-bold uppercase tracking-wide text-slate-500">{t('common.name')}</th>
              <th className="px-4 py-3 text-start text-xs font-bold uppercase tracking-wide text-slate-500">{t('common.email')}</th>
              <th className="px-4 py-3 text-start text-xs font-bold uppercase tracking-wide text-slate-500">{t('admin.role')}</th>
              <th className="px-4 py-3 text-start text-xs font-bold uppercase tracking-wide text-slate-500">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-400">{t('admin.noUsersFound')}</td>
              </tr>
            )}
            {filtered.map(u => (
              <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{u.name}</td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${ROLE_BADGE[u.role] || ROLE_BADGE.client}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setEditUser(u); setShowEdit(true); }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                      title={t('common.edit')}
                    >
                      <BsPencil size={14} />
                    </button>
                    <button
                      onClick={() => remove(u._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                      title={t('common.delete')}
                    >
                      <BsTrash size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      <Modal show={showCreate} onClose={() => setShowCreate(false)} title={t('admin.createUser')}>
        <form onSubmit={submitCreate} className="p-6 space-y-4">
          <FormField label={t('common.name')}>
            <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputClass} />
          </FormField>
          <FormField label={t('common.email')}>
            <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputClass} />
          </FormField>
          <FormField label={t('common.password')}>
            <input type="password" required minLength={6} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className={inputClass} />
          </FormField>
          <FormField label={t('admin.role')}>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className={inputClass}>
              <option value="client">{t('common.client')}</option>
              <option value="delivery">{t('admin.deliveryPerson')}</option>
              <option value="admin">{t('admin.admins')}</option>
            </select>
          </FormField>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-2.5 px-4 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium">
              {t('common.cancel')}
            </button>
            <button type="submit" className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors text-sm font-medium">
              {t('common.create')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEdit} onClose={() => { setShowEdit(false); setEditUser(null); }} title={t('admin.editUser')}>
        {editUser && (
          <form onSubmit={submitEdit} className="p-6 space-y-4">
            <FormField label={t('common.name')}>
              <input type="text" value={editUser.name} onChange={e => setEditUser(u => ({ ...u, name: e.target.value }))} className={inputClass} />
            </FormField>
            <FormField label={t('common.email')}>
              <input type="email" value={editUser.email} onChange={e => setEditUser(u => ({ ...u, email: e.target.value }))} className={inputClass} />
            </FormField>
            <FormField label={t('admin.role')}>
              <select value={editUser.role} onChange={e => setEditUser(u => ({ ...u, role: e.target.value }))} className={inputClass}>
                <option value="client">{t('common.client')}</option>
                <option value="delivery">{t('admin.deliveryPerson')}</option>
                <option value="admin">{t('admin.admins')}</option>
              </select>
            </FormField>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowEdit(false)} className="flex-1 py-2.5 px-4 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium">
                {t('common.cancel')}
              </button>
              <button type="submit" className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors text-sm font-medium">
                {t('common.save')}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
