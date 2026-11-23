'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../../../lib/api';
import { Question } from '../../../../../types';
import { ProgressBar } from '../../../../../components/ProgressBar';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Send,
  Sparkles,
} from 'lucide-react';

interface QuizTakeData {
  quiz: {
    id: string;
    title: string;
    description?: string;
    questions: Question[];
  };
  assignmentId: string;
  status: 'PENDING' | 'COMPLETED';
}

export default function QuizAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  const [quizData, setQuizData] = useState<QuizTakeData | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // { questionId: selectedOptionId }
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    async function loadQuizForTake() {
      setIsLoading(true);
      try {
        const data = await api.get<QuizTakeData>(`/quizzes/${quizId}/take`);
        if (data.status === 'COMPLETED') {
          // If already completed, redirect directly to result
          router.replace(`/student/quiz/${quizId}/result`);
          return;
        }
        setQuizData(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load quiz');
      } finally {
        setIsLoading(false);
      }
    }

    if (quizId) {
      loadQuizForTake();
    }
  }, [quizId, router]);

  const selectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const currentQuestion = quizData?.quiz.questions[currentQIndex];
  const totalQuestions = quizData?.quiz.questions.length || 0;
  const answeredCount = Object.keys(answers).length;
  const progressPercentage = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  const handleSubmit = async () => {
    if (!quizData) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const answersArray = Object.entries(answers).map(([questionId, selectedOptionId]) => ({
        questionId,
        selectedOptionId,
      }));

      await api.post(`/quizzes/${quizId}/submit`, {
        assignmentId: quizData.assignmentId,
        answers: answersArray,
      });

      router.push(`/student/quiz/${quizId}/result`);
    } catch (err: any) {
      setError(err.message || 'Failed to submit quiz');
      setShowConfirmModal(false);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium">Preparing your quiz questions...</p>
      </div>
    );
  }

  if (error || !quizData || !currentQuestion) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {error || 'Quiz could not be loaded.'}
        </div>
        <Link
          href="/student/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Quiz Attempt Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <Link
            href="/student/dashboard"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Exit Quiz
          </Link>

          <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            {answeredCount} of {totalQuestions} Answered
          </span>
        </div>

        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">
            {quizData.quiz.title}
          </h1>
          {quizData.quiz.description && (
            <p className="text-xs text-slate-500 mt-0.5">{quizData.quiz.description}</p>
          )}
        </div>

        <ProgressBar value={progressPercentage} size="sm" color="emerald" />
      </div>

      {/* Question Stepper Indicator */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {quizData.quiz.questions.map((q, idx) => {
          const isAnswered = !!answers[q.id];
          const isCurrent = idx === currentQIndex;

          return (
            <button
              key={q.id}
              onClick={() => setCurrentQIndex(idx)}
              className={`w-9 h-9 rounded-xl text-xs font-bold transition flex items-center justify-center shrink-0 ${
                isCurrent
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-600/30'
                  : isAnswered
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Current Question Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-fade-in">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
          <span>Question {currentQIndex + 1} of {totalQuestions}</span>
          <span className="text-indigo-600 font-bold">Select 1 option</span>
        </div>

        <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
          {currentQuestion.text}
        </h2>

        {/* Options List */}
        <div className="space-y-3 pt-2">
          {currentQuestion.options.map((opt, optIdx) => {
            const letter = String.fromCharCode(65 + optIdx);
            const isSelected = answers[currentQuestion.id] === opt.id;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => selectOption(currentQuestion.id, opt.id)}
                className={`w-full p-4 rounded-xl border text-left transition flex items-center gap-3.5 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center shrink-0 transition ${
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {letter}
                </div>

                <span className="text-xs sm:text-sm font-medium text-slate-800 leading-snug">
                  {opt.text}
                </span>
              </button>
            );
          })}
        </div>

        {/* Navigation & Submit footer */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            disabled={currentQIndex === 0}
            onClick={() => setCurrentQIndex(currentQIndex - 1)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none transition flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>

          {currentQIndex < totalQuestions - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentQIndex(currentQIndex + 1)}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>Next Question</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/25 transition flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Submit Quiz</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-slide-up">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Confirm Final Submission</h3>
              <p className="text-xs text-slate-500">
                You have answered <span className="font-bold text-emerald-600">{answeredCount}</span> of{' '}
                <span className="font-bold">{totalQuestions}</span> questions.
              </p>
              {answeredCount < totalQuestions && (
                <p className="text-xs font-semibold text-amber-600 bg-amber-50 p-2 rounded-lg mt-2">
                  Warning: You have {totalQuestions - answeredCount} unanswered question(s).
                </p>
              )}
              <p className="text-[11px] text-slate-400 pt-1">
                Note: Each student may submit an assigned quiz only once.
              </p>
            </div>

            <div className="pt-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
              >
                Review Answers
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Calculating Score...' : 'Confirm & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
