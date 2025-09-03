import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma';
import { RealCategoryRepository } from '../../infrastructure/repositories/RealCategoryRepository';
import { Category } from '../../domain/entities/Category';
import { ApiResponse } from '../../shared/types/common';

// 分類関連の型定義
interface CategoryResponse {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly color: string;
  readonly userId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface CreateCategoryRequest {
  readonly name: string;
  readonly userId: string;
  readonly description?: string;
  readonly color?: string;
}

interface UpdateCategoryRequest {
  readonly name?: string;
  readonly description?: string;
  readonly color?: string;
}

export class CategoryController {
  constructor(private categoryRepository: RealCategoryRepository) {}

  // ユーザーの分類一覧取得
  async getCategoriesByUserId(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      // アーリーリターン - ユーザーIDが未指定
      if (!userId) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: 'ユーザーIDが指定されていません'
        };
        res.status(400).json(errorResponse);
        return;
      }

      const categories = await this.categoryRepository.findByUserId(userId);
      
      const categoryResponses: readonly CategoryResponse[] = categories.map(category => ({
        id: category.id,
        name: category.name.getValue(),
        description: category.description,
        color: category.color,
        userId: category.userId,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString()
      }));

      const response: ApiResponse<readonly CategoryResponse[]> = {
        success: true,
        data: categoryResponses,
        message: '分類一覧を取得しました'
      };

      res.json(response);
    } catch (error) {
      console.error('Error fetching categories:', error);
      
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: '分類一覧の取得に失敗しました'
      };

      res.status(500).json(errorResponse);
    }
  }

  // 特定分類取得
  async getCategoryById(req: Request, res: Response): Promise<void> {
    try {
      const { userId, id } = req.params;
      
      // アーリーリターン - パラメータが未指定
      if (!userId || !id) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: 'ユーザーIDと分類IDが必要です'
        };
        res.status(400).json(errorResponse);
        return;
      }

      const category = await this.categoryRepository.findByUserIdAndId(userId, id);
      
      // アーリーリターン - 分類が見つからない
      if (!category) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: '分類が見つかりません'
        };
        res.status(404).json(errorResponse);
        return;
      }

      const categoryResponse: CategoryResponse = {
        id: category.id,
        name: category.name.getValue(),
        description: category.description,
        color: category.color,
        userId: category.userId,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString()
      };

      const response: ApiResponse<CategoryResponse> = {
        success: true,
        data: categoryResponse,
        message: '分類情報を取得しました'
      };

      res.json(response);
    } catch (error) {
      console.error('Error fetching category:', error);
      
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: '分類情報の取得に失敗しました'
      };

      res.status(500).json(errorResponse);
    }
  }

  // 分類作成
  async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const { name, userId, description, color } = req.body as CreateCategoryRequest;
      
      // アーリーリターン - 必須項目が未指定
      if (!name || name.trim().length === 0) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: '分類名は必須です'
        };
        res.status(400).json(errorResponse);
        return;
      }

      if (!userId || userId.trim().length === 0) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: 'ユーザーIDは必須です'
        };
        res.status(400).json(errorResponse);
        return;
      }

      // 分類作成
      const category = Category.create(name, userId, description || '', color);
      const savedCategory = await this.categoryRepository.save(category);

      const categoryResponse: CategoryResponse = {
        id: savedCategory.id,
        name: savedCategory.name.getValue(),
        description: savedCategory.description,
        color: savedCategory.color,
        userId: savedCategory.userId,
        createdAt: savedCategory.createdAt.toISOString(),
        updatedAt: savedCategory.updatedAt.toISOString()
      };

      const response: ApiResponse<CategoryResponse> = {
        success: true,
        data: categoryResponse,
        message: '分類を作成しました'
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Error creating category:', error);
      
      const errorMessage = error instanceof Error ? error.message : '分類の作成に失敗しました';
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: errorMessage
      };

      res.status(400).json(errorResponse);
    }
  }

  // 分類更新
  async updateCategory(req: Request, res: Response): Promise<void> {
    try {
      const { userId, id } = req.params;
      const { name, description, color } = req.body as UpdateCategoryRequest;
      
      // アーリーリターン - パラメータが未指定
      if (!userId || !id) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: 'ユーザーIDと分類IDが必要です'
        };
        res.status(400).json(errorResponse);
        return;
      }

      // 既存分類取得
      const existingCategory = await this.categoryRepository.findByUserIdAndId(userId, id);
      
      // アーリーリターン - 分類が見つからない
      if (!existingCategory) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: '分類が見つかりません'
        };
        res.status(404).json(errorResponse);
        return;
      }

      // 分類更新
      let updatedCategory = existingCategory;
      
      if (name && name.trim().length > 0) {
        updatedCategory = updatedCategory.updateName(name);
      }
      
      if (description !== undefined) {
        updatedCategory = updatedCategory.updateDescription(description);
      }
      
      if (color && color.trim().length > 0) {
        updatedCategory = updatedCategory.updateColor(color);
      }

      const savedCategory = await this.categoryRepository.save(updatedCategory);

      const categoryResponse: CategoryResponse = {
        id: savedCategory.id,
        name: savedCategory.name.getValue(),
        description: savedCategory.description,
        color: savedCategory.color,
        userId: savedCategory.userId,
        createdAt: savedCategory.createdAt.toISOString(),
        updatedAt: savedCategory.updatedAt.toISOString()
      };

      const response: ApiResponse<CategoryResponse> = {
        success: true,
        data: categoryResponse,
        message: '分類を更新しました'
      };

      res.json(response);
    } catch (error) {
      console.error('Error updating category:', error);
      
      const errorMessage = error instanceof Error ? error.message : '分類の更新に失敗しました';
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: errorMessage
      };

      res.status(400).json(errorResponse);
    }
  }

  // 分類削除
  async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      const { userId, id } = req.params;
      
      // アーリーリターン - パラメータが未指定
      if (!userId || !id) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: 'ユーザーIDと分類IDが必要です'
        };
        res.status(400).json(errorResponse);
        return;
      }

      await this.categoryRepository.delete(id, userId);

      const response: ApiResponse<never> = {
        success: true,
        message: '分類を削除しました'
      };

      res.json(response);
    } catch (error) {
      console.error('Error deleting category:', error);
      
      const errorMessage = error instanceof Error ? error.message : '分類の削除に失敗しました';
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: errorMessage
      };

      res.status(400).json(errorResponse);
    }
  }
}

// インスタンス化してエクスポート
const prisma = new PrismaClient();
const categoryRepository = new RealCategoryRepository(prisma);
export const categoryController = new CategoryController(categoryRepository);