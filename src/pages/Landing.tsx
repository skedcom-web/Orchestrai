import React, { useEffect, useRef } from 'react';
import {
  ArrowRight, Zap, Shield, Check, Code, Award,
  TrendingUp, Users, Star, ChevronRight, Play, Briefcase,
  BookOpen, Target, Trophy, Rocket, Layers, GitBranch,
  GraduationCap, Building2, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/* ─── Animated counter hook ─────────────────── */
const useCounter = (target: number, duration = 1800) => {
  const [count, setCount] = React.useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
      },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  return { count, ref };
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

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  const journeySteps = [
    {
      step: '01',
      icon: BookOpen,
      title: 'Free Study — Modules 1 & 2',
      desc: 'Dive into the OrchestrAI framework at zero cost. No login required. Understand the methodology, lifecycle, and AI orchestration principles at your own pace.',
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
      title: 'Commit — ₹99 Career Investment',
      desc: 'Unlock Modules 3–8. The nominal ₹99 is not a course fee — it\'s your accountability signal. When you invest, you show up. We invest back with our full attention.',
      badge: '₹99 ONLY',
      badgeColor: 'bg-purple-500/15 border-purple-500/25 text-purple-400',
      color: 'text-purple-400',
    },
    {
      step: '04',
      icon: Layers,
      title: 'Build. Ship. Demo.',
      desc: 'Apply the 6-stage OrchestrAI Loop to engineer a complete, production-ready enterprise application. You own the code. You own the portfolio.',
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
    { num: '01', label: 'Intent', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', desc: 'Translate stakeholder needs into structured, constraint-rich natural language intent with actors, rules & edge cases.' },
    { num: '02', label: 'Orchestrate', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', desc: 'Determine dependency graphs, map data model changes and establish API request/response contracts.' },
    { num: '03', label: 'Generate', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', desc: 'Direct AI to build components sequentially — migrations first, controllers second, UI forms last.' },
    { num: '04', label: 'Validate', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', desc: 'Verify functional logic, server-side data isolation, security boundaries and OWASP compliance.' },
    { num: '05', label: 'Evolve', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', desc: 'Take real feedback and execute targeted enhancements. Re-prompt changes immediately in the same session.' },
    { num: '06', label: 'Deploy', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', desc: 'Promote validated features to production with CI/CD pipelines, living documentation and audit logs.' },
  ];

  const pipDemos = [
    { title: 'Timesheet Management Portal', days: '7 Days', detail: '27 APIs, multi-role RBAC, timesheet validation grids — fully operational.', domain: 'timesheet.vthinkdeveloper.com', link: 'https://timesheet.vthinkdeveloper.com', color: 'text-cyan-400' },
    { title: 'Project Issue Tracker', days: '5 Days', detail: 'Multi-tenant sprint tracking, sub-items, custom categories and prompt auditing history.', domain: 'projectissuetracker.vthinkdeveloper.com', link: 'https://projectissuetracker.vthinkdeveloper.com', color: 'text-purple-400' },
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
          {' '}No payment. No login. Start learning right now.
        </span>
        <button
          onClick={() => navigate('/modules')}
          className="hidden sm:flex items-center gap-1 bg-white/20 hover:bg-white/30 rounded-full px-3 py-0.5 text-[11px] font-bold transition-all shrink-0"
        >
          Start Now <ChevronRight className="h-3 w-3" />
        </button>
      </div>

      {/* ═══ HERO ════════════════════════════════════════ */}
      <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">

        {/* Dot-grid texture */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(99,102,241,0.06) 1px, transparent 0)',
            backgroundSize: '36px 36px',
          }}
        />

        <div className="relative z-10 mx-auto max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left */}
          <div className="flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/25 bg-indigo-500/8 text-indigo-400 text-sm font-bold uppercase tracking-widest mb-6">
              <Zap className="h-3.5 w-3.5 text-cyan-400" />
              OrchestrAI Lead Certification
            </div>

            <h1 className="text-5xl sm:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.05] mb-5">
              <span className="text-[var(--text-primary)]">Get Hired by</span>
              <br />
              <span className="gradient-text">Top IT Companies</span>
              <br />
              <span className="text-[var(--text-primary)]">Faster.</span>
            </h1>

            <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed mb-4 max-w-lg">
              The <strong className="text-[var(--text-primary)]">OrchestrAI Lead Certification</strong> doesn't just teach AI — it gets you to
              build and ship a real enterprise application you can demo to any recruiter, anywhere, instantly.
            </p>

            <p className="text-sm font-bold tracking-[0.15em] text-indigo-400 uppercase mb-7">
              "Human Orchestrates. AI Builds. Value Delivers."
            </p>

            <div className="flex flex-col gap-3 mb-8">
              {[
                'Build production-grade enterprise apps — not toy projects',
                'Own a live GitHub portfolio every recruiter can inspect',
                'Score ≥ 90% for priority referrals to our IT hiring network',
                'Full certification for just ₹99 — covers demo review & personalised mentor feedback',
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
                  <div className="flex-shrink-0 mt-1 h-4 w-4 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                    <Check className="h-2.5 w-2.5 text-emerald-400" />
                  </div>
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                id="hero-cta-start"
                onClick={() => navigate('/modules')}
                className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm hover:brightness-110 hover:scale-[1.03] transition-all"
                style={{ boxShadow: 'var(--btn-shadow)' }}
              >
                <BookOpen className="h-4 w-4" />
                Start Free — Modules 1 &amp; 2
              </button>
              <button
                id="hero-cta-journey"
                onClick={() => document.getElementById('journey')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] font-semibold text-sm hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all"
              >
                <Play className="h-4 w-4" />
                See the Journey
              </button>
            </div>
          </div>

          {/* Right — differentiation cards */}
          <div className="flex flex-col gap-4">
            <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
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

            <div className="glass-card rounded-2xl p-5">
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
                💡 <strong className="text-[var(--text-primary)]">This portal itself is the proof.</strong> Built in days using the exact OrchestrAI principles you'll master here.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ STATS ROW ═══════════════════════════════════ */}
      <section className="w-full border-t border-b border-[var(--border-color)] bg-[var(--bg-card)]/40 backdrop-blur-sm py-10 px-4">
        <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x divide-[var(--border-color)]">
          <StatCard value={8} suffix="+" label="Training Modules" colorClass="gradient-text" />
          <StatCard value={99} suffix="₹" label="Full Certification Fee" colorClass="text-amber-400" />
          <StatCard value={7} suffix=" Days" label="Average POC Build" colorClass="text-emerald-400" />
          <StatCard value={90} suffix="%" label="Score → Hiring Referral" colorClass="text-indigo-400" />
        </div>
      </section>

      {/* ═══ CAREER JOURNEY ══════════════════════════════ */}
      <section id="journey" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">

          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/6 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">
              <Rocket className="h-3.5 w-3.5" />
              Your Career Elevation Journey
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              From Learner to <span className="gradient-text">Hired Professional</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
              Six clear steps from zero to a certified <strong className="text-[var(--text-primary)]">OrchestrAI Lead</strong> — with a live enterprise portfolio that impresses every recruiter and opens doors to top IT companies.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {journeySteps.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="glass-card rounded-2xl p-5 flex flex-col gap-3 hover:scale-[1.02] hover:border-[var(--card-hover-border)] transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-primary)]/50 border border-[var(--border-color)] ${s.color}`}>
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
          </div>
        </div>
      </section>

      {/* ═══ WHY ORCHESTRAI WINS ═════════════════════════ */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 border-t border-[var(--border-color)]">
        <div className="mx-auto max-w-7xl">

          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-rose-500/20 bg-rose-500/6 text-rose-400 text-xs font-bold uppercase tracking-widest mb-4">
              Our Strategic Difference
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Recruiter-Ready in <span className="gradient-text">Weeks, Not Years</span>
            </h2>
            <p className="mt-3 text-sm text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
              Traditional certifications prove you memorised documentation. OrchestrAI proves you can 
              <strong className="text-[var(--text-primary)]"> build, ship, and demo</strong> — which is what IT companies actually hire for.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card rounded-2xl p-7 space-y-4">
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
                  <li key={item} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
                    <span className="text-rose-400 mt-0.5 flex-shrink-0">✕</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card rounded-2xl p-7 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cyan-400 to-indigo-500" />
              <div className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-[10px] font-extrabold uppercase tracking-widest">
                ✅ The OrchestrAI Certification
              </div>
              <ul className="space-y-3">
                {[
                  'Build a real enterprise-grade application from the ground up',
                  'Live GitHub repo — open it during any interview',
                  'Explain every architectural decision, prompt, and tradeoff',
                  'Production-ready code that passes corporate security checks',
                  'Unique, recruiter-memorable candidate profile',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
                    <Check className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Commitment fee transparency */}
          <div className="mt-6 glass-card rounded-xl p-6 flex flex-col sm:flex-row items-start gap-4">
            <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mt-0.5">
              <Sparkles className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h4 className="text-base font-bold text-[var(--text-primary)] mb-2">Radical Transparency: The ₹99 Commitment Signal</h4>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-2">
                We <em>could</em> offer everything free. But when training is entirely free, completion rates collapse. 
                The ₹99 is your personal accountability signal — it tells us you're serious about your career.
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

          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/6 text-purple-400 text-sm font-bold uppercase tracking-widest mb-4">
              Core Framework
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              The 6-Stage <span className="gradient-text">OrchestrAI Loop</span>
            </h2>
            <p className="mt-3 text-base text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
              The continuous delivery lifecycle taught and practiced in every module — the same method used to build production systems in days.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stages.map((stage) => (
              <div
                key={stage.num}
                className="glass-card rounded-2xl p-5 hover:scale-[1.02] hover:border-[var(--card-hover-border)] transition-all duration-300"
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
          </div>
        </div>
      </section>

      {/* ═══ PRODUCT OWNER ═══════════════════════════════ */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 border-t border-[var(--border-color)]">
        <div className="mx-auto max-w-5xl">
          <div className="glass-card rounded-2xl p-7 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600" />
            <div className="absolute top-4 right-4 opacity-[0.04] pointer-events-none">
              <Award className="h-40 w-40 text-indigo-400" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-7 items-start">
              <div className="flex flex-col items-center gap-2">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-indigo-500/25">
                  SR
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-indigo-400">Product Owner</div>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-0.5">
                  Sithanandham Radhakrishnan
                </h2>
                <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-0.5">
                  Strategic Advisor &amp; Product Owner — vThink Global Technologies
                </p>
                <p className="text-sm text-[var(--text-secondary)] font-semibold mb-4">
                  Chief OrchestrAI Architect
                </p>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                  As <strong className="text-[var(--text-primary)]">Strategic Advisor &amp; Product Owner at vThink Global Technologies Pvt Ltd</strong>, 
                  Sithanandham conceived and built the OrchestrAI framework — bridging high-level business intent with 
                  AI-generated production code. The OrchestrAI methodology and all derivative products, including this 
                  portal, are <strong className="text-amber-400">intellectual property of vThink Global Technologies Pvt Ltd</strong>. 
                  He built this very certification platform using the same principles he teaches — an end-to-end proof of the method.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Strategic Advisor', 'Product Owner', 'OrchestrAI Architect', 'OrchestrAI Lead'].map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/15 text-xs font-semibold text-indigo-300 uppercase tracking-wide">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PIP DEMOS ═══════════════════════════════════ */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 border-t border-[var(--border-color)]">
        <div className="mx-auto max-w-7xl">

          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/6 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4">
              <Shield className="h-3.5 w-3.5" />
              Proved in Practice (PIP)
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Real Apps. <span className="gradient-text">Real Speed.</span>
            </h2>
            <p className="mt-3 text-base text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
              These are production-ready enterprise systems built entirely through the OrchestrAI Lead methodology — demoed to real clients and available for you to explore live.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            {pipDemos.map((demo) => (
              <div
                key={demo.title}
                className="glass-card rounded-xl p-5 hover:scale-[1.015] hover:border-[var(--card-hover-border)] transition-all duration-300 flex flex-col gap-3"
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
          </div>

          {/* Bottom CTA */}
          <div className="glass-card rounded-2xl p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />
            <GraduationCap className="h-10 w-10 mx-auto mb-3 text-indigo-400 opacity-80" />
            <h3 className="text-xl sm:text-2xl font-extrabold mb-2">
              Your Career Starts Here
            </h3>
            <p className="text-base text-[var(--text-secondary)] mb-6 max-w-xl mx-auto leading-relaxed">
              Build your own enterprise application. Earn your <strong className="text-[var(--text-primary)]">OrchestrAI Lead</strong> certification. 
              Walk into every interview with working proof — not just promises.
            </p>
            <button
              id="bottom-cta-start"
              onClick={() => navigate('/modules')}
              className="inline-flex items-center gap-2 px-10 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm hover:brightness-110 hover:scale-[1.03] transition-all"
              style={{ boxShadow: 'var(--btn-shadow)' }}
            >
              Begin Your Journey — Free
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>
      </section>

    </div>
  );
};
