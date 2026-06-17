import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { UserProfile, Submission } from '../context/AppContext';
import { 
  Shield, Settings, Mail, List, FileText, CheckCircle, 
  Trash2, Award, ExternalLink, Save 
} from 'lucide-react';
import emailjs from '@emailjs/browser';

export const Admin: React.FC = () => {
  const { 
    currentUser, 
    usersList, 
    updateUserProfile, 
    systemConfig, 
    updateSystemConfig,
    notificationLogs, 
    clearNotificationLogs,
    addNotificationLog,
    submissions,
    updateSubmissionStatus
  } = useApp();

  const [activeTab, setActiveTab] = useState<'workflow' | 'notifications' | 'approvals' | 'submissions' | 'logs'>('workflow');

  // Notification configuration form states
  const [serviceId, setServiceId] = useState(systemConfig.emailjsServiceId);
  const [templateId, setTemplateId] = useState(systemConfig.emailjsTemplateId);
  const [publicKey, setPublicKey] = useState(systemConfig.emailjsPublicKey);
  const [adminEmail, setAdminEmail] = useState(systemConfig.adminEmail);

  // Template customizer states
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>('payment_pending');
  const [subjectTemplate, setSubjectTemplate] = useState(systemConfig.templates[selectedTemplateKey]?.subject || '');
  const [bodyTemplate, setBodyTemplate] = useState(systemConfig.templates[selectedTemplateKey]?.body || '');

  // Manual project evaluation states
  const [evaluationScores, setEvaluationScores] = useState<{ [key: string]: number }>({});

  if (!currentUser || currentUser.role !== 'ADMIN') {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 text-red-500 mb-4">
          ✕
        </div>
        <h3 className="text-xl font-bold mb-2">Access Denied</h3>
        <p className="text-sm text-[var(--text-secondary)]">
          You must be logged in as an Admin to access this panel.
        </p>
      </div>
    );
  }

  // Filter lists
  const pendingUsers = usersList.filter(u => u.accountStatus === 'PENDING_APPROVAL');

  const handleSaveWorkflowConfig = (limit: number, mode: 'MANUAL' | 'AUTOMATED') => {
    updateSystemConfig({
      freeModulesLimit: limit,
      approvalMode: mode
    });
    alert("Workflow config saved successfully!");
  };

  const handleSaveCredentials = () => {
    updateSystemConfig({
      emailjsServiceId: serviceId,
      emailjsTemplateId: templateId,
      emailjsPublicKey: publicKey,
      adminEmail: adminEmail
    });
    alert("EmailJS API settings saved!");
  };

  const handleTemplateChange = (key: string) => {
    setSelectedTemplateKey(key);
    setSubjectTemplate(systemConfig.templates[key]?.subject || '');
    setBodyTemplate(systemConfig.templates[key]?.body || '');
  };

  const handleSaveTemplate = () => {
    const updatedTemplates = {
      ...systemConfig.templates,
      [selectedTemplateKey]: {
        subject: subjectTemplate,
        body: bodyTemplate
      }
    };
    updateSystemConfig({ templates: updatedTemplates });
    alert("Email template updated!");
  };

  const triggerApprovalEmail = async (student: UserProfile) => {
    const emailVariables = {
      name: student.name,
      email: student.email,
      loginUrl: window.location.origin + '/modules'
    };

    const config = systemConfig;
    const hasKeys = config.emailjsServiceId && config.emailjsTemplateId && config.emailjsPublicKey;
    const template = config.templates.account_approved;

    const emailBody = template.body
      .replace(/{{name}}/g, student.name)
      .replace(/{{email}}/g, student.email)
      .replace(/{{loginUrl}}/g, emailVariables.loginUrl);

    const emailSubject = template.subject
      .replace(/{{name}}/g, student.name)
      .replace(/{{email}}/g, student.email);

    if (hasKeys) {
      try {
        await emailjs.send(
          config.emailjsServiceId,
          config.emailjsTemplateId,
          {
            to_email: student.email,
            subject: emailSubject,
            message: emailBody
          },
          config.emailjsPublicKey
        );

        addNotificationLog({
          type: 'Candidate Approval Confirmation',
          recipient: student.email,
          subject: emailSubject,
          channel: 'EmailJS API',
          status: 'Sent'
        });
      } catch (err: any) {
        addNotificationLog({
          type: 'Candidate Approval Confirmation',
          recipient: student.email,
          subject: emailSubject,
          channel: 'EmailJS API',
          status: 'Failed'
        });
      }
    } else {
      addNotificationLog({
        type: 'Candidate Approval Confirmation (Mocked)',
        recipient: student.email,
        subject: emailSubject,
        channel: 'EmailJS API (Simulated)',
        status: 'Sent'
      });
    }
  };

  const handleApproveUser = async (user: UserProfile) => {
    updateUserProfile(user.uid, { accountStatus: 'APPROVED' });
    await triggerApprovalEmail(user);
    alert(`Candidate ${user.name} approved! Access unlocked.`);
  };

  const handleCertifySubmission = async (sub: Submission, isEligible: boolean) => {
    const score = evaluationScores[sub.id] || 90;
    const status = isEligible ? 'HIRE_ELIGIBLE' : 'CERTIFIED';
    
    updateSubmissionStatus(sub.id, status, score);

    // Trigger Certified template
    const emailVariables = {
      name: sub.userName,
      email: sub.userEmail,
      score: score.toString(),
      status: status === 'HIRE_ELIGIBLE' ? 'Hire Eligible (High-Priority IT Referral)' : 'Certified Lead'
    };

    const config = systemConfig;
    const template = config.templates.certified;
    const emailBody = template.body
      .replace(/{{name}}/g, sub.userName)
      .replace(/{{email}}/g, sub.userEmail)
      .replace(/{{score}}/g, emailVariables.score)
      .replace(/{{status}}/g, emailVariables.status);

    const emailSubject = template.subject
      .replace(/{{name}}/g, sub.userName)
      .replace(/{{email}}/g, sub.userEmail);

    const hasKeys = config.emailjsServiceId && config.emailjsTemplateId && config.emailjsPublicKey;

    if (hasKeys) {
      try {
        await emailjs.send(
          config.emailjsServiceId,
          config.emailjsTemplateId,
          {
            to_email: sub.userEmail,
            subject: emailSubject,
            message: emailBody
          },
          config.emailjsPublicKey
        );
        addNotificationLog({
          type: 'Certification Result Notice',
          recipient: sub.userEmail,
          subject: emailSubject,
          channel: 'EmailJS API',
          status: 'Sent'
        });
      } catch (e) {
        addNotificationLog({
          type: 'Certification Result Notice',
          recipient: sub.userEmail,
          subject: emailSubject,
          channel: 'EmailJS API',
          status: 'Failed'
        });
      }
    } else {
      addNotificationLog({
        type: 'Certification Result Notice (Mocked)',
        recipient: sub.userEmail,
        subject: emailSubject,
        channel: 'EmailJS API (Simulated)',
        status: 'Sent'
      });
    }

    alert(`Candidate certified successfully with a score of ${score}%!`);
  };

  const getTemplatePlaceholders = () => {
    switch (selectedTemplateKey) {
      case 'payment_pending':
        return '{{name}} (student name), {{email}} (student email), {{paymentId}} (Razorpay payment ID)';
      case 'account_approved':
        return '{{name}} (student name), {{email}} (student email), {{loginUrl}} (portal modules link)';
      case 'project_submitted':
        return '{{name}} (student name), {{email}} (student email), {{githubRepoUrl}} (repo), {{promptLogUrl}} (logs)';
      case 'certified':
        return '{{name}} (student name), {{email}} (student email), {{score}} (grade score), {{status}} (referral status)';
      default:
        return '';
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Panel Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border-color)] pb-5 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center space-x-2">
            <Shield className="h-7 w-7 text-purple-500" />
            <span>Admin Control Panel</span>
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Configure system configurations, email alerts, manual payment approvals, and candidate submissions.
          </p>
        </div>
        <div className="mt-3 sm:mt-0 bg-purple-500/10 border border-purple-500/20 text-purple-400 px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider self-start sm:self-center">
          Active: Sithanandham R.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side Tab Navigation */}
        <div className="lg:col-span-1 space-y-1">
          <button
            onClick={() => setActiveTab('workflow')}
            className={`w-full flex items-center space-x-2 px-4 py-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'workflow'
                ? 'bg-purple-500/15 text-purple-500 border border-purple-500/20'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-500/5'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Workflow Gating Settings</span>
          </button>
          
          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center space-x-2 px-4 py-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'notifications'
                ? 'bg-purple-500/15 text-purple-500 border border-purple-500/20'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-500/5'
            }`}
          >
            <Mail className="h-4 w-4" />
            <span>EmailJS Alert Config</span>
          </button>

          <button
            onClick={() => setActiveTab('approvals')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'approvals'
                ? 'bg-purple-500/15 text-purple-500 border border-purple-500/20'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-500/5'
            }`}
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Manual Approvals</span>
            </div>
            {pendingUsers.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {pendingUsers.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('submissions')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'submissions'
                ? 'bg-purple-500/15 text-purple-500 border border-purple-500/20'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-500/5'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4" />
              <span>Project Submissions</span>
            </div>
            {submissions.filter(s => s.status === 'SUBMITTED').length > 0 && (
              <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {submissions.filter(s => s.status === 'SUBMITTED').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`w-full flex items-center space-x-2 px-4 py-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'logs'
                ? 'bg-purple-500/15 text-purple-500 border border-purple-500/20'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-500/5'
            }`}
          >
            <List className="h-4 w-4" />
            <span>Notification Delivery Log</span>
          </button>
        </div>

        {/* Right Side Content Pane */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* TAB 1: WORKFLOW GATING SETTINGS */}
          {activeTab === 'workflow' && (
            <div className="glass-card rounded-xl p-6 space-y-6">
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center space-x-1.5 border-b border-[var(--border-color)] pb-3">
                <Settings className="h-4 w-4 text-purple-500" />
                <span>Workflow Gate Controls</span>
              </h3>

              <div className="space-y-6">
                {/* Modules Limit Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                    Free Modules Access Limit (Gate Boundary)
                  </label>
                  <select
                    defaultValue={systemConfig.freeModulesLimit}
                    id="freeLimitSelector"
                    className="max-w-xs w-full px-3 py-2 rounded-md border border-[var(--border-color)] bg-transparent text-[var(--text-primary)] text-sm focus:outline-none"
                  >
                    <option value="1">Unlock Module 1 (Gate at Module 2)</option>
                    <option value="2">Unlock Modules 1 & 2 (Gate at Module 3)</option>
                    <option value="3">Unlock Modules 1 - 3 (Gate at Module 4)</option>
                    <option value="4">Unlock Modules 1 - 4 (Gate at Module 5)</option>
                    <option value="5">Unlock Modules 1 - 5 (Gate at Module 6)</option>
                  </select>
                  <p className="text-[10px] text-[var(--text-secondary)] mt-1.5">
                    * Modules beyond this index will show a lock symbol and require payment activation.
                  </p>
                </div>

                {/* Workflow Mode selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2.5">
                    Approval Mode Workflow
                  </label>
                  <div className="flex flex-col space-y-2 max-w-md">
                    <label className="flex items-start space-x-3 p-3 rounded-lg border border-[var(--border-color)] bg-slate-500/5 cursor-pointer">
                      <input
                        type="radio"
                        name="approvalModeRadio"
                        defaultChecked={systemConfig.approvalMode === 'MANUAL'}
                        id="modeManual"
                        className="mt-1 text-purple-500"
                      />
                      <div>
                        <span className="text-xs font-bold block">Manual Review Mode</span>
                        <span className="text-[10px] text-[var(--text-secondary)] mt-0.5 leading-relaxed block">
                          When a student pays ₹99, their status becomes PENDING_APPROVAL. You must manually verify the transaction and click "Approve" here to unlock access.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start space-x-3 p-3 rounded-lg border border-[var(--border-color)] bg-slate-500/5 cursor-pointer">
                      <input
                        type="radio"
                        name="approvalModeRadio"
                        defaultChecked={systemConfig.approvalMode === 'AUTOMATED'}
                        id="modeAuto"
                        className="mt-1 text-purple-500"
                      />
                      <div>
                        <span className="text-xs font-bold block">Automated Instant Mode</span>
                        <span className="text-[10px] text-[var(--text-secondary)] mt-0.5 leading-relaxed block">
                          When a student pays ₹99, the client instantly upgrades their status to APPROVED. No manual intervention required.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--border-color)]">
                  <button
                    onClick={() => {
                      const limit = parseInt((document.getElementById('freeLimitSelector') as HTMLSelectElement).value);
                      const isManual = (document.getElementById('modeManual') as HTMLInputElement).checked;
                      handleSaveWorkflowConfig(limit, isManual ? 'MANUAL' : 'AUTOMATED');
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-purple-550 to-indigo-600 hover:from-purple-650 hover:to-indigo-750 text-white rounded text-xs font-bold flex items-center space-x-1 shadow"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Workflow Configurations</span>
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: EMAILJS CREDENTIALS & TEMPLATES */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              
              {/* Credentials Configuration Card */}
              <div className="glass-card rounded-xl p-6 space-y-6">
                <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center space-x-1.5 border-b border-[var(--border-color)] pb-3">
                  <Mail className="h-4 w-4 text-purple-500" />
                  <span>EmailJS Integration settings</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                      Service ID
                    </label>
                    <input
                      type="text"
                      placeholder="service_xxxxx"
                      value={serviceId}
                      onChange={(e) => setServiceId(e.target.value)}
                      className="w-full px-3 py-2 rounded border border-[var(--border-color)] bg-transparent text-[var(--text-primary)] text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                      Template ID
                    </label>
                    <input
                      type="text"
                      placeholder="template_xxxxx"
                      value={templateId}
                      onChange={(e) => setTemplateId(e.target.value)}
                      className="w-full px-3 py-2 rounded border border-[var(--border-color)] bg-transparent text-[var(--text-primary)] text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                      Public Key
                    </label>
                    <input
                      type="text"
                      placeholder="your_public_key"
                      value={publicKey}
                      onChange={(e) => setPublicKey(e.target.value)}
                      className="w-full px-3 py-2 rounded border border-[var(--border-color)] bg-transparent text-[var(--text-primary)] text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                    Notification Administrator Email
                  </label>
                  <input
                    type="email"
                    placeholder="skedcom@gmail.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="max-w-md w-full px-3 py-2 rounded border border-[var(--border-color)] bg-transparent text-[var(--text-primary)] text-xs focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSaveCredentials}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-650 text-white rounded text-xs font-bold flex items-center space-x-1"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save API Config</span>
                  </button>
                </div>
              </div>

              {/* Template Editor Card */}
              <div className="glass-card rounded-xl p-6 space-y-6">
                <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center space-x-1.5 border-b border-[var(--border-color)] pb-3">
                  <FileText className="h-4 w-4 text-purple-500" />
                  <span>Customize Email templates</span>
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                      Select Email Template to Edit
                    </label>
                    <select
                      value={selectedTemplateKey}
                      onChange={(e) => handleTemplateChange(e.target.value)}
                      className="max-w-xs w-full px-3 py-2 rounded border border-[var(--border-color)] bg-transparent text-[var(--text-primary)] text-xs focus:outline-none"
                    >
                      <option value="payment_pending">Admin Alert: Payment Pending Approval</option>
                      <option value="account_approved">Student Alert: Account Access Approved</option>
                      <option value="project_submitted">Admin Alert: Project Submission Received</option>
                      <option value="certified">Student Alert: Certification Granted</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                      Subject Template
                    </label>
                    <input
                      type="text"
                      value={subjectTemplate}
                      onChange={(e) => setSubjectTemplate(e.target.value)}
                      className="w-full px-3 py-2 rounded border border-[var(--border-color)] bg-transparent text-[var(--text-primary)] text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                      Body Template
                    </label>
                    <textarea
                      rows={6}
                      value={bodyTemplate}
                      onChange={(e) => setBodyTemplate(e.target.value)}
                      className="w-full px-3 py-2 rounded border border-[var(--border-color)] bg-transparent text-[var(--text-primary)] text-xs font-mono focus:outline-none leading-relaxed"
                    />
                  </div>

                  <div className="bg-slate-500/5 p-3.5 rounded-lg border border-[var(--border-color)] text-left">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Supported Dynamic Placeholders</p>
                    <p className="text-[10px] text-[var(--text-secondary)] font-mono leading-relaxed">{getTemplatePlaceholders()}</p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleSaveTemplate}
                      className="px-4 py-2 bg-purple-500 hover:bg-purple-650 text-white rounded text-xs font-bold flex items-center space-x-1"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save Template Layout</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: PENDING APPROVAL USERS */}
          {activeTab === 'approvals' && (
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center space-x-1.5 border-b border-[var(--border-color)] pb-3 mb-6">
                <CheckCircle className="h-4 w-4 text-purple-500" />
                <span>Manual Verification & Approval Requests</span>
              </h3>

              {pendingUsers.length === 0 ? (
                <div className="py-12 text-center text-[var(--text-secondary)]">
                  <CheckCircle className="h-10 w-10 text-emerald-500/30 mx-auto mb-2" />
                  <p className="text-xs font-bold text-[var(--text-primary)]">All clear! No pending approvals</p>
                  <p className="text-[11px] mt-1">Pending payments will appear here in manual mode.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-[var(--border-color)] rounded-lg">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-500/5 font-semibold text-[var(--text-primary)] border-b border-[var(--border-color)]">
                        <th className="p-4">Name / Email</th>
                        <th className="p-4">Razorpay Payment ID</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-secondary)]">
                      {pendingUsers.map(user => (
                        <tr key={user.uid} className="hover:bg-slate-500/5">
                          <td className="p-4">
                            <div className="font-bold text-[var(--text-primary)]">{user.name}</div>
                            <div>{user.email}</div>
                          </td>
                          <td className="p-4 font-mono font-bold text-[var(--text-primary)]">{user.paymentId || 'N/A'}</td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleApproveUser(user)}
                              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-650 hover:to-teal-750 text-white rounded text-[11px] font-bold shadow transition-all"
                            >
                              Approve Candidate
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PORTFOLIO SUBMISSIONS REVIEW */}
          {activeTab === 'submissions' && (
            <div className="glass-card rounded-xl p-6">
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center space-x-1.5 border-b border-[var(--border-color)] pb-3 mb-6">
                <Award className="h-4 w-4 text-purple-500" />
                <span>Candidate Portfolio Evaluation</span>
              </h3>

              {submissions.length === 0 ? (
                <div className="py-12 text-center text-[var(--text-secondary)]">
                  <Award className="h-10 w-10 text-indigo-500/30 mx-auto mb-2" />
                  <p className="text-xs font-bold text-[var(--text-primary)]">No submissions received yet</p>
                  <p className="text-[11px] mt-1">Once candidates complete the curriculum, their repos will appear here.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {submissions.map(sub => (
                    <div key={sub.id} className="border border-[var(--border-color)] p-4 rounded-lg bg-slate-500/5 space-y-3.5">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border-color)] pb-2.5">
                        <div>
                          <h4 className="text-sm font-bold text-[var(--text-primary)]">{sub.userName}</h4>
                          <p className="text-[11px] text-[var(--text-secondary)]">{sub.userEmail}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider self-start sm:self-center ${
                          sub.status === 'SUBMITTED' 
                            ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                            : sub.status === 'HIRE_ELIGIBLE'
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                        }`}>
                          {sub.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <a 
                          href={sub.githubRepoUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center space-x-1.5 p-2 border border-[var(--border-color)] rounded bg-[var(--bg-card)] text-indigo-400 hover:text-indigo-650"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>View GitHub Repository</span>
                        </a>
                        <a 
                          href={sub.promptLogUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center space-x-1.5 p-2 border border-[var(--border-color)] rounded bg-[var(--bg-card)] text-indigo-400 hover:text-indigo-650"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>Inspect AI Prompt Logs</span>
                        </a>
                      </div>

                      {sub.status === 'SUBMITTED' ? (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold">Tally Score:</span>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="90"
                              value={evaluationScores[sub.id] || ''}
                              onChange={(e) => setEvaluationScores({
                                ...evaluationScores,
                                [sub.id]: parseInt(e.target.value) || 0
                              })}
                              className="w-16 px-2 py-1 rounded border border-[var(--border-color)] bg-transparent text-xs text-center focus:outline-none"
                            />
                            <span className="text-xs">%</span>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCertifySubmission(sub, true)}
                              className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-650 hover:to-teal-750 text-white text-[11px] font-bold rounded shadow transition-all"
                            >
                              Certify as High-Priority (Score ≥ 90%)
                            </button>
                            <button
                              onClick={() => handleCertifySubmission(sub, false)}
                              className="px-3 py-1.5 border border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-400 text-[11px] font-semibold rounded"
                            >
                              Standard Certification
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-[var(--text-secondary)] font-semibold">
                          Final Score Registered: <strong className="text-[var(--text-primary)]">{sub.automatedTotal}%</strong>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: AUDIT LOGS */}
          {activeTab === 'logs' && (
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 mb-6">
                <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center space-x-1.5">
                  <List className="h-4 w-4 text-purple-500" />
                  <span>Notification Delivery Audit Log</span>
                </h3>
                {notificationLogs.length > 0 && (
                  <button
                    onClick={clearNotificationLogs}
                    className="flex items-center space-x-1 px-2.5 py-1 text-red-400 hover:bg-red-500/10 border border-red-500/15 rounded text-[11px] font-semibold transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Clear Logs</span>
                  </button>
                )}
              </div>

              {notificationLogs.length === 0 ? (
                <div className="py-12 text-center text-[var(--text-secondary)]">
                  <List className="h-10 w-10 text-slate-500/30 mx-auto mb-2" />
                  <p className="text-xs font-bold text-[var(--text-primary)]">No delivery logs recorded</p>
                  <p className="text-[11px] mt-1">Status logs of EmailJS triggers will register here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-[var(--border-color)] rounded-lg">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-500/5 font-semibold text-[var(--text-primary)] border-b border-[var(--border-color)]">
                        <th className="p-3">Time</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Recipient</th>
                        <th className="p-3">Channel</th>
                        <th className="p-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-secondary)]">
                      {notificationLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-500/5">
                          <td className="p-3 font-semibold whitespace-nowrap">{log.timestamp}</td>
                          <td className="p-3 font-bold text-[var(--text-primary)]">{log.type}</td>
                          <td className="p-3">{log.recipient}</td>
                          <td className="p-3 font-medium">{log.channel}</td>
                          <td className="p-3 text-right">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide ${
                              log.status === 'Sent'
                                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/10 border border-red-500/20 text-red-400'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
