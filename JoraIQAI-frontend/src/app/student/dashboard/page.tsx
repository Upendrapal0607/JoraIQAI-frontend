'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { QuizAssignment } from '../../../types';
import { Badge } from '../../../components/Badge';
import { ProgressBar } from '../../../components/ProgressBar';
import { formatDate } from '../../../lib/utils';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowRight,
  Trophy,
  Award,
  Calendar,
  AlertCircle,
  HelpCircle,
  User,
} from 'lucide-react';

export default function StudentDashboardPage() {
  const [assignments, setAssignments] = useState<QuizAssignment[]>([]);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'COMPLETED'>('PENDING');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<QuizAssignment[]>('/student/quizzes');
      setAssignments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load assigned quizzes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const pendingList = assignments.filter((a) => a.status === 'PENDING');
  const completedList = assignments.filter((a) => a.status === 'COMPLETED');

  const displayedList = activeTab === 'PENDING' ? pendingList : completedList;

  // Stats calculation
  const totalCompleted = completedList.length;
  const avgAccuracy =
    totalCompleted > 0
      ? Math.round(
          (completedList.reduce((sum, a) => sum + (a.attempt?.accuracy || 0), 0) / totalCompleted) *
            10,
        ) / 10
      : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Student Learning Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Attempt assigned quizzes, check your scores, and compete on the peer leaderboards.
          </p>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500">Quizzes Pending</p>
            <p className="text-2xl font-black text-amber-600">{pendingList.length}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500">Completed Quizzes</p>
            <p className="text-2xl font-black text-emerald-600">{completedList.length}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500">Your Average Accuracy</p>
            <p className="text-2xl font-black text-indigo-600">{avgAccuracy}%</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('PENDING')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'PENDING'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          Pending Assignments ({pendingList.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('COMPLETED')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'COMPLETED'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Completed ({completedList.length})
        </button>
      </div>

      {/* Quizzes List */}
      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Loading your assignments...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : displayedList.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">
            {assignments.length === 0
              ? 'No Quizzes Assigned Yet'
              : activeTab === 'PENDING'
                ? 'All Caught Up!'
                : 'No Completed Quizzes Yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            {assignments.length === 0
              ? "You don't have any quizzes assigned right now. Please contact your instructor or wait for the next quiz to be assigned."
              : activeTab === 'PENDING'
                ? `You have completed all your assigned quizzes (${completedList.length} completed). Great job! Wait for your instructor to assign the next quiz.`
                : `You haven't completed any quizzes yet. You have ${pendingList.length} pending quiz${
                    pendingList.length > 1 ? 'zes' : ''
                  } waiting for you to attempt.`}
          </p>
          {activeTab === 'COMPLETED' && pendingList.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('PENDING')}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition shadow-sm"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Go to Pending Quizzes ({pendingList.length})</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedList.map((item) => {
            const isCompleted = item.status === 'COMPLETED';
            const attempt = item.attempt;

            return (
              <div
                key={item.assignmentId}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {item.quizTitle}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {item.quizDescription || 'No description provided.'}
                      </p>
                    </div>

                    <Badge variant={isCompleted ? 'success' : 'warning'} size="sm">
                      {isCompleted ? 'Completed' : 'Pending'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      {item.totalQuestions} Questions
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {item.teacherName || 'Instructor'}
                    </span>
                  </div>

                  {/* If completed, display score and accuracy bar */}
                  {isCompleted && attempt && (
                    <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                        <span>Score: {attempt.score} / {item.totalQuestions}</span>
                        <span>Accuracy: {attempt.accuracy}%</span>
                      </div>
                      <ProgressBar value={attempt.accuracy} size="sm" color="emerald" />
                    </div>
                  )}
                </div>

                {/* Footer action bar */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Assigned: {formatDate(item.assignedAt)}
                  </span>

                  {isCompleted ? (
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/student/quiz/${item.quizId}/result`}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
                      >
                        Review Answers
                      </Link>
                      <Link
                        href={`/student/quiz/${item.quizId}/leaderboard`}
                        className="px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1 transition"
                      >
                        <Trophy className="w-3.5 h-3.5 text-amber-600" />
                        Leaderboard
                      </Link>
                    </div>
                  ) : (
                    <Link
                      href={`/student/quiz/${item.quizId}/attempt`}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition"
                    >
                      <span>Start Quiz</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
