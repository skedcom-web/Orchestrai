import React from 'react';
import {
  Code, Building, UserCog, FlaskConical, ServerCog,
  ClipboardList, Users2, Briefcase, Users,
} from 'lucide-react';
import { Reveal } from './Reveal';

const AUDIENCES = [
  {
    icon: Code,
    title: 'Developers',
    desc: 'Build enterprise software faster using AI-assisted delivery.',
    accent: 'text-indigo-400',
    glow: 'rgba(99,102,241,0.35)',
  },
  {
    icon: Building,
    title: 'Architects',
    desc: 'Define architecture, standards, governance and guardrails.',
    accent: 'text-cyan-400',
    glow: 'rgba(34,211,238,0.35)',
  },
  {
    icon: UserCog,
    title: 'Subject Matter Experts (SMEs)',
    desc: 'Convert business knowledge into enterprise solutions.',
    accent: 'text-purple-400',
    glow: 'rgba(168,85,247,0.35)',
  },
  {
    icon: FlaskConical,
    title: 'QA Engineers & Testers',
    desc: 'Validate AI-generated applications and outcomes.',
    accent: 'text-emerald-400',
    glow: 'rgba(52,211,153,0.35)',
  },
  {
    icon: ServerCog,
    title: 'IT Engineers',
    desc: 'Accelerate deployment, automation and operational readiness.',
    accent: 'text-amber-400',
    glow: 'rgba(251,191,36,0.35)',
  },
  {
    icon: ClipboardList,
    title: 'Product Owners',
    desc: 'Focus on business outcomes and delivery priorities.',
    accent: 'text-rose-400',
    glow: 'rgba(251,113,133,0.35)',
  },
  {
    icon: Users2,
    title: 'Engineering Managers',
    desc: 'Improve speed, predictability and governance.',
    accent: 'text-sky-400',
    glow: 'rgba(56,189,248,0.35)',
  },
  {
    icon: Briefcase,
    title: 'CTOs / CIOs / Technology Leaders',
    desc: 'Drive enterprise AI adoption safely and effectively.',
    accent: 'text-fuchsia-400',
    glow: 'rgba(232,121,249,0.35)',
  },
];

/**
 * AudienceSection — "Who is OrchestrAI for?"
 *
 * Eight interactive role cards. Hovering (or tapping, on touch devices) lifts
 * the card, lights the icon and reveals a colour rail, so a visitor can find
 * themselves on the page within a couple of seconds.
 */
export const AudienceSection: React.FC = () => (
  <section id="audience" className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-[var(--border-color)]">
    <div className="mx-auto max-w-7xl">

      <Reveal className="text-center mb-9 sm:mb-11">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/6 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-4">
          <Users className="h-3.5 w-3.5" />
          Built For Every Delivery Role
        </div>
        <h2 className="section-title font-extrabold tracking-tight">
          Who is <span className="gradient-text">OrchestrAI</span> for?
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
          OrchestrAI is not a developer-only method. Every role in an enterprise delivery team has a
          seat in the orchestration model — and a clear job to do inside it.
        </p>
      </Reveal>

      <Reveal stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {AUDIENCES.map(({ icon: Icon, title, desc, accent, glow }) => (
          <div
            key={title}
            tabIndex={0}
            className="group glass-card hover-lift rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
          >
            {/* Colour rail — slides in on hover / focus */}
            <span
              className="absolute top-0 left-0 h-[3px] w-full origin-left scale-x-0 group-hover:scale-x-100 group-focus-within:scale-x-100 transition-transform duration-500"
              style={{ background: `linear-gradient(90deg, ${glow}, transparent)` }}
              aria-hidden="true"
            />
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--surface-sunken)] ${accent} transition-transform duration-300 group-hover:scale-110`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)] leading-snug">{title}</h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{desc}</p>
          </div>
        ))}
      </Reveal>
    </div>
  </section>
);
