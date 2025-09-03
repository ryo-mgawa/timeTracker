import { apiClient } from './apiClient';
import { Category, CategoryId, UserId } from 'types';

// 分類作成リクエスト型
interface CreateCategoryRequest {
  readonly name: string;
  readonly userId: string;
  readonly description?: string;
  readonly color: string;
}

// 分類更新リクエスト型
interface UpdateCategoryRequest {
  readonly name?: string;
  readonly description?: string;
  readonly color?: string;
}

// バックエンドからの分類レスポンス型
interface CategoryApiResponse {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly color: string;
  readonly userId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// 分類サービスクラス
export class CategoryService {
  private readonly ENDPOINT = '/api/categories';

  // ユーザーの分類一覧を取得
  async getCategoriesByUserId(userId: UserId): Promise<readonly Category[]> {
    // アーリーリターン - ユーザーIDの検証
    if (!userId) {
      throw new Error('ユーザーIDが指定されていません');
    }

    try {
      const categories = await apiClient.get<readonly CategoryApiResponse[]>(
        `${this.ENDPOINT}/user/${userId}`
      );
      return this.mapToCategories(categories);
    } catch (error) {
      console.error(`Failed to fetch categories for user ${userId}:`, error);
      throw new Error('分類一覧の取得に失敗しました');
    }
  }

  // 特定の分類を取得
  async getCategoryById(userId: UserId, id: CategoryId): Promise<Category> {
    // アーリーリターン - パラメータの検証
    if (!userId || !id) {
      throw new Error('ユーザーIDと分類IDが必要です');
    }

    try {
      const category = await apiClient.get<CategoryApiResponse>(
        `${this.ENDPOINT}/user/${userId}/${id}`
      );
      return this.mapToCategory(category);
    } catch (error) {
      console.error(`Failed to fetch category ${id}:`, error);
      throw new Error('分類情報の取得に失敗しました');
    }
  }

  // 分類を作成
  async createCategory(request: CreateCategoryRequest): Promise<Category> {
    // アーリーリターン - バリデーション
    if (!request.name || request.name.trim().length === 0) {
      throw new Error('分類名は必須です');
    }

    if (!request.userId || request.userId.trim().length === 0) {
      throw new Error('ユーザーIDは必須です');
    }

    if (!request.color || request.color.trim().length === 0) {
      throw new Error('カラーは必須です');
    }

    try {
      const category = await apiClient.post<CategoryApiResponse, CreateCategoryRequest>(
        this.ENDPOINT, 
        request
      );
      return this.mapToCategory(category);
    } catch (error) {
      console.error('Failed to create category:', error);
      throw new Error('分類の作成に失敗しました');
    }
  }

  // 分類を更新
  async updateCategory(userId: UserId, id: CategoryId, request: UpdateCategoryRequest): Promise<Category> {
    // アーリーリターン - パラメータの検証
    if (!userId || !id) {
      throw new Error('ユーザーIDと分類IDが必要です');
    }

    try {
      const category = await apiClient.put<CategoryApiResponse, UpdateCategoryRequest>(
        `${this.ENDPOINT}/user/${userId}/${id}`, 
        request
      );
      return this.mapToCategory(category);
    } catch (error) {
      console.error(`Failed to update category ${id}:`, error);
      throw new Error('分類の更新に失敗しました');
    }
  }

  // 分類を削除
  async deleteCategory(userId: UserId, id: CategoryId): Promise<void> {
    // アーリーリターン - パラメータの検証
    if (!userId || !id) {
      throw new Error('ユーザーIDと分類IDが必要です');
    }

    try {
      await apiClient.delete(`${this.ENDPOINT}/user/${userId}/${id}`);
    } catch (error) {
      console.error(`Failed to delete category ${id}:`, error);
      throw new Error('分類の削除に失敗しました');
    }
  }

  // APIレスポンスをCategoryエンティティに変換（単体）
  private mapToCategory(apiCategory: CategoryApiResponse): Category {
    return {
      id: apiCategory.id,
      name: apiCategory.name,
      description: apiCategory.description || undefined,
      color: apiCategory.color,
      userId: apiCategory.userId,
      createdAt: new Date(apiCategory.createdAt),
      updatedAt: new Date(apiCategory.updatedAt)
    };
  }

  // APIレスポンスをCategoryエンティティに変換（配列）
  private mapToCategories(apiCategories: readonly CategoryApiResponse[]): readonly Category[] {
    return apiCategories.map(apiCategory => this.mapToCategory(apiCategory));
  }
}

// シングルトンインスタンス
export const categoryService = new CategoryService();