"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import {
  Compass,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  BookOpen,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Sparkles,
  Loader2,
  Atom,
  FlaskConical,
  Pi,
} from "lucide-react";
import MathRenderer from "@/components/math/MathRenderer";
import ThemeToggle from "@/components/theme/ThemeToggle";

// Standard NTA Statuses
type NTAStatus = "NOT_VISITED" | "NOT_ANSWERED" | "ANSWERED" | "MARKED_REVIEW" | "ANSWERED_MARKED_REVIEW";

interface MockQuestion {
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

export default function MockTestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Test Data
  const [testData, setTestData] = useState<any | null>(null);
  const [currentSubject, setCurrentSubject] = useState<"PHYSICS" | "CHEMISTRY" | "MATHEMATICS">("PHYSICS");
  const [currentSection, setCurrentSection] = useState<"sectionA" | "sectionB">("sectionA");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  // Question States & Answers
  // { [questionId]: { answer: string, status: NTAStatus, timeSpentSeconds: number } }
  const [questionStates, setQuestionStates] = useState<Record<string, { answer: string; status: NTAStatus; timeSpentSeconds: number }>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(180 * 60); // 180 mins

  // Modals
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [resultData, setResultData] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/mock-test/session")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load mock test");
        return res.json();
      })
      .then((data) => {
        if (data.subjects) {
          setTestData(data);

          // Initialize states
          const initial: Record<string, { answer: string; status: NTAStatus; timeSpentSeconds: number }> = {};
          const subjects: ("PHYSICS" | "CHEMISTRY" | "MATHEMATICS")[] = ["PHYSICS", "CHEMISTRY", "MATHEMATICS"];

          for (const s of subjects) {
            const sub = data.subjects[s];
            if (sub) {
              sub.sectionA.forEach((q: MockQuestion) => {
                initial[q.id] = { answer: "", status: "NOT_VISITED", timeSpentSeconds: 0 };
              });
              sub.sectionB.forEach((q: MockQuestion) => {
                initial[q.id] = { answer: "", status: "NOT_VISITED", timeSpentSeconds: 0 };
              });
            }
          }

          // Mark first question as NOT_ANSWERED
          const firstQ = data.subjects.PHYSICS?.sectionA?.[0];
          if (firstQ) {
            initial[firstQ.id].status = "NOT_ANSWERED";
          }

          setQuestionStates(initial);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Timer Ticker
  useEffect(() => {
    if (resultData) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [resultData]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const currentQuestions: MockQuestion[] = testData?.subjects?.[currentSubject]?.[currentSection] || [];
  const currentQuestion: MockQuestion | undefined = currentQuestions[currentQuestionIndex];
  const currentState = currentQuestion ? questionStates[currentQuestion.id] : undefined;

  // Jump to Question
  const handleSelectQuestion = (index: number) => {
    if (!currentQuestions[index]) return;
    const targetQ = currentQuestions[index];

    setQuestionStates((prev) => {
      const existing = prev[targetQ.id];
      if (existing?.status === "NOT_VISITED") {
        return {
          ...prev,
          [targetQ.id]: { ...existing, status: "NOT_ANSWERED" },
        };
      }
      return prev;
    });

    setCurrentQuestionIndex(index);
  };

  // Select Option / Input Value
  const handleAnswerChange = (val: string) => {
    if (!currentQuestion) return;
    setQuestionStates((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        answer: val,
      },
    }));
  };

  // Action: Save & Next
  const handleSaveAndNext = () => {
    if (!currentQuestion) return;
    const currAns = questionStates[currentQuestion.id]?.answer;

    setQuestionStates((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        status: currAns ? "ANSWERED" : "NOT_ANSWERED",
      },
    }));

    // Advance to next question
    if (currentQuestionIndex < currentQuestions.length - 1) {
      handleSelectQuestion(currentQuestionIndex + 1);
    } else if (currentSection === "sectionA") {
      setCurrentSection("sectionB");
      setCurrentQuestionIndex(0);
    }
  };

  // Action: Clear Response
  const handleClearResponse = () => {
    if (!currentQuestion) return;
    setQuestionStates((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        answer: "",
        status: "NOT_ANSWERED",
      },
    }));
  };

  // Action: Mark for Review & Next
  const handleMarkForReviewAndNext = () => {
    if (!currentQuestion) return;
    const currAns = questionStates[currentQuestion.id]?.answer;

    setQuestionStates((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        status: currAns ? "ANSWERED_MARKED_REVIEW" : "MARKED_REVIEW",
      },
    }));

    if (currentQuestionIndex < currentQuestions.length - 1) {
      handleSelectQuestion(currentQuestionIndex + 1);
    } else if (currentSection === "sectionA") {
      setCurrentSection("sectionB");
      setCurrentQuestionIndex(0);
    }
  };

  // Submit Test Session
  const handleSubmitTest = async () => {
    setShowSubmitModal(false);
    setSubmitting(true);

    try {
      const answersPayload: Record<string, any> = {};
      for (const [qId, st] of Object.entries(questionStates)) {
        answersPayload[qId] = {
          answer: st.answer,
          timeSpentSeconds: st.timeSpentSeconds || 60,
          status: st.status,
        };
      }

      const res = await fetch("/api/mock-test/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: answersPayload,
          timeSpentSeconds: 180 * 60 - timeRemaining,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      setResultData(data);

      try {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.5 },
          colors: ["#22c55e", "#6366f1", "#06b6d4", "#f59e0b"],
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
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm text-slate-400">Loading NTA Standard 300-Mark Question Paper...</p>
        </div>
      </div>
    );
  }

  // Count states for palette legend
  const allStates = Object.values(questionStates);
  const countAnswered = allStates.filter((s) => s.status === "ANSWERED").length;
  const countNotAnswered = allStates.filter((s) => s.status === "NOT_ANSWERED").length;
  const countNotVisited = allStates.filter((s) => s.status === "NOT_VISITED").length;
  const countMarkedReview = allStates.filter((s) => s.status === "MARKED_REVIEW").length;
  const countAnsweredMarkedReview = allStates.filter((s) => s.status === "ANSWERED_MARKED_REVIEW").length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 flex flex-col select-none transition-colors">
      {/* NTA Official Header */}
      <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
            NTA
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
              JEE (Main) Simulation Test 2026
            </h1>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Total Marks: 300 | 75 Questions</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4">
          <ThemeToggle />

          {/* Real-time NTA Countdown Timer */}
          <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 rounded-xl font-mono text-xs">
            <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400 animate-pulse" />
            <span className="text-slate-600 dark:text-slate-300">Time Left:</span>
            <span className="font-bold text-cyan-600 dark:text-cyan-400 text-sm">{formatTime(timeRemaining)}</span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all"
          >
            Submit Test
          </button>
        </div>
      </header>

      {/* Main Examination Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Question Stem & Options (70% width) */}
        <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-slate-800 overflow-y-auto">
          {/* Subject & Section Selector */}
          <div className="space-y-3 pb-4 border-b border-slate-800">
            {/* Subject Tabs */}
            <div className="flex items-center space-x-2">
              {(["PHYSICS", "CHEMISTRY", "MATHEMATICS"] as const).map((sub) => (
                <button
                  key={sub}
                  onClick={() => {
                    setCurrentSubject(sub);
                    setCurrentQuestionIndex(0);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    currentSubject === sub
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                      : "bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>

            {/* Section A / B Toggle */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setCurrentSection("sectionA");
                    setCurrentQuestionIndex(0);
                  }}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                    currentSection === "sectionA"
                      ? "bg-slate-200 dark:bg-slate-800 text-cyan-700 dark:text-cyan-400 border border-cyan-400/40"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
                  }`}
                >
                  Section A: Single Choice (20 Qs, +4 / -1)
                </button>
                <button
                  onClick={() => {
                    setCurrentSection("sectionB");
                    setCurrentQuestionIndex(0);
                  }}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                    currentSection === "sectionB"
                      ? "bg-slate-200 dark:bg-slate-800 text-amber-700 dark:text-amber-400 border border-amber-400/40"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
                  }`}
                >
                  Section B: Numerical Value (10 Qs, +4 / 0)
                </button>
              </div>

              <span className="text-slate-500 dark:text-slate-400 font-mono">
                Question No. {currentQuestionIndex + 1}
              </span>
            </div>
          </div>

          {/* Question Stem Content */}
          {currentQuestion && (
            <div className="my-6 space-y-6 flex-1">
              <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/90 rounded-2xl p-6 shadow-sm">
                <MathRenderer content={currentQuestion.stem} />
              </div>

              {/* Options (SCQ) or Input Box (NVQ) */}
              {currentQuestion.type === "SCQ" ? (
                <div className="grid grid-cols-1 gap-3">
                  {currentQuestion.options.map((optText, optIdx) => {
                    const optKey = String(optIdx + 1);
                    const isSelected = currentState?.answer === optKey;

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleAnswerChange(optKey)}
                        className={`flex items-start text-left p-4 rounded-xl border transition-all ${
                          isSelected
                            ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 ring-1 ring-indigo-500 text-indigo-950 dark:text-white"
                            : "bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-mono font-bold mr-3 mt-0.5 shrink-0 ${
                            isSelected
                              ? "border-indigo-500 bg-indigo-600 text-white"
                              : "border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </div>
                        <div className="flex-1 text-sm pt-0.5">
                          <MathRenderer content={optText} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-3 shadow-sm">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Numerical Value Answer (Decimal or Integer)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter numeric answer..."
                    value={currentState?.answer || ""}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    className="w-full sm:w-64 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-lg font-mono text-cyan-600 dark:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* Action Footer (Official NTA Action Controls) */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSaveAndNext}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
              >
                Save & Next
              </button>
              <button
                onClick={handleClearResponse}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all"
              >
                Clear Response
              </button>
              <button
                onClick={handleMarkForReviewAndNext}
                className="px-3.5 py-2 rounded-xl bg-purple-900/80 hover:bg-purple-800 text-purple-200 text-xs font-semibold border border-purple-700/60 transition-all"
              >
                Mark for Review & Next
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (currentQuestionIndex > 0) {
                    handleSelectQuestion(currentQuestionIndex - 1);
                  }
                }}
                disabled={currentQuestionIndex === 0}
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 text-xs font-semibold flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={() => {
                  if (currentQuestionIndex < currentQuestions.length - 1) {
                    handleSelectQuestion(currentQuestionIndex + 1);
                  }
                }}
                disabled={currentQuestionIndex === currentQuestions.length - 1}
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 text-xs font-semibold flex items-center gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: NTA Official Question Palette Sidebar (30% width) */}
        <div className="w-full lg:w-80 bg-slate-50 dark:bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-5">
            {/* Palette Legend (The 5 Official NTA States) */}
            <div className="space-y-2 pb-4 border-b border-slate-200 dark:border-slate-800 text-[11px]">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-mono font-bold flex items-center justify-center text-[10px]">
                    {countAnswered}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">Answered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-md bg-red-600 text-white font-mono font-bold flex items-center justify-center text-[10px]">
                    {countNotAnswered}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">Not Answered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-md bg-slate-400 dark:bg-slate-700 text-white font-mono font-bold flex items-center justify-center text-[10px]">
                    {countNotVisited}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">Not Visited</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-md bg-purple-600 text-white font-mono font-bold flex items-center justify-center text-[10px]">
                    {countMarkedReview}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">Marked Review</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-1">
                <span className="w-5 h-5 rounded-md bg-purple-600 text-white font-mono font-bold flex items-center justify-center text-[10px] relative">
                  {countAnsweredMarkedReview}
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute top-0.5 right-0.5" />
                </span>
                <span className="text-slate-700 dark:text-slate-300 text-[10px]">Ans & Marked for Review</span>
              </div>
            </div>

            {/* Questions Grid */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3">
                {currentSubject} - {currentSection === "sectionA" ? "Section A" : "Section B"}
              </h3>

              <div className="grid grid-cols-5 gap-2">
                {currentQuestions.map((q, idx) => {
                  const state = questionStates[q.id]?.status || "NOT_VISITED";
                  const isCurrent = idx === currentQuestionIndex;

                  let bgClass = "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700";
                  if (state === "ANSWERED") {
                    bgClass = "bg-emerald-600 text-white font-bold";
                  } else if (state === "NOT_ANSWERED") {
                    bgClass = "bg-red-600 text-white font-bold";
                  } else if (state === "MARKED_REVIEW") {
                    bgClass = "bg-purple-600 text-white font-bold";
                  } else if (state === "ANSWERED_MARKED_REVIEW") {
                    bgClass = "bg-purple-600 text-white font-bold relative";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => handleSelectQuestion(idx)}
                      className={`h-9 rounded-lg text-xs font-mono transition-all flex items-center justify-center ${bgClass} ${
                        isCurrent ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 scale-105" : ""
                      }`}
                    >
                      {idx + 1}
                      {state === "ANSWERED_MARKED_REVIEW" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute top-1 right-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all"
            >
              Submit Entire Test
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 max-w-md w-full rounded-3xl p-6 text-center space-y-5 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-700/60 mx-auto flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Submit Question Paper?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to finish the JEE Main Mock Test? Answers once submitted will be graded immediately.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs py-2">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Answered</span>
                <span className="font-bold text-emerald-400 text-base">{countAnswered + countAnsweredMarkedReview}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Unanswered</span>
                <span className="font-bold text-red-400 text-base">{countNotAnswered}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Marked Review</span>
                <span className="font-bold text-purple-400 text-base">{countMarkedReview}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Resume Test
              </button>
              <button
                onClick={handleSubmitTest}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all"
              >
                {submitting ? "Grading Paper..." : "Confirm & Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post-Test Analysis & Full Scorecard */}
      {resultData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 max-w-4xl w-full rounded-3xl p-6 sm:p-8 space-y-6 my-8 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center text-slate-950 font-black">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">NTA Scorecard & Detailed Analytics</h2>
                  <span className="text-xs text-slate-400">JEE Main Simulation Examination #1</span>
                </div>
              </div>
              <button
                onClick={() => router.push("/dashboard")}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
              >
                Back to Dashboard
              </button>
            </div>

            {/* Top Score Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono block">Total Marks</span>
                <span className="text-3xl font-black font-mono text-cyan-400">
                  {resultData.totalScore} <span className="text-xs text-slate-500 font-normal">/ 300</span>
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono block">Estimated Percentile</span>
                <span className="text-3xl font-black font-mono text-emerald-400">
                  {resultData.estimatedPercentile}%ile
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono block">Accuracy</span>
                <span className="text-3xl font-black font-mono text-amber-400">{resultData.accuracy}%</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono block">XP Earned</span>
                <span className="text-3xl font-black font-mono text-indigo-400">+{resultData.xpAwarded}</span>
              </div>
            </div>

            {/* Subject-Wise Performance Breakdown */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Subject Breakdown</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Object.entries(resultData.subjectBreakdown).map(([sub, info]: [string, any]) => (
                  <div key={sub} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                    <span className="text-xs font-bold text-white block mb-1">{sub}</span>
                    <div className="text-xl font-black font-mono text-cyan-400">{info.score} Marks</div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between mt-2 pt-2 border-t border-slate-800">
                      <span className="text-emerald-400 font-semibold">{info.correct} Correct</span>
                      <span className="text-red-400 font-semibold">{info.incorrect} Incorrect</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Solutions Accordion / List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-400" /> Worked Solutions (KaTeX Typeset)
              </h3>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                {resultData.solutions?.slice(0, 15).map((sol: any, sIdx: number) => (
                  <div
                    key={sIdx}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-300">
                        Q{sIdx + 1}: {sol.chapter} • {sol.topic}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-mono font-bold ${
                          sol.isCorrect
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                            : "bg-red-950 text-red-300 border border-red-800"
                        }`}
                      >
                        {sol.isCorrect ? "+4 Marks" : sol.userAnswer ? "-1 Mark" : "0 Marks"}
                      </span>
                    </div>

                    <div className="text-slate-200">
                      <MathRenderer content={sol.stem} />
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                      <div>
                        Correct Answer: <strong className="text-emerald-400">{sol.correctAnswer}</strong> | Your Answer: <strong>{sol.userAnswer || "None"}</strong>
                      </div>
                      <div className="bg-slate-900 p-2.5 rounded-lg">
                        <span className="font-semibold text-indigo-300 block mb-1">Worked Solution:</span>
                        <MathRenderer content={sol.solution} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
