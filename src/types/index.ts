export type UserRole = 'super_admin' | 'domain_head' | 'member' | 'reviewer';

export type TaskStatus = 
  | 'AVAILABLE'
  | 'CLAIMED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'MISSED'
  | 'CANCELLED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type EventStatus = 'Draft' | 'Upcoming' | 'Active' | 'Completed' | 'Archived';

export type PointTransactionType = 
  | 'TASK_COMPLETION'
  | 'MISSED_TASK_PENALTY'
  | 'BONUS'
  | 'PENALTY_REVERSAL'
  | 'MANUAL_ADJUSTMENT';

export type NotificationType = 
  | 'new_task'
  | 'task_claimed'
  | 'deadline_approaching'
  | 'submission_approved'
  | 'submission_rejected'
  | 'task_missed'
  | 'points_awarded'
  | 'event_announcement';

export interface User {
  id: string;
  name: string;
  phone: string;
  profile_image: string | null;
  role: UserRole;
  domain_id: string | null;
  position: string | null;
  join_date: string;
  is_active: number; // 1 or 0
  created_at: string;
  updated_at: string;
  // Computed or joined
  domain_name?: string;
  total_points?: number;
  rank?: number;
  completed_tasks_count?: number;
  pending_tasks_count?: number;
}

export interface Domain {
  id: string;
  name: string;
  description: string;
  head_id: string | null;
  icon?: string;
  created_at: string;
  // Computed / joined
  head_name?: string;
  head_avatar?: string;
  member_count?: number;
  active_tasks_count?: number;
  completed_tasks_count?: number;
  total_points?: number;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: EventStatus;
  cover_image: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Computed / joined
  participating_domain_ids?: string[];
  participating_domains?: Domain[];
  task_count?: number;
  completed_task_count?: number;
  progress_percentage?: number;
}

export interface Task {
  id: string;
  event_id: string;
  domain_id: string;
  title: string;
  description: string;
  points: number;
  priority: TaskPriority;
  deadline: string;
  status: TaskStatus;
  created_by: string;
  assigned_member_id: string | null;
  created_at: string;
  completed_at: string | null;
  // Joined
  event_name?: string;
  domain_name?: string;
  assigned_member_name?: string;
  assigned_member_avatar?: string;
  assigned_member_phone?: string;
  creator_name?: string;
}

export interface Submission {
  id: string;
  task_id: string;
  user_id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size: number;
  comment: string | null;
  status: 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  reviewer_id: string | null;
  review_comment: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  version: number;
  // Joined
  user_name?: string;
  user_avatar?: string;
  reviewer_name?: string;
  task_title?: string;
  task_points?: number;
  event_name?: string;
  domain_name?: string;
}

export interface PointTransaction {
  id: string;
  user_id: string;
  points: number;
  transaction_type: PointTransactionType;
  reason: string;
  task_id: string | null;
  event_id: string | null;
  created_at: string;
  // Joined
  user_name?: string;
  task_title?: string;
  event_name?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: number; // 0 or 1
  related_entity_type?: string | null;
  related_entity_id?: string | null;
  created_at: string;
}

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  points_reward: number;
  created_at: string;
  unlocked?: boolean;
  unlocked_at?: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: string | null;
  created_at: string;
  // Joined
  user_name?: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  name: string;
  profile_image: string | null;
  domain_id: string | null;
  domain_name: string | null;
  role: UserRole;
  total_points: number;
  completed_tasks: number;
}
