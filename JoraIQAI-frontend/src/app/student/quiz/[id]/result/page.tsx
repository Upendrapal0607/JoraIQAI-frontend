'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../../../lib/api';
import { QuizAttempt } from '../../../../../types';
import { Badge } from '../../../../../components/Badge';
import { ProgressBar } from '../../../../../components/ProgressBar';
import { formatDate } from '../../../../../lib/utils';
import confetti from 'canvas-confetti';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Award,
  ArrowRight,
  BookOpen,
  Calendar,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

export default function QuizResultPage() {
  const params = useParams();
  const quizId = params.id as string;

  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadResult() {
      setIsLoading(true);
      try {
        const data = await api.get<QuizAttempt>(`/quizzes/${quizId}/result`);
        setAttempt(data);

        // Trigger confetti celebration if accuracy >= 70%
        if (data.accuracy >= 70) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load quiz results');
      } finally {
        setIsLoading(false);
      }
    }

    if (quizId) {
      loadResult();
    }
  }, [quizId]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500">Loading your quiz results...</p>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {error || 'No attempt found.'}
        </div>
        <Link
          href="/student/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
        >
          <BookOpen className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const isHighScorer = attempt.accuracy >= 80;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Result Hero Score Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/25 mx-auto">
          {isHighScorer ? <Trophy className="w-8 h-8" /> : <Award className="w-8 h-8" />}
        </div>

        <div className="space-y-1">
          <Badge variant="success">Quiz Completed</Badge>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight pt-2">
            {attempt.quizTitle}
          </h1>
          <p className="text-xs text-slate-500">
            Submitted on {formatDate(attempt.submittedAt)}
          </p>
        </div>

        {/* Big Score / Accuracy Display */}
        <div className="py-4 px-6 max-w-sm mx-auto rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Accuracy</p>
          <p className="text-4xl sm:text-5xl font-black text-emerald-600">
            {attempt.accuracy}%
          </p>
          <div className="pt-2">
            <ProgressBar value={attempt.accuracy} size="md" color="emerald" />
          </div>
        </div>

        {/* 4 Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70">
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Total Questions</p>
            <p className="text-xl font-black text-slate-800">{attempt.totalQuestions}</p>
          </div>

          <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/60">
            <p className="text-[10px] text-emerald-700 font-semibold uppercase">Correct Answers</p>
            <p className="text-xl font-black text-emerald-700">{attempt.correctAnswers}</p>
          </div>

          <div className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/60">
            <p className="text-[10px] text-rose-700 font-semibold uppercase">Incorrect</p>
            <p className="text-xl font-black text-rose-700">{attempt.incorrectAnswers}</p>
          </div>

          <div className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/60">
            <p className="text-[10px] text-indigo-700 font-semibold uppercase">Final Score</p>
            <p className="text-xl font-black text-indigo-700">{attempt.score} pts</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href={`/student/quiz/${quizId}/leaderboard`}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition flex items-center justify-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            <span>View Quiz Leaderboard</span>
          </Link>

          <Link
            href="/student/dashboard"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <span>Back to My Quizzes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Detailed Question Review Breakdown */}
      {attempt.breakdown && attempt.breakdown.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              Detailed Answers & Explanations ({attempt.breakdown.length})
            </h2>
            <span className="text-xs text-slate-400">Unlocked post-submission</span>
          </div>

          <div className="space-y-4">
            {attempt.breakdown.map((item, idx) => (
              <div
                key={item.questionId}
                className={`bg-white p-6 rounded-2xl border transition shadow-sm space-y-4 ${
                  item.isCorrect ? 'border-emerald-200' : 'border-rose-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full shrink-0 ${
                        item.isCorrect
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      Question {idx + 1}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      {item.questionText}
                    </h3>
                  </div>

                  <div className="shrink-0">
                    {item.isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Correct
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        <XCircle className="w-3.5 h-3.5" />
                        Incorrect
                      </span>
                    )}
                  </div>
                </div>

                {/* Options List */}
                <div className="grid grid-cols-1 gap-2 pt-1">
                  {item.options.map((opt, optIdx) => {
                    const letter = String.fromCharCode(65 + optIdx);
                    const isSelected = opt.isSelected;
                    const isCorrectAnswer = opt.isCorrect;

                    let optStyle = 'border-slate-100 bg-slate-50/60 text-slate-700';
                    if (isCorrectAnswer) {
                      optStyle = 'border-emerald-300 bg-emerald-50 text-emerald-900 font-semibold';
                    } else if (isSelected && !isCorrectAnswer) {
                      optStyle = 'border-rose-300 bg-rose-50 text-rose-900 line-through';
                    }

                    return (
                      <div
                        key={opt.id}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between ${optStyle}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold w-4">{letter}.</span>
                          <span>{opt.text}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isSelected && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                              Your Choice
                            </span>
                          )}
                          {isCorrectAnswer && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800">
                              Correct Answer
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
