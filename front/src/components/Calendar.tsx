import React, { useState, useCallback, useMemo } from 'react';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import withDragAndDrop, { 
  withDragAndDropProps 
} from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import 'moment/locale/ja';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { TimeEntry, User, Task, Category } from 'types';
import { timeEntryService } from 'services/timeEntryService';

// moment.jsの日本語設定
moment.locale('ja');
const localizer = momentLocalizer(moment);

// ドラッグ&ドロップ対応のカレンダー
const DragAndDropCalendar = withDragAndDrop(Calendar);

// カレンダーイベント型
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    timeEntry: TimeEntry;
    task: Task;
    category: Category;
  };
}

// プロパティ型
interface TimeTrackingCalendarProps {
  readonly user: User;
  readonly selectedTask: Task | null;
  readonly selectedCategory: Category | null;
  readonly onTimeEntryCreate?: (timeEntry: TimeEntry) => void;
  readonly onTimeEntryUpdate?: (timeEntry: TimeEntry) => void;
  readonly onTimeEntryDelete?: (id: string) => void;
}

// 15分刻みの制約チェック
const snapToQuarter = (date: Date): Date => {
  const minutes = date.getMinutes();
  const quarterMinutes = Math.round(minutes / 15) * 15;
  const snappedDate = new Date(date);
  snappedDate.setMinutes(quarterMinutes, 0, 0);
  return snappedDate;
};

// 15分刻み制約の検証
const isValidQuarterTime = (date: Date): boolean => {
  const minutes = date.getMinutes();
  return [0, 15, 30, 45].includes(minutes);
};

const TimeTrackingCalendar: React.FC<TimeTrackingCalendarProps> = ({
  user,
  selectedTask,
  selectedCategory,
  onTimeEntryCreate,
  onTimeEntryUpdate,
  onTimeEntryDelete
}) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentView, setCurrentView] = useState<View>('week');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(false);

  // イベント移動時のハンドラー
  const onEventDrop = useCallback(async ({ event, start, end }: any) => {
    // アーリーリターン - 必要な情報がない場合
    if (!event?.resource?.timeEntry || !selectedTask || !selectedCategory) {
      console.error('必要な情報が不足しています');
      return;
    }

    // 15分刻み制約のチェック
    const snappedStart = snapToQuarter(start);
    const snappedEnd = snapToQuarter(end);

    if (!isValidQuarterTime(snappedStart) || !isValidQuarterTime(snappedEnd)) {
      alert('時刻は15分刻み（0, 15, 30, 45分）で入力してください');
      return;
    }

    try {
      setLoading(true);
      
      // TimeEntry APIで更新
      const updatedTimeEntry = await timeEntryService.updateTimeEntry(
        user.id,
        event.resource.timeEntry.id,
        {
          startTime: snappedStart.toISOString(),
          endTime: snappedEnd.toISOString()
        }
      );

      // イベントリストを更新
      const updatedEvents = events.map(e => 
        e.id === event.id 
          ? {
              ...e,
              start: snappedStart,
              end: snappedEnd,
              resource: {
                ...e.resource,
                timeEntry: updatedTimeEntry
              }
            }
          : e
      );
      
      setEvents(updatedEvents);
      
      // コールバック実行
      onTimeEntryUpdate?.(updatedTimeEntry);
      
    } catch (error) {
      console.error('工数エントリの更新に失敗しました:', error);
      alert('工数エントリの更新に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [events, user.id, selectedTask, selectedCategory, onTimeEntryUpdate]);

  // イベントリサイズ時のハンドラー
  const onEventResize = useCallback(async ({ event, start, end }: any) => {
    // アーリーリターン - 必要な情報がない場合
    if (!event?.resource?.timeEntry) {
      console.error('TimeEntryの情報がありません');
      return;
    }

    // 15分刻み制約のチェック
    const snappedStart = snapToQuarter(start);
    const snappedEnd = snapToQuarter(end);

    if (!isValidQuarterTime(snappedStart) || !isValidQuarterTime(snappedEnd)) {
      alert('時刻は15分刻み（0, 15, 30, 45分）で入力してください');
      return;
    }

    try {
      setLoading(true);
      
      // TimeEntry APIで更新
      const updatedTimeEntry = await timeEntryService.updateTimeEntry(
        user.id,
        event.resource.timeEntry.id,
        {
          startTime: snappedStart.toISOString(),
          endTime: snappedEnd.toISOString()
        }
      );

      // イベントリストを更新
      const updatedEvents = events.map(e => 
        e.id === event.id 
          ? {
              ...e,
              start: snappedStart,
              end: snappedEnd,
              resource: {
                ...e.resource,
                timeEntry: updatedTimeEntry
              }
            }
          : e
      );
      
      setEvents(updatedEvents);
      
      // コールバック実行
      onTimeEntryUpdate?.(updatedTimeEntry);
      
    } catch (error) {
      console.error('工数エントリの更新に失敗しました:', error);
      alert('工数エントリの更新に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [events, user.id, onTimeEntryUpdate]);

  // 新しいイベント作成時のハンドラー
  const onSelectSlot = useCallback(async ({ start, end }: { start: Date; end: Date }) => {
    // アーリーリターン - 必要な情報がない場合
    if (!selectedTask || !selectedCategory) {
      alert('プロジェクト→タスクと分類を選択してください');
      return;
    }

    // 15分刻み制約のチェック
    const snappedStart = snapToQuarter(start);
    const snappedEnd = snapToQuarter(end);

    if (!isValidQuarterTime(snappedStart) || !isValidQuarterTime(snappedEnd)) {
      alert('時刻は15分刻み（0, 15, 30, 45分）で入力してください');
      return;
    }

    try {
      setLoading(true);
      
      // TimeEntry APIで新規作成
      const newTimeEntry = await timeEntryService.createTimeEntry(
        selectedTask.id,
        selectedCategory.id,
        user.id,
        snappedStart,
        snappedEnd
      );

      // 新しいイベントを作成
      const newEvent: CalendarEvent = {
        id: newTimeEntry.id,
        title: `${selectedTask.name} (${selectedCategory.name})`,
        start: snappedStart,
        end: snappedEnd,
        resource: {
          timeEntry: newTimeEntry,
          task: selectedTask,
          category: selectedCategory
        }
      };

      setEvents(prevEvents => [...prevEvents, newEvent]);
      
      // コールバック実行
      onTimeEntryCreate?.(newTimeEntry);
      
    } catch (error) {
      console.error('工数エントリの作成に失敗しました:', error);
      alert('工数エントリの作成に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [selectedTask, selectedCategory, user.id, onTimeEntryCreate]);

  // イベント選択時のハンドラー（削除機能用）
  const onSelectEvent = useCallback((event: CalendarEvent) => {
    const shouldDelete = window.confirm(
      `工数エントリを削除しますか？\n\n` +
      `タスク: ${event.resource.task.name}\n` +
      `分類: ${event.resource.category.name}\n` +
      `時間: ${event.start.toLocaleTimeString()} - ${event.end.toLocaleTimeString()}`
    );

    if (shouldDelete) {
      handleEventDelete(event);
    }
  }, []);

  // イベント削除処理
  const handleEventDelete = useCallback(async (event: CalendarEvent) => {
    try {
      setLoading(true);
      
      // TimeEntry APIで削除
      await timeEntryService.deleteTimeEntry(user.id, event.resource.timeEntry.id);
      
      // イベントリストから削除
      setEvents(prevEvents => prevEvents.filter(e => e.id !== event.id));
      
      // コールバック実行
      onTimeEntryDelete?.(event.resource.timeEntry.id);
      
    } catch (error) {
      console.error('工数エントリの削除に失敗しました:', error);
      alert('工数エントリの削除に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [user.id, onTimeEntryDelete]);

  // カレンダーのメッセージ設定（日本語）
  const messages = useMemo(() => ({
    allDay: '終日',
    previous: '前へ',
    next: '次へ',
    today: '今日',
    month: '月',
    week: '週',
    day: '日',
    agenda: '予定',
    date: '日付',
    time: '時刻',
    event: 'イベント',
    noEventsInRange: '期間内にイベントはありません',
    showMore: total => `他${total}件`
  }), []);

  // カレンダーのフォーマット設定
  const formats = useMemo(() => ({
    timeGutterFormat: 'HH:mm',
    eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
      `${localizer.format(start, 'HH:mm', culture)} - ${localizer.format(end, 'HH:mm', culture)}`
  }), []);

  return (
    <div style={{ height: '600px', position: 'relative' }}>
      {loading && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div className="text-primary">処理中...</div>
        </div>
      )}
      
      <DragAndDropCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        view={currentView}
        onView={(view: View) => setCurrentView(view)}
        date={currentDate}
        onNavigate={(date: Date) => setCurrentDate(date)}
        onEventDrop={onEventDrop}
        onEventResize={onEventResize}
        onSelectSlot={onSelectSlot}
        onSelectEvent={onSelectEvent}
        selectable={true}
        resizable={true}
        messages={messages}
        formats={formats}
        step={15}
        timeslots={4}
        min={new Date(0, 0, 0, 8, 0, 0)}
        max={new Date(0, 0, 0, 20, 0, 0)}
        defaultView="week"
        views={['month', 'week', 'day']}
        popup={true}
        popupOffset={30}
      />
    </div>
  );
};

export default TimeTrackingCalendar;