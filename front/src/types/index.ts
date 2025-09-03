// 基本的な識別子型
export type UserId = string;
export type ProjectId = string;
export type CategoryId = string;
export type TaskId = string;
export type TimeEntryId = string;

// ユーザー型
export interface User {
  readonly id: UserId;
  readonly name: string;
  readonly email?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt?: Date;
}

// プロジェクト型
export interface Project {
  readonly id: ProjectId;
  readonly name: string;
  readonly description?: string;
  readonly color: string;
  readonly userId: UserId;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt?: Date;
}

// 分類型
export interface Category {
  readonly id: CategoryId;
  readonly name: string;
  readonly description?: string;
  readonly color: string;
  readonly userId: UserId;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt?: Date;
}

// タスク型
export interface Task {
  readonly id: TaskId;
  readonly name: string;
  readonly description?: string;
  readonly projectId: ProjectId;
  readonly userId: UserId;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt?: Date;
}

// 工数エントリ型
export interface TimeEntry {
  readonly id: TimeEntryId;
  readonly taskId: TaskId;
  readonly categoryId: CategoryId;
  readonly userId: UserId;
  readonly startTime: Date;
  readonly endTime: Date;
  readonly date: Date;
  readonly memo?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// 15分刻みの有効な分
export const VALID_MINUTE_INTERVALS = [0, 15, 30, 45] as const;
export type ValidMinuteInterval = typeof VALID_MINUTE_INTERVALS[number];

// API Request型
export interface CreateTimeEntryRequest {
  readonly taskId: TaskId;
  readonly categoryId: CategoryId;
  readonly userId: UserId;
  readonly startTime: Date;
  readonly endTime: Date;
  readonly memo?: string;
}

export interface UpdateTimeEntryRequest {
  readonly taskId?: TaskId;
  readonly categoryId?: CategoryId;
  readonly startTime?: Date;
  readonly endTime?: Date;
  readonly memo?: string;
}

// レポート関連型
export type ReportGroupBy = 'project' | 'category' | 'user' | 'project-category';

export interface ReportPeriod {
  readonly startDate: Date;
  readonly endDate: Date;
}

export interface ReportData {
  readonly groupBy: ReportGroupBy;
  readonly period: ReportPeriod;
  readonly totalHours: number;
  readonly entryCount: number;
  readonly breakdown: Record<string, number>;
}