import { User } from 'domain/entities/User';
import { UserId } from 'shared/types/common';

// メモリ上でユーザーを管理するモックリポジトリ
export class MockUserRepository {
  private users: Map<UserId, User> = new Map();

  constructor() {
    // 初期データを作成
    this.initializeUsers();
  }

  async findAll(): Promise<readonly User[]> {
    const allUsers = Array.from(this.users.values());
    // 削除されていないユーザーのみ返す（アーリーリターンパターン）
    return allUsers.filter(user => !user.isDeleted());
  }

  async findById(id: UserId): Promise<User | null> {
    const user = this.users.get(id);
    
    // アーリーリターン
    if (!user) return null;
    if (user.isDeleted()) return null;
    
    return user;
  }

  async save(user: User): Promise<User> {
    if (!user) {
      throw new Error('ユーザーは必須です');
    }

    this.users.set(user.id, user);
    return user;
  }

  async delete(id: UserId): Promise<void> {
    const user = this.users.get(id);
    
    if (!user) {
      throw new Error('ユーザーが見つかりません');
    }

    // 論理削除
    const deletedUser = user.delete();
    this.users.set(id, deletedUser);
  }

  // テスト用のクリア機能
  async clear(): Promise<void> {
    this.users.clear();
  }

  // 初期データの作成
  private initializeUsers(): void {
    const testUsers = [
      User.create('テストユーザー1', 'user1@example.com'),
      User.create('テストユーザー2', 'user2@example.com'),
      User.create('山田太郎', 'yamada@example.com'),
      User.create('佐藤花子', 'sato@example.com'),
      User.create('鈴木一郎', 'suzuki@example.com')
    ];

    testUsers.forEach(user => {
      this.users.set(user.id, user);
    });
  }
}