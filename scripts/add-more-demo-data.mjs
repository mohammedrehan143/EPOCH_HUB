import { getDb, execute, queryOne } from '../src/lib/db/index.ts';

const db = getDb();
console.log('Seeding additional rich demo data into Epoch Hub database...');

const now = new Date();
const isoNow = now.toISOString();
const daysAgo = (d) => new Date(now.getTime() - d * 86400000).toISOString();
const daysFromNow = (d) => new Date(now.getTime() + d * 86400000).toISOString();

// 1. ADDITIONAL MEMBERS
const newMembers = [
  {
    id: 'usr-head-social',
    name: 'Rahul Verma',
    phone: '+919876543218',
    profile_image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    role: 'domain_head',
    domain_id: 'dom-social',
    position: 'Head of Social Media',
    join_date: '2024-11-01'
  },
  {
    id: 'usr-head-mktg',
    name: 'Neha Gupta',
    phone: '+919876543219',
    profile_image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
    role: 'domain_head',
    domain_id: 'dom-marketing',
    position: 'Head of Marketing & PR',
    join_date: '2024-10-15'
  },
  {
    id: 'usr-head-events',
    name: 'Siddharth Rao',
    phone: '+919876543220',
    profile_image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    role: 'domain_head',
    domain_id: 'dom-events',
    position: 'Head of Events & Logistics',
    join_date: '2024-09-20'
  },
  {
    id: 'usr-head-ops',
    name: 'Vikram Joshi',
    phone: '+919876543221',
    profile_image: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150',
    role: 'domain_head',
    domain_id: 'dom-operations',
    position: 'Head of Operations',
    join_date: '2024-09-01'
  },
  {
    id: 'usr-mem-emily',
    name: 'Emily Watson',
    phone: '+919876543222',
    profile_image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    role: 'member',
    domain_id: 'dom-design',
    position: '3D Artist & Motion Designer',
    join_date: '2025-01-20'
  },
  {
    id: 'usr-mem-arjun',
    name: 'Arjun Pillai',
    phone: '+919876543223',
    profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    role: 'member',
    domain_id: 'dom-tech',
    position: 'Mobile App Developer',
    join_date: '2025-02-10'
  },
  {
    id: 'usr-mem-sneha',
    name: 'Sneha Roy',
    phone: '+919876543224',
    profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    role: 'member',
    domain_id: 'dom-media',
    position: 'Video Editor & Colorist',
    join_date: '2025-01-18'
  },
  {
    id: 'usr-mem-tanvi',
    name: 'Tanvi Kulkarni',
    phone: '+919876543225',
    profile_image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    role: 'member',
    domain_id: 'dom-content',
    position: 'Technical Writer',
    join_date: '2025-02-05'
  }
];

for (const m of newMembers) {
  const exists = queryOne('SELECT id FROM users WHERE id = ? OR phone = ?', [m.id, m.phone]);
  if (!exists) {
    db.prepare(`
      INSERT INTO users (id, name, phone, profile_image, role, domain_id, position, join_date, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `).run(m.id, m.name, m.phone, m.profile_image, m.role, m.domain_id, m.position, m.join_date, daysAgo(40), isoNow);
  }
}

// Assign domain heads for the other domains
db.prepare('UPDATE domains SET head_id = ? WHERE id = ?').run('usr-head-social', 'dom-social');
db.prepare('UPDATE domains SET head_id = ? WHERE id = ?').run('usr-head-mktg', 'dom-marketing');
db.prepare('UPDATE domains SET head_id = ? WHERE id = ?').run('usr-head-events', 'dom-events');
db.prepare('UPDATE domains SET head_id = ? WHERE id = ?').run('usr-head-ops', 'dom-operations');

// 2. ADDITIONAL TASKS ACROSS ALL DOMAINS
const additionalTasks = [
  // Social Media
  {
    id: 'tsk-012',
    event_id: 'evt-techfest-2026',
    domain_id: 'dom-social',
    title: 'Instagram Reels Series: Speaker Lineup Reveal',
    description: 'Produce and schedule 3 high-tempo vertical teaser reels introducing our keynote speakers with audio hooks.',
    points: 10,
    priority: 'HIGH',
    deadline: daysFromNow(2),
    status: 'AVAILABLE',
    created_by: 'usr-head-social',
    assigned_member_id: null
  },
  {
    id: 'tsk-013',
    event_id: 'evt-techfest-2026',
    domain_id: 'dom-social',
    title: 'LinkedIn Outreach & Sponsor Recognition Posts',
    description: 'Draft 5 professional sponsor appreciation posts featuring verified metrics, logos, and company tags.',
    points: 5,
    priority: 'MEDIUM',
    deadline: daysFromNow(4),
    status: 'CLAIMED',
    created_by: 'usr-head-social',
    assigned_member_id: 'usr-head-social'
  },

  // Marketing
  {
    id: 'tsk-014',
    event_id: 'evt-techfest-2026',
    domain_id: 'dom-marketing',
    title: 'Tier-1 Sponsor Pitch Deck Presentation',
    description: 'Finalize the 12-slide investor and title sponsorship proposal deck including past footfall and social impressions.',
    points: 20,
    priority: 'URGENT',
    deadline: daysFromNow(3),
    status: 'UNDER_REVIEW',
    created_by: 'usr-admin-1',
    assigned_member_id: 'usr-head-mktg'
  },
  {
    id: 'tsk-015',
    event_id: 'evt-hackepoch',
    domain_id: 'dom-marketing',
    title: 'Campus Ambassador Program Launch Strategy',
    description: 'Onboard 30 campus ambassadors across 15 engineering colleges with custom referral codes and perks.',
    points: 15,
    priority: 'MEDIUM',
    deadline: daysFromNow(10),
    status: 'AVAILABLE',
    created_by: 'usr-head-mktg',
    assigned_member_id: null
  },

  // Events & Operations
  {
    id: 'tsk-016',
    event_id: 'evt-techfest-2026',
    domain_id: 'dom-events',
    title: 'Main Auditorium Audio/Visual & Stage Cue Sheet',
    description: 'Coordinate mic assignments, stage entrances, lighting transitions, and screen projection order for keynote morning.',
    points: 10,
    priority: 'HIGH',
    deadline: daysFromNow(5),
    status: 'AVAILABLE',
    created_by: 'usr-head-events',
    assigned_member_id: null
  },
  {
    id: 'tsk-017',
    event_id: 'evt-techfest-2026',
    domain_id: 'dom-operations',
    title: 'Merchandise Printing & Swag Bags Procurement',
    description: 'Source 300 custom hoodies, 500 vinyl sticker packs, and eco-friendly tote bags from verified vendors.',
    points: 15,
    priority: 'HIGH',
    deadline: daysAgo(3),
    status: 'APPROVED',
    created_by: 'usr-admin-1',
    assigned_member_id: 'usr-head-ops'
  },

  // Media
  {
    id: 'tsk-018',
    event_id: 'evt-techfest-2026',
    domain_id: 'dom-media',
    title: 'Official Cinematic Aftermovie Teaser (4K)',
    description: 'Color-grade and edit high-energy 60-second teaser video using past drone shots and crowd cheers.',
    points: 20,
    priority: 'URGENT',
    deadline: daysFromNow(4),
    status: 'AVAILABLE',
    created_by: 'usr-head-media',
    assigned_member_id: null
  },
  {
    id: 'tsk-019',
    event_id: 'evt-techfest-2026',
    domain_id: 'dom-media',
    title: 'Keynote Speaker Studio Headshots Retouching',
    description: 'Batch process and retouch 12 speaker portrait photos with unified color treatment for web banner.',
    points: 5,
    priority: 'LOW',
    deadline: daysAgo(2),
    status: 'APPROVED',
    created_by: 'usr-head-media',
    assigned_member_id: 'usr-mem-sneha'
  },

  // Tech & Design
  {
    id: 'tsk-020',
    event_id: 'evt-hackepoch',
    domain_id: 'dom-tech',
    title: 'Hacker Helpdesk Discord Bot with Ticket System',
    description: 'Deploy Node.js bot with slash commands for mentor dispatch, table lookup, and announcements.',
    points: 15,
    priority: 'MEDIUM',
    deadline: daysFromNow(12),
    status: 'AVAILABLE',
    created_by: 'usr-head-tech',
    assigned_member_id: null
  },
  {
    id: 'tsk-021',
    event_id: 'evt-design-sprint',
    domain_id: 'dom-design',
    title: 'Design System Figma Component Library 3.0',
    description: 'Create responsive auto-layout components for buttons, modals, badges, inputs, and dark mode tokens.',
    points: 30,
    priority: 'HIGH',
    deadline: daysAgo(10),
    status: 'APPROVED',
    created_by: 'usr-head-design',
    assigned_member_id: 'usr-mem-emily'
  }
];

for (const t of additionalTasks) {
  const exists = queryOne('SELECT id FROM tasks WHERE id = ?', [t.id]);
  if (!exists) {
    db.prepare(`
      INSERT INTO tasks (id, event_id, domain_id, title, description, points, priority, deadline, status, created_by, assigned_member_id, created_at, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      t.id,
      t.event_id,
      t.domain_id,
      t.title,
      t.description,
      t.points,
      t.priority,
      t.deadline,
      t.status,
      t.created_by,
      t.assigned_member_id,
      daysAgo(8),
      t.status === 'APPROVED' ? daysAgo(2) : null
    );

    if (t.assigned_member_id) {
      db.prepare(`
        INSERT INTO task_assignments (id, task_id, user_id, assigned_at, status)
        VALUES (?, ?, ?, ?, 'ACTIVE')
      `).run(`asg-${t.id}`, t.id, t.assigned_member_id, daysAgo(7));
    }
  }
}

// 3. SUBMISSIONS FOR APPROVED & UNDER REVIEW TASKS
// Ops approved deliverable
const sub17Exists = queryOne('SELECT id FROM submissions WHERE id = ?', ['sub-017']);
if (!sub17Exists) {
  db.prepare(`
    INSERT INTO submissions (id, task_id, user_id, file_url, file_name, file_type, file_size, comment, status, reviewer_id, review_comment, submitted_at, reviewed_at, version)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'APPROVED', 'usr-admin-1', 'Vendor quotes verified and budget approved by core team.', ?, ?, 1)
  `).run('sub-017', 'tsk-017', 'usr-head-ops', '/api/files/swag-vendor-invoices.pdf', 'swag-vendor-invoices.pdf', 'application/pdf', 1048576, 'Attached vendor quotations and delivery schedule.', daysAgo(4), daysAgo(3));

  // Point transaction
  const ptExists = queryOne('SELECT id FROM point_transactions WHERE task_id = ? AND transaction_type = ?', ['tsk-017', 'TASK_COMPLETION']);
  if (!ptExists) {
    db.prepare(`
      INSERT INTO point_transactions (id, user_id, points, transaction_type, reason, task_id, event_id, created_at)
      VALUES (?, ?, 15, 'TASK_COMPLETION', 'Approved: Merchandise Printing & Swag Bags Procurement', 'tsk-017', 'evt-techfest-2026', ?)
    `).run(`pt-${Date.now()}-ops`, 'usr-head-ops', daysAgo(3));
  }
}

// Design Emily approved deliverable (30 pts)
const sub21Exists = queryOne('SELECT id FROM submissions WHERE id = ?', ['sub-021']);
if (!sub21Exists) {
  db.prepare(`
    INSERT INTO submissions (id, task_id, user_id, file_url, file_name, file_type, file_size, comment, status, reviewer_id, review_comment, submitted_at, reviewed_at, version)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'APPROVED', 'usr-head-design', 'Incredible work on the 3.0 Figma tokens library!', ?, ?, 1)
  `).run('sub-021', 'tsk-021', 'usr-mem-emily', '/api/files/epoch-figma-tokens-3.0.zip', 'epoch-figma-tokens-3.0.zip', 'application/zip', 12582912, 'Complete component library with auto-layout v5 and variable modes.', daysAgo(11), daysAgo(10));

  const ptExists = queryOne('SELECT id FROM point_transactions WHERE task_id = ? AND transaction_type = ?', ['tsk-021', 'TASK_COMPLETION']);
  if (!ptExists) {
    db.prepare(`
      INSERT INTO point_transactions (id, user_id, points, transaction_type, reason, task_id, event_id, created_at)
      VALUES (?, ?, 30, 'TASK_COMPLETION', 'Approved: Design System Figma Component Library 3.0', 'tsk-021', 'evt-design-sprint', ?)
    `).run(`pt-${Date.now()}-emily`, 'usr-mem-emily', daysAgo(10));
  }
}

// Media Sneha approved deliverable (5 pts)
const sub19Exists = queryOne('SELECT id FROM submissions WHERE id = ?', ['sub-019']);
if (!sub19Exists) {
  db.prepare(`
    INSERT INTO submissions (id, task_id, user_id, file_url, file_name, file_type, file_size, comment, status, reviewer_id, review_comment, submitted_at, reviewed_at, version)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'APPROVED', 'usr-head-media', 'Crisp skin tones and perfect color matching.', ?, ?, 1)
  `).run('sub-019', 'tsk-019', 'usr-mem-sneha', '/api/files/speaker-headshots-graded.zip', 'speaker-headshots-graded.zip', 'application/zip', 9437184, 'Exported 12 high-res portraits with alpha channel PNGs.', daysAgo(3), daysAgo(2));

  const ptExists = queryOne('SELECT id FROM point_transactions WHERE task_id = ? AND transaction_type = ?', ['tsk-019', 'TASK_COMPLETION']);
  if (!ptExists) {
    db.prepare(`
      INSERT INTO point_transactions (id, user_id, points, transaction_type, reason, task_id, event_id, created_at)
      VALUES (?, ?, 5, 'TASK_COMPLETION', 'Approved: Keynote Speaker Studio Headshots Retouching', 'tsk-019', 'evt-techfest-2026', ?)
    `).run(`pt-${Date.now()}-sneha`, 'usr-mem-sneha', daysAgo(2));
  }
}

// Marketing Under Review deliverable
const sub14Exists = queryOne('SELECT id FROM submissions WHERE id = ?', ['sub-014']);
if (!sub14Exists) {
  db.prepare(`
    INSERT INTO submissions (id, task_id, user_id, file_url, file_name, file_type, file_size, comment, status, reviewer_id, review_comment, submitted_at, version)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'UNDER_REVIEW', NULL, NULL, ?, 1)
  `).run('sub-014', 'tsk-014', 'usr-head-mktg', '/api/files/techfest-sponsor-deck-final.pdf', 'techfest-sponsor-deck-final.pdf', 'application/pdf', 5242880, 'Updated with tier sponsor slots and audience demographic stats.', daysAgo(1));
}

console.log('✅ Additional demo data seeded successfully!');
