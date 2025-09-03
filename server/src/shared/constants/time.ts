// 時間関連の定数（マジックナンバー対応）
export const FIFTEEN_MINUTES_IN_MS = 15 * 60 * 1000;
export const HOUR_IN_MS = 60 * 60 * 1000;
export const DAY_IN_MS = 24 * HOUR_IN_MS;

export const VALID_MINUTE_INTERVALS = [0, 15, 30, 45] as const;
export type ValidMinuteInterval = typeof VALID_MINUTE_INTERVALS[number];

// 工数の制限値
export const MAX_DAILY_HOURS = 24;
export const MIN_TIME_ENTRY_MINUTES = 15;

// エラーメッセージ定数
export const TIME_ERROR_MESSAGES = {
  INVALID_TIME_ORDER: '開始時間は終了時間より前である必要があります',
  INVALID_15MIN_INTERVAL: '時間は15分刻みである必要があります',
  TIME_OVERLAP_DETECTED: '指定された時間帯には既に別の工数が登録されています',
  EXCEEDED_DAILY_LIMIT: '1日の工数上限を超過しています'
} as const;