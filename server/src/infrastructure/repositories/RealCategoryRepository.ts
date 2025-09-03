import { PrismaClient, PrismaClientKnownRequestError } from '../../generated/prisma';
import { Category } from '../../domain/entities/Category';
import { CategoryId, UserId } from '../../shared/types/common';

// Supabase + Prisma を使った実際の分類リポジトリ
export class RealCategoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<readonly Category[]> {
    try {
      const prismaCategories = await this.prisma.category.findMany({
        where: {
          deletedAt: null
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      return prismaCategories.map(prismaCategory => 
        Category.restore(
          prismaCategory.id,
          prismaCategory.name,
          prismaCategory.description || '',
          prismaCategory.color,
          prismaCategory.userId,
          prismaCategory.createdAt,
          prismaCategory.updatedAt,
          prismaCategory.deletedAt || undefined
        )
      );
    } catch (error) {
      throw new Error(`分類一覧の取得に失敗しました: ${error}`);
    }
  }

  async findByUserId(userId: UserId): Promise<readonly Category[]> {
    // アーリーリターン
    if (!userId) return [];

    try {
      const prismaCategories = await this.prisma.category.findMany({
        where: {
          userId,
          deletedAt: null
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      return prismaCategories.map(prismaCategory => 
        Category.restore(
          prismaCategory.id,
          prismaCategory.name,
          prismaCategory.description || '',
          prismaCategory.color,
          prismaCategory.userId,
          prismaCategory.createdAt,
          prismaCategory.updatedAt,
          prismaCategory.deletedAt || undefined
        )
      );
    } catch (error) {
      throw new Error(`ユーザーの分類取得に失敗しました: ${error}`);
    }
  }

  async findById(id: CategoryId): Promise<Category | null> {
    // アーリーリターン
    if (!id) return null;

    try {
      const prismaCategory = await this.prisma.category.findUnique({
        where: {
          id,
          deletedAt: null
        }
      });

      // アーリーリターン
      if (!prismaCategory) return null;

      return Category.restore(
        prismaCategory.id,
        prismaCategory.name,
        prismaCategory.description || '',
        prismaCategory.color,
        prismaCategory.userId,
        prismaCategory.createdAt,
        prismaCategory.updatedAt,
        prismaCategory.deletedAt || undefined
      );
    } catch (error) {
      throw new Error(`分類取得に失敗しました: ${error}`);
    }
  }

  async findByUserIdAndId(userId: UserId, id: CategoryId): Promise<Category | null> {
    // アーリーリターン
    if (!userId || !id) return null;

    try {
      const prismaCategory = await this.prisma.category.findUnique({
        where: {
          id,
          userId,
          deletedAt: null
        }
      });

      // アーリーリターン
      if (!prismaCategory) return null;

      return Category.restore(
        prismaCategory.id,
        prismaCategory.name,
        prismaCategory.description || '',
        prismaCategory.color,
        prismaCategory.userId,
        prismaCategory.createdAt,
        prismaCategory.updatedAt,
        prismaCategory.deletedAt || undefined
      );
    } catch (error) {
      throw new Error(`ユーザーの分類取得に失敗しました: ${error}`);
    }
  }

  async save(category: Category): Promise<Category> {
    if (!category) {
      throw new Error('分類は必須です');
    }

    try {
      const prismaCategory = await this.prisma.category.upsert({
        where: {
          id: category.id
        },
        update: {
          name: category.name.getValue(),
          description: category.description,
          color: category.color,
          updatedAt: new Date(),
          deletedAt: category.deletedAt || null
        },
        create: {
          id: category.id,
          name: category.name.getValue(),
          description: category.description,
          color: category.color,
          userId: category.userId
        }
      });

      return Category.restore(
        prismaCategory.id,
        prismaCategory.name,
        prismaCategory.description || '',
        prismaCategory.color,
        prismaCategory.userId,
        prismaCategory.createdAt,
        prismaCategory.updatedAt,
        prismaCategory.deletedAt || undefined
      );
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new Error('指定されたユーザーが存在しません');
        }
        if (error.code === 'P2002') {
          throw new Error('分類名が重複しています');
        }
      }
      throw new Error(`分類保存に失敗しました: ${error}`);
    }
  }

  async delete(id: CategoryId, userId: UserId): Promise<void> {
    try {
      // まず分類を取得して権限チェック
      const existingCategory = await this.prisma.category.findUnique({
        where: {
          id,
          deletedAt: null
        }
      });

      // アーリーリターン
      if (!existingCategory) {
        throw new Error('分類が見つかりません');
      }

      if (existingCategory.userId !== userId) {
        throw new Error('この分類を削除する権限がありません');
      }

      // 論理削除の実行
      await this.prisma.category.update({
        where: {
          id
        },
        data: {
          deletedAt: new Date()
        }
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new Error('分類が見つかりません');
      }
      // 既にエラーメッセージが設定されている場合はそのまま投げる
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`分類削除に失敗しました: ${error}`);
    }
  }

  // テスト用のクリア機能
  async clear(): Promise<void> {
    try {
      await this.prisma.category.deleteMany({});
    } catch (error) {
      throw new Error(`分類テーブルのクリアに失敗しました: ${error}`);
    }
  }
}