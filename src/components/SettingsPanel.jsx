import React from 'react';
import { BsGear, BsPerson, BsGlobe, BsMoon, BsSun, BsShieldCheck } from 'react-icons/bs';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import PageWrapper from './common/PageWrapper';

const ROLE_BADGE = {
  admin:    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  client:   'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  delivery: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
};

const ROLE_GRADIENT = {
  admin:    'from-indigo-500 to-violet-600',
  client:   'from-blue-500 to-cyan-600',
  delivery: 'from-emerald-500 to-teal-600',
};

export default function SettingsPanel() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { currentLanguage, changeLanguage } = useLanguage();

  const roleBadge = ROLE_BADGE[user?.role] || ROLE_BADGE.admin;
  const roleGradient = ROLE_GRADIENT[user?.role] || ROLE_GRADIENT.admin;

  return (
    <PageWrapper>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BsGear size={22} className="text-indigo-500" />
          Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Manage your account preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Account Information */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <BsPerson size={18} className="text-indigo-500" />
            <h6 className="font-semibold text-slate-900 dark:text-white text-sm">Account Information</h6>
          </div>

          <div className="flex items-center gap-4 mb-5">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${roleGradient} flex items-center justify-center text-white text-xl font-bold flex-shrink-0`}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">{user?.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">Role</span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${roleBadge}`}>
                <BsShieldCheck size={11} />
                {user?.role}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400">Email</span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            {theme === 'dark' ? <BsMoon size={18} className="text-indigo-400" /> : <BsSun size={18} className="text-amber-500" />}
            <h6 className="font-semibold text-slate-900 dark:text-white text-sm">Appearance</h6>
          </div>

          {/* Theme toggle */}
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">Color Theme</p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => theme !== 'light' && toggleTheme()}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${
                  theme === 'light'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500'
                }`}
              >
                <BsSun size={16} className="text-amber-500" />
                Light
              </button>
              <button
                onClick={() => theme !== 'dark' && toggleTheme()}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 transition-all duration-200 text-sm font-medium ${
                  theme === 'dark'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500'
                }`}
              >
                <BsMoon size={16} className="text-indigo-400" />
                Dark
              </button>

              {/* Toggle switch */}
              <div className="flex items-center gap-2 ms-auto">
                <BsSun size={13} className="text-amber-500" />
                <button
                  onClick={toggleTheme}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                    theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-300 ${
                      theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <BsMoon size={13} className="text-indigo-400" />
              </div>
            </div>
          </div>

          {/* Language */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3 flex items-center gap-1.5">
              <BsGlobe size={12} />
              Language
            </p>
            <select
              value={currentLanguage}
              onChange={(e) => changeLanguage(e.target.value)}
              className="w-full max-w-xs px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            >
              <option value="en">🇬🇧 English</option>
              <option value="fr">🇫🇷 Français</option>
              <option value="ar">🇹🇳 العربية</option>
            </select>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
