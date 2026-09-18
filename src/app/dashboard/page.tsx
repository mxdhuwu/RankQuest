"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Compass,
  Zap,
  Flame,
  Target,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Award,
  Atom,
  FlaskConical,
  Pi,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  Loader2,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then(async (res) => {
        if (res.status === 401) {
          router.push("/auth/login");
          return null;
        }
        return res.json();
      })
      .then((resData) => {
        if (resData?.success) {
          if (!resData.user?.isOnboarded) {
            router.push("/diagnostic");
            return;
          }
          setData(resData);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading student analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  const { user, subjectLevels = {}, radarData = [], weakTopics = [], speedAccuracyData = [], recentSessions = [] } = data || {};

  const physics = subjectLevels.PHYSICS || { currentLevel: 1, experiencePoints: 0, accuracyRate: 0, progressPercent: 0 };
  const chemistry = subjectLevels.CHEMISTRY || { currentLevel: 1, experiencePoints: 0, accuracyRate: 0, progressPercent: 0 };
  const math = subjectLevels.MATHEMATICS || { currentLevel: 1, experiencePoints: 0, accuracyRate: 0, progressPercent: 0 };

  const getTierTitle = (level: number) => {
    switch (level) {
      case 1:
        return "Formula Recall & Core Concepts";
      case 2:
        return "Single-Concept Application";
      case 3:
        return "JEE Main Standard Moderate";
      case 4:
        return "Multi-Step Problem Solver";
      case 5:
        return "JEE Advanced Intro / Dual-Concept";
      case 6:
        return "Advanced Analytical Mastery";
      case 7:
        return "Olympiad & Apex Advanced";
      default:
        return "Competency Tier " + level;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm backdrop-blur-xl">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/40 px-2.5 py-0.5 rounded-full">
                Active Aspirant
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">• JEE Main & Advanced</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Welcome back, {user?.name || "Student"}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Your adaptive difficulty is calibrated continuously. Select a practice mode or drill weak topics below.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/practice/quiz"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 flex items-center space-x-2 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Adaptive Quiz</span>
            </Link>
            <Link
              href="/mock-test/jee-full"
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700/80 flex items-center space-x-2 transition-all"
            >
              <Award className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Full NTA Mock</span>
            </Link>
          </div>
        </div>

        {/* Competency Tiers Row (L1–L7 Badges & Progress) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Physics Card */}
          <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 hover:border-blue-500/50 shadow-sm transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center">
                  <Atom className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Physics</h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">{getTierTitle(physics.currentLevel)}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400">L{physics.currentLevel}</span>
                <span className="text-[10px] block text-slate-400 font-mono">Tier / 7</span>
              </div>
            </div>

            {/* Progress Bar to next level */}
            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <span>Progress to L{Math.min(7, physics.currentLevel + 1)}</span>
                <span className="text-slate-800 dark:text-slate-300 font-bold">{physics.progressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-950 overflow-hidden border border-slate-200 dark:border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${physics.progressPercent}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-500 dark:text-slate-400 font-medium">XP: <span className="text-slate-900 dark:text-white font-bold">{physics.experiencePoints}</span></span>
              <Link
                href="/subject/physics"
                className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
              >
                Drill Physics <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Chemistry Card */}
          <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 hover:border-emerald-500/50 shadow-sm transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center">
                  <FlaskConical className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Chemistry</h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">{getTierTitle(chemistry.currentLevel)}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">L{chemistry.currentLevel}</span>
                <span className="text-[10px] block text-slate-400 font-mono">Tier / 7</span>
              </div>
            </div>

            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <span>Progress to L{Math.min(7, chemistry.currentLevel + 1)}</span>
                <span className="text-slate-800 dark:text-slate-300 font-bold">{chemistry.progressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-950 overflow-hidden border border-slate-200 dark:border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${chemistry.progressPercent}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-500 dark:text-slate-400 font-medium">XP: <span className="text-slate-900 dark:text-white font-bold">{chemistry.experiencePoints}</span></span>
              <Link
                href="/subject/chemistry"
                className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
              >
                Drill Chemistry <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Mathematics Card */}
          <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 hover:border-amber-500/50 shadow-sm transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center">
                  <Pi className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Mathematics</h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">{getTierTitle(math.currentLevel)}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">L{math.currentLevel}</span>
                <span className="text-[10px] block text-slate-400 font-mono">Tier / 7</span>
              </div>
            </div>

            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <span>Progress to L{Math.min(7, math.currentLevel + 1)}</span>
                <span className="text-slate-800 dark:text-slate-300 font-bold">{math.progressPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-950 overflow-hidden border border-slate-200 dark:border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 to-orange-400 rounded-full transition-all duration-500"
                  style={{ width: `${math.progressPercent}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-500 dark:text-slate-400 font-medium">XP: <span className="text-slate-900 dark:text-white font-bold">{math.experiencePoints}</span></span>
              <Link
                href="/subject/mathematics"
                className="text-amber-600 dark:text-amber-400 hover:underline font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
              >
                Drill Mathematics <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Analytics Grid: Subject Mastery Radar + Weak Topic Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Radar Chart (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  Subject Mastery Radar
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Real-time IRT mastery mapping across 9 core JEE domains.
                </p>
              </div>
              <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Mastery %</span>
              </div>
            </div>

            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#cbd5e1" className="dark:stroke-slate-700" strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="domain" stroke="#64748b" tick={{ fill: "currentColor", fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" tick={{ fill: "currentColor", fontSize: 10 }} />
                  <Radar
                    name="Student Mastery"
                    dataKey="mastery"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.35}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", color: "#f8fafc" }}
                    itemStyle={{ color: "#a5b4fc", fontSize: "12px" }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weak Topics Alert Card (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Weak Topic Reinforcement
                </h3>
                <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 px-2 py-0.5 rounded-full">
                  Needs Drill
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Algorithm-detected mastery dips. Reinforce these to prevent rank drop on JEE Main.
              </p>

              {/* Weak Topics List */}
              <div className="space-y-3">
                {weakTopics.map((topic: any) => (
                  <div
                    key={topic.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{topic.topicName}</span>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {topic.subject.slice(0, 4)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <span>Mastery: <strong className="text-amber-600 dark:text-amber-400">{topic.masteryScore}%</strong></span>
                        <span>•</span>
                        <span>{topic.attemptsCount} attempts</span>
                      </div>
                    </div>

                    <Link
                      href={`/practice/quiz?subject=${topic.subject.toLowerCase()}&topic=${encodeURIComponent(topic.topicName)}`}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 transition-all"
                    >
                      <span>Drill</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-center">
              <Link
                href="/practice/quiz"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-center gap-1"
              >
                <span>Launch Free Adaptive Drill</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Speed vs Accuracy Chart */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Response Speed vs. Difficulty Analysis
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Evaluates time-spent efficiency against question tier. Fast inaccurate responses (&lt; 15s) trigger guess penalties.
              </p>
            </div>
          </div>

          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                <CartesianGrid stroke="#e2e8f0" className="dark:stroke-slate-800" strokeDasharray="3 3" />
                <XAxis dataKey="index" name="Question #" stroke="#64748b" tick={{ fill: "currentColor", fontSize: 11 }} />
                <YAxis dataKey="timeSeconds" name="Seconds" unit="s" stroke="#64748b" tick={{ fill: "currentColor", fontSize: 11 }} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "12px", fontSize: "12px", color: "#f8fafc" }}
                />
                <Scatter name="Response Time" data={speedAccuracyData} fill="#10b981" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
