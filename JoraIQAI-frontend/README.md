# JoraIQ.AI Frontend — Next.js 14 Web Application

The responsive web interface for the JoraIQ.AI Quiz-Based Learning & Precision Analytics Platform, built with Next.js 14 (App Router), React 18, TypeScript, and Tailwind CSS.

---

## 🏛️ Application Architecture

```
src/
├── app/
│   ├── layout.tsx                        # Global root layout with AuthProvider & Navbar
│   ├── globals.css                       # Tailwind styles & theme variables
│   ├── page.tsx                          # Public landing page with role portals showcase
│   ├── login/page.tsx                    # Multi-role authentication (Teacher / Student tabs)
│   ├── register/page.tsx                 # User registration flow with role selection
│   ├── teacher/                          # Instructor Portal (Role: TEACHER)
│   │   ├── dashboard/page.tsx            # Global KPI cards, quiz cards, quick actions
│   │   └── quizzes/
│   │       ├── create/page.tsx           # Quiz builder (4 options/question, correct answer marking)
│   │       └── [id]/
│   │           ├── assign/page.tsx       # Student selection directory & cohort assignment
│   │           ├── analytics/page.tsx    # Live accuracy, completion rates, question difficulty diagnostics
│   │           └── leaderboard/page.tsx  # Gamified podium, top 3 showcase, CSV export, search & filters
│   └── student/                          # Learner Portal (Role: STUDENT)
│       ├── dashboard/page.tsx            # Assigned quizzes with Pending vs Completed tabs
│       └── quiz/[id]/
│           ├── attempt/page.tsx          # Clean test environment (single attempt, stripped keys)
│           ├── result/page.tsx           # Instant grading, score cards, confetti, answer explanation review
│           └── leaderboard/page.tsx      # Peer rankings, current student highlight, tie-handling
├── components/                           # Shared UI components
│   ├── Navbar.tsx                        # Responsive navigation with role indicators & logout
│   ├── Badge.tsx                         # Semantic badge components (primary, success, warning, danger)
│   └── ProgressBar.tsx                   # Dynamic animated accuracy bars
├── context/
│   └── AuthContext.tsx                   # Client-side session state, token management & route guards
├── lib/
│   ├── api.ts                            # Axios/Fetch wrapper with JWT Bearer header injection
│   └── utils.ts                          # Formatting utilities (dates, class names, percentages)
└── types/
    └── index.ts                          # Strict TypeScript interfaces for quizzes, attempts, and users
```

---

## 🖥️ Expected Screens & Functional Workflows

### 👩‍🏫 Teacher Workspace
1. **Login & Registration ([/login](file:///src/app/login/page.tsx), [/register](file:///src/app/register/page.tsx))**:
   - Secure sign-in with email and password.
   - Portal role verification: checks that the account role matches the selected portal.
2. **Teacher Dashboard ([/teacher/dashboard](file:///src/app/teacher/dashboard/page.tsx))**:
   - Global overview metrics: Total Quizzes Authored, Average Student Accuracy, Total Assigned Cohort.
   - Quiz catalog with direct shortcuts to Assign, Analytics, Leaderboard, and Delete.
3. **Quiz Creation Screen ([/teacher/quizzes/create](file:///src/app/teacher/quizzes/create/page.tsx))**:
   - Add quiz title and description.
   - Add multiple questions with 4 answer choices each.
   - Radio buttons to designate exactly one correct choice per question.
   - Real-time client-side validation preventing incomplete questions.
4. **Quiz Assignment Screen ([/teacher/quizzes/[id]/assign](file:///src/app/teacher/quizzes/[id]/assign/page.tsx))**:
   - Displays real registered students directory with name, email, and completion statistics.
   - Multi-select checkboxes, "Select All", and "Clear" actions.
   - Prevents re-assigning students who have already been assigned.
   - Right-hand roster displaying live status (`PENDING` vs `COMPLETED`).
5. **Performance Analytics Screen ([/teacher/quizzes/[id]/analytics](file:///src/app/teacher/quizzes/[id]/analytics/page.tsx))**:
   - Total students assigned vs completed.
   - Average accuracy percentage across submissions.
   - Student-by-student scores, accuracy, and submission dates.
   - **Per-question difficulty diagnostics**: reveals which questions students struggled with most.
6. **Quiz Leaderboard Screen ([/teacher/quizzes/[id]/leaderboard](file:///src/app/teacher/quizzes/[id]/leaderboard/page.tsx))**:
   - Top 3 Podium showcase with gold, silver, and bronze badges.
   - Live search by student name or email.
   - Tier filter chips (`100%`, `High`, `Mid`, `Below 50%`).
   - One-click **Export to CSV** for offline grading.

### 👨‍🎓 Student Workspace
1. **Student Dashboard ([/student/dashboard](file:///src/app/student/dashboard/page.tsx))**:
   - Displays quizzes assigned by teachers.
   - **Pending Tab**: Quizzes ready to be attempted with title, question count, and "Start Quiz" button.
   - **Completed Tab**: Completed quizzes with your accuracy score and "View Results" button.
2. **Quiz Attempt Screen ([/student/quiz/[id]/attempt](file:///src/app/student/quiz/[id]/attempt/page.tsx))**:
   - Clean, distraction-free examination view.
   - Question stepper with visual progress bar.
   - **Security**: Answer keys are never present in the client payload before submission.
   - Single-submission enforcement: cannot re-take or double-submit.
3. **Quiz Result Screen ([/student/quiz/[id]/result](file:///src/app/student/quiz/[id]/result/page.tsx))**:
   - Instant automated grading results: Total Questions, Correct, Incorrect, Accuracy %.
   - Celebration confetti burst for high mastery (≥70%).
   - Comprehensive question breakdown: compares the student's selected answer against the correct answer with explanations.
4. **Peer Leaderboard Screen ([/student/quiz/[id]/leaderboard](file:///src/app/student/quiz/[id]/leaderboard/page.tsx))**:
   - "Your Standing" banner clearly highlighting the current student's rank and score.
   - Top 3 achievers podium.
   - Complete competition ranking with fair tie-handling.
   - Restricted strictly to students assigned to that quiz.

---

## ⚡ Setup & Local Execution

### 1. Environment Configuration
Create or edit `.env.local` in `JoraIQAI-frontend/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```
*(Notice: No database secrets or service-role keys are exposed in the frontend.)*

### 2. Install & Run
```bash
cd JoraIQAI-frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev

# Or build for production
npm run build
npm run start
```
Open **`http://localhost:3000`** in your browser.

---

## 🔒 Security & Client Isolation

- **Zero-Secret Architecture**: In compliance with strict production security standards, no Supabase service-role keys, private API keys, or database credentials exist on the frontend.
- **REST Gateway**: All operations (authentication, quiz authoring, assignments, submissions, analytics, leaderboards) route through the NestJS REST API using standard JWT Bearer authentication.
- **State & UX Robustness**: All pages include dedicated handling for loading skeletons, empty state illustrations (e.g. no quizzes assigned, no participants completed), and clear user-facing error banners.
