import { PrismaClient } from '../../generated/prisma';
import { Project } from '../../domain/entities/Project';
import { ProjectId, UserId } from '../../shared/types/common';

// Supabase + Prisma を使った実際のプロジェクトリポジトリ
export class RealProjectRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<readonly Project[]> {
    try {
      const prismaProjects = await this.prisma.project.findMany({
        where: {
          deletedAt: null
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      return prismaProjects.map(prismaProject => 
        Project.restore(
          prismaProject.id,
          prismaProject.name,
          prismaProject.description || '',
          prismaProject.color,
          prismaProject.userId,
          prismaProject.createdAt,
          prismaProject.updatedAt,
          prismaProject.deletedAt || undefined
        )
      );
    } catch (error) {
      throw new Error(`プロジェクト一覧の取得に失敗しました: ${error}`);
    }
  }

  async findByUserId(userId: UserId): Promise<readonly Project[]> {
    // アーリーリターン
    if (!userId) return [];

    try {
      const prismaProjects = await this.prisma.project.findMany({
        where: {
          userId,
          deletedAt: null
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      return prismaProjects.map(prismaProject => 
        Project.restore(
          prismaProject.id,
          prismaProject.name,
          prismaProject.description || '',
          prismaProject.color,
          prismaProject.userId,
          prismaProject.createdAt,
          prismaProject.updatedAt,
          prismaProject.deletedAt || undefined
        )
      );
    } catch (error) {
      throw new Error(`ユーザーのプロジェクト取得に失敗しました: ${error}`);
    }
  }

  async findById(id: ProjectId): Promise<Project | null> {
    // アーリーリターン
    if (!id) return null;

    try {
      const prismaProject = await this.prisma.project.findUnique({
        where: {
          id,
          deletedAt: null
        }
      });

      // アーリーリターン
      if (!prismaProject) return null;

      return Project.restore(
        prismaProject.id,
        prismaProject.name,
        prismaProject.description || '',
        prismaProject.color,
        prismaProject.userId,
        prismaProject.createdAt,
        prismaProject.updatedAt,
        prismaProject.deletedAt || undefined
      );
    } catch (error) {
      throw new Error(`プロジェクト取得に失敗しました: ${error}`);
    }
  }

  async findByUserIdAndId(userId: UserId, id: ProjectId): Promise<Project | null> {
    // アーリーリターン
    if (!userId || !id) return null;

    try {
      const prismaProject = await this.prisma.project.findUnique({
        where: {
          id,
          userId,
          deletedAt: null
        }
      });

      // アーリーリターン
      if (!prismaProject) return null;

      return Project.restore(
        prismaProject.id,
        prismaProject.name,
        prismaProject.description || '',
        prismaProject.color,
        prismaProject.userId,
        prismaProject.createdAt,
        prismaProject.updatedAt,
        prismaProject.deletedAt || undefined
      );
    } catch (error) {
      throw new Error(`ユーザーのプロジェクト取得に失敗しました: ${error}`);
    }
  }

  async save(project: Project): Promise<Project> {
    if (!project) {
      throw new Error('プロジェクトは必須です');
    }

    try {
      const prismaProject = await this.prisma.project.upsert({
        where: {
          id: project.id
        },
        update: {
          name: project.name.getValue(),
          description: project.description,
          color: project.color,
          updatedAt: new Date(),
          deletedAt: project.deletedAt || null
        },
        create: {
          id: project.id,
          name: project.name.getValue(),
          description: project.description,
          color: project.color,
          userId: project.userId
        }
      });

      return Project.restore(
        prismaProject.id,
        prismaProject.name,
        prismaProject.description || '',
        prismaProject.color,
        prismaProject.userId,
        prismaProject.createdAt,
        prismaProject.updatedAt,
        prismaProject.deletedAt || undefined
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('P2003')) {
        throw new Error('指定されたユーザーが存在しません');
      }
      if (errorMessage.includes('P2002')) {
        throw new Error('プロジェクト名が重複しています');
      }
      throw new Error(`プロジェクト保存に失敗しました: ${errorMessage}`);
    }
  }

  async delete(id: ProjectId, userId: UserId): Promise<void> {
    try {
      // まずプロジェクトを取得して権限チェック
      const existingProject = await this.prisma.project.findUnique({
        where: {
          id,
          deletedAt: null
        }
      });

      // アーリーリターン
      if (!existingProject) {
        throw new Error('プロジェクトが見つかりません');
      }

      if (existingProject.userId !== userId) {
        throw new Error('このプロジェクトを削除する権限がありません');
      }

      // 論理削除の実行
      await this.prisma.project.update({
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
        throw new Error('プロジェクトが見つかりません');
      }
      // 既にエラーメッセージが設定されている場合はそのまま投げる
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`プロジェクト削除に失敗しました: ${errorMessage}`);
    }
  }

  // テスト用のクリア機能
  async clear(): Promise<void> {
    try {
      await this.prisma.project.deleteMany({});
    } catch (error) {
      throw new Error(`プロジェクトテーブルのクリアに失敗しました: ${error}`);
    }
  }
}