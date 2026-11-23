'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  GraduationCap,
  Users,
  BarChart3,
  Trophy,
  CheckCircle2,
  BookOpen,
  Award,
  Layers,
  Clock,
  ShieldCheck,
  ChevronRight,
  Target,
} from 'lucide-react';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'TEACHER') {
        router.replace('/teacher/dashboard');
      } else {
        router.replace('/student/dashboard');
      }
    }
  }, [user, isLoading, router]);

  if (!isLoading && user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-slate-50/50 min-h-screen flex flex-col justify-between">
      {/* Ambient Gradient Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-indigo-500/10 via-violet-500/15 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-20 space-y-16">
        {/* Top Product Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50/90 border border-indigo-200/80 text-indigo-700 text-xs font-bold shadow-sm backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
            <span>Modern Interactive Learning & Assessment Ecosystem</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-tight">
            Interactive Quizzes &{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 bg-clip-text text-transparent">
              Precision Learning Analytics
            </span>
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
            Empower students and educators with dynamic assessments, instant automated grading, deep classroom analytics, and motivating leaderboards designed to elevate student mastery.
          </p>

          {/* Primary Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2 group"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold border border-slate-200/90 shadow-sm transition flex items-center justify-center gap-2"
            >
              <span>Sign In to Account</span>
            </Link>
            <a
              href="#portals"
              className="w-full sm:w-auto px-5 py-3 rounded-xl text-indigo-600 hover:bg-indigo-50/80 text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5"
            >
              <span>Explore Roles</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Portals Showcase Section */}
        <section id="portals" className="scroll-mt-20">
          <div className="max-w-4xl mx-auto p-6 sm:p-8 bg-white border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-200/60 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <span>Choose Your Experience</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sign in or register directly to access your real classroom workspace.
                </p>
              </div>
              <span className="self-start sm:self-auto text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-3 py-1 rounded-full">
                Real-Time Database
              </span>
            </div>

            {/* Persona Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Instructor Card */}
              <div className="p-5 rounded-2xl border border-indigo-200/80 bg-gradient-to-b from-indigo-50/50 to-white flex flex-col justify-between shadow-sm space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Instructor Portal</h3>
                      <p className="text-[11px] text-indigo-700 font-semibold">For Teachers & Educators</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Build dynamic quizzes, assign them directly to registered students, and inspect question difficulty analytics in real-time.
                  </p>
                  <ul className="space-y-1 text-xs text-slate-500 pt-1">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Custom quiz builder with auto-grading</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Cohort assignment to registered students</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Deep classroom accuracy analytics</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-3 border-t border-indigo-100 flex items-center gap-2">
                  <Link
                    href="/login"
                    className="flex-1 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold text-center shadow-sm transition"
                  >
                    Sign In as Teacher
                  </Link>
                  <Link
                    href="/register"
                    className="px-3.5 py-2 rounded-xl border border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-700 text-xs font-bold transition text-center"
                  >
                    Register
                  </Link>
                </div>
              </div>

              {/* Student Card */}
              <div className="p-5 rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/50 to-white flex flex-col justify-between shadow-sm space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Student Portal</h3>
                      <p className="text-[11px] text-emerald-700 font-semibold">For Learners & Students</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Take assigned quizzes with strict single-submission enforcement, receive instant grading feedback, and climb peer leaderboards.
                  </p>
                  <ul className="space-y-1 text-xs text-slate-500 pt-1">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Clean, distraction-free test interface</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Instant scores and answer explanations</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Fair competition-ranked leaderboards</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-3 border-t border-emerald-100 flex items-center gap-2">
                  <Link
                    href="/login"
                    className="flex-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold text-center shadow-sm transition"
                  >
                    Sign In as Student
                  </Link>
                  <Link
                    href="/register"
                    className="px-3.5 py-2 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-700 text-xs font-bold transition text-center"
                  >
                    Register
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Help Notice */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
              <span className="text-slate-500 text-[11px]">
                🔒 Ready to start learning or teaching on JoraIQ.AI?
              </span>
              <div className="flex items-center gap-3">
                <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-800">
                  Sign In &rarr;
                </Link>
                <Link href="/register" className="font-bold text-slate-700 hover:text-slate-900">
                  Create New Account
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section id="features" className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Designed for Inspiring Classrooms
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Everything educators and students need for engaging evaluations and verified learning outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Interactive & Adaptive Learning */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Interactive & Adaptive Learning
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Engage students with dynamic multi-choice quizzes, instant automated scoring, and comprehensive answer reviews that transform assessments into positive learning moments.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-1.5 text-[10px] font-semibold text-indigo-700">
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100">Instant Grading</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100">Clear Explanations</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100">Single Attempt Safety</span>
              </div>
            </div>

            {/* Column 2: Actionable Educator Insights */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Actionable Educator Insights
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Equip teachers with real-time visibility into class progress, student accuracy trends, and per-question difficulty diagnostics to target support where it is needed most.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-1.5 text-[10px] font-semibold text-emerald-700">
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100">Cohort Accuracy</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100">Completion Rates</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100">Question Diagnostics</span>
              </div>
            </div>

            {/* Column 3: Fair & Motivating Leaderboards */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Fair & Motivating Leaderboards
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Inspire healthy motivation with live competition rankings that handle ties fairly, highlight student milestones, and foster a supportive classroom community.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-1.5 text-[10px] font-semibold text-amber-700">
                <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-100">Fair Tie-Handling</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-100">Personal Highlights</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-100">Peer Milestones</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Modern Footer */}
      <footer className="border-t border-slate-200/80 bg-white/60 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-800">JoraIQ.AI</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-indigo-600 transition">
              Sign In
            </Link>
            <Link href="/register" className="hover:text-indigo-600 transition">
              Register
            </Link>
            <a href="#features" className="hover:text-indigo-600 transition">
              Features
            </a>
            <a href="#portals" className="hover:text-indigo-600 transition">
              Portals
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
