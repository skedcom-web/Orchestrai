import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sun, Moon, Sparkles, LogOut, Shield, Award, BookOpen, LogIn } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export const Header: React.FC = () => {
  const { theme, setTheme, currentUser, login, logout, seedAdminAccount } = useApp();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginName, setLoginName] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) return;
    login(loginEmail, loginName);
    setShowLoginModal(false);
    setLoginEmail('');
    setLoginName('');
    navigate('/modules');
  };

  const triggerSeedAdmin = () => {
    seedAdminAccount();
    login('skedcom@gmail.com', 'Sithanandham Radhakrishnan');
    setShowLoginModal(false);
    navigate('/admin');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-color)] bg-[var(--header-bg)] backdrop-blur-[20px] saturate-150 transition-all duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo Section */}
        <Link to="/" className="flex items-center space-x-3 group">
          {/* Icon badge */}
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          {/* Brand name */}
          <div className="flex flex-col leading-none">
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              OrchestrAI
            </span>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)] mt-0.5">
              Lead Academy
            </span>
          </div>
        </Link>

        {/* Navigation Section */}
        <nav className="hidden md:flex items-center space-x-1">
          <Link
            to="/modules"
            className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/modules')
                ? 'bg-indigo-500/10 text-indigo-500'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-500/5'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Modules</span>
          </Link>

          {currentUser && (
            <Link
              to="/certification"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/certification')
                  ? 'bg-indigo-500/10 text-indigo-500'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-500/5'
              }`}
            >
              <Award className="h-4 w-4" />
              <span>Certification</span>
            </Link>
          )}

          {currentUser?.role === 'ADMIN' && (
            <Link
              to="/admin"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/admin')
                  ? 'bg-purple-500/10 text-purple-500'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-500/5'
              }`}
            >
              <Shield className="h-4 w-4" />
              <span>Admin Console</span>
            </Link>
          )}
        </nav>

        {/* Right Actions Toolbar */}
        <div className="flex items-center space-x-4">
          
          {/* Theme Toggle Pill Bar (Premium Sliding Indicator UI Style) */}
          <div className="flex items-center border border-[var(--border-color)] p-0.5 rounded-full bg-slate-500/5 backdrop-blur">
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
                theme === 'light'
                  ? 'bg-white text-indigo-600 shadow'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title="Light Mode"
            >
              <Sun className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Light</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title="Dark Mode"
            >
              <Moon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Dark</span>
            </button>
            <button
              onClick={() => setTheme('glass')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
                theme === 'glass'
                  ? 'glass-active-pill shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title="Frosted Glass Mode"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Glass</span>
            </button>
          </div>

          {/* Authentication Accessor Button */}
          {currentUser ? (
            <div className="flex items-center space-x-2">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-semibold text-[var(--text-primary)] max-w-[140px] truncate">{currentUser.name}</span>
                <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">{currentUser.role}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-1 px-3 py-1.5 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:bg-red-500/10 rounded-md text-xs font-medium transition-all"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="flex items-center space-x-1 px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-650 hover:to-purple-750 text-white rounded-md text-xs font-semibold shadow transition-all hover:scale-102"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Login</span>
            </button>
          )}

        </div>
      </div>

      {/* Responsive Navigation Menu for Mobile Devices */}
      <div className="flex md:hidden items-center justify-around border-t border-[var(--border-color)] py-2 bg-slate-500/5">
        <Link to="/modules" className={`text-xs font-semibold ${isActive('/modules') ? 'text-indigo-500' : 'text-[var(--text-secondary)]'}`}>
          Modules
        </Link>
        {currentUser && (
          <Link to="/certification" className={`text-xs font-semibold ${isActive('/certification') ? 'text-indigo-500' : 'text-[var(--text-secondary)]'}`}>
            Certification
          </Link>
        )}
        {currentUser?.role === 'ADMIN' && (
          <Link to="/admin" className={`text-xs font-semibold ${isActive('/admin') ? 'text-purple-500' : 'text-[var(--text-secondary)]'}`}>
            Admin Settings
          </Link>
        )}
      </div>

      {/* Candidate Registration / Sign In Dialog */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-md rounded-xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4 mb-6">
              <h3 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                Candidate Access Portal
              </h3>
              <button 
                onClick={() => setShowLoginModal(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Jane Doe"
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-[var(--border-color)] bg-transparent text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="candidate@gmail.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-[var(--border-color)] bg-transparent text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <p className="text-[10px] text-[var(--text-secondary)] mt-1.5 leading-relaxed">
                  * Logging in with <code className="text-[var(--text-primary)]">skedcom@gmail.com</code> will seed and grant you Admin capabilities automatically.
                </p>
              </div>

              <div className="pt-2 flex flex-col space-y-2.5">
                <button
                  type="submit"
                  className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-650 hover:to-purple-750 text-white rounded-md text-sm font-semibold shadow transition-all"
                >
                  Enter Portal
                </button>
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-[var(--border-color)]"></div>
                  <span className="flex-shrink mx-4 text-[10px] text-[var(--text-secondary)] uppercase font-semibold">Testing shortcuts</span>
                  <div className="flex-grow border-t border-[var(--border-color)]"></div>
                </div>
                <button
                  type="button"
                  onClick={triggerSeedAdmin}
                  className="w-full py-2 border border-purple-500/30 hover:bg-purple-500/10 text-purple-400 rounded-md text-xs font-semibold transition-all"
                >
                  Quick Launch Admin Console (Sithanandham)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
