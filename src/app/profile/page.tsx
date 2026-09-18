"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Calendar,
  Award,
  Sparkles,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertCircle,
  Atom,
  FlaskConical,
  Pi,
  Shield,
  Trophy,
  Compass,
  Moon,
  Sun,
  Laptop,
  Loader2,
} from "lucide-react";
import { useTheme } from "next-themes";
import Navbar from "@/components/layout/Navbar";

export default function ProfilePage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [targetYear, setTargetYear] = useState("2026");
  const [avatar, setAvatar] = useState("compass");
  const [subjectLevels, setSubjectLevels] = useState<any[]>([]);
  const [testCount, setTestCount] = useState(0);

  useEffect(() => {
    fetch("/api/profile")
      .then(async (res) => {
        if (res.status === 401) {
          router.push("/auth/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.success) {
          setName(data.profile.name || "");
          setEmail(data.profile.email || "");
          setTargetYear(data.profile.targetYear || "2026");
          setAvatar(data.profile.avatar || "compass");
          setSubjectLevels(data.profile.subjectLevels || []);
          setTestCount(data.profile.testCount || 0);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [router]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, targetYear, avatar }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");
      showToast("Profile settings updated successfully!");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetDiagnostic = async () => {
    setResetting(true);
    try {
      const res = await fetch("/api/profile/reset-diagnostic", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset diagnostic");
      setShowResetModal(false);
      router.push("/diagnostic");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setResetting(false);
    }
  };

  const avatarIcons: Record<string, any> = {
    compass: <Compass className="w-5 h-5 text-indigo-500" />,
    atom: <Atom className="w-5 h-5 text-blue-500" />,
    flask: <FlaskConical className="w-5 h-5 text-emerald-500" />,
    pi: <Pi className="w-5 h-5 text-amber-500" />,
    shield: <Shield className="w-5 h-5 text-cyan-500" />,
    trophy: <Trophy className="w-5 h-5 text-purple-500" />,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      </div>
    );
  }

  const pLevel = subjectLevels.find((s) => s.subject === "PHYSICS")?.currentLevel || 1;
  const cLevel = subjectLevels.find((s) => s.subject === "CHEMISTRY")?.currentLevel || 1;
  const mLevel = subjectLevels.find((s) => s.subject === "MATHEMATICS")?.currentLevel || 1;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar />

      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2 animate-in fade-in slide-in-from-top-4 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Student Profile & Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your account credentials, target JEE exam year, theme preferences, and baseline level calibration.
          </p>
        </div>

        {/* Current Baseline Competency Levels Card */}
        <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-500" />
              Assigned Baseline Competency Tiers
            </h2>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              {testCount} Tests Completed
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Physics */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center">
                  <Atom className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white">Physics</h3>
                  <span className="text-[10px] text-slate-500">Tier Status</span>
                </div>
              </div>
              <span className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400">
                L{pLevel}
              </span>
            </div>

            {/* Chemistry */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center">
                  <FlaskConical className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white">Chemistry</h3>
                  <span className="text-[10px] text-slate-500">Tier Status</span>
                </div>
              </div>
              <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                L{cLevel}
              </span>
            </div>

            {/* Mathematics */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center">
                  <Pi className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white">Mathematics</h3>
                  <span className="text-[10px] text-slate-500">Tier Status</span>
                </div>
              </div>
              <span className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
                L{mLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Settings Form */}
        <form onSubmit={handleSave} className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <User className="w-4 h-4 text-indigo-500" />
            Personal Details & Preferences
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Student Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Email Address (Read-only) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Registered Email (Read-Only)
              </label>
              <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/60 rounded-xl px-4 py-2.5 text-sm text-slate-500 dark:text-slate-400 font-mono">
                <Mail className="w-4 h-4 shrink-0 text-slate-400" />
                <span>{email}</span>
              </div>
            </div>

            {/* Target JEE Year */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Target Exam Year
              </label>
              <select
                value={targetYear}
                onChange={(e) => setTargetYear(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="2025">JEE Main / Advanced 2025</option>
                <option value="2026">JEE Main / Advanced 2026</option>
                <option value="2027">JEE Main / Advanced 2027</option>
                <option value="2028">JEE Main / Advanced 2028</option>
              </select>
            </div>

            {/* Theme Preference */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Appearance Theme
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    theme === "light"
                      ? "bg-indigo-50 border-indigo-500 text-indigo-700 dark:text-white"
                      : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    theme === "dark"
                      ? "bg-indigo-950/60 border-indigo-500 text-white"
                      : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>Dark</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("system")}
                  className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    theme === "system"
                      ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-white"
                      : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <Laptop className="w-4 h-4" />
                  <span>System</span>
                </button>
              </div>
            </div>
          </div>

          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              Select Avatar Emblem
            </label>
            <div className="flex items-center space-x-3">
              {Object.entries(avatarIcons).map(([key, icon]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAvatar(key)}
                  className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition-all ${
                    avatar === key
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 ring-2 ring-indigo-500/50 scale-105"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Diagnostic Recalibration Card */}
        <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-500" />
                Recalibrate Starting Baseline Levels
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Want to reassess your skills from scratch? Resetting will launch the 3-Subject Diagnostic Suite and re-assign your starting tiers based on your latest performance.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold transition-all shrink-0"
            >
              Retake Diagnostic Test
            </button>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 max-w-md w-full rounded-3xl p-6 text-center space-y-5 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-700/60 mx-auto flex items-center justify-center text-amber-600 dark:text-amber-400">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recalibrate Diagnostic Baseline?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                This will reset your starting tier ratings for Physics, Chemistry, and Mathematics back to uncalibrated and immediately launch the 3-Subject Diagnostic Suite.
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetDiagnostic}
                disabled={resetting}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/25 transition-all"
              >
                {resetting ? "Resetting..." : "Confirm & Retake"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
