import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma';
import { RealUserRepository } from '../../infrastructure/repositories/RealUserRepository';
import { User } from '../../domain/entities/User';
import { ApiResponse } from '../../shared/types/common';

// ユーザー関連の型定義
interface UserResponse {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface CreateUserRequest {
  readonly name: string;
  readonly email?: string;
}

export class UserController {
  constructor(private userRepository: RealUserRepository) {}

  // ユーザー一覧取得
  async getUsers(_req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userRepository.findAll();
      
      const userResponses: readonly UserResponse[] = users.map(user => ({
        id: user.id,
        name: user.name.getValue(),
        email: user.email.getValue(),
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      }));

      const response: ApiResponse<readonly UserResponse[]> = {
        success: true,
        data: userResponses,
        message: 'ユーザー一覧を取得しました'
      };

      res.json(response);
    } catch (error) {
      console.error('Error fetching users:', error);
      
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: 'ユーザー一覧の取得に失敗しました'
      };

      res.status(500).json(errorResponse);
    }
  }

  // ユーザー詳細取得
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // アーリーリターン - IDが未指定
      if (!id) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: 'ユーザーIDが指定されていません'
        };
        res.status(400).json(errorResponse);
        return;
      }

      const user = await this.userRepository.findById(id);
      
      // アーリーリターン - ユーザーが見つからない
      if (!user) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: 'ユーザーが見つかりません'
        };
        res.status(404).json(errorResponse);
        return;
      }

      const userResponse: UserResponse = {
        id: user.id,
        name: user.name.getValue(),
        email: user.email.getValue(),
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      };

      const response: ApiResponse<UserResponse> = {
        success: true,
        data: userResponse,
        message: 'ユーザー情報を取得しました'
      };

      res.json(response);
    } catch (error) {
      console.error('Error fetching user:', error);
      
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: 'ユーザー情報の取得に失敗しました'
      };

      res.status(500).json(errorResponse);
    }
  }

  // ユーザー作成
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { name, email } = req.body as CreateUserRequest;
      
      // アーリーリターン - 名前が未指定
      if (!name || name.trim().length === 0) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: 'ユーザー名は必須です'
        };
        res.status(400).json(errorResponse);
        return;
      }

      // ユーザー作成
      const user = User.create(name, email);
      const savedUser = await this.userRepository.save(user);

      const userResponse: UserResponse = {
        id: savedUser.id,
        name: savedUser.name.getValue(),
        email: savedUser.email.getValue(),
        createdAt: savedUser.createdAt.toISOString(),
        updatedAt: savedUser.updatedAt.toISOString()
      };

      const response: ApiResponse<UserResponse> = {
        success: true,
        data: userResponse,
        message: 'ユーザーを作成しました'
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Error creating user:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'ユーザーの作成に失敗しました';
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
const userRepository = new RealUserRepository(prisma);
export const userController = new UserController(userRepository);