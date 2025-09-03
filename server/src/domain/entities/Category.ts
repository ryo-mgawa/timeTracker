import { v4 as uuidv4 } from 'uuid';
import { CategoryId, UserId } from '../../shared/types/common';

// 分類名の値オブジェクト
export class CategoryName {
  private static readonly MAX_LENGTH = 100;
  private static readonly MIN_LENGTH = 1;

  constructor(private readonly value: string) {
    // アーリーリターンによるバリデーション
    if (!value || value.trim().length === 0) {
      throw new Error('分類名は必須です');
    }
    
    if (value.length > CategoryName.MAX_LENGTH) {
      throw new Error(`分類名は${CategoryName.MAX_LENGTH}文字以下である必要があります`);
    }
    
    if (value.length < CategoryName.MIN_LENGTH) {
      throw new Error(`分類名は${CategoryName.MIN_LENGTH}文字以上である必要があります`);
    }
    
    this.value = value.trim();
  }

  getValue(): string {
    return this.value;
  }

  equals(other: CategoryName): boolean {
    return this.value === other.value;
  }
}

// 分類エンティティ（プロジェクト横断で使用可能）
export class Category {
  private constructor(
    public readonly id: CategoryId,
    public readonly name: CategoryName,
    public readonly description: string,
    public readonly color: string,
    public readonly userId: UserId,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt?: Date
  ) {}

  // ファクトリーメソッド - 新規作成
  static create(
    name: string,
    userId: UserId,
    description = '',
    color = '#e74c3c'
  ): Category {
    // アーリーリターン
    if (!userId) {
      throw new Error('ユーザーIDは必須です');
    }

    const categoryId = this.generateCategoryId();
    const categoryName = new CategoryName(name);
    const now = new Date();

    return new Category(
      categoryId,
      categoryName,
      description,
      color,
      userId,
      now,
      now
    );
  }

  // ファクトリーメソッド - 復元用
  static restore(
    id: CategoryId,
    name: string,
    description: string,
    color: string,
    userId: UserId,
    createdAt: Date,
    updatedAt: Date,
    deletedAt?: Date
  ): Category {
    return new Category(
      id,
      new CategoryName(name),
      description,
      color,
      userId,
      createdAt,
      updatedAt,
      deletedAt
    );
  }

  // 論理削除
  delete(): Category {
    if (this.isDeleted()) {
      throw new Error('既に削除された分類です');
    }

    return new Category(
      this.id,
      this.name,
      this.description,
      this.color,
      this.userId,
      this.createdAt,
      new Date(),
      new Date()
    );
  }

  // 名前の更新
  updateName(newName: string): Category {
    if (this.isDeleted()) {
      throw new Error('削除された分類は更新できません');
    }

    return new Category(
      this.id,
      new CategoryName(newName),
      this.description,
      this.color,
      this.userId,
      this.createdAt,
      new Date(),
      this.deletedAt
    );
  }

  // 説明の更新
  updateDescription(newDescription: string): Category {
    if (this.isDeleted()) {
      throw new Error('削除された分類は更新できません');
    }

    return new Category(
      this.id,
      this.name,
      newDescription,
      this.color,
      this.userId,
      this.createdAt,
      new Date(),
      this.deletedAt
    );
  }

  // 色の更新
  updateColor(newColor: string): Category {
    if (this.isDeleted()) {
      throw new Error('削除された分類は更新できません');
    }

    // 色の形式チェック（簡易版）
    if (!newColor.match(/^#[0-9A-Fa-f]{6}$/)) {
      throw new Error('色は16進数カラーコード形式（#RRGGBB）で指定してください');
    }

    return new Category(
      this.id,
      this.name,
      this.description,
      newColor,
      this.userId,
      this.createdAt,
      new Date(),
      this.deletedAt
    );
  }

  // 状態チェック
  isDeleted(): boolean {
    return this.deletedAt !== undefined;
  }

  // 所有者チェック
  belongsToUser(userId: UserId): boolean {
    return this.userId === userId;
  }

  // プロジェクト横断で使用可能かチェック
  isAvailableForAllProjects(): boolean {
    return !this.isDeleted();
  }

  // IDの生成（UUID v4使用）
  private static generateCategoryId(): CategoryId {
    return uuidv4();
  }

  // 等価性チェック
  equals(other: Category): boolean {
    return this.id === other.id;
  }
}