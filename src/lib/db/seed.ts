import { DatabaseSync } from 'node:sqlite';

export function runSeed(db: DatabaseSync) {
  // Check if users already exist
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (existingUsers && existingUsers.count > 0) {
    return; // Already seeded
  }

  const now = new Date();
  const isoNow = now.toISOString();
  
  // Helper for dates relative to now
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();
  const daysFromNow = (d: number) => new Date(now.getTime() + d * 86400000).toISOString();

  // 1. DOMAINS
  const domains = [
    { id: 'dom-tech', name: 'Tech', description: 'Web development, mobile apps, devops, and infrastructure for Epoch.', icon: 'Code' },
    { id: 'dom-design', name: 'Design', description: 'UI/UX design, visual branding, 3D assets, posters and merchandise.', icon: 'Palette' },
    { id: 'dom-media', name: 'Media', description: 'Videography, photography, teaser videos, and post-production reels.', icon: 'Video' },
    { id: 'dom-content', name: 'Content', description: 'Technical blogs, copywriting, speech writing, and event documentation.', icon: 'FileText' },
    { id: 'dom-social', name: 'Social Media', description: 'Instagram, LinkedIn, X content strategy, and community engagement.', icon: 'Share2' },
    { id: 'dom-marketing', name: 'Marketing', description: 'Sponsorship outreach, PR, campaigns, and audience acquisition.', icon: 'Megaphone' },
    { id: 'dom-events', name: 'Events', description: 'Event logistics, stage management, scheduling, and volunteer dispatch.', icon: 'Calendar' },
    { id: 'dom-operations', name: 'Operations', description: 'Budgeting, vendor coordination, permissions, and supplies.', icon: 'Settings' }
  ];

  for (const d of domains) {
    db.prepare('INSERT INTO domains (id, name, description, icon, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(d.id, d.name, d.description, d.icon, daysAgo(60));
  }

  // 2. USERS
  const users = [
    {
      id: 'usr-admin-1',
      name: 'Mohammed Rehan',
      phone: '+919876543210',
      profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      role: 'super_admin',
      domain_id: 'dom-tech',
      position: 'Club President & Lead Architect',
      join_date: '2024-08-01',
      is_active: 1
    },
    {
      id: 'usr-head-tech',
      name: 'Sarah Jenkins',
      phone: '+919876543211',
      profile_image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      role: 'domain_head',
      domain_id: 'dom-tech',
      position: 'Head of Tech Domain',
      join_date: '2024-09-15',
      is_active: 1
    },
    {
      id: 'usr-head-design',
      name: 'Rohan Sharma',
      phone: '+919876543215',
      profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      role: 'domain_head',
      domain_id: 'dom-design',
      position: 'Head of Design Domain',
      join_date: '2024-09-15',
      is_active: 1
    },
    {
      id: 'usr-head-media',
      name: 'Ananya Patel',
      phone: '+919876543216',
      profile_image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      role: 'domain_head',
      domain_id: 'dom-media',
      position: 'Head of Media Domain',
      join_date: '2024-10-01',
      is_active: 1
    },
    {
      id: 'usr-mem-alex',
      name: 'Alex Turner',
      phone: '+919876543212',
      profile_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      role: 'member',
      domain_id: 'dom-tech',
      position: 'Fullstack Developer',
      join_date: '2025-01-10',
      is_active: 1
    },
    {
      id: 'usr-mem-priya',
      name: 'Priya Nair',
      phone: '+919876543213',
      profile_image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      role: 'member',
      domain_id: 'dom-design',
      position: 'Brand & Graphic Designer',
      join_date: '2025-01-15',
      is_active: 1
    },
    {
      id: 'usr-mem-kevin',
      name: 'Kevin Vance',
      phone: '+919876543217',
      profile_image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
      role: 'member',
      domain_id: 'dom-content',
      position: 'Editorial Lead',
      join_date: '2025-02-01',
      is_active: 1
    },
    {
      id: 'usr-rev-dev',
      name: 'Dev Mehta',
      phone: '+919876543214',
      profile_image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      role: 'reviewer',
      domain_id: 'dom-tech',
      position: 'Senior Quality Reviewer',
      join_date: '2024-08-15',
      is_active: 1
    }
  ];

  for (const u of users) {
    db.prepare(`
      INSERT INTO users (id, name, phone, profile_image, role, domain_id, position, join_date, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(u.id, u.name, u.phone, u.profile_image, u.role, u.domain_id, u.position, u.join_date, u.is_active, daysAgo(50), isoNow);
  }

  // Assign Domain Heads
  db.prepare('UPDATE domains SET head_id = ? WHERE id = ?').run('usr-head-tech', 'dom-tech');
  db.prepare('UPDATE domains SET head_id = ? WHERE id = ?').run('usr-head-design', 'dom-design');
  db.prepare('UPDATE domains SET head_id = ? WHERE id = ?').run('usr-head-media', 'dom-media');

  // 3. EVENTS
  const events = [
    {
      id: 'evt-techfest-2026',
      name: 'Tech Fest 2026',
      description: 'The premier technical festival of Epoch featuring hackathons, workshops, AI showcases, and guest speaker keynotes.',
      start_date: daysFromNow(5),
      end_date: daysFromNow(12),
      status: 'Active',
      cover_image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      created_by: 'usr-admin-1',
      domains: ['dom-tech', 'dom-design', 'dom-media', 'dom-content', 'dom-social', 'dom-events']
    },
    {
      id: 'evt-hackepoch',
      name: 'HackEpoch National Hackathon',
      description: 'A 36-hour nationwide sprint to build decentralized and AI-first solutions for campus and real-world challenges.',
      start_date: daysFromNow(20),
      end_date: daysFromNow(22),
      status: 'Active',
      cover_image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
      created_by: 'usr-admin-1',
      domains: ['dom-tech', 'dom-design', 'dom-marketing', 'dom-operations']
    },
    {
      id: 'evt-freshers-2026',
      name: 'Freshers Orientation & Induction',
      description: 'Welcoming the incoming 2026 batch into Epoch Society with live domain demonstrations and interactive stalls.',
      start_date: daysFromNow(30),
      end_date: daysFromNow(32),
      status: 'Upcoming',
      cover_image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800',
      created_by: 'usr-admin-1',
      domains: ['dom-events', 'dom-media', 'dom-design', 'dom-social']
    },
    {
      id: 'evt-design-sprint',
      name: 'Winter Design Sprint',
      description: 'Intensive UI/UX sprint creating the complete design tokens and component guidelines for Epoch 3.0.',
      start_date: daysAgo(25),
      end_date: daysAgo(10),
      status: 'Completed',
      cover_image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800',
      created_by: 'usr-head-design',
      domains: ['dom-design', 'dom-tech']
    }
  ];

  for (const e of events) {
    db.prepare(`
      INSERT INTO events (id, name, description, start_date, end_date, status, cover_image, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(e.id, e.name, e.description, e.start_date, e.end_date, e.status, e.cover_image, e.created_by, daysAgo(20), isoNow);

    for (const dId of e.domains) {
      db.prepare('INSERT INTO event_domains (event_id, domain_id) VALUES (?, ?)').run(e.id, dId);
    }
  }

  // 4. ACHIEVEMENTS
  const achievements = [
    { code: 'FIRST_TASK', title: 'First Step', description: 'Successfully completed and had your first club task approved.', icon: 'Award', points: 5 },
    { code: 'TEN_TASKS', title: 'Decathlon Achiever', description: 'Completed 10 tasks across Epoch club initiatives.', icon: 'CheckCircle2', points: 25 },
    { code: 'FAST_EXECUTOR', title: 'Speed Demon', description: 'Submitted a task output well in advance of the deadline.', icon: 'Zap', points: 10 },
    { code: 'TOP_CONTRIBUTOR', title: 'MVP Contributor', description: 'Achieved highest contribution score during a flagship event.', icon: 'Crown', points: 30 },
    { code: 'PERFECT_EVENT', title: 'Flawless Execution', description: 'Finished all claimed tasks in an event with 0 rejections.', icon: 'ShieldCheck', points: 20 },
    { code: 'DOMAIN_CHAMPION', title: 'Domain Champion', description: 'Ranked #1 on your domain leaderboard.', icon: 'Trophy', points: 25 }
  ];

  for (const a of achievements) {
    db.prepare('INSERT INTO achievements (id, code, title, description, icon, points_reward, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(`ach-${a.code.toLowerCase()}`, a.code, a.title, a.description, a.icon, a.points, daysAgo(40));
  }

  // 5. TASKS
  const tasks = [
    // Tech Fest 2026 - Tech Tasks
    {
      id: 'tsk-001',
      event_id: 'evt-techfest-2026',
      domain_id: 'dom-tech',
      title: 'Build Live Countdown & Schedule Micro-site',
      description: 'Develop a responsive single-page schedule with real-time countdown timer, venue map, and talk filter for Tech Fest 2026.',
      points: 20,
      priority: 'HIGH',
      deadline: daysFromNow(3),
      status: 'AVAILABLE',
      created_by: 'usr-head-tech',
      assigned_member_id: null,
      completed_at: null
    },
    {
      id: 'tsk-002',
      event_id: 'evt-techfest-2026',
      domain_id: 'dom-tech',
      title: 'QR Code Ticket Check-in Scanner API',
      description: 'Create an internal API and mobile scanner view to validate attendee tickets at entry gates.',
      points: 15,
      priority: 'HIGH',
      deadline: daysFromNow(4),
      status: 'CLAIMED',
      created_by: 'usr-head-tech',
      assigned_member_id: 'usr-mem-alex',
      completed_at: null
    },
    {
      id: 'tsk-003',
      event_id: 'evt-techfest-2026',
      domain_id: 'dom-tech',
      title: 'Set Up Automated Cloud Backups & CI/CD',
      description: 'Configure GitHub Actions workflow to run linting, tests, and automated deployment to staging cluster.',
      points: 10,
      priority: 'MEDIUM',
      deadline: daysAgo(1),
      status: 'APPROVED',
      created_by: 'usr-admin-1',
      assigned_member_id: 'usr-mem-alex',
      completed_at: daysAgo(2)
    },

    // Tech Fest 2026 - Design Tasks
    {
      id: 'tsk-004',
      event_id: 'evt-techfest-2026',
      domain_id: 'dom-design',
      title: 'Main Stage 3D Keynote Backdrop',
      description: 'Design high-resolution 4K stage visual backdrop and speaker intro card animations in Figma / Blender.',
      points: 10,
      priority: 'HIGH',
      deadline: daysFromNow(2),
      status: 'AVAILABLE',
      created_by: 'usr-head-design',
      assigned_member_id: null,
      completed_at: null
    },
    {
      id: 'tsk-005',
      event_id: 'evt-techfest-2026',
      domain_id: 'dom-design',
      title: 'Official Tech Fest Poster & Instagram Grid',
      description: 'Create an engaging 9-post Instagram puzzle grid announcing our celebrity keynote speaker and sponsors.',
      points: 10,
      priority: 'URGENT',
      deadline: daysFromNow(1),
      status: 'UNDER_REVIEW',
      created_by: 'usr-head-design',
      assigned_member_id: 'usr-mem-priya',
      completed_at: null
    },
    {
      id: 'tsk-006',
      event_id: 'evt-techfest-2026',
      domain_id: 'dom-design',
      title: 'VIP Attendee Badges & Lanyard Mockup',
      description: 'Vector artwork and print-ready PDF for 500 attendee badges and sponsor lanyards.',
      points: 5,
      priority: 'MEDIUM',
      deadline: daysAgo(4),
      status: 'APPROVED',
      created_by: 'usr-head-design',
      assigned_member_id: 'usr-mem-priya',
      completed_at: daysAgo(5)
    },

    // Media & Content
    {
      id: 'tsk-007',
      event_id: 'evt-techfest-2026',
      domain_id: 'dom-media',
      title: 'Hype Teaser Reel Video (30 seconds)',
      description: 'Cut together past event footage with energetic soundtrack, typography motion graphics, and event date call-to-action.',
      points: 20,
      priority: 'HIGH',
      deadline: daysFromNow(2),
      status: 'AVAILABLE',
      created_by: 'usr-head-media',
      assigned_member_id: null,
      completed_at: null
    },
    {
      id: 'tsk-008',
      event_id: 'evt-techfest-2026',
      domain_id: 'dom-content',
      title: 'Write Sponsorship Brochure Copy',
      description: 'Draft compelling 4-page pitch deck text highlighting club reach, past metrics, and tier sponsor deliverables.',
      points: 10,
      priority: 'MEDIUM',
      deadline: daysAgo(3),
      status: 'REJECTED',
      created_by: 'usr-admin-1',
      assigned_member_id: 'usr-mem-kevin',
      completed_at: null
    },
    {
      id: 'tsk-009',
      event_id: 'evt-techfest-2026',
      domain_id: 'dom-content',
      title: 'Press Release for College Newsletter',
      description: 'Article announcing Tech Fest 2026 partnerships and registration opening date.',
      points: 5,
      priority: 'LOW',
      deadline: daysAgo(2),
      status: 'MISSED',
      created_by: 'usr-admin-1',
      assigned_member_id: 'usr-mem-kevin',
      completed_at: null
    },

    // HackEpoch Tasks
    {
      id: 'tsk-010',
      event_id: 'evt-hackepoch',
      domain_id: 'dom-tech',
      title: 'Project Submission Portal with GitHub Auth',
      description: 'Build hacker team registration and project demo video submission flow.',
      points: 30,
      priority: 'URGENT',
      deadline: daysFromNow(15),
      status: 'AVAILABLE',
      created_by: 'usr-admin-1',
      assigned_member_id: null,
      completed_at: null
    },
    {
      id: 'tsk-011',
      event_id: 'evt-hackepoch',
      domain_id: 'dom-design',
      title: 'HackEpoch Brand Identity & Swag Stickers',
      description: 'Design sticker pack, dark theme brand identity, and hacker pass cards.',
      points: 15,
      priority: 'HIGH',
      deadline: daysFromNow(12),
      status: 'AVAILABLE',
      created_by: 'usr-head-design',
      assigned_member_id: null,
      completed_at: null
    }
  ];

  for (const t of tasks) {
    db.prepare(`
      INSERT INTO tasks (id, event_id, domain_id, title, description, points, priority, deadline, status, created_by, assigned_member_id, created_at, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(t.id, t.event_id, t.domain_id, t.title, t.description, t.points, t.priority, t.deadline, t.status, t.created_by, t.assigned_member_id, daysAgo(10), t.completed_at);

    if (t.assigned_member_id) {
      db.prepare(`
        INSERT INTO task_assignments (id, task_id, user_id, assigned_at, status)
        VALUES (?, ?, ?, ?, ?)
      `).run(`asg-${t.id}`, t.id, t.assigned_member_id, daysAgo(8), 'ACTIVE');
    }
  }

  // 6. SUBMISSIONS
  // Alex's approved submission
  db.prepare(`
    INSERT INTO submissions (id, task_id, user_id, file_url, file_name, file_type, file_size, comment, status, reviewer_id, review_comment, submitted_at, reviewed_at, version)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'sub-001',
    'tsk-003',
    'usr-mem-alex',
    '/api/files/sample-cicd-pipeline.yml',
    'github-ci-cd-workflow.yml',
    'text/yaml',
    2048,
    'Configured multi-stage Docker build and automated staging deploy with secrets verification.',
    'APPROVED',
    'usr-admin-1',
    'Flawless setup! Fast execution and robust secret handling.',
    daysAgo(3),
    daysAgo(2),
    1
  );

  // Priya's approved submission
  db.prepare(`
    INSERT INTO submissions (id, task_id, user_id, file_url, file_name, file_type, file_size, comment, status, reviewer_id, review_comment, submitted_at, reviewed_at, version)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'sub-002',
    'tsk-006',
    'usr-mem-priya',
    '/api/files/sample-badge-mockups.pdf',
    'vip-badges-print-ready.pdf',
    'application/pdf',
    4194304,
    'Vector print files generated with CMYK color profile, 3mm bleed, and double-sided alignment.',
    'APPROVED',
    'usr-head-design',
    'Clean typography and ready for printing. Great job!',
    daysAgo(6),
    daysAgo(5),
    1
  );

  // Priya's pending review submission
  db.prepare(`
    INSERT INTO submissions (id, task_id, user_id, file_url, file_name, file_type, file_size, comment, status, reviewer_id, review_comment, submitted_at, reviewed_at, version)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'sub-003',
    'tsk-005',
    'usr-mem-priya',
    '/api/files/sample-instagram-grid.zip',
    'techfest-instagram-grid-v1.zip',
    'application/zip',
    8388608,
    'All 9 grid tiles exported at 1080x1080px with consistent brand gradient overlays.',
    'UNDER_REVIEW',
    null,
    null,
    daysAgo(1),
    null,
    1
  );

  // Kevin's rejected submission
  db.prepare(`
    INSERT INTO submissions (id, task_id, user_id, file_url, file_name, file_type, file_size, comment, status, reviewer_id, review_comment, submitted_at, reviewed_at, version)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'sub-004',
    'tsk-008',
    'usr-mem-kevin',
    '/api/files/sample-brochure.docx',
    'sponsorship-brochure-draft.docx',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    34567,
    'First draft with sponsor deliverables matrix.',
    'REJECTED',
    'usr-admin-1',
    'Please correct the event date and replace the outdated 2025 club logo with the 2026 brand mark.',
    daysAgo(4),
    daysAgo(3),
    1
  );

  // 7. POINT TRANSACTIONS (LEDGER)
  // Alex: +10 pts for CI/CD setup
  db.prepare(`
    INSERT INTO point_transactions (id, user_id, points, transaction_type, reason, task_id, event_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('pt-001', 'usr-mem-alex', 10, 'TASK_COMPLETION', 'Approved: Set Up Automated Cloud Backups & CI/CD', 'tsk-003', 'evt-techfest-2026', daysAgo(2));

  // Priya: +5 pts for Badges
  db.prepare(`
    INSERT INTO point_transactions (id, user_id, points, transaction_type, reason, task_id, event_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('pt-002', 'usr-mem-priya', 5, 'TASK_COMPLETION', 'Approved: VIP Attendee Badges & Lanyard Mockup', 'tsk-006', 'evt-techfest-2026', daysAgo(5));

  // Priya: +20 pts earlier for Design Sprint
  db.prepare(`
    INSERT INTO point_transactions (id, user_id, points, transaction_type, reason, task_id, event_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('pt-003', 'usr-mem-priya', 20, 'TASK_COMPLETION', 'Approved: Design System Tokens & Specs', null, 'evt-design-sprint', daysAgo(12));

  // Kevin: -1 pt penalty for missed task
  db.prepare(`
    INSERT INTO point_transactions (id, user_id, points, transaction_type, reason, task_id, event_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('pt-004', 'usr-mem-kevin', -1, 'MISSED_TASK_PENALTY', 'Missed Deadline: Press Release for College Newsletter', 'tsk-009', 'evt-techfest-2026', daysAgo(1));

  // Rehan (Super Admin): +30 pts historical
  db.prepare(`
    INSERT INTO point_transactions (id, user_id, points, transaction_type, reason, task_id, event_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('pt-005', 'usr-admin-1', 30, 'BONUS', 'Core Architecture Contribution', null, null, daysAgo(20));

  // Sarah: +25 pts
  db.prepare(`
    INSERT INTO point_transactions (id, user_id, points, transaction_type, reason, task_id, event_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('pt-006', 'usr-head-tech', 25, 'TASK_COMPLETION', 'Approved: Core Server Setup', null, 'evt-techfest-2026', daysAgo(15));

  // Rohan: +22 pts
  db.prepare(`
    INSERT INTO point_transactions (id, user_id, points, transaction_type, reason, task_id, event_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('pt-007', 'usr-head-design', 22, 'TASK_COMPLETION', 'Approved: Epoch 3.0 Brand Guide', null, 'evt-design-sprint', daysAgo(14));

  // 8. USER ACHIEVEMENTS
  db.prepare('INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES (?, ?, ?, ?)')
    .run('uach-001', 'usr-mem-alex', 'ach-first_task', daysAgo(2));
  db.prepare('INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES (?, ?, ?, ?)')
    .run('uach-002', 'usr-mem-priya', 'ach-first_task', daysAgo(12));
  db.prepare('INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES (?, ?, ?, ?)')
    .run('uach-003', 'usr-mem-priya', 'ach-fast_executor', daysAgo(5));

  // 9. NOTIFICATIONS
  const notifications = [
    {
      id: 'notif-001',
      user_id: 'usr-mem-alex',
      type: 'submission_approved',
      title: 'Submission Approved! 🎉',
      message: 'Your submission for "Set Up Automated Cloud Backups & CI/CD" was approved. +10 points awarded!',
      read: 1,
      created_at: daysAgo(2)
    },
    {
      id: 'notif-002',
      user_id: 'usr-mem-priya',
      type: 'submission_approved',
      title: 'Submission Approved! 🎉',
      message: 'Your submission for "VIP Attendee Badges & Lanyard Mockup" was approved. +5 points awarded!',
      read: 0,
      created_at: daysAgo(5)
    },
    {
      id: 'notif-003',
      user_id: 'usr-mem-kevin',
      type: 'task_missed',
      title: 'Missed Deadline Warning ⚠️',
      message: 'Your task "Press Release for College Newsletter" exceeded its deadline. -1 point deducted.',
      read: 0,
      created_at: daysAgo(1)
    },
    {
      id: 'notif-004',
      user_id: 'usr-mem-kevin',
      type: 'submission_rejected',
      title: 'Changes Requested ✏️',
      message: 'Your submission for "Write Sponsorship Brochure Copy" was rejected. Reason: Please update logo & dates.',
      read: 0,
      created_at: daysAgo(3)
    },
    {
      id: 'notif-005',
      user_id: 'usr-head-design',
      type: 'new_task',
      title: 'New Submission for Review 📋',
      message: 'Priya submitted "Official Tech Fest Poster & Instagram Grid" for review.',
      read: 0,
      created_at: daysAgo(1)
    }
  ];

  for (const n of notifications) {
    db.prepare('INSERT INTO notifications (id, user_id, type, title, message, read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(n.id, n.user_id, n.type, n.title, n.message, n.read, n.created_at);
  }

  // 10. ACTIVITY LOGS
  const activityLogs = [
    { user_id: 'usr-admin-1', action: 'EVENT_CREATED', entity_type: 'event', entity_id: 'evt-techfest-2026', metadata: JSON.stringify({ name: 'Tech Fest 2026' }), created_at: daysAgo(20) },
    { user_id: 'usr-head-tech', action: 'TASK_CREATED', entity_type: 'task', entity_id: 'tsk-001', metadata: JSON.stringify({ title: 'Build Live Countdown & Schedule Micro-site' }), created_at: daysAgo(10) },
    { user_id: 'usr-mem-alex', action: 'TASK_CLAIMED', entity_type: 'task', entity_id: 'tsk-002', metadata: JSON.stringify({ title: 'QR Code Ticket Check-in Scanner API' }), created_at: daysAgo(8) },
    { user_id: 'usr-mem-priya', action: 'SUBMISSION_UPLOADED', entity_type: 'submission', entity_id: 'sub-003', metadata: JSON.stringify({ title: 'Official Tech Fest Poster & Instagram Grid' }), created_at: daysAgo(1) },
    { user_id: 'usr-admin-1', action: 'SUBMISSION_APPROVED', entity_type: 'submission', entity_id: 'sub-001', metadata: JSON.stringify({ points: 10 }), created_at: daysAgo(2) }
  ];

  for (let i = 0; i < activityLogs.length; i++) {
    const log = activityLogs[i];
    db.prepare('INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(`act-${i + 1}`, log.user_id, log.action, log.entity_type, log.entity_id, log.metadata, log.created_at);
  }
}
