import { v4 as uuidv4 } from 'uuid';
import { UserId } from '../../shared/types/common';

// 値オブジェクトの定義
export class UserName {
  private static readonly MAX_LENGTH = 100;
  private static readonly MIN_LENGTH = 1;

  constructor(private readonly value: string) {
    // アーリーリターンによるバリデーション
    if (!value || value.trim().length === 0) {
      throw new Error('ユーザー名は必須です');
    }
    
    if (value.length > UserName.MAX_LENGTH) {
      throw new Error(`ユーザー名は${UserName.MAX_LENGTH}文字以下である必要があります`);
    }
    
    if (value.length < UserName.MIN_LENGTH) {
      throw new Error(`ユーザー名は${UserName.MIN_LENGTH}文字以上である必要があります`);
    }
    
    this.value = value.trim();
  }

  getValue(): string {
    return this.value;
  }

  equals(other: UserName): boolean {
    return this.value === other.value;
  }
}

export class Email {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(private readonly value: string) {
    // アーリーリターン - 空文字は許可（オプショナル）
    if (!value || value.trim().length === 0) {
      this.value = '';
      return;
    }
    
    if (!Email.EMAIL_REGEX.test(value)) {
      throw new Error('有効なメールアドレスを入力してください');
    }
    
    this.value = value.toLowerCase().trim();
  }

  getValue(): string {
    return this.value;
  }

  isEmpty(): boolean {
    return this.value.length === 0;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}

// ユーザーエンティティ（設計書の実装例に基づく）
export class User {
  private constructor(
    public readonly id: UserId,
    public readonly name: UserName,
    public readonly email: Email,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt?: Date
  ) {}

  // ファクトリーメソッド - 新規作成
  static create(name: string, email?: string): User {
    const userId = this.generateUserId();
    const userName = new UserName(name);
    const userEmail = new Email(email || '');
    const now = new Date();

    return new User(
      userId,
      userName,
      userEmail,
      now,
      now
    );
  }

  // ファクトリーメソッド - 復元用
  static restore(
    id: UserId,
    name: string,
    email: string | undefined,
    createdAt: Date,
    updatedAt: Date,
    deletedAt?: Date
  ): User {
    return new User(
      id,
      new UserName(name),
      new Email(email || ''),
      createdAt,
      updatedAt,
      deletedAt
    );
  }

  // 論理削除
  delete(): User {
    if (this.isDeleted()) {
      throw new Error('既に削除されたユーザーです');
    }

    return new User(
      this.id,
      this.name,
      this.email,
      this.createdAt,
      new Date(),
      new Date()
    );
  }

  // 名前の更新
  updateName(newName: string): User {
    if (this.isDeleted()) {
      throw new Error('削除されたユーザーは更新できません');
    }

    return new User(
      this.id,
      new UserName(newName),
      this.email,
      this.createdAt,
      new Date(),
      this.deletedAt
    );
  }

  // 状態チェック
  isDeleted(): boolean {
    return this.deletedAt !== undefined;
  }

  // IDの生成（UUID v4使用）
  private static generateUserId(): UserId {
    return uuidv4();
  }

  // 等価性チェック
  equals(other: User): boolean {
    return this.id === other.id;
  }
}