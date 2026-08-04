import React from 'react';
import { Target, Network, Cpu, ShieldCheck, RefreshCw, Rocket } from 'lucide-react';

const NODES = [
  { label: 'Intent',      icon: Target,      color: 'text-indigo-400',  ring: 'rgba(99,102,241,0.55)'  },
  { label: 'Orchestrate', icon: Network,     color: 'text-cyan-400',    ring: 'rgba(34,211,238,0.55)'  },
  { label: 'Generate',    icon: Cpu,         color: 'text-purple-400',  ring: 'rgba(168,85,247,0.55)'  },
  { label: 'Validate',    icon: ShieldCheck, color: 'text-emerald-400', ring: 'rgba(52,211,153,0.55)'  },
  { label: 'Evolve',      icon: RefreshCw,   color: 'text-amber-400',   ring: 'rgba(251,191,36,0.55)'  },
  { label: 'Deploy',      icon: Rocket,      color: 'text-rose-400',    ring: 'rgba(251,113,133,0.55)' },
];

/**
 * AIFlowNetwork — the OrchestrAI delivery loop as an animated node network.
 *
 * Intent → Orchestrate → Generate → Validate → Evolve → Deploy, connected by
 * marching-dash lines with breathing halos on each node. Built in HTML (not a
 * fixed-viewBox SVG) so the labels stay readable at every width; on phones the
 * row becomes a swipeable rail instead of shrinking to unreadable text.
 */
export const AIFlowNetwork: React.FC = () => (
  <div className="w-full" aria-label="OrchestrAI delivery loop: Intent, Orchestrate, Generate, Validate, Evolve, Deploy">
    <div className="scroll-rail overflow-x-auto pb-1">
      <div className="flex items-start justify-start sm:justify-center gap-1 sm:gap-2 min-w-max mx-auto px-1">
        {NODES.map(({ label, icon: Icon, color, ring }, i) => (
          <React.Fragment key={label}>
            {i > 0 && (
              <div
                className={`flow-line mt-6 w-8 sm:w-10 lg:w-16 shrink-0 ${color}`}
                style={{ animationDelay: `${i * -0.18}s` }}
                aria-hidden="true"
              />
            )}
            <div className="flex flex-col items-center gap-2 shrink-0 w-[76px] sm:w-[92px]">
              <div className="relative flex items-center justify-center h-12 w-12">
                {/* Breathing halo */}
                <span
                  className="node-halo absolute inset-0 rounded-full"
                  style={{ background: `radial-gradient(circle, ${ring} 0%, transparent 70%)`, animationDelay: `${i * -0.4}s` }}
                  aria-hidden="true"
                />
                <span className={`relative flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--surface-raised)] ${color}`}>
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] text-center leading-tight">
                {label}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  </div>
);
