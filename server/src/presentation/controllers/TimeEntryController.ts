import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma';
import { RealTimeEntryRepository } from '../../infrastructure/repositories/RealTimeEntryRepository';
import { TimeEntry } from '../../domain/entities/TimeEntry';
import { ApiResponse } from '../../shared/types/common';

// 工数エントリ関連の型定義
interface TimeEntryResponse {
  readonly id: string;
  readonly taskId: string;
  readonly categoryId: string;
  readonly userId: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly workDate: string;
  readonly memo?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface CreateTimeEntryRequest {
  readonly taskId: string;
  readonly categoryId: string;
  readonly userId: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly memo?: string;
}

interface UpdateTimeEntryRequest {
  readonly taskId?: string;
  readonly categoryId?: string;
  readonly startTime?: string;
  readonly endTime?: string;
  readonly memo?: string;
}

export class TimeEntryController {
  constructor(private timeEntryRepository: RealTimeEntryRepository) {}

  // ユーザーの工数エントリ一覧取得
  async getTimeEntriesByUserId(req: Request, res: Response): Promise<void> {
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

      const timeEntries = await this.timeEntryRepository.findByUserId(userId);
      
      const timeEntryResponses: readonly TimeEntryResponse[] = timeEntries.map(entry => ({
        id: entry.id,
        taskId: entry.taskId,
        categoryId: entry.categoryId,
        userId: entry.userId,
        startTime: entry.period.startTime.toISOString(),
        endTime: entry.period.endTime.toISOString(),
        workDate: entry.getWorkDate().toISOString().split('T')[0],
        memo: entry.memo,
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString()
      }));

      const response: ApiResponse<readonly TimeEntryResponse[]> = {
        success: true,
        data: timeEntryResponses,
        message: '工数エントリ一覧を取得しました'
      };

      res.json(response);
    } catch (error) {
      console.error('Error fetching time entries:', error);
      
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: '工数エントリ一覧の取得に失敗しました'
      };

      res.status(500).json(errorResponse);
    }
  }

  // 日付指定での工数エントリ取得
  async getTimeEntriesByDate(req: Request, res: Response): Promise<void> {
    try {
      const { userId, date } = req.params;
      
      // アーリーリターン - パラメータが未指定
      if (!userId || !date) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: 'ユーザーIDと日付が必要です'
        };
        res.status(400).json(errorResponse);
        return;
      }

      // 日付バリデーション
      const targetDate = new Date(date);
      if (isNaN(targetDate.getTime())) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: '正しい日付形式で入力してください (YYYY-MM-DD)'
        };
        res.status(400).json(errorResponse);
        return;
      }

      // 日付範囲での検索（その日の0:00から23:59まで）
      const startDate = new Date(targetDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(targetDate);
      endDate.setHours(23, 59, 59, 999);

      const timeEntries = await this.timeEntryRepository.findByUserIdAndDateRange(userId, startDate, endDate);
      
      const timeEntryResponses: readonly TimeEntryResponse[] = timeEntries.map(entry => ({
        id: entry.id,
        taskId: entry.taskId,
        categoryId: entry.categoryId,
        userId: entry.userId,
        startTime: entry.period.startTime.toISOString(),
        endTime: entry.period.endTime.toISOString(),
        workDate: entry.getWorkDate().toISOString().split('T')[0],
        memo: entry.memo,
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString()
      }));

      const response: ApiResponse<readonly TimeEntryResponse[]> = {
        success: true,
        data: timeEntryResponses,
        message: `${date}の工数エントリを取得しました`
      };

      res.json(response);
    } catch (error) {
      console.error('Error fetching time entries by date:', error);
      
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: '指定日の工数エントリ取得に失敗しました'
      };

      res.status(500).json(errorResponse);
    }
  }

  // 特定工数エントリ取得
  async getTimeEntryById(req: Request, res: Response): Promise<void> {
    try {
      const { userId, id } = req.params;
      
      // アーリーリターン - パラメータが未指定
      if (!userId || !id) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: 'ユーザーIDと工数エントリIDが必要です'
        };
        res.status(400).json(errorResponse);
        return;
      }

      const timeEntry = await this.timeEntryRepository.findById(id);
      
      // アーリーリターン - 工数エントリが見つからないか権限なし
      if (!timeEntry || timeEntry.userId !== userId) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: '工数エントリが見つかりません'
        };
        res.status(404).json(errorResponse);
        return;
      }

      const timeEntryResponse: TimeEntryResponse = {
        id: timeEntry.id,
        taskId: timeEntry.taskId,
        categoryId: timeEntry.categoryId,
        userId: timeEntry.userId,
        startTime: timeEntry.period.startTime.toISOString(),
        endTime: timeEntry.period.endTime.toISOString(),
        workDate: timeEntry.getWorkDate().toISOString().split('T')[0],
        memo: timeEntry.memo,
        createdAt: timeEntry.createdAt.toISOString(),
        updatedAt: timeEntry.updatedAt.toISOString()
      };

      const response: ApiResponse<TimeEntryResponse> = {
        success: true,
        data: timeEntryResponse,
        message: '工数エントリ情報を取得しました'
      };

      res.json(response);
    } catch (error) {
      console.error('Error fetching time entry:', error);
      
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: '工数エントリ情報の取得に失敗しました'
      };

      res.status(500).json(errorResponse);
    }
  }

  // 工数エントリ作成
  async createTimeEntry(req: Request, res: Response): Promise<void> {
    try {
      const { taskId, categoryId, userId, startTime, endTime, memo } = req.body as CreateTimeEntryRequest;
      
      // アーリーリターン - 必須項目が未指定
      if (!taskId || taskId.trim().length === 0) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: 'タスクIDは必須です'
        };
        res.status(400).json(errorResponse);
        return;
      }

      if (!categoryId || categoryId.trim().length === 0) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: '分類IDは必須です'
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

      if (!startTime || !endTime) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: '開始時刻と終了時刻は必須です'
        };
        res.status(400).json(errorResponse);
        return;
      }

      // 日付バリデーション
      const start = new Date(startTime);
      const end = new Date(endTime);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: '正しい日時形式で入力してください'
        };
        res.status(400).json(errorResponse);
        return;
      }

      // 工数エントリ作成
      const timeEntry = TimeEntry.create(taskId, categoryId, userId, start, end, memo);
      const savedTimeEntry = await this.timeEntryRepository.save(timeEntry);

      const timeEntryResponse: TimeEntryResponse = {
        id: savedTimeEntry.id,
        taskId: savedTimeEntry.taskId,
        categoryId: savedTimeEntry.categoryId,
        userId: savedTimeEntry.userId,
        startTime: savedTimeEntry.period.startTime.toISOString(),
        endTime: savedTimeEntry.period.endTime.toISOString(),
        workDate: savedTimeEntry.getWorkDate().toISOString().split('T')[0],
        memo: savedTimeEntry.memo,
        createdAt: savedTimeEntry.createdAt.toISOString(),
        updatedAt: savedTimeEntry.updatedAt.toISOString()
      };

      const response: ApiResponse<TimeEntryResponse> = {
        success: true,
        data: timeEntryResponse,
        message: '工数エントリを作成しました'
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Error creating time entry:', error);
      
      const errorMessage = error instanceof Error ? error.message : '工数エントリの作成に失敗しました';
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: errorMessage
      };

      res.status(400).json(errorResponse);
    }
  }

  // 工数エントリ更新
  async updateTimeEntry(req: Request, res: Response): Promise<void> {
    try {
      const { userId, id } = req.params;
      const { taskId, categoryId, startTime, endTime, memo } = req.body as UpdateTimeEntryRequest;
      
      // アーリーリターン - パラメータが未指定
      if (!userId || !id) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: 'ユーザーIDと工数エントリIDが必要です'
        };
        res.status(400).json(errorResponse);
        return;
      }

      // 既存工数エントリ取得
      const existingTimeEntry = await this.timeEntryRepository.findById(id);
      
      // アーリーリターン - 工数エントリが見つからないか権限なし
      if (!existingTimeEntry || existingTimeEntry.userId !== userId) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: '工数エントリが見つかりません'
        };
        res.status(404).json(errorResponse);
        return;
      }

      // 工数エントリ更新
      let updatedTimeEntry = existingTimeEntry;

      // タスクID更新
      if (taskId && taskId.trim().length > 0) {
        updatedTimeEntry = updatedTimeEntry.updateTask(taskId);
      }

      // 分類ID更新
      if (categoryId && categoryId.trim().length > 0) {
        updatedTimeEntry = updatedTimeEntry.updateCategory(categoryId);
      }

      // 時間更新
      if (startTime || endTime) {
        const newStartTime = startTime ? new Date(startTime) : updatedTimeEntry.period.startTime;
        const newEndTime = endTime ? new Date(endTime) : updatedTimeEntry.period.endTime;
        
        if (isNaN(newStartTime.getTime()) || isNaN(newEndTime.getTime())) {
          const errorResponse: ApiResponse<never> = {
            success: false,
            error: '正しい日時形式で入力してください'
          };
          res.status(400).json(errorResponse);
          return;
        }

        updatedTimeEntry = updatedTimeEntry.updatePeriod(newStartTime, newEndTime);
      }

      // メモ更新
      if (memo !== undefined) {
        updatedTimeEntry = updatedTimeEntry.updateMemo(memo);
      }

      const savedTimeEntry = await this.timeEntryRepository.save(updatedTimeEntry);

      const timeEntryResponse: TimeEntryResponse = {
        id: savedTimeEntry.id,
        taskId: savedTimeEntry.taskId,
        categoryId: savedTimeEntry.categoryId,
        userId: savedTimeEntry.userId,
        startTime: savedTimeEntry.period.startTime.toISOString(),
        endTime: savedTimeEntry.period.endTime.toISOString(),
        workDate: savedTimeEntry.getWorkDate().toISOString().split('T')[0],
        memo: savedTimeEntry.memo,
        createdAt: savedTimeEntry.createdAt.toISOString(),
        updatedAt: savedTimeEntry.updatedAt.toISOString()
      };

      const response: ApiResponse<TimeEntryResponse> = {
        success: true,
        data: timeEntryResponse,
        message: '工数エントリを更新しました'
      };

      res.json(response);
    } catch (error) {
      console.error('Error updating time entry:', error);
      
      const errorMessage = error instanceof Error ? error.message : '工数エントリの更新に失敗しました';
      const errorResponse: ApiResponse<never> = {
        success: false,
        error: errorMessage
      };

      res.status(400).json(errorResponse);
    }
  }

  // 工数エントリ削除
  async deleteTimeEntry(req: Request, res: Response): Promise<void> {
    try {
      const { userId, id } = req.params;
      
      // アーリーリターン - パラメータが未指定
      if (!userId || !id) {
        const errorResponse: ApiResponse<never> = {
          success: false,
          error: 'ユーザーIDと工数エントリIDが必要です'
        };
        res.status(400).json(errorResponse);
        return;
      }

      await this.timeEntryRepository.delete(id, userId);

      const response: ApiResponse<never> = {
        success: true,
        message: '工数エントリを削除しました'
      };

      res.json(response);
    } catch (error) {
      console.error('Error deleting time entry:', error);
      
      const errorMessage = error instanceof Error ? error.message : '工数エントリの削除に失敗しました';
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
const timeEntryRepository = new RealTimeEntryRepository(prisma);
export const timeEntryController = new TimeEntryController(timeEntryRepository);