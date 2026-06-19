import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { UserProfile, Submission } from '../context/AppContext';
import { 
  Shield, Settings, Mail, List, FileText, CheckCircle, 
  Trash2, Award, ExternalLink, Save, Database,
  BarChart2, TrendingUp, Users, Activity, Search, Filter, Clock,
  BookOpen, Upload, HelpCircle, Eye, EyeOff
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
    updateSubmissionStatus,
    addToast,
    confirmAction,
    dbStatus,
    testDbConnection,
    disconnectDb,
    wipeAndResetDatabase,
    auditLogs,
    visitorsList,
    clearAuditLogs
  } = useApp();

  const [activeTab, setActiveTab] = useState<'workflow' | 'notifications' | 'approvals' | 'submissions' | 'logs' | 'database' | 'reports' | 'audit' | 'modules'>('reports');
  const [dbUrlVal, setDbUrlVal] = useState(systemConfig.firebaseDatabaseUrl || '');
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [auditSearchTerm, setAuditSearchTerm] = useState('');
  const [auditCategory, setAuditCategory] = useState('ALL');
  const [auditCurrentPage, setAuditCurrentPage] = useState(1);

  // Modules Management States
  const [selectedModId, setSelectedModId] = useState<number>(1);
  const [modVideoUrl, setModVideoUrl] = useState('');
  const [modVideoType, setModVideoType] = useState<'url' | 'upload'>('url');
  const [modAudioUrl, setModAudioUrl] = useState('');
  const [modCaptionsText, setModCaptionsText] = useState('');
  const [modExternalLink, setModExternalLink] = useState('');
  const [modHasPresets, setModHasPresets] = useState(false);
  const [presetTab, setPresetTab] = useState<'conversational' | 'formal' | 'genz' | 'beginner'>('conversational');
  const [modSlidesConversational, setModSlidesConversational] = useState('');
  const [modSlidesFormal, setModSlidesFormal] = useState('');
  const [modSlidesGenz, setModSlidesGenz] = useState('');
  const [modSlidesBeginner, setModSlidesBeginner] = useState('');
  const [jsonValidationErrors, setJsonValidationErrors] = useState<{
    conversational: string | null;
    formal: string | null;
    genz: string | null;
    beginner: string | null;
  }>({ conversational: null, formal: null, genz: null, beginner: null });

  useEffect(() => {
    const media = systemConfig.moduleMedia?.[selectedModId] || {};
    setModVideoUrl(media.videoUrl || '');
    setModVideoType(media.videoType || 'url');
    setModAudioUrl(media.avatarAudioUrl || '');
    setModCaptionsText(media.captions ? media.captions.join('\n') : '');
    setModExternalLink(media.externalLink || '');
    setModHasPresets(!!media.hasPresets);

    const slides = systemConfig.moduleSlides?.[selectedModId];
    if (slides && !Array.isArray(slides)) {
      // Stored as preset-mapped object
      setModSlidesConversational(JSON.stringify(slides.conversational || [], null, 2));
      setModSlidesFormal(JSON.stringify(slides.formal || [], null, 2));
      setModSlidesGenz(JSON.stringify(slides.genz || [], null, 2));
      setModSlidesBeginner(JSON.stringify(slides.beginner || [], null, 2));
    } else {
      // Stored as flat array (standard or old data)
      setModSlidesConversational(JSON.stringify(slides || [], null, 2));
      setModSlidesFormal('');
      setModSlidesGenz('');
      setModSlidesBeginner('');
    }
    setJsonValidationErrors({ conversational: null, formal: null, genz: null, beginner: null });
  }, [selectedModId, systemConfig]);

  useEffect(() => {
    setPresetTab('conversational');
  }, [selectedModId]);

  useEffect(() => {
    setDbUrlVal(systemConfig.firebaseDatabaseUrl || '');
  }, [systemConfig.firebaseDatabaseUrl]);

  // Notification configuration form states
  const [serviceId, setServiceId] = useState(systemConfig.emailjsServiceId || '');
  const [templateId, setTemplateId] = useState(systemConfig.emailjsTemplateId || '');
  const [publicKey, setPublicKey] = useState(systemConfig.emailjsPublicKey || '');
  const [adminEmail, setAdminEmail] = useState(systemConfig.adminEmail || '');

  // Synchronize local states with global systemConfig (needed when RTDB config listener loads values asynchronously)
  useEffect(() => {
    setServiceId(systemConfig.emailjsServiceId || '');
    setTemplateId(systemConfig.emailjsTemplateId || '');
    setPublicKey(systemConfig.emailjsPublicKey || '');
    setAdminEmail(systemConfig.adminEmail || '');
  }, [
    systemConfig.emailjsServiceId,
    systemConfig.emailjsTemplateId,
    systemConfig.emailjsPublicKey,
    systemConfig.adminEmail
  ]);

  // Template customizer states
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>('payment_pending');
  const [subjectTemplate, setSubjectTemplate] = useState(systemConfig.templates[selectedTemplateKey]?.subject || '');
  const [bodyTemplate, setBodyTemplate] = useState(systemConfig.templates[selectedTemplateKey]?.body || '');

  // Synchronize template customizer with global systemConfig changes
  useEffect(() => {
    setSubjectTemplate(systemConfig.templates[selectedTemplateKey]?.subject || '');
    setBodyTemplate(systemConfig.templates[selectedTemplateKey]?.body || '');
  }, [systemConfig.templates, selectedTemplateKey]);

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

  const handleSaveAndConnect = () => {
    if (!dbUrlVal || !dbUrlVal.trim()) {
      addToast("Please enter a valid Firebase Realtime Database URL.", "warning");
      return;
    }
    updateSystemConfig({
      firebaseDatabaseUrl: dbUrlVal.trim()
    });
    addToast("Database settings saved. Connecting...", "info");
  };

  const handleTestConnection = async () => {
    if (!dbUrlVal || !dbUrlVal.trim()) {
      addToast("Please enter a database URL to test.", "warning");
      return;
    }
    setIsTestingConn(true);
    addToast("Testing connection to database...", "info");
    const isConnected = await testDbConnection(dbUrlVal.trim());
    setIsTestingConn(false);
    if (isConnected) {
      addToast("Connection tested successfully! The database is reachable and active.", "success");
    } else {
      addToast("Connection test failed. Verify the URL is correct and public rules are active.", "error");
    }
  };

  const handleDisconnect = () => {
    disconnectDb();
  };

  const handleUpdatePassword = () => {
    if (!newPasswordVal) {
      addToast("Please enter a new password.", "warning");
      return;
    }
    updateSystemConfig({
      adminPassword: newPasswordVal
    });
    addToast("Admin password updated successfully!", "success");
    setNewPasswordVal('');
    setShowNewPassword(false);
  };

  const handleWipeAndReset = () => {
    confirmAction(
      "RESET DATABASE & LOSE ALL DATA?",
      "WARNING: This will permanently wipe all student accounts, progress metrics, notifications, and portfolio submissions. The administrator seed account will be preserved. This cannot be undone.",
      () => {
        wipeAndResetDatabase();
      }
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, key: 'conversational' | 'formal' | 'genz' | 'beginner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        let parsed = JSON.parse(text);
        if (parsed && !Array.isArray(parsed) && Array.isArray(parsed.slides)) {
          console.log("[Admin] Unpacking slides from wrapper object...");
          parsed = parsed.slides;
        }
        if (!Array.isArray(parsed)) {
          setJsonValidationErrors(prev => ({ ...prev, [key]: "JSON must be a valid array of slides." }));
          addToast("Invalid JSON structure: must be an array or contain a 'slides' array.", "error");
        } else {
          const formatted = JSON.stringify(parsed, null, 2);
          if (key === 'conversational') setModSlidesConversational(formatted);
          else if (key === 'formal') setModSlidesFormal(formatted);
          else if (key === 'genz') setModSlidesGenz(formatted);
          else if (key === 'beginner') setModSlidesBeginner(formatted);
          setJsonValidationErrors(prev => ({ ...prev, [key]: null }));
          addToast(`${key.toUpperCase()} slides JSON uploaded and formatted successfully!`, "success");
        }
      } catch (err: any) {
        setJsonValidationErrors(prev => ({ ...prev, [key]: "JSON Parse Error: " + err.message }));
        addToast("Failed to parse JSON file.", "error");
      }
    };
    reader.readAsText(file);
  };

  const handleValidateJson = (key: 'conversational' | 'formal' | 'genz' | 'beginner') => {
    let text = '';
    if (key === 'conversational') text = modSlidesConversational;
    else if (key === 'formal') text = modSlidesFormal;
    else if (key === 'genz') text = modSlidesGenz;
    else if (key === 'beginner') text = modSlidesBeginner;

    if (!text.trim()) {
      setJsonValidationErrors(prev => ({ ...prev, [key]: "JSON is empty." }));
      return;
    }
    try {
      let parsed = JSON.parse(text);
      if (parsed && !Array.isArray(parsed) && Array.isArray(parsed.slides)) {
        parsed = parsed.slides;
      }
      if (!Array.isArray(parsed)) {
        setJsonValidationErrors(prev => ({ ...prev, [key]: "JSON must be a valid array of slides or contain a 'slides' array." }));
      } else {
        const formatted = JSON.stringify(parsed, null, 2);
        if (key === 'conversational') setModSlidesConversational(formatted);
        else if (key === 'formal') setModSlidesFormal(formatted);
        else if (key === 'genz') setModSlidesGenz(formatted);
        else if (key === 'beginner') setModSlidesBeginner(formatted);
        setJsonValidationErrors(prev => ({ ...prev, [key]: null }));
        addToast(`${key.toUpperCase()} JSON is valid and formatted!`, "success");
      }
    } catch (err: any) {
      setJsonValidationErrors(prev => ({ ...prev, [key]: "JSON Parse Error: " + err.message }));
    }
  };

  const handleSaveModuleConfig = () => {
    let conversationalParsed: any[] = [];
    if (modSlidesConversational.trim()) {
      try {
        let parsed = JSON.parse(modSlidesConversational);
        if (parsed && !Array.isArray(parsed) && Array.isArray(parsed.slides)) {
          parsed = parsed.slides;
        }
        conversationalParsed = parsed;
        if (!Array.isArray(conversationalParsed)) {
          addToast("Conversational slides must be a valid JSON array.", "error");
          return;
        }
      } catch (err: any) {
        addToast("Conversational JSON Parse Error: " + err.message, "error");
        return;
      }
    } else {
      addToast("Conversational (Default) slides JSON is required.", "error");
      return;
    }

    let formalParsed: any[] = [];
    if (modHasPresets && modSlidesFormal.trim()) {
      try {
        let parsed = JSON.parse(modSlidesFormal);
        if (parsed && !Array.isArray(parsed) && Array.isArray(parsed.slides)) {
          parsed = parsed.slides;
        }
        formalParsed = parsed;
        if (!Array.isArray(formalParsed)) {
          addToast("Formal slides must be a valid JSON array.", "error");
          return;
        }
      } catch (err: any) {
        addToast("Formal JSON Parse Error: " + err.message, "error");
        return;
      }
    }

    let genzParsed: any[] = [];
    if (modHasPresets && modSlidesGenz.trim()) {
      try {
        let parsed = JSON.parse(modSlidesGenz);
        if (parsed && !Array.isArray(parsed) && Array.isArray(parsed.slides)) {
          parsed = parsed.slides;
        }
        genzParsed = parsed;
        if (!Array.isArray(genzParsed)) {
          addToast("Gen-Z slides must be a valid JSON array.", "error");
          return;
        }
      } catch (err: any) {
        addToast("Gen-Z JSON Parse Error: " + err.message, "error");
        return;
      }
    }

    let beginnerParsed: any[] = [];
    if (modHasPresets && modSlidesBeginner.trim()) {
      try {
        let parsed = JSON.parse(modSlidesBeginner);
        if (parsed && !Array.isArray(parsed) && Array.isArray(parsed.slides)) {
          parsed = parsed.slides;
        }
        beginnerParsed = parsed;
        if (!Array.isArray(beginnerParsed)) {
          addToast("Beginner slides must be a valid JSON array.", "error");
          return;
        }
      } catch (err: any) {
        addToast("Beginner JSON Parse Error: " + err.message, "error");
        return;
      }
    }

    const media = {
      videoUrl: modVideoUrl.trim(),
      videoType: modVideoType,
      avatarAudioUrl: modAudioUrl.trim(),
      captions: modCaptionsText.split('\n').map(line => line.trim()).filter(line => line.length > 0),
      externalLink: modExternalLink.trim(),
      hasPresets: modHasPresets
    };

    const slidesPayload = modHasPresets ? {
      conversational: conversationalParsed,
      formal: formalParsed,
      genz: genzParsed,
      beginner: beginnerParsed
    } : conversationalParsed;

    const updatedMedia = {
      ...(systemConfig.moduleMedia || {}),
      [selectedModId]: media
    };

    const updatedSlides = {
      ...(systemConfig.moduleSlides || {}),
      [selectedModId]: slidesPayload
    };

    updateSystemConfig({
      moduleMedia: updatedMedia,
      moduleSlides: updatedSlides
    });

    addToast(`Module ${selectedModId} configuration saved successfully!`, "success");
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
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center space-x-2 px-4 py-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'reports'
                ? 'bg-purple-500/15 text-purple-500 border border-purple-500/20'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-500/5'
            }`}
          >
            <BarChart2 className="h-4 w-4" />
            <span>Reports & Insights</span>
          </button>

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
            onClick={() => setActiveTab('modules')}
            className={`w-full flex items-center space-x-2 px-4 py-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'modules'
                ? 'bg-purple-500/15 text-purple-500 border border-purple-500/20'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-500/5'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Manage Modules</span>
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

          <button
            onClick={() => setActiveTab('audit')}
            className={`w-full flex items-center space-x-2 px-4 py-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'audit'
                ? 'bg-purple-500/15 text-purple-500 border border-purple-500/20'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-500/5'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>System Audit Log</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`w-full flex items-center space-x-2 px-4 py-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'database'
                ? 'bg-purple-500/15 text-purple-500 border border-purple-500/20'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-500/5'
            }`}
          >
            <Database className="h-4 w-4" />
            <span>Database Settings</span>
          </button>
        </div>

        {/* Right Side Content Pane */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* TAB: REPORTS & INSIGHTS */}
          {activeTab === 'reports' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-250">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card rounded-xl p-5 border border-[var(--border-color)] bg-slate-500/5 flex items-center justify-between hover:-translate-y-0.5 transition-all">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Total Traffic</p>
                    <h3 className="text-2xl font-extrabold text-[var(--text-primary)]">{visitorsList.length}</h3>
                    <p className="text-[9px] text-[var(--text-muted)] font-semibold">Unique anonymous visitors</p>
                  </div>
                  <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                    <Users className="h-6 w-6" />
                  </div>
                </div>

                <div className="glass-card rounded-xl p-5 border border-[var(--border-color)] bg-slate-500/5 flex items-center justify-between hover:-translate-y-0.5 transition-all">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Explored Modules</p>
                    <h3 className="text-2xl font-extrabold text-[var(--text-primary)]">
                      {visitorsList.filter(v => v.viewedModule1 || v.viewedModule2).length}
                    </h3>
                    <p className="text-[9px] text-[var(--text-muted)] font-semibold">Viewed Module 1 or 2 slides</p>
                  </div>
                  <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                    <Activity className="h-6 w-6" />
                  </div>
                </div>

                <div className="glass-card rounded-xl p-5 border border-[var(--border-color)] bg-slate-500/5 flex items-center justify-between hover:-translate-y-0.5 transition-all">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Registered Learners</p>
                    <h3 className="text-2xl font-extrabold text-[var(--text-primary)]">
                      {usersList.filter(u => u.email !== 'vthinkorchestrai@gmail.com').length}
                    </h3>
                    <p className="text-[9px] text-[var(--text-muted)] font-semibold">Created academy profiles</p>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </div>

                <div className="glass-card rounded-xl p-5 border border-[var(--border-color)] bg-slate-500/5 flex items-center justify-between hover:-translate-y-0.5 transition-all">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Certified Grads</p>
                    <h3 className="text-2xl font-extrabold text-[var(--text-primary)]">
                      {submissions.filter(s => s.status === 'CERTIFIED' || s.status === 'HIRE_ELIGIBLE').length}
                    </h3>
                    <p className="text-[9px] text-[var(--text-muted)] font-semibold">Passed portfolio review</p>
                  </div>
                  <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                    <Award className="h-6 w-6" />
                  </div>
                </div>
              </div>

              {/* Conversion Funnel */}
              <div className="glass-card rounded-xl p-6 border border-[var(--border-color)] space-y-6">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center space-x-1.5">
                    <TrendingUp className="h-4 w-4 text-indigo-400" />
                    <span>Visitor Conversion Funnel</span>
                  </h3>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                    Track the activation journey from initial landing page visit to certified graduation.
                  </p>
                </div>

                {/* Funnel chart steps */}
                <div className="space-y-4">
                  {(() => {
                    const totalVal = Math.max(1, visitorsList.length);
                    const exploredVal = visitorsList.filter(v => v.viewedModule1 || v.viewedModule2).length;
                    const registeredVal = usersList.filter(u => u.email !== 'vthinkorchestrai@gmail.com').length;
                    
                    const inProgressVal = usersList.filter(u => {
                      if (u.email === 'vthinkorchestrai@gmail.com') return false;
                      const hasCertified = submissions.some(s => s.userEmail === u.email && (s.status === 'CERTIFIED' || s.status === 'HIRE_ELIGIBLE'));
                      return !hasCertified;
                    }).length;

                    const certifiedVal = submissions.filter(s => s.status === 'CERTIFIED' || s.status === 'HIRE_ELIGIBLE').length;

                    const steps = [
                      { label: 'Landed (Anonymous Traffic)', val: totalVal, pct: 100, color: 'from-indigo-600 to-indigo-500', microConversion: '100% baseline' },
                      { label: 'Explored Modules (Viewed Mod 1/2 slides)', val: exploredVal, pct: Math.round((exploredVal / totalVal) * 100), color: 'from-indigo-500 to-purple-500', microConversion: `${exploredVal ? Math.round((exploredVal / totalVal) * 100) : 0}% of traffic` },
                      { label: 'Registered (Created Account)', val: registeredVal, pct: Math.round((registeredVal / totalVal) * 100), color: 'from-purple-500 to-pink-500', microConversion: `${exploredVal ? Math.round((registeredVal / Math.max(1, exploredVal)) * 100) : 0}% explore-to-register` },
                      { label: 'In Progress (Active Learners)', val: inProgressVal, pct: Math.round((inProgressVal / totalVal) * 100), color: 'from-pink-500 to-amber-500', microConversion: `${registeredVal ? Math.round((inProgressVal / Math.max(1, registeredVal)) * 100) : 0}% in-progress` },
                      { label: 'Certified (Passed Portfolio)', val: certifiedVal, pct: Math.round((certifiedVal / totalVal) * 100), color: 'from-amber-500 to-emerald-500', microConversion: `${registeredVal ? Math.round((certifiedVal / Math.max(1, registeredVal)) * 100) : 0}% register-to-certify` }
                    ];

                    return (
                      <div className="space-y-4">
                        {steps.map((step, idx) => (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-[var(--text-primary)]">{step.label}</span>
                              <div className="flex items-center gap-3">
                                <span className="font-extrabold text-[var(--text-primary)]">{step.val}</span>
                                <span className="text-[10px] text-[var(--text-secondary)] font-semibold bg-slate-500/10 px-2 py-0.5 rounded-full">{step.microConversion}</span>
                              </div>
                            </div>
                            <div className="w-full h-3 bg-[var(--surface-sunken)] rounded-full relative overflow-hidden">
                              <div 
                                className={`h-full bg-gradient-to-r ${step.color} rounded-full transition-all duration-700`}
                                style={{ width: `${Math.min(100, Math.max(2, step.pct))}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Heatmap Section */}
              <div className="glass-card rounded-xl p-6 border border-[var(--border-color)] space-y-6">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center space-x-1.5">
                    <BarChart2 className="h-4 w-4 text-purple-400" />
                    <span>Modules Completion Heatmap</span>
                  </h3>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                    Completion rate distribution for each of the 8 curriculum training modules.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                  {Array.from({ length: 8 }).map((_, idx) => {
                    const modId = idx + 1;
                    const completions = usersList.filter(u => u.email !== 'vthinkorchestrai@gmail.com' && u.progress?.modulesCompleted?.includes(modId)).length;
                    const totalLearners = Math.max(1, usersList.filter(u => u.email !== 'vthinkorchestrai@gmail.com').length);
                    const percentage = Math.round((completions / totalLearners) * 100);
                    return (
                      <div key={modId} className="flex flex-col items-center p-3 rounded-xl border border-[var(--border-color)] bg-slate-500/5 hover:bg-slate-500/10 transition-all group">
                        <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Mod {modId}</span>
                        {/* Vertical Bar Container */}
                        <div className="w-6 h-24 bg-[var(--surface-sunken)] rounded-full relative overflow-hidden flex items-end">
                          <div 
                            className="w-full bg-gradient-to-t from-indigo-500 to-purple-600 rounded-full transition-all duration-500 group-hover:brightness-110" 
                            style={{ height: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-extrabold text-[var(--text-primary)] mt-3">{completions}</span>
                        <span className="text-[9px] text-[var(--text-muted)] font-semibold mt-0.5">{percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB: SYSTEM AUDIT LOG */}
          {activeTab === 'audit' && (
            // ... truncated for space ...
            <div className="glass-card rounded-xl p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-250">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border-color)] pb-3 gap-3">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center space-x-1.5">
                    <Clock className="h-4 w-4 text-purple-500" />
                    <span>System Activity & Audit Log</span>
                  </h3>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                    Trace all core settings updates, user logins, registrations, and student progression events.
                  </p>
                </div>
                {auditLogs.length > 0 && (
                  <button
                    onClick={() => {
                      confirmAction(
                        "CLEAR SYSTEM AUDIT LOGS?",
                        "WARNING: This will permanently wipe all logs of logins, settings changes, and student scores. This cannot be undone.",
                        () => clearAuditLogs()
                      );
                    }}
                    className="flex items-center space-x-1 px-2.5 py-1 text-red-400 hover:bg-red-500/10 border border-red-500/15 rounded text-[11px] font-semibold transition-all self-start sm:self-center cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Clear Audit Logs</span>
                  </button>
                )}
              </div>

              {/* Filters Toolbar */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-muted)] pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search by event, actor, or description..."
                    value={auditSearchTerm}
                    onChange={(e) => {
                      setAuditSearchTerm(e.target.value);
                      setAuditCurrentPage(1);
                    }}
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface-sunken)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* Category Dropdown */}
                <div className="flex items-center space-x-2">
                  <Filter className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                  <select
                    value={auditCategory}
                    onChange={(e) => {
                      setAuditCategory(e.target.value);
                      setAuditCurrentPage(1);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface-sunken)] text-xs text-[var(--text-primary)] focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="LOGINS">Logins & Registrations</option>
                    <option value="CONFIG">Settings & Config Updates</option>
                    <option value="PROGRESSION">Course Progression</option>
                    <option value="DATABASE">Database Actions</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              {(() => {
                const filtered = auditLogs.filter(log => {
                  if (auditCategory !== 'ALL') {
                    const type = log.type;
                    if (auditCategory === 'LOGINS' && !['USER_LOGIN', 'ADMIN_LOGIN', 'USER_REGISTER', 'USER_LOGOUT', 'ADMIN_LOGOUT'].includes(type)) return false;
                    if (auditCategory === 'CONFIG' && !['CONFIG_UPDATE', 'APPROVE_STUDENT', 'CLEAR_AUDIT_LOGS'].includes(type)) return false;
                    if (auditCategory === 'PROGRESSION' && !['MODULE_COMPLETE', 'QUIZ_SUBMIT', 'LAB_COMPLETE', 'PROJECT_SUBMIT', 'CERTIFY_STUDENT'].includes(type)) return false;
                    if (auditCategory === 'DATABASE' && !['WIPE_DATABASE', 'CONNECT_DATABASE', 'DISCONNECT_DATABASE'].includes(type)) return false;
                  }
                  if (auditSearchTerm.trim() !== '') {
                    const term = auditSearchTerm.toLowerCase();
                    return (
                      log.type.toLowerCase().includes(term) ||
                      log.userEmail.toLowerCase().includes(term) ||
                      log.description.toLowerCase().includes(term)
                    );
                  }
                  return true;
                });

                const totalPages = Math.max(1, Math.ceil(filtered.length / 10));
                const startIndex = (auditCurrentPage - 1) * 10;
                const pageLogs = filtered.slice(startIndex, startIndex + 10);

                if (filtered.length === 0) {
                  return (
                    <div className="py-12 text-center text-[var(--text-secondary)] border border-[var(--border-color)] rounded-lg">
                      <Clock className="h-10 w-10 text-slate-500/30 mx-auto mb-2" />
                      <p className="text-xs font-bold text-[var(--text-primary)]">No matching audit logs found</p>
                      <p className="text-[11px] mt-1">Try adjusting your filters or search query.</p>
                    </div>
                  );
                }

                const getBadgeStyle = (type: string) => {
                  if (['USER_LOGIN', 'ADMIN_LOGIN', 'USER_REGISTER'].includes(type)) {
                    return 'bg-blue-500/10 border-blue-500/25 text-blue-400';
                  }
                  if (['USER_LOGOUT', 'ADMIN_LOGOUT'].includes(type)) {
                    return 'bg-slate-500/10 border-slate-500/25 text-slate-400';
                  }
                  if (['CONFIG_UPDATE', 'APPROVE_STUDENT'].includes(type)) {
                    return 'bg-purple-500/10 border-purple-500/25 text-purple-400';
                  }
                  if (['WIPE_DATABASE', 'CLEAR_AUDIT_LOGS'].includes(type)) {
                    return 'bg-red-500/10 border-red-500/25 text-red-400';
                  }
                  if (['CONNECT_DATABASE', 'DISCONNECT_DATABASE'].includes(type)) {
                    return 'bg-yellow-500/10 border-yellow-500/25 text-yellow-400';
                  }
                  return 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'; // Progression milestones
                };

                return (
                  <div className="space-y-4">
                    <div className="overflow-x-auto border border-[var(--border-color)] rounded-lg bg-[var(--surface-sunken)]">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-500/5 font-semibold text-[var(--text-primary)] border-b border-[var(--border-color)]">
                            <th className="p-3 w-1/4">Timestamp</th>
                            <th className="p-3 w-1/5">Type</th>
                            <th className="p-3 w-1/4">Actor</th>
                            <th className="p-3 w-2/5">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-secondary)]">
                          {pageLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-500/5">
                              <td className="p-3 font-semibold whitespace-nowrap">
                                {new Date(log.timestamp).toLocaleString()}
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${getBadgeStyle(log.type)}`}>
                                  {log.type.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="p-3 font-medium break-all">{log.userEmail}</td>
                              <td className="p-3 text-[var(--text-primary)]">{log.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between text-xs pt-2">
                        <span className="text-[var(--text-secondary)]">
                          Showing <strong className="text-[var(--text-primary)]">{startIndex + 1}</strong> to <strong className="text-[var(--text-primary)]">{Math.min(startIndex + 10, filtered.length)}</strong> of <strong className="text-[var(--text-primary)]">{filtered.length}</strong> logs
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setAuditCurrentPage(p => Math.max(1, p - 1))}
                            disabled={auditCurrentPage === 1}
                            className="px-3 py-1 rounded border border-[var(--border-color)] bg-[var(--bg-card)] disabled:opacity-40 text-[var(--text-primary)] hover:bg-slate-500/5 font-bold cursor-pointer"
                          >
                            Prev
                          </button>
                          <span className="px-3 py-1 text-[var(--text-primary)] font-semibold flex items-center bg-slate-500/10 rounded">
                            {auditCurrentPage} / {totalPages}
                          </span>
                          <button
                            onClick={() => setAuditCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={auditCurrentPage === totalPages}
                            className="px-3 py-1 rounded border border-[var(--border-color)] bg-[var(--bg-card)] disabled:opacity-40 text-[var(--text-primary)] hover:bg-slate-500/5 font-bold cursor-pointer"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB: MANAGE MODULES */}
          {activeTab === 'modules' && (
            <div className="glass-card rounded-xl p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-250">
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center space-x-1.5 border-b border-[var(--border-color)] pb-3">
                <BookOpen className="h-4 w-4 text-purple-500" />
                <span>Manage Curriculum Modules</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Module selector */}
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                    Select Curriculum Module
                  </label>
                  <select
                    value={selectedModId}
                    onChange={(e) => setSelectedModId(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-sunken)] text-[var(--text-primary)] text-xs focus:outline-none cursor-pointer"
                  >
                    {Array.from({ length: 8 }).map((_, idx) => (
                      <option key={idx + 1} value={idx + 1}>
                        Module {idx + 1}: {
                          idx === 0 ? 'The Mindset Shift' :
                          idx === 1 ? 'Framework Architecture' :
                          idx === 2 ? 'Intent Mastery' :
                          idx === 3 ? 'Roles & Governance' :
                          idx === 4 ? 'Running Iterations' :
                          idx === 5 ? 'Observability' :
                          idx === 6 ? 'Guardrails' : 'Evaluation & KPIs'
                        }
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1.5 leading-relaxed">
                    Choose a module to configure its media playback parameters, audio guides, captions, and interactive web-deck slides.
                  </p>
                </div>

                {/* Video & Audio Parameters */}
                <div className="md:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                        Video Type
                      </label>
                      <select
                        value={modVideoType}
                        onChange={(e) => setModVideoType(e.target.value as 'url' | 'upload')}
                        className="w-full px-3 py-2 rounded border border-[var(--border-color)] bg-transparent text-[var(--text-primary)] text-xs focus:outline-none cursor-pointer"
                      >
                        <option value="url">External Video URL</option>
                        <option value="upload">Uploaded File / Local Asset</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                        Video URL / File Path
                      </label>
                      <input
                        type="text"
                        placeholder="https://youtube.com/watch?v=... or /assets/video.mp4"
                        value={modVideoUrl}
                        onChange={(e) => setModVideoUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded border border-[var(--border-color)] bg-transparent text-[var(--text-primary)] text-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                        External Resource / Project Link
                      </label>
                      <input
                        type="text"
                        placeholder="https://github.com/your-repo or external-spec-doc"
                        value={modExternalLink}
                        onChange={(e) => setModExternalLink(e.target.value)}
                        className="w-full px-3 py-2 rounded border border-[var(--border-color)] bg-transparent text-[var(--text-primary)] text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                        AI Avatar Guide Audio URL
                      </label>
                      <input
                        type="text"
                        placeholder="https://your-domain.com/audio/guide.mp3 or /assets/audio.mp3"
                        value={modAudioUrl}
                        onChange={(e) => setModAudioUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded border border-[var(--border-color)] bg-transparent text-[var(--text-primary)] text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                      AI Avatar Captions / Transcript (One sentence per line)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Welcome to the module...&#10;In this module you will learn..."
                      value={modCaptionsText}
                      onChange={(e) => setModCaptionsText(e.target.value)}
                      className="w-full px-3 py-2 rounded border border-[var(--border-color)] bg-transparent text-[var(--text-primary)] text-xs focus:outline-none leading-relaxed"
                    />
                  </div>

                  {/* PRESET PROVISION CHECKBOX */}
                  <div className="pt-2">
                    <label className="flex items-center space-x-2.5 p-3 rounded-lg border border-[var(--border-color)] bg-slate-500/5 cursor-pointer hover:bg-slate-500/10 transition-colors">
                      <input
                        type="checkbox"
                        checked={modHasPresets}
                        onChange={(e) => setModHasPresets(e.target.checked)}
                        className="h-4 w-4 rounded text-purple-500 bg-transparent border-[var(--border-color)] focus:ring-purple-500/30"
                      />
                      <div>
                        <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1">
                          Enable 4-Tone Presets for this Module
                          <span title="Enables separate uploads for Formal, Conversational, Gen-Z, and Beginner slide decks.">
                            <HelpCircle className="h-3.5 w-3.5 text-purple-400" />
                          </span>
                        </span>
                        <span className="text-[10px] text-[var(--text-secondary)] mt-0.5 leading-relaxed block">
                          If enabled, candidates can choose their preferred learning style (Conversational, Formal, Gen-Z, or Beginner) at launch.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* SLIDES EDITING SECTION */}
              <div className="border-t border-[var(--border-color)] pt-6 space-y-4">
                {modHasPresets ? (
                  /* ── MULTI-PRESET EDITOR VIEW ── */
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[var(--border-color)] pb-3">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                          Configure 4-Tone Presets
                        </h4>
                        <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                          Select each preset tab to upload the corresponding slide deck JSON.
                        </p>
                      </div>
                      
                      {/* File Upload for Active Tab */}
                      <label className="flex items-center space-x-1.5 px-3 py-1.5 border border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-400 rounded text-xs font-bold cursor-pointer transition-all self-start sm:self-auto">
                        <Upload className="h-3.5 w-3.5" />
                        <span>Upload {presetTab.toUpperCase()} Slides .json</span>
                        <input
                          type="file"
                          accept=".json"
                          onChange={(e) => handleFileUpload(e, presetTab)}
                          className="hidden"
                          key={`file-${presetTab}-${selectedModId}`}
                        />
                      </label>
                    </div>

                    {/* Preset Selector Tabs */}
                    <div className="flex flex-wrap gap-2">
                      {(['conversational', 'formal', 'genz', 'beginner'] as const).map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setPresetTab(tab)}
                          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            presetTab === tab
                              ? 'bg-purple-500/15 text-purple-500 border border-purple-500/20'
                              : 'border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-500/5'
                          }`}
                        >
                          {tab === 'conversational' ? '💬 Conversational (Default)' :
                           tab === 'formal' ? '🎯 Formal / Executive' :
                           tab === 'genz' ? '⚡ Gen-Z / High-Energy' :
                           '🧪 Beginner / ELI5'}
                        </button>
                      ))}
                    </div>

                    {/* Active Tab Descriptor */}
                    <div className="text-[10px] text-[var(--text-secondary)] bg-slate-500/5 border border-[var(--border-color)] px-3 py-2 rounded-lg leading-relaxed">
                      {presetTab === 'conversational' && "💬 Conversational: Warm, conversational voice using light analogy banter. Used as fallback if other tones are empty."}
                      {presetTab === 'formal' && "🎯 Formal / Executive: Precise, ROI-framed, authoritative prose for senior stakeholders."}
                      {presetTab === 'genz' && "⚡ Gen-Z / High-Energy: Punchy, emoji-focused, modern rhythm for junior/campus hires."}
                      {presetTab === 'beginner' && "🧪 Beginner / ELI5: Jargon-free, slower-paced explainers with extra hand-holding."}
                    </div>

                    {/* Active Tab Textarea */}
                    <div className="space-y-2">
                      <textarea
                        rows={12}
                        placeholder={`Paste slide deck JSON for ${presetTab}...`}
                        value={
                          presetTab === 'conversational' ? modSlidesConversational :
                          presetTab === 'formal' ? modSlidesFormal :
                          presetTab === 'genz' ? modSlidesGenz :
                          modSlidesBeginner
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (presetTab === 'conversational') setModSlidesConversational(val);
                          else if (presetTab === 'formal') setModSlidesFormal(val);
                          else if (presetTab === 'genz') setModSlidesGenz(val);
                          else if (presetTab === 'beginner') setModSlidesBeginner(val);
                          
                          if (jsonValidationErrors[presetTab]) {
                            setJsonValidationErrors(prev => ({ ...prev, [presetTab]: null }));
                          }
                        }}
                        className="w-full px-3 py-2.5 rounded border border-[var(--border-color)] bg-[var(--surface-sunken)] text-[var(--text-primary)] text-xs font-mono focus:outline-none leading-relaxed"
                      />

                      {jsonValidationErrors[presetTab] && (
                        <div className="text-xs text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                          {jsonValidationErrors[presetTab]}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleValidateJson(presetTab)}
                          className="px-3 py-1.5 border border-[var(--border-color)] hover:bg-slate-500/5 text-[var(--text-primary)] rounded text-xs font-semibold cursor-pointer"
                        >
                          Format &amp; Validate JSON
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ── SINGLE SLIDES EDITOR VIEW ── */
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                          Interactive Web-Deck Slides JSON
                        </h4>
                        <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                          Upload a slides .json array or paste/edit the configuration directly below.
                        </p>
                      </div>
                      
                      <label className="flex items-center space-x-1.5 px-3 py-1.5 border border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-400 rounded text-xs font-bold cursor-pointer transition-all self-start sm:self-auto">
                        <Upload className="h-3.5 w-3.5" />
                        <span>Upload Slides .json File</span>
                        <input
                          type="file"
                          accept=".json"
                          onChange={(e) => handleFileUpload(e, 'conversational')}
                          className="hidden"
                          key={`file-single-${selectedModId}`}
                        />
                      </label>
                    </div>

                    <div className="space-y-2">
                      <textarea
                        rows={12}
                        placeholder="[&#10;  {&#10;    &quot;slide_id&quot;: &quot;slide_01&quot;,&#10;    &quot;type&quot;: &quot;welcome&quot;,&#10;    &quot;title&quot;: &quot;Hello World&quot;&#10;  }&#10;]"
                        value={modSlidesConversational}
                        onChange={(e) => {
                          setModSlidesConversational(e.target.value);
                          if (jsonValidationErrors.conversational) {
                            setJsonValidationErrors(prev => ({ ...prev, conversational: null }));
                          }
                        }}
                        className="w-full px-3 py-2.5 rounded border border-[var(--border-color)] bg-[var(--surface-sunken)] text-[var(--text-primary)] text-xs font-mono focus:outline-none leading-relaxed"
                      />
                      
                      {jsonValidationErrors.conversational && (
                        <div className="text-xs text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                          {jsonValidationErrors.conversational}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleValidateJson('conversational')}
                          className="px-3 py-1.5 border border-[var(--border-color)] hover:bg-slate-500/5 text-[var(--text-primary)] rounded text-xs font-semibold cursor-pointer"
                        >
                          Format &amp; Validate JSON
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-[var(--border-color)] pt-4 flex justify-end">
                <button
                  onClick={handleSaveModuleConfig}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-purple-500/20 cursor-pointer hover:scale-102 transition-all"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Module Configuration</span>
                </button>
              </div>
            </div>
          )}

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
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded text-xs font-bold flex items-center space-x-1 shadow cursor-pointer"
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
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-bold flex items-center space-x-1 cursor-pointer"
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
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-bold flex items-center space-x-1 cursor-pointer"
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

          {activeTab === 'database' && (
            <div className="glass-card rounded-xl p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-250">
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center space-x-1.5 border-b border-[var(--border-color)] pb-3">
                <Database className="h-4 w-4 text-purple-500" />
                <span>Database Settings</span>
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Connect to Firebase Realtime Database for team-wide sync.
              </p>

              {/* CARD 1: FIREBASE REALTIME DATABASE */}
              <div className="border border-[var(--border-color)] rounded-xl p-5 bg-slate-500/5 space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🔥</span>
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">Firebase Realtime Database</h4>
                  </div>
                  <div>
                    {dbStatus === 'connected' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold text-[10px] uppercase tracking-wider">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Connected
                      </span>
                    ) : dbStatus === 'testing' || isTestingConn ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 font-bold text-[10px] uppercase tracking-wider">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                        Testing...
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/25 text-red-400 font-bold text-[10px] uppercase tracking-wider">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-400"></span>
                        Disconnected
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Paste your Firebase Database URL below. All task logs, leaves, and configurations sync to the cloud so your whole team shares the same data.
                </p>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                    Firebase Database URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://your-project-default-rtdb.firebaseio.com/"
                    value={dbUrlVal}
                    onChange={(e) => setDbUrlVal(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div className="flex flex-wrap gap-2.5 pt-2">
                  <button
                    onClick={handleSaveAndConnect}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-bold transition-all cursor-pointer"
                  >
                    Save & Connect
                  </button>
                  <button
                    onClick={handleTestConnection}
                    disabled={isTestingConn}
                    className="px-4 py-2 border border-[var(--border-color)] hover:bg-slate-500/5 text-[var(--text-primary)] rounded text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    Test Connection
                  </button>
                  <button
                    onClick={handleDisconnect}
                    className="px-4 py-2 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:bg-red-500/10 rounded text-xs font-bold transition-all cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>
              </div>

              {/* CARD 2: ADMIN PASSWORD */}
              <div className="border border-[var(--border-color)] rounded-xl p-5 bg-slate-500/5 space-y-4">
                <div className="flex items-center space-x-2 border-b border-[var(--border-color)] pb-3">
                  <span className="text-lg">🔒</span>
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">Admin Password</h4>
                </div>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Change the admin account password.
                </p>

                <div className="max-w-md space-y-3">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                      New Admin Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new admin password"
                        value={newPasswordVal}
                        onChange={(e) => setNewPasswordVal(e.target.value)}
                        className="w-full pl-3 pr-10 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors focus:outline-none"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleUpdatePassword}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-bold transition-all cursor-pointer"
                  >
                    Update Password
                  </button>
                </div>
              </div>

              {/* CARD 3: DANGER ZONE */}
              <div className="border border-red-500/20 rounded-xl p-5 bg-red-500/5 space-y-4">
                <div className="flex items-center space-x-2 border-b border-red-500/20 pb-3">
                  <span className="text-lg">⚠️</span>
                  <h4 className="text-sm font-bold text-red-400">Danger Zone: Reset Database</h4>
                </div>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Use this to wipe all active test data and start fresh for production. This will permanently clear all tasks, employees, user accounts (except admin), leaves, and historic logs from both your browser and your connected Firebase database.
                </p>

                <button
                  onClick={handleWipeAndReset}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold transition-all cursor-pointer animate-pulse hover:animate-none"
                >
                  Wipe & Reset Database
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
