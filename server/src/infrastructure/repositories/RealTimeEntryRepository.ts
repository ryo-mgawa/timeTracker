import { PrismaClient } from '../../generated/prisma';
import { TimeEntry } from '../../domain/entities/TimeEntry';
import { TimeEntryId, TaskId, CategoryId, UserId } from '../../shared/types/common';

// Supabase + Prisma を使った実際の工数エントリリポジトリ
export class RealTimeEntryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<readonly TimeEntry[]> {
    try {
      const prismaTimeEntries = await this.prisma.timeEntry.findMany({
        where: {
          deletedAt: null
        },
        orderBy: {
          startTime: 'asc'
        }
      });

      return prismaTimeEntries.map(prismaTimeEntry => 
        TimeEntry.restore(
          prismaTimeEntry.id,
          prismaTimeEntry.taskId,
          prismaTimeEntry.categoryId,
          prismaTimeEntry.userId,
          prismaTimeEntry.startTime,
          prismaTimeEntry.endTime,
          prismaTimeEntry.memo || undefined,
          prismaTimeEntry.createdAt,
          prismaTimeEntry.updatedAt
        )
      );
    } catch (error) {
      throw new Error(`工数エントリ一覧の取得に失敗しました: ${error}`);
    }
  }

  async findByUserId(userId: UserId): Promise<readonly TimeEntry[]> {
    // アーリーリターン
    if (!userId) return [];

    try {
      const prismaTimeEntries = await this.prisma.timeEntry.findMany({
        where: {
          userId,
          deletedAt: null
        },
        orderBy: {
          startTime: 'asc'
        }
      });

      return prismaTimeEntries.map(prismaTimeEntry => 
        TimeEntry.restore(
          prismaTimeEntry.id,
          prismaTimeEntry.taskId,
          prismaTimeEntry.categoryId,
          prismaTimeEntry.userId,
          prismaTimeEntry.startTime,
          prismaTimeEntry.endTime,
          prismaTimeEntry.memo || undefined,
          prismaTimeEntry.createdAt,
          prismaTimeEntry.updatedAt
        )
      );
    } catch (error) {
      throw new Error(`ユーザーの工数エントリ取得に失敗しました: ${error}`);
    }
  }

  async findByTaskId(taskId: TaskId): Promise<readonly TimeEntry[]> {
    // アーリーリターン
    if (!taskId) return [];

    try {
      const prismaTimeEntries = await this.prisma.timeEntry.findMany({
        where: {
          taskId,
          deletedAt: null
        },
        orderBy: {
          startTime: 'asc'
        }
      });

      return prismaTimeEntries.map(prismaTimeEntry => 
        TimeEntry.restore(
          prismaTimeEntry.id,
          prismaTimeEntry.taskId,
          prismaTimeEntry.categoryId,
          prismaTimeEntry.userId,
          prismaTimeEntry.startTime,
          prismaTimeEntry.endTime,
          prismaTimeEntry.memo || undefined,
          prismaTimeEntry.createdAt,
          prismaTimeEntry.updatedAt
        )
      );
    } catch (error) {
      throw new Error(`タスクの工数エントリ取得に失敗しました: ${error}`);
    }
  }

  async findByCategoryId(categoryId: CategoryId): Promise<readonly TimeEntry[]> {
    // アーリーリターン
    if (!categoryId) return [];

    try {
      const prismaTimeEntries = await this.prisma.timeEntry.findMany({
        where: {
          categoryId,
          deletedAt: null
        },
        orderBy: {
          startTime: 'asc'
        }
      });

      return prismaTimeEntries.map(prismaTimeEntry => 
        TimeEntry.restore(
          prismaTimeEntry.id,
          prismaTimeEntry.taskId,
          prismaTimeEntry.categoryId,
          prismaTimeEntry.userId,
          prismaTimeEntry.startTime,
          prismaTimeEntry.endTime,
          prismaTimeEntry.memo || undefined,
          prismaTimeEntry.createdAt,
          prismaTimeEntry.updatedAt
        )
      );
    } catch (error) {
      throw new Error(`分類の工数エントリ取得に失敗しました: ${error}`);
    }
  }

  async findByUserIdAndDateRange(
    userId: UserId, 
    startDate: Date, 
    endDate: Date
  ): Promise<readonly TimeEntry[]> {
    // アーリーリターン
    if (!userId || !startDate || !endDate) return [];

    try {
      const prismaTimeEntries = await this.prisma.timeEntry.findMany({
        where: {
          userId,
          date: {
            gte: startDate,
            lte: endDate
          },
          deletedAt: null
        },
        orderBy: {
          startTime: 'asc'
        }
      });

      return prismaTimeEntries.map(prismaTimeEntry => 
        TimeEntry.restore(
          prismaTimeEntry.id,
          prismaTimeEntry.taskId,
          prismaTimeEntry.categoryId,
          prismaTimeEntry.userId,
          prismaTimeEntry.startTime,
          prismaTimeEntry.endTime,
          prismaTimeEntry.memo || undefined,
          prismaTimeEntry.createdAt,
          prismaTimeEntry.updatedAt
        )
      );
    } catch (error) {
      throw new Error(`期間指定での工数エントリ取得に失敗しました: ${error}`);
    }
  }

  async findOverlapping(
    userId: UserId, 
    startTime: Date, 
    endTime: Date,
    excludeId?: TimeEntryId
  ): Promise<readonly TimeEntry[]> {
    // アーリーリターン
    if (!userId || !startTime || !endTime) return [];

    try {
      const prismaTimeEntries = await this.prisma.timeEntry.findMany({
        where: {
          userId,
          AND: [
            {
              OR: [
                // 新しいエントリの開始時間が既存のエントリと重複
                {
                  startTime: { lte: startTime },
                  endTime: { gt: startTime }
                },
                // 新しいエントリの終了時間が既存のエントリと重複
                {
                  startTime: { lt: endTime },
                  endTime: { gte: endTime }
                },
                // 新しいエントリが既存のエントリを包含
                {
                  startTime: { gte: startTime },
                  endTime: { lte: endTime }
                }
              ]
            },
            {
              deletedAt: null
            },
            // 更新時は自分自身を除外
            ...(excludeId ? [{ id: { not: excludeId } }] : [])
          ]
        },
        orderBy: {
          startTime: 'asc'
        }
      });

      return prismaTimeEntries.map(prismaTimeEntry => 
        TimeEntry.restore(
          prismaTimeEntry.id,
          prismaTimeEntry.taskId,
          prismaTimeEntry.categoryId,
          prismaTimeEntry.userId,
          prismaTimeEntry.startTime,
          prismaTimeEntry.endTime,
          prismaTimeEntry.memo || undefined,
          prismaTimeEntry.createdAt,
          prismaTimeEntry.updatedAt
        )
      );
    } catch (error) {
      throw new Error(`重複工数エントリの検索に失敗しました: ${error}`);
    }
  }

  async findById(id: TimeEntryId): Promise<TimeEntry | null> {
    // アーリーリターン
    if (!id) return null;

    try {
      const prismaTimeEntry = await this.prisma.timeEntry.findUnique({
        where: {
          id,
          deletedAt: null
        }
      });

      // アーリーリターン
      if (!prismaTimeEntry) return null;

      return TimeEntry.restore(
        prismaTimeEntry.id,
        prismaTimeEntry.taskId,
        prismaTimeEntry.categoryId,
        prismaTimeEntry.userId,
        prismaTimeEntry.startTime,
        prismaTimeEntry.endTime,
        prismaTimeEntry.memo || undefined,
        prismaTimeEntry.createdAt,
        prismaTimeEntry.updatedAt
      );
    } catch (error) {
      throw new Error(`工数エントリ取得に失敗しました: ${error}`);
    }
  }

  async save(timeEntry: TimeEntry): Promise<TimeEntry> {
    if (!timeEntry) {
      throw new Error('工数エントリは必須です');
    }

    try {
      // 重複チェック（更新時は自分自身を除外）
      const overlapping = await this.findOverlapping(
        timeEntry.userId,
        timeEntry.period.startTime,
        timeEntry.period.endTime,
        timeEntry.id
      );

      if (overlapping.length > 0) {
        throw new Error('指定された時間帯には既に工数エントリが存在します');
      }

      const prismaTimeEntry = await this.prisma.timeEntry.upsert({
        where: {
          id: timeEntry.id
        },
        update: {
          taskId: timeEntry.taskId,
          categoryId: timeEntry.categoryId,
          startTime: timeEntry.period.startTime,
          endTime: timeEntry.period.endTime,
          date: timeEntry.getWorkDate(),
          memo: timeEntry.memo || null,
          updatedAt: new Date()
        },
        create: {
          id: timeEntry.id,
          taskId: timeEntry.taskId,
          categoryId: timeEntry.categoryId,
          userId: timeEntry.userId,
          startTime: timeEntry.period.startTime,
          endTime: timeEntry.period.endTime,
          date: timeEntry.getWorkDate(),
          memo: timeEntry.memo || null
        }
      });

      return TimeEntry.restore(
        prismaTimeEntry.id,
        prismaTimeEntry.taskId,
        prismaTimeEntry.categoryId,
        prismaTimeEntry.userId,
        prismaTimeEntry.startTime,
        prismaTimeEntry.endTime,
        prismaTimeEntry.memo || undefined,
        prismaTimeEntry.createdAt,
        prismaTimeEntry.updatedAt
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('P2003')) {
        throw new Error('指定されたタスク、分類、またはユーザーが存在しません');
      }
      if (errorMessage.includes('P2002')) {
        throw new Error('工数エントリが重複しています');
      }
      // 既にエラーメッセージが設定されている場合はそのまま投げる
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`工数エントリ保存に失敗しました: ${errorMessage}`);
    }
  }

  async delete(id: TimeEntryId, userId: UserId): Promise<void> {
    try {
      // まず工数エントリを取得して権限チェック
      const existingTimeEntry = await this.prisma.timeEntry.findUnique({
        where: {
          id,
          deletedAt: null
        }
      });

      // アーリーリターン
      if (!existingTimeEntry) {
        throw new Error('工数エントリが見つかりません');
      }

      if (existingTimeEntry.userId !== userId) {
        throw new Error('この工数エントリを削除する権限がありません');
      }

      // 論理削除の実行
      await this.prisma.timeEntry.update({
        where: {
          id
        },
        data: {
          deletedAt: new Date()
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('P2025')) {
        throw new Error('工数エントリが見つかりません');
      }
      // 既にエラーメッセージが設定されている場合はそのまま投げる
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`工数エントリ削除に失敗しました: ${errorMessage}`);
    }
  }

  // テスト用のクリア機能
  async clear(): Promise<void> {
    try {
      await this.prisma.timeEntry.deleteMany({});
    } catch (error) {
      throw new Error(`工数エントリテーブルのクリアに失敗しました: ${error}`);
    }
  }
}