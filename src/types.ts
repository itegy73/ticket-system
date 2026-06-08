/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Department = 'housekeeping' | 'maintenance' | 'food_service';

export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  roomNumber: string;
  department: Department;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string; // name or user info
  createdAt: string;
  updatedAt: string;
  synced: boolean;
  createdBy: string;
}

export type UserRole = 'manager' | 'supervisor' | 'staff';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  department: Department | 'all';
  avatarColor: string;
}

export interface SupportTicket {
  id: string;
  title: string;
  user: string;
  department: string;
  issue: string;
  status: 'open' | 'resolved';
  createdAt: string;
  response?: string;
}

export interface Notification {
  id: string;
  text: string;
  type: 'info' | 'success' | 'alert';
  createdAt: string;
  read: boolean;
}

export interface EmployeePerformance {
  id: string;
  name: string;
  department: Department;
  completedCount: number;
  averageMinutes: number;
  rating: 'excellent' | 'good' | 'needs_improvement';
}

export interface SyncStatus {
  lastSyncTime: string;
  pendingSyncCount: number;
  offlineMode: boolean;
  spreadsheetId: string;
}
