# MASTER DEVELOPMENT PROMPT — EPOCH HUB

You are a senior full-stack engineer, software architect, UI/UX designer, database engineer, and security engineer.

Your task is to **fully build and finish the Epoch Hub web application** described below.

Do NOT create a simple demo, static mockup, or prototype.

Build a **production-ready internal club management platform** with a polished UI, functional authentication, database, file uploads, role-based permissions, task management, submissions, points, penalties, leaderboards, notifications, and admin management.

---

# 1. FIRST: INSPECT THE EXISTING PROJECT

Before changing anything:

1. Inspect the entire existing codebase.
2. Understand the current framework and architecture.
3. Identify:

   * Frontend framework
   * Backend/API structure
   * Database
   * Authentication
   * Existing components
   * Existing routes
   * Existing environment variables
   * Existing styling system
   * Existing reusable components
4. Reuse existing functionality wherever possible.
5. Do NOT unnecessarily rewrite working code.
6. Do NOT replace the existing stack unless absolutely necessary.
7. Identify incomplete, broken, placeholder, or mocked functionality.
8. Create a clear implementation plan internally before making changes.

If the project already contains part of Epoch Hub, continue from the existing implementation instead of rebuilding it from scratch.

---

# 2. PRODUCT

Product name:

Epoch Hub

Purpose:

Epoch Hub is an internal community and task-management platform for a college club.

The club contains multiple domains:

* Design
* Tech
* Content
* Social Media
* Media
* Marketing
* Events
* Operations

Members belong to domains.

Events contain tasks.

Members claim tasks, complete them, submit their work, and receive points when their submission is approved.

The platform should create a transparent and gamified system for managing club work.

---

# 3. CORE PRODUCT LOOP

The most important workflow is:

EVENT CREATED

↓

TASK CREATED

↓

TASK ASSIGNED TO DOMAIN

↓

MEMBER DISCOVERS TASK

↓

MEMBER CLAIMS TASK

↓

MEMBER COMPLETES TASK

↓

MEMBER UPLOADS OUTPUT

↓

SUBMISSION REVIEW

↓

APPROVED

↓

POINTS AWARDED

↓

LEADERBOARD UPDATED

If rejected:

SUBMISSION REJECTED

↓

MEMBER RECEIVES FEEDBACK

↓

MEMBER RESUBMITS

If the member fails to complete an accepted task before its deadline:

TASK MARKED MISSED

↓

-1 POINT

The entire application should be designed around making this workflow extremely easy.

---

# 4. TECHNICAL DIRECTION

Prefer the existing project stack.

If the project is already using:

* Next.js
* React
* TypeScript
* Tailwind CSS
* Supabase

continue using those technologies.

For a Supabase-based application use:

* Supabase Auth
* PostgreSQL
* Supabase Storage
* Row Level Security
* Supabase Realtime where useful

Do NOT introduce unnecessary dependencies.

Use TypeScript throughout the application.

Use clean, maintainable, modular architecture.

---

# 5. AUTHENTICATION

Implement mobile-number authentication using OTP.

Flow:

Mobile Number

↓

Send OTP

↓

Verify OTP

↓

Authenticated Session

↓

Dashboard

After first login, if the user profile is incomplete, redirect them to profile setup.

User information should include:

* Name
* Phone number
* Profile image
* Domain
* Role
* Position
* Join date

Roles:

* super_admin
* domain_head
* member
* reviewer

Use proper role-based authorization.

Never rely only on frontend role checks.

Authorization must also be enforced server-side/database-side.

---

# 6. APPLICATION LAYOUT

Create a responsive application shell.

Desktop:

Sidebar navigation + main content.

Mobile:

Bottom navigation or compact mobile navigation.

Primary navigation:

* Home
* Domains
* Events
* Tasks
* Leaderboard
* Profile

Admin navigation:

* Dashboard
* Users
* Domains
* Events
* Tasks
* Submissions
* Points
* Analytics
* Settings

Include:

* Global search where useful
* Notification center
* User profile/avatar
* Responsive sidebar
* Mobile navigation
* Loading states
* Empty states
* Error states

---

# 7. DESIGN SYSTEM

Create a consistent modern design system.

The UI should feel like a modern internal product/community platform.

Design principles:

* Clean
* Professional
* Modern
* Minimal
* Slightly gamified
* High information clarity
* Excellent spacing
* Strong typography
* Responsive
* Accessible

Use reusable components.

Examples:

* Button
* Input
* Select
* Modal
* Dialog
* Dropdown
* Card
* Badge
* Avatar
* Tabs
* Table
* Progress bar
* Toast
* Empty state
* Skeleton loader
* File uploader
* Confirmation dialog

Do not create inconsistent UI for different pages.

---

# 8. MEMBER DASHBOARD

Create a personalized dashboard.

Display:

* Greeting
* Total points
* Current rank
* Tasks completed
* Pending tasks
* Upcoming deadlines
* Active events
* Recent activity
* Notifications
* Leaderboard preview

Example:

Good morning, Rehan 👋

127 Points

Rank #4

34 Completed

3 Pending

Then show:

Upcoming Events

Active Tasks

Upcoming Deadlines

Recent Activity

Leaderboard

The dashboard should prioritize actionable information.

---

# 9. DOMAIN SYSTEM

Create full domain management.

Each domain has:

* ID
* Name
* Description
* Domain head
* Members
* Tasks
* Events
* Statistics

Domain page should display:

* Domain overview
* Domain head
* Members
* Active tasks
* Completed tasks
* Pending tasks
* Domain progress
* Domain leaderboard
* Related events

Members should primarily see their own domain.

Admins can see all domains.

---

# 10. EVENT SYSTEM

Admins can create events.

Event fields:

* Name
* Description
* Start date
* End date
* Status
* Cover image
* Participating domains
* Created by
* Created timestamp

Statuses:

* Draft
* Upcoming
* Active
* Completed
* Archived

Event page should show:

* Event information
* Progress
* Participating domains
* Task statistics
* Tasks
* Timeline
* Files
* Announcements

Example:

TECH FEST 2026

12 Design Tasks

15 Tech Tasks

10 Media Tasks

7 Content Tasks

Overall progress:

████████░░ 80%

---

# 11. TASK SYSTEM

Build the complete task system.

Task fields:

* ID
* Event ID
* Domain ID
* Title
* Description
* Points
* Priority
* Deadline
* Status
* Created by
* Assigned member
* Created timestamp
* Completed timestamp

Statuses:

AVAILABLE

CLAIMED

IN_PROGRESS

SUBMITTED

UNDER_REVIEW

APPROVED

REJECTED

MISSED

CANCELLED

---

# 12. TASK DISCOVERY

Members should have a task discovery page.

Allow filtering by:

* Event
* Domain
* Status
* Priority
* Points
* Deadline

Search by:

* Task name
* Event name

Task cards should clearly show:

* Title
* Event
* Domain
* Points
* Deadline
* Priority
* Status
* Assignee
* CTA

Example:

Create Event Poster

Design

Tech Fest 2026

+10 Points

Due in 2 days

[Take Task]

---

# 13. TASK CLAIMING

When a member clicks "Take Task":

Show confirmation.

Example:

Take this task?

Create Event Poster

Reward:

+10 Points

Deadline:

October 10

[Cancel]

[Take Task]

After confirmation:

* Assign task to member.
* Change task status.
* Prevent another member from claiming it.
* Record timestamp.
* Create activity record.
* Notify the member.

Prevent race conditions where two members attempt to claim the same task simultaneously.

The database should enforce task assignment uniqueness.

---

# 14. TASK SUBMISSION

Members must be able to submit work.

Submission should support:

* PDF
* DOCX
* PPTX
* XLSX
* PNG
* JPG
* ZIP
* MP4
* Other configurable file types

Submission form:

Upload file

Optional comment

[Submit]

Files should be uploaded to secure object storage.

Do not store file binary data directly inside PostgreSQL.

Store metadata in the database.

---

# 15. FILE STORAGE

Use secure storage.

Store:

* File ID
* Task ID
* User ID
* File name
* File type
* File size
* Storage path
* Upload timestamp

Use signed URLs or appropriate secure access mechanisms.

Members should only be able to access files they are authorized to access.

Do not expose private storage buckets publicly.

---

# 16. REVIEW SYSTEM

Domain heads and authorized reviewers can review submissions.

Review page should display:

* Task
* Event
* Domain
* Member
* Submission
* File preview/download
* Submission comment
* Submission history

Actions:

[Approve]

[Reject]

If rejecting:

Require rejection reason.

Example:

"Please correct the event date and replace the old logo."

After rejection:

* Status becomes REJECTED.
* Member receives notification.
* Member can resubmit.
* Review history is preserved.

---

# 17. APPROVAL SYSTEM

When a task is approved:

1. Submission status becomes APPROVED.
2. Task status becomes APPROVED.
3. Completion timestamp is recorded.
4. Points are awarded.
5. Point transaction is created.
6. Member's leaderboard score updates.
7. Member receives notification.
8. Activity feed is updated.

Never allow the same submission/task approval to award points twice.

Use database constraints or transactional logic to guarantee this.

---

# 18. POINT SYSTEM

Every task has a point value.

Example:

Small Task = 2 points

Normal Task = 5 points

Important Task = 10 points

Major Task = 20 points

Critical Task = 30 points

Points are awarded only after approval.

Do NOT simply modify:

user.points

without creating an audit record.

Instead maintain a point transaction ledger.

Example:

+10

Event Poster Approved

Tech Fest 2026

+20

Website Completed

Tech Fest 2026

-1

Missed Task

Recruitment Drive

---

# 19. MISSED TASK PENALTY

Implement automatic missed-task handling.

Rule:

If a member has claimed/been assigned a task and does not complete it before the deadline:

* Mark task as MISSED.
* Create one -1 point transaction.
* Notify member.

IMPORTANT:

Never deduct the -1 point more than once for the same task.

Use a unique transaction/reference mechanism to prevent duplicate penalties.

Admins should be able to:

* Reverse a penalty.
* Mark a task as excused.
* Reassign a task.
* Extend a deadline.

---

# 20. POINT HISTORY

Every user should have a point history page.

Display:

* Date
* Points
* Type
* Reason
* Event
* Task

Examples:

+10 Event Poster Approved

+20 Website Completed

-1 Missed Task

Provide filters by:

* Event
* Date
* Positive/negative
* Domain

---

# 21. LEADERBOARD

Create a polished leaderboard.

Show:

* Rank
* Profile image
* Name
* Domain
* Points
* Completed tasks

Filters:

* Overall
* Monthly
* Semester
* Event
* Domain

Do not hard-code leaderboard values.

Calculate rankings from actual point transactions.

Handle ties consistently.

---

# 22. ACHIEVEMENTS

Implement the achievement system in a way that can be expanded later.

Initial achievements:

FIRST_TASK

TEN_TASKS

FAST_EXECUTOR

TOP_CONTRIBUTOR

PERFECT_EVENT

DOMAIN_CHAMPION

Achievements should automatically unlock based on actual activity.

---

# 23. NOTIFICATIONS

Implement in-app notifications.

Notification types:

* New task
* Task claimed
* Deadline approaching
* Submission approved
* Submission rejected
* Task missed
* Points awarded
* Event announcement

Notification object should include:

* ID
* User ID
* Type
* Title
* Message
* Read status
* Created timestamp
* Related entity

Include:

Mark as read

Mark all as read

Unread count

---

# 24. ADMIN DASHBOARD

Build a professional admin dashboard.

Display:

Total Members

Total Domains

Active Events

Active Tasks

Pending Reviews

Completed Tasks

Missed Tasks

Total Points Distributed

Include charts for:

* Task completion
* Domain activity
* Event progress
* Member participation
* Points distribution

Keep charts meaningful and avoid unnecessary visual clutter.

---

# 25. USER MANAGEMENT

Admins should be able to:

* View users
* Search users
* Filter users
* Add users
* Edit users
* Assign domains
* Assign roles
* Deactivate users

Never permanently delete users if doing so would break historical task or point records.

Prefer soft deletion/deactivation.

---

# 26. DOMAIN MANAGEMENT

Admins can:

* Create domain
* Edit domain
* Assign domain head
* Add members
* Remove members
* View domain performance
* Archive domain

---

# 27. EVENT MANAGEMENT

Admins can:

* Create event
* Edit event
* Publish event
* Archive event
* Add participating domains
* Create tasks
* View progress
* View submissions
* View event statistics

---

# 28. SEARCH

Implement global or contextual search where appropriate.

Search:

* Members
* Tasks
* Events
* Domains

Results should be fast and clearly categorized.

---

# 29. RESPONSIVE DESIGN

The application must work properly on:

* Mobile
* Tablet
* Laptop
* Desktop

Mobile experience is extremely important.

On mobile:

Use bottom navigation:

Home

Tasks

Events

Leaderboard

Profile

Task submission and file upload must be easy from mobile.

---

# 30. PWA

Configure the website as a Progressive Web App.

Requirements:

* Web manifest
* App icon
* Installable
* Standalone mode
* Appropriate theme colors
* Service worker where appropriate
* Responsive mobile UI

Do not compromise normal browser functionality.

---

# 31. DATABASE

Create or update the database schema as required.

Core tables:

users

domains

domain_members

events

tasks

task_assignments

submissions

submission_versions

point_transactions

notifications

achievements

user_achievements

activity_logs

event_domains

Use proper:

* Primary keys
* Foreign keys
* Indexes
* Unique constraints
* Timestamps
* Cascading rules where appropriate

---

# 32. DATABASE INTEGRITY

Important rules:

1. A task cannot have multiple active assignees unless explicitly configured.
2. A task cannot award points twice.
3. A missed-task penalty cannot be applied twice.
4. Members cannot approve their own submissions.
5. Members cannot modify point transactions.
6. Domain heads cannot access unauthorized domains.
7. Admin-only operations must be protected.
8. Deleted/deactivated users should not destroy historical records.
9. Submission history must remain auditable.

---

# 33. ROW LEVEL SECURITY

If using Supabase, implement proper Row Level Security.

Members:

* Can view their own profile.
* Can view permitted domains/events/tasks.
* Can claim available tasks.
* Can submit their own work.
* Can view their own point history.
* Can view public leaderboard information.

Domain heads:

* Can manage tasks within their domain.
* Can review submissions belonging to their domain.

Admins:

* Full access.

Do not use insecure policies such as allowing all authenticated users unrestricted access.

---

# 34. AUDIT LOG

Important actions should be recorded.

Examples:

* User created.
* User role changed.
* Domain created.
* Task created.
* Task claimed.
* Task reassigned.
* Submission uploaded.
* Submission approved.
* Submission rejected.
* Points awarded.
* Points deducted.
* Penalty reversed.

This will be useful for debugging and resolving disputes.

---

# 35. ERROR HANDLING

Every major action must have:

* Loading state
* Success state
* Error state
* Empty state

Use user-friendly error messages.

Do not expose raw database errors to users.

---

# 36. FORM VALIDATION

All forms must have proper validation.

Validate:

* Required fields
* File types
* File size
* Dates
* Points
* User permissions
* Duplicate actions

Use client-side validation for UX and server-side validation for security.

---

# 37. FILE UPLOAD SECURITY

Implement:

* File type validation
* File size limits
* Secure storage
* Authorization checks
* Safe filenames
* Upload error handling

Never trust the file extension alone.

---

# 38. PERFORMANCE

Optimize:

* Database queries
* Images
* File loading
* Dashboard queries
* Leaderboard queries
* Pagination
* Search

Avoid unnecessary API calls.

Use pagination for large lists.

Do not load every task/member/submission at once.

---

# 39. ACCESSIBILITY

Follow good accessibility practices:

* Semantic HTML
* Keyboard navigation
* Proper labels
* Sufficient contrast
* Focus states
* Accessible dialogs
* Accessible buttons
* Screen-reader-friendly structure

---

# 40. SEED DATA

Create realistic development seed data.

Example:

Domains:

Design

Tech

Media

Content

Social Media

Marketing

Events

Create:

* Several members
* Several events
* Several tasks
* Different task statuses
* Sample submissions
* Point transactions
* Notifications

Do not use fake data in production.

---

# 41. ADMIN TEST ACCOUNT

Create a development-only admin account mechanism if the existing authentication system supports it.

Do not hard-code production credentials.

Use environment variables or proper seed scripts.

---

# 42. ENVIRONMENT VARIABLES

Inspect existing environment configuration.

If variables are missing, create/update:

.env.example

Do NOT expose secrets in frontend code.

Never commit:

* Service role keys
* Private API keys
* Database passwords
* OTP provider secrets

---

# 43. SECURITY CHECK

Before considering the application complete, test:

* Unauthorized routes
* Unauthorized API requests
* Role escalation
* Point manipulation
* Duplicate submissions
* Duplicate approvals
* Duplicate penalties
* File access
* Task race conditions
* Session handling

---

# 44. UX DETAILS

Use clear status colors and labels.

Example:

AVAILABLE

CLAIMED

IN PROGRESS

SUBMITTED

UNDER REVIEW

APPROVED

REJECTED

MISSED

Do not rely only on color.

Use icons/text as well.

Use confirmation dialogs for destructive actions.

---

# 45. EMPTY STATES

Every list should have a useful empty state.

Example:

No active tasks.

"You're all caught up! Check upcoming events for new tasks."

No notifications.

"You're all caught up."

No submissions.

"No submissions yet."

---

# 46. LOADING STATES

Use skeleton loaders rather than blank screens.

Important pages:

* Dashboard
* Tasks
* Events
* Leaderboard
* Admin dashboard
* Submission review
* User management

---

# 47. MOBILE TASK SUBMISSION

Make mobile submission extremely simple.

Flow:

Open Task

↓

View instructions

↓

Take Task

↓

Complete Work

↓

Upload File

↓

Add Comment

↓

Submit

↓

Success

This should require minimal interaction.

---

# 48. IMPLEMENTATION PRIORITY

Build in this order:

PHASE 1

Authentication

↓

User profiles

↓

Database schema

↓

Role-based permissions

PHASE 2

Domains

↓

Events

↓

Tasks

PHASE 3

Task claiming

↓

Task submission

↓

File storage

PHASE 4

Review system

↓

Approval/rejection

↓

Points

↓

Penalty system

PHASE 5

Leaderboard

↓

Notifications

↓

Achievements

PHASE 6

Admin dashboard

↓

Analytics

↓

Search/filtering

PHASE 7

PWA

↓

Performance

↓

Security audit

↓

Final polish

---

# 49. DO NOT CHEAT

Do NOT:

* Create fake buttons.
* Create non-functional forms.
* Hard-code task data.
* Hard-code leaderboard data.
* Fake authentication.
* Fake file uploads.
* Fake point calculations.
* Use localStorage as the primary database.
* Hide unfinished features behind buttons.
* Leave TODO placeholders for core functionality.
* Create mock API responses instead of real backend functionality.

Every visible core feature should actually work.

If a feature cannot be implemented because a required external service is unavailable, clearly isolate it and provide a proper integration point.

---

# 50. CODE QUALITY

Use:

* TypeScript
* Reusable components
* Clear naming
* Modular files
* Proper error handling
* Server-side authorization
* Database constraints
* Clean API/data access patterns

Avoid:

* Giant components
* Duplicate code
* Unnecessary dependencies
* Hard-coded business logic
* Hard-coded user IDs
* Hard-coded points
* Hard-coded permissions

---

# 51. FINAL TESTING

Before declaring the application complete, test the complete flow as different users.

## Member

Login

↓

View dashboard

↓

View domain

↓

View event

↓

Take task

↓

Submit task

↓

View status

↓

Receive points after approval

↓

View leaderboard

---

## Domain Head

Login

↓

View domain

↓

Create task

↓

View submissions

↓

Approve/reject

↓

View domain statistics

---

## Admin

Login

↓

View dashboard

↓

Manage users

↓

Manage domains

↓

Manage events

↓

Manage tasks

↓

Manage submissions

↓

Manage points

↓

View analytics

---

# 52. FINAL REQUIREMENT

Do not stop after implementing only the frontend.

The final application must have:

Frontend

*

Backend

*

Database

*

Authentication

*

Storage

*

Authorization

*

Task workflow

*

Submission workflow

*

Point system

*

Leaderboard

*

Admin system

*

Responsive UI

*

PWA support

---

# 53. FINAL DELIVERABLE

When implementation is complete:

1. Ensure the application builds successfully.
2. Fix TypeScript errors.
3. Fix lint errors.
4. Fix runtime errors.
5. Test all primary user flows.
6. Test mobile responsiveness.
7. Verify database operations.
8. Verify authentication.
9. Verify authorization.
10. Verify file uploads.
11. Verify point calculations.
12. Verify missed-task penalties.
13. Verify leaderboard calculations.
14. Verify admin functionality.
15. Remove unnecessary mock data.
16. Remove debug logs.
17. Ensure no secrets are exposed.
18. Ensure the project can be started using the documented commands.

Finally provide a concise implementation summary containing:

* What was implemented.
* Files/components created or modified.
* Database changes.
* Environment variables required.
* Commands to run the project.
* Any remaining external configuration required.
* Any known limitations.

Do not claim a feature is complete unless it is actually functional.
