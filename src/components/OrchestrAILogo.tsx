import React from 'react';

/**
 * Official OrchestrAI Framework Logo Icon (O Beside AI).
 * Matches the official OrchestrAI Framework brand emblem:
 * - Outer crescent ring: Purple/Magenta (top-left) to Royal Blue/Cyan (bottom-right)
 * - Inner node network: 5 white nodes + connecting lines + glittering sparkle star
 * - Beside AI text: Vibrant Purple to Blue gradient
 */
export const OrchestrAILogoIcon: React.FC<{ className?: string; hideText?: boolean }> = ({ 
  className = "h-9 w-auto", 
  hideText = false 
}) => {
  return (
    <svg
      viewBox={hideText ? "0 0 100 100" : "0 0 200 100"}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} transition-transform duration-300 hover:scale-105`}
    >
      <defs>
        {/* Official OrchestrAI Framework Gradient: Purple -> Magenta -> Royal Blue -> Cyan */}
        <linearGradient id="oai-framework-grad" x1="10%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="35%" stopColor="#D946EF" />
          <stop offset="70%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        {/* AI Text Gradient */}
        <linearGradient id="oai-text-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>

        {/* Inner Ring Circle Gradient */}
        <linearGradient id="oai-inner-ring" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
      </defs>

      <style>{`
        @keyframes frameworkSparkle {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.85; filter: drop-shadow(0 0 2px #fff); }
          50% { transform: scale(1.4) rotate(15deg); opacity: 1; filter: drop-shadow(0 0 6px #D946EF); }
        }
        @keyframes frameworkNodePulse {
          0%, 100% { r: 4.3px; opacity: 0.9; }
          50% { r: 5.3px; opacity: 1; filter: drop-shadow(0 0 4px #38BDF8); }
        }
        .animate-framework-sparkle {
          transform-origin: 72px 24px;
          animation: frameworkSparkle 2.5s ease-in-out infinite;
        }
        .animate-framework-node {
          animation: frameworkNodePulse 2.2s ease-in-out infinite;
        }
      `}</style>

      {/* Outer Crescent Swoosh ("O" outer arc) */}
      <path
        d="M 50,4 C 77,4 96,23 94,50 C 92,75 70,96 46,96 C 21,96 4,76 4,50 C 4,27 20,11 41,6 C 29,12 17,28 17,49 C 17,70 32,85 51,85 C 70,85 84,70 84,49 C 84,28 70,13 50,4 Z"
        fill="url(#oai-framework-grad)"
      />

      {/* Inner Circle Background Container */}
      <circle cx="50" cy="50" r="30" fill="#0B0F19" fillOpacity="0.85" stroke="url(#oai-inner-ring)" strokeWidth="4.5" />

      {/* Network Graph Connectors inside "O" */}
      <g stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" opacity="0.95">
        <line x1="38" y1="36" x2="53" y2="28" />
        <line x1="38" y1="36" x2="48" y2="48" />
        <line x1="38" y1="36" x2="32" y2="60" />
        <line x1="53" y1="28" x2="66" y2="38" />
        <line x1="53" y1="28" x2="48" y2="48" />
        <line x1="48" y1="48" x2="66" y2="38" />
        <line x1="48" y1="48" x2="60" y2="66" />
        <line x1="32" y1="60" x2="48" y2="48" />
        <line x1="32" y1="60" x2="60" y2="66" />
        <line x1="66" y1="38" x2="60" y2="66" />
      </g>

      {/* Network nodes (crisp white dots with subtle pulse) */}
      <circle cx="38" cy="36" r="4.5" fill="#FFFFFF" className="animate-framework-node" />
      <circle cx="53" cy="28" r="4.5" fill="#FFFFFF" className="animate-framework-node" style={{ animationDelay: '0.4s' }} />
      <circle cx="48" cy="48" r="4.5" fill="#FFFFFF" className="animate-framework-node" style={{ animationDelay: '0.8s' }} />
      <circle cx="32" cy="60" r="4.5" fill="#FFFFFF" className="animate-framework-node" style={{ animationDelay: '1.2s' }} />
      <circle cx="66" cy="38" r="4.5" fill="#FFFFFF" className="animate-framework-node" style={{ animationDelay: '1.6s' }} />
      <circle cx="60" cy="66" r="4.5" fill="#FFFFFF" className="animate-framework-node" style={{ animationDelay: '0.4s' }} />

      {/* Glittering Sparkle star at top right inside ring */}
      <path
        d="M 72,21 Q 72,24 75,24 Q 72,24 72,27 Q 72,24 69,24 Q 72,24 72,21 Z"
        fill="#FFFFFF"
        className="animate-framework-sparkle"
      />

      {!hideText && (
        <text
          x="105"
          y="72"
          fontFamily="'Plus Jakarta Sans', 'Outfit', system-ui, sans-serif"
          fontWeight="800"
          fontSize="64"
          fill="url(#oai-text-grad)"
          letterSpacing="1"
        >
          AI
        </text>
      )}
    </svg>
  );
};

/**
 * OrchestrAI Lead Academy Brand Header Component.
 * Features the official OrchestrAI Framework emblem + "OrchestrAI" title + "LEAD ACADEMY" application subtitle.
 */
export const OrchestrAIBrandHeader: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <OrchestrAILogoIcon className="h-9 sm:h-10 w-auto" />
      <div className="flex flex-col leading-none">
        <div className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
          Orchestr<span className="bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">AI</span>
        </div>
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)] mt-1">
          Lead Academy
        </div>
      </div>
    </div>
  );
};

/**
 * Full Vertical OrchestrAI Framework Logo (Icon + OrchestrAI + Tagline + Lead Academy badge)
 */
export const OrchestrAILogoFull: React.FC<{ className?: string }> = ({ className = "h-24 w-auto" }) => {
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <OrchestrAILogoIcon className="h-16 w-auto mb-2" />
      <div className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
        Orchestr<span className="bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">AI</span>
      </div>
      <div className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[var(--text-secondary)] mt-1">
        AI AGENTS WORKING IN HARMONY
      </div>
      <div className="mt-2 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/20">
        Lead Academy Certification
      </div>
    </div>
  );
};
