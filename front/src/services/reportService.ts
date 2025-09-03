import { apiClient } from './apiClient';

// レポート関連の型定義
export interface ProjectSummary {
  projectId: string;
  projectName: string;
  projectColor: string;
  totalEntries: number;
  totalHours: number;
  firstWorkDate?: Date;
  lastWorkDate?: Date;
}

export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  totalEntries: number;
  totalHours: number;
  firstWorkDate?: Date;
  lastWorkDate?: Date;
}

export interface DailySummary {
  workDate: Date;
  totalEntries: number;
  totalHours: number;
  projectsCount: number;
  categoriesCount: number;
}

export interface WorkHoursDetail {
  timeEntryId: string;
  userId: string;
  workDate: Date;
  startTime: Date;
  endTime: Date;
  workHours: number;
  memo?: string;
  taskId: string;
  taskName: string;
  taskDescription?: string;
  projectId: string;
  projectName: string;
  projectColor: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  userName: string;
  userEmail: string;
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  projectId?: string;
  categoryId?: string;
}

export class ReportService {
  private readonly ENDPOINT = '/api/reports';

  // プロジェクト別集計を取得
  async getProjectSummary(userId: string, filters?: ReportFilters): Promise<ProjectSummary[]> {
    if (!userId) {
      throw new Error('ユーザーIDが指定されていません');
    }

    try {
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const queryString = params.toString();
      const url = `${this.ENDPOINT}/projects/${userId}${queryString ? `?${queryString}` : ''}`;
      
      const data = await apiClient.get<ProjectSummary[]>(url);
      
      // 日付の変換
      return data.map(item => ({
        ...item,
        firstWorkDate: item.firstWorkDate ? new Date(item.firstWorkDate) : undefined,
        lastWorkDate: item.lastWorkDate ? new Date(item.lastWorkDate) : undefined
      }));
    } catch (error) {
      console.error(`Failed to fetch project summary for user ${userId}:`, error);
      throw new Error('プロジェクト別集計の取得に失敗しました');
    }
  }

  // 分類別集計を取得
  async getCategorySummary(userId: string, filters?: ReportFilters): Promise<CategorySummary[]> {
    if (!userId) {
      throw new Error('ユーザーIDが指定されていません');
    }

    try {
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const queryString = params.toString();
      const url = `${this.ENDPOINT}/categories/${userId}${queryString ? `?${queryString}` : ''}`;
      
      const data = await apiClient.get<CategorySummary[]>(url);
      
      // 日付の変換
      return data.map(item => ({
        ...item,
        firstWorkDate: item.firstWorkDate ? new Date(item.firstWorkDate) : undefined,
        lastWorkDate: item.lastWorkDate ? new Date(item.lastWorkDate) : undefined
      }));
    } catch (error) {
      console.error(`Failed to fetch category summary for user ${userId}:`, error);
      throw new Error('分類別集計の取得に失敗しました');
    }
  }

  // 日別集計を取得
  async getDailySummary(userId: string, filters?: ReportFilters): Promise<DailySummary[]> {
    if (!userId) {
      throw new Error('ユーザーIDが指定されていません');
    }

    try {
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const queryString = params.toString();
      const url = `${this.ENDPOINT}/daily/${userId}${queryString ? `?${queryString}` : ''}`;
      
      const data = await apiClient.get<DailySummary[]>(url);
      
      // 日付の変換
      return data.map(item => ({
        ...item,
        workDate: new Date(item.workDate)
      }));
    } catch (error) {
      console.error(`Failed to fetch daily summary for user ${userId}:`, error);
      throw new Error('日別集計の取得に失敗しました');
    }
  }

  // 工数詳細データを取得
  async getWorkHoursDetail(userId: string, filters?: ReportFilters): Promise<WorkHoursDetail[]> {
    if (!userId) {
      throw new Error('ユーザーIDが指定されていません');
    }

    try {
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.projectId) params.append('projectId', filters.projectId);
      if (filters?.categoryId) params.append('categoryId', filters.categoryId);

      const queryString = params.toString();
      const url = `${this.ENDPOINT}/details/${userId}${queryString ? `?${queryString}` : ''}`;
      
      const data = await apiClient.get<WorkHoursDetail[]>(url);
      
      // 日付の変換
      return data.map(item => ({
        ...item,
        workDate: new Date(item.workDate),
        startTime: new Date(item.startTime),
        endTime: new Date(item.endTime)
      }));
    } catch (error) {
      console.error(`Failed to fetch work hours detail for user ${userId}:`, error);
      throw new Error('工数詳細の取得に失敗しました');
    }
  }

  // 期間の便利メソッド
  getThisMonthPeriod(): { startDate: string; endDate: string } {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    return { startDate, endDate };
  }

  getLastMonthPeriod(): { startDate: string; endDate: string } {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
    return { startDate, endDate };
  }

  getLast30DaysPeriod(): { startDate: string; endDate: string } {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return { startDate, endDate };
  }
}

// シングルトンインスタンス
export const reportService = new ReportService();