import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, Unlock, ChevronDown, ChevronUp, CheckCircle2, Award, Zap, HelpCircle, Play, ExternalLink, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TrainingPresenter } from '../components/TrainingPresenter';
import { ModuleFeedbackModal } from './FeedbackForm';

export const GuestGateModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
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
    </div>
  );
};

export const Modules: React.FC = () => {
  const { currentUser, systemConfig, addToast, alertUser } = useApp();
  const [expandedModule, setExpandedModule] = useState<number | null>(1);
  const [activeTrainingModuleId, setActiveTrainingModuleId] = useState<number | null>(null);
  const [feedbackModuleId, setFeedbackModuleId] = useState<number | null>(null);
  const [showGuestGateModal, setShowGuestGateModal] = useState(false);
  const navigate = useNavigate();

  // Helper values to check progress
  const freeLimit = Math.max(systemConfig.freeModulesLimit ?? 2, 2);
  const isUserApproved = currentUser?.accountStatus === 'APPROVED';

  const handleLaunchModule = (moduleId: number) => {
    if (!currentUser) {
      setShowGuestGateModal(true);
      return;
    }
    
    if (moduleId === 2) {
      const hasCompletedMod1 = !!currentUser.progress?.modulesCompleted?.includes(1);
      if (!hasCompletedMod1) {
        addToast("Please complete Module 1 first before starting Module 2!", "warning");
        return;
      }
    }
    
    setActiveTrainingModuleId(moduleId);
  };

  const modulesData = [
    {
      id: 1,
      title: 'Module 1: The OrchestrAI Mindset',
      duration: '4 hours',
      desc: 'Understand traditional engineering gaps, the orchestration paradigm shift, and the core competencies of an OrchestrAI Lead.',
      content: (
        <div className="py-6 text-center max-w-xl mx-auto space-y-4">
          <Award className="h-12 w-12 text-indigo-500 mx-auto animate-bounce" />
          <h4 className="text-lg font-bold text-[var(--text-primary)]">Module 1: The OrchestrAI Mindset</h4>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Understand traditional engineering gaps, the orchestration paradigm shift, and the core competencies of an OrchestrAI Lead. This module includes an interactive web-deck with AI avatar voiceover and concludes with a Prompt Simulator lab.
          </p>
          <button
            onClick={() => handleLaunchModule(1)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-xs font-extrabold shadow-lg hover:scale-103 hover:brightness-110 transition-all cursor-pointer"
          >
            <Play className="h-4 w-4" /> Launch Interactive Training (Web-Deck &amp; Lab)
          </button>
        </div>
      )
    },
    {
      id: 2,
      title: 'Module 2: The OrchestrAI Framework Architecture',
      duration: '5 hours',
      desc: 'Dive into the 6 Core Principles and map the 6-stage lifecycle loop (Intent, Orchestrate, Generate, Validate, Evolve, Deploy).',
      content: (
        <div className="space-y-6 text-sm text-[var(--text-secondary)] leading-relaxed">
          <div>
            <h4 className="text-base font-bold text-[var(--text-primary)] mb-2">2.1 The Six Core Principles</h4>
            <p className="mb-3">
              These six principles govern all OrchestrAI projects:
            </p>
            <ol className="list-decimal list-inside space-y-2.5 ml-2 font-medium">
              <li><strong className="text-[var(--text-primary)]">AI as Primary Builder:</strong> The AI engine writes all code, schemas, and tests. The Lead never codes.</li>
              <li><strong className="text-[var(--text-primary)]">Human as Orchestrator:</strong> Humans make all decisions, constraints, and approvals.</li>
              <li><strong className="text-[var(--text-primary)]">Plain-English Driven:</strong> Conversational, precise specifications instead of dry architecture files.</li>
              <li><strong className="text-[var(--text-primary)]">Continuous Delivery:</strong> Sprints are replaced by constant feature deployments.</li>
              <li><strong className="text-[var(--text-primary)]">Instant Iteration:</strong> Gaps identified are refined in hours, not next week.</li>
              <li><strong className="text-[var(--text-primary)]">Quality by Design:</strong> Security and logging are specified as constraints on Day 1.</li>
            </ol>
          </div>

          <div>
            <h4 className="text-base font-bold text-[var(--text-primary)] mb-2">2.2 The Six-Stage Lifecycle Loop</h4>
            <div className="flex justify-center my-4 font-bold text-xs bg-slate-500/5 py-3 rounded-lg border border-[var(--border-color)]">
              <span className="text-indigo-400">INTENT</span>
              <span className="mx-2 text-[var(--text-secondary)]">→</span>
              <span className="text-cyan-400">ORCHESTRATE</span>
              <span className="mx-2 text-[var(--text-secondary)]">→</span>
              <span className="text-purple-400">GENERATE</span>
              <span className="mx-2 text-[var(--text-secondary)]">→</span>
              <span className="text-emerald-400">VALIDATE</span>
              <span className="mx-2 text-[var(--text-secondary)]">→</span>
              <span className="text-indigo-400">EVOLVE</span>
              <span className="mx-2 text-[var(--text-secondary)]">→</span>
              <span className="text-cyan-400">DEPLOY</span>
            </div>
            <p className="mb-2">
              The loop is continuous. After deploying, user feedback immediately re-enters as new Intent.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-grow border border-indigo-500/20 bg-indigo-500/5 rounded-lg p-4 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-indigo-400 mb-1 flex items-center space-x-1.5">
                  <Play className="h-4 w-4" />
                  <span>Module 2 Slide Training</span>
                </h4>
                <p className="text-xs text-[var(--text-secondary)] mb-3 leading-relaxed">
                  Review the 6 Core Principles and understand the 6-stage lifecycle loop using the interactive web-deck.
                </p>
              </div>
              <button
                onClick={() => handleLaunchModule(2)}
                className="w-full sm:w-auto self-start px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold shadow transition-all flex items-center justify-center space-x-1 cursor-pointer"
              >
                <Play className="h-3.5 w-3.5" />
                <span>Launch Slide Deck</span>
              </button>
            </div>

            <div className="flex-grow border border-indigo-500/20 bg-indigo-500/5 rounded-lg p-4 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-indigo-400 mb-1 flex items-center space-x-1.5">
                  <Zap className="h-4 w-4" />
                  <span>Module 3 Gate Challenge</span>
                </h4>
                <p className="text-xs text-[var(--text-secondary)] mb-3 leading-relaxed">
                  Before moving to Modules 3-8, you must pass the Module 1&amp;2 quiz with a score of 80% or higher.
                </p>
              </div>
              <button
                onClick={() => {
                  if (!currentUser) {
                    addToast("Please log in first to record your quiz progress!", "warning");
                  } else {
                    navigate('/quiz');
                  }
                }}
                className="w-full sm:w-auto self-start px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded text-xs font-bold shadow transition-all flex items-center justify-center space-x-1"
              >
                <HelpCircle className="h-4 w-4" />
                <span>Launch Quiz Challenge</span>
              </button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: 'Module 3: The OrchestrAI Bible — Governance-First Setup',
      duration: '1 hour',
      desc: 'Establish OGE (Observability · Guardrails · Evaluation) as your framework spine. Master the two reusable master prompts (T1 + T2). See the 5 design documents — FDD, TDD, DB Design, UI Specs, Test Plan — that produced the live Issue Tracker.',
      content: null
    },
    {
      id: 4,
      title: 'Module 4: Foundation Build — Auth, Shell, Dashboard',
      duration: '1 hour',
      desc: 'Day 1–3 of the 7-day Issue Tracker build. 6 manual installs you do yourself, the 8-component auth prompt, the application shell honouring UI Specs, the dashboard with indexed queries. Hands-on with the live build at the end.',
      content: null
    },
    {
      id: 5,
      title: 'Module 5: The Workflow Engine — Issues, Status, Comments, Git',
      duration: '1 hour',
      desc: 'Day 4–5 of the build. The 16-transition status matrix. The structured workflow prompt (Marker pillar in action). Comments + secure attachments. Surgical re-prompts. Git workflow: commit per validated component, end-of-day push.',
      content: null
    },
    {
      id: 6,
      title: 'Module 6: Admin, Reports, Going Live — Capstone & GitHub Submission',
      duration: '1 hour',
      desc: 'Day 6–7 of the build. Admin surfaces (Project/Employee/User + RBAC). Reports with Excel + PDF export. QA + UAT co-working. Final repo polish — README + DESIGN.md naming OGE. Push to GitHub, share the URL — your certification submission.',
      content: null
    },
    {
      id: 7,
      title: 'Module 7: Practical Demo — Your Capstone Build',
      duration: 'Self-paced · 5 days',
      desc: 'The final stage. Pick ONE of 30 real-world capstones, build it end-to-end in 5 days using everything from Modules 1–6, deploy to Firebase, and submit your GitHub repository for certification review.',
      content: null
    }
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Page Header */}
      <div className="flex flex-col items-center text-center mb-10">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-xs font-semibold mb-4">
          <Award className="h-4 w-4" />
          <span>7 Certification Modules</span>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight mb-2">Training Content & Syllabus</h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-xl">
          Expand the headers to read. Modules beyond your access level are gated by quiz score, fee payment, and admin approval.
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-4">
        {modulesData.map((mod) => {
          // Check if this module is locked for this user
          // Module 1 is never locked (but guest is prompted to login)
          // Module 2 is locked if they haven't completed Module 1
          // Module 3+ is locked if they haven't been approved
          const hasCompletedMod1 = !!currentUser?.progress?.modulesCompleted?.includes(1);
          const isModuleLocked =
            mod.id === 2 ? !hasCompletedMod1 :
            mod.id > freeLimit ? !isUserApproved : false;
          const isExpanded = expandedModule === mod.id;

          return (
            <div 
              key={mod.id} 
              className={`glass-card rounded-xl overflow-hidden transition-all ${
                isModuleLocked 
                  ? 'opacity-75 border-slate-500/10' 
                  : isExpanded 
                    ? 'border-indigo-500/20 shadow-md shadow-indigo-500/5' 
                    : 'hover:border-slate-500/20'
              }`}
            >
              
              {/* Module Accordion Header */}
              <button
                onClick={() => {
                  if (isModuleLocked) {
                    setExpandedModule(mod.id);
                  } else {
                    setExpandedModule(isExpanded ? null : mod.id);
                  }
                }}
                className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
              >
                <div className="flex items-center space-x-3.5 pr-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${
                    isModuleLocked 
                      ? 'bg-slate-500/5 border-[var(--border-color)] text-[var(--text-secondary)]' 
                      : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500'
                  }`}>
                    {isModuleLocked ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <Unlock className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold tracking-tight text-[var(--text-primary)]">{mod.title}</h3>
                    <p className="text-[11px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider">{mod.duration}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {isModuleLocked && (
                    <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full border border-yellow-500/20 bg-yellow-500/5 text-yellow-500 text-[10px] font-bold uppercase tracking-wider">
                      Gated Access
                    </span>
                  )}
                  {isExpanded ? <ChevronUp className="h-5 w-5 text-[var(--text-secondary)]" /> : <ChevronDown className="h-5 w-5 text-[var(--text-secondary)]" />}
                </div>
              </button>

              {/* Module Accordion Body */}
              {isExpanded && (
                <div className="px-5 pb-6 pt-2 border-t border-[var(--border-color)] bg-slate-500/5">
                  {isModuleLocked ? (
                    /* Locked Gate Barrier UI */
                    <div className="py-6 text-center max-w-md mx-auto">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 mb-4 animate-bounce">
                        <Lock className="h-5 w-5" />
                      </div>
                      
                      {mod.id === 2 ? (
                        <>
                          <h4 className="text-base font-bold mb-2">Module 2 is Locked</h4>
                          <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-6">
                            {!currentUser 
                              ? "Module 2 is free, but to track your progress and feedback please register and login, and complete Module 1 so that Module 2 opens for you!"
                              : "Please complete Module 1 first to unlock and start Module 2!"}
                          </p>
                          <div className="flex flex-col space-y-2.5">
                            {!currentUser ? (
                              <button
                                onClick={() => setShowGuestGateModal(true)}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold shadow transition-all cursor-pointer"
                              >
                                Register &amp; Login
                              </button>
                            ) : (
                              <button
                                onClick={() => setExpandedModule(1)}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold shadow transition-all cursor-pointer"
                              >
                                Go to Module 1
                              </button>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <h4 className="text-base font-bold mb-2">Module is Locked</h4>
                          <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-6">
                            Modules 3 to 8 are gated for certified track candidates. To unlock access, you must score at least 80% on the Module 2 knowledge check, pay the ₹99 accountability gate fee, and receive admin approval.
                          </p>

                          <div className="flex flex-col space-y-2.5">
                            {!currentUser ? (
                              <button
                                onClick={() => {
                                  addToast("Please log in to start your candidate certification workflow!", "warning");
                                  window.dispatchEvent(new CustomEvent('orchestrai_trigger_login'));
                                }}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold shadow transition-all cursor-pointer"
                              >
                                Sign In / Login
                              </button>
                            ) : !currentUser.quizPassed ? (
                              <button
                                onClick={() => navigate('/quiz')}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold shadow transition-all cursor-pointer"
                              >
                                Launch Knowledge Check Quiz
                              </button>
                            ) : currentUser.accountStatus === 'FREE_TIER' ? (
                              <button
                                onClick={() => navigate('/payment')}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold shadow transition-all cursor-pointer"
                              >
                                Proceed to Verify Intent (₹99)
                              </button>
                            ) : (
                              <div className="border border-indigo-500/20 bg-indigo-500/5 p-3 rounded-lg text-xs font-semibold text-indigo-400">
                                Status: PENDING_APPROVAL. Waiting for manual approval from Sithanandham R.
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    /* Unlocked Module Content */
                    mod.content || (
                      <div className="py-6 text-center max-w-xl mx-auto space-y-4">
                        <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                        <h4 className="text-base font-bold text-[var(--text-primary)]">{mod.title}</h4>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          {mod.id === 7
                            ? 'Browse 30 real-world capstones, lock one to your profile, and build it in 5 days. This is the capstone stage — you apply everything from Modules 1–6 to your own application and submit your GitHub repository for certification review.'
                            : `${mod.desc} Study slides, review the architecture briefing, and complete the requirements to prepare for certification.`}
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                          {mod.id === 7 ? (
                            <button
                              onClick={() => navigate('/capstone')}
                              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-xs font-extrabold shadow-md hover:scale-102 hover:brightness-110 transition-all"
                            >
                              <Award className="h-3.5 w-3.5" /> Browse Capstone Library (30 capstones)
                            </button>
                          ) : (
                            <button
                              onClick={() => handleLaunchModule(mod.id)}
                              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-xs font-extrabold shadow-md hover:scale-102 hover:brightness-110 transition-all cursor-pointer"
                            >
                              <Play className="h-3.5 w-3.5" /> Launch Interactive Training (Web-Deck &amp; Video)
                            </button>
                          )}
                          {systemConfig.moduleMedia?.[mod.id]?.externalLink && (
                            <a
                              href={systemConfig.moduleMedia[mod.id].externalLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-6 py-2.5 border border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-400 rounded-xl text-xs font-extrabold shadow-sm transition-all"
                            >
                              <ExternalLink className="h-3.5 w-3.5" /> External Resource Link
                            </a>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>

      {activeTrainingModuleId !== null && (
        <TrainingPresenter
          moduleId={activeTrainingModuleId}
          onClose={() => setActiveTrainingModuleId(null)}
          onComplete={() => {
            const completedId = activeTrainingModuleId;
            setActiveTrainingModuleId(null);
            // Show module feedback modal first, then alert on close
            setFeedbackModuleId(completedId);
          }}
        />
      )}

      {/* Module Feedback Modal — appears after completing a module */}
      {feedbackModuleId !== null && (
        <ModuleFeedbackModal
          moduleId={feedbackModuleId}
          onClose={() => {
            const completedId = feedbackModuleId;
            setFeedbackModuleId(null);
            const isFinal = completedId === 6;
            alertUser(
              'Module Completed!',
              isFinal
                ? 'Congratulations! You have completed all six theory modules of the OrchestrAI Lead training course! Head over to Module 7 to start your practical Capstone build.'
                : `Congratulations! You have successfully completed Module ${completedId}! Keep pushing to unlock the rest of the syllabus.`,
              'success'
            );
          }}
          onSubmitted={() => {
            const completedId = feedbackModuleId;
            setFeedbackModuleId(null);
            const isFinal = completedId === 6;
            alertUser(
              'Feedback Submitted & Module Completed! 🎉',
              isFinal
                ? 'Thank you for your feedback! You have completed all six theory modules. Head over to Module 7 to start your practical Capstone build.'
                : `Thank you! Your feedback for Module ${completedId} has been recorded. Keep going!`,
              'success'
            );
          }}
        />
      )}

      <GuestGateModal isOpen={showGuestGateModal} onClose={() => setShowGuestGateModal(false)} />
    </div>
  );
};
