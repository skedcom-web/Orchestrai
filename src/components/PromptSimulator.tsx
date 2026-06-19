import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, RefreshCw, Code, Play, Check } from 'lucide-react';

interface PromptSimulatorProps {
  onComplete: () => void;
}

export const PromptSimulator: React.FC<PromptSimulatorProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedVulnerabilities, setSelectedVulnerabilities] = useState<string[]>([]);
  const [appliedConstraints, setAppliedConstraints] = useState<string[]>([]);
  const [isCompiling, setIsCompiling] = useState(false);

  const vulnerabilities = [
    { id: 'sql', label: 'SQL Injection Risk', detail: 'User input is concatenated directly into query string.' },
    { id: 'auth', label: 'Broken Access Control', detail: 'No check to verify if the requesting user matches the requested timesheet owner.' },
    { id: 'tenant', label: 'Cross-Tenant Leak', detail: 'Allows query parameters to pull records from other client organizations.' }
  ];

  const constraints = [
    { id: 'param', label: 'Bind Parameters (SQL Sanitisation)', code: 'Use parameterized SQL query placeholder bindings' },
    { id: 'rbac', label: 'Verify User Auth Identity', code: 'Assert req.user.uid matches target employee_id, or user has MANAGER role' },
    { id: 'tenantId', label: 'Enforce Tenant Separation', code: 'Filter records strictly by req.user.tenantId to isolate tenants' }
  ];

  const handleVulnerabilityToggle = (id: string) => {
    if (selectedVulnerabilities.includes(id)) {
      setSelectedVulnerabilities(selectedVulnerabilities.filter(x => x !== id));
    } else {
      setSelectedVulnerabilities([...selectedVulnerabilities, id]);
    }
  };

  const handleConstraintToggle = (id: string) => {
    if (appliedConstraints.includes(id)) {
      setAppliedConstraints(appliedConstraints.filter(x => x !== id));
    } else {
      setAppliedConstraints([...appliedConstraints, id]);
    }
  };

  const runBuilderStep1 = () => {
    setIsCompiling(true);
    setTimeout(() => {
      setIsCompiling(false);
      setStep(2);
    }, 1500);
  };

  const runBuilderStep2 = () => {
    setIsCompiling(true);
    setTimeout(() => {
      setIsCompiling(false);
      if (appliedConstraints.length === 3) {
        setStep(3);
        onComplete();
      }
    }, 1800);
  };

  const resetSimulator = () => {
    setStep(1);
    setSelectedVulnerabilities([]);
    setAppliedConstraints([]);
  };

  return (
    <div className="w-full flex flex-col gap-4 text-left p-1 sm:p-3">
      
      {/* Lab Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
        <div className="flex items-center space-x-2">
          <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--text-primary)]">Interactive Lab: Prompt Guardrails Simulator</h4>
            <p className="text-[10px] text-[var(--text-secondary)] font-medium">Topic: Securing the Timesheet Retrieval Endpoint</p>
          </div>
        </div>
        <button 
          onClick={resetSimulator}
          className="p-1 hover:bg-slate-500/10 rounded text-[var(--text-secondary)]" 
          title="Reset Simulation"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Scenario Briefing */}
      <div className="bg-slate-500/5 p-3 rounded-lg border border-[var(--border-color)]">
        <p className="text-xs text-[var(--text-primary)] font-semibold mb-1.5">The Client Mandate:</p>
        <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
          "Create a backend endpoint `/api/timesheets` to fetch weekly hours for a specific employee. The system must prevent unauthorized candidates from viewing other employees' details or accessing records from separate corporate tenants."
        </p>
      </div>

      {/* STAGE 1: Vague Intent & Vulnerable Code Analysis */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left panel: Prompt & Controls */}
          <div className="flex flex-col gap-3">
            <div className="p-3 rounded-lg border border-red-500/10 bg-red-500/5">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block mb-1">❌ DEFICIENT PROMPT</span>
              <p className="font-mono text-xs text-[var(--text-primary)] bg-[var(--surface-sunken)] p-2 rounded">
                "Write a node express route to fetch all timesheet data where employee_id matches query param."
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-[var(--text-primary)] block">Analyse the prompt. Identify all 3 security risks:</span>
              <div className="space-y-1.5">
                {vulnerabilities.map(vul => (
                  <button
                    key={vul.id}
                    onClick={() => handleVulnerabilityToggle(vul.id)}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs flex items-start space-x-2.5 transition-all ${
                      selectedVulnerabilities.includes(vul.id)
                        ? 'border-red-500/30 bg-red-500/5 text-[var(--text-primary)]'
                        : 'border-[var(--border-color)] hover:border-slate-500/25 bg-[var(--bg-card)]'
                    }`}
                  >
                    <div className={`mt-0.5 h-3.5 w-3.5 rounded flex items-center justify-center shrink-0 border ${
                      selectedVulnerabilities.includes(vul.id) ? 'bg-red-500 border-red-500 text-white' : 'border-[var(--border-color)]'
                    }`}>
                      {selectedVulnerabilities.includes(vul.id) && <Check className="h-2 w-2" />}
                    </div>
                    <div>
                      <div className="font-semibold">{vul.label}</div>
                      <div className="text-[10px] text-[var(--text-secondary)] mt-0.5 leading-snug">{vul.detail}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={runBuilderStep1}
              disabled={selectedVulnerabilities.length < 3 || isCompiling}
              className={`w-full py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                selectedVulnerabilities.length === 3
                  ? 'bg-gradient-to-r from-red-500 to-indigo-500 text-white hover:brightness-110 shadow-lg'
                  : 'bg-slate-500/10 text-[var(--text-secondary)] cursor-not-allowed'
              }`}
            >
              {isCompiling ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  AI Writing Deficient Code...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Generate Initial AI Code ({selectedVulnerabilities.length}/3 Risks Identified)
                </>
              )}
            </button>
          </div>

          {/* Right panel: Static placeholder indicating waiting */}
          <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-sunken)] font-mono text-[11px] p-4 flex flex-col justify-center items-center text-[var(--text-secondary)] text-center min-h-[300px]">
            <Code className="h-8 w-8 mb-2 opacity-40 text-red-400" />
            <p>Select all 3 vulnerabilities and trigger code generation to view the AI-generated route.</p>
          </div>
        </div>
      )}

      {/* STAGE 2: Code Debugging & Applying Guardrails */}
      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left panel: Applying Prompt Constraints */}
          <div className="flex flex-col gap-3">
            <div className="p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 space-y-2">
              <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest block">🔧 ORCHESTRAI PROMPT BUILDER</span>
              <div className="font-mono text-[11px] text-[var(--text-primary)] bg-[var(--surface-sunken)] p-2.5 rounded leading-relaxed">
                "Write a node express route to fetch all timesheet data where employee_id matches query param. 
                {appliedConstraints.map(cid => {
                  const label = constraints.find(c => c.id === cid)?.code;
                  return <span key={cid} className="text-emerald-400 block mt-1 font-semibold">+ Constraint: {label}</span>;
                })}
                "
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-[var(--text-primary)] block">Select prompt constraints to secure the API:</span>
              <div className="space-y-1.5">
                {constraints.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleConstraintToggle(c.id)}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs flex items-center space-x-2.5 transition-all ${
                      appliedConstraints.includes(c.id)
                        ? 'border-emerald-500/30 bg-emerald-500/5 text-[var(--text-primary)]'
                        : 'border-[var(--border-color)] hover:border-slate-500/25 bg-[var(--bg-card)]'
                    }`}
                  >
                    <div className={`h-4 w-4 rounded flex items-center justify-center shrink-0 border ${
                      appliedConstraints.includes(c.id) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-[var(--border-color)]'
                    }`}>
                      {appliedConstraints.includes(c.id) && <Check className="h-2 w-2" />}
                    </div>
                    <div className="font-semibold">{c.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={runBuilderStep2}
              disabled={appliedConstraints.length < 3 || isCompiling}
              className={`w-full py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                appliedConstraints.length === 3
                  ? 'bg-gradient-to-r from-indigo-500 to-emerald-500 text-white hover:brightness-110 shadow-lg'
                  : 'bg-slate-500/10 text-[var(--text-secondary)] cursor-not-allowed'
              }`}
            >
              {isCompiling ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  AI Rebuilding Code...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Regenerate Secure Code ({appliedConstraints.length}/3 Constraints Added)
                </>
              )}
            </button>
          </div>

          {/* Right panel: Deficient Code view with warning overlays */}
          <div className="rounded-lg border border-red-500/20 bg-[var(--surface-code)] font-mono text-[10.5px] p-4 flex flex-col justify-between overflow-x-auto min-h-[300px]">
            <div>
              <div className="flex items-center justify-between border-b border-red-500/20 pb-2 mb-2">
                <span className="text-red-400 font-bold text-[10px] uppercase flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 animate-pulse" />
                  VULNERABLE CODE (AI OUTPUT V1)
                </span>
              </div>
              <div className="space-y-1 text-slate-300">
                <div>app.get('/api/timesheets', (req, res) =&gt; &#123;</div>
                <div className="bg-red-500/10 px-1 border-l-2 border-red-500 flex items-start justify-between">
                  <span>  const empId = req.query.employeeId;</span>
                  <span className="text-red-400 text-[10px] font-semibold flex items-center shrink-0 gap-0.5 ml-2">⚠️ Broken Auth</span>
                </div>
                <div className="bg-red-500/10 px-1 border-l-2 border-red-500 flex items-start justify-between mt-0.5">
                  <span>  const sql = `SELECT * FROM timesheets WHERE employee_id = '$&#123;empId&#125;'`;</span>
                  <span className="text-red-400 text-[10px] font-semibold flex items-center shrink-0 gap-0.5 ml-2">⚠️ SQL Injection</span>
                </div>
                <div>  db.query(sql, (err, results) =&gt; &#123;</div>
                <div className="bg-red-500/10 px-1 border-l-2 border-red-500 flex items-start justify-between mt-0.5">
                  <span>    if (err) return res.json(err);</span>
                  <span className="text-red-400 text-[10px] font-semibold flex items-center shrink-0 gap-0.5 ml-2">⚠️ Tenant Leak</span>
                </div>
                <div>    res.json(results);</div>
                <div>  &#125;);</div>
                <div>&#125;);</div>
              </div>
            </div>

            <div className="text-[9.5px] text-red-300 bg-red-950/30 border border-red-500/20 rounded p-2 mt-4 leading-relaxed">
              <strong>Security Scans:</strong> Code contains major vulnerabilities. Adding prompt constraints on the left is required to instruct the builder to secure this API.
            </div>
          </div>
        </div>
      )}

      {/* STAGE 3: Secure Verified Code View */}
      {step === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Left panel: Success message */}
          <div className="flex flex-col justify-center items-center text-center p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
            <CheckCircle className="h-14 w-14 text-emerald-400 mb-4 animate-bounce" />
            <h4 className="text-lg font-bold text-[var(--text-primary)] mb-2">Verification Passed!</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-sm mb-4">
              Excellent work! You successfully engineered prompt constraints covering parameter binding, authorization checks, and tenant isolation. The generated code is fully secure.
            </p>
            <div className="flex gap-2">
              <button
                onClick={resetSimulator}
                className="px-4 py-2 border border-[var(--border-color)] hover:bg-slate-500/10 text-[var(--text-primary)] font-semibold rounded-lg text-xs transition-all"
              >
                Retake Lab
              </button>
            </div>
          </div>

          {/* Right panel: Secure Code block */}
          <div className="rounded-lg border border-emerald-500/20 bg-[var(--surface-code)] font-mono text-[10px] p-4 flex flex-col justify-between overflow-x-auto min-h-[300px]">
            <div>
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2 mb-2">
                <span className="text-emerald-400 font-bold text-[10px] uppercase flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  SECURED CODE (AI OUTPUT V2)
                </span>
                <span className="text-[10px] font-bold text-emerald-400 uppercase">Passed</span>
              </div>
              <div className="space-y-0.5 text-slate-300">
                <div>app.get('/api/timesheets', (req, res) =&gt; &#123;</div>
                <div className="text-emerald-400">  const authUserId = req.user.uid;</div>
                <div className="text-emerald-400">  const targetEmpId = req.query.employeeId;</div>
                <div className="text-emerald-400">  const tenantId = req.user.tenantId;</div>
                <div className="text-slate-500">  // Auth &amp; Role Check</div>
                <div className="text-emerald-400">  if (authUserId !== targetEmpId && req.user.role !== 'MANAGER') &#123;</div>
                <div className="text-emerald-400">    return res.status(403).json(&#123; error: 'Access Denied' &#125;);</div>
                <div className="text-emerald-400">  &#125;</div>
                <div className="text-slate-500">  // SQL Parameter Binding &amp; Tenant Filter</div>
                <div className="text-emerald-400">  const query = 'SELECT * FROM timesheets WHERE employee_id = ? AND tenant_id = ?';</div>
                <div className="text-emerald-400">  db.query(query, [targetEmpId, tenantId], (err, results) =&gt; &#123;</div>
                <div>    if (err) return res.status(500).json(&#123; error: 'Database error' &#125;);</div>
                <div>    res.json(results);</div>
                <div>  &#125;);</div>
                <div>&#125;);</div>
              </div>
            </div>

            <div className="text-[10px] text-emerald-300 bg-emerald-950/20 border border-emerald-500/20 rounded p-2 mt-4 space-y-0.5 leading-snug">
              <div>✅ <strong>SQL Sanitization Check:</strong> Parameter binding verified.</div>
              <div>✅ <strong>RBAC Validation Check:</strong> Identity verification enforced.</div>
              <div>✅ <strong>Tenant Separation Check:</strong> Organization isolation constraint active.</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
