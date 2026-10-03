# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## Product Name

**Epoch Hub**

### Product Tagline

**One Club. One Community. One Place to Get Things Done.**

---

# 1. PRODUCT OVERVIEW

Epoch Hub is an internal web-based community and task management platform for Epoch Society.

The platform will organize the club into multiple domains such as:

* Design
* Tech
* Content
* Social Media
* Media
* Marketing
* Events
* Operations

Each domain will have its own members and responsibilities.

For every club event, administrators or domain heads can create tasks and assign them to specific domains. Members can view available tasks, take ownership of tasks, complete them, and submit their work through the platform.

Once a task is reviewed and approved, the member receives points.

The platform will also include a leaderboard, activity tracking, achievements, notifications, and member profiles to encourage participation and create a gamified club environment.

---

# 2. PROBLEM STATEMENT

Currently, club activities and tasks may be managed using multiple disconnected platforms such as:

* WhatsApp
* Google Drive
* Google Sheets
* Personal messages
* Forms

This creates several problems:

* Difficulty tracking who is working on a task.
* Difficulty knowing which tasks are completed.
* Difficulty tracking member contribution.
* No centralized storage for task submissions.
* No proper point or performance tracking.
* Difficulty monitoring event progress.
* Members may forget deadlines.
* Domain heads have limited visibility into their domain's workload.
* Club leadership cannot easily measure participation.

Epoch Hub will centralize all of these activities into one platform.

---

# 3. PRODUCT OBJECTIVES

The main objectives are:

1. Centralize club tasks and events.
2. Organize members according to domains.
3. Allow members to claim available tasks.
4. Allow members to submit completed work.
5. Allow domain heads/admins to review submissions.
6. Automatically award points after approval.
7. Deduct points for missed tasks according to the club's rules.
8. Provide a transparent leaderboard.
9. Track individual and domain performance.
10. Store task outputs securely.
11. Provide an easy mobile-friendly experience.
12. Reduce dependence on WhatsApp and spreadsheets for task tracking.

---

# 4. TARGET USERS

The platform will have four primary user roles.

## 4.1 Super Admin

The Super Admin will generally be the club's core leadership.

Permissions:

* Manage all users.
* Create and manage domains.
* Create and manage events.
* Create and manage tasks.
* Assign tasks.
* View all submissions.
* Approve or reject submissions.
* Manage points.
* View all analytics.
* Manage leaderboard settings.
* Manage deadlines.
* Manage domain heads.
* Manage platform settings.

---

## 4.2 Domain Head

Each domain can have one or more domain heads.

Example:

Tech Domain

* Domain Head: Member A
* Members: 15

Permissions:

* View their domain.
* View domain members.
* Create domain tasks.
* Assign tasks.
* Review submissions.
* Approve/reject submissions.
* View domain performance.
* View domain task progress.
* Manage tasks belonging to their domain.

Domain heads should not be able to modify unrelated domains unless given additional permissions by an admin.

---

## 4.3 Domain Member

Regular club members.

Permissions:

* View their domain.
* View events.
* View available tasks.
* Take available tasks.
* Work on assigned tasks.
* Submit completed work.
* View task status.
* View points.
* View point history.
* View leaderboard.
* View their profile.
* View achievements.

Members should not be able to modify their own points or approve their own submissions.

---

## 4.4 Reviewer

Optional role for larger clubs.

Permissions:

* View submitted tasks.
* Review task outputs.
* Approve submissions.
* Reject submissions.
* Add review comments.

---

# 5. AUTHENTICATION

The platform will use mobile-number-based authentication.

## Login Flow

1. User enters mobile number.
2. System sends OTP.
3. User enters OTP.
4. System verifies OTP.
5. User is authenticated.
6. User is redirected to their dashboard.

Example:

Mobile Number:

+91 XXXXX XXXXX

[Send OTP]

↓

Enter OTP

[Verify OTP]

No password should be required for the initial version.

---

# 6. USER PROFILE

Every member will have a profile.

Profile information:

* Name
* Profile photo
* Mobile number
* Domain
* Role
* Position
* Joining date
* Total points
* Current rank
* Tasks completed
* Tasks pending
* Tasks rejected
* Events participated in
* Achievements

Example:

Member:

Mohammed Rehan

Domain:

Tech

Points:

127

Tasks Completed:

34

Tasks Pending:

3

Current Rank:

#4

---

# 7. MAIN NAVIGATION

The platform should have the following primary navigation:

* Home
* Domains
* Events
* Tasks
* Leaderboard
* Profile

For administrators:

* Admin Dashboard
* Users
* Domains
* Events
* Tasks
* Submissions
* Points
* Analytics
* Settings

---

# 8. DASHBOARD

After login, users should be redirected to their personalized dashboard.

The dashboard should display:

* Welcome message.
* Current points.
* Current rank.
* Completed tasks.
* Pending tasks.
* Upcoming deadlines.
* Active events.
* Recent activity.
* Recent notifications.
* Leaderboard preview.

Example:

Good Morning, Rehan 👋

127 Points

Rank #4

34 Completed

3 Pending

Upcoming Event:

Tech Fest 2026

Active Tasks:

* Event Poster — +10 Points
* Registration Website — +20 Points
* Social Media Banner — +5 Points

---

# 9. DOMAIN SYSTEM

The club will be divided into multiple domains.

Example domains:

* Design
* Tech
* Content
* Social Media
* Media
* Marketing
* Events
* Operations

Each domain will contain:

* Domain name
* Description
* Domain head
* Members
* Active tasks
* Completed tasks
* Events
* Domain performance

---

# 10. DOMAIN PAGE

Each domain should have its own page.

Example:

TECH DOMAIN

Domain Head:

Member Name

Members:

18

Active Tasks:

14

Completed Tasks:

32

Upcoming Events:

Tech Fest 2026

The page should display:

* Domain information.
* Domain members.
* Active tasks.
* Completed tasks.
* Domain events.
* Domain leaderboard.
* Domain performance.

---

# 11. EVENT SYSTEM

Events are the primary organizational unit for club activities.

Examples:

* Freshers 2026
* Tech Fest
* Hackathon
* Workshop
* Recruitment Drive
* Annual Fest

Every event can contain tasks from multiple domains.

Example:

TECH FEST 2026

Design Tasks: 12

Tech Tasks: 15

Media Tasks: 10

Content Tasks: 7

Social Media Tasks: 8

---

# 12. EVENT DETAILS

Every event should contain:

* Event name
* Description
* Start date
* End date
* Event status
* Participating domains
* Tasks
* Progress
* Event timeline
* Event files
* Event announcements

Event statuses:

* Draft
* Upcoming
* Active
* Completed
* Archived

---

# 13. TASK SYSTEM

Tasks are the core functionality of the platform.

Each task should contain:

* Task ID
* Task title
* Description
* Event
* Domain
* Created by
* Assigned member
* Deadline
* Priority
* Points
* Status
* Submission
* Reviewer
* Review comments
* Created date
* Completed date

---

# 14. TASK STATUS

The task lifecycle should be:

AVAILABLE

↓

CLAIMED

↓

IN PROGRESS

↓

SUBMITTED

↓

UNDER REVIEW

↓

APPROVED

OR

REJECTED

If rejected:

REJECTED

↓

RESUBMIT

↓

UNDER REVIEW

---

# 15. TAKING A TASK

Members should be able to claim an available task.

Example:

Task:

Create Event Poster

Event:

Tech Fest 2026

Domain:

Design

Reward:

+10 Points

Deadline:

October 10

Action:

[Take Task]

When a member takes the task, the task should become unavailable to other members.

Only the assigned member, domain head, or administrator can release or reassign the task.

---

# 16. TASK SUBMISSION

Members should be able to submit completed work.

Supported file types should include:

* PDF
* DOCX
* PPTX
* XLSX
* PNG
* JPG
* ZIP
* MP4
* Other approved formats

Submission should contain:

* File
* Optional comment
* Submission timestamp

Example:

Task:

Create Event Poster

Upload:

poster-final.pdf

Comment:

"Final version with updated event information."

[Submit Task]

---

# 17. TASK REVIEW

Once submitted, the task enters:

UNDER REVIEW

The domain head or reviewer can view:

* Task details
* Member
* Submission
* Uploaded files
* Submission comments
* Previous submissions

Actions:

[Approve]

[Reject]

If rejected, a rejection reason must be provided.

Example:

"Please correct the event date and replace the old logo."

The member can then make changes and resubmit.

---

# 18. POINT SYSTEM

Every task will have a predefined point value.

Example:

| Task Type      | Points |
| -------------- | -----: |
| Small Task     |     +2 |
| Normal Task    |     +5 |
| Important Task |    +10 |
| Major Task     |    +20 |
| Critical Task  |    +30 |

Points should only be awarded after the task has been approved.

The frontend must never directly modify a user's points.

Points must be controlled by backend/database logic.

---

# 19. MISSED TASK PENALTY

If a member takes responsibility for a task but fails to complete it before the deadline, the system can apply the club's missed-task penalty.

Default rule:

Missed task:

-1 Point

The penalty should only be applied once per missed task.

Example:

Task deadline passes.

Task status:

IN PROGRESS

↓

System identifies task as incomplete.

↓

Point transaction:

-1 Point

↓

Task becomes:

MISSED

The system must not repeatedly deduct points for the same task.

Administrators should be able to override or reverse penalties when necessary.

---

# 20. POINT TRANSACTION HISTORY

Every point change must be recorded.

Example:

+10

Event Poster Approved

Tech Fest 2026

+5

Registration Form Completed

Workshop 2026

-1

Missed Social Media Task

Recruitment Drive

This provides transparency and prevents disputes.

---

# 21. LEADERBOARD

The platform should have a club-wide leaderboard.

Example:

1. Member A — 220 Points
2. Member B — 198 Points
3. Member C — 180 Points
4. Rehan — 165 Points
5. Member E — 152 Points

Leaderboard filters:

* Overall
* This Month
* This Semester
* This Event
* My Domain

---

# 22. DOMAIN LEADERBOARD

Each domain should also have its own leaderboard.

Example:

TECH DOMAIN

1. Member A — 180
2. Rehan — 165
3. Member B — 142
4. Member C — 120

---

# 23. ACHIEVEMENTS

The platform can include achievements and badges.

Example badges:

## First Task

Completed your first task.

## 10 Tasks

Completed 10 tasks.

## Fast Executor

Completed multiple tasks before their deadlines.

## Top Contributor

Highest contribution during an event.

## Perfect Event

Completed all assigned tasks for an event.

## Domain Champion

Top contributor within a domain.

---

# 24. NOTIFICATIONS

Users should receive notifications for important activities.

Notification types:

### New Task

"New task available in Tech Domain."

### Task Claimed

"You successfully claimed Event Website."

### Deadline Reminder

"Your Event Poster task is due tomorrow."

### Submission Approved

"Your submission was approved. +10 points."

### Submission Rejected

"Your submission requires changes."

### Missed Deadline

"Your task deadline has passed. -1 point."

Initially, notifications can be implemented as in-app notifications.

Push notifications and WhatsApp notifications can be added later.

---

# 25. ADMIN DASHBOARD

The admin dashboard should provide an overview of the entire club.

Metrics:

* Total Members
* Total Domains
* Active Events
* Active Tasks
* Completed Tasks
* Pending Tasks
* Pending Reviews
* Total Points Distributed
* Missed Tasks

Example:

Total Members: 87

Domains: 7

Active Events: 4

Active Tasks: 62

Pending Reviews: 14

---

# 26. DOMAIN PERFORMANCE

Administrators should be able to compare domain activity.

Metrics:

* Total tasks
* Completed tasks
* Pending tasks
* Missed tasks
* Completion percentage
* Total points earned
* Average completion time

Example:

Tech — 86% completion

Design — 91% completion

Media — 74% completion

Content — 88% completion

---

# 27. ADMIN EVENT MANAGEMENT

Admins should be able to:

* Create events.
* Edit events.
* Delete/archive events.
* Add domains.
* Create tasks.
* Set deadlines.
* Set task points.
* Assign tasks.
* Monitor progress.
* View submissions.
* Close events.

Event creation flow:

Create Event

↓

Add Event Details

↓

Select Domains

↓

Create Tasks

↓

Set Points

↓

Set Deadlines

↓

Publish Event

---

# 28. TASK CREATION

Task creation form:

Task Name

Description

Event

Domain

Points

Deadline

Priority

Optional Attachment

Task creation actions:

[Create Task]

[Save Draft]

---

# 29. SEARCH AND FILTERING

Users should be able to search and filter tasks.

Search by:

* Task name
* Event
* Domain
* Member

Filters:

* Available
* In Progress
* Submitted
* Approved
* Rejected
* Missed
* Completed

Additional filters:

* Priority
* Deadline
* Points

---

# 30. FILE STORAGE

Uploaded files should not be stored directly inside the database.

The database should store metadata such as:

* File ID
* Task ID
* User ID
* File name
* File URL
* File type
* File size
* Uploaded timestamp

Actual files should be stored in secure object storage.

---

# 31. SECURITY

The system must implement role-based access control.

Members cannot:

* Modify their points.
* Approve their own submissions.
* Modify other users.
* Modify domain settings.
* Change task points.
* Access admin functionality.

Domain heads cannot:

* Modify unrelated domains.
* Approve unauthorized tasks outside their domain.

Admins can access the complete system.

---

# 32. DATABASE STRUCTURE

Recommended core tables:

* users
* domains
* domain_members
* events
* tasks
* task_assignments
* submissions
* point_transactions
* notifications
* achievements
* user_achievements

---

## Users

Fields:

* id
* name
* phone
* profile_image
* role
* domain_id
* created_at

---

## Domains

Fields:

* id
* name
* description
* head_id
* created_at

---

## Events

Fields:

* id
* name
* description
* start_date
* end_date
* status
* created_by
* created_at

---

## Tasks

Fields:

* id
* event_id
* domain_id
* title
* description
* points
* deadline
* priority
* status
* created_by
* created_at

---

## Task Assignments

Fields:

* id
* task_id
* user_id
* assigned_at
* status

---

## Submissions

Fields:

* id
* task_id
* user_id
* file_url
* file_name
* comment
* status
* reviewer_id
* review_comment
* submitted_at
* reviewed_at

---

## Point Transactions

Fields:

* id
* user_id
* points
* transaction_type
* reason
* task_id
* event_id
* created_at

---

# 33. RECOMMENDED TECH STACK

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

## Backend

Recommended V1 architecture:

* Supabase
* PostgreSQL
* Supabase Auth
* Supabase Storage
* Supabase Realtime

Architecture:

Frontend

↓

Supabase

├── Authentication

├── PostgreSQL Database

├── Storage

└── Realtime

This architecture should be sufficient for the first version.

---

# 34. RESPONSIVE DESIGN

The platform should be mobile-first.

The majority of members will likely access the system through smartphones.

The interface must work properly on:

* Mobile
* Tablet
* Laptop
* Desktop

The mobile navigation should contain:

Home

Tasks

Events

Leaderboard

Profile

---

# 35. PWA SUPPORT

Epoch Hub should be developed as a Progressive Web App.

Users should be able to:

* Install the website.
* Add it to their home screen.
* Open it like an application.
* Receive push notifications in future versions.
* Use cached pages where appropriate.

No separate mobile application is required for V1.

---

# 36. CORE USER FLOW

The primary workflow is:

Admin creates event.

↓

Admin/domain head creates task.

↓

Task appears in the appropriate domain.

↓

Member views task.

↓

Member takes task.

↓

Member completes task.

↓

Member uploads output.

↓

Submission enters review.

↓

Domain head/reviewer reviews submission.

↓

If approved:

Member receives points.

↓

Leaderboard updates.

If rejected:

Member receives feedback.

↓

Member resubmits.

---

# 37. MISSED TASK FLOW

Task is assigned.

↓

Deadline approaches.

↓

System sends reminder.

↓

Deadline passes.

↓

System checks task status.

↓

If task is incomplete:

Task marked as MISSED.

↓

Member receives -1 point.

↓

Point transaction is recorded.

---

# 38. V1 MVP

The first version should include only the essential functionality.

### Authentication

* Mobile number login.
* OTP verification.
* User profiles.

### Domains

* Domain listing.
* Domain members.
* Domain heads.

### Events

* Create event.
* View event.
* Event progress.

### Tasks

* Create task.
* View task.
* Take task.
* Submit task.
* Upload files.
* Task deadlines.

### Review

* Approve submission.
* Reject submission.
* Review comments.
* Resubmission.

### Points

* Award points.
* Missed-task penalty.
* Point history.

### Leaderboard

* Overall leaderboard.
* Domain leaderboard.
* Event leaderboard.

### Administration

* User management.
* Domain management.
* Event management.
* Task management.
* Submission management.

---

# 39. V2 FEATURES

After the MVP is stable, add:

* Push notifications.
* WhatsApp notifications.
* Achievements.
* Badges.
* Streaks.
* Calendar.
* Advanced analytics.
* Activity feed.
* Task comments.
* @mentions.
* Event announcements.
* Central event file storage.
* Member performance graphs.

---

# 40. V3 — COMPLETE CLUB OPERATING SYSTEM

Future versions can expand Epoch Hub into a complete internal operating system for the club.

Major modules:

### People

* Members
* Domains
* Roles
* Profiles

### Work

* Tasks
* Projects
* Submissions
* Points

### Events

* Events
* Calendar
* Attendance
* Registration

### Community

* Announcements
* Activity feed
* Achievements
* Leaderboard

---

# 41. SUCCESS METRICS

The platform should measure:

* Number of active members.
* Daily/weekly active members.
* Tasks created.
* Tasks claimed.
* Tasks completed.
* Task completion rate.
* Missed task rate.
* Average task completion time.
* Number of submissions.
* Approval rate.
* Domain participation.
* Event participation.
* Average points per member.

---

# 42. NON-FUNCTIONAL REQUIREMENTS

## Performance

Pages should load quickly and remain responsive even as the number of members and tasks increases.

## Security

All authentication, database access and file access must follow appropriate access-control rules.

## Scalability

The architecture should support the club growing from dozens of members to hundreds of members.

## Reliability

Point calculations and task status changes must be transactionally safe and auditable.

## Usability

The platform should be simple enough that a new member can understand how to use it without training.

## Responsive Design

All major functionality must work on mobile devices.

---

# 43. DESIGN DIRECTION

The interface should feel like a modern internal community platform rather than a traditional college management system.

Design characteristics:

* Modern
* Clean
* Professional
* Minimal
* Fast
* Mobile-first
* Community-oriented
* Gamified

The platform should use:

* Cards
* Progress indicators
* Status badges
* Avatars
* Leaderboards
* Task cards
* Activity feeds
* Clean dashboards

The UI should maintain consistent spacing, typography, colors, and components throughout the application.

---

# 44. CORE PRODUCT LOOP

The most important product loop is:

DISCOVER TASK

↓

TAKE TASK

↓

COMPLETE TASK

↓

SUBMIT OUTPUT

↓

GET APPROVED

↓

EARN POINTS

↓

MOVE UP LEADERBOARD

↓

TAKE MORE TASKS

This loop should be extremely easy and fast for members.

---

# 45. FINAL PRODUCT STRUCTURE

Epoch Hub should ultimately follow this structure:

CLUB

├── Dashboard

├── Domains

│   ├── Design

│   ├── Tech

│   ├── Content

│   ├── Social Media

│   ├── Media

│   ├── Marketing

│   └── Operations

├── Events

│   ├── Event 1

│   │   ├── Design Tasks

│   │   ├── Tech Tasks

│   │   ├── Media Tasks

│   │   └── Content Tasks

│   │
│   └── Event 2

├── Tasks

├── Submissions

├── Leaderboard

├── Achievements

├── Notifications

└── Profile

ADMIN

├── Dashboard

├── Users

├── Domains

├── Events

├── Tasks

├── Submissions

├── Points

├── Analytics

└── Settings

---

# 46. MVP DEFINITION OF DONE

The MVP will be considered complete when:

1. A member can log in using their mobile number.
2. Admin can create domains.
3. Admin can add members to domains.
4. Admin can create events.
5. Admin/domain heads can create tasks.
6. Members can view available tasks.
7. Members can claim tasks.
8. Members can upload task outputs.
9. Domain heads/admins can review submissions.
10. Approved submissions automatically award points.
11. Missed tasks automatically generate the defined penalty.
12. Members can see their point history.
13. Members can see their leaderboard ranking.
14. Admins can see overall event/task progress.
15. Uploaded files are securely stored.
16. Role-based access control works correctly.
17. The application works properly on mobile and desktop.
18. The website can be installed as a PWA.

---

# 47. LONG-TERM VISION

Epoch Hub should become the central digital platform through which the entire club operates.

Instead of:

WhatsApp + Google Sheets + Google Drive + Forms + Manual Tracking

the club should eventually use:

**Epoch Hub**

for:

* Members
* Domains
* Events
* Tasks
* Submissions
* Points
* Leaderboards
* Announcements
* Performance
* Community

The ultimate goal is to create a system where every member knows:

**What needs to be done → Who is doing it → When it is due → Where to submit it → Who approved it → How many points it earned.**
