"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import {
  Compass,
  ArrowRight,
  Sparkles,
  Flame,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  RotateCcw,
  BookOpen,
  Award,
  AlertCircle,
  Loader2,
  HelpCircle,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import MathRenderer from "@/components/math/MathRenderer";

function PracticeQuizInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectParam = searchParams.get("subject") || "physics";
  const topicParam = searchParams.get("topic") || "";

  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [userXP, setUserXP] = useState(0);
  const [streak, setStreak] = useState(0);

  // Current Question
  const [question, setQuestion] = useState<any | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [attemptedIds, setAttemptedIds] = useState<string[]>([]);
  const [recentHistory, setRecentHistory] = useState<any[]>([]);

  // Timer for time-spent evaluation (detecting < 15s rapid guesses)
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Evaluation Feedback State
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<any | null>(null);

  // Total questions in this session
  const [sessionCount, setSessionCount] = useState<number>(0);

  // Load next question
  const fetchNextQuestion = async (currAttempted = attemptedIds) => {
    setLoading(true);
    setSubmitted(false);
    setSelectedAnswer("");
    setFeedback(null);
    setStartTime(Date.now());
    setElapsedSeconds(0);

    try {
      const res = await fetch("/api/practice/next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subjectParam,
          topic: topicParam,
          attemptedIds: currAttempted,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch question");

      if (data.question) {
        setQuestion(data.question);
        setCurrentLevel(data.currentLevel);
        setUserXP(data.userXP);
      } else {
        setQuestion(null);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNextQuestion([]);
  }, [subjectParam, topicParam]);

  // Elapsed timer ticker
  useEffect(() => {
    if (submitted) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, submitted]);

  // Submit Answer
  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !question) return;

    setEvaluating(true);
    const timeTaken = Math.max(1, Math.floor((Date.now() - startTime) / 1000));

    try {
      const res = await fetch("/api/practice/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          userAnswer: selectedAnswer,
          timeTakenSeconds: timeTaken,
          currentStreak: streak,
          recentHistory,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Evaluation failed");

      setFeedback(data);
      setSubmitted(true);
      setCurrentLevel(data.newLevel);
      setUserXP(data.newXP);
      setStreak(data.streak);
      setSessionCount((prev) => prev + 1);

      const newAttempted = [...attemptedIds, question.id];
      setAttemptedIds(newAttempted);

      setRecentHistory((prev) => [
        ...prev,
        {
          questionId: question.id,
          isCorrect: data.isCorrect,
          timeTakenSeconds: timeTaken,
          levelAtTime: question.difficulty,
          topic: question.topic,
        },
      ]);

      // Confetti on Promotion or Streak milestone
      if (data.levelShift?.shift === "PROMOTED" || (data.streak % 3 === 0 && data.streak > 0)) {
        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.7 },
          });
        } catch (e) {}
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col justify-between">
        {/* Header Strip */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 px-5 py-3 rounded-2xl mb-6 shadow-sm">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/60 px-2.5 py-0.5 rounded-full">
              {subjectParam.toUpperCase()} ADAPTIVE DRILL
            </span>
            {topicParam && (
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                Target: <strong>{topicParam}</strong>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono">
            {/* Live Calibrated Level Badge */}
            <div className="flex items-center space-x-1.5 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-700/60 px-2.5 py-1 rounded-lg">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span className="text-indigo-700 dark:text-indigo-200 font-bold">Level {currentLevel}</span>
            </div>

            {/* Streak */}
            <div className="flex items-center space-x-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 px-2.5 py-1 rounded-lg">
              <Flame className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>{streak} Streak</span>
            </div>

            {/* Timer */}
            <div className="hidden sm:flex items-center space-x-1 text-slate-500 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{elapsedSeconds}s</span>
            </div>
          </div>
        </div>

        {/* Question Area */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="flex flex-col items-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-xs text-slate-500 dark:text-slate-400">Adaptive Engine is selecting question calibrated to Level {currentLevel}...</p>
            </div>
          </div>
        ) : question ? (
          <div className="space-y-6 flex-1">
            {/* Question Info Bar */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300">
                  {question.chapter}
                </span>
                <span>•</span>
                <span>{question.topic}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  Question Tier: L{question.difficulty}
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-500">
                  {question.type}
                </span>
              </div>
            </div>

            {/* Stem */}
            <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/90 rounded-2xl p-6 shadow-sm">
              <MathRenderer content={question.stem} />
            </div>

            {/* Options or Numerical Input */}
            {question.type === "SCQ" ? (
              <div className="grid grid-cols-1 gap-3">
                {question.options.map((optionText: string, optIndex: number) => {
                  const optKey = String(optIndex + 1);
                  const isSelected = selectedAnswer === optKey;
                  const isCorrectAnswer = submitted && feedback?.correctAnswer === optKey;
                  const isWrongSelected = submitted && !feedback?.isCorrect && isSelected;

                  let borderStyle = "bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60";

                  if (submitted) {
                    if (isCorrectAnswer) {
                      borderStyle = "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-950 dark:text-white ring-1 ring-emerald-500";
                    } else if (isWrongSelected) {
                      borderStyle = "bg-red-50 dark:bg-red-950/60 border-red-500 text-red-950 dark:text-white ring-1 ring-red-500";
                    }
                  } else if (isSelected) {
                    borderStyle = "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 ring-1 ring-indigo-500 text-indigo-950 dark:text-white";
                  }

                  return (
                    <button
                      key={optIndex}
                      disabled={submitted}
                      onClick={() => setSelectedAnswer(optKey)}
                      className={`flex items-start text-left p-4 rounded-xl border transition-all ${borderStyle}`}
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
                  Enter Numerical Value
                </label>
                <input
                  type="text"
                  disabled={submitted}
                  placeholder="e.g. 4 or 0.25"
                  value={selectedAnswer}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  className="w-full sm:w-64 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-lg font-mono text-cyan-600 dark:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            )}

            {/* Instant Level Shift & Solution Card */}
            {submitted && feedback && (
              <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                {/* Level Shift Banner */}
                <div
                  className={`p-4 rounded-2xl border flex items-start space-x-3 ${
                    feedback.isCorrect
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200"
                      : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/60 text-red-900 dark:text-red-200"
                  }`}
                >
                  {feedback.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                  )}

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm">
                        {feedback.isCorrect ? "Correct Answer! (+4 Marks)" : "Incorrect Response (-1 Mark)"}
                      </h4>
                      <span className="text-xs font-mono font-bold">
                        +{feedback.levelShift?.xpAwarded || 0} XP
                      </span>
                    </div>
                    <p className="text-xs mt-1 opacity-90">{feedback.levelShift?.reason}</p>
                  </div>
                </div>

                {/* Worked Solution */}
                <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-300 mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" /> Worked Solution & JEE Methodology
                  </h4>
                  <div className="text-sm">
                    <MathRenderer content={feedback.solution} />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-16 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Quiz Session Finished!</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              You completed questions in this adaptive cycle. Your calibrated tier is updated to <strong>Level {currentLevel}</strong>.
            </p>
            <div className="pt-2">
              <button
                onClick={() => fetchNextQuestion([])}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
              >
                Start New Cycle
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            Exit Drill
          </button>

          {!submitted ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer || evaluating}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 disabled:opacity-40 flex items-center gap-2 transition-all"
            >
              {evaluating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Evaluating IRT Shift...</span>
                </>
              ) : (
                <>
                  <span>Submit Answer</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => fetchNextQuestion(attemptedIds)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all"
            >
              <span>Next Adaptive Question</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

export default function PracticeQuizPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      }
    >
      <PracticeQuizInner />
    </React.Suspense>
  );
}
