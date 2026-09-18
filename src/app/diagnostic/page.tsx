"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import {
  Compass,
  Atom,
  FlaskConical,
  Pi,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Award,
  AlertCircle,
  Loader2,
} from "lucide-react";
import MathRenderer from "@/components/math/MathRenderer";
import ThemeToggle from "@/components/theme/ThemeToggle";

interface DiagnosticQuestion {
  id: string;
  subject: "PHYSICS" | "CHEMISTRY" | "MATHEMATICS";
  chapter: string;
  topic: string;
  subtopic?: string | null;
  difficulty: number;
  type: "SCQ" | "NVQ";
  stem: string;
  options: string[];
  yearTag?: string | null;
}

export default function DiagnosticPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [suite, setSuite] = useState<Record<string, DiagnosticQuestion[]>>({});
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Store student answers: { [qId]: { answer: string, timeSpentSeconds: number } }
  const [answers, setAnswers] = useState<Record<string, { answer: string; timeSpentSeconds: number }>>({});
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes per subject

  // Placement modal state
  const [placementData, setPlacementData] = useState<any | null>(null);

  const subjects: ("PHYSICS" | "CHEMISTRY" | "MATHEMATICS")[] = ["PHYSICS", "CHEMISTRY", "MATHEMATICS"];
  const currentSubject = subjects[currentSubjectIndex];
  const subjectQuestions = suite[currentSubject] || [];
  const currentQuestion = subjectQuestions[currentQuestionIndex];

  // Load questions
  useEffect(() => {
    fetch("/api/diagnostic/questions")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load questions");
        return res.json();
      })
      .then((data) => {
        if (data.suite) {
          setSuite(data.suite);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Subject Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [currentSubjectIndex]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSelectAnswer = (ans: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        answer: ans,
        timeSpentSeconds: 45,
      },
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < subjectQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else if (currentSubjectIndex < subjects.length - 1) {
      setCurrentSubjectIndex((prev) => prev + 1);
      setCurrentQuestionIndex(0);
      setTimeRemaining(600);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // Submit all diagnostic assessments
  const handleSubmitDiagnostic = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/diagnostic/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Submission failed");
      }

      setPlacementData(data.placement);

      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#6366f1", "#06b6d4", "#10b981", "#f59e0b"],
        });
      } catch (e) {}
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Calibrating Diagnostic Suite from Question Bank...</p>
        </div>
      </div>
    );
  }

  const subjectIcons = {
    PHYSICS: <Atom className="w-4 h-4 text-blue-500 dark:text-blue-400" />,
    CHEMISTRY: <FlaskConical className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />,
    MATHEMATICS: <Pi className="w-4 h-4 text-amber-500 dark:text-amber-400" />,
  };

  const isLastQuestionOfAll =
    currentSubjectIndex === subjects.length - 1 &&
    currentQuestionIndex === subjectQuestions.length - 1;

  const totalAnsweredCount = Object.keys(answers).length;
  const totalDiagnosticQuestions =
    (suite.PHYSICS?.length || 0) +
    (suite.CHEMISTRY?.length || 0) +
    (suite.MATHEMATICS?.length || 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      {/* Top Banner */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-950/80 px-4 sm:px-8 py-3.5 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Compass className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Diagnostic Assessment Suite
              <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/60 font-mono">
                IRT Baseline Calibration
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Answer honestly to calculate your authentic starting level (L1–L7).
            </p>
          </div>
        </div>

        {/* Timer, Theme Toggle & Progress */}
        <div className="flex items-center space-x-3">
          <ThemeToggle />
          <div className="hidden sm:flex items-center space-x-2 text-xs font-mono bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-200">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>{formatTime(timeRemaining)} left</span>
          </div>
          <div className="text-xs font-medium text-slate-700 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg">
            Answered: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{totalAnsweredCount}</span> / {totalDiagnosticQuestions}
          </div>
        </div>
      </div>

      {/* Subject Stepper Navigation */}
      <div className="bg-slate-100/60 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-8 py-2.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto">
            {subjects.map((sub, idx) => {
              const countForSub = suite[sub]?.length || 0;
              const answeredForSub = suite[sub]?.filter((q) => answers[q.id]?.answer).length || 0;
              const isActive = idx === currentSubjectIndex;
              const isPast = idx < currentSubjectIndex;

              return (
                <button
                  key={sub}
                  onClick={() => {
                    setCurrentSubjectIndex(idx);
                    setCurrentQuestionIndex(0);
                  }}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                      : isPast
                      ? "bg-slate-200 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-800"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  {subjectIcons[sub]}
                  <span>{sub}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-black/30 font-mono">
                    {answeredForSub}/{countForSub}
                  </span>
                </button>
              );
            })}
          </div>

          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Q {currentQuestionIndex + 1} of {subjectQuestions.length}
          </span>
        </div>
      </div>

      {/* Main Content: Question Viewer */}
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-6 flex flex-col justify-between">
        {currentQuestion && (
          <div className="space-y-6">
            {/* Metadata Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-slate-200 dark:border-slate-800/60 pb-3">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 font-semibold">
                  {currentQuestion.chapter}
                </span>
                <span className="text-slate-400 dark:text-slate-500">•</span>
                <span className="text-slate-600 dark:text-slate-400">{currentQuestion.topic}</span>
                {currentQuestion.subtopic && (
                  <>
                    <span className="text-slate-400 dark:text-slate-500">•</span>
                    <span className="text-slate-500 dark:text-slate-400 italic">{currentQuestion.subtopic}</span>
                  </>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 font-mono font-semibold">
                  Calibrated Tier: L{currentQuestion.difficulty}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 font-mono">
                  {currentQuestion.type}
                </span>
              </div>
            </div>

            {/* Question Stem */}
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 text-base shadow-sm">
              <MathRenderer content={currentQuestion.stem} />
            </div>

            {/* Options */}
            {currentQuestion.type === "SCQ" ? (
              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.options.map((optionText, optIndex) => {
                  const optKey = String(optIndex + 1);
                  const isSelected = answers[currentQuestion.id]?.answer === optKey;

                  return (
                    <button
                      key={optIndex}
                      onClick={() => handleSelectAnswer(optKey)}
                      className={`flex items-start text-left p-4 rounded-xl border transition-all ${
                        isSelected
                          ? "bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 ring-1 ring-indigo-500 text-indigo-950 dark:text-white"
                          : "bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-mono font-bold mr-3 mt-0.5 shrink-0 ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-600 text-white"
                            : "border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {String.fromCharCode(65 + optIndex)}
                      </div>
                      <div className="flex-1 text-sm pt-0.5">
                        <MathRenderer content={optionText} />
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Enter Numerical Value Answer
                </label>
                <input
                  type="text"
                  placeholder="e.g. 4 or 0.25"
                  value={answers[currentQuestion.id]?.answer || ""}
                  onChange={(e) => handleSelectAnswer(e.target.value)}
                  className="w-full sm:w-64 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-lg font-mono text-cyan-600 dark:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            )}
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
          <button
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-40 flex items-center gap-1.5 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {/* Quick Palette Circles */}
          <div className="hidden md:flex items-center space-x-1.5">
            {subjectQuestions.map((q, idx) => {
              const isAnswered = !!answers[q.id]?.answer;
              const isCurrent = idx === currentQuestionIndex;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all ${
                    isCurrent
                      ? "bg-indigo-600 text-white ring-2 ring-indigo-400"
                      : isAnswered
                      ? "bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-500 text-emerald-700 dark:text-emerald-300"
                      : "bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {isLastQuestionOfAll ? (
            <button
              onClick={handleSubmitDiagnostic}
              disabled={submitting}
              className="px-6 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Computing Competency Tiers...</span>
                </>
              ) : (
                <>
                  <span>Complete Diagnostic & Calibrate</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
            >
              Next Question
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Celebratory Level Reveal Modal */}
      {placementData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 max-w-lg w-full rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-cyan-400 to-emerald-400 mx-auto flex items-center justify-center shadow-xl shadow-cyan-500/30">
              <Award className="w-8 h-8 text-slate-950 font-bold" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                Diagnostic Complete
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Your Baseline Tiers Calibrated</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Item Response Theory (IRT) successfully evaluated your answers and calibrated starting tiers:
              </p>
            </div>

            {/* Subject Tier Cards */}
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(placementData).map(([sub, p]: [string, any]) => {
                const colors: Record<string, string> = {
                  PHYSICS: "text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/60 bg-blue-50 dark:bg-blue-950/30",
                  CHEMISTRY: "text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/30",
                  MATHEMATICS: "text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30",
                };
                return (
                  <div
                    key={sub}
                    className={`p-3 rounded-2xl border ${colors[sub] || "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"}`}
                  >
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400 block mb-1">
                      {sub.slice(0, 4)}
                    </span>
                    <div className="text-3xl font-black font-mono">L{p.assignedLevel}</div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                      {p.accuracy}% Acc
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
                <Sparkles className="w-4 h-4" />
                Diagnostic XP Awarded
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                +
                {Object.values(placementData).reduce((acc: number, curr: any) => acc + curr.xpEarned, 0)}{" "}
                XP
              </span>
            </div>

            <button
              onClick={() => {
                router.push("/dashboard");
                router.refresh();
              }}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <span>Enter Main Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
