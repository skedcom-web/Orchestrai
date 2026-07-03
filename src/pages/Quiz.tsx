import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HelpCircle, AlertCircle, CheckCircle, ArrowRight, RotateCcw, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Question {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
  studyTip: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "In the OrchestrAI paradigm shift, how should a Lead view their primary professional role?",
    options: [
      "A developer who writes high-quality code manually",
      "An architect who orchestrates intent through complete briefs and prompts",
      "A project manager who tracks tickets and schedules meetings",
      "A QA tester who checks final code features"
    ],
    correctIndex: 1,
    studyTip: "Re-read Module 1.1 (The Mindset Shift): 'Welcome to the OrchestrAI Lead Certification... you will no longer think of yourself as a developer who writes code - you will think of yourself as an architect who orchestrates intent.'"
  },
  {
    id: 2,
    text: "For a less to medium complex workflow, what is the realistic timeframe to go from a blank page to a production-grade baseline using OrchestrAI?",
    options: [
      "Days",
      "Weeks",
      "Months",
      "Years"
    ],
    correctIndex: 0,
    studyTip: "Re-read Module 1.1 (Mindset): A less to medium complex workflow baseline can be achieved in a matter of days (e.g. the 7-day benchmark for an Issue Tracker baseline), whereas traditional approaches take weeks or months."
  },
  {
    id: 3,
    text: "According to the OrchestrAI Core Principles, who is the 'Primary Builder' responsible for writing code, database schemas, and unit tests?",
    options: [
      "The Solution Architect",
      "The OrchestrAI Lead",
      "The AI Engine",
      "The Reviewer / QA Engineer"
    ],
    correctIndex: 2,
    studyTip: "Re-read Module 2.1 (Six Core Principles): 'The AI engine writes all code, APIs, database schemas... The Lead never writes code themselves.'"
  },
  {
    id: 4,
    text: "Which of the following describes the Six-Stage Lifecycle Loop in the correct sequence?",
    options: [
      "Intent → Orchestrate → Generate → Validate → Evolve → Deploy",
      "Orchestrate → Intent → Generate → Validate → Deploy → Evolve",
      "Intent → Generate → Orchestrate → Evolve → Validate → Deploy",
      "Orchestrate → Generate → Intent → Validate → Deploy → Evolve"
    ],
    correctIndex: 0,
    studyTip: "Re-read Module 2.2 (The Six-Stage Lifecycle Loop): The lifecycle loop moves continuously from Intent to Orchestrate, Generate, Validate, Evolve, and Deploy."
  },
  {
    id: 5,
    text: "Why does the OrchestrAI Lead never write code manually, even for a quick fix?",
    options: [
      "Because they do not know how to code in modern languages",
      "Because it breaks the single source of truth (prompts) and compromises maintainability and auditability",
      "Because the client has forbidden human coding in the contract",
      "Because manual code edits trigger automated database wipes"
    ],
    correctIndex: 1,
    studyTip: "Re-read Module 2.1 (Core Principles): 'Why does the Lead never write code manually? It breaks the single source of truth (prompts) and compromises auditability.'"
  },
  {
    id: 6,
    text: "Which core principle states that security, guardrails, and logging must be defined as constraints on Day 1?",
    options: [
      "AI as Primary Builder",
      "Human as Orchestrator",
      "Instant Iteration",
      "Quality by Design"
    ],
    correctIndex: 3,
    studyTip: "Re-read Module 2.1 (Core Principles): 'Quality by Design: Security and logging are specified as constraints on Day 1.'"
  }
];

export const Quiz: React.FC = () => {
  const { currentUser, updateUserProfile, recordQuizScore } = useApp();
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const navigate = useNavigate();

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Access Denied</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-6">
          Please log in to start the Module 1&amp;2 knowledge challenge quiz.
        </p>
      </div>
    );
  }

  const handleSelect = (questionId: number, optionIndex: number) => {
    if (submitted) return;
    setAnswers({
      ...answers,
      [questionId]: optionIndex
    });
  };

  const handleSubmit = () => {
    let correctCount = 0;
    QUESTIONS.forEach((q) => {
      if (answers[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const finalScore = (correctCount / QUESTIONS.length) * 100;
    setScore(finalScore);
    setSubmitted(true);

    // Record the score into the XP engine (awards the pass bonus once, on first ≥80%).
    recordQuizScore(2, finalScore);

    if (finalScore >= 80) {
      updateUserProfile(currentUser.uid, { quizPassed: true });
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  const isAllAnswered = QUESTIONS.every((q) => answers[q.id] !== undefined);
  const passed = score >= 80;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Quiz Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-xs font-semibold mb-4">
          <HelpCircle className="h-4 w-4" />
          <span>Knowledge Check Gate</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">Module 1&amp;2 Knowledge Challenge</h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-lg">
          Answer the questions below to prove your comprehension of the OrchestrAI framework. A minimum score of 80% is required.
        </p>
      </div>

      {/* Main Container */}
      <div className="glass-card rounded-xl p-6 sm:p-8">
        
        {!submitted ? (
          /* Quiz Questions Interface */
          <div className="space-y-8">
            {QUESTIONS.map((q, idx) => (
              <div key={q.id} className="space-y-3">
                <h4 className="text-sm font-bold leading-relaxed text-[var(--text-primary)]">
                  {idx + 1}. {q.text}
                </h4>
                <div className="grid grid-cols-1 gap-2.5">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = answers[q.id] === oIdx;
                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelect(q.id, oIdx)}
                        className={`w-full text-left p-3.5 rounded-lg border text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-indigo-500/10 dark:bg-indigo-500/25 border-indigo-500 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/15'
                            : 'bg-slate-500/5 border-[var(--border-color)] hover:border-slate-500/25 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-[var(--border-color)]">
              <button
                onClick={handleSubmit}
                disabled={!isAllAnswered}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-500/20 disabled:to-slate-500/20 text-white rounded-lg text-sm font-bold shadow transition-all disabled:cursor-not-allowed"
              >
                Submit Answers
              </button>
            </div>
          </div>
        ) : (
          /* Quiz Results Overlay */
          <div className="flex flex-col items-center py-6 text-center max-w-xl mx-auto">
            {passed ? (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4 animate-bounce">
                <CheckCircle className="h-8 w-8" />
              </div>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mb-4 animate-pulse">
                <AlertCircle className="h-8 w-8" />
              </div>
            )}

            <h3 className="text-xl font-bold mb-1">
              {passed ? 'Congratulations! You Passed' : 'Assessment Incomplete'}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-6">
              You scored <span className="font-bold text-[var(--text-primary)]">{score}%</span> ({(score / 100) * QUESTIONS.length}/{QUESTIONS.length} correct)
            </p>

            {/* Smart Study Guide Loop for failures */}
            {!passed && (
              <div className="w-full bg-red-500/5 border border-red-500/15 rounded-lg p-5 text-left mb-8 space-y-4">
                <h4 className="text-xs font-bold text-red-400 flex items-center space-x-1.5 uppercase tracking-wider">
                  <BookOpen className="h-4 w-4" />
                  <span>Personalized Study Guide</span>
                </h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed border-b border-[var(--border-color)] pb-3">
                  Please review the recommended modules below and attempt the check again.
                </p>

                <div className="space-y-3.5 divide-y divide-[var(--border-color)]/30">
                  {QUESTIONS.map((q, idx) => {
                    const isCorrect = answers[q.id] === q.correctIndex;
                    if (isCorrect) return null;
                    return (
                      <div key={q.id} className="pt-3 first:pt-0">
                        <p className="text-xs font-bold text-[var(--text-primary)]">
                          Question {idx + 1}: Wrong Answer
                        </p>
                        <p className="text-[11px] text-red-400 mt-0.5 leading-relaxed font-semibold italic">
                          📚 {q.studyTip}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row w-full space-y-2 sm:space-y-0 sm:space-x-3 justify-center pt-2">
              {passed ? (
                <button
                  onClick={() => navigate('/payment')}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg text-xs font-semibold shadow transition-all flex items-center justify-center space-x-1"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleRetry}
                  className="px-6 py-2.5 border border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-400 rounded-lg text-xs font-semibold transition-all flex items-center justify-center space-x-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Try Again</span>
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
