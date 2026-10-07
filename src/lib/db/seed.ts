import { DatabaseSync } from 'node:sqlite';

export function runSeed(db: DatabaseSync) {
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (existingUsers && existingUsers.count >= 20) {
    return; // Already seeded with full demo dataset
  }

  const now = new Date();
  const isoNow = now.toISOString();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();
  const daysFromNow = (d: number) => new Date(now.getTime() + d * 86400000).toISOString();

  // 1. DOMAINS (8 Domains)
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
    const exists = db.prepare('SELECT id FROM domains WHERE id = ?').get(d.id);
    if (!exists) {
      db.prepare('INSERT INTO domains (id, name, description, icon, created_at) VALUES (?, ?, ?, ?, ?)')
        .run(d.id, d.name, d.description, d.icon, daysAgo(90));
    }
  }

  // 2. USERS (21 Members covering all domains and roles)
  const users = [
    { id: 'usr-admin-1', name: 'Mohammed Rehan', phone: '+919876543210', profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', role: 'super_admin', domain_id: 'dom-tech', position: 'Club President & Lead Architect', join_date: '2024-08-01' },
    { id: 'usr-head-tech', name: 'Sarah Jenkins', phone: '+919876543211', profile_image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', role: 'domain_head', domain_id: 'dom-tech', position: 'Head of Tech Domain', join_date: '2024-09-15' },
    { id: 'usr-mem-alex', name: 'Alex Turner', phone: '+919876543212', profile_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', role: 'member', domain_id: 'dom-tech', position: 'Fullstack Developer', join_date: '2025-01-10' },
    { id: 'usr-mem-arjun', name: 'Arjun Pillai', phone: '+919876543223', profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', role: 'member', domain_id: 'dom-tech', position: 'Mobile App Developer', join_date: '2025-02-10' },
    { id: 'usr-rev-dev', name: 'Dev Mehta', phone: '+919876543214', profile_image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', role: 'reviewer', domain_id: 'dom-tech', position: 'Senior Quality Reviewer', join_date: '2024-08-15' },
    { id: 'usr-head-design', name: 'Rohan Sharma', phone: '+919876543215', profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', role: 'domain_head', domain_id: 'dom-design', position: 'Head of Design Domain', join_date: '2024-09-15' },
    { id: 'usr-mem-priya', name: 'Priya Nair', phone: '+919876543213', profile_image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', role: 'member', domain_id: 'dom-design', position: 'Brand & Graphic Designer', join_date: '2025-01-15' },
    { id: 'usr-mem-emily', name: 'Emily Watson', phone: '+919876543222', profile_image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', role: 'member', domain_id: 'dom-design', position: '3D Artist & Motion Designer', join_date: '2025-01-20' },
    { id: 'usr-head-media', name: 'Ananya Patel', phone: '+919876543216', profile_image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', role: 'domain_head', domain_id: 'dom-media', position: 'Head of Media Domain', join_date: '2024-10-01' },
    { id: 'usr-mem-sneha', name: 'Sneha Roy', phone: '+919876543224', profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', role: 'member', domain_id: 'dom-media', position: 'Video Editor & Colorist', join_date: '2025-01-18' },
    { id: 'usr-head-content', name: 'Kavi Sharma', phone: '+919876543230', profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', role: 'domain_head', domain_id: 'dom-content', position: 'Head of Content & Editorial', join_date: '2024-10-10' },
    { id: 'usr-mem-kevin', name: 'Kevin Vance', phone: '+919876543217', profile_image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', role: 'member', domain_id: 'dom-content', position: 'Content Writer & Proofreader', join_date: '2025-01-05' },
    { id: 'usr-mem-tanvi', name: 'Tanvi Kulkarni', phone: '+919876543225', profile_image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', role: 'member', domain_id: 'dom-content', position: 'Technical Writer', join_date: '2025-02-05' },
    { id: 'usr-head-social', name: 'Rahul Verma', phone: '+919876543218', profile_image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', role: 'domain_head', domain_id: 'dom-social', position: 'Head of Social Media', join_date: '2024-11-01' },
    { id: 'usr-mem-simran', name: 'Simran Kaur', phone: '+919876543226', profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', role: 'member', domain_id: 'dom-social', position: 'Social Media Strategist', join_date: '2025-02-15' },
    { id: 'usr-head-mktg', name: 'Neha Gupta', phone: '+919876543219', profile_image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150', role: 'domain_head', domain_id: 'dom-marketing', position: 'Head of Marketing & PR', join_date: '2024-10-15' },
    { id: 'usr-mem-kabir', name: 'Kabir Sen', phone: '+919876543227', profile_image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', role: 'member', domain_id: 'dom-marketing', position: 'Sponsorship Specialist', join_date: '2025-01-25' },
    { id: 'usr-head-events', name: 'Siddharth Rao', phone: '+919876543220', profile_image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', role: 'domain_head', domain_id: 'dom-events', position: 'Head of Events & Logistics', join_date: '2024-09-20' },
    { id: 'usr-mem-pooja', name: 'Pooja Hegde', phone: '+919876543228', profile_image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', role: 'member', domain_id: 'dom-events', position: 'Event Coordinator', join_date: '2025-02-01' },
    { id: 'usr-head-ops', name: 'Vikram Joshi', phone: '+919876543221', profile_image: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150', role: 'domain_head', domain_id: 'dom-operations', position: 'Head of Operations', join_date: '2024-09-01' },
    { id: 'usr-mem-aman', name: 'Aman Verma', phone: '+919876543229', profile_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', role: 'member', domain_id: 'dom-operations', position: 'Procurement Lead', join_date: '2025-01-10' }
  ];

  for (const u of users) {
    const exists = db.prepare('SELECT id FROM users WHERE id = ? OR phone = ?').get(u.id, u.phone) as { id: string } | undefined;
    if (!exists) {
      db.prepare(`
        INSERT INTO users (id, name, phone, profile_image, role, domain_id, position, join_date, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
      `).run(u.id, u.name, u.phone, u.profile_image, u.role, u.domain_id, u.position, u.join_date, daysAgo(60), isoNow);
    } else {
      db.prepare('UPDATE users SET role = ?, domain_id = ?, position = ? WHERE id = ?')
        .run(u.role, u.domain_id, u.position, exists.id);
    }
  }

  // Assign Domain Heads
  const domainHeadMap = [
    { domain: 'dom-tech', head: 'usr-head-tech' },
    { domain: 'dom-design', head: 'usr-head-design' },
    { domain: 'dom-media', head: 'usr-head-media' },
    { domain: 'dom-content', head: 'usr-head-content' },
    { domain: 'dom-social', head: 'usr-head-social' },
    { domain: 'dom-marketing', head: 'usr-head-mktg' },
    { domain: 'dom-events', head: 'usr-head-events' },
    { domain: 'dom-operations', head: 'usr-head-ops' },
  ];

  for (const map of domainHeadMap) {
    db.prepare('UPDATE domains SET head_id = ? WHERE id = ?').run(map.head, map.domain);
  }

  // 3. EVENTS (6 Events)
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
      domains: ['dom-tech', 'dom-design', 'dom-media', 'dom-content', 'dom-social', 'dom-marketing', 'dom-events', 'dom-operations']
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
      description: 'Welcoming the incoming batch into Epoch Society with live domain demonstrations, interactive stalls, and scavenger hunt.',
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
    },
    {
      id: 'evt-agm-2026',
      name: 'Annual General Meet & Core Sync',
      description: 'Executive committee elections, domain charter presentations, and budget sign-offs for the academic year.',
      start_date: daysFromNow(45),
      end_date: daysFromNow(46),
      status: 'Upcoming',
      cover_image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
      created_by: 'usr-admin-1',
      domains: ['dom-operations', 'dom-events', 'dom-content']
    },
    {
      id: 'evt-orientation-2025',
      name: 'Epoch Induction & Orientation 2025',
      description: 'Archived records of the previous academic year induction program and workshops.',
      start_date: daysAgo(180),
      end_date: daysAgo(178),
      status: 'Archived',
      cover_image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800',
      created_by: 'usr-admin-1',
      domains: ['dom-events', 'dom-media', 'dom-tech']
    }
  ];

  for (const e of events) {
    const exists = db.prepare('SELECT id FROM events WHERE id = ?').get(e.id);
    if (!exists) {
      db.prepare(`
        INSERT INTO events (id, name, description, start_date, end_date, status, cover_image, created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(e.id, e.name, e.description, e.start_date, e.end_date, e.status, e.cover_image, e.created_by, daysAgo(30), isoNow);

      for (const dId of e.domains) {
        db.prepare('INSERT OR IGNORE INTO event_domains (event_id, domain_id) VALUES (?, ?)').run(e.id, dId);
      }
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
    const achId = `ach-${a.code.toLowerCase()}`;
    const exists = db.prepare('SELECT id FROM achievements WHERE id = ?').get(achId);
    if (!exists) {
      db.prepare('INSERT INTO achievements (id, code, title, description, icon, points_reward, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(achId, a.code, a.title, a.description, a.icon, a.points, daysAgo(60));
    }
  }

  // 5. TASKS (26 Tasks across all domains & statuses)
  const tasks = [
    { id: 'tsk-001', event_id: 'evt-techfest-2026', domain_id: 'dom-tech', title: 'Build Live Countdown & Schedule Micro-site', description: 'Develop a responsive single-page schedule with real-time countdown timer, venue map, and talk filter for Tech Fest 2026.', points: 20, priority: 'HIGH', deadline: daysFromNow(3), status: 'AVAILABLE', created_by: 'usr-head-tech', assigned_member_id: null, completed_at: null },
    { id: 'tsk-002', event_id: 'evt-techfest-2026', domain_id: 'dom-tech', title: 'QR Code Ticket Check-in Scanner API', description: 'Create an internal API and mobile scanner view to validate attendee tickets at entry gates.', points: 15, priority: 'HIGH', deadline: daysFromNow(4), status: 'CLAIMED', created_by: 'usr-head-tech', assigned_member_id: 'usr-mem-alex', completed_at: null },
    { id: 'tsk-003', event_id: 'evt-techfest-2026', domain_id: 'dom-tech', title: 'Set Up Automated Cloud Backups & CI/CD', description: 'Configure GitHub Actions workflow to run linting, tests, and automated deployment to staging cluster.', points: 10, priority: 'MEDIUM', deadline: daysAgo(1), status: 'APPROVED', created_by: 'usr-admin-1', assigned_member_id: 'usr-mem-alex', completed_at: daysAgo(2) },
    { id: 'tsk-010', event_id: 'evt-hackepoch', domain_id: 'dom-tech', title: 'Project Submission Portal with GitHub Auth', description: 'Build hacker team registration and project demo video submission flow.', points: 30, priority: 'URGENT', deadline: daysFromNow(15), status: 'AVAILABLE', created_by: 'usr-admin-1', assigned_member_id: null, completed_at: null },
    { id: 'tsk-020', event_id: 'evt-hackepoch', domain_id: 'dom-tech', title: 'Hacker Helpdesk Discord Bot with Ticket System', description: 'Deploy Node.js bot with slash commands for mentor dispatch, table lookup, and announcements.', points: 15, priority: 'MEDIUM', deadline: daysFromNow(12), status: 'AVAILABLE', created_by: 'usr-head-tech', assigned_member_id: null, completed_at: null },
    { id: 'tsk-025', event_id: 'evt-hackepoch', domain_id: 'dom-tech', title: 'Live Leaderboard & Judging Matrix Dashboard', description: 'Build interactive real-time score aggregator for hackathon judges with rubric weights.', points: 25, priority: 'URGENT', deadline: daysFromNow(10), status: 'IN_PROGRESS', created_by: 'usr-head-tech', assigned_member_id: 'usr-mem-arjun', completed_at: null },
    { id: 'tsk-004', event_id: 'evt-techfest-2026', domain_id: 'dom-design', title: 'Main Stage 3D Keynote Backdrop', description: 'Design high-resolution 4K stage visual backdrop and speaker intro card animations in Figma / Blender.', points: 10, priority: 'HIGH', deadline: daysFromNow(2), status: 'AVAILABLE', created_by: 'usr-head-design', assigned_member_id: null, completed_at: null },
    { id: 'tsk-005', event_id: 'evt-techfest-2026', domain_id: 'dom-design', title: 'Official Tech Fest Poster & Instagram Grid', description: 'Create an engaging 9-post Instagram puzzle grid announcing our celebrity keynote speaker and sponsors.', points: 10, priority: 'URGENT', deadline: daysFromNow(1), status: 'UNDER_REVIEW', created_by: 'usr-head-design', assigned_member_id: 'usr-mem-priya', completed_at: null },
    { id: 'tsk-006', event_id: 'evt-techfest-2026', domain_id: 'dom-design', title: 'VIP Attendee Badges & Lanyard Mockup', description: 'Vector artwork and print-ready PDF for 500 attendee badges and sponsor lanyards.', points: 5, priority: 'MEDIUM', deadline: daysAgo(4), status: 'APPROVED', created_by: 'usr-head-design', assigned_member_id: 'usr-mem-priya', completed_at: daysAgo(5) },
    { id: 'tsk-011', event_id: 'evt-hackepoch', domain_id: 'dom-design', title: 'HackEpoch Brand Identity & Swag Stickers', description: 'Design sticker pack, dark theme brand identity, and hacker pass cards.', points: 15, priority: 'HIGH', deadline: daysFromNow(12), status: 'AVAILABLE', created_by: 'usr-head-design', assigned_member_id: null, completed_at: null },
    { id: 'tsk-021', event_id: 'evt-design-sprint', domain_id: 'dom-design', title: 'Design System Figma Component Library 3.0', description: 'Create responsive auto-layout components for buttons, modals, badges, inputs, and dark mode tokens.', points: 30, priority: 'HIGH', deadline: daysAgo(10), status: 'APPROVED', created_by: 'usr-head-design', assigned_member_id: 'usr-mem-emily', completed_at: daysAgo(10) },
    { id: 'tsk-007', event_id: 'evt-techfest-2026', domain_id: 'dom-media', title: 'Hype Teaser Reel Video (30 seconds)', description: 'Cut together past event footage with energetic soundtrack, typography motion graphics, and event date call-to-action.', points: 20, priority: 'HIGH', deadline: daysFromNow(2), status: 'AVAILABLE', created_by: 'usr-head-media', assigned_member_id: null, completed_at: null },
    { id: 'tsk-018', event_id: 'evt-techfest-2026', domain_id: 'dom-media', title: 'Official Cinematic Aftermovie Teaser (4K)', description: 'Color-grade and edit high-energy 60-second teaser video using past drone shots and crowd cheers.', points: 20, priority: 'URGENT', deadline: daysFromNow(4), status: 'AVAILABLE', created_by: 'usr-head-media', assigned_member_id: null, completed_at: null },
    { id: 'tsk-019', event_id: 'evt-techfest-2026', domain_id: 'dom-media', title: 'Keynote Speaker Studio Headshots Retouching', description: 'Batch process and retouch 12 speaker portrait photos with unified color treatment for web banner.', points: 5, priority: 'LOW', deadline: daysAgo(2), status: 'APPROVED', created_by: 'usr-head-media', assigned_member_id: 'usr-mem-sneha', completed_at: daysAgo(2) },
    { id: 'tsk-008', event_id: 'evt-techfest-2026', domain_id: 'dom-content', title: 'Write Sponsorship Brochure Copy', description: 'Draft compelling 4-page pitch deck text highlighting club reach, past metrics, and tier sponsor deliverables.', points: 10, priority: 'MEDIUM', deadline: daysAgo(3), status: 'REJECTED', created_by: 'usr-admin-1', assigned_member_id: 'usr-mem-tanvi', completed_at: null },
    { id: 'tsk-009', event_id: 'evt-techfest-2026', domain_id: 'dom-content', title: 'Press Release for College Newsletter', description: 'Article announcing Tech Fest 2026 partnerships and registration opening date.', points: 5, priority: 'LOW', deadline: daysAgo(2), status: 'MISSED', created_by: 'usr-admin-1', assigned_member_id: 'usr-mem-tanvi', completed_at: null },
    { id: 'tsk-024', event_id: 'evt-techfest-2026', domain_id: 'dom-content', title: 'Keynote Speaker Introductions & MC Script', description: 'Write complete bilingual master of ceremonies stage script and distinguished guest introduction bios.', points: 10, priority: 'HIGH', deadline: daysFromNow(2), status: 'UNDER_REVIEW', created_by: 'usr-head-content', assigned_member_id: 'usr-head-content', completed_at: null },
    { id: 'tsk-012', event_id: 'evt-techfest-2026', domain_id: 'dom-social', title: 'Instagram Reels Series: Speaker Lineup Reveal', description: 'Produce and schedule 3 high-tempo vertical teaser reels introducing our keynote speakers with audio hooks.', points: 10, priority: 'HIGH', deadline: daysFromNow(2), status: 'AVAILABLE', created_by: 'usr-head-social', assigned_member_id: null, completed_at: null },
    { id: 'tsk-013', event_id: 'evt-techfest-2026', domain_id: 'dom-social', title: 'LinkedIn Outreach & Sponsor Recognition Posts', description: 'Draft 5 professional sponsor appreciation posts featuring verified metrics, logos, and company tags.', points: 5, priority: 'MEDIUM', deadline: daysFromNow(4), status: 'CLAIMED', created_by: 'usr-head-social', assigned_member_id: 'usr-mem-simran', completed_at: null },
    { id: 'tsk-026', event_id: 'evt-freshers-2026', domain_id: 'dom-social', title: 'Orientation Teaser Campaign & Discord Onboarding', description: 'Run a 7-day social story challenge inviting freshmen to introduce themselves on the club Discord.', points: 10, priority: 'MEDIUM', deadline: daysFromNow(18), status: 'AVAILABLE', created_by: 'usr-head-social', assigned_member_id: null, completed_at: null },
    { id: 'tsk-014', event_id: 'evt-techfest-2026', domain_id: 'dom-marketing', title: 'Tier-1 Sponsor Pitch Deck Presentation', description: 'Finalize the 12-slide investor and title sponsorship proposal deck including past footfall and social impressions.', points: 20, priority: 'URGENT', deadline: daysFromNow(3), status: 'UNDER_REVIEW', created_by: 'usr-admin-1', assigned_member_id: 'usr-mem-kabir', completed_at: null },
    { id: 'tsk-015', event_id: 'evt-hackepoch', domain_id: 'dom-marketing', title: 'Campus Ambassador Program Launch Strategy', description: 'Onboard 30 campus ambassadors across 15 engineering colleges with custom referral codes and perks.', points: 15, priority: 'MEDIUM', deadline: daysFromNow(10), status: 'AVAILABLE', created_by: 'usr-head-mktg', assigned_member_id: null, completed_at: null },
    { id: 'tsk-016', event_id: 'evt-techfest-2026', domain_id: 'dom-events', title: 'Main Auditorium Audio/Visual & Stage Cue Sheet', description: 'Coordinate mic assignments, stage entrances, lighting transitions, and screen projection order for keynote morning.', points: 10, priority: 'HIGH', deadline: daysFromNow(5), status: 'AVAILABLE', created_by: 'usr-head-events', assigned_member_id: null, completed_at: null },
    { id: 'tsk-023', event_id: 'evt-freshers-2026', domain_id: 'dom-events', title: 'Interactive Stall Layout & Equipment Logistics', description: 'Map out 10 club domain booths, power extension strips, banner stands, and crowd flow barriers.', points: 15, priority: 'HIGH', deadline: daysFromNow(22), status: 'AVAILABLE', created_by: 'usr-head-events', assigned_member_id: null, completed_at: null },
    { id: 'tsk-017', event_id: 'evt-techfest-2026', domain_id: 'dom-operations', title: 'Merchandise Printing & Swag Bags Procurement', description: 'Source 300 custom hoodies, 500 vinyl sticker packs, and eco-friendly tote bags from verified vendors.', points: 15, priority: 'HIGH', deadline: daysAgo(3), status: 'APPROVED', created_by: 'usr-admin-1', assigned_member_id: 'usr-mem-aman', completed_at: daysAgo(3) },
    { id: 'tsk-022', event_id: 'evt-techfest-2026', domain_id: 'dom-operations', title: 'Catering & Refreshments Vendor Contract', description: 'Finalize lunch boxes, high-tea snacks, and water station logistics for 1,200 attendees and 40 VIP guests.', points: 10, priority: 'MEDIUM', deadline: daysFromNow(4), status: 'UNDER_REVIEW', created_by: 'usr-head-ops', assigned_member_id: 'usr-head-ops', completed_at: null }
  ];

  for (const t of tasks) {
    const exists = db.prepare('SELECT id FROM tasks WHERE id = ?').get(t.id);
    if (!exists) {
      db.prepare(`
        INSERT INTO tasks (id, event_id, domain_id, title, description, points, priority, deadline, status, created_by, assigned_member_id, created_at, completed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        t.id, t.event_id, t.domain_id, t.title, t.description, t.points, t.priority,
        t.deadline, t.status, t.created_by, t.assigned_member_id,
        daysAgo(12), t.completed_at
      );
    }

    if (t.assigned_member_id) {
      const asgId = `asg-${t.id}`;
      const asgExists = db.prepare('SELECT id FROM task_assignments WHERE id = ?').get(asgId);
      if (!asgExists) {
        db.prepare('INSERT INTO task_assignments (id, task_id, user_id, assigned_at, status) VALUES (?, ?, ?, ?, ?)')
          .run(asgId, t.id, t.assigned_member_id, daysAgo(8), 'ACTIVE');
      }
    }
  }

  // 6. SUBMISSIONS
  const submissions = [
    { id: 'sub-001', task_id: 'tsk-003', user_id: 'usr-mem-alex', file_url: '/api/files/sample-cicd-pipeline.yml', file_name: 'github-ci-cd-workflow.yml', file_type: 'text/yaml', file_size: 2048, comment: 'Configured multi-stage Docker build and automated staging deploy with secrets verification.', status: 'APPROVED', reviewer_id: 'usr-admin-1', review_comment: 'Flawless setup! Fast execution and robust secret handling.', submitted_at: daysAgo(3), reviewed_at: daysAgo(2), version: 1 },
    { id: 'sub-002', task_id: 'tsk-006', user_id: 'usr-mem-priya', file_url: '/api/files/sample-badge-mockups.pdf', file_name: 'vip-badges-print-ready.pdf', file_type: 'application/pdf', file_size: 4194304, comment: 'Vector print files generated with CMYK color profile, 3mm bleed, and double-sided alignment.', status: 'APPROVED', reviewer_id: 'usr-head-design', review_comment: 'Clean typography and ready for printing. Great job!', submitted_at: daysAgo(6), reviewed_at: daysAgo(5), version: 1 },
    { id: 'sub-003', task_id: 'tsk-005', user_id: 'usr-mem-priya', file_url: '/api/files/sample-instagram-grid.zip', file_name: 'techfest-instagram-grid-v1.zip', file_type: 'application/zip', file_size: 8388608, comment: 'All 9 grid tiles exported at 1080x1080px with consistent brand gradient overlays.', status: 'UNDER_REVIEW', reviewer_id: null, review_comment: null, submitted_at: daysAgo(1), reviewed_at: null, version: 1 },
    { id: 'sub-004', task_id: 'tsk-008', user_id: 'usr-mem-tanvi', file_url: '/api/files/sample-brochure.docx', file_name: 'sponsorship-brochure-draft.docx', file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', file_size: 34567, comment: 'First draft with sponsor deliverables matrix.', status: 'REJECTED', reviewer_id: 'usr-admin-1', review_comment: 'Please correct the event date and replace the outdated 2025 club logo with the 2026 brand mark.', submitted_at: daysAgo(4), reviewed_at: daysAgo(3), version: 1 },
    { id: 'sub-014', task_id: 'tsk-014', user_id: 'usr-mem-kabir', file_url: '/api/files/techfest-sponsor-deck-final.pdf', file_name: 'techfest-sponsor-deck-final.pdf', file_type: 'application/pdf', file_size: 5242880, comment: 'Updated with tier sponsor slots and audience demographic stats.', status: 'UNDER_REVIEW', reviewer_id: null, review_comment: null, submitted_at: daysAgo(1), reviewed_at: null, version: 1 },
    { id: 'sub-017', task_id: 'tsk-017', user_id: 'usr-mem-aman', file_url: '/api/files/swag-vendor-invoices.pdf', file_name: 'swag-vendor-invoices.pdf', file_type: 'application/pdf', file_size: 1048576, comment: 'Attached vendor quotations, mockups, and delivery guarantee for 300 hoodies.', status: 'APPROVED', reviewer_id: 'usr-admin-1', review_comment: 'Vendor quotes verified and budget approved by core committee.', submitted_at: daysAgo(4), reviewed_at: daysAgo(3), version: 1 },
    { id: 'sub-019', task_id: 'tsk-019', user_id: 'usr-mem-sneha', file_url: '/api/files/speaker-headshots-graded.zip', file_name: 'speaker-headshots-graded.zip', file_type: 'application/zip', file_size: 9437184, comment: 'Exported 12 high-res portraits with alpha channel transparent PNGs.', status: 'APPROVED', reviewer_id: 'usr-head-media', review_comment: 'Crisp skin tones and perfect color matching across all portraits.', submitted_at: daysAgo(3), reviewed_at: daysAgo(2), version: 1 },
    { id: 'sub-021', task_id: 'tsk-021', user_id: 'usr-mem-emily', file_url: '/api/files/epoch-figma-tokens-3.0.zip', file_name: 'epoch-figma-tokens-3.0.zip', file_type: 'application/zip', file_size: 12582912, comment: 'Complete component library with auto-layout v5, dark tokens, and icon sprites.', status: 'APPROVED', reviewer_id: 'usr-head-design', review_comment: 'Incredible work on the 3.0 Figma tokens library! Super thorough documentation.', submitted_at: daysAgo(11), reviewed_at: daysAgo(10), version: 1 },
    { id: 'sub-022', task_id: 'tsk-022', user_id: 'usr-head-ops', file_url: '/api/files/catering-agreement-v1.pdf', file_name: 'catering-agreement-v1.pdf', file_type: 'application/pdf', file_size: 786432, comment: 'Draft contract with campus caterer for tea, coffee, and 1,200 boxed lunches.', status: 'UNDER_REVIEW', reviewer_id: null, review_comment: null, submitted_at: daysAgo(1), reviewed_at: null, version: 1 },
    { id: 'sub-024', task_id: 'tsk-024', user_id: 'usr-head-content', file_url: '/api/files/mc-stage-script-final.docx', file_name: 'mc-stage-script-final.docx', file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', file_size: 45056, comment: 'Full 14-page bilingual script with cues for lighting transitions.', status: 'UNDER_REVIEW', reviewer_id: null, review_comment: null, submitted_at: daysAgo(1), reviewed_at: null, version: 1 }
  ];

  for (const s of submissions) {
    const exists = db.prepare('SELECT id FROM submissions WHERE id = ?').get(s.id);
    if (!exists) {
      db.prepare(`
        INSERT INTO submissions (id, task_id, user_id, file_url, file_name, file_type, file_size, comment, status, reviewer_id, review_comment, submitted_at, reviewed_at, version)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        s.id, s.task_id, s.user_id, s.file_url, s.file_name, s.file_type, s.file_size,
        s.comment, s.status, s.reviewer_id, s.review_comment, s.submitted_at, s.reviewed_at, s.version
      );
    }
  }

  // 7. POINT TRANSACTIONS (LEDGER)
  const pointTransactions = [
    { id: 'pt-005', user_id: 'usr-admin-1', points: 50, type: 'BONUS', reason: 'Core Architecture & Platform Lead', task_id: null, event_id: null, date: daysAgo(30) },
    { id: 'pt-008', user_id: 'usr-admin-1', points: 30, type: 'TASK_COMPLETION', reason: 'Approved: Tech Fest Architecture Setup', task_id: null, event_id: 'evt-techfest-2026', date: daysAgo(20) },
    { id: 'pt-009', user_id: 'usr-admin-1', points: 25, type: 'BONUS', reason: 'Exceptional Leadership Recognition', task_id: null, event_id: null, date: daysAgo(10) },
    { id: 'pt-006', user_id: 'usr-head-tech', points: 40, type: 'BONUS', reason: 'Tech Domain Infrastructure Lead', task_id: null, event_id: null, date: daysAgo(25) },
    { id: 'pt-010', user_id: 'usr-head-tech', points: 35, type: 'TASK_COMPLETION', reason: 'Approved: HackEpoch Portal Backend', task_id: null, event_id: 'evt-hackepoch', date: daysAgo(15) },
    { id: 'pt-007', user_id: 'usr-head-design', points: 40, type: 'TASK_COMPLETION', reason: 'Approved: Epoch 3.0 Brand Guide', task_id: null, event_id: 'evt-design-sprint', date: daysAgo(18) },
    { id: 'pt-011', user_id: 'usr-head-design', points: 32, type: 'BONUS', reason: 'Design System Architecture Lead', task_id: null, event_id: null, date: daysAgo(12) },
    { id: 'pt-012', user_id: 'usr-head-media', points: 40, type: 'TASK_COMPLETION', reason: 'Approved: Teaser Reel Direction', task_id: null, event_id: 'evt-techfest-2026', date: daysAgo(14) },
    { id: 'pt-013', user_id: 'usr-head-media', points: 28, type: 'BONUS', reason: 'Studio Equipment Calibration', task_id: null, event_id: null, date: daysAgo(8) },
    { id: 'pt-014', user_id: 'usr-head-ops', points: 45, type: 'BONUS', reason: 'Annual Budget & Vendor Management', task_id: null, event_id: null, date: daysAgo(20) },
    { id: 'pt-015', user_id: 'usr-head-ops', points: 20, type: 'TASK_COMPLETION', reason: 'Approved: Stage Construction Approval', task_id: null, event_id: 'evt-techfest-2026', date: daysAgo(9) },
    { id: 'pt-016', user_id: 'usr-head-mktg', points: 35, type: 'BONUS', reason: 'Tier-1 Title Sponsor Acquisition', task_id: null, event_id: 'evt-techfest-2026', date: daysAgo(16) },
    { id: 'pt-017', user_id: 'usr-head-mktg', points: 25, type: 'TASK_COMPLETION', reason: 'Approved: Media Partnership Contracts', task_id: null, event_id: 'evt-techfest-2026', date: daysAgo(11) },
    { id: 'pt-018', user_id: 'usr-head-events', points: 35, type: 'BONUS', reason: 'Auditorium Booking & Logistics Lead', task_id: null, event_id: 'evt-techfest-2026', date: daysAgo(15) },
    { id: 'pt-019', user_id: 'usr-head-events', points: 23, type: 'TASK_COMPLETION', reason: 'Approved: Campus Permission Approvals', task_id: null, event_id: 'evt-techfest-2026', date: daysAgo(7) },
    { id: 'pt-020', user_id: 'usr-head-social', points: 30, type: 'BONUS', reason: '10K Instagram Follower Milestone', task_id: null, event_id: null, date: daysAgo(14) },
    { id: 'pt-021', user_id: 'usr-head-social', points: 25, type: 'TASK_COMPLETION', reason: 'Approved: TechFest Reveal Campaign', task_id: null, event_id: 'evt-techfest-2026', date: daysAgo(8) },
    { id: 'pt-022', user_id: 'usr-head-content', points: 30, type: 'BONUS', reason: 'Editorial Leadership & Style Guide', task_id: null, event_id: null, date: daysAgo(18) },
    { id: 'pt-023', user_id: 'usr-head-content', points: 20, type: 'TASK_COMPLETION', reason: 'Approved: Speaker Bios & PR Notes', task_id: null, event_id: 'evt-techfest-2026', date: daysAgo(10) },
    { id: 'pt-001', user_id: 'usr-mem-alex', points: 10, type: 'TASK_COMPLETION', reason: 'Approved: Set Up Automated Cloud Backups & CI/CD', task_id: 'tsk-003', event_id: 'evt-techfest-2026', date: daysAgo(2) },
    { id: 'pt-024', user_id: 'usr-mem-alex', points: 25, type: 'TASK_COMPLETION', reason: 'Approved: Auth Microservice Integration', task_id: null, event_id: 'evt-hackepoch', date: daysAgo(12) },
    { id: 'pt-025', user_id: 'usr-mem-alex', points: 25, type: 'BONUS', reason: 'Bug Bash Winner', task_id: null, event_id: null, date: daysAgo(5) },
    { id: 'pt-002', user_id: 'usr-mem-priya', points: 5, type: 'TASK_COMPLETION', reason: 'Approved: VIP Attendee Badges & Lanyard Mockup', task_id: 'tsk-006', event_id: 'evt-techfest-2026', date: daysAgo(5) },
    { id: 'pt-003', user_id: 'usr-mem-priya', points: 20, type: 'TASK_COMPLETION', reason: 'Approved: Design System Tokens & Specs', task_id: null, event_id: 'evt-design-sprint', date: daysAgo(12) },
    { id: 'pt-026', user_id: 'usr-mem-priya', points: 30, type: 'BONUS', reason: 'Exemplary UI Concept Showcase', task_id: null, event_id: null, date: daysAgo(8) },
    { id: 'pt-027', user_id: 'usr-mem-emily', points: 30, type: 'TASK_COMPLETION', reason: 'Approved: Design System Figma Component Library 3.0', task_id: 'tsk-021', event_id: 'evt-design-sprint', date: daysAgo(10) },
    { id: 'pt-028', user_id: 'usr-mem-emily', points: 15, type: 'BONUS', reason: '3D Render Asset Contribution', task_id: null, event_id: null, date: daysAgo(4) },
    { id: 'pt-029', user_id: 'usr-rev-dev', points: 25, type: 'BONUS', reason: 'Code Quality Auditing & Mentorship', task_id: null, event_id: null, date: daysAgo(14) },
    { id: 'pt-030', user_id: 'usr-rev-dev', points: 15, type: 'TASK_COMPLETION', reason: 'Approved: Security Assessment Report', task_id: null, event_id: 'evt-techfest-2026', date: daysAgo(6) },
    { id: 'pt-031', user_id: 'usr-mem-arjun', points: 25, type: 'BONUS', reason: 'React Native Boilerplate Release', task_id: null, event_id: null, date: daysAgo(9) },
    { id: 'pt-032', user_id: 'usr-mem-arjun', points: 10, type: 'TASK_COMPLETION', reason: 'Approved: Mobile Layout Fixes', task_id: null, event_id: 'evt-techfest-2026', date: daysAgo(4) },
    { id: 'pt-033', user_id: 'usr-mem-aman', points: 15, type: 'TASK_COMPLETION', reason: 'Approved: Merchandise Printing & Swag Bags Procurement', task_id: 'tsk-017', event_id: 'evt-techfest-2026', date: daysAgo(3) },
    { id: 'pt-034', user_id: 'usr-mem-aman', points: 15, type: 'BONUS', reason: 'Negotiated 20% Discount with Vendor', task_id: null, event_id: null, date: daysAgo(3) },
    { id: 'pt-035', user_id: 'usr-mem-sneha', points: 5, type: 'TASK_COMPLETION', reason: 'Approved: Keynote Speaker Studio Headshots Retouching', task_id: 'tsk-019', event_id: 'evt-techfest-2026', date: daysAgo(2) },
    { id: 'pt-036', user_id: 'usr-mem-sneha', points: 25, type: 'BONUS', reason: 'Cinematic Reel B-Roll Footage Collection', task_id: null, event_id: null, date: daysAgo(7) },
    { id: 'pt-004', user_id: 'usr-mem-tanvi', points: -1, type: 'MISSED_TASK_PENALTY', reason: 'Missed Deadline: Press Release for College Newsletter', task_id: 'tsk-009', event_id: 'evt-techfest-2026', date: daysAgo(1) },
    { id: 'pt-037', user_id: 'usr-mem-tanvi', points: 26, type: 'BONUS', reason: 'Orientation Brochure Content Writing', task_id: null, event_id: null, date: daysAgo(10) },
    { id: 'pt-038', user_id: 'usr-mem-kabir', points: 25, type: 'BONUS', reason: 'Outreached to 40 Tech Companies', task_id: null, event_id: null, date: daysAgo(6) },
    { id: 'pt-039', user_id: 'usr-mem-pooja', points: 25, type: 'BONUS', reason: 'Stage Equipment Coordination', task_id: null, event_id: null, date: daysAgo(5) },
    { id: 'pt-040', user_id: 'usr-mem-simran', points: 20, type: 'BONUS', reason: 'Viral Reel Script (45K views)', task_id: null, event_id: null, date: daysAgo(4) }
  ];

  for (const pt of pointTransactions) {
    const exists = db.prepare('SELECT id FROM point_transactions WHERE id = ?').get(pt.id);
    if (!exists) {
      db.prepare(`
        INSERT INTO point_transactions (id, user_id, points, transaction_type, reason, task_id, event_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(pt.id, pt.user_id, pt.points, pt.type, pt.reason, pt.task_id, pt.event_id, pt.date);
    }
  }

  // 8. USER ACHIEVEMENTS
  const userAchievements = [
    { id: 'uach-001', user_id: 'usr-mem-alex', ach: 'ach-first_task', date: daysAgo(2) },
    { id: 'uach-002', user_id: 'usr-mem-priya', ach: 'ach-first_task', date: daysAgo(12) },
    { id: 'uach-003', user_id: 'usr-mem-priya', ach: 'ach-fast_executor', date: daysAgo(5) },
    { id: 'uach-004', user_id: 'usr-mem-emily', ach: 'ach-first_task', date: daysAgo(10) },
    { id: 'uach-005', user_id: 'usr-mem-emily', ach: 'ach-top_contributor', date: daysAgo(10) },
    { id: 'uach-006', user_id: 'usr-admin-1', ach: 'ach-ten_tasks', date: daysAgo(20) },
    { id: 'uach-007', user_id: 'usr-admin-1', ach: 'ach-top_contributor', date: daysAgo(15) },
    { id: 'uach-008', user_id: 'usr-head-tech', ach: 'ach-domain_champion', date: daysAgo(10) },
    { id: 'uach-009', user_id: 'usr-head-design', ach: 'ach-domain_champion', date: daysAgo(10) },
    { id: 'uach-010', user_id: 'usr-mem-aman', ach: 'ach-first_task', date: daysAgo(3) },
    { id: 'uach-011', user_id: 'usr-mem-sneha', ach: 'ach-first_task', date: daysAgo(2) },
    { id: 'uach-012', user_id: 'usr-mem-alex', ach: 'ach-fast_executor', date: daysAgo(2) },
  ];

  for (const ua of userAchievements) {
    const exists = db.prepare('SELECT id FROM user_achievements WHERE id = ?').get(ua.id);
    if (!exists) {
      db.prepare('INSERT OR IGNORE INTO user_achievements (id, user_id, achievement_id, unlocked_at) VALUES (?, ?, ?, ?)')
        .run(ua.id, ua.user_id, ua.ach, ua.date);
    }
  }

  // 9. NOTIFICATIONS
  const notifications = [
    { id: 'notif-001', user_id: 'usr-mem-alex', type: 'submission_approved', title: 'Submission Approved! 🎉', message: 'Your submission for "Set Up Automated Cloud Backups & CI/CD" was approved. +10 points awarded!', read: 1, created_at: daysAgo(2) },
    { id: 'notif-002', user_id: 'usr-mem-priya', type: 'submission_approved', title: 'Submission Approved! 🎉', message: 'Your submission for "VIP Attendee Badges & Lanyard Mockup" was approved. +5 points awarded!', read: 1, created_at: daysAgo(5) },
    { id: 'notif-003', user_id: 'usr-mem-tanvi', type: 'task_missed', title: 'Missed Deadline Warning ⚠️', message: 'Your task "Press Release for College Newsletter" exceeded its deadline. -1 point deducted.', read: 0, created_at: daysAgo(1) },
    { id: 'notif-004', user_id: 'usr-mem-tanvi', type: 'submission_rejected', title: 'Changes Requested ✏️', message: 'Your submission for "Write Sponsorship Brochure Copy" was rejected. Reason: Please update logo & dates.', read: 0, created_at: daysAgo(3) },
    { id: 'notif-005', user_id: 'usr-head-design', type: 'new_task', title: 'New Submission for Review 📋', message: 'Priya submitted "Official Tech Fest Poster & Instagram Grid" for review.', read: 0, created_at: daysAgo(1) },
    { id: 'notif-006', user_id: 'usr-mem-emily', type: 'submission_approved', title: 'Submission Approved! 🎉', message: 'Your submission for "Design System Figma Component Library 3.0" was approved. +30 points awarded!', read: 1, created_at: daysAgo(10) },
    { id: 'notif-007', user_id: 'usr-mem-aman', type: 'submission_approved', title: 'Vendor Proposal Approved 📦', message: 'Merchandise Printing & Swag Bags Procurement approved. +15 points awarded!', read: 0, created_at: daysAgo(3) },
    { id: 'notif-008', user_id: 'usr-admin-1', type: 'new_task', title: 'Sponsor Deck Under Review 💼', message: 'Kabir Sen submitted "Tier-1 Sponsor Pitch Deck Presentation" for executive review.', read: 0, created_at: daysAgo(1) }
  ];

  for (const n of notifications) {
    const exists = db.prepare('SELECT id FROM notifications WHERE id = ?').get(n.id);
    if (!exists) {
      db.prepare('INSERT INTO notifications (id, user_id, type, title, message, read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(n.id, n.user_id, n.type, n.title, n.message, n.read, n.created_at);
    }
  }

  // 10. ACTIVITY LOGS
  const activityLogs = [
    { id: 'act-001', user_id: 'usr-admin-1', action: 'EVENT_CREATED', entity_type: 'event', entity_id: 'evt-techfest-2026', metadata: JSON.stringify({ name: 'Tech Fest 2026' }), created_at: daysAgo(25) },
    { id: 'act-002', user_id: 'usr-head-tech', action: 'TASK_CREATED', entity_type: 'task', entity_id: 'tsk-001', metadata: JSON.stringify({ title: 'Build Live Countdown & Schedule Micro-site' }), created_at: daysAgo(12) },
    { id: 'act-003', user_id: 'usr-mem-alex', action: 'TASK_CLAIMED', entity_type: 'task', entity_id: 'tsk-002', metadata: JSON.stringify({ title: 'QR Code Ticket Check-in Scanner API' }), created_at: daysAgo(8) },
    { id: 'act-004', user_id: 'usr-mem-priya', action: 'SUBMISSION_UPLOADED', entity_type: 'submission', entity_id: 'sub-003', metadata: JSON.stringify({ title: 'Official Tech Fest Poster & Instagram Grid' }), created_at: daysAgo(1) },
    { id: 'act-005', user_id: 'usr-admin-1', action: 'SUBMISSION_APPROVED', entity_type: 'submission', entity_id: 'sub-001', metadata: JSON.stringify({ points: 10 }), created_at: daysAgo(2) },
    { id: 'act-006', user_id: 'usr-mem-emily', action: 'SUBMISSION_APPROVED', entity_type: 'submission', entity_id: 'sub-021', metadata: JSON.stringify({ points: 30 }), created_at: daysAgo(10) },
    { id: 'act-007', user_id: 'usr-head-ops', action: 'TASK_CLAIMED', entity_type: 'task', entity_id: 'tsk-022', metadata: JSON.stringify({ title: 'Catering & Refreshments Vendor Contract' }), created_at: daysAgo(3) },
    { id: 'act-008', user_id: 'usr-mem-kabir', action: 'SUBMISSION_UPLOADED', entity_type: 'submission', entity_id: 'sub-014', metadata: JSON.stringify({ title: 'Tier-1 Sponsor Pitch Deck Presentation' }), created_at: daysAgo(1) },
  ];

  for (const act of activityLogs) {
    const exists = db.prepare('SELECT id FROM activity_logs WHERE id = ?').get(act.id);
    if (!exists) {
      db.prepare('INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(act.id, act.user_id, act.action, act.entity_type, act.entity_id, act.metadata, act.created_at);
    }
  }
}
