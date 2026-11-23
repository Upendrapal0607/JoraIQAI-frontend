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
  Users,
  CheckCircle2,
  BarChart3,
  Search,
  Download,
  RefreshCw,
  Sparkles,
  Clock,
  Target,
  Flame,
  Crown,
  UserCheck,
  X,
  TrendingUp,
} from 'lucide-react';

export default function TeacherQuizLeaderboardPage() {
  const params = useParams();
  const quizId = params.id as string;

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<'all' | 'perfect' | 'high' | 'mid' | 'low'>('all');

  const loadLeaderboard = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await api.get<{
        quizTitle: string;
        leaderboard: LeaderboardEntry[];
      }>(`/quizzes/${quizId}/leaderboard`);
      setQuizTitle(data.quizTitle || 'Quiz');
      setLeaderboard(data.leaderboard || []);

      // If there are top performers with 100% accuracy, trigger a celebratory confetti burst
      if (data.leaderboard && data.leaderboard.some((e) => e.accuracy === 100)) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#eab308', '#10b981', '#f59e0b', '#8b5cf6'],
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load leaderboard');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (quizId) {
      loadLeaderboard();
    }
  }, [quizId]);

  // Summary Metrics
  const stats = useMemo(() => {
    const total = leaderboard.length;
    if (total === 0) {
      return { total: 0, avgAccuracy: 0, topAccuracy: 0, perfectScores: 0, totalQuestions: 0 };
    }
    const sumAccuracy = leaderboard.reduce((acc, curr) => acc + curr.accuracy, 0);
    const avgAccuracy = Math.round(sumAccuracy / total);
    const topAccuracy = Math.max(...leaderboard.map((e) => e.accuracy));
    const perfectScores = leaderboard.filter((e) => e.accuracy === 100).length;
    const totalQuestions = leaderboard[0]?.totalQuestions || 0;

    return { total, avgAccuracy, topAccuracy, perfectScores, totalQuestions };
  }, [leaderboard]);

  // Filtering
  const filteredLeaderboard = useMemo(() => {
    return leaderboard.filter((entry) => {
      const matchesSearch =
        entry.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.studentEmail.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (filterTier === 'perfect') return entry.accuracy === 100;
      if (filterTier === 'high') return entry.accuracy >= 80 && entry.accuracy < 100;
      if (filterTier === 'mid') return entry.accuracy >= 50 && entry.accuracy < 80;
      if (filterTier === 'low') return entry.accuracy < 50;

      return true;
    });
  }, [leaderboard, searchQuery, filterTier]);

  // Export CSV
  const handleExportCSV = () => {
    if (leaderboard.length === 0) return;
    const headers = ['Rank', 'Student Name', 'Student Email', 'Score', 'Total Questions', 'Accuracy (%)', 'Submitted At'];
    const rows = leaderboard.map((e) => [
      e.rank,
      `"${e.studentName.replace(/"/g, '""')}"`,
      `"${e.studentEmail.replace(/"/g, '""')}"`,
      e.correctAnswers,
      e.totalQuestions,
      e.accuracy,
      `"${new Date(e.submittedAt).toLocaleString()}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${quizTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_leaderboard.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  const getRankBadge = (rank: number) => {
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
      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200">
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
      <div className="max-w-6xl mx-auto px-4 py-24 text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <Trophy className="w-6 h-6 text-indigo-600 absolute inset-0 m-auto" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Compiling Leaderboard Rankings...</h3>
        <p className="text-xs text-slate-500 mt-1">Aggregating scores, ties, and student achievements.</p>
      </div>
    );
  }

  // Top performers for podium display
  const first = leaderboard[0];
  const second = leaderboard[1];
  const third = leaderboard[2];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <Link
            href={`/teacher/quizzes/${quizId}/analytics`}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm transition hover:scale-105"
            title="Back to Analytics"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="p-1.5 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white shadow-md shadow-amber-500/20">
                <Trophy className="w-4 h-4" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Quiz Leaderboard
              </h1>
              <Badge variant="primary" className="font-bold text-xs py-0.5">
                {quizTitle}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span>Standard Competition Ranking by accuracy</span>
              <span className="text-slate-300">•</span>
              <span>Ties share equal rank</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => loadLeaderboard(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition disabled:opacity-50"
            title="Refresh Leaderboard"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={leaderboard.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition disabled:opacity-40"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <Link
            href={`/teacher/quizzes/${quizId}/analytics`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold shadow-sm transition"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics View</span>
          </Link>

          <Link
            href={`/teacher/quizzes/${quizId}/assign`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition"
          >
            <UserCheck className="w-4 h-4" />
            <span>Assign Quiz</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 shadow-sm">
          <span className="font-bold">Error:</span> {error}
        </div>
      )}

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Submissions
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{stats.total}</span>
            <span className="text-xs font-medium text-slate-400">students</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Completed quiz attempts</p>
        </div>

        {/* Metric 2 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Class Average
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600">
              {stats.avgAccuracy}%
            </span>
            <span className="text-xs font-medium text-slate-400">accuracy</span>
          </div>
          {/* Mini accuracy bar */}
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.avgAccuracy}%` }}
            />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Top Score
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-500">
              {stats.topAccuracy}%
            </span>
            <span className="text-xs font-medium text-slate-400">highest</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {first ? `${first.correctAnswers} of ${first.totalQuestions} questions correct` : 'No attempts yet'}
          </p>
        </div>

        {/* Metric 4 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              100% Achievers
            </span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-violet-600">
              {stats.perfectScores}
            </span>
            <span className="text-xs font-medium text-slate-400">perfect score</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Mastery students with zero errors</p>
        </div>
      </div>

      {leaderboard.length === 0 ? (
        /* Empty State */
        <div className="py-16 px-6 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
            <Trophy className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">No completed submissions yet</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Once assigned students take and submit this quiz, their ranks, accuracy, and detailed scores will dynamically appear on this leaderboard.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              href={`/teacher/quizzes/${quizId}/assign`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition"
            >
              <UserCheck className="w-4 h-4" />
              <span>Assign Students to Quiz</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Top 3 Visual Showcase / Podium Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-500" />
                <span>Top Performers Showcase</span>
              </h2>
              <span className="text-xs text-slate-400 font-medium">Rankings updated in real time</span>
            </div>

            {/* If 1 participant */}
            {leaderboard.length === 1 && first && (
              <div className="max-w-md mx-auto">
                <div className="p-6 rounded-3xl bg-gradient-to-b from-amber-500/10 via-amber-50/40 to-white border-2 border-amber-300 shadow-xl shadow-amber-500/10 text-center relative overflow-hidden">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-black text-xs shadow-md shadow-amber-500/30 mb-4">
                    <Crown className="w-3.5 h-3.5 fill-white" />
                    <span>Current Leader</span>
                  </div>

                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-white font-black text-xl flex items-center justify-center mx-auto shadow-md shadow-amber-500/20 ring-4 ring-amber-300/40 mb-3">
                    {getInitials(first.studentName, first.studentEmail)}
                  </div>

                  <h3 className="text-lg font-black text-slate-900">{first.studentName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{first.studentEmail}</p>

                  <div className="mt-4 pt-4 border-t border-amber-200/60 flex items-center justify-around text-xs">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Accuracy</p>
                      <p className="text-xl font-black text-emerald-600">{first.accuracy}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Score</p>
                      <p className="text-sm font-bold text-slate-800">
                        {first.correctAnswers} / {first.totalQuestions}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* If 2 participants (e.g. current live data) */}
            {leaderboard.length === 2 && first && second && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {/* 1st Place */}
                <div className="p-6 rounded-3xl bg-gradient-to-b from-amber-500/10 via-amber-50/40 to-white border-2 border-amber-300 shadow-xl shadow-amber-500/10 text-center relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-black text-xs shadow-md shadow-amber-500/30 mb-4">
                      <Crown className="w-3.5 h-3.5 fill-white" />
                      <span>Rank #1 • Champion</span>
                    </div>

                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-white font-black text-xl flex items-center justify-center mx-auto shadow-md shadow-amber-500/20 ring-4 ring-amber-300/40 mb-3">
                      {getInitials(first.studentName, first.studentEmail)}
                    </div>

                    <h3 className="text-base font-black text-slate-900 truncate">{first.studentName}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{first.studentEmail}</p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-amber-200/60 flex items-center justify-around text-xs">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Accuracy</p>
                      <p className="text-xl font-black text-emerald-600">{first.accuracy}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Score</p>
                      <p className="text-sm font-bold text-slate-800">
                        {first.correctAnswers} / {first.totalQuestions}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2nd Place */}
                <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-500/10 via-slate-50/40 to-white border border-slate-200 shadow-md text-center relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-slate-400 to-slate-500 text-white font-bold text-xs shadow-sm mb-4">
                      <Medal className="w-3.5 h-3.5 fill-white" />
                      <span>Rank #2 • Runner Up</span>
                    </div>

                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-slate-400 to-slate-600 text-white font-black text-xl flex items-center justify-center mx-auto shadow-md ring-4 ring-slate-200 mb-3">
                      {getInitials(second.studentName, second.studentEmail)}
                    </div>

                    <h3 className="text-base font-black text-slate-900 truncate">{second.studentName}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{second.studentEmail}</p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-around text-xs">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Accuracy</p>
                      <p className="text-xl font-black text-slate-800">{second.accuracy}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Score</p>
                      <p className="text-sm font-bold text-slate-800">
                        {second.correctAnswers} / {second.totalQuestions}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* If 3+ participants: Classic 3-card Podium */}
            {leaderboard.length >= 3 && first && second && third && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                {/* 2nd Place (Silver) */}
                <div className="order-2 md:order-1 p-5 rounded-3xl bg-gradient-to-b from-slate-500/10 via-slate-50/50 to-white border border-slate-200 shadow-md text-center relative flex flex-col justify-between h-[270px]">
                  <div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-slate-400 to-slate-500 text-white font-bold text-xs shadow-sm mb-3">
                      <Medal className="w-3.5 h-3.5" />
                      <span>2nd Place</span>
                    </div>

                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-slate-400 to-slate-600 text-white font-bold text-lg flex items-center justify-center mx-auto shadow-md ring-4 ring-slate-200 mb-2">
                      {getInitials(second.studentName, second.studentEmail)}
                    </div>

                    <h3 className="text-sm font-black text-slate-900 truncate">{second.studentName}</h3>
                    <p className="text-[11px] text-slate-500 truncate">{second.studentEmail}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-around text-xs">
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-400">Accuracy</p>
                      <p className="text-lg font-black text-slate-800">{second.accuracy}%</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-400">Score</p>
                      <p className="text-xs font-bold text-slate-700">
                        {second.correctAnswers}/{second.totalQuestions}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 1st Place (Gold, Taller & Elevated) */}
                <div className="order-1 md:order-2 p-6 rounded-3xl bg-gradient-to-b from-amber-500/15 via-amber-50/50 to-white border-2 border-amber-400 shadow-xl shadow-amber-500/15 text-center relative flex flex-col justify-between h-[300px]">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-white font-black text-xs shadow-md shadow-amber-500/30 mb-3">
                      <Crown className="w-3.5 h-3.5 fill-white" />
                      <span>1st Place • Champion</span>
                    </div>

                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-white font-black text-xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/25 ring-4 ring-amber-300 mb-2">
                      {getInitials(first.studentName, first.studentEmail)}
                    </div>

                    <h3 className="text-base font-black text-slate-900 truncate">{first.studentName}</h3>
                    <p className="text-xs text-slate-500 truncate">{first.studentEmail}</p>
                  </div>

                  <div className="pt-3 border-t border-amber-200 flex items-center justify-around text-xs">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Accuracy</p>
                      <p className="text-2xl font-black text-emerald-600">{first.accuracy}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Score</p>
                      <p className="text-sm font-bold text-slate-800">
                        {first.correctAnswers} / {first.totalQuestions}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3rd Place (Bronze) */}
                <div className="order-3 p-5 rounded-3xl bg-gradient-to-b from-amber-600/10 via-orange-50/40 to-white border border-amber-200 shadow-md text-center relative flex flex-col justify-between h-[255px]">
                  <div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-xs shadow-sm mb-3">
                      <Award className="w-3.5 h-3.5" />
                      <span>3rd Place</span>
                    </div>

                    <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-amber-600 to-orange-600 text-white font-bold text-base flex items-center justify-center mx-auto shadow-md ring-4 ring-orange-200 mb-2">
                      {getInitials(third.studentName, third.studentEmail)}
                    </div>

                    <h3 className="text-sm font-black text-slate-900 truncate">{third.studentName}</h3>
                    <p className="text-[11px] text-slate-500 truncate">{third.studentEmail}</p>
                  </div>

                  <div className="pt-3 border-t border-orange-100 flex items-center justify-around text-xs">
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-400">Accuracy</p>
                      <p className="text-lg font-black text-slate-800">{third.accuracy}%</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-400">Score</p>
                      <p className="text-xs font-bold text-slate-700">
                        {third.correctAnswers}/{third.totalQuestions}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Full Participant Standings Table Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header & Filter Controls Toolbar */}
            <div className="p-5 sm:p-6 border-b border-slate-100 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Completed Participants ({leaderboard.length})
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Showing results ranked by highest score and accuracy
                    </p>
                  </div>
                </div>

                {/* Filter Tier Tabs */}
                <div className="flex items-center gap-1.5 flex-wrap">
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
                  {stats.perfectScores > 0 && (
                    <button
                      type="button"
                      onClick={() => setFilterTier('perfect')}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                        filterTier === 'perfect'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      100% ({stats.perfectScores})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setFilterTier('high')}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                      filterTier === 'high'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                    }`}
                  >
                    High (80-99%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTier('mid')}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                      filterTier === 'mid'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                    }`}
                  >
                    Mid (50-79%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterTier('low')}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                      filterTier === 'low'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                    }`}
                  >
                    Below 50%
                  </button>
                </div>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search students by name or email address..."
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

            {/* Table Content */}
            {filteredLeaderboard.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Search className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No matching students found</p>
                <p className="text-[11px] text-slate-400">
                  Try adjusting your search query or tier filter to see results.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {/* Table Header Row (Desktop) */}
                <div className="hidden sm:grid grid-cols-12 px-6 py-3 bg-slate-50/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <div className="col-span-2">Rank</div>
                  <div className="col-span-5">Participant</div>
                  <div className="col-span-3 text-right">Accuracy & Score</div>
                  <div className="col-span-2 text-right">Submitted</div>
                </div>

                {filteredLeaderboard.map((entry) => (
                  <div
                    key={entry.studentId}
                    className="p-4 sm:px-6 sm:py-4 grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-2 items-center hover:bg-slate-50/80 transition duration-150"
                  >
                    {/* Rank */}
                    <div className="sm:col-span-2 flex items-center justify-between sm:justify-start">
                      <div>{getRankBadge(entry.rank)}</div>
                      <div className="sm:hidden">{getAccuracyBadge(entry.accuracy)}</div>
                    </div>

                    {/* Participant Info */}
                    <div className="sm:col-span-5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                        {getInitials(entry.studentName, entry.studentEmail)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {entry.studentName}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">{entry.studentEmail}</p>
                      </div>
                    </div>

                    {/* Accuracy & Score with Mini Progress Bar */}
                    <div className="sm:col-span-3 text-right space-y-1">
                      <div className="flex items-center justify-end gap-2">
                        <span className="hidden sm:inline-block">
                          {getAccuracyBadge(entry.accuracy)}
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          {entry.correctAnswers} / {entry.totalQuestions}
                        </span>
                      </div>
                      {/* Mini bar */}
                      <div className="w-28 ml-auto bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            entry.accuracy >= 80
                              ? 'bg-emerald-500'
                              : entry.accuracy >= 50
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${entry.accuracy}%` }}
                        />
                      </div>
                    </div>

                    {/* Submitted Date */}
                    <div className="sm:col-span-2 text-left sm:text-right text-[11px] text-slate-400 flex items-center sm:justify-end gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-300" />
                      <span>{formatDate(entry.submittedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer Summary */}
            <div className="px-6 py-3.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing <strong className="text-slate-700">{filteredLeaderboard.length}</strong> of{' '}
                <strong className="text-slate-700">{leaderboard.length}</strong> participants
              </span>
              <span className="text-[11px] text-slate-400">
                Sorted by accuracy & time
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
