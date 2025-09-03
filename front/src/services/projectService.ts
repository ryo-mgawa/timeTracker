import { apiClient } from './apiClient';
import { Project, ProjectId, UserId } from 'types';

// プロジェクト作成リクエスト型
interface CreateProjectRequest {
  readonly name: string;
  readonly userId: string;
  readonly description?: string;
  readonly color: string;
}

// プロジェクト更新リクエスト型
interface UpdateProjectRequest {
  readonly name?: string;
  readonly description?: string;
  readonly color?: string;
}

// バックエンドからのプロジェクトレスポンス型
interface ProjectApiResponse {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly color: string;
  readonly userId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// プロジェクトサービスクラス
export class ProjectService {
  private readonly ENDPOINT = '/api/projects';

  // ユーザーのプロジェクト一覧を取得
  async getProjectsByUserId(userId: UserId): Promise<readonly Project[]> {
    // アーリーリターン - ユーザーIDの検証
    if (!userId) {
      throw new Error('ユーザーIDが指定されていません');
    }

    try {
      const projects = await apiClient.get<readonly ProjectApiResponse[]>(
        `${this.ENDPOINT}/user/${userId}`
      );
      return this.mapToProjects(projects);
    } catch (error) {
      console.error(`Failed to fetch projects for user ${userId}:`, error);
      throw new Error('プロジェクト一覧の取得に失敗しました');
    }
  }

  // 特定のプロジェクトを取得
  async getProjectById(userId: UserId, id: ProjectId): Promise<Project> {
    // アーリーリターン - パラメータの検証
    if (!userId || !id) {
      throw new Error('ユーザーIDとプロジェクトIDが必要です');
    }

    try {
      const project = await apiClient.get<ProjectApiResponse>(
        `${this.ENDPOINT}/user/${userId}/${id}`
      );
      return this.mapToProject(project);
    } catch (error) {
      console.error(`Failed to fetch project ${id}:`, error);
      throw new Error('プロジェクト情報の取得に失敗しました');
    }
  }

  // プロジェクトを作成
  async createProject(request: CreateProjectRequest): Promise<Project> {
    // アーリーリターン - バリデーション
    if (!request.name || request.name.trim().length === 0) {
      throw new Error('プロジェクト名は必須です');
    }

    if (!request.userId || request.userId.trim().length === 0) {
      throw new Error('ユーザーIDは必須です');
    }

    if (!request.color || request.color.trim().length === 0) {
      throw new Error('カラーは必須です');
    }

    try {
      const project = await apiClient.post<ProjectApiResponse, CreateProjectRequest>(
        this.ENDPOINT, 
        request
      );
      return this.mapToProject(project);
    } catch (error) {
      console.error('Failed to create project:', error);
      throw new Error('プロジェクトの作成に失敗しました');
    }
  }

  // プロジェクトを更新
  async updateProject(userId: UserId, id: ProjectId, request: UpdateProjectRequest): Promise<Project> {
    // アーリーリターン - パラメータの検証
    if (!userId || !id) {
      throw new Error('ユーザーIDとプロジェクトIDが必要です');
    }

    try {
      const project = await apiClient.put<ProjectApiResponse, UpdateProjectRequest>(
        `${this.ENDPOINT}/user/${userId}/${id}`, 
        request
      );
      return this.mapToProject(project);
    } catch (error) {
      console.error(`Failed to update project ${id}:`, error);
      throw new Error('プロジェクトの更新に失敗しました');
    }
  }

  // プロジェクトを削除
  async deleteProject(userId: UserId, id: ProjectId): Promise<void> {
    // アーリーリターン - パラメータの検証
    if (!userId || !id) {
      throw new Error('ユーザーIDとプロジェクトIDが必要です');
    }

    try {
      await apiClient.delete(`${this.ENDPOINT}/user/${userId}/${id}`);
    } catch (error) {
      console.error(`Failed to delete project ${id}:`, error);
      throw new Error('プロジェクトの削除に失敗しました');
    }
  }

  // APIレスポンスをProjectエンティティに変換（単体）
  private mapToProject(apiProject: ProjectApiResponse): Project {
    return {
      id: apiProject.id,
      name: apiProject.name,
      description: apiProject.description || undefined,
      color: apiProject.color,
      userId: apiProject.userId,
      createdAt: new Date(apiProject.createdAt),
      updatedAt: new Date(apiProject.updatedAt)
    };
  }

  // APIレスポンスをProjectエンティティに変換（配列）
  private mapToProjects(apiProjects: readonly ProjectApiResponse[]): readonly Project[] {
    return apiProjects.map(apiProject => this.mapToProject(apiProject));
  }
}

// シングルトンインスタンス
export const projectService = new ProjectService();