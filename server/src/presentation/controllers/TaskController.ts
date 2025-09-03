import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma';
import { RealTaskRepository } from '../../infrastructure/repositories/RealTaskRepository';
import { Task } from '../../domain/entities/Task';
import { ApiResponse } from '../../shared/types/common';

// タスク関連の型定義
interface TaskResponse {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly projectId: string;
  readonly userId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface CreateTaskRequest {
  readonly name: string;
  readonly projectId: string;
  readonly userId: string;
  readonly description?: string;
}

interface UpdateTaskRequest {
  readonly name?: string;
  readonly description?: string;
}

export class TaskController {
  constructor(private taskRepository: RealTaskRepository) {}

  // ユーザーのタスク一覧取得
  async getTasksByUserId(req: Request, res: Response): Promise<void> {
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

      const tasks = await this.taskRepository.findByUserId(userId);
      
      const taskResponses: readonly TaskResponse[] = tasks.map(task => ({
        id: task.id,
        name: task.name.getValue(),
        description: task.description,
        projectId: task.projectId,
        userId: task.userId,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString()
      }));

      const response: ApiResponse<readonly TaskResponse[]> = {
        success: true,
        data: taskResponses,
        message: 'タスク一覧を取得しました'
      };

      res.json(response);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: 'タスク一覧の取得に失敗しました'
      };

      res.status(500).json(errorResponse);
    }
  }

  // プロジェクト内のタスク一覧取得
  async getTasksByProjectId(req: Request, res: Response): Promise<void> {
    try {
      const { userId, projectId } = req.params;
      
      // アーリーリターン - パラメータが未指定
      if (!userId || !projectId) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: 'ユーザーIDとプロジェクトIDが必要です'
        };
        res.status(400).json(errorResponse);
        return;
      }

      const tasks = await this.taskRepository.findByUserIdAndProjectId(userId, projectId);
      
      const taskResponses: readonly TaskResponse[] = tasks.map(task => ({
        id: task.id,
        name: task.name.getValue(),
        description: task.description,
        projectId: task.projectId,
        userId: task.userId,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString()
      }));

      const response: ApiResponse<readonly TaskResponse[]> = {
        success: true,
        data: taskResponses,
        message: 'プロジェクトのタスク一覧を取得しました'
      };

      res.json(response);
    } catch (error) {
      console.error('Error fetching tasks by project:', error);
      
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: 'プロジェクトのタスク一覧の取得に失敗しました'
      };

      res.status(500).json(errorResponse);
    }
  }

  // 特定タスク取得
  async getTaskById(req: Request, res: Response): Promise<void> {
    try {
      const { userId, id } = req.params;
      
      // アーリーリターン - パラメータが未指定
      if (!userId || !id) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: 'ユーザーIDとタスクIDが必要です'
        };
        res.status(400).json(errorResponse);
        return;
      }

      const task = await this.taskRepository.findByUserIdAndId(userId, id);
      
      // アーリーリターン - タスクが見つからない
      if (!task) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: 'タスクが見つかりません'
        };
        res.status(404).json(errorResponse);
        return;
      }

      const taskResponse: TaskResponse = {
        id: task.id,
        name: task.name.getValue(),
        description: task.description,
        projectId: task.projectId,
        userId: task.userId,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString()
      };

      const response: ApiResponse<TaskResponse> = {
        success: true,
        data: taskResponse,
        message: 'タスク情報を取得しました'
      };

      res.json(response);
    } catch (error) {
      console.error('Error fetching task:', error);
      
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: 'タスク情報の取得に失敗しました'
      };

      res.status(500).json(errorResponse);
    }
  }

  // タスク作成
  async createTask(req: Request, res: Response): Promise<void> {
    try {
      const { name, projectId, userId, description } = req.body as CreateTaskRequest;
      
      // アーリーリターン - 必須項目が未指定
      if (!name || name.trim().length === 0) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: 'タスク名は必須です'
        };
        res.status(400).json(errorResponse);
        return;
      }

      if (!projectId || projectId.trim().length === 0) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: 'プロジェクトIDは必須です'
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

      // タスク作成
      const task = Task.create(name, projectId, userId, description || '');
      const savedTask = await this.taskRepository.save(task);

      const taskResponse: TaskResponse = {
        id: savedTask.id,
        name: savedTask.name.getValue(),
        description: savedTask.description,
        projectId: savedTask.projectId,
        userId: savedTask.userId,
        createdAt: savedTask.createdAt.toISOString(),
        updatedAt: savedTask.updatedAt.toISOString()
      };

      const response: ApiResponse<TaskResponse> = {
        success: true,
        data: taskResponse,
        message: 'タスクを作成しました'
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Error creating task:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'タスクの作成に失敗しました';
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: errorMessage
      };

      res.status(400).json(errorResponse);
    }
  }

  // タスク更新
  async updateTask(req: Request, res: Response): Promise<void> {
    try {
      const { userId, id } = req.params;
      const { name, description } = req.body as UpdateTaskRequest;
      
      // アーリーリターン - パラメータが未指定
      if (!userId || !id) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: 'ユーザーIDとタスクIDが必要です'
        };
        res.status(400).json(errorResponse);
        return;
      }

      // 既存タスク取得
      const existingTask = await this.taskRepository.findByUserIdAndId(userId, id);
      
      // アーリーリターン - タスクが見つからない
      if (!existingTask) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: 'タスクが見つかりません'
        };
        res.status(404).json(errorResponse);
        return;
      }

      // タスク更新
      let updatedTask = existingTask;
      
      if (name && name.trim().length > 0) {
        updatedTask = updatedTask.updateName(name);
      }
      
      if (description !== undefined) {
        updatedTask = updatedTask.updateDescription(description);
      }

      const savedTask = await this.taskRepository.save(updatedTask);

      const taskResponse: TaskResponse = {
        id: savedTask.id,
        name: savedTask.name.getValue(),
        description: savedTask.description,
        projectId: savedTask.projectId,
        userId: savedTask.userId,
        createdAt: savedTask.createdAt.toISOString(),
        updatedAt: savedTask.updatedAt.toISOString()
      };

      const response: ApiResponse<TaskResponse> = {
        success: true,
        data: taskResponse,
        message: 'タスクを更新しました'
      };

      res.json(response);
    } catch (error) {
      console.error('Error updating task:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'タスクの更新に失敗しました';
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: errorMessage
      };

      res.status(400).json(errorResponse);
    }
  }

  // タスク削除
  async deleteTask(req: Request, res: Response): Promise<void> {
    try {
      const { userId, id } = req.params;
      
      // アーリーリターン - パラメータが未指定
      if (!userId || !id) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: 'ユーザーIDとタスクIDが必要です'
        };
        res.status(400).json(errorResponse);
        return;
      }

      await this.taskRepository.delete(id, userId);

      const response: ApiResponse<never> = {
        success: true,
        message: 'タスクを削除しました'
      };

      res.json(response);
    } catch (error) {
      console.error('Error deleting task:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'タスクの削除に失敗しました';
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
const taskRepository = new RealTaskRepository(prisma);
export const taskController = new TaskController(taskRepository);