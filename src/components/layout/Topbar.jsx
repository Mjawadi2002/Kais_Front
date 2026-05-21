import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BsList, BsSun, BsMoon, BsPersonCircle, BsGear,
  BsBoxArrowRight, BsChevronDown,
} from 'react-icons/bs';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import LanguageSwitcher from '../LanguageSwitcher';
import logo from '../../assets/images/routeflow-logo-dark.svg';

const PAGE_TITLES = {
  '/admin':            'Dashboard',
  '/admin/products':   'Manage Products',
  '/admin/deliveries': 'Manage Deliveries',
  '/client':           'Analytics Dashboard',
  '/client/products':  'My Products',
  '/client/add-product': 'Add Product',
  '/delivery':         'Dashboard',
  '/delivery/assigned':'Assigned Deliveries',
  '/settings':         'Settings',
};

export default function Topbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const pageTitle = PAGE_TITLES[location.pathname] || '';

  const doLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="h-14 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center px-4 gap-3 sticky top-0 z-30 flex-shrink-0">
      {/* Mobile menu button */}
      <button
        className="md:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
      >
        <BsList size={20} />
      </button>

      {/* Logo + page title */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <img src={logo} alt="RouteFlow" className="h-7 w-auto hidden md:block" />
        {pageTitle && (
          <div className="hidden md:flex items-center gap-2 text-slate-400 dark:text-slate-500">
            <span className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{pageTitle}</span>
          </div>
        )}
        {/* Mobile: logo only */}
        <img src={logo} alt="RouteFlow" className="h-6 w-auto md:hidden" />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Language switcher */}
        <LanguageSwitcher />

        {/* Dark/light toggle */}
        <div className="flex items-center gap-1.5">
          <BsSun size={14} className="text-amber-500 flex-shrink-0" />
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-slate-800 ${
              theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-200'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transform transition-transform duration-300 ${
                theme === 'dark' ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </button>
          <BsMoon size={13} className="text-indigo-400 flex-shrink-0" />
        </div>

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            onClick={() => setDropdownOpen(v => !v)}
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="hidden sm:block max-w-[100px] truncate">{user?.name}</span>
            <BsChevronDown
              size={12}
              className={`text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute end-0 top-full mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-slide-up">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700 mb-1">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
              </div>

              <Link
                to="/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors no-underline"
              >
                <BsGear size={14} className="text-slate-400" />
                Settings
              </Link>

              <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

              <button
                onClick={doLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <BsBoxArrowRight size={14} />
                {t('common.logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
