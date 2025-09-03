// 基本的な識別子型
export type UserId = string;
export type ProjectId = string;
export type CategoryId = string;
export type TaskId = string;
export type TimeEntryId = string;

// 共通のエンティティインターフェース
export interface BaseEntity {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt?: Date;
}

// ページネーション関連
export interface PaginationRequest {
  readonly page: number;
  readonly limit: number;
}

export interface PaginationResponse<T> {
  readonly data: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
}

// API レスポンスの基本型
export interface ApiResponse<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly message?: string;
}

// エラーコード
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  UNAUTHORIZED: 'UNAUTHORIZED',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];