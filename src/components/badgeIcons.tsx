import React from 'react';
import { Footprints, Brain, ShieldCheck, Rocket, Layers, Flame, Zap, TrendingUp, Medal } from 'lucide-react';

// Maps a BadgeDef.icon string to a lucide icon element.
export const resolveBadgeIcon = (name: string, className = 'h-5 w-5'): React.ReactNode => {
  const map: Record<string, React.ReactNode> = {
    footprints:    <Footprints className={className} />,
    brain:         <Brain className={className} />,
    'shield-check':<ShieldCheck className={className} />,
    rocket:        <Rocket className={className} />,
    layers:        <Layers className={className} />,
    flame:         <Flame className={className} />,
    zap:           <Zap className={className} />,
    'trending-up': <TrendingUp className={className} />,
  };
  return map[name] || <Medal className={className} />;
};
