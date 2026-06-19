import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Award, Lock, FileText, Send, CheckCircle, Clock, Code } from 'lucide-react';
import emailjs from '@emailjs/browser';

export const Certification: React.FC = () => {
  const { currentUser, submissions, addSubmission, systemConfig, addNotificationLog, addToast } = useApp();
  const [githubUrl, setGithubUrl] = useState('');
  const [promptUrl, setPromptUrl] = useState('');
  const [loading, setLoading] = useState(false);

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
  
  // Find user submission if any
  const userSub = submissions.find(s => s.userId === currentUser.uid);

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl || !promptUrl) return;

    setLoading(true);
    addSubmission(githubUrl, promptUrl);

    // Trigger email alert to admin
    const config = systemConfig;
    const template = config.templates.project_submitted;

    const emailBody = template.body
      .replace(/{{name}}/g, currentUser.name)
      .replace(/{{email}}/g, currentUser.email)
      .replace(/{{githubRepoUrl}}/g, githubUrl)
      .replace(/{{promptLogUrl}}/g, promptUrl);

    const emailSubject = template.subject
      .replace(/{{name}}/g, currentUser.name)
      .replace(/{{email}}/g, currentUser.email);

    const hasKeys = config.emailjsServiceId && config.emailjsTemplateId && config.emailjsPublicKey;

    if (hasKeys) {
      try {
        await emailjs.send(
          config.emailjsServiceId,
          config.emailjsTemplateId,
          {
            to_email: config.adminEmail,
            subject: emailSubject,
            message: emailBody
          },
          config.emailjsPublicKey
        );

        addNotificationLog({
          type: 'Project Submission Alert',
          recipient: config.adminEmail,
          subject: emailSubject,
          channel: 'EmailJS API',
          status: 'Sent'
        });
      } catch (err) {
        addNotificationLog({
          type: 'Project Submission Alert',
          recipient: config.adminEmail,
          subject: emailSubject,
          channel: 'EmailJS API',
          status: 'Failed'
        });
      }
    } else {
      addNotificationLog({
        type: 'Project Submission Alert (Mocked)',
        recipient: config.adminEmail,
        subject: emailSubject,
        channel: 'EmailJS API (Simulated)',
        status: 'Sent'
      });
    }

    setLoading(false);
    setGithubUrl('');
    setPromptUrl('');
    addToast("Project submitted successfully! Sithanandham R. will review and score your repository shortly.", "success");
  };

  // Syllabus details for approved candidates
  const gatedModules = [
    { id: 3, title: 'Module 3: Intent Mastery — The Art of the Perfect Prompt', desc: 'Study structural variables, outcome criteria, and constraint matrix patterns to write deterministic prompts.' },
    { id: 4, title: 'Module 4: Roles, Governance & Stakeholder Management', desc: 'Define roles (Lead, SME, Reviewer, Stakeholders) and manage client expectations on delivery speeds.' },
    { id: 5, title: 'Module 5: Running a Live OrchestrAI Iteration', desc: 'Execute live validation checklists and handle prompt drift using the Escalation Decision Matrix.' },
    { id: 6, title: 'Module 6: Observability — Making AI Work Visible', desc: 'Implement structured prompt logging registries and enforce commit-by-component version control discipline.' },
    { id: 7, title: 'Module 7: Guardrails — Keeping AI Within Boundaries', desc: 'Design security validation rules (OWASP) and sanitize access protocols before deployment.' },
    { id: 8, title: 'Module 8: Evaluation, KPIs & Client Leadership', desc: 'Track TTFWV, Defect Escape Rate, and X-Factor metrics. Scale patterns via pilot-to-scale programs.' }
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
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Submit code review details and access certificates.</p>
            </div>

            {/* Certificate display card if Certified / Hire Eligible */}
            {userSub && (userSub.status === 'CERTIFIED' || userSub.status === 'HIRE_ELIGIBLE') ? (
              <div className="relative glass-card rounded-xl p-6 border-indigo-500/20 text-center overflow-hidden bg-gradient-to-b from-slate-900/40 to-slate-950/40">
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600" />
                
                {/* Visual Seal Emblem */}
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 mb-4">
                  <Award className="h-7 w-7 animate-pulse-slow" />
                </div>

                <h4 className="text-xs font-extrabold text-indigo-400 uppercase tracking-widest">
                  OrchestrAI Lead Credential
                </h4>
                <div className="text-base font-extrabold text-[var(--text-primary)] mt-1.5 leading-tight">
                  {currentUser.name}
                </div>
                <p className="text-[10px] text-[var(--text-secondary)] mt-1 leading-relaxed">
                  Has successfully satisfied all validation checks and practical demonstrations of the OrchestrAI framework.
                </p>

                <div className="grid grid-cols-2 gap-2 border-y border-[var(--border-color)] py-2.5 my-4 text-left">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] block">Score</span>
                    <span className="text-xs font-bold text-[var(--text-primary)]">{userSub.automatedTotal}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] block">Status</span>
                    <span className={`text-[10px] font-bold uppercase ${userSub.status === 'HIRE_ELIGIBLE' ? 'text-emerald-400' : 'text-indigo-400'}`}>
                      {userSub.status === 'HIRE_ELIGIBLE' ? 'Hire Ready' : 'Certified'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-left text-[10px] text-[var(--text-secondary)]">
                  <div>
                    <div className="font-semibold text-[var(--text-primary)] italic">Sithanandham R.</div>
                    <div>Product Owner, Creator</div>
                  </div>
                  <div className="text-right">
                    <div>UID: <span className="font-semibold font-mono">{currentUser.uid}</span></div>
                    <div>Verify: <span className="text-indigo-400">Orchestrai.web.app</span></div>
                  </div>
                </div>
              </div>
            ) : userSub ? (
              /* Submission pending review card */
              <div className="glass-card rounded-xl p-5 border-blue-500/20 bg-blue-500/5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 mb-3">
                  <Clock className="h-5 w-5 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <h4 className="text-sm font-bold text-blue-400 mb-1">Portfolio Under Review</h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  We have received your GitHub repository and prompt logs. Sithanandham R. is reviewing your deliverables. Once graded, your score and certificate will unlock here.
                </p>
              </div>
            ) : (
              /* Submission form */
              <div className="glass-card rounded-xl p-5 border-slate-500/10">
                <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center space-x-1.5">
                  <Send className="h-4.5 w-4.5 text-indigo-400" />
                  <span>Submit Deliverables</span>
                </h4>
                
                <form onSubmit={handleSubmitProject} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                      GitHub Repository URL
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        required
                        placeholder="https://github.com/username/project"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 rounded border border-[var(--border-color)] bg-transparent text-[var(--text-primary)] text-xs focus:outline-none"
                      />
                      <Code className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--text-secondary)]" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                      AI Prompt Logs Document URL (Google Doc/PDF)
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        required
                        placeholder="https://docs.google.com/document/..."
                        value={promptUrl}
                        onChange={(e) => setPromptUrl(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 rounded border border-[var(--border-color)] bg-transparent text-[var(--text-primary)] text-xs focus:outline-none"
                      />
                      <FileText className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--text-secondary)]" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded text-xs font-bold shadow flex items-center justify-center space-x-1.5 transition-all"
                  >
                    {loading ? 'Submitting...' : 'Submit Portfolio for Review'}
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};
