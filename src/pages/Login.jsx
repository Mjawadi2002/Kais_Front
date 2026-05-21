import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import apiClient from '../config/apiClient';
import {
  BsBoxArrowInRight, BsPersonFill, BsEye, BsEyeSlash,
  BsLock, BsCheckCircleFill, BsTruck, BsBarChartFill, BsPeopleFill,
  BsShieldLock,
} from 'react-icons/bs';
import logoLight from '../assets/images/routeflow-logo-light.svg';

const FEATURES = [
  { icon: <BsTruck size={16} />, text: 'Real-time delivery tracking across all routes' },
  { icon: <BsPeopleFill size={16} />, text: 'Multi-role management — admin, client & driver' },
  { icon: <BsBarChartFill size={16} />, text: 'Analytics & performance insights at a glance' },
];

const inputClass = `w-full px-4 py-3 border border-slate-200 rounded-r-xl bg-white text-slate-900 text-sm
  focus:outline-none focus:border-indigo-500 transition-colors placeholder-slate-400`;

export default function Login() {
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, user, isLoading } = useAuth();

  React.useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'admin')    navigate('/admin');
      else if (user.role === 'client')   navigate('/client');
      else if (user.role === 'delivery') navigate('/delivery');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-600 to-violet-700 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-white/30 border-t-white" />
        <p className="text-white/80 text-sm">Checking authentication…</p>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await apiClient.post('/api/v1/auth/login', { email, password });
      const { user: u, accessToken, refreshToken, expiresIn } = resp.data;
      login(u, accessToken, refreshToken, expiresIn);
      toast.success(`Welcome ${u.name}!`);
      if (u.role === 'admin')    navigate('/admin');
      else if (u.role === 'client')   navigate('/client');
      else if (u.role === 'delivery') navigate('/delivery');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">

      {/* Left branding panel */}
      <div className="hidden lg:flex w-[44%] bg-slate-900 flex-col justify-between px-14 py-12 relative overflow-hidden">
        {/* Decorative orbs */}
        <div className="absolute -top-40 -right-32 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-24 w-80 h-80 rounded-full bg-violet-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <img src={logoLight} alt="RouteFlow" className="h-10 w-auto mb-10" />

          <p className="text-lg font-medium text-white/85 leading-relaxed mb-8 max-w-sm">
            The delivery management platform built for speed, clarity, and scale.
          </p>

          <ul className="space-y-4 mb-10">
            {FEATURES.map((f, i) => (
              <li key={i} className="flex items-center gap-3.5 text-white/75 text-sm">
                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                  {f.icon}
                </span>
                {f.text}
              </li>
            ))}
          </ul>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs">
            <BsCheckCircleFill size={12} className="text-emerald-400" />
            Trusted by delivery teams worldwide
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/30">© 2025 RouteFlow. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-md animate-slide-up">

          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <BsTruck size={24} className="text-white" />
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Welcome back</h1>
            <p className="text-slate-500 mt-1.5 text-sm">Sign in to your RouteFlow account</p>
          </div>

          <form onSubmit={submit} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email address</label>
              <div className="flex rounded-xl overflow-hidden border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all shadow-sm">
                <div className="flex items-center px-3.5 bg-white border-e border-slate-200 text-slate-400 focus-within:text-indigo-500 transition-colors">
                  <BsPersonFill size={15} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@company.com"
                  autoComplete="email"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="flex rounded-xl overflow-hidden border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all shadow-sm">
                <div className="flex items-center px-3.5 bg-white border-e border-slate-200 text-slate-400">
                  <BsLock size={15} />
                </div>
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`${inputClass} rounded-r-none flex-1`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(s => !s)}
                  tabIndex={-1}
                  aria-label="Toggle password"
                  className="flex items-center px-3.5 bg-white border-s border-slate-200 text-slate-400 hover:text-indigo-500 transition-colors"
                >
                  {showPwd ? <BsEye size={16} /> : <BsEyeSlash size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold rounded-xl hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/30 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none text-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                  Signing in…
                </>
              ) : (
                <>
                  <BsBoxArrowInRight size={18} />
                  Sign in to RouteFlow
                </>
              )}
            </button>
          </form>

          <div className="flex items-center justify-center gap-1.5 mt-6 text-xs text-slate-400">
            <BsShieldLock size={12} />
            Secure login · All data encrypted in transit
          </div>
        </div>
      </div>
    </div>
  );
}
