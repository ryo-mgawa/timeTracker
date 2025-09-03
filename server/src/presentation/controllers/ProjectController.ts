import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma';
import { RealProjectRepository } from '../../infrastructure/repositories/RealProjectRepository';
import { Project } from '../../domain/entities/Project';
import { ApiResponse } from '../../shared/types/common';

// プロジェクト関連の型定義
interface ProjectResponse {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly color: string;
  readonly userId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface CreateProjectRequest {
  readonly name: string;
  readonly userId: string;
  readonly description?: string;
  readonly color?: string;
}

interface UpdateProjectRequest {
  readonly name?: string;
  readonly description?: string;
  readonly color?: string;
}

export class ProjectController {
  constructor(private projectRepository: RealProjectRepository) {}

  // ユーザーのプロジェクト一覧取得
  async getProjectsByUserId(req: Request, res: Response): Promise<void> {
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

      const projects = await this.projectRepository.findByUserId(userId);
      
      const projectResponses: readonly ProjectResponse[] = projects.map(project => ({
        id: project.id,
        name: project.name.getValue(),
        description: project.description,
        color: project.color,
        userId: project.userId,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString()
      }));

      const response: ApiResponse<readonly ProjectResponse[]> = {
        success: true,
        data: projectResponses,
        message: 'プロジェクト一覧を取得しました'
      };

      res.json(response);
    } catch (error) {
      console.error('Error fetching projects:', error);
      
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: 'プロジェクト一覧の取得に失敗しました'
      };

      res.status(500).json(errorResponse);
    }
  }

  // 特定プロジェクト取得
  async getProjectById(req: Request, res: Response): Promise<void> {
    try {
      const { userId, id } = req.params;
      
      // アーリーリターン - パラメータが未指定
      if (!userId || !id) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: 'ユーザーIDとプロジェクトIDが必要です'
        };
        res.status(400).json(errorResponse);
        return;
      }

      const project = await this.projectRepository.findByUserIdAndId(userId, id);
      
      // アーリーリターン - プロジェクトが見つからない
      if (!project) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: 'プロジェクトが見つかりません'
        };
        res.status(404).json(errorResponse);
        return;
      }

      const projectResponse: ProjectResponse = {
        id: project.id,
        name: project.name.getValue(),
        description: project.description,
        color: project.color,
        userId: project.userId,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString()
      };

      const response: ApiResponse<ProjectResponse> = {
        success: true,
        data: projectResponse,
        message: 'プロジェクト情報を取得しました'
      };

      res.json(response);
    } catch (error) {
      console.error('Error fetching project:', error);
      
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: 'プロジェクト情報の取得に失敗しました'
      };

      res.status(500).json(errorResponse);
    }
  }

  // プロジェクト作成
  async createProject(req: Request, res: Response): Promise<void> {
    try {
      const { name, userId, description, color } = req.body as CreateProjectRequest;
      
      // アーリーリターン - 必須項目が未指定
      if (!name || name.trim().length === 0) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: 'プロジェクト名は必須です'
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

      // プロジェクト作成
      const project = Project.create(name, userId, description || '', color);
      const savedProject = await this.projectRepository.save(project);

      const projectResponse: ProjectResponse = {
        id: savedProject.id,
        name: savedProject.name.getValue(),
        description: savedProject.description,
        color: savedProject.color,
        userId: savedProject.userId,
        createdAt: savedProject.createdAt.toISOString(),
        updatedAt: savedProject.updatedAt.toISOString()
      };

      const response: ApiResponse<ProjectResponse> = {
        success: true,
        data: projectResponse,
        message: 'プロジェクトを作成しました'
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Error creating project:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'プロジェクトの作成に失敗しました';
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: errorMessage
      };

      res.status(400).json(errorResponse);
    }
  }

  // プロジェクト更新
  async updateProject(req: Request, res: Response): Promise<void> {
    try {
      const { userId, id } = req.params;
      const { name, description, color } = req.body as UpdateProjectRequest;
      
      // アーリーリターン - パラメータが未指定
      if (!userId || !id) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: 'ユーザーIDとプロジェクトIDが必要です'
        };
        res.status(400).json(errorResponse);
        return;
      }

      // 既存プロジェクト取得
      const existingProject = await this.projectRepository.findByUserIdAndId(userId, id);
      
      // アーリーリターン - プロジェクトが見つからない
      if (!existingProject) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: 'プロジェクトが見つかりません'
        };
        res.status(404).json(errorResponse);
        return;
      }

      // プロジェクト更新
      let updatedProject = existingProject;
      
      if (name && name.trim().length > 0) {
        updatedProject = updatedProject.updateName(name);
      }
      
      if (description !== undefined) {
        updatedProject = updatedProject.updateDescription(description);
      }
      
      if (color && color.trim().length > 0) {
        updatedProject = updatedProject.updateColor(color);
      }

      const savedProject = await this.projectRepository.save(updatedProject);

      const projectResponse: ProjectResponse = {
        id: savedProject.id,
        name: savedProject.name.getValue(),
        description: savedProject.description,
        color: savedProject.color,
        userId: savedProject.userId,
        createdAt: savedProject.createdAt.toISOString(),
        updatedAt: savedProject.updatedAt.toISOString()
      };

      const response: ApiResponse<ProjectResponse> = {
        success: true,
        data: projectResponse,
        message: 'プロジェクトを更新しました'
      };

      res.json(response);
    } catch (error) {
      console.error('Error updating project:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'プロジェクトの更新に失敗しました';
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: errorMessage
      };

      res.status(400).json(errorResponse);
    }
  }

  // プロジェクト削除
  async deleteProject(req: Request, res: Response): Promise<void> {
    try {
      const { userId, id } = req.params;
      
      // アーリーリターン - パラメータが未指定
      if (!userId || !id) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: 'ユーザーIDとプロジェクトIDが必要です'
        };
        res.status(400).json(errorResponse);
        return;
      }

      await this.projectRepository.delete(id, userId);

      const response: ApiResponse<never> = {
        success: true,
        message: 'プロジェクトを削除しました'
      };

      res.json(response);
    } catch (error) {
      console.error('Error deleting project:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'プロジェクトの削除に失敗しました';
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
const projectRepository = new RealProjectRepository(prisma);
export const projectController = new ProjectController(projectRepository);