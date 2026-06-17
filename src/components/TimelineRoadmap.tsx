import React from 'react';
import { useApp } from '../context/AppContext';
import { BookOpen, HelpCircle, CreditCard, Clock, Award, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TimelineRoadmap: React.FC = () => {
  const { currentUser } = useApp();
  const navigate = useNavigate();

  // Determine current active step index (1-5)
  let currentStep = 1;
  if (currentUser) {
    if (!currentUser.quizPassed) {
      currentStep = 2; // Prompted to complete quiz
    } else if (currentUser.accountStatus === 'FREE_TIER') {
      currentStep = 3; // Passed quiz, pending payment
    } else if (currentUser.accountStatus === 'PENDING_APPROVAL') {
      currentStep = 4; // Paid, pending admin approval
    } else if (currentUser.accountStatus === 'APPROVED') {
      currentStep = 5; // Fully approved, on certified track
    }
  }

  const steps = [
    {
      id: 1,
      name: 'Open Study',
      desc: 'Modules 1 & 2 · Free',
      icon: BookOpen,
      path: '/modules'
    },
    {
      id: 2,
      name: 'Quiz Gate',
      desc: 'Score ≥ 80%',
      icon: HelpCircle,
      path: '/modules'
    },
    {
      id: 3,
      name: 'Career Commit',
      desc: '₹99 — Accountability',
      icon: CreditCard,
      path: '/payment'
    },
    {
      id: 4,
      name: 'Build & Demo',
      desc: 'Modules 3–8 · Portfolio',
      icon: Clock,
      path: '/modules'
    },
    {
      id: 5,
      name: 'Get Hired',
      desc: 'Certified · Referred',
      icon: Award,
      path: '/certification'
    }
  ];

  return (
    <div className="w-full py-8 border-b border-[var(--border-color)] bg-slate-500/5 mb-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Timeline Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <h3 className="text-sm font-semibold tracking-wider text-indigo-500 uppercase">
            Certification Candidate Roadmap
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Track your progress through the OrchestrAI Lead gated certification workflow.
          </p>
        </div>

        {/* Steps container */}
        <div className="relative flex flex-col md:flex-row justify-between items-center md:items-start space-y-8 md:space-y-0 md:space-x-4">
          
          {/* Horizontal line for desktop view */}
          <div className="absolute top-6 left-8 right-8 h-0.5 bg-[var(--border-color)] hidden md:block z-0">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
            />
          </div>

          {steps.map((step) => {
            const StepIcon = step.icon;
            const isCompleted = step.id < currentStep;
            const isActive = step.id === currentStep;
            const isLocked = step.id > currentStep;

            return (
              <button
                key={step.id}
                onClick={() => !isLocked && navigate(step.path)}
                disabled={isLocked}
                className="relative flex flex-row md:flex-col items-center z-10 w-full md:w-auto text-left md:text-center focus:outline-none group disabled:cursor-not-allowed"
              >
                {/* Visual indicator node */}
                <div 
                  className={`flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-indigo-500 border-indigo-500 text-white shadow shadow-indigo-500/30' 
                      : isActive 
                        ? 'bg-[var(--bg-card)] border-indigo-500 text-indigo-500 scale-110 shadow-lg shadow-indigo-500/10 ring-4 ring-indigo-500/15'
                        : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-secondary)]'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <StepIcon className="h-5 w-5" />
                  )}
                </div>

                {/* Text labels */}
                <div className="ml-4 md:ml-0 md:mt-3 flex-grow">
                  <div className="flex items-center md:justify-center">
                    <span 
                      className={`text-sm font-bold tracking-tight transition-colors ${
                        isActive 
                          ? 'text-indigo-500' 
                          : isCompleted 
                            ? 'text-[var(--text-primary)]' 
                            : 'text-[var(--text-secondary)]'
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                  <p className="text-[10px] text-[var(--text-secondary)] font-medium mt-0.5 max-w-[120px] md:mx-auto">
                    {step.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
