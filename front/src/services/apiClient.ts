import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API設定の定数化
const DEFAULT_TIMEOUT = 10000; // 10秒
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// API応答の基本型
export interface ApiResponse<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly message?: string;
}

// APIクライアントクラス
export class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = API_BASE_URL) {
    this.client = axios.create({
      baseURL,
      timeout: DEFAULT_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // レスポンスインターセプター（エラーハンドリング用）
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        console.error('API Error:', error);
        
        // アーリーリターンでエラーハンドリング
        if (error.response?.status === 404) {
          return Promise.reject(new Error('リソースが見つかりません'));
        }
        
        if (error.response?.status >= 500) {
          return Promise.reject(new Error('サーバーエラーが発生しました'));
        }
        
        if (error.code === 'ECONNABORTED') {
          return Promise.reject(new Error('リクエストがタイムアウトしました'));
        }
        
        return Promise.reject(error);
      }
    );
  }

  // GET リクエスト
  async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await this.client.get<ApiResponse<T>>(endpoint);
      
      // APIレスポンス形式のチェック
      if (!response.data.success) {
        throw new Error(response.data.error || 'APIエラーが発生しました');
      }
      
      if (!response.data.data) {
        throw new Error('レスポンスデータが空です');
      }
      
      return response.data.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('予期しないエラーが発生しました');
    }
  }

  // POST リクエスト
  async post<T, U = unknown>(endpoint: string, data?: U): Promise<T> {
    try {
      const response = await this.client.post<ApiResponse<T>>(endpoint, data);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'APIエラーが発生しました');
      }
      
      if (!response.data.data) {
        throw new Error('レスポンスデータが空です');
      }
      
      return response.data.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('予期しないエラーが発生しました');
    }
  }

  // PUT リクエスト
  async put<T, U = unknown>(endpoint: string, data?: U): Promise<T> {
    try {
      const response = await this.client.put<ApiResponse<T>>(endpoint, data);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'APIエラーが発生しました');
      }
      
      if (!response.data.data) {
        throw new Error('レスポンスデータが空です');
      }
      
      return response.data.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('予期しないエラーが発生しました');
    }
  }

  // DELETE リクエスト
  async delete(endpoint: string): Promise<void> {
    try {
      const response = await this.client.delete<ApiResponse<never>>(endpoint);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'APIエラーが発生しました');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('予期しないエラーが発生しました');
    }
  }

  // ヘルスチェック
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/health');
      return true;
    } catch {
      return false;
    }
  }
}

// シングルトンインスタンス
export const apiClient = new ApiClient();