# EPOCH HUB — Internal Club Platform

> **One Club. One Community. One Place to Get Things Done.**

Epoch Hub is a production-grade internal community, task-management, and gamified contribution platform built for **Epoch Society**.

---

## 🚀 Key Features Built

1. **Direct Mobile Number Authentication**
   - Direct verification against the club member database (`users` table).
   - Only registered phone numbers in the database can sign in.
   - Unregistered numbers are safely rejected with descriptive feedback.
   - Issues secure HTTP-only session JWT cookies (`jose`).

2. **Domain System (8 Functional Domains)**
   - Tech, Design, Media, Content, Social Media, Marketing, Events, Operations.
   - Dedicated domain profiles displaying domain heads, active tasks, rosters, and domain leaderboards.

3. **Event Management**
   - Multi-domain events with progress indicators and domain task breakdowns.
   - Full event life-cycle: `Draft`, `Upcoming`, `Active`, `Completed`, `Archived`.

4. **Task Lifecycle & Atomic Claiming**
   - Task progression: `AVAILABLE` → `CLAIMED` → `IN_PROGRESS` → `SUBMITTED` → `UNDER_REVIEW` → `APPROVED` / `REJECTED` / `MISSED`.
   - Atomic database transactions with race-condition prevention so two members cannot claim the same task simultaneously.

5. **Deliverable Submissions & Secure File Storage**
   - Object storage for deliverables with file type & size validation (`PDF`, `DOCX`, `ZIP`, `PNG`, `JPG`, `MP4`).
   - Authenticated stream API (`/api/files/[fileId]`).
   - Deliverable versioning (`v1`, `v2`, ...) with member notes and reviewer feedback history.

6. **Points Ledger & Penalty Deduplication**
   - Double-award prevention: points can strictly never be awarded twice for the same task.
   - Overdue tasks trigger a `-1 point` penalty with idempotent deduplication (never penalizes a task multiple times).
   - Administrator oversight for penalty reversals and excused deadlines.

7. **Dynamic Leaderboards & Achievements**
   - Club-wide and domain-specific leaderboards computed dynamically from verified point transactions.
   - Time filters: Overall, Monthly, and Semester.
   - Automatic badge unlocking (`FIRST_TASK`, `TEN_TASKS`, `FAST_EXECUTOR`, `TOP_CONTRIBUTOR`, `DOMAIN_CHAMPION`).

8. **Admin Operations Suite**
   - Executive KPIs, domain completion rates, and event progress analytics.
   - Member Directory with role adjustments and non-destructive soft deactivation.
   - Deliverables Review Queue for domain heads and reviewers with 1-click approvals or feedback rejections.
   - On-demand automated deadline scan engine.

9. **Responsive Design & PWA**
   - Mobile-first bottom navigation bar and desktop sidebar.
   - PWA Web Manifest (`manifest.json`) and service worker (`sw.js`).

---

## 👥 Pre-seeded Test Accounts

You can test any role directly using these registered mobile numbers on the login screen:

| Role | Name | Phone Number | Domain |
| :--- | :--- | :--- | :--- |
| **Super Admin** | Mohammed Rehan | `+919876543210` | Tech Domain |
| **Tech Domain Head** | Sarah Jenkins | `+919876543211` | Tech Domain |
| **Design Domain Head** | Rohan Sharma | `+919876543215` | Design Domain |
| **Member** | Alex Turner | `+919876543212` | Tech Domain |
| **Member** | Priya Nair | `+919876543213` | Design Domain |
| **Reviewer** | Dev Mehta | `+919876543214` | Tech Domain |

*(Unregistered phone numbers such as `9999999999` are rejected with a 404 alert as requested).*

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router, Server Actions & Route Handlers)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Lucide Icons
- **Database**: Zero-dependency ACID SQLite engine (`node:sqlite` in Node v26) + PostgreSQL migration (`supabase/migrations/20261007_init.sql`) with Row Level Security (RLS) policies
- **Authentication**: Direct database phone lookup + `jose` JWT HTTP-only cookies

---

## 🏃 Running the Project

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### Production Build & Run
```bash
npm run build
npm run start
```

### Run Full Verification Test Suite
```bash
node scripts/e2e-test.mjs
```
