import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import withDragAndDrop, { 
  withDragAndDropProps 
} from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import 'moment/locale/ja';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import '../styles/calendar.css';
import { TimeEntry, User, Task, Category } from 'types';
import { timeEntryService } from 'services/timeEntryService';
import { taskService } from 'services/taskService';
import { projectService } from 'services/projectService';
import { categoryService } from 'services/categoryService';

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

  // 初期データ取得
  useEffect(() => {
    const fetchInitialData = async (): Promise<void> => {
      // アーリーリターン - ユーザー情報がない場合
      if (!user?.id) {
        console.warn('ユーザー情報がありません');
        return;
      }

      try {
        setLoading(true);
        
        // TimeEntry一覧を取得
        const timeEntries = await timeEntryService.getTimeEntriesByUserId(user.id);
        
        // 各TimeEntryのタスク、プロジェクト、分類情報を並行取得
        const calendarEvents: CalendarEvent[] = await Promise.all(
          timeEntries.map(async (entry) => {
            try {
              // 並行してタスクと分類情報を取得
              const [task, category] = await Promise.all([
                taskService.getTaskById(user.id, entry.taskId),
                categoryService.getCategoryById(user.id, entry.categoryId)
              ]);
              
              // タスクからプロジェクト情報を取得
              const project = await projectService.getProjectById(user.id, task.projectId);
              
              // タイトルを構築: {プロジェクト名}-{タスク名}
              const title = `${project.name}-${task.name}`;
              
              return {
                id: entry.id,
                title,
                start: entry.startTime,
                end: entry.endTime,
                resource: {
                  timeEntry: entry,
                  task,
                  category
                }
              };
            } catch (error) {
              console.error(`Failed to fetch details for TimeEntry ${entry.id}:`, error);
              // エラー時はフォールバック表示
              return {
                id: entry.id,
                title: '工数エントリ（詳細取得エラー）',
                start: entry.startTime,
                end: entry.endTime,
                resource: {
                  timeEntry: entry,
                  task: { id: entry.taskId, name: 'タスク名', description: '' } as any,
                  category: { id: entry.categoryId, name: '分類名', color: '#007bff' } as any
                }
              };
            }
          })
        );
        
        setEvents(calendarEvents);
      } catch (error) {
        console.error('初期データの取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [user?.id]);

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
    showMore: (total: number) => `他${total}件`
  }), []);

  // カレンダーのフォーマット設定
  const formats = useMemo(() => ({
    timeGutterFormat: 'HH:mm',
    eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }, culture?: string, localizer?: any) =>
      `${localizer?.format(start, 'HH:mm', culture) || start.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })} - ${localizer?.format(end, 'HH:mm', culture) || end.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`
  }), []);

  // イベントのスタイルをカスタマイズ
  const eventPropGetter = useCallback((event: any) => {
    const calendarEvent = event as CalendarEvent;
    
    // イベントにresourceが存在しない場合はデフォルトスタイルを返す
    if (!calendarEvent.resource) {
      return {
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          borderRadius: '0.375rem',
          color: 'white',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          fontSize: '0.875rem',
          fontWeight: '500'
        }
      };
    }
    
    const { task, category } = calendarEvent.resource;
    
    // プロジェクトの色を基調に、分類の色をアクセントとして使用
    const projectColor = task.projectId ? '#667eea' : '#6c757d'; // デフォルトの色
    const categoryColor = category.color || '#28a745';
    
    // グラデーションを作成（プロジェクト色→分類色）
    const backgroundGradient = `linear-gradient(135deg, ${projectColor} 0%, ${categoryColor} 100%)`;
    
    return {
      style: {
        background: backgroundGradient,
        border: 'none',
        borderRadius: '0.375rem',
        color: 'white',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        fontSize: '0.875rem',
        fontWeight: '500'
      }
    };
  }, []);

  return (
    <div style={{ height: '600px', position: 'relative' }}>
      {loading && (
        <div className="calendar-loading-overlay">
          <div className="calendar-loading-content">
            <div className="calendar-loading-spinner" />
            <div className="calendar-loading-text">処理中...</div>
          </div>
        </div>
      )}
      
      <DragAndDropCalendar
        localizer={localizer}
        events={events}
        startAccessor={(event: any) => (event as CalendarEvent).start}
        endAccessor={(event: any) => (event as CalendarEvent).end}
        eventPropGetter={eventPropGetter}
        style={{ height: '100%' }}
        view={currentView}
        onView={(view: View) => setCurrentView(view)}
        date={currentDate}
        onNavigate={(date: Date) => setCurrentDate(date)}
        onEventDrop={onEventDrop}
        onEventResize={onEventResize}
        onSelectSlot={onSelectSlot}
        onSelectEvent={(event: any) => onSelectEvent(event as CalendarEvent)}
        selectable={true}
        resizable={true}
        messages={messages}
        formats={formats as any}
        step={15}
        timeslots={4}
        min={new Date(0, 0, 0, 0, 0, 0)}
        max={new Date(0, 0, 0, 23, 59, 59)}
        defaultView="week"
        views={['month', 'week', 'day']}
        popup={true}
        popupOffset={30}
      />
    </div>
  );
};

export default TimeTrackingCalendar;