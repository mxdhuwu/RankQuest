import Link from "next/link";
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  Zap,
  Award,
  BookOpen,
  CheckCircle2,
  Atom,
  FlaskConical,
  Pi,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white transition-colors">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/60 backdrop-blur-md sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Rank<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400">Quest</span>
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <Link
              href="/auth/login"
              className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/25 flex items-center gap-1.5 transition-all"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 py-20 relative overflow-hidden">
        {/* Background Glowing Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/10 dark:bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-cyan-600 dark:text-cyan-400 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
            <span>Real JEE Question Digest • Item Response Theory</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Master JEE with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-cyan-500 to-emerald-500 dark:from-indigo-400 dark:via-cyan-400 dark:to-emerald-400">
              Adaptive Intelligence
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Move beyond static practice. RankQuest dynamically adjusts question difficulty from Level L1 to L7 in real-time, simulating authentic NTA examinations with mathematical precision.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/auth/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <span>Begin Diagnostic Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/auth/login"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm border border-slate-200 dark:border-slate-800 shadow-sm transition-all"
            >
              Returning Student Login
            </Link>
          </div>

          {/* Highlights Row */}
          <div className="pt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center mb-3 text-blue-600 dark:text-blue-400">
                <Atom className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">1,590+ Calibrated Questions</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Ingested directly from Hugging Face JEE Question Bank across Physics, Chemistry, and Math.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center mb-3 text-emerald-600 dark:text-emerald-400">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">7 Competency Tiers (L1–L7)</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Calibrated rolling difficulty adjustment based on accuracy, response speed, and guess penalties.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center mb-3 text-purple-600 dark:text-purple-400">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Official NTA 3-Hour Mock</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Full 300-mark test interface with authentic 5-state palette, Section A (+4/-1) & Section B (+4/0).
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-900 bg-white/80 dark:bg-slate-950/90 py-6 text-center text-xs text-slate-500 transition-colors">
        <p>© 2026 RankQuest. Built for JEE Main & Advanced Aspirants. KaTeX mathematical typesetting.</p>
      </footer>
    </div>
  );
}
