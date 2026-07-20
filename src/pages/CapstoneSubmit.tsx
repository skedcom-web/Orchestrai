import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, get, set, update } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import emailjs from '@emailjs/browser';
import {
  ArrowLeft, Upload, Code2,ExternalLink, FileText, X, CheckCircle2,
  Send, AlertCircle, Loader, Award, Workflow as WorkflowIcon, Trash2,
  User, Lock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getFirebaseApp, getFirebaseDb } from '../firebase';
import { CAPSTONES, type Capstone as CapstoneItem } from '../data/capstones';


interface CapstoneSelection { capstoneId: string; selectedAt: number; status: string; }
interface SupportingDoc { name: string; storageUrl: string; size: number; uploadedAt: number; }
interface UploadingFile { file: File; progress: number; error?: string; }

const LOCAL_SELECTION_KEY = (uid: string) => `orchestrai_capstone_selection_${uid}`;

const validateGitHubUrl = (url: string): string | null => {
  if (!url.trim()) return 'GitHub repository URL is required';
  try {
    const u = new URL(url.trim());
    if (!u.hostname.includes('github.com')) return 'Must be a github.com URL';
    if (u.pathname.split('/').filter(Boolean).length < 2) return 'URL must point to a repo (github.com/owner/repo)';
    return null;
  } catch { return 'Not a valid URL'; }
};
const validateUrl = (url: string, fieldLabel: string, required = true): string | null => {
  if (!url.trim()) return required ? `${fieldLabel} is required` : null;
  try { new URL(url.trim()); return null; } catch { return `${fieldLabel} is not a valid URL`; }
};

export const CapstoneSubmit: React.FC = () => {
  const { currentUser, systemConfig, addToast, alertUser } = useApp();
  const navigate = useNavigate();

  const [selection, setSelection] = useState<CapstoneSelection | null>(null);
  const [loading, setLoading] = useState(true);
  const [existingSubmission, setExistingSubmission] = useState<any | null>(null);

  // Form state
  const [githubUrl, setGithubUrl] = useState('');
  const [firebaseUrl, setFirebaseUrl] = useState('');
  const [appAdminUserId, setAppAdminUserId] = useState('');
  const [appAdminPassword, setAppAdminPassword] = useState('');
  const [readmeUrl, setReadmeUrl] = useState('');
  const [workflowDiagramUrl, setWorkflowDiagramUrl] = useState('');
  const [supportingDocs, setSupportingDocs] = useState<SupportingDoc[]>([]);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [progressPct, setProgressPct] = useState<number | null>(null);

  // Load capstone selection + any prior submission
  useEffect(() => {
    if (!currentUser?.uid) { setLoading(false); return; }
    const uid = currentUser.uid;

    const localSel = localStorage.getItem(LOCAL_SELECTION_KEY(uid));
    if (localSel) { try { setSelection(JSON.parse(localSel)); } catch { /* ignore */ } }

    const db = getFirebaseDb();
    if (!db) { setLoading(false); return; }

    Promise.all([
      get(ref(db, `capstoneSelections/${uid}`)),
      get(ref(db, `submissions/${uid}`)),
      get(ref(db, `capstoneProgress/${uid}`))
    ]).then(([selSnap, subSnap, progSnap]) => {
      if (selSnap.exists()) {
        const remote = selSnap.val();
        setSelection(remote);
        localStorage.setItem(LOCAL_SELECTION_KEY(uid), JSON.stringify(remote));
      }
      if (subSnap.exists()) {
        // Find the latest submission for the locked capstone
        const all = subSnap.val();
        const latest = Object.values(all).sort((a: any, b: any) => (b.submittedAt || 0) - (a.submittedAt || 0))[0];
        if (latest) setExistingSubmission(latest);
      }
      if (progSnap.exists() && progSnap.val().items) {
        const prog = progSnap.val();
        const done = Object.values(prog.items).filter(Boolean).length;
        const pct = Math.round((done / 27) * 100);
        setProgressPct(pct);
      } else {
        setProgressPct(0);
      }
      setLoading(false);
    }).catch(() => {
      setProgressPct(0);
      setLoading(false);
    });
  }, [currentUser?.uid]);

  const capstone = useMemo((): CapstoneItem | null => {
    if (!selection) return null;
    return CAPSTONES.find((c) => c.id === selection.capstoneId) || null;
  }, [selection]);

  // ─── Upload supporting docs ────────────────────────────────────────────────
  const onFilePick = async (files: FileList | null) => {
    if (!files || files.length === 0 || !currentUser?.uid || !capstone) return;
    const app = getFirebaseApp();
    if (!app) {
      addToast('Cloud storage not configured. Document upload unavailable.', 'error');
      return;
    }

    let storage;
    try {
      storage = getStorage(app);
    } catch (err: any) {
      console.error('[CapstoneSubmit] getStorage() threw:', err);
      addToast(`Firebase Storage unavailable: ${err?.message || err}. Use the URL-paste field below as a fallback.`, 'error');
      return;
    }

    const uploads: UploadingFile[] = Array.from(files).map((f) => ({ file: f, progress: 0 }));
    setUploading((prev) => [...prev, ...uploads]);

    for (const u of uploads) {
      if (u.file.size > 25 * 1024 * 1024) {
        setUploading((prev) => prev.map((x) => x.file === u.file ? { ...x, error: 'File >25MB — too large' } : x));
        continue;
      }
      const safeName = u.file.name.replace(/[^\w.-]/g, '_');
      const path = `capstoneSubmissions/${currentUser.uid}_${capstone.id}/${Date.now()}_${safeName}`;
      console.log('[CapstoneSubmit] Starting upload:', { path, size: u.file.size, type: u.file.type });

      let task;
      try {
        const sref = storageRef(storage, path);
        task = uploadBytesResumable(sref, u.file);
      } catch (err: any) {
        console.error('[CapstoneSubmit] uploadBytesResumable() threw:', err);
        setUploading((prev) => prev.map((x) => x.file === u.file ? { ...x, error: `Upload init failed: ${err?.message || err}` } : x));
        continue;
      }

      await new Promise<void>((resolve) => {
        let sawAnyEvent = false;

        // 25s stall watchdog — if no progress event fires, fail loud
        const stallTimer = setTimeout(() => {
          if (!sawAnyEvent) {
            console.error('[CapstoneSubmit] Upload stalled — no events in 25s. Likely cause: Firebase Storage rules denying write, Storage not enabled on project, or CORS blocking preflight.');
            try { task!.cancel(); } catch { /* ignore */ }
            setUploading((prev) => prev.map((x) => x.file === u.file ? {
              ...x,
              error: 'Upload stalled (no response in 25s). Most likely your Firebase Storage rules block writes from this app. Use the URL-paste field below as a fallback, or ask the admin to update Storage rules.'
            } : x));
            resolve();
          }
        }, 25000);

        task!.on(
          'state_changed',
          (snap) => {
            sawAnyEvent = true;
            const pct = snap.totalBytes > 0 ? Math.round((snap.bytesTransferred / snap.totalBytes) * 100) : 0;
            setUploading((prev) => prev.map((x) => x.file === u.file ? { ...x, progress: pct } : x));
          },
          (err: any) => {
            sawAnyEvent = true;
            clearTimeout(stallTimer);
            console.error('[CapstoneSubmit] Upload error event:', { code: err?.code, message: err?.message, serverResponse: err?.serverResponse });
            let friendly = err?.message || 'Upload failed';
            if (err?.code === 'storage/unauthorized') friendly = 'Firebase Storage rules denied this upload. The admin needs to allow writes to capstoneSubmissions/*. Use URL-paste below as a fallback.';
            else if (err?.code === 'storage/unknown') friendly = 'Firebase Storage rejected the request — could be CORS, disabled Storage, or wrong bucket. Check browser console + Firebase Storage tab.';
            else if (err?.code === 'storage/canceled') friendly = 'Upload was canceled.';
            setUploading((prev) => prev.map((x) => x.file === u.file ? { ...x, error: friendly } : x));
            resolve();
          },
          async () => {
            sawAnyEvent = true;
            clearTimeout(stallTimer);
            try {
              const url = await getDownloadURL(task!.snapshot.ref);
              setSupportingDocs((prev) => [...prev, { name: u.file.name, storageUrl: url, size: u.file.size, uploadedAt: Date.now() }]);
              setUploading((prev) => prev.filter((x) => x.file !== u.file));
            } catch (err: any) {
              console.error('[CapstoneSubmit] getDownloadURL failed:', err);
              setUploading((prev) => prev.map((x) => x.file === u.file ? { ...x, error: `Uploaded, but cannot fetch URL: ${err?.message || err}` } : x));
            }
            resolve();
          }
        );
      });
    }
  };

  // ─── URL-paste fallback for supporting docs ────────────────────────────────
  const [pasteDocUrl, setPasteDocUrl] = useState('');
  const [pasteDocName, setPasteDocName] = useState('');
  const addPastedDoc = () => {
    if (!pasteDocUrl.trim()) { addToast('Paste a URL first.', 'warning'); return; }
    try { new URL(pasteDocUrl.trim()); } catch { addToast('That is not a valid URL.', 'error'); return; }
    setSupportingDocs((prev) => [...prev, {
      name: pasteDocName.trim() || pasteDocUrl.trim().split('/').pop() || 'document',
      storageUrl: pasteDocUrl.trim(),
      size: 0,
      uploadedAt: Date.now()
    }]);
    setPasteDocUrl('');
    setPasteDocName('');
    addToast('Hosted document added.', 'success');
  };

  const removeDoc = (idx: number) => {
    setSupportingDocs((prev) => prev.filter((_, i) => i !== idx));
  };
  const cancelUploading = (file: File) => {
    setUploading((prev) => prev.filter((x) => x.file !== file));
  };


  // ─── Send notification email to admin ──────────────────────────────────────
  const sendNotificationEmail = async (params: {
    learnerName: string; learnerEmail: string;
    reviewerName: string; reviewerEmail: string;
    capstoneId: string; capstoneTitle: string; capstoneDomain: string;
    submittedAt: string; githubUrl: string; firebaseUrl: string;
    appAdminUserId: string; appAdminPassword: string;
    readmeUrl: string; workflowDiagramUrl: string; supportingDocsCount: number;
  }) => {
    const serviceId = systemConfig.emailjsServiceId;
    const templateId = systemConfig.emailjsTemplateIdAdminNotification || systemConfig.emailjsTemplateId;
    // Use Admin-managed template (Admin → Settings → Email Templates → capstone_submitted_admin)
    const configTemplate = systemConfig.templates?.capstone_submitted_admin || { subject: '', body: '' };
    const templateSubject = configTemplate.subject;
    const templateBody = configTemplate.body;

    const publicKey = systemConfig.emailjsPublicKey;
    if (!serviceId || !templateId || !publicKey) {
      console.warn('[CapstoneSubmit] EmailJS not configured — skipping notification email.');
      return { skipped: true };
    }

    const subject = templateSubject
      .replace(/{{capstoneId}}/g, params.capstoneId)
      .replace(/{{learnerName}}/g, params.learnerName);

    const body = templateBody
      .replace(/{{learnerName}}/g, params.learnerName)
      .replace(/{{learnerEmail}}/g, params.learnerEmail)
      .replace(/{{capstoneId}}/g, params.capstoneId)
      .replace(/{{capstoneTitle}}/g, params.capstoneTitle)
      .replace(/{{capstoneDomain}}/g, params.capstoneDomain)
      .replace(/{{submittedAt}}/g, params.submittedAt)
      .replace(/{{githubUrl}}/g, params.githubUrl)
      .replace(/{{firebaseUrl}}/g, params.firebaseUrl)
      .replace(/{{appAdminUserId}}/g, params.appAdminUserId)
      .replace(/{{appAdminPassword}}/g, params.appAdminPassword)
      .replace(/{{readmeUrl}}/g, params.readmeUrl);

    try {
      await emailjs.send(serviceId, templateId, {
        name: 'vThink OrchestrAI Admin',
        email: 'vthinkorchestrai@gmail.com',
        to_email: 'vthinkorchestrai@gmail.com',
        adminEmail: 'vthinkorchestrai@gmail.com',
        reviewerEmail: 'vthinkorchestrai@gmail.com',
        recipient: 'vthinkorchestrai@gmail.com',
        to: 'vthinkorchestrai@gmail.com',
        subject,
        message: body,
        body,
        learnerName: params.learnerName,
        learnerEmail: params.learnerEmail,
        capstoneId: params.capstoneId,
        capstoneTitle: params.capstoneTitle,
        githubUrl: params.githubUrl,
        firebaseUrl: params.firebaseUrl,
        appAdminUserId: params.appAdminUserId,
        appAdminPassword: params.appAdminPassword
      }, { publicKey });
      return { sent: true };
    } catch (err: any) {
      console.error('[CapstoneSubmit] EmailJS send failed:', err);
      return { error: err?.text || err?.message || 'EmailJS send failed' };
    }
  };

  // ─── Submit handler ────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!currentUser?.uid || !capstone) return;

    if (progressPct !== null && progressPct < 100) {
      addToast('You must complete 100% of the 5-day build plan checklist in the Capstone Workspace before submitting.', 'error');
      return;
    }

    const e: Record<string, string> = {};
    const ge = validateGitHubUrl(githubUrl); if (ge) e.githubUrl = ge;
    const fe = validateUrl(firebaseUrl, 'Firebase live URL'); if (fe) e.firebaseUrl = fe;
    if (!appAdminUserId.trim()) e.appAdminUserId = 'Application Admin User ID is required';
    if (!appAdminPassword.trim()) e.appAdminPassword = 'Application Admin Password is required';
    const re = validateUrl(readmeUrl, 'README URL'); if (re) e.readmeUrl = re;
    const we = validateUrl(workflowDiagramUrl, 'Workflow diagram URL', false); if (we) e.workflowDiagramUrl = we;
    setErrors(e);
    if (Object.keys(e).length > 0) {
      addToast('Please fix the highlighted fields and try again.', 'warning');
      return;
    }
    if (uploading.length > 0) {
      addToast('Wait for in-progress uploads to finish (or cancel them).', 'warning');
      return;
    }

    setSubmitting(true);

    const submissionId = `${currentUser.uid}_${capstone.id}`;
    const submittedAt = Date.now();
    const submittedAtIso = new Date(submittedAt).toISOString();

    const reviewer = {
      uid: 'admin-new-uid',
      name: 'vThink OrchestrAI Admin',
      email: systemConfig.adminEmail || 'vthinkorchestrai@gmail.com'
    };

    const submission = {
      submissionId,
      learnerUid: currentUser.uid,
      learnerName: currentUser.name,
      learnerEmail: currentUser.email,
      capstoneId: capstone.id,
      capstoneTitle: capstone.title,
      capstoneDomain: capstone.domain,
      githubUrl: githubUrl.trim(),
      firebaseUrl: firebaseUrl.trim(),
      appAdminUserId: appAdminUserId.trim(),
      appAdminPassword: appAdminPassword.trim(),
      readmeUrl: readmeUrl.trim(),
      workflowDiagramUrl: workflowDiagramUrl.trim() || '',
      supportingDocs,
      submittedAt,
      status: 'submitted',
      assignedReviewerUid: reviewer.uid,
      assignedReviewerName: reviewer.name,
      assignedReviewerEmail: reviewer.email,
      assignedAt: submittedAt
    };

    const db = getFirebaseDb();
    if (db) {
      try {
        await set(ref(db, `submissions/${currentUser.uid}/${capstone.id}`), submission);
        await update(ref(db, `capstoneSelections/${currentUser.uid}`), {
          status: 'submitted',
          submittedAt
        });

        // Reset any existing review record (e.g. from rework loop) to draft status
        try {
          const reviewRef = ref(db, `reviews/${submissionId}`);
          const reviewSnap = await get(reviewRef);
          if (reviewSnap.exists()) {
            await update(reviewRef, {
              isDraft: true,
              resubmittedAt: submittedAt
            });
          }
        } catch (revErr) {
          console.warn('[CapstoneSubmit] Failed to reset review record to draft status:', revErr);
        }

        // Trigger Tier A deterministic checks via Cloud Function (background) - Commented out for MVP (no Blaze plan)
        /*
        const app = getFirebaseApp();
        if (app) {
          import('firebase/functions')
            .then(({ getFunctions, httpsCallable }) => {
              const functions = getFunctions(app);
              const fn = httpsCallable(functions, 'scoreCapstoneTierB');
              fn({ submissionId, tierAOnly: true })
                .then((res) => console.log('[CapstoneSubmit] Tier A checks complete:', res.data))
                .catch((err) => console.error('[CapstoneSubmit] Tier A checks failed:', err));
            })
            .catch((err) => console.error('[CapstoneSubmit] Failed to import firebase/functions:', err));
        }
        */

      } catch (err: any) {
        console.error('[CapstoneSubmit] RTDB write failed:', err);
        addToast(`Cloud save failed: ${err?.message || err}. Try again.`, 'error');
        setSubmitting(false);
        return;
      }
    } else {
      addToast('Cloud database unavailable — submission cannot be persisted.', 'error');
      setSubmitting(false);
      return;
    }

    const emailRes = await sendNotificationEmail({
      learnerName: currentUser.name,
      learnerEmail: currentUser.email,
      reviewerName: reviewer.name,
      reviewerEmail: reviewer.email,
      capstoneId: capstone.id,
      capstoneTitle: capstone.title,
      capstoneDomain: capstone.domain,
      submittedAt: submittedAtIso,
      githubUrl: githubUrl.trim(),
      firebaseUrl: firebaseUrl.trim(),
      appAdminUserId: appAdminUserId.trim(),
      appAdminPassword: appAdminPassword.trim(),
      readmeUrl: readmeUrl.trim(),
      workflowDiagramUrl: workflowDiagramUrl.trim() || '',
      supportingDocsCount: supportingDocs.length
    });

    setSubmitting(false);
    setExistingSubmission(submission);

    if (emailRes.skipped) {
      alertUser(
        'Capstone Submitted',
        `${capstone.id} has been submitted for review. It is currently awaiting review/assignment. Email notification is queued but EmailJS is not configured on the admin side — the administrator will pick it up from the admin queue.`,
        'success'
      );
    } else if (emailRes.error) {
      alertUser(
        'Submitted — Notification Failed',
        `${capstone.id} was saved to the cloud and is awaiting review. The administrator alert email failed to send (${emailRes.error}). The administrator can still see it in the admin queue.`,
        'warning'
      );
    } else {
      alertUser(
        'Capstone Submitted',
        `${capstone.id} has been submitted for review and is awaiting review or reviewer assignment. An email alert has been sent to the administrator.`,
        'success'
      );
    }
  };

  // ─── Render: not signed in ─────────────────────────────────────────────────
  if (!currentUser) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="glass-card rounded-2xl p-10 text-center">
          <h1 className="text-2xl font-extrabold mb-4">Sign in to submit your capstone</h1>
          <button onClick={() => navigate('/')} className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-bold">
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }
  if (loading) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-[var(--text-secondary)]">Loading…</div>;
  }
  if (!capstone) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="glass-card rounded-2xl p-10 text-center">
          <Award className="h-12 w-12 text-indigo-400 mx-auto mb-4" />
          <h1 className="text-2xl font-extrabold mb-2">No capstone locked</h1>
          <p className="text-sm text-[var(--text-secondary)] mb-6">Lock a capstone first, then return here to submit.</p>
          <button onClick={() => navigate('/capstone')} className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-bold">Browse Capstone Library</button>
        </div>
      </div>
    );
  }

  // ─── Already submitted view ────────────────────────────────────────────────
  if (existingSubmission) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <button onClick={() => navigate('/capstone/workspace')} className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-indigo-400 mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Workspace
        </button>
        <div className="glass-card rounded-2xl p-7 border border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">Submitted</div>
              <h1 className="text-xl font-extrabold">{existingSubmission.capstoneId} · {existingSubmission.capstoneTitle}</h1>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 text-xs">
            <Field label="Submitted">{new Date(existingSubmission.submittedAt).toLocaleString()}</Field>
            <Field label="Status">{(existingSubmission.status || 'assigned').replace(/_/g, ' ')}</Field>
            <Field label="Assigned Reviewer">{existingSubmission.assignedReviewerName || '—'}</Field>
            <Field label="Reviewer Email">{existingSubmission.assignedReviewerEmail || '—'}</Field>
            <Field label="GitHub"><a href={existingSubmission.githubUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline break-all">{existingSubmission.githubUrl}</a></Field>
            <Field label="Firebase Live"><a href={existingSubmission.firebaseUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline break-all">{existingSubmission.firebaseUrl}</a></Field>
            <Field label="App Admin User ID">{existingSubmission.appAdminUserId || '—'}</Field>
            <Field label="App Admin Password">{existingSubmission.appAdminPassword || '—'}</Field>
            <Field label="README"><a href={existingSubmission.readmeUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline break-all">{existingSubmission.readmeUrl}</a></Field>
            <Field label="Supporting Docs">{(existingSubmission.supportingDocs || []).length} file(s)</Field>
          </div>
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3 text-xs text-indigo-300">
            <strong className="text-indigo-400">What happens next:</strong> Your assigned reviewer scores the submission against the 9-category rubric (out of 100). You'll receive a decision report by email when the review completes. Decision thresholds — ≥85 Outstanding · ≥70 Pass · 50–69 Rework · &lt;50 Rebuild.
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button onClick={() => navigate('/capstone')} className="px-4 py-2 rounded-lg border border-[var(--border-color)] text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)]">Back to Library</button>
            <button
              onClick={() => { setExistingSubmission(null); setGithubUrl(existingSubmission.githubUrl); setFirebaseUrl(existingSubmission.firebaseUrl); setAppAdminUserId(existingSubmission.appAdminUserId || ''); setAppAdminPassword(existingSubmission.appAdminPassword || ''); setReadmeUrl(existingSubmission.readmeUrl); setWorkflowDiagramUrl(existingSubmission.workflowDiagramUrl || ''); setSupportingDocs(existingSubmission.supportingDocs || []); }}
              className="px-4 py-2 rounded-lg border border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-400 text-xs font-bold"
            >
              Resubmit / Update
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Form ──────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">

      <button onClick={() => navigate('/capstone/workspace')} className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-indigo-400 mb-4">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Workspace
      </button>

      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/25 bg-indigo-500/5 text-indigo-400 text-xs font-bold mb-3">
          <Send className="h-3.5 w-3.5" /> Module 7 · Submit Your Capstone
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">{capstone.id} · {capstone.title}</h1>
        <p className="text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
          Submit the 4 required URLs + any supporting documents you'd like the reviewer to see. The administrator is notified and will assign a reviewer.
        </p>
      </div>

      {progressPct !== null && progressPct < 100 && (
        <div className="mb-6 p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-300 text-xs flex items-start gap-3 animate-in fade-in duration-200">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
          <div className="space-y-1">
            <strong className="block font-bold text-sm text-rose-200">Checklist Incomplete ({progressPct}%)</strong>
            <p className="leading-relaxed">
              You must complete all 27 tasks in the 5-Day Build Plan checklist within the Capstone Workspace before you can submit your project for review.
            </p>
            <p className="text-[10px] text-rose-400 font-medium">
              Go to the <span onClick={() => navigate('/capstone/workspace')} className="underline hover:text-indigo-400 cursor-pointer">Workspace 5-Day Build Plan tab</span> to complete your checklist tasks.
            </p>
          </div>
        </div>
      )}

      {/* Required URLs */}
      <div className="glass-card rounded-2xl p-6 mb-5 space-y-4">
        <h2 className="text-sm font-extrabold flex items-center gap-2 mb-1">
          <Code2 className="h-4 w-4 text-indigo-400" /> Required Links
        </h2>

        <UrlField
          label="GitHub Repository URL"
          placeholder="https://github.com/yourname/your-capstone-repo"
          value={githubUrl}
          onChange={setGithubUrl}
          error={errors.githubUrl}
          icon={<Code2 className="h-4 w-4" />}
          help="Public repository. The reviewer reads the code, README, commits, and DESIGN.md."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <UrlField
              label="Firebase Live URL"
              placeholder="https://your-capstone.web.app"
              value={firebaseUrl}
              onChange={setFirebaseUrl}
              error={errors.firebaseUrl}
              icon={<ExternalLink className="h-4 w-4" />}
              help="Your deployed app. The reviewer opens it, signs in, walks through the workflow."
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5 font-sans">
              App Admin User ID <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={appAdminUserId}
                onChange={(e) => setAppAdminUserId(e.target.value)}
                placeholder="Admin<your capstone number>"
                className={`w-full pl-10 pr-3 py-2 rounded-lg border bg-[var(--surface-sunken)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none transition-all ${
                  errors.appAdminUserId ? 'border-rose-500/40 focus:border-rose-500/60' : 'border-[var(--border-color)] focus:border-indigo-500/40'
                }`}
              />
            </div>
            {errors.appAdminUserId ? (
              <p className="text-[10px] text-rose-400 mt-1 font-bold">{errors.appAdminUserId}</p>
            ) : (
              <p className="text-[10px] text-[var(--text-secondary)] mt-1 leading-relaxed">Admin username. Suggested: <code className="text-indigo-400 font-mono">Admin&lt;your capstone number&gt;</code></p>
            )}
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5 font-sans">
              App Admin Password <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={appAdminPassword}
                onChange={(e) => setAppAdminPassword(e.target.value)}
                placeholder="e.g. Admin@123"
                className={`w-full pl-10 pr-3 py-2 rounded-lg border bg-[var(--surface-sunken)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none transition-all ${
                  errors.appAdminPassword ? 'border-rose-500/40 focus:border-rose-500/60' : 'border-[var(--border-color)] focus:border-indigo-500/40'
                }`}
              />
            </div>
            {errors.appAdminPassword ? (
              <p className="text-[10px] text-rose-400 mt-1 font-bold">{errors.appAdminPassword}</p>
            ) : (
              <p className="text-[10px] text-[var(--text-secondary)] mt-1 leading-relaxed">Admin password. Suggested: <code className="text-indigo-400 font-mono">Admin@123</code></p>
            )}
          </div>
        </div>
        <UrlField
          label="README URL"
          placeholder="https://github.com/yourname/your-capstone-repo/blob/main/README.md"
          value={readmeUrl}
          onChange={setReadmeUrl}
          error={errors.readmeUrl}
          icon={<FileText className="h-4 w-4" />}
          help="Direct link to your README. Should describe what was built, how to run it, and which capstone it implements."
        />
        <UrlField
          label="Workflow Diagram URL (optional)"
          placeholder="https://… link to your workflow PNG or Markdown"
          value={workflowDiagramUrl}
          onChange={setWorkflowDiagramUrl}
          error={errors.workflowDiagramUrl}
          icon={<WorkflowIcon className="h-4 w-4" />}
          help="Optional — strongly recommended. Pushes your score on the Workflow category (20 pts, highest weight)."
          required={false}
        />
      </div>

      {/* Supporting Docs */}
      <div className="glass-card rounded-2xl p-6 mb-5">
        <h2 className="text-sm font-extrabold flex items-center gap-2 mb-1">
          <Upload className="h-4 w-4 text-indigo-400" /> Supporting Documents (optional)
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">
          Upload supporting docs your reviewer should see — manual, test plan, FDD, TDD, DB design, UI specs, screenshots etc. Max 25 MB per file.
        </p>

        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-400 text-xs font-bold transition-all">
          <Upload className="h-3.5 w-3.5" /> Choose files…
          <input type="file" multiple className="hidden" onChange={(e) => onFilePick(e.target.files)} />
        </label>

        {/* URL-paste fallback */}
        <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex items-start gap-2 mb-3">
            <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-amber-300 leading-relaxed">
              <strong>File upload not working?</strong> If Firebase Storage rules block uploads from this app, paste a hosted URL instead (Google Drive share link, GitHub raw URL, S3, Dropbox public link, etc.). Both options write the same record — reviewers will see whatever you provide.
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_auto] gap-2">
            <input
              type="text"
              value={pasteDocName}
              onChange={(e) => setPasteDocName(e.target.value)}
              placeholder="Doc name (optional)"
              className="px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-sunken)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-amber-500/40"
            />
            <input
              type="url"
              value={pasteDocUrl}
              onChange={(e) => setPasteDocUrl(e.target.value)}
              placeholder="https://… paste your hosted document URL"
              className="px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--surface-sunken)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-amber-500/40"
            />
            <button
              type="button"
              onClick={addPastedDoc}
              className="px-4 py-2 rounded-lg bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 text-amber-400 text-xs font-bold transition-all"
            >
              Add Link
            </button>
          </div>
        </div>

        {(uploading.length > 0 || supportingDocs.length > 0) && (
          <div className="mt-4 space-y-2">
            {uploading.map((u) => (
              <div key={u.file.name + u.file.size} className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-sunken)] p-3 flex items-center gap-3">
                {u.error ? <AlertCircle className="h-4 w-4 text-rose-400" /> : <Loader className="h-4 w-4 text-indigo-400 animate-spin" />}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate">{u.file.name}</div>
                  {u.error ? (
                    <div className="text-[11px] text-rose-400">{u.error}</div>
                  ) : (
                    <div className="mt-1 h-1.5 rounded-full bg-[var(--border-color)] overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all" style={{ width: `${u.progress}%` }} />
                    </div>
                  )}
                </div>
                <button onClick={() => cancelUploading(u.file)} className="text-[var(--text-secondary)] hover:text-rose-400">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {supportingDocs.map((d, i) => (
              <div key={d.storageUrl} className="rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-3 flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <a href={d.storageUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[var(--text-primary)] hover:text-indigo-400 truncate block">{d.name}</a>
                  <div className="text-[10px] text-[var(--text-secondary)]">{(d.size / 1024).toFixed(1)} KB</div>
                </div>
                <button onClick={() => removeDoc(i)} className="text-[var(--text-secondary)] hover:text-rose-400" title="Remove from submission">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between flex-wrap gap-3 sticky bottom-4 z-10">
        <div className="text-[11px] text-[var(--text-secondary)] leading-relaxed max-w-md">
          By submitting, you confirm your repo is public, your live URL is reachable, and you've followed the build discipline taught in Modules 3–6.
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitting || uploading.length > 0 || (progressPct !== null && progressPct < 100)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-extrabold shadow-md transition-all"
        >
          {submitting ? <><Loader className="h-4 w-4 animate-spin" /> Submitting…</> : <><Send className="h-4 w-4" /> Submit for Review</>}
        </button>
      </div>
    </div>
  );
};

// ─── Subcomponents ──────────────────────────────────────────────────────────
const UrlField: React.FC<{
  label: string; placeholder: string; value: string; onChange: (v: string) => void;
  error?: string; icon: React.ReactNode; help?: string; required?: boolean;
}> = ({ label, placeholder, value, onChange, error, icon, help, required = true }) => (
  <div>
    <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
      {label} {required && <span className="text-rose-400">*</span>}
    </label>
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">{icon}</div>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-10 pr-3 py-2 rounded-lg border bg-[var(--surface-sunken)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none transition-all ${
          error ? 'border-rose-500/40 focus:border-rose-500/60' : 'border-[var(--border-color)] focus:border-indigo-500/40'
        }`}
      />
    </div>
    {help && !error && <p className="text-[10px] text-[var(--text-secondary)] mt-1 leading-relaxed">{help}</p>}
    {error && <p className="text-[10px] text-rose-400 mt-1 font-bold">{error}</p>}
  </div>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-sunken)]/50 p-3">
    <div className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1">{label}</div>
    <div className="text-xs text-[var(--text-primary)]">{children}</div>
  </div>
);
