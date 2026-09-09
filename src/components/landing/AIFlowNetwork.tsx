import React from 'react';
import { Target, FileText, Cpu, Code, ShieldCheck, Rocket, ChevronRight, Sparkles } from 'lucide-react';

const ODF_STAGES = [
  {
    num: '01',
    title: 'Intent & Outcome Definition',
    desc: 'Define goals, success metrics, and stakeholders.',
    icon: Target,
    aiBadge: 'Human Orchestrated',
    aiBadgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/5',
    border: 'border-indigo-500/20',
    glow: 'rgba(99,102,241,0.2)'
  },
  {
    num: '02',
    title: 'Requirements & Context',
    desc: 'Capture business needs, constraints, and requirements.',
    icon: FileText,
    aiBadge: 'Human + AI Context',
    aiBadgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/5',
    border: 'border-cyan-500/20',
    glow: 'rgba(34,211,238,0.2)'
  },
  {
    num: '03',
    title: 'AI-Assisted Design',
    desc: 'AI generates architecture and solution designs.',
    icon: Cpu,
    aiBadge: '🤖 AI Design Engine',
    aiBadgeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    color: 'text-purple-400',
    bg: 'bg-purple-500/5',
    border: 'border-purple-500/20',
    glow: 'rgba(168,85,247,0.25)'
  },
  {
    num: '04',
    title: 'AI-Generated Development',
    desc: 'AI accelerates coding, APIs, and integrations.',
    icon: Code,
    aiBadge: '🤖 AI Code Engine',
    aiBadgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/5',
    border: 'border-emerald-500/20',
    glow: 'rgba(52,211,153,0.25)'
  },
  {
    num: '05',
    title: 'Testing & Quality Assurance',
    desc: 'AI + Human validation for quality and security.',
    icon: ShieldCheck,
    aiBadge: 'AI + Human QA',
    aiBadgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    color: 'text-amber-400',
    bg: 'bg-amber-500/5',
    border: 'border-amber-500/20',
    glow: 'rgba(251,191,36,0.2)'
  },
  {
    num: '06',
    title: 'Deployment & Improvement',
    desc: 'Deliver rapidly and continuously evolve.',
    icon: Rocket,
    aiBadge: 'Continuous Evolution',
    aiBadgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    color: 'text-rose-400',
    bg: 'bg-rose-500/5',
    border: 'border-rose-500/20',
    glow: 'rgba(251,113,133,0.2)'
  }
];

/**
 * AIFlowNetwork — Executive 6-Stage OrchestrAI Delivery Framework (ODF) Workflow.
 * Prominently displays the full stage title, complete description, and AI involvement breakdown.
 */
export const AIFlowNetwork: React.FC = () => {
  return (
    <div className="w-full space-y-4" aria-label="OrchestrAI Delivery Framework 6-Stage Workflow">
      {/* ── Desktop & Tablet Grid Layout (2 col on sm, 3 col on lg) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ODF_STAGES.map((stage, index) => {
          const Icon = stage.icon;
          return (
            <div
              key={stage.num}
              className={`relative glass-card rounded-2xl p-5 border ${stage.border} ${stage.bg} hover:border-[var(--card-hover-border)] transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between group shadow-lg`}
              style={{ boxShadow: `0 4px 20px ${stage.glow}` }}
            >
              {/* Header Badge Row */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${stage.border} bg-[var(--surface-raised)] ${stage.color} shrink-0`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`text-xs font-black tracking-widest ${stage.color}`}>
                      STAGE {stage.num}
                    </span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${stage.aiBadgeColor} shrink-0`}>
                    {stage.aiBadge}
                  </span>
                </div>

                {/* Stage Title */}
                <h3 className="text-base font-extrabold text-[var(--text-primary)] mb-2 leading-snug group-hover:text-indigo-400 transition-colors">
                  {stage.num} — {stage.title}
                </h3>

                {/* Full Stage Description */}
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                  {stage.desc}
                </p>
              </div>

              {/* Footer Connector Indicator */}
              <div className="mt-4 pt-3 border-t border-[var(--border-color)]/50 flex items-center justify-between text-[11px] text-[var(--text-muted)] font-semibold">
                <span>Phase {stage.num} of 06</span>
                {index < ODF_STAGES.length - 1 ? (
                  <span className={`inline-flex items-center gap-1 font-bold ${stage.color}`}>
                    Next Stage <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-bold text-rose-400">
                    Continuous Loop <Sparkles className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
