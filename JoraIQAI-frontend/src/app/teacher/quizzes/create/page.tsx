'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import {
  PlusCircle,
  Trash2,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface QuestionFormItem {
  text: string;
  options: { text: string; isCorrect: boolean }[];
}

export default function CreateQuizPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<QuestionFormItem[]>([
    {
      text: '',
      options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
    },
  ]);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [questionErrors, setQuestionErrors] = useState<
    Record<number, { text?: string; options?: Record<number, string> }>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: '',
        options: [
          { text: '', isCorrect: true },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
        ],
      },
    ]);
  };

  const removeQuestion = (qIndex: number) => {
    if (questions.length <= 1) {
      alert('A quiz must have at least one question.');
      return;
    }
    setQuestions(questions.filter((_, idx) => idx !== qIndex));
    const updatedErrors = { ...questionErrors };
    delete updatedErrors[qIndex];
    setQuestionErrors(updatedErrors);
  };

  const updateQuestionText = (qIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].text = text;
    setQuestions(updated);
    if (questionErrors[qIndex]?.text) {
      setQuestionErrors((prev) => ({
        ...prev,
        [qIndex]: { ...prev[qIndex], text: undefined },
      }));
    }
  };

  const updateOptionText = (qIndex: number, optIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex].text = text;
    setQuestions(updated);
    if (questionErrors[qIndex]?.options?.[optIndex]) {
      setQuestionErrors((prev) => ({
        ...prev,
        [qIndex]: {
          ...prev[qIndex],
          options: { ...prev[qIndex]?.options, [optIndex]: undefined },
        },
      }));
    }
  };

  const setCorrectOption = (qIndex: number, optIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options = updated[qIndex].options.map((opt, idx) => ({
      ...opt,
      isCorrect: idx === optIndex,
    }));
    setQuestions(updated);
  };

  const validate = () => {
    let isValid = true;
    setError(null);

    // Validate title
    if (!title.trim()) {
      setTitleError('Quiz title is required.');
      isValid = false;
    } else {
      setTitleError(null);
    }

    // Validate questions and options
    const newQErrors: Record<number, { text?: string; options?: Record<number, string> }> = {};

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const qErr: { text?: string; options?: Record<number, string> } = {};

      if (!q.text.trim()) {
        qErr.text = 'Question statement is required.';
        isValid = false;
      }

      const optErrors: Record<number, string> = {};
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].text.trim()) {
          optErrors[j] = `Option ${String.fromCharCode(65 + j)} text is required.`;
          isValid = false;
        }
      }

      if (Object.keys(optErrors).length > 0) {
        qErr.options = optErrors;
      }

      const correctCount = q.options.filter((o) => o.isCorrect).length;
      if (correctCount !== 1) {
        setError(`Question #${i + 1} must have exactly one correct option selected.`);
        isValid = false;
      }

      if (qErr.text || qErr.options) {
        newQErrors[i] = qErr;
      }
    }

    setQuestionErrors(newQErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await api.post<any>('/quizzes', {
        title: title.trim(),
        description: description.trim() || undefined,
        questions,
      });

      // Redirect to assign page for this quiz
      router.push(`/teacher/quizzes/${created.id}/assign`);
    } catch (err: any) {
      setError(err.message || 'Failed to create quiz');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/teacher/dashboard"
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Create New Quiz
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Draft questions, provide 4 answer options, and mark the correct key.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Form with noValidate to prevent native browser hover bubbles */}
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Basic Info Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Quiz Overview</h2>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Quiz Title <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError(null);
              }}
              placeholder="e.g. Distributed Systems & Database Isolation Levels"
              className={`w-full px-3.5 py-2.5 text-xs rounded-xl border transition focus:outline-none focus:ring-2 ${
                titleError
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20'
                  : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-500/20'
              }`}
            />
            {titleError && (
              <p className="text-[11px] text-rose-600 font-medium mt-1.5 flex items-center gap-1 animate-slide-up">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{titleError}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context or instructions for your students..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>
        </div>

        {/* Questions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Multiple Choice Questions ({questions.length})
            </h2>
            <button
              type="button"
              onClick={addQuestion}
              className="px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Add Question
            </button>
          </div>

          {questions.map((q, qIdx) => (
            <div
              key={qIdx}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 relative group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-indigo-600 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100">
                  Question {qIdx + 1}
                </span>

                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIdx)}
                    title="Remove question"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Question Statement <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  value={q.text}
                  onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                  placeholder="Type your question statement here..."
                  className={`w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border transition focus:outline-none focus:ring-2 ${
                    questionErrors[qIdx]?.text
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/20'
                      : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-500/20'
                  }`}
                />
                {questionErrors[qIdx]?.text && (
                  <p className="text-[11px] text-rose-600 font-medium mt-1.5 flex items-center gap-1 animate-slide-up">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{questionErrors[qIdx]?.text}</span>
                  </p>
                )}
              </div>

              {/* 4 Options Grid */}
              <div className="space-y-2 pt-2">
                <p className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                  Answer Choices (Select radio button for the correct key){' '}
                  <span className="text-rose-500 font-bold">*</span>
                </p>

                <div className="grid grid-cols-1 gap-2.5">
                  {q.options.map((opt, optIdx) => {
                    const letter = String.fromCharCode(65 + optIdx);
                    const hasOptError = !!questionErrors[qIdx]?.options?.[optIdx];

                    return (
                      <div key={optIdx} className="space-y-1">
                        <div
                          className={`flex items-center gap-3 p-2.5 rounded-xl border transition ${
                            hasOptError
                              ? 'border-rose-300 bg-rose-50/30'
                              : opt.isCorrect
                              ? 'border-emerald-500 bg-emerald-50/50'
                              : 'border-slate-200 bg-slate-50/50 focus-within:border-indigo-400 focus-within:bg-white'
                          }`}
                        >
                          <label className="flex items-center cursor-pointer pl-1">
                            <input
                              type="radio"
                              name={`correct-q-${qIdx}`}
                              checked={opt.isCorrect}
                              onChange={() => setCorrectOption(qIdx, optIdx)}
                              className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
                            />
                          </label>

                          <span className="text-xs font-black text-slate-400 w-4">{letter}.</span>

                          <input
                            type="text"
                            value={opt.text}
                            onChange={(e) => updateOptionText(qIdx, optIdx, e.target.value)}
                            placeholder={`Enter Option ${letter} text`}
                            className="flex-1 bg-transparent border-none text-xs focus:outline-none text-slate-800 placeholder-slate-400"
                          />

                          {opt.isCorrect && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mr-1">
                              Correct Key
                            </span>
                          )}
                        </div>

                        {hasOptError && (
                          <p className="text-[11px] text-rose-600 font-medium pl-2 flex items-center gap-1 animate-slide-up">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>{questionErrors[qIdx]?.options?.[optIdx]}</span>
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Actions */}
        <div className="pt-4 flex items-center justify-between border-t border-slate-200">
          <Link
            href="/teacher/dashboard"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSubmitting ? 'Creating Quiz...' : 'Create & Assign Students'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
