import { PrismaClient, PrismaClientKnownRequestError } from '../../generated/prisma';
import { User } from '../../domain/entities/User';
import { UserId } from '../../shared/types/common';

// Supabase + Prisma を使った実際のユーザーリポジトリ
export class RealUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<readonly User[]> {
    try {
      const prismaUsers = await this.prisma.user.findMany({
        where: {
          deletedAt: null
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      return prismaUsers.map(prismaUser => 
        User.restore(
          prismaUser.id,
          prismaUser.name,
          prismaUser.email || undefined,
          prismaUser.createdAt,
          prismaUser.updatedAt,
          prismaUser.deletedAt || undefined
        )
      );
    } catch (error) {
      throw new Error(`ユーザー一覧の取得に失敗しました: ${error}`);
    }
  }

  async findById(id: UserId): Promise<User | null> {
    // アーリーリターン
    if (!id) return null;

    try {
      const prismaUser = await this.prisma.user.findUnique({
        where: {
          id,
          deletedAt: null
        }
      });

      // アーリーリターン
      if (!prismaUser) return null;

      return User.restore(
        prismaUser.id,
        prismaUser.name,
        prismaUser.email || undefined,
        prismaUser.createdAt,
        prismaUser.updatedAt,
        prismaUser.deletedAt || undefined
      );
    } catch (error) {
      throw new Error(`ユーザー取得に失敗しました: ${error}`);
    }
  }

  async save(user: User): Promise<User> {
    if (!user) {
      throw new Error('ユーザーは必須です');
    }

    try {
      const prismaUser = await this.prisma.user.upsert({
        where: {
          id: user.id
        },
        update: {
          name: user.name.getValue(),
          email: user.email.isEmpty() ? null : user.email.getValue(),
          updatedAt: new Date(),
          deletedAt: user.deletedAt || null
        },
        create: {
          id: user.id,
          name: user.name.getValue(),
          email: user.email.isEmpty() ? null : user.email.getValue()
        }
      });

      return User.restore(
        prismaUser.id,
        prismaUser.name,
        prismaUser.email || undefined,
        prismaUser.createdAt,
        prismaUser.updatedAt,
        prismaUser.deletedAt || undefined
      );
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new Error('このメールアドレスは既に使用されています');
      }
      throw new Error(`ユーザー保存に失敗しました: ${error}`);
    }
  }

  async delete(id: UserId): Promise<void> {
    try {
      await this.prisma.user.update({
        where: {
          id,
          deletedAt: null
        },
        data: {
          deletedAt: new Date()
        }
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new Error('ユーザーが見つかりません');
      }
      throw new Error(`ユーザー削除に失敗しました: ${error}`);
    }
  }

  // テスト用のクリア機能
  async clear(): Promise<void> {
    try {
      await this.prisma.user.deleteMany({});
    } catch (error) {
      throw new Error(`ユーザーテーブルのクリアに失敗しました: ${error}`);
    }
  }
}