import { 
  VALID_MINUTE_INTERVALS, 
  HOUR_IN_MS, 
  TIME_ERROR_MESSAGES,
  ValidMinuteInterval 
} from '../../shared/constants/time';

// カスタム例外クラス
export class TimePeriodError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimePeriodError';
  }
}

// 時間期間を管理する値オブジェクト（設計書の実装例に基づく）
export class TimePeriod {
  private constructor(
    public readonly startTime: Date,
    public readonly endTime: Date
  ) {
    // アーリーリターン適用でバリデーション
    if (startTime >= endTime) {
      throw new TimePeriodError(TIME_ERROR_MESSAGES.INVALID_TIME_ORDER);
    }
    
    if (!this.is15MinuteInterval(startTime) || !this.is15MinuteInterval(endTime)) {
      throw new TimePeriodError(TIME_ERROR_MESSAGES.INVALID_15MIN_INTERVAL);
    }
  }

  static create(startTime: Date, endTime: Date): TimePeriod {
    return new TimePeriod(startTime, endTime);
  }

  private is15MinuteInterval(date: Date): boolean {
    const minutes = date.getMinutes() as ValidMinuteInterval;
    return VALID_MINUTE_INTERVALS.includes(minutes);
  }

  getDurationInHours(): number {
    return (this.endTime.getTime() - this.startTime.getTime()) / HOUR_IN_MS;
  }

  getDurationInMinutes(): number {
    return (this.endTime.getTime() - this.startTime.getTime()) / (60 * 1000);
  }

  // 重複チェック（アーリーリターンでシンプルに）
  overlaps(other: TimePeriod): boolean {
    if (this.startTime >= other.startTime && this.startTime < other.endTime) return true;
    if (this.endTime > other.startTime && this.endTime <= other.endTime) return true;
    if (this.startTime <= other.startTime && this.endTime >= other.endTime) return true;
    
    return false;
  }

  // 同じ日かどうかの判定
  isSameDay(date: Date): boolean {
    const startDate = this.startTime.toDateString();
    const checkDate = date.toDateString();
    return startDate === checkDate;
  }

  // 値の等価性チェック
  equals(other: TimePeriod): boolean {
    return this.startTime.getTime() === other.startTime.getTime() &&
           this.endTime.getTime() === other.endTime.getTime();
  }

  // 文字列表現
  toString(): string {
    const startTimeStr = this.startTime.toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    const endTimeStr = this.endTime.toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    return `${startTimeStr} - ${endTimeStr}`;
  }
}