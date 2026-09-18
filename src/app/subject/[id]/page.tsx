"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Compass,
  Atom,
  FlaskConical,
  Pi,
  ArrowRight,
  BookOpen,
  Sparkles,
  Zap,
  Target,
  Award,
  ChevronRight,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";

export default function SubjectPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = (params.id as string)?.toLowerCase() || "physics";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    fetch(`/api/subject/${subjectId}`)
      .then(async (res) => {
        if (res.status === 401) {
          router.push("/auth/login");
          return null;
        }
        return res.json();
      })
      .then((resData) => {
        if (resData?.success) {
          setData(resData);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [subjectId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading syllabus analytics for {subjectId}...</p>
          </div>
        </div>
      </div>
    );
  }

  const { subject, currentLevel = 1, experiencePoints = 0, accuracyRate = 0, chapters = [], totalQuestionsAvailable = 0 } = data || {};

  const subjectMeta: Record<string, { title: string; color: string; icon: any; glow: string }> = {
    PHYSICS: {
      title: "Physics",
      color: "text-blue-500 dark:text-blue-400 border-blue-200 dark:border-blue-800/60 bg-blue-50 dark:bg-blue-950/30",
      icon: <Atom className="w-6 h-6 text-blue-500 dark:text-blue-400" />,
      glow: "from-blue-500/10 dark:from-blue-600/20",
    },
    CHEMISTRY: {
      title: "Chemistry",
      color: "text-emerald-500 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/30",
      icon: <FlaskConical className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />,
      glow: "from-emerald-500/10 dark:from-emerald-600/20",
    },
    MATHEMATICS: {
      title: "Mathematics",
      color: "text-amber-500 dark:text-amber-400 border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30",
      icon: <Pi className="w-6 h-6 text-amber-500 dark:text-amber-400" />,
      glow: "from-amber-500/10 dark:from-amber-600/20",
    },
  };

  const currentMeta = subjectMeta[subject] || subjectMeta.PHYSICS;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Subject Header Banner */}
        <div className={`p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r ${currentMeta.glow} via-white dark:via-slate-900/80 to-slate-100 dark:to-slate-950 backdrop-blur-xl relative overflow-hidden shadow-sm dark:shadow-none`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-md">
                {currentMeta.icon}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    JEE Main & Advanced
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-600">•</span>
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-semibold">
                    {totalQuestionsAvailable} Calibrated Problems
                  </span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{currentMeta.title}</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Master chapters progressively from Formula Recall (L1) to Multi-Concept Advanced (L7).
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center space-x-4">
              <div className="px-5 py-3 rounded-2xl bg-white/90 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono block">Current Tier</span>
                <span className="text-2xl font-black font-mono text-cyan-600 dark:text-cyan-400">L{currentLevel}</span>
              </div>
              <div className="px-5 py-3 rounded-2xl bg-white/90 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono block">Experience</span>
                <span className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">{experiencePoints} XP</span>
              </div>
              <div className="px-5 py-3 rounded-2xl bg-white/90 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono block">Accuracy</span>
                <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">{accuracyRate}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chapters Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Chapter Mastery & Syllabus Breakdown
            </h2>
            <Link
              href={`/practice/quiz?subject=${subjectId}`}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
            >
              <span>Practice All {currentMeta.title}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {chapters.map((chap: any, idx: number) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm dark:shadow-none flex flex-col justify-between space-y-4 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{chap.name}</h3>
                    <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">
                      {chap.masteryScore}% Mastery
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-950 overflow-hidden border border-slate-200 dark:border-slate-800 mb-3">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                      style={{ width: `${chap.masteryScore}%` }}
                    />
                  </div>

                  {/* Sample Topics Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {chap.topics.map((t: string, tIdx: number) => (
                      <span
                        key={tIdx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs">
                  <span className="text-slate-400 dark:text-slate-500 font-mono">
                    {chap.totalQuestions} questions
                  </span>
                  <Link
                    href={`/practice/quiz?subject=${subjectId}&topic=${encodeURIComponent(chap.topics[0] || "")}`}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    <span>Targeted Drill</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
