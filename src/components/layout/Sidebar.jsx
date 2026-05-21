import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BsSpeedometer2, BsBox, BsTruck, BsBarChart, BsPlusCircle,
  BsPeopleFill, BsX, BsGear, BsBoxSeam,
} from 'react-icons/bs';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/images/routeflow-logo-light.svg';

const ROLE_ACCENT = {
  admin:    { active: 'bg-gradient-to-r from-indigo-500 to-violet-600', icon: 'bg-indigo-500/20', badge: 'bg-indigo-500/20 text-indigo-300', dot: 'bg-indigo-400' },
  client:   { active: 'bg-gradient-to-r from-blue-500 to-cyan-600',    icon: 'bg-blue-500/20',   badge: 'bg-blue-500/20 text-blue-300',    dot: 'bg-blue-400' },
  delivery: { active: 'bg-gradient-to-r from-emerald-500 to-teal-600', icon: 'bg-emerald-500/20',badge: 'bg-emerald-500/20 text-emerald-300',dot: 'bg-emerald-400' },
};

const ADMIN_NAV = [
  { to: '/admin', label: 'navigation.dashboard',      icon: <BsSpeedometer2 size={16} />, end: true },
  { to: '/admin/products',   label: 'navigation.manageProducts', icon: <BsBox size={16} /> },
  { to: '/admin/deliveries', label: 'navigation.deliveries',     icon: <BsTruck size={16} /> },
];
const CLIENT_NAV = [
  { to: '/client', label: 'navigation.analytics',   icon: <BsBarChart size={16} />, end: true },
  { to: '/client/products',    label: 'navigation.products',    icon: <BsBoxSeam size={16} /> },
  { to: '/client/add-product', label: 'navigation.addProduct',  icon: <BsPlusCircle size={16} /> },
];
const DELIVERY_NAV = [
  { to: '/delivery', label: 'navigation.dashboard',          icon: <BsTruck size={16} />, end: true },
  { to: '/delivery/assigned', label: 'navigation.assignedDeliveries', icon: <BsBox size={16} /> },
];

const BOTTOM_NAV = [
  { to: '/settings', label: 'Settings', icon: <BsGear size={16} /> },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const { t } = useTranslation();

  if (!user) return null;

  const role = user.role;
  const accent = ROLE_ACCENT[role] || ROLE_ACCENT.admin;

  const navItems = role === 'admin' ? ADMIN_NAV : role === 'client' ? CLIENT_NAV : DELIVERY_NAV;

  const handleNavClick = () => {
    if (window.innerWidth < 768) onClose();
  };

  const navItemClass = (isActive) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border cursor-pointer no-underline group ${
      isActive
        ? `${accent.active} text-white shadow-lg shadow-black/20 border-transparent`
        : 'text-slate-400 hover:text-white hover:bg-slate-800 border-transparent hover:border-white/5'
    }`;

  const iconClass = (isActive) =>
    `flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0 transition-colors duration-200 ${
      isActive ? 'bg-white/20' : `${accent.icon} group-hover:bg-white/10`
    }`;

  return (
    <aside
      className={`
        w-64 bg-slate-900 h-screen flex flex-col border-r border-slate-700/50
        fixed md:relative z-50
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full md:translate-x-0 rtl:md:translate-x-0'}
      `}
    >
      {/* Header */}
      <div className="px-5 py-5 border-b border-slate-700/50 flex-shrink-0">
        <div className="flex items-start justify-between mb-4">
          <img src={logo} alt="RouteFlow" className="h-8 w-auto" />
          <button
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <BsX size={20} />
          </button>
        </div>

        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold ${accent.active}`}
            >
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${accent.dot}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold mt-0.5 capitalize ${accent.badge}`}>
              {user.role}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        <p className="px-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-600">
          Navigation
        </p>

        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={handleNavClick}
            className={({ isActive }) => navItemClass(isActive)}
          >
            {({ isActive }) => (
              <>
                <span className={iconClass(isActive)}>{item.icon}</span>
                <span className="flex-1 truncate">{t(item.label)}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="px-3 py-3 border-t border-slate-700/50 space-y-1 flex-shrink-0">
        {BOTTOM_NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={handleNavClick}
            className={({ isActive }) => navItemClass(isActive)}
          >
            {({ isActive }) => (
              <>
                <span className={iconClass(isActive)}>{item.icon}</span>
                <span className="flex-1 truncate">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
