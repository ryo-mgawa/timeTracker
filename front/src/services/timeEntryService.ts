import { apiClient } from './apiClient';
import { TimeEntry, TimeEntryId, TaskId, CategoryId, UserId } from 'types';

// 工数エントリ作成リクエスト型
interface CreateTimeEntryRequest {
  readonly taskId: string;
  readonly categoryId: string;
  readonly userId: string;
  readonly startTime: string; // ISO文字列
  readonly endTime: string;   // ISO文字列
  readonly memo?: string;
}

// 工数エントリ更新リクエスト型
interface UpdateTimeEntryRequest {
  readonly taskId?: string;
  readonly categoryId?: string;
  readonly startTime?: string; // ISO文字列
  readonly endTime?: string;   // ISO文字列
  readonly memo?: string;
}

// バックエンドからの工数エントリレスポンス型
interface TimeEntryApiResponse {
  readonly id: string;
  readonly taskId: string;
  readonly categoryId: string;
  readonly userId: string;
  readonly startTime: string;
  readonly endTime: string;
  readonly workDate: string; // バックエンドは workDate
  readonly memo?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// 工数エントリサービスクラス
export class TimeEntryService {
  private readonly ENDPOINT = '/api/time-entries';

  // ユーザーの工数エントリ一覧を取得
  async getTimeEntriesByUserId(userId: UserId): Promise<readonly TimeEntry[]> {
    // アーリーリターン - ユーザーIDの検証
    if (!userId) {
      throw new Error('ユーザーIDが指定されていません');
    }

    try {
      const timeEntries = await apiClient.get<readonly TimeEntryApiResponse[]>(
        `${this.ENDPOINT}/user/${userId}`
      );
      return this.mapToTimeEntries(timeEntries);
    } catch (error) {
      console.error(`Failed to fetch time entries for user ${userId}:`, error);
      throw new Error('工数エントリ一覧の取得に失敗しました');
    }
  }

  // 日付指定での工数エントリ取得
  async getTimeEntriesByDate(userId: UserId, date: Date): Promise<readonly TimeEntry[]> {
    // アーリーリターン - パラメータの検証
    if (!userId) {
      throw new Error('ユーザーIDが指定されていません');
    }

    if (!date || isNaN(date.getTime())) {
      throw new Error('正しい日付を指定してください');
    }

    try {
      const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD形式
      const timeEntries = await apiClient.get<readonly TimeEntryApiResponse[]>(
        `${this.ENDPOINT}/user/${userId}/date/${dateString}`
      );
      return this.mapToTimeEntries(timeEntries);
    } catch (error) {
      console.error(`Failed to fetch time entries for date ${date}:`, error);
      throw new Error('指定日の工数エントリ取得に失敗しました');
    }
  }

  // 特定の工数エントリを取得
  async getTimeEntryById(userId: UserId, id: TimeEntryId): Promise<TimeEntry> {
    // アーリーリターン - パラメータの検証
    if (!userId || !id) {
      throw new Error('ユーザーIDと工数エントリIDが必要です');
    }

    try {
      const timeEntry = await apiClient.get<TimeEntryApiResponse>(
        `${this.ENDPOINT}/user/${userId}/${id}`
      );
      return this.mapToTimeEntry(timeEntry);
    } catch (error) {
      console.error(`Failed to fetch time entry ${id}:`, error);
      throw new Error('工数エントリ情報の取得に失敗しました');
    }
  }

  // 工数エントリを作成
  async createTimeEntry(
    taskId: TaskId, 
    categoryId: CategoryId, 
    userId: UserId,
    startTime: Date, 
    endTime: Date, 
    memo?: string
  ): Promise<TimeEntry> {
    // アーリーリターン - バリデーション
    if (!taskId || taskId.trim().length === 0) {
      throw new Error('タスクIDは必須です');
    }

    if (!categoryId || categoryId.trim().length === 0) {
      throw new Error('分類IDは必須です');
    }

    if (!userId || userId.trim().length === 0) {
      throw new Error('ユーザーIDは必須です');
    }

    if (!startTime || isNaN(startTime.getTime())) {
      throw new Error('正しい開始時刻を入力してください');
    }

    if (!endTime || isNaN(endTime.getTime())) {
      throw new Error('正しい終了時刻を入力してください');
    }

    if (endTime <= startTime) {
      throw new Error('終了時刻は開始時刻より後である必要があります');
    }

    // 15分刻み制約の確認
    if (!this.isValidMinuteInterval(startTime) || !this.isValidMinuteInterval(endTime)) {
      throw new Error('時刻は15分刻み（0, 15, 30, 45分）で入力してください');
    }

    const request: CreateTimeEntryRequest = {
      taskId,
      categoryId,
      userId,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      memo
    };

    try {
      const timeEntry = await apiClient.post<TimeEntryApiResponse, CreateTimeEntryRequest>(
        this.ENDPOINT, 
        request
      );
      return this.mapToTimeEntry(timeEntry);
    } catch (error) {
      console.error('Failed to create time entry:', error);
      throw new Error('工数エントリの作成に失敗しました');
    }
  }

  // 工数エントリを更新
  async updateTimeEntry(userId: UserId, id: TimeEntryId, request: UpdateTimeEntryRequest): Promise<TimeEntry> {
    // アーリーリターン - パラメータの検証
    if (!userId || !id) {
      throw new Error('ユーザーIDと工数エントリIDが必要です');
    }

    // 時刻の15分刻み制約確認
    if (request.startTime) {
      const startTime = new Date(request.startTime);
      if (!this.isValidMinuteInterval(startTime)) {
        throw new Error('開始時刻は15分刻み（0, 15, 30, 45分）で入力してください');
      }
    }

    if (request.endTime) {
      const endTime = new Date(request.endTime);
      if (!this.isValidMinuteInterval(endTime)) {
        throw new Error('終了時刻は15分刻み（0, 15, 30, 45分）で入力してください');
      }
    }

    try {
      const timeEntry = await apiClient.put<TimeEntryApiResponse, UpdateTimeEntryRequest>(
        `${this.ENDPOINT}/user/${userId}/${id}`, 
        request
      );
      return this.mapToTimeEntry(timeEntry);
    } catch (error) {
      console.error(`Failed to update time entry ${id}:`, error);
      throw new Error('工数エントリの更新に失敗しました');
    }
  }

  // 工数エントリを削除
  async deleteTimeEntry(userId: UserId, id: TimeEntryId): Promise<void> {
    // アーリーリターン - パラメータの検証
    if (!userId || !id) {
      throw new Error('ユーザーIDと工数エントリIDが必要です');
    }

    try {
      await apiClient.delete(`${this.ENDPOINT}/user/${userId}/${id}`);
    } catch (error) {
      console.error(`Failed to delete time entry ${id}:`, error);
      throw new Error('工数エントリの削除に失敗しました');
    }
  }

  // 15分刻みの制約チェック
  private isValidMinuteInterval(date: Date): boolean {
    const minutes = date.getMinutes();
    return [0, 15, 30, 45].includes(minutes);
  }

  // APIレスポンスをTimeEntryエンティティに変換（単体）
  private mapToTimeEntry(apiTimeEntry: TimeEntryApiResponse): TimeEntry {
    return {
      id: apiTimeEntry.id,
      taskId: apiTimeEntry.taskId,
      categoryId: apiTimeEntry.categoryId,
      userId: apiTimeEntry.userId,
      startTime: new Date(apiTimeEntry.startTime),
      endTime: new Date(apiTimeEntry.endTime),
      workDate: new Date(apiTimeEntry.workDate + 'T00:00:00.000Z'), // workDateは日付のみなのでタイムゾーン処理
      memo: apiTimeEntry.memo,
      createdAt: new Date(apiTimeEntry.createdAt),
      updatedAt: new Date(apiTimeEntry.updatedAt)
    };
  }

  // APIレスポンスをTimeEntryエンティティに変換（配列）
  private mapToTimeEntries(apiTimeEntries: readonly TimeEntryApiResponse[]): readonly TimeEntry[] {
    return apiTimeEntries.map(apiTimeEntry => this.mapToTimeEntry(apiTimeEntry));
  }
}

// シングルトンインスタンス
export const timeEntryService = new TimeEntryService();