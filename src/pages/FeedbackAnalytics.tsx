/**
 * FeedbackAnalytics.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Admin-only Feedback Analytics Dashboard
 * - Overview KPI cards (avg rating, NPS, completion rate, confidence score)
 * - Module satisfaction ranking with CSS-based bar chart
 * - Most common improvement suggestions (word frequency)
 * - Most Valuable Module ranking
 * - Full feedback table with filters: date range, module, learner, dept, org
 * - Export: CSV, Excel, PDF
 */
import React, { useEffect, useState, useMemo } from 'react';
import { getFirebaseDb } from '../firebase';
import { ref, get } from 'firebase/database';
import { useApp } from '../context/AppContext';
import { StarRating } from '../components/StarRating';
import { MODULE_NAMES } from './FeedbackForm';
import type { ModuleFeedback, CertFeedback } from './FeedbackForm';
import { exportToCSV, exportToExcel, exportToPDF } from '../utils/feedbackExport';
import {
  BarChart2, Star, TrendingUp, Users, MessageSquare,
  Filter, RefreshCw, FileSpreadsheet, FileText,
  File, ChevronUp, ChevronDown, Award, ThumbsUp
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface FeedbackAnalyticsProps {
  usersList?: any[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const avg = (arr: number[]) =>
  arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : 0;

const calcNPS = (scores: number[]) => {
  if (!scores.length) return 0;
  const promoters = scores.filter((s) => s >= 9).length;
  const detractors = scores.filter((s) => s <= 6).length;
  return Math.round(((promoters - detractors) / scores.length) * 100);
};

const wordFrequency = (texts: string[], topN = 15): { word: string; count: number }[] => {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'is', 'was', 'are', 'were', 'be', 'been', 'this', 'that',
    'it', 'its', 'more', 'very', 'more', 'could', 'would', 'should', 'can',
    'i', 'me', 'my', 'we', 'our', 'you', 'your', 'have', 'had', 'has',
  ]);
  const freq: Record<string, number> = {};
  texts.forEach((t) => {
    t.toLowerCase()
      .replace(/[^a-z\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !stopWords.has(w))
      .forEach((w) => { freq[w] = (freq[w] || 0) + 1; });
  });
  return Object.entries(freq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, topN)
    .map(([word, count]) => ({ word, count }));
};

// ─── Mini bar component ───────────────────────────────────────────────────────
const MiniBar: React.FC<{ label: string; value: number; max: number; color?: string; suffix?: string }> = ({
  label, value, max, color = 'from-indigo-500 to-purple-600', suffix = ''
}) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between text-[11px]">
      <span className="text-[var(--text-secondary)] truncate flex-1 mr-2">{label}</span>
      <span className="font-bold text-[var(--text-primary)] shrink-0">{value}{suffix}</span>
    </div>
    <div className="h-1.5 rounded-full bg-[var(--border-color)] overflow-hidden">
      <div
        className={`h-full bg-gradient-to-r ${color} transition-all duration-700 rounded-full`}
        style={{ width: max > 0 ? `${Math.min(100, (value / max) * 100)}%` : '0%' }}
      />
    </div>
  </div>
);

// ─── KPI Card ─────────────────────────────────────────────────────────────────
const KpiCard: React.FC<{
  icon: React.ReactNode; label: string; value: string | number; sub?: string;
  color?: string;
}> = ({ icon, label, value, sub, color = 'from-indigo-500 to-purple-600' }) => (
  <div className="glass-card rounded-2xl p-5 border border-[var(--border-color)]">
    <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-3 shadow-md`}>
      {icon}
    </div>
    <div className="text-2xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
      {value}
    </div>
    <div className="text-xs font-bold text-[var(--text-secondary)] mt-0.5">{label}</div>
    {sub && <div className="text-[10px] text-[var(--text-muted)] mt-1">{sub}</div>}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export const FeedbackAnalytics: React.FC<FeedbackAnalyticsProps> = ({ usersList = [] }) => {
  const { addToast } = useApp();
  const [moduleFeedbacks, setModuleFeedbacks] = useState<ModuleFeedback[]>([]);
  const [certFeedbacks, setCertFeedbacks] = useState<CertFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [filterModule, setFilterModule] = useState<string>('all');
  const [filterLearner, setFilterLearner] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterOrg, setFilterOrg] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [activeTable, setActiveTable] = useState<'module' | 'cert'>('module');
  const [sortCol, setSortCol] = useState<string>('completedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [exporting, setExporting] = useState<'csv' | 'excel' | 'pdf' | null>(null);

  const loadFeedback = async () => {
    setLoading(true);
    const db = getFirebaseDb();
    if (!db) { setLoading(false); return; }
    try {
      const [modSnap, certSnap] = await Promise.all([
        get(ref(db, 'feedback/module_feedback')),
        get(ref(db, 'feedback/cert_feedback')),
      ]);

      // Module feedback: feedback/module_feedback/{uid}/{moduleId}
      const modList: ModuleFeedback[] = [];
      if (modSnap.exists()) {
        const raw = modSnap.val();
        Object.values(raw).forEach((byModule: any) => {
          Object.values(byModule || {}).forEach((fb: any) => {
            if (fb && !fb.isDraft) modList.push(fb as ModuleFeedback);
          });
        });
      }

      // Cert feedback: feedback/cert_feedback/{uid}
      const certList: CertFeedback[] = [];
      if (certSnap.exists()) {
        Object.values(certSnap.val()).forEach((fb: any) => {
          if (fb && !fb.isDraft) certList.push(fb as CertFeedback);
        });
      }

      setModuleFeedbacks(modList);
      setCertFeedbacks(certList);
    } catch (e) {
      console.error('[FeedbackAnalytics] load failed:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFeedback(); }, []);

  // ── Apply filters to module feedback ────────────────────────────────────────
  const filteredModule = useMemo(() => {
    return moduleFeedbacks.filter((fb) => {
      if (filterModule !== 'all' && String(fb.moduleId) !== filterModule) return false;
      if (filterLearner.trim()) {
        const t = filterLearner.toLowerCase();
        if (!fb.userName?.toLowerCase().includes(t) && !fb.userEmail?.toLowerCase().includes(t)) return false;
      }
      if (filterDept.trim() && !fb.department?.toLowerCase().includes(filterDept.toLowerCase())) return false;
      if (filterOrg.trim() && !fb.organization?.toLowerCase().includes(filterOrg.toLowerCase())) return false;
      if (filterDateFrom) {
        const from = new Date(filterDateFrom).getTime();
        if (fb.completedAt < from) return false;
      }
      if (filterDateTo) {
        const to = new Date(filterDateTo).getTime() + 86400000;
        if (fb.completedAt > to) return false;
      }
      return true;
    });
  }, [moduleFeedbacks, filterModule, filterLearner, filterDept, filterOrg, filterDateFrom, filterDateTo]);

  // ── Apply filters to cert feedback ──────────────────────────────────────────
  const filteredCert = useMemo(() => {
    return certFeedbacks.filter((fb) => {
      if (filterLearner.trim()) {
        const t = filterLearner.toLowerCase();
        if (!fb.userName?.toLowerCase().includes(t) && !fb.userEmail?.toLowerCase().includes(t)) return false;
      }
      if (filterDept.trim() && !fb.department?.toLowerCase().includes(filterDept.toLowerCase())) return false;
      if (filterOrg.trim() && !fb.organization?.toLowerCase().includes(filterOrg.toLowerCase())) return false;
      if (filterDateFrom) {
        const from = new Date(filterDateFrom).getTime();
        if (fb.completedAt < from) return false;
      }
      if (filterDateTo) {
        const to = new Date(filterDateTo).getTime() + 86400000;
        if (fb.completedAt > to) return false;
      }
      return true;
    });
  }, [certFeedbacks, filterLearner, filterDept, filterOrg, filterDateFrom, filterDateTo]);

  // ── Analytics calculations ───────────────────────────────────────────────────
  const analytics = useMemo(() => {
    // Per-module averages
    const moduleStats: Record<number, { count: number; ratings: number[]; improvements: string[] }> = {};
    filteredModule.forEach((fb) => {
      if (!moduleStats[fb.moduleId]) moduleStats[fb.moduleId] = { count: 0, ratings: [], improvements: [] };
      moduleStats[fb.moduleId].count++;
      if (fb.rating) moduleStats[fb.moduleId].ratings.push(fb.rating);
      if (fb.improvements) moduleStats[fb.moduleId].improvements.push(fb.improvements);
    });

    const moduleRankings = Object.entries(moduleStats)
      .map(([id, s]) => ({
        id: Number(id),
        name: MODULE_NAMES[Number(id)] || `Module ${id}`,
        avgRating: avg(s.ratings),
        count: s.count,
      }))
      .sort((a, b) => b.avgRating - a.avgRating);

    // Overall cert stats
    const certRatings = filteredCert.map((f) => f.overallRating).filter(Boolean);
    const npsScores = filteredCert.map((f) => f.npsScore).filter((s) => s >= 0);
    const confidenceAgree = filteredCert.filter((f) =>
      f.confidenceImprovement === 'Strongly Agree' || f.confidenceImprovement === 'Agree'
    ).length;

    // Most valuable module ranking (from cert feedback)
    const mvmFreq: Record<string, number> = {};
    filteredCert.forEach((f) => {
      if (f.mostValuableModule) mvmFreq[f.mostValuableModule] = (mvmFreq[f.mostValuableModule] || 0) + 1;
    });
    const mostValuableRanking = Object.entries(mvmFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    // Word cloud from improvements
    const allImprovements = filteredModule.map((f) => f.improvements).filter(Boolean);
    const topWords = wordFrequency(allImprovements);

    // Completion rate: users who submitted cert feedback / total approved users
    const approvedCount = usersList.filter((u) => u.accountStatus === 'APPROVED').length || 1;
    const completionRate = Math.round((filteredCert.length / approvedCount) * 100);

    return {
      moduleRankings,
      avgCertRating: avg(certRatings),
      npsScore: calcNPS(npsScores),
      completionRate: Math.min(100, completionRate),
      confidenceScore: filteredCert.length
        ? Math.round((confidenceAgree / filteredCert.length) * 100)
        : 0,
      mostValuableRanking,
      topWords,
      totalModuleFeedbacks: filteredModule.length,
      totalCertFeedbacks: filteredCert.length,
    };
  }, [filteredModule, filteredCert, usersList]);

  // ── Sorting ──────────────────────────────────────────────────────────────────
  const sorted = (rows: any[]) =>
    [...rows].sort((a, b) => {
      const va = a[sortCol] ?? '';
      const vb = b[sortCol] ?? '';
      const dir = sortDir === 'asc' ? 1 : -1;
      return typeof va === 'number' ? (va - vb) * dir : String(va).localeCompare(String(vb)) * dir;
    });

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortCol(col); setSortDir('desc'); }
  };

  const SortIcon: React.FC<{ col: string }> = ({ col }) =>
    sortCol === col ? (
      sortDir === 'asc' ? <ChevronUp className="h-3 w-3 inline" /> : <ChevronDown className="h-3 w-3 inline" />
    ) : null;

  // ── Export handlers ──────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    setExporting('csv');
    try {
      const rows = activeTable === 'module'
        ? sorted(filteredModule).map((f) => ({
            Module: MODULE_NAMES[f.moduleId],
            Learner: f.userName,
            Email: f.userEmail,
            Rating: f.rating,
            Usefulness: f.usefulness,
            Clarity: f.contentClarity,
            Outcome: f.learningOutcome,
            LikedMost: f.likedMost,
            Improvements: f.improvements,
            Department: f.department,
            Organisation: f.organization,
            Date: new Date(f.completedAt).toLocaleDateString(),
            Anonymous: f.isAnonymous ? 'Yes' : 'No',
          }))
        : sorted(filteredCert).map((f) => ({
            Learner: f.userName,
            Email: f.userEmail,
            OverallRating: f.overallRating,
            NPS: f.npsScore,
            MostValuableModule: f.mostValuableModule,
            ModuleNeedsImprovement: f.moduleNeedsImprovement,
            Confidence: f.confidenceImprovement,
            AdvancedCertInterest: f.advancedCertInterest,
            BiggestTakeaway: f.biggestTakeaway,
            Testimonial: f.testimonial,
            Department: f.department,
            Organisation: f.organization,
            Date: new Date(f.completedAt).toLocaleDateString(),
            Anonymous: f.isAnonymous ? 'Yes' : 'No',
          }));
      exportToCSV(rows, `orchestrai-feedback-${activeTable}-${Date.now()}`);
      addToast(`Exported ${rows.length} records to CSV.`, 'success');
    } finally {
      setExporting(null);
    }
  };

  const handleExportExcel = async () => {
    setExporting('excel');
    try {
      const modRows = sorted(filteredModule).map((f) => ({
        Module: MODULE_NAMES[f.moduleId],
        Learner: f.userName,
        Email: f.userEmail,
        Rating: f.rating,
        Usefulness: f.usefulness,
        Clarity: f.contentClarity,
        Outcome: f.learningOutcome,
        LikedMost: f.likedMost,
        Improvements: f.improvements,
        Department: f.department,
        Organisation: f.organization,
        Date: new Date(f.completedAt).toLocaleDateString(),
      }));
      const certRows = sorted(filteredCert).map((f) => ({
        Learner: f.userName,
        Email: f.userEmail,
        OverallRating: f.overallRating,
        NPS: f.npsScore,
        MostValuableModule: f.mostValuableModule,
        ModuleNeedsImprovement: f.moduleNeedsImprovement,
        Confidence: f.confidenceImprovement,
        AdvancedCert: f.advancedCertInterest,
        BiggestTakeaway: f.biggestTakeaway,
        Testimonial: f.testimonial,
        Department: f.department,
        Organisation: f.organization,
        Date: new Date(f.completedAt).toLocaleDateString(),
      }));
      await exportToExcel(
        [
          { name: 'Module Feedback', rows: modRows },
          { name: 'Certification Feedback', rows: certRows },
          {
            name: 'Module Rankings',
            rows: analytics.moduleRankings.map((r) => ({ Module: r.name, AvgRating: r.avgRating, Responses: r.count })),
          },
        ],
        `orchestrai-feedback-${Date.now()}`
      );
      addToast('Excel file downloaded.', 'success');
    } catch {
      addToast('Excel export failed.', 'error');
    } finally {
      setExporting(null);
    }
  };

  const handleExportPDF = async () => {
    setExporting('pdf');
    try {
      await exportToPDF(
        'OrchestrAI — Feedback Analytics Report',
        `Generated for ${filteredModule.length} module responses · ${filteredCert.length} cert responses`,
        [
          {
            heading: 'Module Satisfaction Ranking',
            columns: ['Module', 'Avg Rating', 'Responses'],
            rows: analytics.moduleRankings.map((r) => [r.name, r.avgRating, r.count]),
          },
          {
            heading: 'Module Feedback (filtered)',
            columns: ['Module', 'Learner', 'Rating', 'Usefulness', 'Clarity', 'Outcome', 'Date'],
            rows: sorted(filteredModule).slice(0, 200).map((f) => [
              MODULE_NAMES[f.moduleId],
              f.isAnonymous ? 'Anonymous' : f.userName,
              f.rating,
              f.usefulness,
              f.contentClarity,
              f.learningOutcome,
              new Date(f.completedAt).toLocaleDateString(),
            ]),
          },
          {
            heading: 'Certification Feedback (filtered)',
            columns: ['Learner', 'Rating', 'NPS', 'Confidence', 'Date'],
            rows: sorted(filteredCert).slice(0, 200).map((f) => [
              f.isAnonymous ? 'Anonymous' : f.userName,
              f.overallRating,
              f.npsScore,
              f.confidenceImprovement,
              new Date(f.completedAt).toLocaleDateString(),
            ]),
          },
        ],
        `orchestrai-feedback-report-${Date.now()}`
      );
      addToast('PDF downloaded.', 'success');
    } catch {
      addToast('PDF export failed.', 'error');
    } finally {
      setExporting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-6 w-6 text-indigo-400 animate-spin mr-3" />
        <span className="text-sm text-[var(--text-secondary)]">Loading feedback data…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-250">
      {/* Header */}
      <div className="glass-card rounded-2xl p-5 bg-gradient-to-br from-indigo-500/5 via-[var(--bg-card)]/40 to-purple-500/5 border border-[var(--border-color)]">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <BarChart2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold">Feedback Analytics</h2>
              <p className="text-xs text-[var(--text-secondary)]">
                {analytics.totalModuleFeedbacks} module responses · {analytics.totalCertFeedbacks} cert responses
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={handleExportCSV} disabled={!!exporting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-[10px] font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)] transition-all disabled:opacity-50">
              <File className="h-3.5 w-3.5" />
              {exporting === 'csv' ? 'Exporting…' : 'CSV'}
            </button>
            <button onClick={handleExportExcel} disabled={!!exporting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/10 transition-all disabled:opacity-50">
              <FileSpreadsheet className="h-3.5 w-3.5" />
              {exporting === 'excel' ? 'Exporting…' : 'Excel'}
            </button>
            <button onClick={handleExportPDF} disabled={!!exporting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/5 text-[10px] font-bold text-rose-400 hover:bg-rose-500/10 transition-all disabled:opacity-50">
              <FileText className="h-3.5 w-3.5" />
              {exporting === 'pdf' ? 'Exporting…' : 'PDF'}
            </button>
            <button onClick={loadFeedback} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-[10px] font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)]">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<Star className="h-5 w-5" />}
          label="Overall Cert Rating"
          value={analytics.avgCertRating || '—'}
          sub={`${analytics.totalCertFeedbacks} responses`}
          color="from-amber-500 to-orange-500"
        />
        <KpiCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="NPS Score"
          value={analytics.npsScore}
          sub={`${analytics.npsScore >= 0 ? '🟢 Good' : '🔴 Below average'}`}
          color="from-emerald-500 to-teal-600"
        />
        <KpiCard
          icon={<Users className="h-5 w-5" />}
          label="Completion Rate"
          value={`${analytics.completionRate}%`}
          sub="Cert feedback / approved users"
          color="from-cyan-500 to-blue-600"
        />
        <KpiCard
          icon={<ThumbsUp className="h-5 w-5" />}
          label="Confidence Improvement"
          value={`${analytics.confidenceScore}%`}
          sub="Agree or Strongly Agree"
          color="from-purple-500 to-indigo-600"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Module Satisfaction Ranking */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-indigo-400" /> Module Satisfaction Ranking
          </h3>
          {analytics.moduleRankings.length === 0 ? (
            <p className="text-xs text-[var(--text-secondary)] text-center py-6">No module feedback yet.</p>
          ) : (
            <div className="space-y-3">
              {analytics.moduleRankings.map((m) => (
                <div key={m.id}>
                  <MiniBar
                    label={`M${m.id}: ${m.name.split(':')[1]?.trim() || m.name}`}
                    value={m.avgRating}
                    max={5}
                    suffix="/5"
                    color={m.avgRating >= 4 ? 'from-emerald-500 to-teal-600' : m.avgRating >= 3 ? 'from-indigo-500 to-purple-600' : 'from-rose-500 to-orange-600'}
                  />
                  <div className="text-[9px] text-[var(--text-muted)] mt-0.5">{m.count} response{m.count !== 1 ? 's' : ''}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Most Valuable Module + Word Cloud */}
        <div className="space-y-5">
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-400" /> Most Valuable Module (Learner Votes)
            </h3>
            {analytics.mostValuableRanking.length === 0 ? (
              <p className="text-xs text-[var(--text-secondary)] text-center py-4">No cert feedback yet.</p>
            ) : (
              <div className="space-y-2">
                {analytics.mostValuableRanking.map(([name, count]) => (
                  <MiniBar
                    key={name}
                    label={name}
                    value={count}
                    max={analytics.mostValuableRanking[0][1]}
                    suffix=" votes"
                    color="from-amber-500 to-orange-500"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-purple-400" /> Most Common Improvement Topics
            </h3>
            {analytics.topWords.length === 0 ? (
              <p className="text-xs text-[var(--text-secondary)] text-center py-4">No improvement suggestions yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {analytics.topWords.map(({ word, count }) => {
                  const size = count > 5 ? 'text-sm' : count > 2 ? 'text-[11px]' : 'text-[10px]';
                  return (
                    <span
                      key={word}
                      className={`px-2.5 py-1 rounded-full border border-purple-500/25 bg-purple-500/10 text-purple-300 font-bold ${size}`}
                      title={`${count} mention${count !== 1 ? 's' : ''}`}
                    >
                      {word} <span className="text-purple-400/60 font-normal">×{count}</span>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-indigo-400" />
          <h3 className="text-sm font-bold">Filter Responses</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <select
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
            className="form-input text-xs"
          >
            <option value="all">All Modules</option>
            {Object.entries(MODULE_NAMES).map(([id, name]) => (
              <option key={id} value={id}>M{id}: {name.split(':')[1]?.trim()}</option>
            ))}
          </select>
          <input
            type="text"
            value={filterLearner}
            onChange={(e) => setFilterLearner(e.target.value)}
            className="form-input text-xs"
            placeholder="Learner name/email"
          />
          <input
            type="text"
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="form-input text-xs"
            placeholder="Department"
          />
          <input
            type="text"
            value={filterOrg}
            onChange={(e) => setFilterOrg(e.target.value)}
            className="form-input text-xs"
            placeholder="Organisation"
          />
          <input
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            className="form-input text-xs"
            title="From date"
          />
          <input
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            className="form-input text-xs"
            title="To date"
          />
        </div>
        {(filterModule !== 'all' || filterLearner || filterDept || filterOrg || filterDateFrom || filterDateTo) && (
          <button
            onClick={() => {
              setFilterModule('all'); setFilterLearner(''); setFilterDept('');
              setFilterOrg(''); setFilterDateFrom(''); setFilterDateTo('');
            }}
            className="mt-3 text-[10px] text-indigo-400 hover:text-indigo-300 font-bold"
          >
            ✕ Clear all filters
          </button>
        )}
      </div>

      {/* Response Tables */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {/* Table tabs */}
        <div className="flex border-b border-[var(--border-color)]">
          {(['module', 'cert'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTable(t)}
              className={`px-5 py-3 text-xs font-bold transition-all ${
                activeTable === t
                  ? 'border-b-2 border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {t === 'module' ? `Module Feedback (${filteredModule.length})` : `Cert Feedback (${filteredCert.length})`}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          {activeTable === 'module' ? (
            <table className="w-full text-[11px]">
              <thead className="bg-[var(--surface-sunken)]/60">
                <tr>
                  {['Module', 'Learner', 'rating', 'usefulness', 'contentClarity', 'learningOutcome', 'completedAt'].map((col) => (
                    <th
                      key={col}
                      onClick={() => toggleSort(col)}
                      className="px-3 py-2.5 text-left font-bold text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:text-indigo-400 whitespace-nowrap"
                    >
                      {col === 'contentClarity' ? 'Clarity' :
                       col === 'learningOutcome' ? 'Outcome' :
                       col === 'completedAt' ? 'Date' : col}
                      <SortIcon col={col} />
                    </th>
                  ))}
                  <th className="px-3 py-2.5 text-left font-bold text-[var(--text-secondary)] uppercase tracking-wider">Dept</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]/50">
                {sorted(filteredModule).slice(0, 100).map((fb, i) => (
                  <tr key={i} className="hover:bg-[var(--surface-sunken)]/40 transition-colors">
                    <td className="px-3 py-2 font-bold text-indigo-400 whitespace-nowrap">M{fb.moduleId}</td>
                    <td className="px-3 py-2">
                      <div className="font-bold text-[var(--text-primary)]">{fb.userName}</div>
                      <div className="text-[var(--text-muted)]">{fb.userEmail}</div>
                    </td>
                    <td className="px-3 py-2">
                      <StarRating value={fb.rating} readonly size="sm" />
                    </td>
                    <td className="px-3 py-2 text-[var(--text-secondary)]">{fb.usefulness}</td>
                    <td className="px-3 py-2 text-[var(--text-secondary)]">{fb.contentClarity}</td>
                    <td className="px-3 py-2 text-[var(--text-secondary)] max-w-[150px] truncate">{fb.learningOutcome}</td>
                    <td className="px-3 py-2 text-[var(--text-muted)] whitespace-nowrap">{new Date(fb.completedAt).toLocaleDateString()}</td>
                    <td className="px-3 py-2 text-[var(--text-muted)]">{fb.department || '—'}</td>
                  </tr>
                ))}
                {filteredModule.length === 0 && (
                  <tr><td colSpan={8} className="px-3 py-8 text-center text-[var(--text-secondary)]">No module feedback found.</td></tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-[11px]">
              <thead className="bg-[var(--surface-sunken)]/60">
                <tr>
                  {['Learner', 'overallRating', 'npsScore', 'confidenceImprovement', 'advancedCertInterest', 'completedAt'].map((col) => (
                    <th
                      key={col}
                      onClick={() => toggleSort(col)}
                      className="px-3 py-2.5 text-left font-bold text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:text-indigo-400 whitespace-nowrap"
                    >
                      {col === 'overallRating' ? 'Rating' :
                       col === 'npsScore' ? 'NPS' :
                       col === 'confidenceImprovement' ? 'Confidence' :
                       col === 'advancedCertInterest' ? 'Adv. Cert' :
                       col === 'completedAt' ? 'Date' : col}
                      <SortIcon col={col} />
                    </th>
                  ))}
                  <th className="px-3 py-2.5 text-left font-bold text-[var(--text-secondary)] uppercase tracking-wider">Takeaway</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]/50">
                {sorted(filteredCert).slice(0, 100).map((fb, i) => (
                  <tr key={i} className="hover:bg-[var(--surface-sunken)]/40 transition-colors">
                    <td className="px-3 py-2">
                      <div className="font-bold text-[var(--text-primary)]">{fb.userName}</div>
                      <div className="text-[var(--text-muted)]">{fb.userEmail}</div>
                    </td>
                    <td className="px-3 py-2"><StarRating value={fb.overallRating} readonly size="sm" /></td>
                    <td className="px-3 py-2">
                      <span className={`font-extrabold ${fb.npsScore >= 9 ? 'text-emerald-400' : fb.npsScore >= 7 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {fb.npsScore}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-secondary)]">{fb.confidenceImprovement}</td>
                    <td className="px-3 py-2 text-[var(--text-secondary)]">{fb.advancedCertInterest}</td>
                    <td className="px-3 py-2 text-[var(--text-muted)] whitespace-nowrap">{new Date(fb.completedAt).toLocaleDateString()}</td>
                    <td className="px-3 py-2 text-[var(--text-secondary)] max-w-[200px] truncate" title={fb.biggestTakeaway}>{fb.biggestTakeaway || '—'}</td>
                  </tr>
                ))}
                {filteredCert.length === 0 && (
                  <tr><td colSpan={7} className="px-3 py-8 text-center text-[var(--text-secondary)]">No certification feedback found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        {((activeTable === 'module' && filteredModule.length > 100) || (activeTable === 'cert' && filteredCert.length > 100)) && (
          <div className="px-4 py-2 text-[10px] text-[var(--text-muted)] border-t border-[var(--border-color)]">
            Showing first 100 of {activeTable === 'module' ? filteredModule.length : filteredCert.length} records. Export to see all.
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackAnalytics;
