"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  Flame,
  Zap,
  Award,
  LogOut,
  User,
  Atom,
  FlaskConical,
  Pi,
} from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";

interface UserMeta {
  id: string;
  name: string;
  email: string;
  streakDays: number;
  totalXP: number;
  isOnboarded: boolean;
  subjectLevels: {
    subject: string;
    currentLevel: number;
    experiencePoints: number;
  }[];
}

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserMeta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
    router.refresh();
  };

  const isAuthPage = pathname?.startsWith("/auth");

  if (isAuthPage) return null;

  const physicsLevel = user?.subjectLevels?.find((s) => s.subject === "PHYSICS")?.currentLevel || 1;
  const chemistryLevel = user?.subjectLevels?.find((s) => s.subject === "CHEMISTRY")?.currentLevel || 1;
  const mathLevel = user?.subjectLevels?.find((s) => s.subject === "MATHEMATICS")?.currentLevel || 1;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/85 dark:bg-slate-950/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-6">
          <Link href="/dashboard" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                Rank<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400">Quest</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
                  JEE
                </span>
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
            <Link
              href="/dashboard"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                pathname === "/dashboard"
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/practice/quiz"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                pathname?.startsWith("/practice")
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
              }`}
            >
              Adaptive Practice
            </Link>
            <Link
              href="/mock-test/jee-full"
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                pathname?.startsWith("/mock-test")
                  ? "bg-indigo-50 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-700/50 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
              }`}
            >
              <Award className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              NTA Full Mock
            </Link>
          </nav>
        </div>

        {/* User Badges, Theme Toggle & Actions */}
        <div className="flex items-center space-x-2.5 sm:space-x-4">
          {/* Theme Toggle Button */}
          <ThemeToggle />

          {user && (
            <>
              {/* Subject Tiers Display */}
              <div className="hidden lg:flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-full text-xs font-mono">
                <Link
                  href="/subject/physics"
                  className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:opacity-80 transition-opacity"
                  title="Physics Level"
                >
                  <Atom className="w-3.5 h-3.5" />
                  <span className="font-bold">L{physicsLevel}</span>
                </Link>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <Link
                  href="/subject/chemistry"
                  className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:opacity-80 transition-opacity"
                  title="Chemistry Level"
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span className="font-bold">L{chemistryLevel}</span>
                </Link>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <Link
                  href="/subject/mathematics"
                  className="flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:opacity-80 transition-opacity"
                  title="Mathematics Level"
                >
                  <Pi className="w-3.5 h-3.5" />
                  <span className="font-bold">L{mathLevel}</span>
                </Link>
              </div>

              {/* XP & Streak */}
              <div className="hidden sm:flex items-center space-x-2 text-xs font-semibold">
                <div className="flex items-center space-x-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 px-2.5 py-1 rounded-full">
                  <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  <span>{user.streakDays}d</span>
                </div>
                <div className="flex items-center space-x-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40 px-2.5 py-1 rounded-full">
                  <Zap className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{user.totalXP} XP</span>
                </div>
              </div>

              {/* Profile Link & Logout */}
              <div className="flex items-center space-x-1 pl-2 border-l border-slate-200 dark:border-slate-800">
                <Link
                  href="/profile"
                  className={`p-1.5 rounded-lg transition-colors ${
                    pathname === "/profile"
                      ? "bg-slate-200 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-semibold"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
                  }`}
                  title="Profile & Settings"
                >
                  <User className="w-4 h-4" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {!user && !loading && (
            <div className="flex items-center space-x-2">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-lg shadow-sm shadow-indigo-500/20"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
