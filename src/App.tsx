import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { TimelineRoadmap } from './components/TimelineRoadmap';
import { GlowBackground } from './components/GlowBackground';
import { Landing } from './pages/Landing';
import { Modules } from './pages/Modules';
import { Quiz } from './pages/Quiz';
import { Payment } from './pages/Payment';
import { Admin } from './pages/Admin';
import { Certification } from './pages/Certification';
import { Sparkles, BookOpen, Shield, Award } from 'lucide-react';
import './App.css';

const AppContent: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname === '/admin';

  // Roadmap is shown on non-admin pages, only when a user is logged in
  // (on the landing page it shows for everyone to understand the journey)
  const showRoadmap = !isAdminRoute;

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Premium Glow Background Blobs */}
      <GlowBackground />

      {/* Navigation Top Header */}
      <Header />

      {/* Candidate Progress Roadmap */}
      {showRoadmap && <TimelineRoadmap />}

      {/* Pages Viewport */}
      <main className="flex-grow z-10">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/modules" element={<Modules />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/certification" element={<Certification />} />
        </Routes>
      </main>

      {/* Website-Style Footer */}
      <footer className="w-full border-t border-[var(--border-color)] bg-[var(--bg-card)]/40 backdrop-blur-sm py-10 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            
            {/* Brand column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-base font-extrabold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                  OrchestrAI
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-[220px]">
                AI-powered <strong className="text-[var(--text-primary)]">OrchestrAI Lead</strong> Certification that gets you hired by top IT companies.
              </p>
              <p className="text-xs text-[var(--text-secondary)] font-medium">A <strong>vThink Global Technologies</strong> initiative.</p>
            </div>

            {/* Quick links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Quick Links</h4>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Free Modules (1 & 2)', path: '/modules', icon: BookOpen },
                  { label: 'Admin Console', path: '/admin', icon: Shield },
                  { label: 'My Certification', path: '/certification', icon: Award },
                ].map(({ label, path, icon: Icon }) => (
                  <a key={path} href={path} className="flex items-center gap-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                    <Icon className="h-3.5 w-3.5" /> {label}
                  </a>
                ))}
              </div>
            </div>

            {/* Founder */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)]">Founder</h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                <strong className="text-[var(--text-primary)]">Sithanandham Radhakrishnan</strong>
                <br />
                <span className="text-indigo-500 font-semibold">Strategic Advisor &amp; Owner</span>
                <br />
                vThink Global Technologies Pvt Ltd
                <br />
                <span className="text-[var(--text-secondary)]">Chief OrchestrAI Architect</span>
              </p>
              <p className="text-[10px] text-indigo-400 italic">
                "Human Orchestrates. AI Builds. Value Delivers."
              </p>
            </div>
          </div>

          <div className="border-t border-[var(--border-color)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[var(--text-secondary)]">
            <span>&copy; 2026 OrchestrAI Lead Academy. All rights reserved.</span>
            <span>Not-for-profit initiative. Training fee covers operational costs only.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}

export default App;
