/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Terminal, 
  Activity, 
  Trophy, 
  ChevronRight, 
  History, 
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Zap
} from 'lucide-react';
import { GameState, DecisionRecord, FinalReport } from './types.ts';
import { calculateRank, generateScenario, processDecision, generateFinalReport } from './lib/gemini.ts';

const MAX_ROUNDS = 5;

const TelemetryFeed = () => {
  const [logs, setLogs] = useState<string[]>([]);
  
  useEffect(() => {
    const prefixes = ['SIEM', 'WAF', 'EDR', 'IDS', 'IAM', 'SYS'];
    const events = [
      'Failed login attempt',
      'Port scan detected',
      'Outbound TLS tunnel',
      'PowerShell spawned',
      'File rename: .locked',
      'Admin session opened',
      'GeoIP mismatch'
    ];
    
    const interval = setInterval(() => {
      const log = `[${new Date().toLocaleTimeString()}] ${prefixes[Math.floor(Math.random() * prefixes.length)]}: ${events[Math.floor(Math.random() * events.length)]}`;
      setLogs(prev => [log, ...prev].slice(0, 15));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-1 font-mono text-[9px] text-blue-500/50 leading-none h-40 overflow-hidden mask-fade-bottom">
      {logs.map((l, i) => (
        <div key={i} className="flex gap-2">
          <span className="shrink-0 text-blue-800">{">>>"}</span>
          <span className="truncate">{l}</span>
        </div>
      ))}
    </div>
  );
};

const MitreMap = ({ activeStage }: { activeStage?: string }) => {
  const stages = [
    'Initial Access', 'Execution', 'Persistence', 'Privilege Escalation',
    'Defense Evasion', 'Discovery', 'Lateral Movement', 'Exfiltration', 'Impact'
  ];
  
  return (
    <div className="grid grid-cols-3 gap-1 pt-4">
      {stages.map(s => (
        <div 
          key={s} 
          className={`px-1 py-0.5 border text-[8px] font-mono tracking-tighter uppercase text-center truncate ${activeStage === s ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'border-slate-800 text-slate-600 bg-slate-900/40'}`}
        >
          {s}
        </div>
      ))}
    </div>
  );
};

export default function App() {
  const [state, setState] = useState<GameState>({
    round: 0,
    score: 0,
    xp: 0,
    rank: 'Trainee Analyst',
    riskLevel: 20,
    confidenceLevel: 50,
    history: [],
    activeFlags: [],
    status: 'start',
  });

  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<FinalReport | null>(null);

  const startNewGame = useCallback(() => {
    setState({
      round: 1,
      score: 0,
      xp: 0,
      rank: 'Trainee Analyst',
      riskLevel: 20,
      confidenceLevel: 50,
      history: [],
      activeFlags: [],
      status: 'playing',
    });
    loadNextRound(1);
  }, []);

  const loadNextRound = async (round: number) => {
    setLoading(true);
    try {
      const scenario = await generateScenario({ ...state, round });
      setState(prev => ({ ...prev, currentScenario: scenario, status: 'playing', round }));
    } catch (error) {
      console.error("Failed to generate scenario:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (optionId: string) => {
    if (!state.currentScenario) return;
    setLoading(true);
    try {
      const feedback = await processDecision(state.currentScenario, optionId);
      const selectedOption = state.currentScenario.options.find(o => o.id === optionId);
      
      const record: DecisionRecord = {
        round: state.round,
        scenario: state.currentScenario.title,
        userDecision: selectedOption?.label || "",
        consequence: feedback.consequence,
        scoreDelta: feedback.scoreDelta,
        riskDelta: feedback.riskDelta,
        isCorrect: feedback.scoreDelta > 0,
      };

      setState(prev => {
        const nextScore = Math.max(0, prev.score + feedback.scoreDelta);
        const nextXp = prev.xp + (feedback.scoreDelta > 0 ? 100 : 20);
        
        return {
          ...prev,
          score: nextScore,
          xp: nextXp,
          rank: calculateRank(nextScore),
          riskLevel: Math.max(0, Math.min(100, prev.riskLevel + feedback.riskDelta)),
          confidenceLevel: Math.max(0, Math.min(100, prev.confidenceLevel + feedback.confidenceDelta)),
          history: [...prev.history, record],
          currentFeedback: feedback,
          activeFlags: selectedOption?.flag ? [...prev.activeFlags, selectedOption.flag] : prev.activeFlags,
          status: 'round_feedback'
        };
      });
    } catch (error) {
      console.error("Failed to process decision:", error);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    if (state.round >= MAX_ROUNDS) {
      setLoading(true);
      setState(prev => ({ ...prev, status: 'game_over' }));
      try {
        const finalReport = await generateFinalReport(state);
        setReport(finalReport);
      } catch (error) {
        console.error("Failed to generate report:", error);
      } finally {
        setLoading(false);
      }
    } else {
      loadNextRound(state.round + 1);
    }
  };

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden relative">
      {/* Cinematic Overlays */}
      <div className="absolute inset-0 pointer-events-none z-50">
        <div className="absolute inset-0 scanline opacity-[0.03]"></div>
        <div className="absolute inset-0 scanner-sweep opacity-[0.02]"></div>
        <div className="absolute inset-0 crt-flicker opacity-[0.01]"></div>
      </div>

      {/* Header */}
      <header className="h-16 border-b border-slate-800 px-8 flex items-center justify-between bg-slate-900/50 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
          <h1 className="text-sm font-bold tracking-[0.2em] uppercase text-slate-400">
            Cyber-Defense Simulator // SOC-UNIT-04
          </h1>
        </div>
        <div className="hidden md:flex gap-8 text-[11px] font-mono tracking-wider">
          <span className="text-blue-400">STATUS: <span className="text-white">ACTIVE_INCIDENT</span></span>
          <span className="text-blue-400">RND: <span className="text-white">0{state.round}/05</span></span>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <AnimatePresence mode="wait">
          {state.status === 'start' && (
            <motion.section 
              key="start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex items-center justify-center p-8 bg-[radial-gradient(circle_at_50%_40%,#1e293b_0%,transparent_100%)]"
            >
              <div className="max-w-2xl text-center space-y-12">
                <div className="space-y-4">
                  <div className="inline-block px-3 py-1 bg-blue-900/40 text-blue-400 text-[10px] font-mono border border-blue-800/50 tracking-widest uppercase">
                    Protocol: Initialization
                  </div>
                  <h2 className="text-6xl font-light tracking-tighter text-white">SECURE THE GRID.</h2>
                  <p className="text-slate-400 leading-relaxed text-lg max-w-lg mx-auto">
                    Advanced AI-powered SOC trainer. Experience real-time alerts, critical decision-making, and forensic reporting.
                  </p>
                </div>
                
                <div className="grid grid-cols-3 gap-1 pt-8">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ x: "-100%" }}
                        animate={{ x: "0%" }}
                        transition={{ delay: i * 0.2, duration: 1 }}
                        className="h-full bg-blue-500"
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <button 
                    onClick={startNewGame}
                    className="px-12 py-5 bg-white text-black font-bold tracking-widest uppercase text-xs hover:bg-blue-400 transition-colors flex items-center gap-4 mx-auto group"
                  >
                    Deploy Analyst 01
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.section>
          )}

          {state.status === 'playing' || state.status === 'round_feedback' ? (
            <>
              {/* Sidebar Metrics */}
              <motion.aside 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-80 border-r border-slate-800 flex flex-col shrink-0 bg-slate-900/20"
              >
                <div className="p-6 border-b border-slate-800">
                  <div className="mb-8">
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 block font-mono">Mission Score</label>
                    <div className="text-4xl font-light tracking-tighter text-white font-mono">{state.score.toLocaleString()}</div>
                    <div className="text-[9px] font-mono text-blue-500 mt-1 uppercase tracking-widest">
                      XP: {state.xp} / Rank: {state.rank}
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-[10px] uppercase tracking-wider mb-2 font-mono">
                        <span className="text-slate-400">Infrastructure Risk</span>
                        <span className={state.riskLevel > 50 ? "text-red-400" : "text-emerald-400"}>{state.riskLevel}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          animate={{ width: `${state.riskLevel}%` }}
                          className={`h-full ${state.riskLevel > 50 ? "bg-red-500" : "bg-emerald-500"}`}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] uppercase tracking-wider mb-2 font-mono">
                        <span className="text-slate-400">Confidence Level</span>
                        <span className="text-blue-400">{state.confidenceLevel}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          animate={{ width: `${state.confidenceLevel}%` }}
                          className="h-full bg-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-6 overflow-hidden flex flex-col gap-8">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 mb-4 block font-mono">MITRE ATT&CK Mapping</label>
                    <MitreMap activeStage={state.currentScenario?.mitreStage} />
                  </div>

                  <div className="flex-1 flex flex-col min-h-0">
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 mb-4 block font-mono">Live Telemetry Feed</label>
                    <TelemetryFeed />
                  </div>
                  
                  <div className="shrink-0 h-32 flex flex-col">
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 mb-4 block font-mono">Operational Chain</label>
                    <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
                       {state.history.length === 0 ? (
                        <div className="flex gap-2 items-center opacity-30 text-[10px] font-mono">
                          <Activity size={10} className="animate-pulse" />
                          WAITING FOR INCIDENT...
                        </div>
                      ) : [...state.history].reverse().slice(0, 3).map((h, i) => (
                        <div key={i} className="flex gap-3 items-start">
                          <div className={`w-1 h-6 ${h.isCorrect ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                          <div>
                            <p className="text-[10px] font-mono leading-tight text-slate-400 uppercase truncate max-w-[150px]">{h.userDecision}</p>
                            <p className="text-[8px] font-mono text-slate-600">{h.isCorrect ? 'STABILIZED' : 'BREACH'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-slate-800 bg-slate-900/40">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">Operations</span>
                    <span className="text-xs font-mono text-white">RND 0{state.round}/05</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map(r => (
                      <div 
                        key={r} 
                        className={`h-1.5 flex-1 ${r < state.round ? 'bg-blue-500' : r === state.round ? (state.status === 'playing' ? 'bg-blue-500/40 border border-blue-500/50' : 'bg-blue-500') : 'bg-slate-800'}`}
                      />
                    ))}
                  </div>
                </div>
              </motion.aside>

              {/* Main Interface */}
              <section className="flex-1 p-8 md:p-16 flex flex-col bg-slate-950 overflow-y-auto">
                <div className="max-w-3xl mx-auto w-full flex-1">
                  {state.status === 'playing' ? (
                    <motion.div 
                      key="scenario"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-12"
                    >
                      <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-blue-900/40 text-blue-400 text-[10px] font-mono tracking-tighter border border-blue-800/50">
                          SIGNAL_{state.round}_ALERT
                        </span>
                        <div className="h-px flex-1 bg-slate-800"></div>
                        {loading && <Activity size={14} className="text-blue-500 animate-pulse" />}
                      </div>

                      <div className="space-y-8">
                        <h2 className="text-4xl font-light text-white leading-tight">
                          {loading ? "Decrypting Signal..." : (
                            <>
                              {state.currentScenario?.title.split(':')[0]}
                              {state.currentScenario?.title.includes(':') && (
                                <><br/><span className="text-slate-400 italic text-2xl">{state.currentScenario.title.split(':')[1]}</span></>
                              )}
                            </>
                          )}
                        </h2>
                        
                        <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-lg relative overflow-hidden group">
                          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50 group-hover:bg-blue-500 transition-colors" />
                          <p className="text-slate-300 leading-relaxed font-mono text-sm mb-6">
                            {loading ? "Waiting for data packets..." : state.currentScenario?.description}
                          </p>

                          {/* Artifacts View */}
                          {!loading && state.currentScenario?.artifacts && (
                            <div className="mt-8 space-y-4">
                              <label className="text-[9px] uppercase tracking-widest text-blue-500 font-mono">Attached Evidence Artifacts</label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {state.currentScenario.artifacts.map((art, idx) => (
                                  <div key={idx} className="bg-black/40 border border-slate-800 p-3 rounded font-mono text-[10px] text-slate-500">
                                    <div className="flex justify-between border-b border-white/5 pb-1 mb-2">
                                      <span className="text-blue-400/70 text-[9px] uppercase">{art.label}</span>
                                      <span className="text-[8px] opacity-30">TYPE: {art.type.toUpperCase()}</span>
                                    </div>
                                    <div className="whitespace-pre-wrap leading-tight">{art.content}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {loading ? [1, 2, 3, 4].map(i => (
                          <div key={i} className="h-32 bg-slate-900 border border-slate-800 rounded animate-pulse" />
                        )) : state.currentScenario?.options.map((opt, i) => (
                          <button
                            key={opt.id}
                            onClick={() => handleDecision(opt.id)}
                            className="group p-6 bg-slate-900 border border-slate-800 hover:border-blue-500 transition-all text-left flex flex-col gap-2 rounded-md hover:bg-slate-800/50"
                          >
                            <span className="text-[10px] font-mono text-blue-500">OPTION_0{i + 1}</span>
                            <span className="text-sm font-bold text-slate-200 group-hover:text-white uppercase tracking-wider">{opt.label}</span>
                            <span className="text-[11px] text-slate-500 font-mono leading-tight">{opt.explanation}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ) : state.status === 'round_feedback' && state.currentFeedback && (
                    <motion.div 
                      key="feedback"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-12 py-8"
                    >
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 bg-${state.currentFeedback.scoreDelta > 0 ? 'emerald' : 'red'}-900/40 text-${state.currentFeedback.scoreDelta > 0 ? 'emerald' : 'red'}-400 text-[10px] font-mono tracking-tighter border border-${state.currentFeedback.scoreDelta > 0 ? 'emerald' : 'red'}-800/50`}>
                          ANALYSIS_COMPLETE
                        </span>
                        <div className="h-px flex-1 bg-slate-800"></div>
                      </div>

                      <div className="space-y-8 text-center">
                        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center border-2 ${state.currentFeedback.scoreDelta > 0 ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' : 'border-red-500 text-red-500 bg-red-500/10'}`}>
                          {state.currentFeedback.scoreDelta > 0 ? <ShieldCheck size={32} /> : <ShieldAlert size={32} />}
                        </div>
                        <div className="space-y-4">
                          <h2 className="text-4xl font-light text-white tracking-tighter uppercase">{state.currentFeedback.consequence}</h2>
                          <div className="max-w-xl mx-auto p-8 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
                            <p className="text-slate-400 font-mono italic text-sm leading-relaxed">
                              {state.currentFeedback.explanation}
                            </p>
                            {state.currentFeedback.chainEffect && (
                              <div className="pt-4 border-t border-slate-800">
                                <span className="text-[10px] text-blue-500 font-mono uppercase tracking-widest block mb-1">Operational Chain Effect</span>
                                <p className="text-blue-200/70 font-mono text-xs leading-relaxed">
                                  {state.currentFeedback.chainEffect}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={nextStep}
                        disabled={loading}
                        className="px-12 py-5 bg-blue-600 text-white font-bold tracking-widest uppercase text-xs hover:bg-blue-500 transition-colors flex items-center gap-4 mx-auto disabled:opacity-50"
                      >
                        {loading ? "Uploading Results..." : (state.round >= MAX_ROUNDS ? "Execute Final Audit" : "Continue Surveillance")}
                        <ChevronRight size={16} />
                      </button>
                    </motion.div>
                  )}
                </div>

                <div className="max-w-3xl mx-auto w-full mt-12 pt-8 border-t border-slate-900/50 flex justify-between items-center text-[10px] uppercase tracking-[0.2em] text-slate-600 font-mono">
                  <span>Unit ID: {state.status === 'playing' ? `A-${state.round}X-92` : 'AUDIT_MODE'}</span>
                  <span className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500/50 rounded-full animate-pulse" />
                    Waiting for input...
                  </span>
                </div>
              </section>
            </>
          ) : null}

          {state.status === 'game_over' && (
            <motion.section 
              key="game_over"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 p-8 md:p-16 flex flex-col items-center bg-slate-950 overflow-y-auto"
            >
              <div className="max-w-4xl w-full space-y-16">
                <div className="text-center space-y-4">
                  <div className="inline-block px-3 py-1 bg-slate-900 border border-slate-800 text-slate-500 text-[10px] font-mono tracking-[0.3em] uppercase">
                    Forensic Report // Unit 0{state.round}
                  </div>
                  <h2 className="text-7xl font-light tracking-tighter text-white">MISSION AUDIT.</h2>
                  <div className="flex justify-center gap-12 pt-8">
                    <div className="text-center">
                      <div className="text-slate-500 text-[10px] font-mono uppercase tracking-widest mb-2">Final Index</div>
                      <div className="text-5xl font-light text-white font-mono">{state.score}</div>
                    </div>
                    <div className="w-px h-16 bg-slate-800" />
                    <div className="text-center">
                      <div className="text-slate-500 text-[10px] font-mono uppercase tracking-widest mb-2">Analyst XP</div>
                      <div className="text-5xl font-light text-blue-500 font-mono">{state.xp}</div>
                    </div>
                    <div className="w-px h-16 bg-slate-800" />
                    <div className="text-center">
                      <div className="text-slate-500 text-[10px] font-mono uppercase tracking-widest mb-2">Risk Mitigated</div>
                      <div className="text-5xl font-light text-emerald-500 font-mono">{100 - state.riskLevel}%</div>
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="py-24 text-center space-y-4">
                    <Terminal className="mx-auto text-blue-500 animate-pulse" size={48} />
                    <p className="text-slate-500 font-mono text-sm tracking-widest uppercase">Aggregating Global Signals...</p>
                  </div>
                ) : report && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-8 space-y-8">
                      <div className="text-center pb-6 border-b border-slate-800">
                        <div className="text-slate-500 text-[10px] font-mono uppercase tracking-[0.2em] mb-2">Credential Issued</div>
                        <div className="text-3xl font-bold text-white uppercase italic tracking-tighter">{report.rankTitle}</div>
                        <div className="text-[10px] text-blue-500 font-mono mt-2">{report.rating}</div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="text-emerald-500 text-[10px] font-mono font-bold uppercase tracking-[0.2em]">Validated Protocols</h4>
                        <ul className="space-y-3">
                          {report.goodDecisions.map((d, i) => (
                            <li key={i} className="text-sm text-slate-300 border-l border-emerald-500/30 pl-4 py-1 leading-relaxed">
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 space-y-4">
                        <h4 className="text-red-500 text-[10px] font-mono font-bold uppercase tracking-[0.2em]">Signal Vulnerabilities</h4>
                        <ul className="space-y-3">
                          {report.riskyChoices.map((d, i) => (
                            <li key={i} className="text-sm text-slate-400 border-l border-red-500/30 pl-4 py-1 font-mono italic">
                              {d}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-blue-900/20 border border-blue-900/50 rounded-lg p-8 space-y-6">
                        <h4 className="text-blue-400 text-[10px] font-mono font-bold uppercase tracking-[0.2em]">Retraining Roadmap</h4>
                        <div className="space-y-4">
                          {report.recommendations.map((d, i) => (
                            <div key={i} className="flex gap-4">
                              <span className="text-blue-500 font-mono text-xs">0{i + 1}</span>
                              <p className="text-sm text-slate-200">{d}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-center pt-8">
                  <button 
                    onClick={() => setState({ ...state, status: 'start', round: 0 })}
                    className="px-10 py-4 border border-slate-800 text-slate-100 font-mono tracking-widest uppercase text-xs hover:bg-slate-900 transition-colors flex items-center gap-4 mx-auto"
                  >
                    <RotateCcw size={16} />
                    Request Relocation
                  </button>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

