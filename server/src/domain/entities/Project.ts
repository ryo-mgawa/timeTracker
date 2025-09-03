import { ProjectId, UserId } from '../../shared/types/common';

// プロジェクト名の値オブジェクト
export class ProjectName {
  private static readonly MAX_LENGTH = 200;
  private static readonly MIN_LENGTH = 1;

  constructor(private readonly value: string) {
    // アーリーリターンによるバリデーション
    if (!value || value.trim().length === 0) {
      throw new Error('プロジェクト名は必須です');
    }
    
    if (value.length > ProjectName.MAX_LENGTH) {
      throw new Error(`プロジェクト名は${ProjectName.MAX_LENGTH}文字以下である必要があります`);
    }
    
    if (value.length < ProjectName.MIN_LENGTH) {
      throw new Error(`プロジェクト名は${ProjectName.MIN_LENGTH}文字以上である必要があります`);
    }
    
    this.value = value.trim();
  }

  getValue(): string {
    return this.value;
  }

  equals(other: ProjectName): boolean {
    return this.value === other.value;
  }
}

// プロジェクトエンティティ
export class Project {
  private constructor(
    public readonly id: ProjectId,
    public readonly name: ProjectName,
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
    color = '#3498db'
  ): Project {
    // アーリーリターン
    if (!userId) {
      throw new Error('ユーザーIDは必須です');
    }

    const projectId = this.generateProjectId();
    const projectName = new ProjectName(name);
    const now = new Date();

    return new Project(
      projectId,
      projectName,
      description,
      color,
      userId,
      now,
      now
    );
  }

  // ファクトリーメソッド - 復元用
  static restore(
    id: ProjectId,
    name: string,
    description: string,
    color: string,
    userId: UserId,
    createdAt: Date,
    updatedAt: Date,
    deletedAt?: Date
  ): Project {
    return new Project(
      id,
      new ProjectName(name),
      description,
      color,
      userId,
      createdAt,
      updatedAt,
      deletedAt
    );
  }

  // 論理削除
  delete(): Project {
    if (this.isDeleted()) {
      throw new Error('既に削除されたプロジェクトです');
    }

    return new Project(
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
  updateName(newName: string): Project {
    if (this.isDeleted()) {
      throw new Error('削除されたプロジェクトは更新できません');
    }

    return new Project(
      this.id,
      new ProjectName(newName),
      this.description,
      this.color,
      this.userId,
      this.createdAt,
      new Date(),
      this.deletedAt
    );
  }

  // 説明の更新
  updateDescription(newDescription: string): Project {
    if (this.isDeleted()) {
      throw new Error('削除されたプロジェクトは更新できません');
    }

    return new Project(
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
  updateColor(newColor: string): Project {
    if (this.isDeleted()) {
      throw new Error('削除されたプロジェクトは更新できません');
    }

    // 色の形式チェック（簡易版）
    if (!newColor.match(/^#[0-9A-Fa-f]{6}$/)) {
      throw new Error('色は16進数カラーコード形式（#RRGGBB）で指定してください');
    }

    return new Project(
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

  // IDの生成
  private static generateProjectId(): ProjectId {
    return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 等価性チェック
  equals(other: Project): boolean {
    return this.id === other.id;
  }
}