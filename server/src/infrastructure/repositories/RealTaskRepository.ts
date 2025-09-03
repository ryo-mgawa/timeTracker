import { PrismaClient, PrismaClientKnownRequestError } from '../../generated/prisma';
import { Task } from '../../domain/entities/Task';
import { TaskId, ProjectId, UserId } from '../../shared/types/common';

// Supabase + Prisma を使った実際のタスクリポジトリ
export class RealTaskRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<readonly Task[]> {
    try {
      const prismaTasks = await this.prisma.task.findMany({
        where: {
          deletedAt: null
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      return prismaTasks.map(prismaTask => 
        Task.restore(
          prismaTask.id,
          prismaTask.name,
          prismaTask.description || '',
          prismaTask.projectId,
          prismaTask.userId,
          prismaTask.createdAt,
          prismaTask.updatedAt,
          prismaTask.deletedAt || undefined
        )
      );
    } catch (error) {
      throw new Error(`タスク一覧の取得に失敗しました: ${error}`);
    }
  }

  async findByUserId(userId: UserId): Promise<readonly Task[]> {
    // アーリーリターン
    if (!userId) return [];

    try {
      const prismaTasks = await this.prisma.task.findMany({
        where: {
          userId,
          deletedAt: null
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      return prismaTasks.map(prismaTask => 
        Task.restore(
          prismaTask.id,
          prismaTask.name,
          prismaTask.description || '',
          prismaTask.projectId,
          prismaTask.userId,
          prismaTask.createdAt,
          prismaTask.updatedAt,
          prismaTask.deletedAt || undefined
        )
      );
    } catch (error) {
      throw new Error(`ユーザーのタスク取得に失敗しました: ${error}`);
    }
  }

  async findByProjectId(projectId: ProjectId): Promise<readonly Task[]> {
    // アーリーリターン
    if (!projectId) return [];

    try {
      const prismaTasks = await this.prisma.task.findMany({
        where: {
          projectId,
          deletedAt: null
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      return prismaTasks.map(prismaTask => 
        Task.restore(
          prismaTask.id,
          prismaTask.name,
          prismaTask.description || '',
          prismaTask.projectId,
          prismaTask.userId,
          prismaTask.createdAt,
          prismaTask.updatedAt,
          prismaTask.deletedAt || undefined
        )
      );
    } catch (error) {
      throw new Error(`プロジェクトのタスク取得に失敗しました: ${error}`);
    }
  }

  async findByUserIdAndProjectId(userId: UserId, projectId: ProjectId): Promise<readonly Task[]> {
    // アーリーリターン
    if (!userId || !projectId) return [];

    try {
      const prismaTasks = await this.prisma.task.findMany({
        where: {
          userId,
          projectId,
          deletedAt: null
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      return prismaTasks.map(prismaTask => 
        Task.restore(
          prismaTask.id,
          prismaTask.name,
          prismaTask.description || '',
          prismaTask.projectId,
          prismaTask.userId,
          prismaTask.createdAt,
          prismaTask.updatedAt,
          prismaTask.deletedAt || undefined
        )
      );
    } catch (error) {
      throw new Error(`ユーザーのプロジェクト内タスク取得に失敗しました: ${error}`);
    }
  }

  async findById(id: TaskId): Promise<Task | null> {
    // アーリーリターン
    if (!id) return null;

    try {
      const prismaTask = await this.prisma.task.findUnique({
        where: {
          id,
          deletedAt: null
        }
      });

      // アーリーリターン
      if (!prismaTask) return null;

      return Task.restore(
        prismaTask.id,
        prismaTask.name,
        prismaTask.description || '',
        prismaTask.projectId,
        prismaTask.userId,
        prismaTask.createdAt,
        prismaTask.updatedAt,
        prismaTask.deletedAt || undefined
      );
    } catch (error) {
      throw new Error(`タスク取得に失敗しました: ${error}`);
    }
  }

  async findByUserIdAndId(userId: UserId, id: TaskId): Promise<Task | null> {
    // アーリーリターン
    if (!userId || !id) return null;

    try {
      const prismaTask = await this.prisma.task.findUnique({
        where: {
          id,
          userId,
          deletedAt: null
        }
      });

      // アーリーリターン
      if (!prismaTask) return null;

      return Task.restore(
        prismaTask.id,
        prismaTask.name,
        prismaTask.description || '',
        prismaTask.projectId,
        prismaTask.userId,
        prismaTask.createdAt,
        prismaTask.updatedAt,
        prismaTask.deletedAt || undefined
      );
    } catch (error) {
      throw new Error(`ユーザーのタスク取得に失敗しました: ${error}`);
    }
  }

  async save(task: Task): Promise<Task> {
    if (!task) {
      throw new Error('タスクは必須です');
    }

    try {
      const prismaTask = await this.prisma.task.upsert({
        where: {
          id: task.id
        },
        update: {
          name: task.name.getValue(),
          description: task.description,
          projectId: task.projectId,
          updatedAt: new Date(),
          deletedAt: task.deletedAt || null
        },
        create: {
          id: task.id,
          name: task.name.getValue(),
          description: task.description,
          projectId: task.projectId,
          userId: task.userId
        }
      });

      return Task.restore(
        prismaTask.id,
        prismaTask.name,
        prismaTask.description || '',
        prismaTask.projectId,
        prismaTask.userId,
        prismaTask.createdAt,
        prismaTask.updatedAt,
        prismaTask.deletedAt || undefined
      );
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new Error('指定されたプロジェクトまたはユーザーが存在しません');
        }
        if (error.code === 'P2002') {
          throw new Error('タスク名が重複しています');
        }
      }
      throw new Error(`タスク保存に失敗しました: ${error}`);
    }
  }

  async delete(id: TaskId, userId: UserId): Promise<void> {
    try {
      // まずタスクを取得して権限チェック
      const existingTask = await this.prisma.task.findUnique({
        where: {
          id,
          deletedAt: null
        }
      });

      // アーリーリターン
      if (!existingTask) {
        throw new Error('タスクが見つかりません');
      }

      if (existingTask.userId !== userId) {
        throw new Error('このタスクを削除する権限がありません');
      }

      // 論理削除の実行
      await this.prisma.task.update({
        where: {
          id
        },
        data: {
          deletedAt: new Date()
        }
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new Error('タスクが見つかりません');
      }
      // 既にエラーメッセージが設定されている場合はそのまま投げる
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`タスク削除に失敗しました: ${error}`);
    }
  }

  // テスト用のクリア機能
  async clear(): Promise<void> {
    try {
      await this.prisma.task.deleteMany({});
    } catch (error) {
      throw new Error(`タスクテーブルのクリアに失敗しました: ${error}`);
    }
  }
}