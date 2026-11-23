'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  BookOpen,
  PlusCircle,
  LogOut,
  Layers,
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isTeacher = user?.role === 'TEACHER';
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link
            href={user ? (isTeacher ? '/teacher/dashboard' : '/student/dashboard') : '/'}
            className="flex items-center gap-2.5 group"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                Jora<span className="text-indigo-600">IQ</span>
                <span className="text-xs font-semibold px-1.5 py-0.5 ml-1 rounded bg-indigo-100 text-indigo-700">
                  AI
                </span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                Learning & Analytics
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links for Logged-In Users */}
          {user && (
            <nav className="hidden md:flex items-center gap-1">
              {isTeacher ? (
                <>
                  <Link
                    href="/teacher/dashboard"
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                      pathname === '/teacher/dashboard'
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/teacher/quizzes/create"
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                      pathname === '/teacher/quizzes/create'
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    Create Quiz
                  </Link>
                </>
              ) : (
                <Link
                  href="/student/dashboard"
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                    pathname === '/student/dashboard'
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  My Quizzes
                </Link>
              )}
            </nav>
          )}

          {/* Desktop Nav Links for Guests on Landing Page */}
          {!user && !isAuthPage && (
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <a href="#features" className="hover:text-indigo-600 transition">
                Features
              </a>
              <a href="#demo-preview" className="hover:text-indigo-600 transition">
                Interactive Demo
              </a>
              <a href="#benefits" className="hover:text-indigo-600 transition">
                Why JoraIQ
              </a>
            </nav>
          )}
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* User Identity */}
              <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                    {isTeacher ? 'Instructor' : 'Student'}
                  </p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                title="Log Out"
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition border border-transparent hover:border-rose-100"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : isAuthPage ? (
            <Link
              href="/"
              className="text-xs font-semibold text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
            >
              Back to Home
            </Link>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Link
                href="/login"
                className="text-xs font-bold text-slate-700 hover:text-indigo-600 px-3.5 py-2 rounded-xl transition"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl shadow-md shadow-indigo-500/20 transition flex items-center gap-1.5"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl animate-slide-up">
          {user ? (
            <div className="space-y-2">
              <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{user.name}</p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {isTeacher ? 'Instructor' : 'Student'} • {user.email}
                  </p>
                </div>
              </div>

              {isTeacher ? (
                <>
                  <Link
                    href="/teacher/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                  >
                    <Layers className="w-4 h-4" />
                    Teacher Dashboard
                  </Link>
                  <Link
                    href="/teacher/quizzes/create"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Create New Quiz
                  </Link>
                </>
              ) : (
                <Link
                  href="/student/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition"
                >
                  <BookOpen className="w-4 h-4" />
                  My Quizzes
                </Link>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition text-left mt-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {!isAuthPage && (
                <div className="flex flex-col gap-2 pb-3 border-b border-slate-100 text-xs font-semibold text-slate-600">
                  <a
                    href="#features"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 hover:bg-slate-50 rounded-lg"
                  >
                    Features
                  </a>
                  <a
                    href="#demo-preview"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 hover:bg-slate-50 rounded-lg"
                  >
                    Interactive Demo
                  </a>
                  <a
                    href="#benefits"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 hover:bg-slate-50 rounded-lg"
                  >
                    Why JoraIQ
                  </a>
                </div>
              )}
              <div className="pt-2 grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-xs font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
                >
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
