import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get } from 'firebase/database';
import { useApp } from '../context/AppContext';
import { Award, Lock, CheckCircle, Clock, Download, AlertTriangle, ArrowRight } from 'lucide-react';
import { getFirebaseDb } from '../firebase';
import { CertFeedbackGate } from './FeedbackForm';

interface Certification {
  capstoneId: string;
  capstoneTitle: string;
  capstoneDomain: string;
  total: number;
  decision: 'outstanding' | 'pass';
  certifiedAt: number;
  certifiedByName: string;
  learnerName: string;
  learnerEmail: string;
  feedback?: { strengths?: string; gaps?: string };
  status: string;
}

/** Apply {{placeholder}} substitutions to a custom HTML template string. */
const applyPlaceholders = (template: string, c: Certification): string => {
  const certDate = new Date(c.certifiedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  const certNumber = `CERT-${c.capstoneId.toUpperCase()}-${c.certifiedAt.toString().slice(-6)}`;
  const verificationUrl = `https://vthinkorchestrai-academy.web.app/certification`;

  return template
    .replace(/\{\{learnerName\}\}/g, c.learnerName)
    .replace(/\{\{capstoneId\}\}/g, c.capstoneId)
    .replace(/\{\{capstoneTitle\}\}/g, c.capstoneTitle)
    .replace(/\{\{capstoneDomain\}\}/g, c.capstoneDomain)
    .replace(/\{\{decision\}\}/g, c.decision.toUpperCase())
    .replace(/\{\{total\}\}/g, String(c.total))
    .replace(/\{\{certifiedAt\}\}/g, certDate)
    .replace(/\{\{certifiedByName\}\}/g, c.certifiedByName)
    .replace(/\{\{ribbonLabel\}\}/g, c.decision === 'outstanding' ? 'OUTSTANDING' : 'CERTIFIED')
    // Support the new placeholders in the uploaded template
    .replace(/\{\{certificationName\}\}/g, "OrchestrAI Lead Certification")
    .replace(/\{\{level\}\}/g, "LEAD")
    .replace(/\{\{certificateNumber\}\}/g, certNumber)
    .replace(/\{\{issuedDate\}\}/g, certDate)
    .replace(/\{\{verificationUrl\}\}/g, verificationUrl);
};

const buildCertHtml = (c: Certification) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>OrchestrAI Lead Certification — ${c.capstoneId}</title>
<style>
  @page { size: A4 landscape; margin: 0; }
  body { font-family: 'Segoe UI', Inter, sans-serif; margin: 0; background: #f6f5ff; color: #1c1c2e; }
  .cert { width: 1100px; max-width: 100%; margin: 40px auto; padding: 60px 80px;
          background: white; border: 14px solid transparent;
          background-image: linear-gradient(white,white), linear-gradient(135deg,#6366f1,#9333ea);
          background-origin: border-box; background-clip: padding-box, border-box;
          box-shadow: 0 20px 60px rgba(99,102,241,.15); position: relative; }
  .ribbon { position: absolute; top: -2px; right: 60px; padding: 8px 16px;
            background: linear-gradient(135deg,#6366f1,#9333ea); color: white;
            font-weight: 800; letter-spacing: .15em; font-size: 11px; border-radius: 0 0 8px 8px; }
  h1 { text-align: center; font-size: 38px; margin: 16px 0 8px; letter-spacing: .04em;
       background: linear-gradient(135deg,#6366f1,#9333ea); -webkit-background-clip: text;
       background-clip: text; color: transparent; }
  .subtitle { text-align: center; color: #555; font-size: 13px; letter-spacing: .15em;
              text-transform: uppercase; margin-bottom: 40px; }
  .awarded-to { text-align: center; color: #666; font-size: 14px; margin: 30px 0 6px; }
  .name { text-align: center; font-size: 48px; font-weight: 800; color: #1c1c2e; margin: 8px 0; }
  .for-completing { text-align: center; color: #666; font-size: 14px; margin: 30px 0 8px; }
  .capstone { text-align: center; font-size: 22px; font-weight: 700; color: #4f46e5; margin: 4px 0 8px; }
  .domain { text-align: center; color: #888; font-size: 12px; letter-spacing: .12em;
            text-transform: uppercase; margin-bottom: 36px; }
  .decision-row { display: flex; justify-content: center; gap: 60px; margin: 30px 0; }
  .stat { text-align: center; }
  .stat-label { color: #888; font-size: 11px; letter-spacing: .15em;
                text-transform: uppercase; margin-bottom: 6px; }
  .stat-value { font-size: 32px; font-weight: 800;
                background: linear-gradient(135deg,#6366f1,#9333ea); -webkit-background-clip: text;
                background-clip: text; color: transparent; }
  .signatures { display: flex; justify-content: space-between; align-items: flex-end;
                margin-top: 60px; padding-top: 24px; border-top: 1px solid #e5e5ef; }
  .sig { text-align: center; flex: 1; }
  .sig-line { border-top: 2px solid #1c1c2e; width: 200px; margin: 0 auto 6px; }
  .sig-name { font-weight: 700; font-size: 13px; }
  .sig-role { color: #888; font-size: 11px; margin-top: 2px; }
  .footer { text-align: center; color: #aaa; font-size: 11px; margin-top: 24px;
            letter-spacing: .1em; text-transform: uppercase; }
  @media print { body { background: white; } .cert { box-shadow: none; margin: 0; } }
</style>
</head>
<body>
<div class="cert">
  <div class="ribbon">${c.decision === 'outstanding' ? 'OUTSTANDING' : 'CERTIFIED'}</div>
  <div class="subtitle">vThink Technologies · OrchestrAI Academy</div>
  <h1>OrchestrAI Lead Certification</h1>
  <div class="awarded-to">This certifies that</div>
  <div class="name">${c.learnerName}</div>
  <div class="for-completing">has successfully built and shipped the capstone</div>
  <div class="capstone">${c.capstoneId} · ${c.capstoneTitle}</div>
  <div class="domain">${c.capstoneDomain}</div>
  <div class="decision-row">
    <div class="stat"><div class="stat-label">Decision</div><div class="stat-value">${c.decision.toUpperCase()}</div></div>
    <div class="stat"><div class="stat-label">Score</div><div class="stat-value">${c.total}/100</div></div>
    <div class="stat"><div class="stat-label">Issued</div><div class="stat-value" style="font-size:18px;font-weight:600;">${new Date(c.certifiedAt).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'})}</div></div>
  </div>
  <div class="signatures">
    <div class="sig"><div class="sig-line"></div><div class="sig-name">${c.certifiedByName}</div><div class="sig-role">OrchestrAI Academy · Issuing Authority</div></div>
    <div class="sig"><div class="sig-line"></div><div class="sig-name">Sithanandham R · Founder</div><div class="sig-role">vThink Technologies</div></div>
  </div>
  <div class="footer">${c.capstoneId} · Verify at vthinkorchestrai-academy.web.app/certification</div>
</div>
</body>
</html>`;

export const Certification: React.FC = () => {
  const { currentUser, systemConfig } = useApp();
  const navigate = useNavigate();
  const [myCerts, setMyCerts] = useState<Certification[]>([]);
  const [certsLoading, setCertsLoading] = useState(true);

  const [selection, setSelection] = useState<any | null>(null);
  const [submission, setSubmission] = useState<any | null>(null);
  const [review, setReview] = useState<any | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [certFeedbackDone, setCertFeedbackDone] = useState<boolean | null>(null); // null = loading

  useEffect(() => {
    if (!currentUser?.uid) {
      setCertsLoading(false);
      setLoadingStatus(false);
      return;
    }
    const uid = currentUser.uid;
    const db = getFirebaseDb();
    if (!db) {
      setCertsLoading(false);
      setLoadingStatus(false);
      return;
    }

    // 1. Fetch user certifications
    get(ref(db, `certifications/${uid}`))
      .then((snap) => {
        if (snap.exists()) {
          const list = Object.values(snap.val()) as Certification[];
          list.sort((a, b) => (b.certifiedAt || 0) - (a.certifiedAt || 0));
          setMyCerts(list);
        }
      })
      .catch((e) => console.error('[Certification] certs fetch failed:', e))
      .finally(() => setCertsLoading(false));

    // 2. Fetch locked capstone selection, submission and review data
    const loadCapstoneStatus = async () => {
      try {
        const selSnap = await get(ref(db, `capstoneSelections/${uid}`));
        if (selSnap.exists()) {
          const selVal = selSnap.val();
          setSelection(selVal);
          const capId = selVal.capstoneId;

          const [subSnap, revSnap] = await Promise.all([
            get(ref(db, `submissions/${uid}/${capId}`)),
            get(ref(db, `reviews/${uid}_${capId}`))
          ]);

          if (subSnap.exists()) setSubmission(subSnap.val());
          if (revSnap.exists()) setReview(revSnap.val());
        }
      } catch (err) {
        console.error('[Certification] Failed to load capstone status:', err);
      } finally {
        setLoadingStatus(false);
      }
    };

    loadCapstoneStatus();

    // Check if cert feedback already submitted
    get(ref(db, `feedback/cert_feedback/${uid}`))
      .then((snap) => {
        if (snap.exists() && !snap.val().isDraft) {
          setCertFeedbackDone(true);
        } else {
          setCertFeedbackDone(false);
        }
      })
      .catch(() => setCertFeedbackDone(false));
  }, [currentUser?.uid]);

  const downloadCert = (c: Certification) => {
    const customTemplate = systemConfig?.certificateTemplate;
    const html = customTemplate
      ? applyPlaceholders(customTemplate, c)
      : buildCertHtml(c);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OrchestrAI_Certificate_${c.capstoneId}_${c.learnerName.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <Award className="h-12 w-12 text-slate-500/30 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Access Denied</h3>
        <p className="text-sm text-[var(--text-secondary)]">Please login first.</p>
      </div>
    );
  }

  const isApproved = currentUser.accountStatus === 'APPROVED';



  // Syllabus details for approved candidates
  const gatedModules = [
    { id: 3, title: 'Module 3: The OrchestrAI Bible — Governance-First Setup', desc: 'Establish OGE (Observability · Guardrails · Evaluation) and the two master prompts (T1 + T2). Walk the 5 design documents that produced the live Issue Tracker.' },
    { id: 4, title: 'Module 4: Foundation Build — Auth, Shell, Dashboard', desc: 'Day 1–3 of the build. The 6 manual installs, the 8-component auth prompt, the application shell honouring UI Specs, the indexed dashboard.' },
    { id: 5, title: 'Module 5: The Workflow Engine — Issues, Status, Comments, Git', desc: 'Day 4–5 of the build. The 16-transition status matrix, the structured workflow prompt, surgical re-prompts, Git discipline (commit per validated component).' },
    { id: 6, title: 'Module 6: Admin, Reports, Going Live — Capstone & GitHub Submission', desc: 'Day 6–7 of the build. Admin surfaces with RBAC, Reports with Excel + PDF export, QA + UAT co-working, README + DESIGN polish, GitHub push for review.' },
    { id: 7, title: 'Module 7: Practical Demo — Your Capstone Build', desc: 'The final stage. Apply Modules 1–6 to your own application in your domain. Submit your GitHub repository for certification review. (Content shipping in a future release.)' }
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      
      {!isApproved ? (
        /* Gated Access Block */
        <div className="mx-auto max-w-md py-16 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 mb-4 animate-pulse">
            <Lock className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-bold mb-2">Certification Track Gated</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
            Your account is currently locked. To unlock the syllabus reading, submission dashboards, and your certificate, please complete the Module 2 quiz and submit the accountability payment.
          </p>
        </div>
      ) : (
        /* Approved Certified Candidates Area */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Unlocked Syllabus Contents (Left Side) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="border-b border-[var(--border-color)] pb-3">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Lead Certification Curriculum</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Explore the unlocked advanced training materials.</p>
            </div>

            <div className="space-y-4">
              {gatedModules.map(mod => (
                <div key={mod.id} className="glass-card rounded-xl p-5 border-emerald-500/10 hover:border-emerald-500/25 transition-all">
                  <div className="flex items-center space-x-2 mb-2 text-emerald-400">
                    <CheckCircle className="h-4.5 w-4.5" />
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">{mod.title}</h4>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed ml-6">{mod.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Submission and Credentials Desk (Right Side) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="border-b border-[var(--border-color)] pb-3">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Certification Desk</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Track your locked capstone and view credentials.</p>
            </div>

            {loadingStatus || certsLoading || certFeedbackDone === null ? (
              <div className="glass-card rounded-xl p-6 text-center text-xs text-[var(--text-secondary)] animate-pulse">
                Loading capstone status details…
              </div>
            ) : myCerts.length > 0 && !certFeedbackDone ? (
              // Mandatory cert feedback gate
              <CertFeedbackGate onCompleted={() => setCertFeedbackDone(true)} />
            ) : myCerts.length > 0 ? (
              <div className="space-y-4">
                {myCerts.map((cert) => (
                  <div key={cert.capstoneId} className="relative glass-card rounded-xl p-5 border-emerald-500/25 overflow-hidden bg-gradient-to-b from-emerald-500/5 to-transparent animate-in fade-in duration-200">
                    <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-400 to-indigo-500" />
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {cert.decision.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-[var(--text-secondary)]">
                        {new Date(cert.certifiedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="text-sm font-extrabold text-[var(--text-primary)] mb-1">
                      {cert.capstoneId} · {cert.capstoneTitle}
                    </h4>
                    <p className="text-[11px] text-[var(--text-secondary)] mb-3 leading-relaxed">
                      Certified as OrchestrAI Lead in {cert.capstoneDomain} domain.
                    </p>

                    <div className="grid grid-cols-2 gap-2 border-y border-[var(--border-color)] py-2 mb-4 text-xs">
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] block mb-0.5">Score</span>
                        <strong className="text-emerald-400 text-sm">{cert.total}/100</strong>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-[var(--text-secondary)] block mb-0.5">Certified By</span>
                        <strong className="text-[var(--text-primary)] truncate block">{cert.certifiedByName}</strong>
                      </div>
                    </div>

                    {cert.feedback && (
                      <div className="text-[11px] text-[var(--text-secondary)] space-y-2 mb-4 p-2.5 rounded-lg bg-[var(--surface-sunken)]/40 border border-[var(--border-color)] text-left">
                        {cert.feedback.strengths && (
                          <div>
                            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block mb-0.5">Strengths</span>
                            <p className="leading-snug">{cert.feedback.strengths}</p>
                          </div>
                        )}
                        {cert.feedback.gaps && (
                          <div>
                            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block mb-0.5">Areas of Improvement</span>
                            <p className="leading-snug">{cert.feedback.gaps}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => downloadCert(cert)}
                      className="w-full py-2 bg-gradient-to-r from-emerald-500 to-indigo-700 hover:brightness-110 text-white rounded-lg text-xs font-bold shadow flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" /> Download HTML Certificate
                    </button>
                  </div>
                ))}
              </div>
            ) : !selection ? (
              <div className="glass-card rounded-xl p-5 border-slate-500/10 text-center animate-in fade-in duration-200">
                <Award className="h-10 w-10 text-[var(--text-secondary)] mx-auto mb-3 opacity-30" />
                <h4 className="text-sm font-bold mb-1">No Capstone Locked</h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                  To earn your Lead Certification, lock a capstone project first, build it, and submit the deliverables.
                </p>
                <button
                  onClick={() => navigate('/capstone')}
                  className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-700 text-white rounded-lg text-xs font-bold transition-all shadow cursor-pointer"
                >
                  Browse Capstone Library
                </button>
              </div>
            ) : selection.status === 'in_progress' ? (
              <div className="glass-card rounded-xl p-5 border-indigo-500/20 bg-indigo-500/5 animate-in fade-in duration-200">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 mb-3">
                  <Clock className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1">Capstone in Progress</h4>
                <div className="text-xs text-indigo-300 font-mono mb-2">{selection.capstoneId}</div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
                  You locked <strong>{selection.capstoneTitle}</strong>. Open your workspace to follow the 5-day build guide and access document templates.
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/capstone/workspace')}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Open Workspace <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => navigate('/capstone/submit')}
                    className="w-full py-2 border border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Submit Deliverables
                  </button>
                </div>
              </div>
            ) : selection.status === 'submitted' || submission?.status === 'assigned' || submission?.status === 'in_review' || submission?.status === 'awaiting_admin_approval' ? (
              <div className="glass-card rounded-xl p-5 border-blue-500/20 bg-blue-500/5 animate-in fade-in duration-200">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 mb-3">
                  <Clock className="h-5 w-5 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <h4 className="text-sm font-bold text-blue-400 mb-1">Capstone Under Review</h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">
                  We received your submission for <strong>{selection.capstoneId}</strong>. Your assigned reviewer ({submission?.assignedReviewerName || 'Review Pool'}) is currently evaluating your repository.
                </p>
                <div className="space-y-2 text-[11px] p-2.5 rounded-lg bg-[var(--surface-sunken)]/60 border border-[var(--border-color)] text-left leading-relaxed">
                  <div><strong>GitHub:</strong> <a href={submission?.githubUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline break-all">{submission?.githubUrl}</a></div>
                  <div><strong>Live App:</strong> <a href={submission?.firebaseUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline break-all">{submission?.firebaseUrl}</a></div>
                </div>
              </div>
            ) : selection.status === 'rework_needed' || submission?.status === 'rework_requested' ? (
              <div className="glass-card rounded-xl p-5 border-rose-500/20 bg-rose-500/5 animate-in fade-in duration-200">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 mb-3">
                  <AlertTriangle className="h-5 w-5 animate-pulse" />
                </div>
                <h4 className="text-sm font-bold text-rose-400 mb-1">Rework Required</h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">
                  Your reviewer requested rework for <strong>{selection.capstoneId}</strong>. Address the comments below and resubmit.
                </p>

                {review?.feedback && (
                  <div className="text-[11px] text-[var(--text-secondary)] space-y-3 mb-4 p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-left leading-relaxed max-h-[220px] overflow-y-auto">
                    {review.feedback.strengths && (
                      <div>
                        <span className="text-[9px] font-bold text-emerald-400 uppercase block mb-0.5">Strengths</span>
                        <p>{review.feedback.strengths}</p>
                      </div>
                    )}
                    {review.feedback.gaps && (
                      <div>
                        <span className="text-[9px] font-bold text-rose-400 uppercase block mb-0.5">Gaps / Weaknesses</span>
                        <p>{review.feedback.gaps}</p>
                      </div>
                    )}
                    {review.feedback.reworkChecklist && (
                      <div className="border-t border-[var(--border-color)] pt-2 mt-2">
                        <span className="text-[9px] font-bold text-amber-400 uppercase block mb-1">Rework Checklist</span>
                        <blockquote className="bg-[var(--surface-sunken)] p-2 rounded text-[10px] font-mono whitespace-pre-wrap text-amber-300">
                          {review.feedback.reworkChecklist}
                        </blockquote>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={() => navigate('/capstone/submit')}
                  className="w-full py-2 bg-gradient-to-r from-rose-500 to-indigo-700 hover:brightness-110 text-white rounded-lg text-xs font-bold transition-all shadow cursor-pointer flex items-center justify-center gap-1"
                >
                  Resubmit Portfolio <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="glass-card rounded-xl p-5 border-slate-500/10 text-center animate-in fade-in duration-200">
                <p className="text-xs text-[var(--text-secondary)] italic">No certification data found.</p>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};
