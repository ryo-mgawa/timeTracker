import { apiClient } from './apiClient';
import { User, UserId } from 'types';

// ユーザー作成リクエスト型
interface CreateUserRequest {
  readonly name: string;
  readonly email?: string;
}

// バックエンドからのユーザーレスポンス型
interface UserApiResponse {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// ユーザーサービスクラス
export class UserService {
  private readonly ENDPOINT = '/api/users';

  // ユーザー一覧を取得
  async getUsers(): Promise<readonly User[]> {
    try {
      const users = await apiClient.get<readonly UserApiResponse[]>(this.ENDPOINT);
      return this.mapToUsers(users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw new Error('ユーザー一覧の取得に失敗しました');
    }
  }

  // 特定のユーザーを取得
  async getUserById(id: UserId): Promise<User> {
    // アーリーリターン - IDの検証
    if (!id) {
      throw new Error('ユーザーIDが指定されていません');
    }

    try {
      const user = await apiClient.get<UserApiResponse>(`${this.ENDPOINT}/${id}`);
      return this.mapToUser(user);
    } catch (error) {
      console.error(`Failed to fetch user ${id}:`, error);
      throw new Error('ユーザー情報の取得に失敗しました');
    }
  }

  // ユーザーを作成
  async createUser(request: CreateUserRequest): Promise<User> {
    // アーリーリターン - バリデーション
    if (!request.name || request.name.trim().length === 0) {
      throw new Error('ユーザー名は必須です');
    }

    try {
      const user = await apiClient.post<UserApiResponse, CreateUserRequest>(
        this.ENDPOINT, 
        request
      );
      return this.mapToUser(user);
    } catch (error) {
      console.error('Failed to create user:', error);
      throw new Error('ユーザーの作成に失敗しました');
    }
  }

  // APIレスポンスをUserエンティティに変換（単体）
  private mapToUser(apiUser: UserApiResponse): User {
    return {
      id: apiUser.id,
      name: apiUser.name,
      email: apiUser.email || undefined,
      createdAt: new Date(apiUser.createdAt),
      updatedAt: new Date(apiUser.updatedAt)
    };
  }

  // APIレスポンスをUserエンティティに変換（配列）
  private mapToUsers(apiUsers: readonly UserApiResponse[]): readonly User[] {
    return apiUsers.map(apiUser => this.mapToUser(apiUser));
  }
}

// シングルトンインスタンス
export const userService = new UserService();