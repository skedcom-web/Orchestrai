import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getFirebaseDb } from '../firebase';
import { ref, set, remove, onValue } from 'firebase/database';
import { 
  FileText, UploadCloud, Download, Sparkles, Trash2, 
  Loader2, Search, BookOpen 
} from 'lucide-react';

interface ResourceItem {
  id: string;
  title: string;
  description: string;
  fileName: string;
  fileType: string;
  fileData: string; // Base64 string
  uploadedAt: number;
  uploadedBy: string;
}

export const Resources: React.FC = () => {
  const { currentUser, addToast, confirmAction } = useApp();
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Upload Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.isReviewer;

  // Real-time listener for resources list
  useEffect(() => {
    const db = getFirebaseDb();
    if (!db) {
      setLoading(false);
      return;
    }
    const resourcesRef = ref(db, 'resources');
    const unsubscribe = onValue(resourcesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list: ResourceItem[] = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        })).sort((a, b) => b.uploadedAt - a.uploadedAt);
        setResources(list);
      } else {
        setResources([]);
      }
      setLoading(false);
    }, (error) => {
      console.error('[Resources] Failed to fetch resources:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Limit to 8MB to stay safe within Firebase RTDB node limits
      if (selectedFile.size > 8 * 1024 * 1024) {
        addToast('File size exceeds the 8MB limit for references.', 'error');
        setFile(null);
        e.target.value = '';
      } else {
        setFile(selectedFile);
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !file) {
      addToast('Please complete all fields and attach a reference file.', 'warning');
      return;
    }

    setUploading(true);
    const db = getFirebaseDb();
    if (!db) {
      addToast('Database connection unavailable.', 'error');
      setUploading(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        const id = 'res_' + Math.random().toString(36).substring(2, 11);
        const newResource: Omit<ResourceItem, 'id'> = {
          title: title.trim(),
          description: description.trim(),
          fileName: file.name,
          fileType: file.type,
          fileData: base64Data,
          uploadedAt: Date.now(),
          uploadedBy: currentUser?.name ?? 'Admin',
        };

        await set(ref(db, `resources/${id}`), newResource);
        addToast('Reference document uploaded to the vault successfully!', 'success');
        
        // Reset form
        setTitle('');
        setDescription('');
        setFile(null);
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } catch (err) {
        console.error('[Resources] Upload failed:', err);
        addToast('Failed to save document in database.', 'error');
      } finally {
        setUploading(false);
      }
    };

    reader.onerror = () => {
      addToast('Error reading the file.', 'error');
      setUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleDelete = async (id: string, fileName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) return;
    const db = getFirebaseDb();
    if (!db) return;
    try {
      await remove(ref(db, `resources/${id}`));
      addToast('Reference document deleted from the vault.', 'success');
    } catch (err) {
      console.error('[Resources] Delete failed:', err);
      addToast('Failed to delete document.', 'error');
    }
  };

  const handleDownload = (resource: ResourceItem) => {
    if (!currentUser) {
      confirmAction(
        'Authentication Required 🔒',
        'You must be signed in to download reference files from the vault. Would you like to sign in now?',
        () => {
          window.dispatchEvent(new CustomEvent('orchestrai_trigger_login'));
        },
        'warning'
      );
      return;
    }
    try {
      const base64Data = resource.fileData;
      // Convert Data URL back to binary blob
      const arr = base64Data.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || resource.fileType;
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = resource.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      addToast(`Downloading ${resource.fileName}...`, 'success');
    } catch (err) {
      console.error('[Resources] Download failed:', err);
      addToast('Failed to download document.', 'error');
    }
  };

  const filteredResources = resources.filter((res) => {
    const matchText = searchQuery.toLowerCase();
    return (
      res.title.toLowerCase().includes(matchText) ||
      res.description.toLowerCase().includes(matchText) ||
      res.fileName.toLowerCase().includes(matchText)
    );
  });

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Header Banner */}
      <div className="flex flex-col items-center text-center mb-10">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-xs font-semibold mb-4">
          <BookOpen className="h-4 w-4" />
          <span>Quick Reference Vault</span>
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight mb-2">Deliverables &amp; Reference Vault</h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-xl">
          Secure repository containing approved functional specifications, architecture templates, database designs, and master prompts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Admin Upload interface / Information Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          
          {isAdmin ? (
            /* Upload Portal (Admin Only) */
            <div className="glass-card rounded-2xl p-6 border border-indigo-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-2 mb-4">
                <UploadCloud className="h-5 w-5 text-indigo-400 animate-pulse" />
                <h3 className="text-base font-extrabold">Upload Reference Document</h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mb-5 leading-relaxed">
                Add framework-approved deliverables, code briefs, or testing scripts with descriptions for candidates to reference. Limit: 8MB.
              </p>
              
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                    Document Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g. Issue Tracker Database Schema"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--surface-sunken)] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                    Short Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={3}
                    placeholder="Describe how to use this reference deliverable…"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--surface-sunken)] text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                    Select Reference File
                  </label>
                  <div className="relative border border-dashed border-[var(--border-color)] rounded-lg p-4 bg-[var(--surface-sunken)]/50 hover:bg-[var(--surface-sunken)] transition-all flex flex-col items-center justify-center text-center cursor-pointer">
                    <input
                      type="file"
                      id="file-upload"
                      onChange={handleFileChange}
                      required
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <UploadCloud className="h-7 w-7 text-[var(--text-secondary)] mb-1.5" />
                    <span className="text-[10px] text-[var(--text-primary)] font-bold truncate max-w-[200px]">
                      {file ? file.name : 'Choose file…'}
                    </span>
                    <span className="text-[9px] text-[var(--text-secondary)] mt-0.5">
                      Max: 8MB (PDF, xlsx, docx, json, sql, zip)
                    </span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:brightness-110 text-white text-xs font-extrabold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
                  ) : (
                    <><UploadCloud className="h-4 w-4" /> Publish Reference</>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* User Info Sidebar */
            <div className="glass-card rounded-2xl p-6 border border-[var(--border-color)]">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-extrabold">How to Use the Vault</h3>
              </div>
              <ul className="space-y-4 text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span>Download framework-approved specifications, database schemas, and handbooks to study successful builds.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span>Copy and reference structural templates to ensure your Module 7 Capstone aligns with OrchestrAI standards.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span>Admins regularly upload new case study reference files and playbook guides. Check back during your projects!</span>
                </li>
              </ul>
            </div>
          )}

          {/* Prompt Vault shortcuts */}
          <div className="glass-card rounded-2xl p-6 border border-[var(--border-color)]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-3">Playbook Master Prompts</h4>
            <div className="space-y-3.5">
              <div>
                <div className="text-[10px] font-bold text-indigo-400">Master Prompt T1 (Session Opener)</div>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                  "Analyse the attached documents and be ready so that we can start building our app. Stick to governance rules documents attached to make sure that we don't deviate. And create the necessary documents as part of governance rules."
                </p>
              </div>
              <div className="border-t border-[var(--border-color)] pt-3">
                <div className="text-[10px] font-bold text-indigo-400">Master Prompt T2 (Governance Bootstrap)</div>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                  "From a compliance and security standpoint, could you also address how observability, guardrails, and evaluations are built into the application to convince the clients. And also mention the key steps / Dos with respect to this while building any application in this approach."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Search & Resource Library */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Search bar */}
          <div className="glass-card rounded-xl p-3 border border-[var(--border-color)] flex items-center gap-2">
            <Search className="h-4 w-4 text-[var(--text-secondary)] shrink-0 ml-1" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference name, descriptions, or filenames…"
              className="w-full bg-transparent text-xs text-[var(--text-primary)] focus:outline-none placeholder-[var(--text-secondary)]"
            />
          </div>

          {/* Resources listing */}
          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mx-auto mb-3" />
              <p className="text-xs text-[var(--text-secondary)] font-medium">Scanning deliverables vault…</p>
            </div>
          ) : filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredResources.map((res) => (
                <div 
                  key={res.id} 
                  className="glass-card rounded-2xl p-5 border border-[var(--border-color)] hover:border-indigo-500/25 transition-all flex flex-col justify-between group relative"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(res.id, res.fileName)}
                          className="text-[var(--text-secondary)] hover:text-red-400 p-1 rounded-lg hover:bg-red-500/5 transition-all opacity-0 group-hover:opacity-100"
                          title="Delete reference"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    
                    <h4 className="text-sm font-extrabold text-[var(--text-primary)] leading-tight mb-1 truncate">
                      {res.title}
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4 line-clamp-3">
                      {res.description}
                    </p>
                  </div>

                  <div className="border-t border-[var(--border-color)] pt-3 mt-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[9px] font-bold text-[var(--text-secondary)] truncate">
                        File: {res.fileName}
                      </div>
                      <div className="text-[8px] text-[var(--text-secondary)] mt-0.5">
                        Uploaded: {new Date(res.uploadedAt).toLocaleDateString()} by {res.uploadedBy}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(res)}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/15 hover:bg-indigo-500 text-indigo-400 hover:text-white text-[10px] font-bold shadow-sm transition-all flex items-center gap-1 shrink-0"
                    >
                      <Download className="h-3 w-3" /> Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-2xl py-20 text-center border border-[var(--border-color)]">
              <FileText className="h-10 w-10 text-[var(--text-secondary)] mx-auto mb-3" />
              <h4 className="text-sm font-bold text-[var(--text-primary)]">No reference documents found</h4>
              <p className="text-xs text-[var(--text-secondary)] max-w-xs mx-auto mt-1">
                {searchQuery ? 'Try matching another search term or clearing the query.' : 'Reference templates will show here once uploaded by the administrator.'}
              </p>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
