import { TaskId, ProjectId, UserId } from '../../shared/types/common';

// タスク名の値オブジェクト
export class TaskName {
  private static readonly MAX_LENGTH = 200;
  private static readonly MIN_LENGTH = 1;

  constructor(private readonly value: string) {
    // アーリーリターンによるバリデーション
    if (!value || value.trim().length === 0) {
      throw new Error('タスク名は必須です');
    }
    
    if (value.length > TaskName.MAX_LENGTH) {
      throw new Error(`タスク名は${TaskName.MAX_LENGTH}文字以下である必要があります`);
    }
    
    if (value.length < TaskName.MIN_LENGTH) {
      throw new Error(`タスク名は${TaskName.MIN_LENGTH}文字以上である必要があります`);
    }
    
    this.value = value.trim();
  }

  getValue(): string {
    return this.value;
  }

  equals(other: TaskName): boolean {
    return this.value === other.value;
  }
}

// タスクエンティティ（特定のプロジェクトに属する）
export class Task {
  private constructor(
    public readonly id: TaskId,
    public readonly name: TaskName,
    public readonly description: string,
    public readonly projectId: ProjectId,
    public readonly userId: UserId,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt?: Date
  ) {}

  // ファクトリーメソッド - 新規作成
  static create(
    name: string,
    projectId: ProjectId,
    userId: UserId,
    description = ''
  ): Task {
    // アーリーリターンによるバリデーション
    if (!projectId) {
      throw new Error('プロジェクトIDは必須です');
    }
    
    if (!userId) {
      throw new Error('ユーザーIDは必須です');
    }

    const taskId = this.generateTaskId();
    const taskName = new TaskName(name);
    const now = new Date();

    return new Task(
      taskId,
      taskName,
      description,
      projectId,
      userId,
      now,
      now
    );
  }

  // ファクトリーメソッド - 復元用
  static restore(
    id: TaskId,
    name: string,
    description: string,
    projectId: ProjectId,
    userId: UserId,
    createdAt: Date,
    updatedAt: Date,
    deletedAt?: Date
  ): Task {
    return new Task(
      id,
      new TaskName(name),
      description,
      projectId,
      userId,
      createdAt,
      updatedAt,
      deletedAt
    );
  }

  // 論理削除
  delete(): Task {
    if (this.isDeleted()) {
      throw new Error('既に削除されたタスクです');
    }

    return new Task(
      this.id,
      this.name,
      this.description,
      this.projectId,
      this.userId,
      this.createdAt,
      new Date(),
      new Date()
    );
  }

  // 名前の更新
  updateName(newName: string): Task {
    if (this.isDeleted()) {
      throw new Error('削除されたタスクは更新できません');
    }

    return new Task(
      this.id,
      new TaskName(newName),
      this.description,
      this.projectId,
      this.userId,
      this.createdAt,
      new Date(),
      this.deletedAt
    );
  }

  // 説明の更新
  updateDescription(newDescription: string): Task {
    if (this.isDeleted()) {
      throw new Error('削除されたタスクは更新できません');
    }

    return new Task(
      this.id,
      this.name,
      newDescription,
      this.projectId,
      this.userId,
      this.createdAt,
      new Date(),
      this.deletedAt
    );
  }

  // プロジェクトの変更（基本的には行わないが、必要に応じて）
  changeProject(newProjectId: ProjectId): Task {
    if (this.isDeleted()) {
      throw new Error('削除されたタスクは更新できません');
    }

    if (!newProjectId) {
      throw new Error('プロジェクトIDは必須です');
    }

    return new Task(
      this.id,
      this.name,
      this.description,
      newProjectId,
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

  // プロジェクト所属チェック
  belongsToProject(projectId: ProjectId): boolean {
    return this.projectId === projectId;
  }

  // 特定のユーザーの特定のプロジェクトに属するかチェック
  belongsToUserAndProject(userId: UserId, projectId: ProjectId): boolean {
    return this.belongsToUser(userId) && this.belongsToProject(projectId);
  }

  // IDの生成
  private static generateTaskId(): TaskId {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 等価性チェック
  equals(other: Task): boolean {
    return this.id === other.id;
  }
}