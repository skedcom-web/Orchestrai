import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BRANDING } from '../config/branding';
import {
  ArrowRight, Zap, Shield, Check, Code, Award,
  TrendingUp, Users, Star, ChevronRight, Play, Briefcase,
  BookOpen, Target, Trophy, Rocket, Layers, GitBranch,
  GraduationCap, Building2, Sparkles, X, ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { HeroAurora } from '../components/landing/HeroAurora';
import { AnimatedHeadline } from '../components/landing/AnimatedHeadline';
import { AIFlowNetwork } from '../components/landing/AIFlowNetwork';
import { AudienceSection } from '../components/landing/AudienceSection';
import { WhyOrchestrAI } from '../components/landing/WhyOrchestrAI';
import { ScrumVsOrchestrAI } from '../components/landing/ScrumVsOrchestrAI';
import { OdfProofNarrative } from '../components/landing/OdfProofNarrative';
import { CeremoniesJourney } from '../components/landing/CeremoniesJourney';
import { BusinessOutcomes } from '../components/landing/BusinessOutcomes';
import { Reveal } from '../components/landing/Reveal';
import { observeOnce } from '../components/landing/useReveal';

/* ─── Animated counter hook ─────────────────── */
const useCounter = (target: number, duration = 1800) => {
  const [count, setCount] = React.useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const canAnimate = typeof IntersectionObserver !== 'undefined';

  useEffect(() => {
    if (!canAnimate) return;
    const node = ref.current;
    if (!node) return;

    let timer: ReturnType<typeof setInterval> | undefined;
    const stopObserving = observeOnce(
      node,
      () => {
        let start = 0;
        const step = target / (duration / 16);
        timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
      },
      { threshold: 0.4 }
    );

    return () => {
      stopObserving();
      if (timer) clearInterval(timer);
    };
  }, [target, duration, canAnimate]);

  return { count: canAnimate ? count : target, ref };
};

const StatCard: React.FC<{ value: number; suffix: string; label: string; colorClass: string }> =
  ({ value, suffix, label, colorClass }) => {
    const { count, ref } = useCounter(value);
    return (
      <div ref={ref} className="flex flex-col items-center px-4">
        <span className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${colorClass}`}>
          {count}{suffix}
        </span>
        <span className="text-xs text-[var(--text-secondary)] font-medium mt-1 text-center leading-snug">{label}</span>
      </div>
    );
  };

export const GuestGateModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm border border-[var(--border-color)] rounded-2xl bg-[var(--bg-card)] p-6 text-center shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="absolute top-4 right-4">
          <button 
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-450 mb-4 animate-bounce">
          <Award className="h-6 w-6" />
        </div>
        
        <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">
          Modules 1 &amp; 2 are Free! 🎓
        </h3>
        
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-6 px-2 text-left">
          Study resources and training for Modules 1 &amp; 2 are completely free. However, to track your progress, record quiz scores, and receive feedback, please register and login.
          <br /><br />
          Click the <strong className="text-indigo-550 dark:text-indigo-400">Register / Login</strong> button at the top right of the page to get started.
        </p>
        
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-xs font-extrabold shadow-lg transition-all cursor-pointer"
        >
          Got it, Close
        </button>
      </div>
    </div>,
    document.body
  );
};

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { systemConfig, currentUser } = useApp();
  const [showGuestGateModal, setShowGuestGateModal] = useState(false);

  const handleStartLearning = () => {
    if (!currentUser) {
      setShowGuestGateModal(true);
    } else {
      navigate('/modules');
    }
  };

  const journeySteps = [
    {
      step: '01',
      icon: BookOpen,
      title: 'Free Study — Modules 1 & 2',
      desc: 'Dive into the OrchestrAI framework at zero cost. Register and login to track your progress, quiz scores, and feedback.',
      badge: 'FREE',
      badgeColor: 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400',
      color: 'text-indigo-400',
    },
    {
      step: '02',
      icon: Target,
      title: 'Prove Your Understanding',
      desc: 'Take the module quiz. Score ≥ 80% to demonstrate your conceptual mastery. This filters serious learners from casual browsers.',
      badge: 'QUIZ GATE',
      badgeColor: 'bg-amber-500/15 border-amber-500/25 text-amber-400',
      color: 'text-amber-400',
    },
    {
      step: '03',
      icon: Rocket,
      title: `Commit — ₹${systemConfig.certificationPrice ?? 99} Career Investment`,
      desc: `Unlock Modules 3–8. The nominal ₹${systemConfig.certificationPrice ?? 99} is not a course fee — it's your accountability signal. When you invest, you show up. We invest back with our full attention.`,
      badge: `₹${systemConfig.certificationPrice ?? 99} ONLY`,
      badgeColor: 'bg-purple-500/15 border-purple-500/25 text-purple-400',
      color: 'text-purple-400',
    },
    {
      step: '04',
      icon: Layers,
      title: 'Build. Ship. Demo.',
      desc: 'Apply the 6-stage OrchestrAI Delivery Framework (ODF) to engineer a complete, production-ready enterprise application. You own the code. You own the portfolio.',
      badge: 'BUILD',
      badgeColor: 'bg-cyan-500/15 border-cyan-500/25 text-cyan-400',
      color: 'text-cyan-400',
    },
    {
      step: '05',
      icon: GraduationCap,
      title: 'Get Certified',
      desc: 'Receive your OrchestrAI Lead Certification — not just a digital badge, but backed by a live GitHub repository that any recruiter can inspect.',
      badge: 'CERTIFIED',
      badgeColor: 'bg-indigo-500/15 border-indigo-500/25 text-indigo-400',
      color: 'text-indigo-400',
    },
    {
      step: '06',
      icon: Building2,
      title: 'Get Hired Faster',
      desc: 'Scorers ≥ 90% are flagged for priority hiring referrals to our IT partner network. Walk into any interview with a live, working application — not just a resume.',
      badge: 'GET HIRED',
      badgeColor: 'bg-rose-500/15 border-rose-500/25 text-rose-400',
      color: 'text-rose-400',
    },
  ];

  const stages = [
    { num: '01', label: 'Intent & Outcome Definition', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', desc: 'Define goals, success metrics, and stakeholders.' },
    { num: '02', label: 'Requirements & Context', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', desc: 'Capture business needs, constraints, and requirements.' },
    { num: '03', label: 'AI-Assisted Design', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', desc: 'AI generates architecture and solution designs.' },
    { num: '04', label: 'AI-Generated Development', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', desc: 'AI accelerates coding, APIs, and integrations.' },
    { num: '05', label: 'Testing & Quality Assurance', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', desc: 'AI + Human validation for quality and security.' },
    { num: '06', label: 'Deployment & Improvement', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', desc: 'Deliver rapidly and continuously evolve.' },
  ];

  const pipDemos = [
    { title: 'Timesheet Management Portal', days: '7 Days', detail: '27 APIs, multi-role RBAC, timesheet validation grids — fully operational.', domain: 'timesheet.orchestraideveloper.com', link: 'https://timesheet.orchestraideveloper.com', color: 'text-cyan-400' },
    { title: 'Project Issue Tracker', days: '5 Days', detail: 'Multi-tenant sprint tracking, sub-items, custom categories and prompt auditing history.', domain: 'projectissuetracker.orchestraideveloper.com', link: 'https://projectissuetracker.orchestraideveloper.com', color: 'text-purple-400' },
    { title: 'HRIMS Enterprise Suite', days: '20 Days', detail: '18 of 24 complex modules — Leave, Expense, Payroll integration, all UAT-ready.', domain: '18/24 modules ready for QA', link: null, color: 'text-indigo-400' },
    { title: 'HR Calendar Planner', days: '3 Days', detail: 'Drag-drop scheduling, visual team planner views, leave overlays and responsive drag handles.', domain: 'Ready for QA Demo', link: null, color: 'text-emerald-400' },
  ];

  return (
    <div className="relative flex flex-col w-full">

      {/* ── ANNOUNCEMENT BANNER ── */}
      <div className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 py-2.5 px-4 text-center text-xs sm:text-sm font-semibold text-white flex items-center justify-center gap-3">
        <span className="hidden sm:inline">🎓</span>
        <span>
          <strong>Modules 1 &amp; 2 are completely FREE.</strong>
          {' '}Register and login to track your scores, progress, and feedback!
        </span>
        <button
          onClick={handleStartLearning}
          className="hidden sm:flex items-center gap-1 bg-white/20 hover:bg-white/30 rounded-full px-3 py-0.5 text-[11px] font-bold transition-all shrink-0"
        >
          Start Now <ChevronRight className="h-3 w-3" />
        </button>
      </div>

      {/* ═══ HERO — full-screen framework statement ══════ */}
      <section className="relative flex flex-col justify-center min-h-[calc(100svh-5rem)] py-12 sm:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">

        {/* Premium animated backdrop — aurora + gradient mesh + dot grid */}
        <HeroAurora />

        <div className="relative z-10 mx-auto max-w-5xl w-full flex flex-col items-center text-center">

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/25 bg-indigo-500/8 text-indigo-400 text-xs sm:text-sm font-bold uppercase tracking-widest mb-5">
            <Zap className="h-3.5 w-3.5 text-cyan-400" />
            OrchestrAI Delivery Framework (ODF)
          </div>

          {/* Rotating brand headlines */}
          <AnimatedHeadline centered />

          {/* The one message a visitor cannot miss */}
          <h1 className="mb-6">
            <span className="hero-statement block text-[var(--text-primary)]">Human Orchestrates.</span>
            <span className="hero-statement block gradient-text">AI Builds.</span>
            <span className="hero-statement block text-[var(--text-primary)]">Value Delivered.</span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-[var(--text-secondary)] leading-relaxed max-w-3xl mb-8">
            The <strong className="text-[var(--text-primary)]">OrchestrAI Delivery Framework (ODF)</strong> is the enterprise AI delivery framework that enables
            Developers, Architects, SMEs, QA Engineers, IT Engineers and Technology Leaders to deliver
            business value faster through <strong className="text-[var(--text-primary)]">AI-Orchestrated Delivery</strong>.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center">
            <button
              id="hero-cta-start"
              onClick={handleStartLearning}
              className="tap-target w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm sm:text-base hover:brightness-110 hover:scale-[1.03] transition-all"
              style={{ boxShadow: 'var(--btn-shadow)' }}
            >
              <BookOpen className="h-4 w-4" />
              Start Free — Modules 1 &amp; 2
            </button>
            <button
              id="hero-cta-journey"
              onClick={() => document.getElementById('audience')?.scrollIntoView({ behavior: 'smooth' })}
              className="tap-target w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] font-semibold text-sm sm:text-base hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all"
            >
              <Play className="h-4 w-4" />
              See How It Works
            </button>
          </div>
        </div>

        {/* ── AI DELIVERY NETWORK — the 6 ODF stages workflow ── */}
        <div className="relative z-10 mx-auto max-w-6xl w-full mt-10 sm:mt-12">
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/20 bg-gradient-to-b from-[var(--bg-card)] to-indigo-500/5 shadow-2xl">
            <div className="text-center mb-6">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Core Delivery Architecture
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] mt-2 mb-1">
                The OrchestrAI Delivery Framework (ODF) — 6-Stage Workflow
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
                A continuous, AI-Orchestrated operating model from Intent Definition to Automated Delivery and Evolution.
              </p>
            </div>
            <AIFlowNetwork />
          </div>
        </div>

        {/* Scroll cue */}
        <button
          onClick={() => document.getElementById('audience')?.scrollIntoView({ behavior: 'smooth' })}
          className="relative z-10 mx-auto mt-8 flex flex-col items-center gap-1 text-[var(--text-muted)] hover:text-indigo-400 transition-colors"
          aria-label="Scroll to who OrchestrAI is for"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Who it's for</span>
          <ChevronDown className="h-4 w-4 scroll-cue" />
        </button>
      </section>

      {/* ═══ WHO IS ORCHESTRAI FOR? ══════════════════════ */}
      <AudienceSection />

      {/* ═══ WHY ORCHESTRAI? ═════════════════════════════ */}
      <WhyOrchestrAI />

      {/* ═══ SCRUM VS ORCHESTRAI ═════════════════════════ */}
      <ScrumVsOrchestrAI />

      {/* ═══ HIGH-LEVEL ORCHESTRAI CEREMONIES ════════════ */}
      <CeremoniesJourney />

      {/* ═══ BUSINESS OUTCOMES ═══════════════════════════ */}
      <BusinessOutcomes />

      {/* ═══ WHY PROFESSIONALS LEARN IT ══════════════════ */}
      <section className="relative py-14 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-[var(--border-color)] overflow-hidden">
        <div className="relative z-10 mx-auto max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left */}
          <Reveal className="flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/25 bg-indigo-500/8 text-indigo-400 text-sm font-bold uppercase tracking-widest mb-5">
              <Zap className="h-3.5 w-3.5 text-cyan-400" />
              OrchestrAI Lead Certification
            </div>

            <h2 className="hero-title font-extrabold tracking-tight mb-5">
              <span className="text-[var(--text-primary)]">Build a</span>
              <br />
              <span className="gradient-text">Recruiter-Ready Portfolio</span>
              <br />
              <span className="text-[var(--text-primary)]">Faster.</span>
            </h2>

            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed mb-4 max-w-lg">
              The <strong className="text-[var(--text-primary)]">OrchestrAI Lead Certification</strong> doesn't just teach AI — it gets you to
              build and ship a real enterprise application you can demo to any recruiter, anywhere, instantly.
            </p>

            <p className="text-sm font-bold tracking-[0.15em] text-indigo-400 uppercase mb-7">
              "Human Orchestrates. AI Builds. Value Delivered."
            </p>
            <div className="flex flex-col gap-3 mb-8">
              {[
                'Build production-grade enterprise apps — not toy projects',
                'Own a live GitHub portfolio every recruiter can inspect',
                'Score ≥ 90% for priority referrals to our IT hiring network',
                `Full certification for just ₹${systemConfig.certificationPrice ?? 99} — covers demo review & personalised mentor feedback`,
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
                  <div className="flex-shrink-0 mt-1 h-4 w-4 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                    <Check className="h-2.5 w-2.5 text-emerald-400" />
                  </div>
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                id="career-cta-start"
                onClick={handleStartLearning}
                className="tap-target w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm hover:brightness-110 hover:scale-[1.03] transition-all"
                style={{ boxShadow: 'var(--btn-shadow)' }}
              >
                <BookOpen className="h-4 w-4" />
                Start Free — Modules 1 &amp; 2
              </button>
              <button
                id="career-cta-journey"
                onClick={() => document.getElementById('journey')?.scrollIntoView({ behavior: 'smooth' })}
                className="tap-target w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] font-semibold text-sm hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all"
              >
                <Play className="h-4 w-4" />
                See the Journey
              </button>
            </div>
          </Reveal>

          {/* Right — differentiation cards */}
          <Reveal stagger className="flex flex-col gap-4">
            <div className="glass-card hover-lift rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600" />
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-1.5">Your Portfolio is the Certificate</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    Every module trains you to build components of a real enterprise app. By certification, you have a 
                    <strong className="text-[var(--text-primary)]"> live, demo-able GitHub portfolio</strong> — something no PDF certificate can ever match.
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card hover-lift rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Why You'll Stand Out to Hirers</h3>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { icon: GitBranch, label: 'Live Code Repo', sub: 'Demo it in any interview', color: 'text-cyan-400' },
                  { icon: TrendingUp, label: 'Hiring Referrals', sub: '90%+ scorers fast-tracked', color: 'text-emerald-400' },
                  { icon: Code, label: 'Own Your IP', sub: 'Zero rented intelligence', color: 'text-purple-400' },
                  { icon: Users, label: 'Recruiter Proof', sub: 'Real apps, not theory', color: 'text-amber-400' },
                ].map(({ icon: Icon, label, sub, color }) => (
                  <div key={label} className="flex items-start gap-2 p-2.5 rounded-lg bg-[var(--bg-primary)]/40 border border-[var(--border-color)]">
                    <Icon className={`h-4 w-4 ${color} flex-shrink-0 mt-0.5`} />
                    <div>
                      <div className="text-sm font-bold text-[var(--text-primary)]">{label}</div>
                      <div className="text-xs text-[var(--text-secondary)] mt-0.5">{sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-xl px-4 py-3.5 flex items-center gap-3">
              <div className="h-7 w-7 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                <Star className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                💡 <strong className="text-[var(--text-primary)]">This portal itself is the proof.</strong> Built in just 10 days as an 80-90% production-ready application using the OrchestrAI framework. The remaining enhancements and features represent Customer QA, which we refine collaboratively with your team.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ STATS ROW ═══════════════════════════════════ */}
      <section className="w-full border-t border-b border-[var(--border-color)] bg-[var(--bg-card)]/40 backdrop-blur-sm py-10 px-4">
        <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x divide-[var(--border-color)]">
          <StatCard value={6} suffix="+" label="Training Modules" colorClass="gradient-text" />
          <StatCard value={systemConfig.certificationPrice ?? 99} suffix="₹" label="Full Certification Fee" colorClass="text-amber-400" />
          <StatCard value={7} suffix=" Days" label="Average POC Build" colorClass="text-emerald-400" />
          <StatCard value={90} suffix="%" label="Score → Hiring Referral" colorClass="text-indigo-400" />
        </div>
      </section>

      {/* ═══ CAREER JOURNEY ══════════════════════════════ */}
      <section id="journey" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">

          <Reveal className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/6 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">
              <Rocket className="h-3.5 w-3.5" />
              Your Career Elevation Journey
            </div>
            <h2 className="section-title font-extrabold tracking-tight leading-tight">
              From Learner to <span className="gradient-text">Hired Professional</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
              Six clear steps from zero to a certified <strong className="text-[var(--text-primary)]">OrchestrAI Lead</strong> — with a live enterprise portfolio that impresses every recruiter and opens doors to top IT companies.
            </p>
          </Reveal>

          <Reveal stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {journeySteps.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="group glass-card hover-lift rounded-2xl p-5 flex flex-col gap-3 hover:border-[var(--card-hover-border)]">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-primary)]/50 border border-[var(--border-color)] ${s.color} transition-transform duration-300 group-hover:scale-110`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`px-2.5 py-1 rounded-full border text-xs font-extrabold tracking-wider uppercase ${s.badgeColor}`}>
                      {s.badge}
                    </span>
                  </div>
                  <div>
                    <div className={`text-xs font-extrabold tracking-widest mb-1 ${s.color}`}>STEP {s.step}</div>
                    <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">{s.title}</h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </Reveal>
        </div>
      </section>

      {/* ═══ WHY ORCHESTRAI WINS ═════════════════════════ */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 border-t border-[var(--border-color)]">
        <div className="mx-auto max-w-7xl">

          <Reveal className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-rose-500/20 bg-rose-500/6 text-rose-400 text-xs font-bold uppercase tracking-widest mb-4">
              Our Strategic Difference
            </div>
            <h2 className="section-title font-extrabold tracking-tight">
              Recruiter-Ready in <span className="gradient-text">Weeks, Not Years</span>
            </h2>
            <p className="mt-3 text-sm text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
              Traditional certifications prove you memorised documentation. OrchestrAI proves you can
              <strong className="text-[var(--text-primary)]"> build, ship, and demo</strong> — which is what IT companies actually hire for.
            </p>
          </Reveal>

          <div className="relative">
            {/* VS pivot — sits between the two comparison cards on desktop */}
            <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 h-12 w-12 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--surface-raised)] text-xs font-extrabold uppercase tracking-widest text-[var(--text-secondary)] shadow-lg glow-soft" aria-hidden="true">
              VS
            </div>

            <Reveal stagger className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="group glass-card hover-lift rounded-2xl p-7 space-y-4 relative overflow-hidden lg:grayscale-[0.25] lg:hover:grayscale-0 transition-[filter] duration-500">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-rose-500/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" />
                <div className="inline-block px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-[10px] font-extrabold uppercase tracking-widest">
                  ❌ Every Other Certification
                </div>
                <ul className="space-y-3">
                  {[
                    'Watch pre-recorded videos, click Next',
                    'MCQ exam with questions from a question bank',
                    'PDF certificate that every recruiter ignores',
                    'Cannot explain what you built or how',
                    'Ten thousand identical candidates',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)] rounded-lg px-2 py-1 -mx-2 transition-all duration-300 hover:bg-rose-500/5 hover:translate-x-1">
                      <span className="text-rose-400 mt-0.5 flex-shrink-0">✕</span> {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="group glass-card hover-lift rounded-2xl p-7 space-y-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cyan-400 to-indigo-500" />
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" aria-hidden="true" />
                <div className="relative inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-[10px] font-extrabold uppercase tracking-widest">
                  ✅ The OrchestrAI Certification
                </div>
                <ul className="relative space-y-3">
                  {[
                    'Build a real enterprise-grade application from the ground up',
                    'Live GitHub repo — open it during any interview',
                    'Explain every architectural decision, prompt, and tradeoff',
                    'Production-ready code that passes corporate security checks',
                    'Unique, recruiter-memorable candidate profile',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)] rounded-lg px-2 py-1 -mx-2 transition-all duration-300 hover:bg-emerald-500/8 hover:translate-x-1">
                      <Check className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          {/* Commitment fee transparency */}
          <div className="mt-6 glass-card hover-lift rounded-xl p-6 flex flex-col sm:flex-row items-start gap-4">
            <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mt-0.5">
              <Sparkles className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h4 className="text-base font-bold text-[var(--text-primary)] mb-2">Radical Transparency: The ₹{systemConfig.certificationPrice ?? 99} Commitment Signal</h4>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-2">
                We <em>could</em> offer everything free. But when training is entirely free, completion rates collapse. 
                The ₹{systemConfig.certificationPrice ?? 99} is your personal accountability signal — it tells us you're serious about your career.
              </p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                It also covers the <strong className="text-amber-400">manual effort involved in reviewing your completed demo</strong> — 
                our team personally evaluates your built application through a <strong className="text-[var(--text-primary)]">1-on-1 review call or detailed email feedback</strong>, 
                guiding you before we certify you as an <strong className="text-[var(--text-primary)]">OrchestrAI Lead</strong>. This human touch is what makes the certification genuinely valuable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ THE 6-STAGE LOOP ════════════════════════════ */}
      <section id="curriculum" className="py-14 px-4 sm:px-6 lg:px-8 border-t border-[var(--border-color)]">
        <div className="mx-auto max-w-7xl">

          <Reveal className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/6 text-purple-400 text-sm font-bold uppercase tracking-widest mb-4">
              Core Framework
            </div>
            <h2 className="section-title font-extrabold tracking-tight">
              The 6-Stage <span className="gradient-text">OrchestrAI Delivery Framework</span>
            </h2>
            <p className="mt-3 text-base text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
              The continuous delivery lifecycle taught and practiced in every module — the same method used to build production systems in days.
            </p>
          </Reveal>

          <Reveal stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stages.map((stage) => (
              <div
                key={stage.num}
                className="glass-card hover-lift rounded-2xl p-5 hover:border-[var(--card-hover-border)]"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs font-extrabold tracking-widest ${stage.color}`}>STAGE {stage.num}</span>
                  <span className={`px-2.5 py-1 rounded-lg ${stage.bg} border ${stage.border} ${stage.color} text-xs font-extrabold uppercase tracking-wider`}>
                    {stage.label}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{stage.desc}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ═══ CREATOR CREDIBILITY ═════════════════════════ */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 border-t border-[var(--border-color)]">
        <div className="mx-auto max-w-5xl">
          <Reveal className="glass-card rounded-2xl p-7 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600" />
            <div className="absolute top-4 right-4 opacity-[0.04] pointer-events-none">
              <Award className="h-40 w-40 text-indigo-400" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-7 items-start">
              <div className="flex flex-col items-center gap-2">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-indigo-500/25">
                  SR
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-indigo-400 text-center">{BRANDING.founderTitle}</div>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-0.5">
                  {BRANDING.founderName}
                </h2>
                <p className="text-sm font-bold text-indigo-400 tracking-widest mb-0.5 uppercase">
                  {BRANDING.founderTitle}
                </p>
                <p className="text-sm text-[var(--text-primary)] font-semibold mb-0.5">
                  {BRANDING.founderRole}
                </p>
                <p className="text-xs text-[var(--text-secondary)] font-semibold mb-4">
                  {BRANDING.founderLeadership} · {BRANDING.founderExperience}
                </p>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                  Created by a technology leader with <strong className="text-[var(--text-primary)]">{BRANDING.founderExperience}</strong> delivering
                  enterprise software solutions across <strong className="text-[var(--text-primary)]">Banking, Insurance, Telecom, and Capital Markets</strong> —
                  including <strong className="text-[var(--text-primary)]">Fortune 500 clients</strong> in those industries.
                  Sithanandham conceived and built the OrchestrAI framework — bridging high-level business intent with
                  AI-generated production code — drawing on years as a Project Manager, Portfolio Manager, PMO Leader, Delivery Manager,
                  Test Manager, and Certified Scrum Master (Scrum Alliance, 2012), including governing technology portfolios of 300+ people.
                  He built this very certification platform using the same principles he teaches — an end-to-end proof of the method.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['AI Delivery & Governance', 'Program & Portfolio Leader', 'Project Manager', 'PMO Leader', 'Delivery Manager', 'Test Manager', 'Certified Scrum Master', 'OrchestrAI Architect'].map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/15 text-xs font-semibold text-indigo-300 uppercase tracking-wide">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ WHY LEARN FROM ORCHESTRAI? ═══════════════════ */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 border-t border-[var(--border-color)]">
        <div className="mx-auto max-w-5xl">
          <Reveal className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Why Learn from <span className="gradient-text">OrchestrAI?</span>
            </h2>
            <p className="mt-3 text-sm text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
              OrchestrAI Academy is an independent learning and certification platform built to help professionals
              effectively collaborate with AI to deliver business solutions, software products, and digital transformation initiatives.
            </p>
          </Reveal>

          <Reveal stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Award, title: '24+ Years Experience', desc: 'Enterprise technology leadership for Fortune 500 clients across Banking, Insurance, Telecom, and Capital Markets.' },
              { icon: Users, title: 'Leadership Experience', desc: 'Project Manager, Portfolio Manager, PMO Leader, Delivery Manager, Test Manager, Certified Scrum Master, and Technology Leader.' },
              { icon: Sparkles, title: 'AI Delivery Innovation', desc: 'Creator of the OrchestrAI Framework for Human-AI Collaborative Software Delivery.' },
              { icon: Target, title: 'Practical Learning', desc: 'Built from real-world delivery experience, governance practices, transformation programs, and enterprise-scale software delivery.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass-card rounded-2xl p-5 flex flex-col gap-3 hover:scale-[1.02] hover:border-[var(--card-hover-border)] transition-all duration-300">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">{title}</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{desc}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ═══ ODF PROOF NARRATIVE ═════════════════════════ */}
      <OdfProofNarrative />

      {/* ═══ PIP DEMOS ═══════════════════════════════════ */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 border-t border-[var(--border-color)]">
        <div className="mx-auto max-w-7xl">

          <Reveal className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/6 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
              <Shield className="h-3.5 w-3.5" />
              Proved in Practice (PIP)
            </div>
            <h2 className="section-title font-extrabold tracking-tight">
              Real Apps. <span className="gradient-text">Real Speed.</span>
            </h2>
            <p className="mt-3 text-base text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
              <strong className="text-[var(--text-primary)]">Evidence, not a catalogue.</strong> Each one started as an idea,
              went through ODF, and came out as a production-ready enterprise system — demoed to real clients and available for you to explore live.
            </p>
          </Reveal>

          <Reveal stagger className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            {pipDemos.map((demo) => (
              <div
                key={demo.title}
                className="glass-card hover-lift rounded-xl p-5 hover:border-[var(--card-hover-border)] flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-base font-bold text-[var(--text-primary)] leading-tight">{demo.title}</h4>
                  <span className="flex-shrink-0 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-extrabold uppercase tracking-wide whitespace-nowrap">
                    ✓ {demo.days}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{demo.detail}</p>
                <div className={`flex items-center gap-2 text-sm font-semibold ${demo.color}`}>
                  <Code className="h-4 w-4 flex-shrink-0" />
                  {demo.link ? (
                    <a
                      href={demo.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`hover:underline underline-offset-2 ${demo.color}`}
                    >
                      {demo.domain}
                    </a>
                  ) : (
                    <span className="text-[var(--text-secondary)]">{demo.domain}</span>
                  )}
                </div>
              </div>
            ))}
          </Reveal>

          {/* Bottom CTA */}
          <Reveal className="glass-card rounded-2xl p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />
            <GraduationCap className="h-10 w-10 mx-auto mb-3 text-indigo-400 opacity-80 icon-breath" />
            <h3 className="text-xl sm:text-2xl font-extrabold mb-2">
              Your Career Starts Here
            </h3>
            <p className="text-base text-[var(--text-secondary)] mb-6 max-w-xl mx-auto leading-relaxed">
              Build your own enterprise application. Earn your <strong className="text-[var(--text-primary)]">OrchestrAI Lead</strong> certification.
              Walk into every interview with working proof — not just promises.
            </p>
            <button
              id="bottom-cta-start"
              onClick={handleStartLearning}
              className="tap-target inline-flex w-full sm:w-auto items-center justify-center gap-2 px-10 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm hover:brightness-110 hover:scale-[1.03] transition-all"
              style={{ boxShadow: 'var(--btn-shadow)' }}
            >
              Begin Your Journey — Free
              <ArrowRight className="h-4 w-4" />
            </button>
          </Reveal>

        </div>
      </section>

      <GuestGateModal isOpen={showGuestGateModal} onClose={() => setShowGuestGateModal(false)} />
    </div>
  );
};
