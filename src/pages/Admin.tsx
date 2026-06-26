import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { UserProfile } from '../context/AppContext';
import { getFirebaseApp } from '../firebase';
import { CapstoneReviewsAdmin } from './CapstoneReviewsAdmin';
import {
  Shield, Settings, Mail, List, CheckCircle,
  Trash2, Award, Save,
  BarChart2, TrendingUp, Users, Activity, Search, Filter, Clock,
  BookOpen, Upload, HelpCircle, Eye, EyeOff, Ban, UserCheck, Radar,
  Star, Sparkles, Download
} from 'lucide-react';
import emailjs from '@emailjs/browser';
import { computeLeadReadiness, scoreColor, tagColor, OUTREACH_TAGS, triggerCsvDownload } from '../utils/leadReadiness';
import type { OutreachTag } from '../context/AppContext';

export const Admin: React.FC = () => {
  const { 
    currentUser, 
    usersList, 
    updateUserProfile, 
    toggleUserDisabledStatus,
    systemConfig, 
    updateSystemConfig,
    notificationLogs, 
    clearNotificationLogs,
    addNotificationLog,
    submissions,
    addToast,
    confirmAction,
    dbStatus,
    testDbConnection,
    disconnectDb,
    wipeAndResetDatabase,
    auditLogs,
    visitorsList,
    clearAuditLogs,
    outreachData,
    setOutreachTag,
    setOutreachNotes,
    seedSampleCohort
  } = useApp();

  const [activeTab, setActiveTab] = useState<'settings' | 'approvals' | 'logs' | 'reports' | 'audit' | 'modules' | 'candidates' | 'capstoneReviews'>('reports');
  const [settingsSubTab, setSettingsSubTab] = useState<'connection' | 'gating' | 'verification' | 'emailjs' | 'aireview' | 'maintenance'>('connection');
  const [requireEmailVerifVal, setRequireEmailVerifVal] = useState(systemConfig.requireEmailVerification !== false);
  const [requirePhoneVerifVal, setRequirePhoneVerifVal] = useState(!!systemConfig.requirePhoneVerification);
  const [freeModulesLimitVal, setFreeModulesLimitVal] = useState(systemConfig.freeModulesLimit || 2);
  const [approvalModeVal, setApprovalModeVal] = useState(systemConfig.approvalMode || 'MANUAL');
  const [dbUrlVal, setDbUrlVal] = useState(systemConfig.firebaseDatabaseUrl || '');
  const [firebaseApiKeyVal, setFirebaseApiKeyVal] = useState(systemConfig.firebaseApiKey || '');
  const [firebaseAuthDomainVal, setFirebaseAuthDomainVal] = useState(systemConfig.firebaseAuthDomain || '');
  const [firebaseProjectIdVal, setFirebaseProjectIdVal] = useState(systemConfig.firebaseProjectId || '');
  const [firebaseStorageBucketVal, setFirebaseStorageBucketVal] = useState(systemConfig.firebaseStorageBucket || '');
  const [firebaseMessagingSenderIdVal, setFirebaseMessagingSenderIdVal] = useState(systemConfig.firebaseMessagingSenderId || '');
  const [firebaseAppIdVal, setFirebaseAppIdVal] = useState(systemConfig.firebaseAppId || '');
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [auditSearchTerm, setAuditSearchTerm] = useState('');
  const [auditCategory, setAuditCategory] = useState('ALL');
  const [auditCurrentPage, setAuditCurrentPage] = useState(1);

  // Candidate Database States
  const [candidateSearchTerm, setCandidateSearchTerm] = useState('');
  const [filterScoreRange, setFilterScoreRange] = useState<'all' | 'passed' | 'top_scored'>('all');
  const [filterModuleProgress, setFilterModuleProgress] = useState<'all' | 'completed_m1' | 'completed_m2' | 'passed_lab'>('all');
  const [filterAccountStatus, setFilterAccountStatus] = useState<'all' | 'FREE_TIER' | 'PENDING_APPROVAL' | 'APPROVED' | 'CERTIFIED'>('all');
  // Talent Radar filters
  const [showStandoutsOnly, setShowStandoutsOnly] = useState(false);
  const [filterOutreachTag, setFilterOutreachTag] = useState<'all' | OutreachTag | 'Untagged'>('all');
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState<UserProfile | null>(null);
  const [feedbackCandidate, setFeedbackCandidate] = useState<UserProfile | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [approvingUid, setApprovingUid] = useState<string | null>(null);

  // Candidates calculations & filtering
  const candidatesList = usersList.filter(u => u.role !== 'ADMIN');
  const totalCands = candidatesList.length;
  const m1CompleteCands = candidatesList.filter(c => c.progress?.modulesCompleted?.includes(1)).length;
  const labCompleteCands = candidatesList.filter(c => (c.progress?.labsPassed || []).includes(1)).length;
  const certifiedCands = candidatesList.filter(c => 
    submissions.some(s => s.userEmail === c.email && (s.status === 'CERTIFIED' || s.status === 'HIRE_ELIGIBLE'))
  ).length;

  const filteredCandidates = candidatesList.filter(c => {
    if (candidateSearchTerm.trim()) {
      const term = candidateSearchTerm.toLowerCase();
      const nameMatch = c.name?.toLowerCase().includes(term);
      const emailMatch = c.email?.toLowerCase().includes(term);
      const phoneMatch = c.mobile?.toLowerCase().includes(term);
      if (!nameMatch && !emailMatch && !phoneMatch) return false;
    }

    if (filterScoreRange !== 'all') {
      const quizScores = c.progress?.quizScores || {};
      const scoresArray = Object.values(quizScores) as number[];
      const bestScore = scoresArray.length > 0 ? Math.max(...scoresArray) : 0;
      if (filterScoreRange === 'passed' && bestScore < 80) return false;
      if (filterScoreRange === 'top_scored' && bestScore < 90) return false;
    }

    if (filterModuleProgress !== 'all') {
      if (filterModuleProgress === 'completed_m1' && !c.progress?.modulesCompleted?.includes(1)) return false;
      if (filterModuleProgress === 'completed_m2' && !c.progress?.modulesCompleted?.includes(2)) return false;
      if (filterModuleProgress === 'passed_lab' && !(c.progress?.labsPassed || []).includes(1)) return false;
    }

    if (filterAccountStatus !== 'all') {
      if (filterAccountStatus === 'CERTIFIED') {
        const isCertified = submissions.some(s => s.userEmail === c.email && (s.status === 'CERTIFIED' || s.status === 'HIRE_ELIGIBLE'));
        if (!isCertified) return false;
      } else {
        if (c.accountStatus !== filterAccountStatus) return false;
      }
    }

    // Talent Radar filters
    const hasSubmission = submissions.some((s) => s.userEmail === c.email);
    const readiness = computeLeadReadiness(c, hasSubmission);
    if (showStandoutsOnly && !readiness.isStandout) return false;
    if (filterOutreachTag !== 'all') {
      const tag = outreachData[c.uid]?.tag;
      if (filterOutreachTag === 'Untagged' && tag) return false;
      if (filterOutreachTag !== 'Untagged' && tag !== filterOutreachTag) return false;
    }

    return true;
  })
  // Sort high → low by Lead Readiness Score so the standouts surface
  .sort((a, b) => {
    const sa = computeLeadReadiness(a, submissions.some((s) => s.userEmail === a.email)).score;
    const sb = computeLeadReadiness(b, submissions.some((s) => s.userEmail === b.email)).score;
    return sb - sa;
  });

  // Cohort-wide readiness stats — surfaces "is this cohort hot or cold?"
  const cohortStats = (() => {
    if (candidatesList.length === 0) return { avg: 0, standouts: 0 };
    let sum = 0, standouts = 0;
    candidatesList.forEach((c) => {
      const r = computeLeadReadiness(c, submissions.some((s) => s.userEmail === c.email));
      sum += r.score;
      if (r.isStandout) standouts++;
    });
    return { avg: Math.round(sum / candidatesList.length), standouts };
  })();

  // Export visible candidates to CSV — includes radar score + outreach metadata
  const handleExportTalentCSV = () => {
    const rows = filteredCandidates.map((c) => {
      const hasSubmission = submissions.some((s) => s.userEmail === c.email);
      const r = computeLeadReadiness(c, hasSubmission);
      const o = outreachData[c.uid];
      const quizScores = Object.values(c.progress?.quizScores || {});
      return {
        Name: c.name || '',
        Email: c.email,
        Phone: c.mobile || '',
        Status: c.accountStatus,
        Level: c.progress?.level || 1,
        XP: c.progress?.xp || 0,
        Streak: c.progress?.streakDays || 0,
        'Quiz Avg': quizScores.length ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length) : 0,
        'Labs Cleared': (c.progress?.labsPassed || []).length,
        Submitted: hasSubmission ? 'Yes' : 'No',
        Score: r.score,
        Standout: r.isStandout ? 'Yes' : 'No',
        Tag: o?.tag || 'New',
        Notes: o?.notes || '',
      };
    });
    triggerCsvDownload(rows, 'talent-radar');
    addToast(`Exported ${rows.length} trainer${rows.length === 1 ? '' : 's'} to CSV.`, 'success');
  };

  // Modules Management States
  const [selectedModId, setSelectedModId] = useState<number>(1);
  // Modules 2-6 are 2-preset (Formal + Gen-Z only). Module 1 (and any future 4-tone module) keeps all 4.
  // MUST stay in sync with TrainingPresenter.tsx's TWO_PRESET_MODULES list.
  const TWO_PRESET_MODULE_IDS = [2, 3, 4, 5, 6];
  const isTwoPresetMode = TWO_PRESET_MODULE_IDS.includes(selectedModId);
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
    if (isTwoPresetMode) {
      setPresetTab('formal');
    } else {
      setPresetTab('conversational');
    }
  }, [selectedModId]);

  useEffect(() => {
    setDbUrlVal(systemConfig.firebaseDatabaseUrl || '');
    setFirebaseApiKeyVal(systemConfig.firebaseApiKey || '');
    setFirebaseAuthDomainVal(systemConfig.firebaseAuthDomain || '');
    setFirebaseProjectIdVal(systemConfig.firebaseProjectId || '');
    setFirebaseStorageBucketVal(systemConfig.firebaseStorageBucket || '');
    setFirebaseMessagingSenderIdVal(systemConfig.firebaseMessagingSenderId || '');
    setFirebaseAppIdVal(systemConfig.firebaseAppId || '');
  }, [
    systemConfig.firebaseDatabaseUrl,
    systemConfig.firebaseApiKey,
    systemConfig.firebaseAuthDomain,
    systemConfig.firebaseProjectId,
    systemConfig.firebaseStorageBucket,
    systemConfig.firebaseMessagingSenderId,
    systemConfig.firebaseAppId
  ]);

  // Notification configuration form states
  const [serviceId, setServiceId] = useState(systemConfig.emailjsServiceId || '');
  const [templateId, setTemplateId] = useState(systemConfig.emailjsTemplateId || '');
  const [publicKey, setPublicKey] = useState(systemConfig.emailjsPublicKey || '');
  const [adminEmail, setAdminEmail] = useState(systemConfig.adminEmail || '');
  const [templateIdSmeWelcome, setTemplateIdSmeWelcome] = useState(systemConfig.emailjsTemplateIdSmeWelcome || '');
  const [templateIdFeedback, setTemplateIdFeedback] = useState(systemConfig.emailjsTemplateIdFeedback || '');
  const [templateIdCertification, setTemplateIdCertification] = useState(systemConfig.emailjsTemplateIdCertification || '');
  const [templateIdAdminNotification, setTemplateIdAdminNotification] = useState(systemConfig.emailjsTemplateIdAdminNotification || '');
  const [templateIdSmeReassigned, setTemplateIdSmeReassigned] = useState(systemConfig.emailjsTemplateIdSmeReassigned || '');

  // Synchronize local states with global systemConfig (needed when RTDB config listener loads values asynchronously)
  useEffect(() => {
    setServiceId(systemConfig.emailjsServiceId || '');
    setTemplateId(systemConfig.emailjsTemplateId || '');
    setPublicKey(systemConfig.emailjsPublicKey || '');
    setAdminEmail(systemConfig.adminEmail || '');
    setTemplateIdSmeWelcome(systemConfig.emailjsTemplateIdSmeWelcome || '');
    setTemplateIdFeedback(systemConfig.emailjsTemplateIdFeedback || '');
    setTemplateIdCertification(systemConfig.emailjsTemplateIdCertification || '');
    setTemplateIdAdminNotification(systemConfig.emailjsTemplateIdAdminNotification || '');
    setTemplateIdSmeReassigned(systemConfig.emailjsTemplateIdSmeReassigned || '');
    setRequireEmailVerifVal(systemConfig.requireEmailVerification !== false);
    setRequirePhoneVerifVal(!!systemConfig.requirePhoneVerification);
    setFreeModulesLimitVal(systemConfig.freeModulesLimit || 2);
    setApprovalModeVal(systemConfig.approvalMode || 'MANUAL');
  }, [
    systemConfig.emailjsServiceId,
    systemConfig.emailjsTemplateId,
    systemConfig.emailjsPublicKey,
    systemConfig.adminEmail,
    systemConfig.emailjsTemplateIdSmeWelcome,
    systemConfig.emailjsTemplateIdFeedback,
    systemConfig.emailjsTemplateIdCertification,
    systemConfig.emailjsTemplateIdAdminNotification,
    systemConfig.emailjsTemplateIdSmeReassigned,
    systemConfig.requireEmailVerification,
    systemConfig.requirePhoneVerification,
    systemConfig.freeModulesLimit,
    systemConfig.approvalMode
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
  // evaluationScores removed — Capstone Reviews owns scoring now

  const isSme = currentUser?.role === 'SME' || (currentUser as any)?.reviewerRole === 'sme';
  const isReviewer = currentUser?.role === 'ADMIN' || currentUser?.role === 'SME' || (currentUser as any)?.isReviewer;

  // Force SMEs to land on their queue
  useEffect(() => {
    if (isSme && activeTab !== 'capstoneReviews') {
      setActiveTab('capstoneReviews');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSme]);

  if (!currentUser || !isReviewer) {
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

  const handleSaveWorkflowConfig = () => {
    updateSystemConfig({
      freeModulesLimit: freeModulesLimitVal,
      approvalMode: approvalModeVal
    });
    addToast("Workflow config saved successfully!", "success");
  };

  const handleSaveVerificationConfig = () => {
    updateSystemConfig({
      requireEmailVerification: requireEmailVerifVal,
      requirePhoneVerification: requirePhoneVerifVal
    });
    addToast("Sign-Up Verification settings saved successfully!", "success");
  };

  const handleSaveCredentials = () => {
    updateSystemConfig({
      emailjsServiceId: serviceId,
      emailjsTemplateId: templateId,
      emailjsPublicKey: publicKey,
      adminEmail: adminEmail,
      emailjsTemplateIdSmeWelcome: templateIdSmeWelcome,
      emailjsTemplateIdFeedback: templateIdFeedback,
      emailjsTemplateIdCertification: templateIdCertification,
      emailjsTemplateIdAdminNotification: templateIdAdminNotification,
      emailjsTemplateIdSmeReassigned: templateIdSmeReassigned
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
        addToast(`Approval email successfully sent to ${student.email}`, 'success');
      } catch (err: any) {
        addNotificationLog({
          type: 'Candidate Approval Confirmation',
          recipient: student.email,
          subject: emailSubject,
          channel: 'EmailJS API',
          status: 'Failed'
        });
        addToast(`Approval email failed to send: ${err?.message || err}`, 'error');
      }
    } else {
      addNotificationLog({
        type: 'Candidate Approval Confirmation (Mocked)',
        recipient: student.email,
        subject: emailSubject,
        channel: 'EmailJS API (Simulated)',
        status: 'Sent'
      });
      addToast(`Candidate approved (Email simulated - EmailJS keys missing)`, 'info');
    }
  };

  const handleApproveUser = async (user: UserProfile) => {
    if (approvingUid) return;
    setApprovingUid(user.uid);
    updateUserProfile(user.uid, { accountStatus: 'APPROVED' });
    await triggerApprovalEmail(user);
    setApprovingUid(null);
    alert(`Candidate ${user.name} approved! Access unlocked.`);
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
      case 'sme_welcome':
        return '{{name}} (SME name), {{email}} (SME email), {{password}} (generated password), {{loginUrl}} (SME portal link), {{adminEmail}} (admin contact email)';
      case 'reviewer_reenabled':
        return '{{name}} (SME name), {{email}} (SME email), {{password}} (new generated password), {{loginUrl}} (SME portal link), {{adminEmail}} (admin contact email)';
      case 'reviewer_password_reset':
        return '{{name}} (SME name), {{email}} (SME email), {{password}} (new reset password), {{loginUrl}} (SME portal link), {{adminEmail}} (admin contact email)';
      case 'decision_feedback':
        return '{{name}} (student name), {{email}} (student email), {{capstoneId}} (capstone ID), {{capstoneTitle}} (capstone title), {{decision}} (OUTSTANDING/PASS/REWORK/REBUILD), {{score}} (total score), {{scoreBreakdown}} (category-by-category scores), {{strengths}} (strengths comments), {{gaps}} (gaps comments), {{reworkChecklist}} (rework requirements), {{nextSteps}} (instructions based on decision), {{reviewerName}} (reviewer name), {{reviewedAt}} (reviewed date/time)';
      case 'certification_issued':
        return '{{name}} (student name), {{email}} (student email), {{capstoneId}} (capstone ID), {{capstoneTitle}} (capstone title), {{capstoneDomain}} (capstone domain), {{decision}} (OUTSTANDING/PASS), {{score}} (total score), {{certificateUrl}} (live certificate URL), {{certifiedAt}} (issued date/time), {{certifiedBy}} (signing authority name)';
      case 'capstone_submitted_admin':
        return '{{learnerName}} (student name), {{learnerEmail}} (student email), {{capstoneId}} (capstone ID), {{capstoneTitle}} (capstone title), {{capstoneDomain}} (capstone domain), {{submittedAt}} (submitted date/time), {{githubUrl}} (repo), {{firebaseUrl}} (live app), {{readmeUrl}} (readme)';
      case 'sme_reassigned':
        return '{{name}} (SME name), {{learnerName}} (student name), {{learnerEmail}} (student email), {{capstoneId}} (capstone ID), {{capstoneTitle}} (capstone title), {{capstoneDomain}} (capstone domain), {{submittedAt}} (submitted date/time), {{githubUrl}} (repo), {{firebaseUrl}} (live app), {{readmeUrl}} (readme)';
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
      firebaseDatabaseUrl: dbUrlVal.trim(),
      firebaseApiKey: firebaseApiKeyVal.trim(),
      firebaseAuthDomain: firebaseAuthDomainVal.trim(),
      firebaseProjectId: firebaseProjectIdVal.trim(),
      firebaseStorageBucket: firebaseStorageBucketVal.trim(),
      firebaseMessagingSenderId: firebaseMessagingSenderIdVal.trim(),
      firebaseAppId: firebaseAppIdVal.trim()
    });
    addToast("Database settings saved. Re-initializing app...", "info");
    setTimeout(() => {
      window.location.reload();
    }, 1500);
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
    if (newPasswordVal.length < 8) {
      addToast("Password must be at least 8 characters.", "warning");
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
        // Capture wrapper metadata (schema_version, acts, last_updated) before unpacking.
        // These describe the deck as a whole — useful for upload-time feedback.
        let schemaVersion: string | undefined;
        let actCount = 0;
        if (parsed && !Array.isArray(parsed) && Array.isArray(parsed.slides)) {
          schemaVersion = parsed.schema_version;
          actCount = Array.isArray(parsed.acts) ? parsed.acts.length : 0;
          console.log("[Admin] Unpacking slides from wrapper object...", { schema_version: schemaVersion, acts: actCount, slide_count: parsed.slides.length });
          parsed = parsed.slides;
        }
        if (!Array.isArray(parsed)) {
          setJsonValidationErrors(prev => ({ ...prev, [key]: "JSON must be a valid array of slides." }));
          addToast("Invalid JSON structure: must be an array or contain a 'slides' array.", "error");
        } else {
          // Detect per-slide act tagging even if wrapper-level acts weren't present.
          const taggedActs = new Set<string>();
          parsed.forEach((s: any) => { const a = s && (s.act || s.act_id); if (a) taggedActs.add(a); });

          const formatted = JSON.stringify(parsed, null, 2);
          if (key === 'conversational') setModSlidesConversational(formatted);
          else if (key === 'formal') setModSlidesFormal(formatted);
          else if (key === 'genz') setModSlidesGenz(formatted);
          else if (key === 'beginner') setModSlidesBeginner(formatted);
          setJsonValidationErrors(prev => ({ ...prev, [key]: null }));

          // Build a richer success message that surfaces the schema + act metadata.
          const bits = [`${parsed.length} slides`];
          if (schemaVersion) bits.push(`schema ${schemaVersion}`);
          const totalActs = actCount || taggedActs.size;
          if (totalActs > 0) bits.push(`${totalActs} acts`);
          addToast(`${key.toUpperCase()} uploaded · ${bits.join(' · ')}`, "success");
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
    if (!isTwoPresetMode || !modHasPresets) {
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
    }

    let formalParsed: any[] = [];
    if (modHasPresets && (!isTwoPresetMode || modSlidesFormal.trim())) {
      if (modSlidesFormal.trim()) {
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
      } else if (isTwoPresetMode) {
        addToast("Formal slides JSON is required.", "error");
        return;
      }
    }

    let genzParsed: any[] = [];
    if (modHasPresets && (!isTwoPresetMode || modSlidesGenz.trim())) {
      if (modSlidesGenz.trim()) {
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
      } else if (isTwoPresetMode) {
        addToast("Gen-Z slides JSON is required.", "error");
        return;
      }
    }

    let beginnerParsed: any[] = [];
    if (!isTwoPresetMode && modHasPresets && modSlidesBeginner.trim()) {
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

    const slidesPayload = modHasPresets ? (
      isTwoPresetMode ? {
        formal: formalParsed,
        genz: genzParsed
      } : {
        conversational: conversationalParsed,
        formal: formalParsed,
        genz: genzParsed,
        beginner: beginnerParsed
      }
    ) : conversationalParsed;

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
    <div className="mx-auto max-w-[1760px] px-6 lg:px-10 xl:px-14 py-6">

      {/* Panel Title — compact strip with inline status pill */}
      <div className="flex items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4 mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 text-purple-400">
            <Shield className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text-primary)] leading-tight">Admin Control Panel</h2>
            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 truncate">System configuration · approvals · talent intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden md:inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online
          </span>
          <span className="bg-purple-500/10 border border-purple-500/25 text-purple-400 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide whitespace-nowrap">
            {currentUser?.name || 'Admin'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-6">

        {/* Left Side Tab Navigation */}
        <div className="space-y-1">
          {!isSme && (
            <>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--text-muted)] px-3 pt-1 pb-1.5">Overview</p>
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
            </>
          )}

          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--text-muted)] px-3 pt-3 pb-1.5">{isSme ? 'My Work' : 'Training Ops'}</p>

          {!isSme && (
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
          )}

          <button
            onClick={() => setActiveTab('capstoneReviews')}
            className={`w-full flex items-center space-x-2 px-4 py-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'capstoneReviews'
                ? 'bg-purple-500/15 text-purple-500 border border-purple-500/20'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-500/5'
            }`}
          >
            <Award className="h-4 w-4" />
            <span>Capstone Reviews</span>
          </button>

          {!isSme && (<>
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

          {/* Project Submissions tab removed — superseded by Capstone Reviews (Module 7 workflow) */}

          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--text-muted)] px-3 pt-3 pb-1.5">Talent</p>

          <button
            onClick={() => setActiveTab('candidates')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'candidates'
                ? 'bg-purple-500/15 text-purple-500 border border-purple-500/20'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-500/5'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Radar className="h-4 w-4" />
              <span>Talent Radar</span>
            </div>
            {usersList.filter(u => u.role !== 'ADMIN').length > 0 && (
              <span className="bg-purple-500/20 text-purple-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {usersList.filter(u => u.role !== 'ADMIN').length}
              </span>
            )}
          </button>

          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--text-muted)] px-3 pt-3 pb-1.5">System</p>

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
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center space-x-2 px-4 py-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'settings'
                ? 'bg-purple-500/15 text-purple-500 border border-purple-500/20'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-500/5'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>System Settings</span>
          </button>
          </>)}
        </div>

        {/* Right Side Content Pane */}
        <div className="min-w-0 space-y-6">
          
          {/* TAB: REPORTS & INSIGHTS */}
          {activeTab === 'reports' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-250">
              {/* Hero header — matches Talent Radar polish */}
              <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-indigo-500/5 via-[var(--bg-card)]/40 to-purple-500/5 border border-[var(--border-color)]">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/25">
                    <BarChart2 className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-extrabold text-[var(--text-primary)] tracking-tight">Reports & Insights</h3>
                      <span className="text-[10px] font-extrabold text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 rounded-full uppercase tracking-[0.15em]">Live Metrics</span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed max-w-2xl">
                      Real-time view of the cohort — from anonymous landing-page traffic to certified graduates. Updated every time a visitor lands, a learner progresses, or a portfolio is reviewed.
                    </p>
                  </div>
                </div>
              </div>

              {/* Summary Cards — accent gradient per dimension */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-card rounded-2xl p-5 border border-indigo-500/25 bg-gradient-to-br from-indigo-500/8 to-transparent flex items-center justify-between hover:-translate-y-0.5 transition-all">
                  <div className="space-y-1 min-w-0">
                    <p className="text-[11px] font-extrabold text-indigo-400 uppercase tracking-[0.12em]">Total Traffic</p>
                    <h3 className="text-3xl font-extrabold text-[var(--text-primary)] leading-none mt-1">{visitorsList.length}</h3>
                    <p className="text-[10px] text-[var(--text-muted)] font-semibold mt-1.5">Unique anonymous visitors</p>
                  </div>
                  <div className="h-12 w-12 shrink-0 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
                    <Users className="h-6 w-6" />
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-5 border border-purple-500/25 bg-gradient-to-br from-purple-500/8 to-transparent flex items-center justify-between hover:-translate-y-0.5 transition-all">
                  <div className="space-y-1 min-w-0">
                    <p className="text-[11px] font-extrabold text-purple-400 uppercase tracking-[0.12em]">Explored Modules</p>
                    <h3 className="text-3xl font-extrabold text-[var(--text-primary)] leading-none mt-1">
                      {visitorsList.filter(v => v.viewedModule1 || v.viewedModule2).length}
                    </h3>
                    <p className="text-[10px] text-[var(--text-muted)] font-semibold mt-1.5">Viewed Module 1 or 2 slides</p>
                  </div>
                  <div className="h-12 w-12 shrink-0 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-400">
                    <Activity className="h-6 w-6" />
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-5 border border-cyan-500/25 bg-gradient-to-br from-cyan-500/8 to-transparent flex items-center justify-between hover:-translate-y-0.5 transition-all">
                  <div className="space-y-1 min-w-0">
                    <p className="text-[11px] font-extrabold text-cyan-400 uppercase tracking-[0.12em]">Registered Learners</p>
                    <h3 className="text-3xl font-extrabold text-[var(--text-primary)] leading-none mt-1">
                      {usersList.filter(u => u.email !== 'vthinkorchestrai@gmail.com').length}
                    </h3>
                    <p className="text-[10px] text-[var(--text-muted)] font-semibold mt-1.5">Created academy profiles</p>
                  </div>
                  <div className="h-12 w-12 shrink-0 rounded-xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </div>

                <div className="glass-card rounded-2xl p-5 border border-emerald-500/25 bg-gradient-to-br from-emerald-500/8 to-transparent flex items-center justify-between hover:-translate-y-0.5 transition-all">
                  <div className="space-y-1 min-w-0">
                    <p className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-[0.12em]">Certified Grads</p>
                    <h3 className="text-3xl font-extrabold text-[var(--text-primary)] leading-none mt-1">
                      {submissions.filter(s => s.status === 'CERTIFIED' || s.status === 'HIRE_ELIGIBLE').length}
                    </h3>
                    <p className="text-[10px] text-[var(--text-muted)] font-semibold mt-1.5">Passed portfolio review</p>
                  </div>
                  <div className="h-12 w-12 shrink-0 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                    <Award className="h-6 w-6" />
                  </div>
                </div>
              </div>

              {/* Conversion Funnel */}
              <div className="glass-card rounded-2xl p-6 border border-[var(--border-color)] space-y-6">
                <div className="flex items-start gap-3 border-b border-[var(--border-color)] pb-4">
                  <div className="h-9 w-9 shrink-0 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[var(--text-primary)] tracking-tight">Visitor Conversion Funnel</h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      The activation journey — anonymous landing visit → certified graduation.
                    </p>
                  </div>
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
              <div className="glass-card rounded-2xl p-6 border border-[var(--border-color)] space-y-6">
                <div className="flex items-start gap-3 border-b border-[var(--border-color)] pb-4">
                  <div className="h-9 w-9 shrink-0 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <BarChart2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[var(--text-primary)] tracking-tight">Modules Completion Heatmap</h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      Completion rate per module — at a glance, which content is landing and which is being skipped.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                  {Array.from({ length: 7 }).map((_, idx) => {
                    const modId = idx + 1;
                    const completions = usersList.filter(u => u.email !== 'vthinkorchestrai@gmail.com' && u.progress?.modulesCompleted?.includes(modId)).length;
                    const totalLearners = Math.max(1, usersList.filter(u => u.email !== 'vthinkorchestrai@gmail.com').length);
                    const percentage = Math.round((completions / totalLearners) * 100);
                    // Color band by completion — gives the heatmap an actual heat dimension
                    const band = percentage >= 70 ? 'from-emerald-500 to-teal-400 text-emerald-400 border-emerald-500/30 bg-emerald-500/5'
                      : percentage >= 40 ? 'from-indigo-500 to-purple-500 text-indigo-400 border-indigo-500/30 bg-indigo-500/5'
                      : percentage >= 15 ? 'from-amber-500 to-orange-500 text-amber-400 border-amber-500/30 bg-amber-500/5'
                      : 'from-slate-500 to-slate-400 text-[var(--text-muted)] border-[var(--border-color)] bg-slate-500/5';
                    const [gradCls, textCls, borderCls, bgCls] = band.split(' ');
                    return (
                      <div key={modId} className={`flex flex-col items-center p-3.5 rounded-xl border ${borderCls} ${bgCls} hover:brightness-110 transition-all group`}>
                        <span className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.12em] mb-2.5">Module {modId}</span>
                        <div className="w-7 h-24 bg-[var(--surface-sunken)] rounded-full relative overflow-hidden flex items-end">
                          <div
                            className={`w-full bg-gradient-to-t ${gradCls} ${band.split(' ').slice(1,2).join(' ')} rounded-full transition-all duration-700 group-hover:brightness-125`}
                            style={{ height: `${Math.max(4, percentage)}%` }}
                          />
                        </div>
                        <span className="text-base font-extrabold text-[var(--text-primary)] mt-3 leading-none">{completions}</span>
                        <span className={`text-[10px] font-extrabold mt-1 ${textCls}`}>{percentage}%</span>
                      </div>
                    );
                  })}
                </div>
                {/* Legend */}
                <div className="flex flex-wrap items-center gap-3 text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider pt-2 border-t border-[var(--border-color)]">
                  <span>Legend:</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> ≥70%</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-indigo-500" /> 40–69%</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> 15–39%</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-500" /> &lt;15%</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SYSTEM AUDIT LOG */}
          {activeTab === 'audit' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-250">
              {/* Hero header */}
              <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-slate-500/5 via-[var(--bg-card)]/40 to-purple-500/5 border border-[var(--border-color)]">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-slate-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-slate-500/25">
                      <Activity className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-extrabold text-[var(--text-primary)] tracking-tight">System Audit Log</h3>
                        <span className="text-[10px] font-extrabold text-purple-400 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded-full uppercase tracking-[0.15em]">Forensic Trail</span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed max-w-2xl">
                        Every settings update, login, registration, and progression event recorded. Searchable, filterable, exportable — the system's memory.
                      </p>
                    </div>
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
                      className="flex items-center gap-1.5 px-3 py-2 text-red-400 hover:bg-red-500/10 border border-red-500/30 hover:border-red-500/50 rounded-lg text-xs font-bold transition-all shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Clear Audit Logs</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Content card */}
              <div className="glass-card rounded-2xl p-6 border border-[var(--border-color)] space-y-6">

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
            </div>
          )}

          {/* TAB: CAPSTONE REVIEWS */}
          {activeTab === 'capstoneReviews' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-250">
              <CapstoneReviewsAdmin />
            </div>
          )}

          {/* TAB: MANAGE MODULES */}
          {activeTab === 'modules' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-250">
              {/* Hero header */}
              <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-amber-500/5 via-[var(--bg-card)]/40 to-orange-500/5 border border-[var(--border-color)]">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-500/25">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-extrabold text-[var(--text-primary)] tracking-tight">Manage Curriculum Modules</h3>
                      <span className="text-[10px] font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase tracking-[0.15em]">Content Studio</span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed max-w-2xl">
                      Configure each module's slides JSON, video briefing, AI avatar audio, and tone presets. Upload v6+ slide decks with acts and interactivity baked in.
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
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
                    {/* Module 7 (Practical Demo) is built as a programmatic workflow, not a slide deck —
                        it does not appear in this JSON-upload dropdown. */}
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <option key={idx + 1} value={idx + 1}>
                        Module {idx + 1}: {
                          idx === 0 ? 'The Mindset Shift' :
                          idx === 1 ? 'Framework Architecture' :
                          idx === 2 ? 'The OrchestrAI Bible (Governance-First Setup)' :
                          idx === 3 ? 'Foundation Build (Auth · Shell · Dashboard)' :
                          idx === 4 ? 'The Workflow Engine (Issues · Status · Comments · Git)' :
                          'Admin · Reports · Going Live (Capstone & GitHub Submission)'
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
                          Enable {[2, 3, 4, 5, 6].includes(selectedModId) ? '2-Preset' : '4-Tone'} Mode for this Module
                          <span title={[2, 3, 4, 5, 6].includes(selectedModId) ? "Enables separate uploads for Formal and Gen-Z slide decks." : "Enables separate uploads for Formal, Conversational, Gen-Z, and Beginner slide decks."}>
                            <HelpCircle className="h-3.5 w-3.5 text-purple-400" />
                          </span>
                        </span>
                        <span className="text-[10px] text-[var(--text-secondary)] mt-0.5 leading-relaxed block">
                          If enabled, candidates can choose their preferred learning style ({[2, 3, 4, 5, 6].includes(selectedModId) ? 'Formal or Gen-Z' : 'Conversational, Formal, Gen-Z, or Beginner'}) at launch.
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
                          Configure {isTwoPresetMode ? '2-Tone' : '4-Tone'} Presets
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
                      {(isTwoPresetMode ? ['formal', 'genz'] as const : ['conversational', 'formal', 'genz', 'beginner'] as const).map((tab) => (
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

          {/* TAB 1: SYSTEM SETTINGS (CONSOLIDATED) */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-250">
              {/* Hero header */}
              <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-violet-500/5 via-[var(--bg-card)]/40 to-fuchsia-500/5 border border-[var(--border-color)]">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-violet-500/25">
                    <Settings className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-extrabold text-[var(--text-primary)] tracking-tight">System Settings</h3>
                      <span className="text-[10px] font-extrabold text-violet-400 bg-violet-500/10 border border-violet-500/30 px-2 py-0.5 rounded-full uppercase tracking-[0.15em]">Configuration</span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed max-w-2xl">
                      Database connectivity, workflow gating rules, authentication options, and EmailJS integrations — all in one place.
                    </p>
                  </div>
                </div>
              </div>

              {/* Content card */}
              <div className="glass-card rounded-2xl p-6 border border-[var(--border-color)]">
                {/* Sub-Tab navigation bar */}
                <div className="flex flex-wrap gap-2 border-b border-[var(--border-color)] pb-4 mb-6">
                  {(['connection', 'gating', 'verification', 'emailjs', 'aireview', 'maintenance'] as const).map((subTab) => (
                    <button
                      key={subTab}
                      type="button"
                      onClick={() => setSettingsSubTab(subTab)}
                      className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        settingsSubTab === subTab
                          ? 'bg-purple-500/15 text-purple-500 border border-purple-500/20'
                          : 'border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-500/5'
                      }`}
                    >
                      {subTab === 'connection' && '🔌 Database & Auth'}
                      {subTab === 'gating' && '🚪 Access Gating'}
                      {subTab === 'verification' && '🛡️ Sign-Up Verification'}
                      {subTab === 'emailjs' && '📧 Email Config'}
                      {subTab === 'aireview' && '🤖 AI Review (Tier B)'}
                      {subTab === 'maintenance' && '⚙️ Maintenance'}
                    </button>
                  ))}
                </div>

                {/* Sub-Tab content pane */}
                <div className="space-y-6">
                  
                  {/* SUB-TAB: DATABASE & AUTH CONNECTION */}
                  {settingsSubTab === 'connection' && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      {/* Firebase database configuration */}
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

                        <div className="space-y-4">
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

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                                Firebase API Key
                              </label>
                              <input
                                type="text"
                                placeholder="AIzaSy..."
                                value={firebaseApiKeyVal}
                                onChange={(e) => setFirebaseApiKeyVal(e.target.value)}
                                className="w-full px-3 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                                Firebase Auth Domain
                              </label>
                              <input
                                type="text"
                                placeholder="your-project.firebaseapp.com"
                                value={firebaseAuthDomainVal}
                                onChange={(e) => setFirebaseAuthDomainVal(e.target.value)}
                                className="w-full px-3 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                                Firebase Project ID
                              </label>
                              <input
                                type="text"
                                placeholder="your-project-id"
                                value={firebaseProjectIdVal}
                                onChange={(e) => setFirebaseProjectIdVal(e.target.value)}
                                className="w-full px-3 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                                Firebase Storage Bucket
                              </label>
                              <input
                                type="text"
                                placeholder="your-project.firebasestorage.app"
                                value={firebaseStorageBucketVal}
                                onChange={(e) => setFirebaseStorageBucketVal(e.target.value)}
                                className="w-full px-3 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                                Firebase Messaging Sender ID
                              </label>
                              <input
                                type="text"
                                placeholder="180718842396"
                                value={firebaseMessagingSenderIdVal}
                                onChange={(e) => setFirebaseMessagingSenderIdVal(e.target.value)}
                                className="w-full px-3 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                                Firebase App ID
                              </label>
                              <input
                                type="text"
                                placeholder="1:180718842396:web:..."
                                value={firebaseAppIdVal}
                                onChange={(e) => setFirebaseAppIdVal(e.target.value)}
                                className="w-full px-3 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                              />
                            </div>
                          </div>
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

                      {/* Admin Password card */}
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
                    </div>
                  )}

                  {/* SUB-TAB: ACCESS GATING */}
                  {settingsSubTab === 'gating' && (
                    <div className="border border-[var(--border-color)] rounded-xl p-5 bg-slate-500/5 space-y-6 animate-in fade-in duration-200">
                      <div className="border-b border-[var(--border-color)] pb-3">
                        <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                          <span>🚪</span> Access Gating Settings
                        </h4>
                      </div>

                      <div className="space-y-6">
                        {/* Modules Limit Selector */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                            Free Modules Access Limit (Gate Boundary)
                          </label>
                          <select
                            value={freeModulesLimitVal}
                            onChange={(e) => setFreeModulesLimitVal(parseInt(e.target.value))}
                            className="max-w-xs w-full px-3 py-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] text-sm focus:outline-none"
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
                            <label className="flex items-start space-x-3 p-3 rounded-lg border border-[var(--border-color)] bg-slate-500/5 cursor-pointer hover:bg-slate-500/10 transition-colors">
                              <input
                                type="radio"
                                name="approvalModeRadio"
                                checked={approvalModeVal === 'MANUAL'}
                                onChange={() => setApprovalModeVal('MANUAL')}
                                className="mt-1 text-purple-500 cursor-pointer"
                              />
                              <div>
                                <span className="text-xs font-bold block">Manual Review Mode</span>
                                <span className="text-[10px] text-[var(--text-secondary)] mt-0.5 leading-relaxed block">
                                  When a student pays ₹99, their status becomes PENDING_APPROVAL. You must manually verify the transaction and click "Approve" here to unlock access.
                                </span>
                              </div>
                            </label>

                            <label className="flex items-start space-x-3 p-3 rounded-lg border border-[var(--border-color)] bg-slate-500/5 cursor-pointer hover:bg-slate-500/10 transition-colors">
                              <input
                                type="radio"
                                name="approvalModeRadio"
                                checked={approvalModeVal === 'AUTOMATED'}
                                onChange={() => setApprovalModeVal('AUTOMATED')}
                                className="mt-1 text-purple-500 cursor-pointer"
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
                            onClick={handleSaveWorkflowConfig}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded text-xs font-bold flex items-center space-x-1 shadow cursor-pointer"
                          >
                            <Save className="h-4 w-4" />
                            <span>Save Workflow Configurations</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB: TWO-LEVEL SIGN-UP VERIFICATION */}
                  {settingsSubTab === 'verification' && (
                    <div className="border border-[var(--border-color)] rounded-xl p-5 bg-slate-500/5 space-y-6 animate-in fade-in duration-200">
                      <div className="border-b border-[var(--border-color)] pb-3">
                        <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                          <span>🛡️</span> Sign-Up Verification Controls
                        </h4>
                      </div>

                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        Configure the sign-up verification workflow. Bypass OTP steps to simplify user onboarding, or enable them to verify users using email and phone OTPs.
                      </p>

                      <div className="space-y-4 max-w-2xl">
                        {/* Require Email Verification Checkbox */}
                        <div>
                          <label className="flex items-start space-x-3 p-4 rounded-lg border border-[var(--border-color)] bg-slate-500/5 cursor-pointer hover:bg-slate-500/10 transition-colors">
                            <input
                              type="checkbox"
                              checked={requireEmailVerifVal}
                              onChange={(e) => setRequireEmailVerifVal(e.target.checked)}
                              className="mt-1 h-4 w-4 rounded text-purple-500 bg-transparent border-[var(--border-color)] focus:ring-purple-500/30 cursor-pointer"
                            />
                            <div>
                              <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                                Require Email OTP Verification
                                <Mail className="h-3.5 w-3.5 text-purple-400" />
                              </span>
                              <span className="text-[10px] text-[var(--text-secondary)] mt-0.5 leading-relaxed block">
                                When enabled, users will receive a 6-digit OTP code to verify their email address before they can complete sign-up or log in. Email verification utilizes template parameters via EmailJS.
                              </span>
                            </div>
                          </label>
                        </div>

                        {/* Require Phone Verification Checkbox */}
                        <div>
                          <label className="flex items-start space-x-3 p-4 rounded-lg border border-[var(--border-color)] bg-slate-500/5 cursor-pointer hover:bg-slate-500/10 transition-colors">
                            <input
                              type="checkbox"
                              checked={requirePhoneVerifVal}
                              onChange={(e) => setRequirePhoneVerifVal(e.target.checked)}
                              className="mt-1 h-4 w-4 rounded text-purple-500 bg-transparent border-[var(--border-color)] focus:ring-purple-500/30 cursor-pointer"
                            />
                            <div>
                              <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                                Require Mobile SMS OTP Verification
                                <Shield className="h-3.5 w-3.5 text-purple-400" />
                              </span>
                              <span className="text-[10px] text-[var(--text-secondary)] mt-0.5 leading-relaxed block">
                                When enabled, users will receive an SMS verification code on their mobile number to complete registration. 
                                <strong> Note:</strong> Firebase Phone Auth is utilized. If your Firebase project is on the Spark plan, real SMS delivery might fail or throw billing errors in certain regions.
                              </span>
                            </div>
                          </label>
                        </div>

                        {/* Informational Alerts */}
                        {!requireEmailVerifVal && !requirePhoneVerifVal && (
                          <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg leading-relaxed">
                            ⚠️ <strong>Zero-Verification Mode Active:</strong> Users will be registered instantly with whatever credentials they provide, bypassing both Email and SMS verifications.
                          </div>
                        )}
                        {requireEmailVerifVal && requirePhoneVerifVal && (
                          <div className="text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-lg leading-relaxed">
                            ℹ️ <strong>Sequential Two-Level Verification Active:</strong> New users must first verify their Email via OTP, followed by Mobile SMS OTP verification, before they can complete sign-up.
                          </div>
                        )}

                        <div className="pt-4 border-t border-[var(--border-color)]">
                          <button
                            onClick={handleSaveVerificationConfig}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded text-xs font-bold flex items-center space-x-1 shadow cursor-pointer animate-in fade-in duration-100"
                          >
                            <Save className="h-4 w-4" />
                            <span>Save Verification Settings</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB: EMAIL TEMPLATES & CONFIG */}
                  {settingsSubTab === 'emailjs' && (
                    <div className="space-y-6 animate-in fade-in duration-200">
                      {/* Credentials Configuration Card */}
                      <div className="border border-[var(--border-color)] rounded-xl p-5 bg-slate-500/5 space-y-6">
                        <div className="border-b border-[var(--border-color)] pb-3">
                          <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                            <span>📧</span> EmailJS API Integration Settings
                          </h4>
                        </div>

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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                              Notification Administrator Email
                            </label>
                            <input
                              type="email"
                              placeholder="skedcom@gmail.com"
                              value={adminEmail}
                              onChange={(e) => setAdminEmail(e.target.value)}
                              className="w-full px-3 py-2 rounded border border-[var(--border-color)] bg-transparent text-[var(--text-primary)] text-xs focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                              SME Welcome Template ID (Optional)
                            </label>
                            <input
                              type="text"
                              placeholder="template_sme_welcome"
                              value={templateIdSmeWelcome}
                              onChange={(e) => setTemplateIdSmeWelcome(e.target.value)}
                              className="w-full px-3 py-2 rounded border border-[var(--border-color)] bg-transparent text-[var(--text-primary)] text-xs focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                              Learner Feedback Template ID (Optional)
                            </label>
                            <input
                              type="text"
                              placeholder="template_feedback"
                              value={templateIdFeedback}
                              onChange={(e) => setTemplateIdFeedback(e.target.value)}
                              className="w-full px-3 py-2 rounded border border-[var(--border-color)] bg-transparent text-[var(--text-primary)] text-xs focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                              Certification Issued Template ID (Optional)
                            </label>
                            <input
                              type="text"
                              placeholder="template_cert_issued"
                              value={templateIdCertification}
                              onChange={(e) => setTemplateIdCertification(e.target.value)}
                              className="w-full px-3 py-2 rounded border border-[var(--border-color)] bg-transparent text-[var(--text-primary)] text-xs focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                              Admin Submission Alert Template ID (Optional)
                            </label>
                            <input
                              type="text"
                              placeholder="template_admin_alert"
                              value={templateIdAdminNotification}
                              onChange={(e) => setTemplateIdAdminNotification(e.target.value)}
                              className="w-full px-3 py-2 rounded border border-[var(--border-color)] bg-transparent text-[var(--text-primary)] text-xs focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                              SME Reassigned Alert Template ID (Optional)
                            </label>
                            <input
                              type="text"
                              placeholder="template_sme_reassigned"
                              value={templateIdSmeReassigned}
                              onChange={(e) => setTemplateIdSmeReassigned(e.target.value)}
                              className="w-full px-3 py-2 rounded border border-[var(--border-color)] bg-transparent text-[var(--text-primary)] text-xs focus:outline-none"
                            />
                          </div>
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
                      <div className="border border-[var(--border-color)] rounded-xl p-5 bg-slate-500/5 space-y-6">
                        <div className="border-b border-[var(--border-color)] pb-3">
                          <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                            <span>📄</span> Customize Notification Templates
                          </h4>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                              Select Email Template to Edit
                            </label>
                            <select
                              value={selectedTemplateKey}
                              onChange={(e) => handleTemplateChange(e.target.value)}
                              className="max-w-xs w-full px-3 py-2 rounded border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] text-xs focus:outline-none"
                            >
                              <option value="payment_pending">Admin Alert: Payment Pending Approval</option>
                              <option value="account_approved">Student Alert: Account Access Approved</option>
                              <option value="project_submitted">Admin Alert: Project Submission Received</option>
                              <option value="certified">Student Alert: Certification Granted</option>
                              <option value="sme_welcome">SME Welcome: Credentials & Portal Access</option>
                              <option value="reviewer_reenabled">SME Re-enabled: Notice & New Credentials</option>
                              <option value="reviewer_password_reset">SME Password Reset: New Credentials</option>
                              <option value="decision_feedback">Student Notice: Capstone Decision & Rubric Feedback</option>
                              <option value="certification_issued">Student Notice: Lead Certification Granted</option>
                              <option value="capstone_submitted_admin">Admin Alert: Capstone Review Initiated</option>
                              <option value="sme_reassigned">SME Notice: Review Assigned</option>
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

                  {/* SUB-TAB: AI REVIEW (TIER B — OpenRouter → Qwen) */}
                  {settingsSubTab === 'aireview' && (
                    <AIReviewPanel />
                  )}

                  {/* SUB-TAB: SYSTEM MAINTENANCE */}
                  {settingsSubTab === 'maintenance' && (
                    <div className="border border-red-500/20 rounded-xl p-5 bg-red-500/5 space-y-4 animate-in fade-in duration-200">
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
                  )}

                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PENDING APPROVAL USERS */}
          {activeTab === 'approvals' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-250">
              {/* Hero header */}
              <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-emerald-500/5 via-[var(--bg-card)]/40 to-teal-500/5 border border-[var(--border-color)]">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/25">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-extrabold text-[var(--text-primary)] tracking-tight">Manual Approvals</h3>
                        <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-[0.15em]">Payment Gate</span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed max-w-2xl">
                        Verify ₹99 payments and unlock premium access (Modules 3–8). Pending requests show up here when the workflow is set to Manual approval mode.
                      </p>
                    </div>
                  </div>
                  {pendingUsers.length > 0 && (
                    <span className="px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-extrabold shrink-0">
                      {pendingUsers.length} pending
                    </span>
                  )}
                </div>
              </div>

              {/* Content card */}
              <div className="glass-card rounded-2xl p-6 border border-[var(--border-color)]">
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
                              disabled={approvingUid === user.uid}
                              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded text-[11px] font-bold shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {approvingUid === user.uid ? 'Approving…' : 'Approve Candidate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              </div>
            </div>
          )}


          {/* TAB 5: NOTIFICATION DELIVERY LOG */}
          {activeTab === 'logs' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-250">
              {/* Hero header */}
              <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-rose-500/5 via-[var(--bg-card)]/40 to-pink-500/5 border border-[var(--border-color)]">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-500/25">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-extrabold text-[var(--text-primary)] tracking-tight">Notification Delivery Log</h3>
                        <span className="text-[10px] font-extrabold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-full uppercase tracking-[0.15em]">Email Audit</span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed max-w-2xl">
                        Every EmailJS dispatch tracked here — payment pending alerts, approval emails, certification notices. Spot delivery failures and re-trigger from Manual Approvals.
                      </p>
                    </div>
                  </div>
                  {notificationLogs.length > 0 && (
                    <button
                      onClick={clearNotificationLogs}
                      className="flex items-center gap-1.5 px-3 py-2 text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 hover:border-rose-500/50 rounded-lg text-xs font-bold transition-all shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Clear Logs</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Content card */}
              <div className="glass-card rounded-2xl p-6 border border-[var(--border-color)]">

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
                      {[...notificationLogs]
                        .sort((a, b) => {
                          const timeA = a.createdTime || 0;
                          const timeB = b.createdTime || 0;
                          if (timeA !== timeB) return timeB - timeA;
                          return (b.timestamp || '').localeCompare(a.timestamp || '');
                        })
                        .map(log => (
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
            </div>
          )}

          {/* TAB: TALENT RADAR (merged Candidate Database + Lead Discovery) */}
          {activeTab === 'candidates' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Talent Radar header — branding + global actions */}
              <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-purple-500/5 via-[var(--bg-card)]/40 to-indigo-500/5 border border-[var(--border-color)]">
                <div className="flex items-start justify-between gap-6 flex-wrap">
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-purple-500/25">
                      <Radar className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-extrabold text-[var(--text-primary)] tracking-tight">Talent Radar</h3>
                        <span className="text-[10px] font-extrabold text-purple-400 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded-full uppercase tracking-[0.15em]">Lead Discovery</span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed max-w-2xl">
                        Every trainer ranked by Lead-Readiness Score (0–100). <Star className="inline h-3 w-3 fill-amber-400 text-amber-400 -mt-0.5" /> flags high-scorers worth recruiting.
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[10px] text-[var(--text-muted)]">
                        <span className="font-bold uppercase tracking-wider">Score weights:</span>
                        <span><strong className="text-indigo-400">30%</strong> quiz</span>
                        <span><strong className="text-indigo-400">30%</strong> engagement</span>
                        <span><strong className="text-indigo-400">25%</strong> labs</span>
                        <span><strong className="text-indigo-400">15%</strong> mastery</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={seedSampleCohort}
                      className="px-3.5 py-2 border border-[var(--border-color)] hover:border-indigo-500/40 hover:bg-indigo-500/10 rounded-lg text-xs font-bold text-[var(--text-primary)] transition-all flex items-center gap-1.5"
                      title="Seed 8 synthetic trainers so the radar populates for inspection"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> Seed cohort
                    </button>
                    <button
                      onClick={handleExportTalentCSV}
                      disabled={filteredCandidates.length === 0}
                      className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold shadow-md shadow-purple-500/25 flex items-center gap-1.5 transition-all"
                    >
                      <Download className="h-3.5 w-3.5" /> Export ({filteredCandidates.length})
                    </button>
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="glass-card rounded-xl p-4 flex items-center space-x-3.5 bg-[var(--bg-card)]/30 border border-[var(--border-color)]">
                  <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-extrabold">Total Candidates</p>
                    <p className="text-xl font-extrabold text-[var(--text-primary)] mt-0.5">{totalCands}</p>
                  </div>
                </div>

                <div className="glass-card rounded-xl p-4 flex items-center space-x-3.5 bg-[var(--bg-card)]/30 border border-[var(--border-color)]">
                  <div className="h-10 w-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-extrabold">M1 Completed</p>
                    <p className="text-xl font-extrabold text-[var(--text-primary)] mt-0.5">{m1CompleteCands}</p>
                  </div>
                </div>

                <div className="glass-card rounded-xl p-4 flex items-center space-x-3.5 bg-[var(--bg-card)]/30 border border-[var(--border-color)]">
                  <div className="h-10 w-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-extrabold">Labs Cleared</p>
                    <p className="text-xl font-extrabold text-[var(--text-primary)] mt-0.5">{labCompleteCands}</p>
                  </div>
                </div>

                <div className="glass-card rounded-xl p-4 flex items-center space-x-3.5 bg-[var(--bg-card)]/30 border border-[var(--border-color)]">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-extrabold">Certified Leads</p>
                    <p className="text-xl font-extrabold text-[var(--text-primary)] mt-0.5">{certifiedCands}</p>
                  </div>
                </div>

                {/* ── Talent Radar — Avg Readiness ── */}
                <div className="glass-card rounded-xl p-4 flex items-center space-x-3.5 bg-indigo-500/5 border border-indigo-500/25">
                  <div className="h-10 w-10 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-indigo-400 font-extrabold">Avg Readiness</p>
                    <p className="text-xl font-extrabold text-[var(--text-primary)] mt-0.5">{cohortStats.avg}<span className="text-xs text-[var(--text-secondary)] font-bold">/100</span></p>
                  </div>
                </div>

                {/* ── Talent Radar — Standouts ── */}
                <div className="glass-card rounded-xl p-4 flex items-center space-x-3.5 bg-amber-500/5 border border-amber-500/25">
                  <div className="h-10 w-10 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Star className="h-5 w-5 fill-amber-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-amber-400 font-extrabold">Standouts</p>
                    <p className="text-xl font-extrabold text-[var(--text-primary)] mt-0.5">{cohortStats.standouts}</p>
                  </div>
                </div>
              </div>

              {/* Filters Block */}
              <div className="glass-card rounded-xl p-5 space-y-4 bg-[var(--bg-card)]/30 border border-[var(--border-color)]">
                <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                  <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center space-x-1.5">
                    <Filter className="h-3.5 w-3.5 text-purple-400" />
                    <span>Filter Candidates</span>
                  </h4>
                  <span className="text-[10px] text-[var(--text-secondary)] font-semibold">Showing {filteredCandidates.length} of {totalCands} records</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {/* Search */}
                  <div className="relative col-span-1 sm:col-span-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--text-secondary)]">
                      <Search className="h-3.5 w-3.5" />
                    </span>
                    <input
                      type="text"
                      placeholder="Search name, email, phone..."
                      value={candidateSearchTerm}
                      onChange={(e) => setCandidateSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-[var(--border-color)] rounded-lg bg-slate-500/5 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:border-purple-500/55 transition-all"
                    />
                  </div>

                  {/* Score Filter */}
                  <div>
                    <select
                      value={filterScoreRange}
                      onChange={(e: any) => setFilterScoreRange(e.target.value)}
                      className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-card)]/50 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500/55 transition-all"
                    >
                      <option value="all">All Quiz Scores</option>
                      <option value="passed">Quiz Passed (≥ 80%)</option>
                      <option value="top_scored">Top Performers (≥ 90%)</option>
                    </select>
                  </div>

                  {/* Progress Filter */}
                  <div>
                    <select
                      value={filterModuleProgress}
                      onChange={(e: any) => setFilterModuleProgress(e.target.value)}
                      className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-card)]/50 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500/55 transition-all"
                    >
                      <option value="all">All Module Progress</option>
                      <option value="completed_m1">Completed Module 1</option>
                      <option value="completed_m2">Completed Module 2</option>
                      <option value="passed_lab">Passed Simulator Lab</option>
                    </select>
                  </div>

                  {/* Account Status Filter */}
                  <div>
                    <select
                      value={filterAccountStatus}
                      onChange={(e: any) => setFilterAccountStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--bg-card)]/50 text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500/55 transition-all"
                    >
                      <option value="all">All Account Statuses</option>
                      <option value="FREE_TIER">Free Tier Access</option>
                      <option value="PENDING_APPROVAL">Pending Premium Approval</option>
                      <option value="APPROVED">Approved Premium Access</option>
                      <option value="CERTIFIED">Certified / Hire Eligible</option>
                    </select>
                  </div>
                </div>

                {/* Talent Radar filters — sit alongside the existing dropdowns */}
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[var(--border-color)]/60">
                  <button
                    onClick={() => setShowStandoutsOnly((v) => !v)}
                    className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                      showStandoutsOnly
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                        : 'bg-slate-500/5 border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-amber-500/30'
                    }`}
                  >
                    <Star className={`h-3.5 w-3.5 ${showStandoutsOnly ? 'fill-amber-400' : ''}`} />
                    Standouts only
                  </button>
                  <select
                    value={filterOutreachTag}
                    onChange={(e: any) => setFilterOutreachTag(e.target.value)}
                    className="px-3 py-1.5 border border-[var(--border-color)] rounded-lg bg-[var(--bg-card)]/50 text-[11px] font-bold text-[var(--text-primary)] focus:outline-none focus:border-purple-500/55 transition-all"
                  >
                    <option value="all">All outreach tags</option>
                    <option value="Untagged">Untagged</option>
                    {OUTREACH_TAGS.map((t) => (<option key={t} value={t}>{t}</option>))}
                  </select>
                  <span className="text-[10px] text-[var(--text-muted)] italic">Table is sorted by Lead Readiness, high to low.</span>
                </div>
              </div>

              {/* Table / Database Panel */}
              <div className="glass-card rounded-xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-card)]/30">
                {filteredCandidates.length === 0 ? (
                  <div className="py-12 text-center text-[var(--text-secondary)]">
                    <Users className="h-10 w-10 text-slate-500/30 mx-auto mb-2" />
                    <p className="text-xs font-bold text-[var(--text-primary)]">No candidates matched the filters</p>
                    <p className="text-[11px] mt-1">Try adjusting your filters or search keywords.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-500/5 font-semibold text-[var(--text-primary)] border-b border-[var(--border-color)]">
                          <th className="p-3.5">Candidate</th>
                          <th className="p-3.5 text-center">Score</th>
                          <th className="p-3.5">Tag</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5">Engagement Stats</th>
                          <th className="p-3.5">Quiz Scores</th>
                          <th className="p-3.5">Lab Status</th>
                          <th className="p-3.5">Evaluation</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-secondary)]">
                        {filteredCandidates.map(candidate => {
                          const m1QuizScore = candidate.progress?.quizScores?.[1];
                          const hasM1Lab = (candidate.progress?.labsPassed || []).includes(1);

                          // Correlate with submission
                          const candidateSubmission = submissions.find(s => s.userEmail === candidate.email);

                          // Talent Radar: per-candidate readiness + outreach tag
                          const readiness = computeLeadReadiness(candidate, !!candidateSubmission);
                          const outreach = outreachData[candidate.uid];

                          return (
                            <tr key={candidate.uid} className={`transition-all ${candidate.disabled ? 'opacity-60 bg-red-950/5 hover:bg-red-950/10' : 'hover:bg-slate-500/5'}`}>
                              <td className="p-3.5 whitespace-nowrap">
                                <div className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                                  {readiness.isStandout && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />}
                                  {candidate.name || 'Anonymous Learner'}
                                </div>
                                <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">{candidate.email}</div>
                                {candidate.mobile && (
                                  <div className="text-[9px] text-purple-400 font-mono mt-0.5">{candidate.mobile}</div>
                                )}
                              </td>
                              <td className="p-3.5 whitespace-nowrap text-center">
                                <span className={`inline-block px-2.5 py-1 rounded-full border text-[11px] font-extrabold ${scoreColor(readiness.score)}`}>
                                  {readiness.score}
                                </span>
                              </td>
                              <td className="p-3.5 whitespace-nowrap">
                                <span className={`inline-block px-2 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${tagColor(outreach?.tag)}`}>
                                  {outreach?.tag || 'New'}
                                </span>
                              </td>
                              <td className="p-3.5 whitespace-nowrap">
                                {candidate.disabled ? (
                                  <span className="px-2 py-1 rounded text-[10px] font-extrabold uppercase border tracking-wide bg-red-500/10 border-red-500/20 text-red-400">
                                    Blacklisted
                                  </span>
                                ) : (
                                  <span className={`px-2 py-1 rounded text-[10px] font-extrabold uppercase border tracking-wide ${
                                    candidate.accountStatus === 'APPROVED'
                                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                      : candidate.accountStatus === 'PENDING_APPROVAL'
                                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse'
                                        : 'bg-slate-500/10 border-slate-500/20 text-[var(--text-secondary)]'
                                  }`}>
                                    {candidate.accountStatus.replace('_', ' ')}
                                  </span>
                                )}
                              </td>
                              <td className="p-3.5">
                                <div className="flex flex-wrap gap-1.5 items-center">
                                  <span className="text-[10px] font-bold text-[var(--text-primary)]">Lvl {candidate.progress?.level || 1}</span>
                                  <span className="text-[9px] text-[var(--text-secondary)]">({candidate.progress?.xp || 0} XP)</span>
                                  {candidate.progress && candidate.progress.streakDays > 0 && (
                                    <span className="text-[9px] bg-orange-500/10 text-orange-400 px-1 rounded font-semibold">🔥 {candidate.progress.streakDays}d streak</span>
                                  )}
                                  {candidate.progress?.badges && candidate.progress.badges.length > 0 && (
                                    <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-1 rounded font-semibold">🏅 {candidate.progress.badges.length} badges</span>
                                  )}
                                </div>
                              </td>
                              <td className="p-3.5 whitespace-nowrap">
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-1.5">
                                    <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-bold">Mod 1:</span>
                                    <span className={`font-mono text-[11px] font-bold ${m1QuizScore !== undefined ? (m1QuizScore >= 80 ? 'text-emerald-400' : 'text-red-400') : 'text-[var(--text-secondary)]/40'}`}>
                                      {m1QuizScore !== undefined ? `${m1QuizScore}%` : 'Not Taken'}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3.5 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                                  hasM1Lab
                                    ? 'bg-cyan-500/10 text-cyan-400'
                                    : 'bg-slate-500/10 text-[var(--text-secondary)]/50'
                                }`}>
                                  {hasM1Lab ? 'Module 1 Cleared' : 'Incomplete'}
                                </span>
                              </td>
                              <td className="p-3.5 whitespace-nowrap">
                                {candidateSubmission ? (
                                  <div className="space-y-1">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border tracking-wide ${
                                      candidateSubmission.status === 'HIRE_ELIGIBLE'
                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                        : candidateSubmission.status === 'CERTIFIED'
                                          ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                                          : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                    }`}>
                                      {candidateSubmission.status.replace('_', ' ')}
                                    </span>
                                    {candidateSubmission.automatedTotal > 0 && (
                                      <div className="text-[9px] text-[var(--text-secondary)] font-semibold mt-0.5">
                                        Score: <strong className="text-[var(--text-primary)]">{candidateSubmission.automatedTotal}%</strong>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-[10px] italic text-[var(--text-secondary)]/50">No submission</span>
                                )}
                              </td>
                              <td className="p-3.5 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end space-x-1.5">
                                  <button
                                    onClick={() => setSelectedCandidateDetail(candidate)}
                                    className="p-1.5 hover:bg-purple-500/10 hover:text-purple-400 border border-transparent hover:border-purple-500/20 rounded transition-all"
                                    title="View Profile Details"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setFeedbackCandidate(candidate);
                                      setFeedbackMessage('');
                                    }}
                                    className="p-1.5 hover:bg-blue-500/10 hover:text-blue-400 border border-transparent hover:border-blue-500/20 rounded transition-all"
                                    title="Send Instructor Feedback Email"
                                  >
                                    <Mail className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      confirmAction(
                                        candidate.disabled ? "Enable Candidate Account" : "Disable/Blacklist Candidate Account",
                                        `Are you sure you want to ${candidate.disabled ? 'enable' : 'disable/blacklist'} candidate ${candidate.name || 'Anonymous'} (${candidate.email})?`,
                                        () => toggleUserDisabledStatus(candidate.uid)
                                      );
                                    }}
                                    className={`p-1.5 border border-transparent rounded transition-all ${candidate.disabled ? 'hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20 text-emerald-400' : 'hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20'}`}
                                    title={candidate.disabled ? "Enable Account" : "Disable / Blacklist Account"}
                                  >
                                    {candidate.disabled ? (
                                      <UserCheck className="h-3.5 w-3.5" />
                                    ) : (
                                      <Ban className="h-3.5 w-3.5" />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* MODAL: View Candidate Profile Details */}
        {selectedCandidateDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass-card rounded-xl max-w-2xl w-full p-6 max-h-[85vh] overflow-y-auto relative bg-[var(--bg-card)] border border-[var(--border-color)] animate-in fade-in zoom-in-95 duration-200">
              <button
                onClick={() => setSelectedCandidateDetail(null)}
                className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-lg"
              >
                ✕
              </button>

              <div className="border-b border-[var(--border-color)] pb-4 mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                    Trainer Profile · Lead Readiness
                    {(() => {
                      const r = computeLeadReadiness(selectedCandidateDetail, submissions.some(s => s.userEmail === selectedCandidateDetail.email));
                      return r.isStandout ? <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> : null;
                    })()}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">Engagement, audit trail, and recruiting signal in one place.</p>
                </div>
                {(() => {
                  const r = computeLeadReadiness(selectedCandidateDetail, submissions.some(s => s.userEmail === selectedCandidateDetail.email));
                  return (
                    <span className={`inline-block px-3 py-1.5 rounded-xl border text-base font-extrabold ${scoreColor(r.score)}`} title="Lead Readiness Score">
                      {r.score}<span className="text-xs font-bold opacity-70">/100</span>
                    </span>
                  );
                })()}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                {/* Left Column: Personal info & Gamification */}
                <div className="space-y-4">
                  <div className="bg-slate-500/5 p-3 rounded-lg border border-[var(--border-color)]">
                    <h4 className="text-xs font-bold text-indigo-400 mb-2 uppercase tracking-wide">Candidate Identity</h4>
                    <div className="space-y-1.5 text-xs">
                      <div><span className="text-[var(--text-secondary)] font-semibold">Name:</span> <strong className="text-[var(--text-primary)]">{selectedCandidateDetail.name}</strong></div>
                      <div><span className="text-[var(--text-secondary)] font-semibold">Email:</span> <strong className="text-[var(--text-primary)]">{selectedCandidateDetail.email}</strong></div>
                      <div><span className="text-[var(--text-secondary)] font-semibold">Phone:</span> <strong className="text-[var(--text-primary)]">{selectedCandidateDetail.mobile || 'None Provided'}</strong></div>
                      <div><span className="text-[var(--text-secondary)] font-semibold">Account Level:</span> <strong className="text-[var(--text-primary)]">{selectedCandidateDetail.accountStatus}</strong></div>
                    </div>
                  </div>

                  <div className="bg-slate-500/5 p-3 rounded-lg border border-[var(--border-color)]">
                    <h4 className="text-xs font-bold text-indigo-400 mb-2 uppercase tracking-wide">Gamification Metrics</h4>
                    <div className="space-y-1.5 text-xs">
                      <div><span className="text-[var(--text-secondary)] font-semibold">XP Score:</span> <strong className="text-emerald-400">{selectedCandidateDetail.progress?.xp || 0} XP</strong></div>
                      <div><span className="text-[var(--text-secondary)] font-semibold">Level reached:</span> <strong className="text-[var(--text-primary)]">Level {selectedCandidateDetail.progress?.level || 1}</strong></div>
                      <div><span className="text-[var(--text-secondary)] font-semibold">Learning Streak:</span> <strong className="text-orange-400">{selectedCandidateDetail.progress?.streakDays || 0} days active</strong></div>
                      <div><span className="text-[var(--text-secondary)] font-semibold">Badges Awarded:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedCandidateDetail.progress?.badges && selectedCandidateDetail.progress.badges.length > 0 ? (
                            selectedCandidateDetail.progress.badges.map(b => (
                              <span key={b} className="text-[9px] bg-purple-500/10 text-purple-300 border border-purple-500/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">{b.replace('-', ' ')}</span>
                            ))
                          ) : (
                            <span className="text-[10px] text-[var(--text-secondary)]/50 italic">None unlocked yet</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Module & Quiz stats */}
                <div className="space-y-4">
                  <div className="bg-slate-500/5 p-3 rounded-lg border border-[var(--border-color)]">
                    <h4 className="text-xs font-bold text-indigo-400 mb-2 uppercase tracking-wide">Curriculum Completion</h4>
                    <div className="space-y-2.5 text-xs">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-[var(--text-secondary)]">Module 1 Slides Viewed:</span>
                          <strong className="text-[var(--text-primary)]">{selectedCandidateDetail.progress?.slidesViewed?.[1]?.length || 0} / 23</strong>
                        </div>
                        <div className="h-1.5 w-full bg-slate-500/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-500" 
                            style={{ width: `${Math.min(100, ((selectedCandidateDetail.progress?.slidesViewed?.[1]?.length || 0) / 23) * 100)}%` }}
                          />
                        </div>
                        {selectedCandidateDetail.progress?.slidesViewed?.[1] && selectedCandidateDetail.progress.slidesViewed[1].length > 0 && (
                          <div className="text-[9px] text-[var(--text-secondary)] mt-1.5 break-words">
                            <span className="font-bold">Indexes seen:</span> {selectedCandidateDetail.progress.slidesViewed[1].sort((a,b)=>a-b).map(s=>s+1).join(', ')}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-[var(--text-secondary)]">Module 2 Slides Viewed:</span>
                          <strong className="text-[var(--text-primary)]">{selectedCandidateDetail.progress?.slidesViewed?.[2]?.length || 0} / 23</strong>
                        </div>
                        <div className="h-1.5 w-full bg-slate-500/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-purple-500" 
                            style={{ width: `${Math.min(100, ((selectedCandidateDetail.progress?.slidesViewed?.[2]?.length || 0) / 23) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-500/5 p-3 rounded-lg border border-[var(--border-color)]">
                    <h4 className="text-xs font-bold text-indigo-400 mb-2 uppercase tracking-wide">Knowledge Gates & Labs</h4>
                    <div className="space-y-1.5 text-xs">
                      <div><span className="text-[var(--text-secondary)] font-semibold">Module 1 Quiz Score:</span> <strong className={`font-mono ${selectedCandidateDetail.progress?.quizScores?.[1] !== undefined ? (selectedCandidateDetail.progress.quizScores[1] >= 80 ? 'text-emerald-400' : 'text-red-400') : 'text-[var(--text-secondary)]/50'}`}>{selectedCandidateDetail.progress?.quizScores?.[1] !== undefined ? `${selectedCandidateDetail.progress.quizScores[1]}%` : 'Not Taken'}</strong></div>
                      <div><span className="text-[var(--text-secondary)] font-semibold">Module 1 Simulator Lab:</span> <strong className={selectedCandidateDetail.progress?.labsPassed?.includes(1) ? 'text-cyan-400' : 'text-[var(--text-secondary)]/50'}>{selectedCandidateDetail.progress?.labsPassed?.includes(1) ? 'Passed & Cleared' : 'Incomplete'}</strong></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Lead Readiness Profile + Outreach panel (Talent Radar) ── */}
              {(() => {
                const hasSubmission = submissions.some(s => s.userEmail === selectedCandidateDetail.email);
                const r = computeLeadReadiness(selectedCandidateDetail, hasSubmission);
                const outreach = outreachData[selectedCandidateDetail.uid];
                const rows = [
                  { label: 'Quiz aptitude',          val: r.breakdown.quiz,        max: 30 },
                  { label: 'Engagement & streak',    val: r.breakdown.engagement,  max: 30 },
                  { label: 'Application (labs)',     val: r.breakdown.application, max: 25 },
                  { label: 'Mastery (level/badges)', val: r.breakdown.mastery,     max: 15 },
                ];
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    {/* Lead readiness breakdown */}
                    <div className="bg-slate-500/5 p-4 rounded-lg border border-indigo-500/20">
                      <h4 className="text-xs font-bold text-indigo-400 mb-3 uppercase tracking-wide flex items-center gap-1.5">
                        <Radar className="h-3.5 w-3.5" /> Lead Readiness Breakdown
                      </h4>
                      {rows.map((row) => (
                        <div key={row.label} className="mb-2.5 last:mb-0">
                          <div className="flex justify-between text-[10px] font-semibold text-[var(--text-secondary)] mb-0.5">
                            <span>{row.label}</span>
                            <span className="text-[var(--text-primary)]">{row.val} / {row.max}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-[var(--surface-sunken)] overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700" style={{ width: `${(row.val / row.max) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Outreach panel */}
                    <div className="bg-slate-500/5 p-4 rounded-lg border border-purple-500/20">
                      <h4 className="text-xs font-bold text-purple-400 mb-3 uppercase tracking-wide flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" /> Outreach
                      </h4>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {OUTREACH_TAGS.map((t) => {
                          const selected = (outreach?.tag || 'New') === t;
                          return (
                            <button
                              key={t}
                              onClick={() => setOutreachTag(selectedCandidateDetail.uid, t)}
                              className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all ${
                                selected ? tagColor(t) : 'bg-slate-500/5 border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                              }`}
                            >
                              {t}
                            </button>
                          );
                        })}
                      </div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">Private notes</label>
                      <textarea
                        rows={3}
                        placeholder="Notes only you can see — strengths, gaps, when to follow up…"
                        value={outreach?.notes || ''}
                        onChange={(e) => setOutreachNotes(selectedCandidateDetail.uid, e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-sunken)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500 resize-none"
                      />
                      {outreach?.updatedAt && (
                        <p className="text-[10px] text-[var(--text-muted)] mt-1">Last updated: {new Date(outreach.updatedAt).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Audit Logs matching this user */}
              <div className="bg-slate-500/5 p-3 rounded-lg border border-[var(--border-color)]">
                <h4 className="text-xs font-bold text-indigo-400 mb-2 uppercase tracking-wide flex items-center space-x-1">
                  <Activity className="h-3.5 w-3.5" />
                  <span>Candidate Activity Audit Trail</span>
                </h4>
                
                {auditLogs.filter(log => log.userEmail === selectedCandidateDetail.email).length === 0 ? (
                  <p className="text-[11px] text-[var(--text-secondary)]/50 italic py-2">No activity audit logs registered for this user yet.</p>
                ) : (
                  <div className="max-h-[160px] overflow-y-auto border border-[var(--border-color)] rounded divide-y divide-[var(--border-color)] text-[10px] font-mono">
                    {auditLogs
                      .filter(log => log.userEmail === selectedCandidateDetail.email)
                      .map(log => (
                        <div key={log.id} className="p-2 hover:bg-slate-500/5 flex justify-between items-start space-x-2">
                          <div className="space-y-0.5">
                            <div className="font-bold text-[var(--text-primary)]">{log.type}</div>
                            <div className="text-[9px] text-[var(--text-secondary)] leading-relaxed">{log.description}</div>
                          </div>
                          <div className="text-[9px] text-[var(--text-secondary)] whitespace-nowrap shrink-0">{new Date(log.timestamp).toLocaleString()}</div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedCandidateDetail(null)}
                  className="px-4 py-2 border border-[var(--border-color)] hover:bg-slate-500/5 text-xs font-semibold rounded-lg text-[var(--text-primary)]"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Send Instructor Feedback Email */}
        {feedbackCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass-card rounded-xl max-w-md w-full p-6 relative bg-[var(--bg-card)] border border-[var(--border-color)] animate-in fade-in zoom-in-95 duration-200">
              <button
                onClick={() => setFeedbackCandidate(null)}
                className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-lg"
              >
                ✕
              </button>

              <div className="border-b border-[var(--border-color)] pb-3 mb-4">
                <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center space-x-1.5">
                  <Mail className="h-4 w-4 text-purple-500" />
                  <span>Send Candidate Feedback</span>
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">This will dispatch an email via EmailJS (if configured) or trigger a notification log.</p>
              </div>

              <div className="space-y-4">
                <div className="text-xs">
                  <span className="text-[var(--text-secondary)] font-semibold">Recipient:</span> <strong className="text-[var(--text-primary)]">{feedbackCandidate.name} ({feedbackCandidate.email})</strong>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-primary)]">Feedback Message</label>
                  <textarea
                    rows={6}
                    placeholder="Provide detailed comments on their quiz scores, lab prompt logs, or general curriculum performance..."
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-slate-500/5 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-none focus:border-purple-500/55 resize-none transition-all"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setFeedbackCandidate(null)}
                    disabled={isSendingFeedback}
                    className="px-4 py-2 border border-[var(--border-color)] hover:bg-slate-500/5 text-xs font-semibold rounded-lg text-[var(--text-primary)] disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (!feedbackMessage.trim()) return;
                      setIsSendingFeedback(true);
                      const emailSubject = `[OrchestrAI] Instructor feedback regarding your progress`;
                      const emailBody = `Hi ${feedbackCandidate.name},\n\nSithanandham R. has reviewed your certification progress and provided the following feedback:\n\n${feedbackMessage}\n\nKeep learning and building!\nProduct Owner,\nSithanandham R.`;
                      
                      const config = systemConfig;
                      const hasKeys = config.emailjsServiceId && config.emailjsTemplateId && config.emailjsPublicKey;
                      
                      if (hasKeys) {
                        try {
                          await emailjs.send(
                            config.emailjsServiceId,
                            config.emailjsTemplateId,
                            {
                              to_email: feedbackCandidate.email,
                              subject: emailSubject,
                              message: emailBody
                            },
                            config.emailjsPublicKey
                          );
                          addNotificationLog({
                            type: 'Instructor Feedback Email',
                            recipient: feedbackCandidate.email,
                            subject: emailSubject,
                            channel: 'EmailJS API',
                            status: 'Sent'
                          });
                          addToast("Feedback email sent successfully!", "success");
                        } catch (e: any) {
                          addNotificationLog({
                            type: 'Instructor Feedback Email',
                            recipient: feedbackCandidate.email,
                            subject: emailSubject,
                            channel: `EmailJS API (Error: ${e?.text || String(e)})`,
                            status: 'Failed'
                          });
                          addToast("Failed to send feedback email.", "error");
                        }
                      } else {
                        addNotificationLog({
                          type: 'Instructor Feedback Email (Simulated)',
                          recipient: feedbackCandidate.email,
                          subject: emailSubject,
                          channel: 'EmailJS API (Simulated)',
                          status: 'Sent'
                        });
                        addToast("Feedback email simulation completed successfully.", "success");
                      }
                      setIsSendingFeedback(false);
                      setFeedbackCandidate(null);
                      setFeedbackMessage('');
                    }}
                    disabled={isSendingFeedback || !feedbackMessage.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-700 hover:brightness-110 text-white text-xs font-bold rounded-lg shadow disabled:opacity-50 transition-all flex items-center justify-center space-x-1.5"
                  >
                    {isSendingFeedback ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <Mail className="h-3.5 w-3.5" />
                        <span>Send Feedback</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

// ───────────────────────────────────────────────────────────────────────────
// AI Review (Tier B) Settings Panel
// Configures the Cloud Function → OpenRouter → Qwen pipeline for capstone scoring.
// The OPENROUTER_API_KEY is set on the function side (firebase functions:secrets:set),
// NEVER in the browser. This panel only configures display preferences + tests connectivity.
// ───────────────────────────────────────────────────────────────────────────
const AIReviewPanel: React.FC = () => {
  const { systemConfig, updateSystemConfig, addToast } = useApp();

  const [enabled, setEnabled] = useState(!!systemConfig.aiReviewEnabled);
  const [model, setModel] = useState(systemConfig.aiReviewModel || 'qwen/qwen-2.5-72b-instruct');
  const [autoOnSubmit, setAutoOnSubmit] = useState(!!systemConfig.aiReviewAutoOnSubmit);
  const [functionName, setFunctionName] = useState(systemConfig.aiReviewFunctionName || 'scoreCapstoneTierB');
  const [pinging, setPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{ ok?: boolean; reply?: string; error?: string; model?: string } | null>(null);

  useEffect(() => {
    setEnabled(!!systemConfig.aiReviewEnabled);
    setModel(systemConfig.aiReviewModel || 'qwen/qwen-2.5-72b-instruct');
    setAutoOnSubmit(!!systemConfig.aiReviewAutoOnSubmit);
    setFunctionName(systemConfig.aiReviewFunctionName || 'scoreCapstoneTierB');
  }, [systemConfig.aiReviewEnabled, systemConfig.aiReviewModel, systemConfig.aiReviewAutoOnSubmit, systemConfig.aiReviewFunctionName]);

  const save = () => {
    updateSystemConfig({
      aiReviewEnabled: enabled,
      aiReviewModel: model.trim(),
      aiReviewAutoOnSubmit: autoOnSubmit,
      aiReviewFunctionName: functionName.trim()
    });
    addToast('AI Review settings saved.', 'success');
  };

  const testConnection = async () => {
    setPinging(true);
    setPingResult(null);
    try {
      const app = getFirebaseApp();
      if (!app) {
        setPingResult({ ok: false, error: 'Firebase app not initialized. Check Database & Auth tab.' });
        return;
      }
      const { getFunctions, httpsCallable } = await import('firebase/functions');
      const functions = getFunctions(app);
      const ping = httpsCallable(functions, 'pingTierBProvider');
      const res = await ping({ modelOverride: model.trim() });
      setPingResult(res.data as any);
    } catch (err: any) {
      const code = err?.code || '';
      let friendly = err?.message || String(err);
      if (code === 'functions/not-found' || /not found/i.test(friendly)) {
        friendly = 'Function "pingTierBProvider" is not deployed yet. Deploy the functions/ directory once your Blaze plan is active (see functions/README.md).';
      } else if (code === 'functions/failed-precondition') {
        friendly = err?.message || 'OPENROUTER_API_KEY secret is not set on the deployed function. See functions/README.md.';
      }
      setPingResult({ ok: false, error: friendly });
    } finally {
      setPinging(false);
    }
  };

  const MODEL_PRESETS = [
    { value: 'qwen/qwen-2.5-72b-instruct', label: 'Qwen 2.5 72B Instruct (recommended · cheapest)', costPer100: '~$0.08' },
    { value: 'anthropic/claude-3.5-haiku', label: 'Claude 3.5 Haiku (premium · clearer rationale)', costPer100: '~$0.50' },
    { value: 'openai/gpt-4o-mini', label: 'GPT-4o Mini (balanced)', costPer100: '~$0.10' },
    { value: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70B (open-weight)', costPer100: '~$0.05' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="border border-[var(--border-color)] rounded-xl p-5 bg-slate-500/5">
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🤖</span>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Tier B AI Rubric Scoring (Cloud Function → OpenRouter → Qwen)</h3>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
            systemConfig.aiReviewEnabled
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
              : 'bg-slate-500/15 border border-slate-500/30 text-slate-400'
          }`}>{systemConfig.aiReviewEnabled ? 'Enabled' : 'Disabled'}</span>
        </div>

        <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3 mb-5 text-[11px] text-indigo-300 leading-relaxed">
          <strong className="text-indigo-400">How this works:</strong> The browser calls the deployed Cloud Function via Firebase SDK. The function reads the submission from RTDB, fetches the GitHub README + file list, then calls OpenRouter (which routes to your selected model — Qwen by default). The model returns a JSON rubric score that gets written to <code className="font-mono text-indigo-200">/reviews/{'{submissionId}'}/tierBSuggestion</code>. The OpenRouter API key lives ONLY on the function side — never in the browser.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Enable toggle */}
          <div className="md:col-span-2 flex items-start gap-3 p-3 rounded-lg border border-[var(--border-color)] bg-[var(--surface-sunken)]/40">
            <input
              type="checkbox"
              id="aireview-enabled"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="mt-0.5 h-4 w-4"
            />
            <label htmlFor="aireview-enabled" className="cursor-pointer flex-1">
              <div className="text-xs font-bold text-[var(--text-primary)]">Enable Tier B AI scoring</div>
              <div className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">When enabled, reviewers see a "Run AI Tier B Scoring" button in Review Detail. Disabled = button is hidden, reviewers score manually only.</div>
            </label>
          </div>

          {/* Auto-on-submit toggle */}
          <div className="md:col-span-2 flex items-start gap-3 p-3 rounded-lg border border-[var(--border-color)] bg-[var(--surface-sunken)]/40">
            <input
              type="checkbox"
              id="aireview-auto"
              checked={autoOnSubmit}
              onChange={(e) => setAutoOnSubmit(e.target.checked)}
              disabled={!enabled}
              className="mt-0.5 h-4 w-4"
            />
            <label htmlFor="aireview-auto" className={`cursor-pointer flex-1 ${!enabled ? 'opacity-50' : ''}`}>
              <div className="text-xs font-bold text-[var(--text-primary)]">Auto-run on every new submission</div>
              <div className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">When ON, each new submission triggers Tier B scoring immediately so the reviewer sees suggestions when they open it. When OFF, reviewers click the button on-demand (saves money during testing).</div>
            </label>
          </div>

          {/* Model */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">OpenRouter Model</label>
            <select
              value={MODEL_PRESETS.some(p => p.value === model) ? model : 'custom'}
              onChange={(e) => { if (e.target.value !== 'custom') setModel(e.target.value); }}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-sunken)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-purple-500/40 mb-2"
            >
              {MODEL_PRESETS.map(p => (
                <option key={p.value} value={p.value}>{p.label} · {p.costPer100} per 100 reviews</option>
              ))}
              <option value="custom">Custom (enter slug below)</option>
            </select>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="provider/model-slug"
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-sunken)] text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-purple-500/40"
            />
            <p className="text-[10px] text-[var(--text-secondary)] mt-1">Browse all available models at <a href="https://openrouter.ai/models" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">openrouter.ai/models</a>.</p>
          </div>

          {/* Function name */}
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Cloud Function Name</label>
            <input
              type="text"
              value={functionName}
              onChange={(e) => setFunctionName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-sunken)] text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-purple-500/40"
            />
            <p className="text-[10px] text-[var(--text-secondary)] mt-1">Default: <code className="font-mono">scoreCapstoneTierB</code>. Matches the function exported in <code className="font-mono">functions/src/index.ts</code>.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-5 pt-5 border-t border-[var(--border-color)]">
          <button
            onClick={save}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:brightness-110 text-white text-xs font-extrabold shadow-md transition-all"
          >
            Save AI Review Settings
          </button>
          <button
            onClick={testConnection}
            disabled={pinging}
            className="px-5 py-2 rounded-lg border border-purple-500/30 hover:bg-purple-500/10 text-purple-400 text-xs font-extrabold transition-all disabled:opacity-50"
          >
            {pinging ? 'Testing…' : 'Test Connection'}
          </button>
        </div>

        {pingResult && (
          <div className={`mt-4 rounded-lg p-3 border text-xs leading-relaxed ${
            pingResult.ok
              ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300'
              : 'border-rose-500/30 bg-rose-500/5 text-rose-300'
          }`}>
            {pingResult.ok ? (
              <>
                <strong className="text-emerald-400">Connected.</strong> Model <code className="font-mono">{pingResult.model}</code> replied: "{pingResult.reply}"
              </>
            ) : (
              <>
                <strong className="text-rose-400">Not reachable.</strong> {pingResult.error}
              </>
            )}
          </div>
        )}
      </div>

      {/* Deployment checklist */}
      <div className="border border-[var(--border-color)] rounded-xl p-5 bg-slate-500/5">
        <h3 className="text-sm font-bold mb-3">📋 Deployment Checklist (when you upgrade to Blaze)</h3>
        <ol className="space-y-2 text-xs text-[var(--text-secondary)]">
          <li><strong className="text-[var(--text-primary)]">1.</strong> Upgrade Firebase project to Blaze plan (required for outbound HTTP calls from Cloud Functions).</li>
          <li><strong className="text-[var(--text-primary)]">2.</strong> Get your OpenRouter API key from <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">openrouter.ai/keys</a>.</li>
          <li><strong className="text-[var(--text-primary)]">3.</strong> From repo root: <code className="font-mono text-[11px] bg-[var(--surface-sunken)] px-1.5 py-0.5 rounded">cd functions && npm install && npm run build</code></li>
          <li><strong className="text-[var(--text-primary)]">4.</strong> Set the OpenRouter secret: <code className="font-mono text-[11px] bg-[var(--surface-sunken)] px-1.5 py-0.5 rounded">firebase functions:secrets:set OPENROUTER_API_KEY</code></li>
          <li><strong className="text-[var(--text-primary)]">5.</strong> Deploy: <code className="font-mono text-[11px] bg-[var(--surface-sunken)] px-1.5 py-0.5 rounded">firebase deploy --only functions</code></li>
          <li><strong className="text-[var(--text-primary)]">6.</strong> Come back here, click <strong>Test Connection</strong> — should show ✓ Connected.</li>
          <li><strong className="text-[var(--text-primary)]">7.</strong> Update Storage rules for capstone uploads (see <code className="font-mono text-[11px] bg-[var(--surface-sunken)] px-1.5 py-0.5 rounded">capstoneSubmissions/&lt;*&gt;/**</code> path in the rules block I provided).</li>
        </ol>
      </div>
    </div>
  );
};
