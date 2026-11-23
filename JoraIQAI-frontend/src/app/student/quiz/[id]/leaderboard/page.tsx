'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../../../lib/api';
import { LeaderboardEntry } from '../../../../../types';
import { Badge } from '../../../../../components/Badge';
import { formatDate } from '../../../../../lib/utils';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Trophy,
  Medal,
  Award,
  BookOpen,
  CheckCircle2,
  Search,
  Sparkles,
  Clock,
  Target,
  Flame,
  Crown,
  X,
  TrendingUp,
  User,
} from 'lucide-react';

export default function StudentQuizLeaderboardPage() {
  const params = useParams();
  const quizId = params.id as string;

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [currentUserEntry, setCurrentUserEntry] = useState<LeaderboardEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<'all' | 'top' | 'me'>('all');

  useEffect(() => {
    async function loadLeaderboard() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.get<{
          quizTitle: string;
          leaderboard: LeaderboardEntry[];
          currentUserEntry: LeaderboardEntry | null;
        }>(`/quizzes/${quizId}/leaderboard`);

        setQuizTitle(data.quizTitle || 'Quiz');
        setLeaderboard(data.leaderboard || []);
        setCurrentUserEntry(data.currentUserEntry);

        // If the student is in top 3 or got 100%, trigger celebratory confetti
        if (
          data.currentUserEntry &&
          (data.currentUserEntry.rank <= 3 || data.currentUserEntry.accuracy === 100)
        ) {
          confetti({
            particleCount: 70,
            spread: 75,
            origin: { y: 0.6 },
            colors: ['#6366f1', '#eab308', '#10b981', '#f59e0b', '#8b5cf6'],
          });
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load leaderboard');
      } finally {
        setIsLoading(false);
      }
    }

    if (quizId) {
      loadLeaderboard();
    }
  }, [quizId]);

  // Summary Metrics
  const stats = useMemo(() => {
    const total = leaderboard.length;
    if (total === 0) {
      return { total: 0, avgAccuracy: 0, topAccuracy: 0 };
    }
    const sumAccuracy = leaderboard.reduce((acc, curr) => acc + curr.accuracy, 0);
    const avgAccuracy = Math.round(sumAccuracy / total);
    const topAccuracy = Math.max(...leaderboard.map((e) => e.accuracy));

    return { total, avgAccuracy, topAccuracy };
  }, [leaderboard]);

  const filteredLeaderboard = useMemo(() => {
    return leaderboard.filter((entry) => {
      const matchesSearch =
        entry.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.studentEmail.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (filterTier === 'top') return entry.accuracy >= 80;
      if (filterTier === 'me') return entry.isCurrentUser;

      return true;
    });
  }, [leaderboard, searchQuery, filterTier]);

  const getInitials = (name?: string, email?: string) => {
    if (name && name.trim()) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'ST';
  };

  const getRankBadge = (rank: number, isCurrentUser: boolean) => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-white font-black text-xs shadow-sm shadow-amber-500/20">
          <Crown className="w-3.5 h-3.5 fill-white text-white shrink-0" />
          <span>Rank #1</span>
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-slate-400 to-slate-500 text-white font-black text-xs shadow-sm shadow-slate-500/20">
          <Medal className="w-3.5 h-3.5 fill-white text-white shrink-0" />
          <span>Rank #2</span>
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 text-white font-black text-xs shadow-sm shadow-orange-500/20">
          <Award className="w-3.5 h-3.5 fill-white text-white shrink-0" />
          <span>Rank #3</span>
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold border ${
          isCurrentUser
            ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
            : 'bg-slate-100 text-slate-700 border-slate-200'
        }`}
      >
        Rank #{rank}
      </span>
    );
  };

  const getAccuracyBadge = (accuracy: number) => {
    if (accuracy >= 80) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100/90 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          {accuracy}%
        </span>
      );
    }
    if (accuracy >= 50) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100/90 text-amber-800 border border-amber-200">
          <Target className="w-3 h-3 text-amber-600" />
          {accuracy}%
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100/90 text-rose-800 border border-rose-200">
        <TrendingUp className="w-3 h-3 text-rose-600" />
        {accuracy}%
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-24 text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <Trophy className="w-6 h-6 text-indigo-600 absolute inset-0 m-auto" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Loading Peer Rankings...</h3>
        <p className="text-xs text-slate-500 mt-1">Fetching scores and achievements for this quiz.</p>
      </div>
    );
  }

  const first = leaderboard[0];
  const second = leaderboard[1];
  const third = leaderboard[2];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <Link
            href={`/student/quiz/${quizId}/result`}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm transition hover:scale-105"
            title="Back to Quiz Result"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="p-1.5 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white shadow-md shadow-amber-500/20">
                <Trophy className="w-4 h-4" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Peer Leaderboard
              </h1>
              <Badge variant="primary" className="font-bold text-xs py-0.5">
                {quizTitle}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span>Classroom accuracy rankings</span>
              <span className="text-slate-300">•</span>
              <span>Equal scores share rank</span>
            </p>
          </div>
        </div>

        <Link
          href="/student/dashboard"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition"
        >
          <BookOpen className="w-4 h-4 text-slate-500" />
          <span>My Quizzes</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {error}
        </div>
      )}

      {/* Current User Standing Banner */}
      {currentUserEntry && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white shadow-xl shadow-indigo-600/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex flex-col items-center justify-center font-black shadow-inner border border-white/20">
              <span className="text-[10px] uppercase font-bold text-indigo-100 leading-none">Rank</span>
              <span className="text-xl leading-tight">#{currentUserEntry.rank}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black">Your Current Standing</h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/20">
                  YOU
                </span>
              </div>
              <p className="text-xs text-indigo-100 mt-0.5">
                {currentUserEntry.correctAnswers} of {currentUserEntry.totalQuestions} questions correct
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 relative z-10 text-left sm:text-right">
            <div>
              <p className="text-3xl font-black">{currentUserEntry.accuracy}%</p>
              <p className="text-xs text-indigo-200">Overall Accuracy</p>
            </div>
          </div>
        </div>
      )}

      {/* Metric Cards Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Completed Students
          </span>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.total}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">peers finished</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Class Average
          </span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats.avgAccuracy}%</p>
          <p className="text-[11px] text-slate-400 mt-0.5">accuracy</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Top Score
          </span>
          <p className="text-2xl font-black text-amber-500 mt-1">{stats.topAccuracy}%</p>
          <p className="text-[11px] text-slate-400 mt-0.5">highest recorded</p>
        </div>
      </div>

      {leaderboard.length === 0 ? (
        <div className="py-16 px-6 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 space-y-3 shadow-sm">
          <Trophy className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No peer submissions yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Be among the first to complete this quiz to appear on the leaderboard!
          </p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium Showcase */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" />
              <span>Top Achievers</span>
            </h2>

            {leaderboard.length === 2 && first && second && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {/* 1st Place */}
                <div className="p-5 rounded-3xl bg-gradient-to-b from-amber-500/10 via-amber-50/40 to-white border-2 border-amber-300 shadow-lg shadow-amber-500/10 text-center relative flex flex-col justify-between">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-black text-xs shadow-sm mb-3">
                      <Crown className="w-3.5 h-3.5 fill-white" />
                      <span>Rank #1</span>
                    </div>

                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-white font-black text-lg flex items-center justify-center mx-auto shadow-md ring-4 ring-amber-300 mb-2">
                      {getInitials(first.studentName, first.studentEmail)}
                    </div>

                    <h3 className="text-sm font-black text-slate-900 truncate">
                      {first.studentName} {first.isCurrentUser && '(You)'}
                    </h3>
                  </div>

                  <div className="mt-4 pt-3 border-t border-amber-200 flex items-center justify-around text-xs">
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-400">Accuracy</p>
                      <p className="text-xl font-black text-emerald-600">{first.accuracy}%</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-400">Score</p>
                      <p className="text-xs font-bold text-slate-800">
                        {first.correctAnswers}/{first.totalQuestions}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2nd Place */}
                <div className="p-5 rounded-3xl bg-gradient-to-b from-slate-500/10 via-slate-50/40 to-white border border-slate-200 shadow-md text-center relative flex flex-col justify-between">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gradient-to-r from-slate-400 to-slate-500 text-white font-bold text-xs shadow-sm mb-3">
                      <Medal className="w-3.5 h-3.5 fill-white" />
                      <span>Rank #2</span>
                    </div>

                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-slate-400 to-slate-600 text-white font-bold text-lg flex items-center justify-center mx-auto shadow-md ring-4 ring-slate-200 mb-2">
                      {getInitials(second.studentName, second.studentEmail)}
                    </div>

                    <h3 className="text-sm font-black text-slate-900 truncate">
                      {second.studentName} {second.isCurrentUser && '(You)'}
                    </h3>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-around text-xs">
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-400">Accuracy</p>
                      <p className="text-xl font-black text-slate-800">{second.accuracy}%</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-400">Score</p>
                      <p className="text-xs font-bold text-slate-800">
                        {second.correctAnswers}/{second.totalQuestions}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {leaderboard.length >= 3 && first && second && third && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                {/* 2nd */}
                <div className="order-2 md:order-1 p-5 rounded-3xl bg-gradient-to-b from-slate-500/10 via-slate-50/50 to-white border border-slate-200 shadow-md text-center flex flex-col justify-between h-[255px]">
                  <div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-slate-400 to-slate-500 text-white font-bold text-xs shadow-sm mb-3">
                      <Medal className="w-3.5 h-3.5" />
                      <span>2nd Place</span>
                    </div>
                    <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-slate-400 to-slate-600 text-white font-bold text-base flex items-center justify-center mx-auto shadow-md ring-4 ring-slate-200 mb-2">
                      {getInitials(second.studentName, second.studentEmail)}
                    </div>
                    <h3 className="text-sm font-black text-slate-900 truncate">{second.studentName}</h3>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-around text-xs">
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-400">Accuracy</p>
                      <p className="text-base font-black text-slate-800">{second.accuracy}%</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-400">Score</p>
                      <p className="text-xs font-bold text-slate-700">{second.correctAnswers}/{second.totalQuestions}</p>
                    </div>
                  </div>
                </div>

                {/* 1st */}
                <div className="order-1 md:order-2 p-6 rounded-3xl bg-gradient-to-b from-amber-500/15 via-amber-50/50 to-white border-2 border-amber-400 shadow-xl shadow-amber-500/15 text-center flex flex-col justify-between h-[285px]">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-white font-black text-xs shadow-md shadow-amber-500/30 mb-3">
                      <Crown className="w-3.5 h-3.5 fill-white" />
                      <span>1st Place • Champion</span>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-white font-black text-xl flex items-center justify-center mx-auto shadow-lg ring-4 ring-amber-300 mb-2">
                      {getInitials(first.studentName, first.studentEmail)}
                    </div>
                    <h3 className="text-base font-black text-slate-900 truncate">{first.studentName}</h3>
                  </div>
                  <div className="pt-3 border-t border-amber-200 flex items-center justify-around text-xs">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Accuracy</p>
                      <p className="text-2xl font-black text-emerald-600">{first.accuracy}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Score</p>
                      <p className="text-sm font-bold text-slate-800">{first.correctAnswers} / {first.totalQuestions}</p>
                    </div>
                  </div>
                </div>

                {/* 3rd */}
                <div className="order-3 p-5 rounded-3xl bg-gradient-to-b from-amber-600/10 via-orange-50/40 to-white border border-amber-200 shadow-md text-center flex flex-col justify-between h-[245px]">
                  <div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-xs shadow-sm mb-3">
                      <Award className="w-3.5 h-3.5" />
                      <span>3rd Place</span>
                    </div>
                    <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-amber-600 to-orange-600 text-white font-bold text-base flex items-center justify-center mx-auto shadow-md ring-4 ring-orange-200 mb-2">
                      {getInitials(third.studentName, third.studentEmail)}
                    </div>
                    <h3 className="text-sm font-black text-slate-900 truncate">{third.studentName}</h3>
                  </div>
                  <div className="pt-3 border-t border-orange-100 flex items-center justify-around text-xs">
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-400">Accuracy</p>
                      <p className="text-base font-black text-slate-800">{third.accuracy}%</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-400">Score</p>
                      <p className="text-xs font-bold text-slate-700">{third.correctAnswers}/{third.totalQuestions}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Standings Table Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600">
                    <Flame className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-900">
                    All Peer Rankings ({leaderboard.length})
                  </h2>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFilterTier('all')}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                      filterTier === 'all'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    All ({leaderboard.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTier('top')}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                      filterTier === 'top'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    Top (≥80%)
                  </button>
                  {currentUserEntry && (
                    <button
                      type="button"
                      onClick={() => setFilterTier('me')}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                        filterTier === 'me'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      Only Me
                    </button>
                  )}
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search students..."
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-100">
              {filteredLeaderboard.map((entry) => (
                <div
                  key={entry.studentId}
                  className={`p-4 sm:px-6 sm:py-4 flex items-center justify-between transition ${
                    entry.isCurrentUser
                      ? 'bg-indigo-50/90 border-l-4 border-l-indigo-600 font-semibold'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-24 shrink-0">{getRankBadge(entry.rank, entry.isCurrentUser)}</div>

                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                      {getInitials(entry.studentName, entry.studentEmail)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {entry.studentName}
                        </p>
                        {entry.isCurrentUser && (
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-indigo-200 text-indigo-900">
                            YOU
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{entry.studentEmail}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6 text-right shrink-0">
                    <div>
                      {getAccuracyBadge(entry.accuracy)}
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                        {entry.correctAnswers} / {entry.totalQuestions}
                      </p>
                    </div>

                    <div className="hidden sm:block text-[11px] text-slate-400">
                      <p>{formatDate(entry.submittedAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
