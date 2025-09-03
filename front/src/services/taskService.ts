import { apiClient } from './apiClient';
import { Task, TaskId, ProjectId, UserId } from 'types';

// タスク作成リクエスト型
interface CreateTaskRequest {
  readonly name: string;
  readonly projectId: string;
  readonly userId: string;
  readonly description?: string;
}

// タスク更新リクエスト型
interface UpdateTaskRequest {
  readonly name?: string;
  readonly description?: string;
}

// バックエンドからのタスクレスポンス型
interface TaskApiResponse {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly projectId: string;
  readonly userId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// タスクサービスクラス
export class TaskService {
  private readonly ENDPOINT = '/api/tasks';

  // ユーザーのタスク一覧を取得
  async getTasksByUserId(userId: UserId): Promise<readonly Task[]> {
    // アーリーリターン - ユーザーIDの検証
    if (!userId) {
      throw new Error('ユーザーIDが指定されていません');
    }

    try {
      const tasks = await apiClient.get<readonly TaskApiResponse[]>(
        `${this.ENDPOINT}/user/${userId}`
      );
      return this.mapToTasks(tasks);
    } catch (error) {
      console.error(`Failed to fetch tasks for user ${userId}:`, error);
      throw new Error('タスク一覧の取得に失敗しました');
    }
  }

  // プロジェクト内のタスク一覧を取得
  async getTasksByProjectId(userId: UserId, projectId: ProjectId): Promise<readonly Task[]> {
    // アーリーリターン - パラメータの検証
    if (!userId || !projectId) {
      throw new Error('ユーザーIDとプロジェクトIDが必要です');
    }

    try {
      const tasks = await apiClient.get<readonly TaskApiResponse[]>(
        `${this.ENDPOINT}/user/${userId}/project/${projectId}`
      );
      return this.mapToTasks(tasks);
    } catch (error) {
      console.error(`Failed to fetch tasks for project ${projectId}:`, error);
      throw new Error('プロジェクトのタスク一覧の取得に失敗しました');
    }
  }

  // 特定のタスクを取得
  async getTaskById(userId: UserId, id: TaskId): Promise<Task> {
    // アーリーリターン - パラメータの検証
    if (!userId || !id) {
      throw new Error('ユーザーIDとタスクIDが必要です');
    }

    try {
      const task = await apiClient.get<TaskApiResponse>(
        `${this.ENDPOINT}/user/${userId}/${id}`
      );
      return this.mapToTask(task);
    } catch (error) {
      console.error(`Failed to fetch task ${id}:`, error);
      throw new Error('タスク情報の取得に失敗しました');
    }
  }

  // タスクを作成
  async createTask(request: CreateTaskRequest): Promise<Task> {
    // アーリーリターン - バリデーション
    if (!request.name || request.name.trim().length === 0) {
      throw new Error('タスク名は必須です');
    }

    if (!request.projectId || request.projectId.trim().length === 0) {
      throw new Error('プロジェクトIDは必須です');
    }

    if (!request.userId || request.userId.trim().length === 0) {
      throw new Error('ユーザーIDは必須です');
    }

    try {
      const task = await apiClient.post<TaskApiResponse, CreateTaskRequest>(
        this.ENDPOINT, 
        request
      );
      return this.mapToTask(task);
    } catch (error) {
      console.error('Failed to create task:', error);
      throw new Error('タスクの作成に失敗しました');
    }
  }

  // タスクを更新
  async updateTask(userId: UserId, id: TaskId, request: UpdateTaskRequest): Promise<Task> {
    // アーリーリターン - パラメータの検証
    if (!userId || !id) {
      throw new Error('ユーザーIDとタスクIDが必要です');
    }

    try {
      const task = await apiClient.put<TaskApiResponse, UpdateTaskRequest>(
        `${this.ENDPOINT}/user/${userId}/${id}`, 
        request
      );
      return this.mapToTask(task);
    } catch (error) {
      console.error(`Failed to update task ${id}:`, error);
      throw new Error('タスクの更新に失敗しました');
    }
  }

  // タスクを削除
  async deleteTask(userId: UserId, id: TaskId): Promise<void> {
    // アーリーリターン - パラメータの検証
    if (!userId || !id) {
      throw new Error('ユーザーIDとタスクIDが必要です');
    }

    try {
      await apiClient.delete(`${this.ENDPOINT}/user/${userId}/${id}`);
    } catch (error) {
      console.error(`Failed to delete task ${id}:`, error);
      throw new Error('タスクの削除に失敗しました');
    }
  }

  // APIレスポンスをTaskエンティティに変換（単体）
  private mapToTask(apiTask: TaskApiResponse): Task {
    return {
      id: apiTask.id,
      name: apiTask.name,
      description: apiTask.description || undefined,
      projectId: apiTask.projectId,
      userId: apiTask.userId,
      createdAt: new Date(apiTask.createdAt),
      updatedAt: new Date(apiTask.updatedAt)
    };
  }

  // APIレスポンスをTaskエンティティに変換（配列）
  private mapToTasks(apiTasks: readonly TaskApiResponse[]): readonly Task[] {
    return apiTasks.map(apiTask => this.mapToTask(apiTask));
  }
}

// シングルトンインスタンス
export const taskService = new TaskService();