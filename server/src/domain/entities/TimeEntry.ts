import { TimeEntryId, TaskId, CategoryId, UserId } from '../../shared/types/common';
import { TimePeriod } from '../value-objects/TimePeriod';

// 工数エントリエンティティ（設計書の実装例に基づく）
export class TimeEntry {
  private constructor(
    public readonly id: TimeEntryId,
    public readonly taskId: TaskId,
    public readonly categoryId: CategoryId,
    public readonly userId: UserId,
    public readonly period: TimePeriod,
    public readonly memo?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  // ファクトリーメソッド - 新規作成
  static create(
    taskId: TaskId,
    categoryId: CategoryId,
    userId: UserId,
    startTime: Date,
    endTime: Date,
    memo?: string
  ): TimeEntry {
    // アーリーリターンによるバリデーション
    if (!taskId) {
      throw new Error('タスクIDは必須です');
    }
    if (!categoryId) {
      throw new Error('分類IDは必須です');
    }
    if (!userId) {
      throw new Error('ユーザーIDは必須です');
    }

    const period = TimePeriod.create(startTime, endTime);
    const id = this.generateTimeEntryId();

    return new TimeEntry(
      id,
      taskId,
      categoryId,
      userId,
      period,
      memo
    );
  }

  // ファクトリーメソッド - 復元用
  static restore(
    id: TimeEntryId,
    taskId: TaskId,
    categoryId: CategoryId,
    userId: UserId,
    startTime: Date,
    endTime: Date,
    memo: string | undefined,
    createdAt: Date,
    updatedAt: Date
  ): TimeEntry {
    const period = TimePeriod.create(startTime, endTime);
    return new TimeEntry(
      id,
      taskId,
      categoryId,
      userId,
      period,
      memo,
      createdAt,
      updatedAt
    );
  }

  // 時間を更新
  updateTime(startTime: Date, endTime: Date): TimeEntry {
    const newPeriod = TimePeriod.create(startTime, endTime);
    return new TimeEntry(
      this.id,
      this.taskId,
      this.categoryId,
      this.userId,
      newPeriod,
      this.memo,
      this.createdAt,
      new Date()
    );
  }

  // タスクを更新
  updateTask(taskId: TaskId): TimeEntry {
    if (!taskId) {
      throw new Error('タスクIDは必須です');
    }

    return new TimeEntry(
      this.id,
      taskId,
      this.categoryId,
      this.userId,
      this.period,
      this.memo,
      this.createdAt,
      new Date()
    );
  }

  // 分類を更新
  updateCategory(categoryId: CategoryId): TimeEntry {
    if (!categoryId) {
      throw new Error('分類IDは必須です');
    }

    return new TimeEntry(
      this.id,
      this.taskId,
      categoryId,
      this.userId,
      this.period,
      this.memo,
      this.createdAt,
      new Date()
    );
  }

  // メモを更新
  updateMemo(memo?: string): TimeEntry {
    return new TimeEntry(
      this.id,
      this.taskId,
      this.categoryId,
      this.userId,
      this.period,
      memo,
      this.createdAt,
      new Date()
    );
  }

  // 作業日を取得
  getWorkDate(): Date {
    return new Date(this.period.startTime.getFullYear(), 
                   this.period.startTime.getMonth(), 
                   this.period.startTime.getDate());
  }

  // 工数時間を取得
  getDurationInHours(): number {
    return this.period.getDurationInHours();
  }

  // 重複チェック
  overlapsWith(other: TimeEntry): boolean {
    // 同じユーザーでない場合は重複しない
    if (this.userId !== other.userId) return false;
    
    return this.period.overlaps(other.period);
  }

  // IDの生成
  private static generateTimeEntryId(): TimeEntryId {
    return `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 等価性チェック
  equals(other: TimeEntry): boolean {
    return this.id === other.id;
  }
}