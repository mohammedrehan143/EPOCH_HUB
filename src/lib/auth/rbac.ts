import { User, Task } from '@/types';

export function isSuperAdmin(user?: User | null): boolean {
  return !!user && user.role === 'super_admin';
}

export function isDomainHead(user?: User | null, domainId?: string): boolean {
  if (!user) return false;
  if (user.role === 'super_admin') return true;
  if (user.role === 'domain_head') {
    if (!domainId) return true;
    return user.domain_id === domainId;
  }
  return false;
}

export function isReviewer(user?: User | null, domainId?: string): boolean {
  if (!user) return false;
  if (user.role === 'super_admin') return true;
  if (user.role === 'reviewer') return true;
  if (user.role === 'domain_head') {
    return !domainId || user.domain_id === domainId;
  }
  return false;
}

export function canManageUsers(user?: User | null): boolean {
  return isSuperAdmin(user);
}

export function canManageEvents(user?: User | null): boolean {
  return isSuperAdmin(user);
}

export function canManageDomains(user?: User | null): boolean {
  return isSuperAdmin(user);
}

export function canCreateTask(user?: User | null, domainId?: string): boolean {
  if (!user) return false;
  if (user.role === 'super_admin') return true;
  if (user.role === 'domain_head' && (!domainId || user.domain_id === domainId)) return true;
  return false;
}

export function canClaimTask(user?: User | null, task?: Task | null): boolean {
  if (!user || !task) return false;
  if (task.status !== 'AVAILABLE') return false;
  // Members and heads can claim available tasks
  return true;
}

export function canSubmitTask(user?: User | null, task?: Task | null): boolean {
  if (!user || !task) return false;
  if (task.assigned_member_id !== user.id) return false;
  return ['CLAIMED', 'IN_PROGRESS', 'REJECTED'].includes(task.status);
}
