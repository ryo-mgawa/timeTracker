import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import 'moment/locale/ja';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import '../styles/calendar.css';
import { TimeEntry, User, Task, Category, Project } from 'types';
import { timeEntryService } from 'services/timeEntryService';
import { taskService } from 'services/taskService';
import { projectService } from 'services/projectService';
import { categoryService } from 'services/categoryService';
import TimeEntryDetailModal from './TimeEntryDetailModal';

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
    project: Project;
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
  
  // 詳細モーダルの状態管理
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

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
                  category,
                  project
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
                  category: { id: entry.categoryId, name: '分類名', color: '#007bff' } as any,
                  project: { id: '', name: 'プロジェクト名不明', color: '#6c757d', description: '' } as any
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

  // 時間重複チェック
  const hasTimeOverlap = useCallback((newStart: Date, newEnd: Date, excludeEventId?: string): boolean => {
    return events.some(event => {
      if (excludeEventId && event.id === excludeEventId) return false;
      
      const eventStart = event.start;
      const eventEnd = event.end;
      
      return (
        (newStart >= eventStart && newStart < eventEnd) ||
        (newEnd > eventStart && newEnd <= eventEnd) ||
        (newStart <= eventStart && newEnd >= eventEnd)
      );
    });
  }, [events]);

  // イベント移動時のハンドラー（改良版）
  const onEventDrop = useCallback(async ({ event, start, end }: any) => {
    // アーリーリターン - 必要な情報がない場合
    if (!event?.resource?.timeEntry) {
      console.error('工数エントリの情報がありません');
      return;
    }

    // 15分刻み制約のチェック
    const snappedStart = snapToQuarter(start);
    const snappedEnd = snapToQuarter(end);

    if (!isValidQuarterTime(snappedStart) || !isValidQuarterTime(snappedEnd)) {
      alert('⏰ 時刻は15分刻み（0, 15, 30, 45分）で入力してください\n自動的に最寄りの15分刻みに調整されます。');
      return;
    }

    // 時間重複チェック
    if (hasTimeOverlap(snappedStart, snappedEnd, event.id)) {
      alert('⚠️ この時間帯には既に他の工数エントリが存在します\n重複しない時間帯に移動してください。');
      return;
    }

    // 元の時間と比較して大幅な変更の場合は確認
    const originalStart = event.resource.timeEntry.startTime;
    const originalEnd = event.resource.timeEntry.endTime;
    const timeDiff = Math.abs(snappedStart.getTime() - originalStart.getTime());
    const durationDiff = Math.abs((snappedEnd.getTime() - snappedStart.getTime()) - (originalEnd.getTime() - originalStart.getTime()));
    
    // 1時間以上の移動または30分以上の時間変更の場合は確認
    if (timeDiff > 60 * 60 * 1000 || durationDiff > 30 * 60 * 1000) {
      const originalDuration = Math.round((originalEnd.getTime() - originalStart.getTime()) / (15 * 60 * 1000)) * 15;
      const newDuration = Math.round((snappedEnd.getTime() - snappedStart.getTime()) / (15 * 60 * 1000)) * 15;
      
      const confirmMessage = `🔄 工数エントリを大幅に変更します：\n\n` +
        `📋 タスク: ${event.title}\n` +
        `📅 元の時間: ${originalStart.toLocaleString('ja-JP')} - ${originalEnd.toLocaleString('ja-JP')} (${originalDuration}分)\n` +
        `📅 新しい時間: ${snappedStart.toLocaleString('ja-JP')} - ${snappedEnd.toLocaleString('ja-JP')} (${newDuration}分)\n\n` +
        `この変更を保存しますか？`;
      
      if (!window.confirm(confirmMessage)) {
        return;
      }
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
      
      // 成功メッセージ（短時間表示）
      const duration = Math.round((snappedEnd.getTime() - snappedStart.getTime()) / (15 * 60 * 1000)) * 15;
      console.log(`✅ 工数エントリを更新しました: ${event.title} (${duration}分)`);
      
    } catch (error) {
      console.error('工数エントリの更新に失敗しました:', error);
      alert('❌ 工数エントリの更新に失敗しました\n\n' + 
            (error instanceof Error ? error.message : '不明なエラーが発生しました'));
    } finally {
      setLoading(false);
    }
  }, [events, user.id, onTimeEntryUpdate, hasTimeOverlap]);

  // イベントリサイズ時のハンドラー（改良版）
  const onEventResize = useCallback(async ({ event, start, end }: any) => {
    // アーリーリターン - 必要な情報がない場合
    if (!event?.resource?.timeEntry) {
      console.error('工数エントリの情報がありません');
      return;
    }

    // 15分刻み制約のチェック
    const snappedStart = snapToQuarter(start);
    const snappedEnd = snapToQuarter(end);

    if (!isValidQuarterTime(snappedStart) || !isValidQuarterTime(snappedEnd)) {
      alert('⏰ 時刻は15分刻み（0, 15, 30, 45分）で入力してください\n自動的に最寄りの15分刻みに調整されます。');
      return;
    }

    // 最小時間チェック（15分未満は不可）
    const duration = snappedEnd.getTime() - snappedStart.getTime();
    if (duration < 15 * 60 * 1000) {
      alert('⚠️ 工数エントリは最低15分以上である必要があります');
      return;
    }

    // 時間重複チェック（リサイズ対象を除く）
    if (hasTimeOverlap(snappedStart, snappedEnd, event.id)) {
      alert('⚠️ この時間帯には既に他の工数エントリが存在します\n重複しない範囲でリサイズしてください。');
      return;
    }

    // 元の時間と比較して大幅な変更の場合は確認
    const originalStart = event.resource.timeEntry.startTime;
    const originalEnd = event.resource.timeEntry.endTime;
    const originalDuration = Math.round((originalEnd.getTime() - originalStart.getTime()) / (15 * 60 * 1000)) * 15;
    const newDuration = Math.round(duration / (15 * 60 * 1000)) * 15;
    const durationChange = Math.abs(newDuration - originalDuration);
    
    // 1時間以上の時間変更の場合は確認
    if (durationChange >= 60) {
      const isIncrease = newDuration > originalDuration;
      const changeType = isIncrease ? '延長' : '短縮';
      
      const confirmMessage = `📏 工数時間を大幅に${changeType}します：\n\n` +
        `📋 タスク: ${event.title}\n` +
        `⏱️ 元の時間: ${originalDuration}分\n` +
        `⏱️ 新しい時間: ${newDuration}分\n` +
        `📊 変更: ${isIncrease ? '+' : ''}${newDuration - originalDuration}分\n\n` +
        `この変更を保存しますか？`;
      
      if (!window.confirm(confirmMessage)) {
        return;
      }
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
      
      // 成功メッセージ（短時間表示）
      console.log(`✅ 工数エントリをリサイズしました: ${event.title} (${newDuration}分)`);
      
    } catch (error) {
      console.error('工数エントリの更新に失敗しました:', error);
      alert('❌ 工数エントリの更新に失敗しました\n\n' + 
            (error instanceof Error ? error.message : '不明なエラーが発生しました'));
    } finally {
      setLoading(false);
    }
  }, [events, user.id, onTimeEntryUpdate, hasTimeOverlap]);

  // 新しいイベント作成時のハンドラー（改良版）
  const onSelectSlot = useCallback(async ({ start, end }: { start: Date; end: Date }) => {
    // アーリーリターン - 必要な情報がない場合
    if (!selectedTask || !selectedCategory) {
      alert('📝 プロジェクト→タスクと分類を選択してください\n\n' +
            '右上の選択エリアで以下を選択してください：\n' +
            '1. プロジェクトを選択\n' +
            '2. タスクを選択\n' +
            '3. 分類を選択');
      return;
    }

    // 15分刻み制約のチェック
    const snappedStart = snapToQuarter(start);
    const snappedEnd = snapToQuarter(end);

    if (!isValidQuarterTime(snappedStart) || !isValidQuarterTime(snappedEnd)) {
      alert('⏰ 時刻は15分刻み（0, 15, 30, 45分）で入力してください\n自動的に最寄りの15分刻みに調整されます。');
      return;
    }

    // 最小時間チェック（15分未満は不可）
    const duration = snappedEnd.getTime() - snappedStart.getTime();
    if (duration < 15 * 60 * 1000) {
      alert('⚠️ 工数エントリは最低15分以上である必要があります\nより長い時間範囲を選択してください。');
      return;
    }

    // 時間重複チェック
    if (hasTimeOverlap(snappedStart, snappedEnd)) {
      alert('⚠️ この時間帯には既に他の工数エントリが存在します\n\n' +
            '重複しない時間帯を選択するか、既存のエントリを移動してください。');
      return;
    }

    // 長時間のエントリの場合は確認
    const durationMinutes = Math.round(duration / (15 * 60 * 1000)) * 15;
    if (durationMinutes >= 240) { // 4時間以上
      const confirmMessage = `⏰ 長時間の工数エントリを作成します：\n\n` +
        `📋 タスク: ${selectedTask.name}\n` +
        `🏷️ 分類: ${selectedCategory.name}\n` +
        `⏱️ 時間: ${snappedStart.toLocaleString('ja-JP')} - ${snappedEnd.toLocaleString('ja-JP')}\n` +
        `⏲️ 合計: ${durationMinutes}分\n\n` +
        `この工数エントリを作成しますか？`;
      
      if (!window.confirm(confirmMessage)) {
        return;
      }
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
      // プロジェクト情報を取得してイベントに含める
      const project = await projectService.getProjectById(user.id, selectedTask.projectId);
      
      const newEvent: CalendarEvent = {
        id: newTimeEntry.id,
        title: `${project.name}-${selectedTask.name}`,
        start: snappedStart,
        end: snappedEnd,
        resource: {
          timeEntry: newTimeEntry,
          task: selectedTask,
          category: selectedCategory,
          project
        }
      };

      setEvents(prevEvents => [...prevEvents, newEvent]);
      
      // コールバック実行
      onTimeEntryCreate?.(newTimeEntry);
      
      // 成功メッセージ（短時間表示）
      console.log(`✅ 工数エントリを作成しました: ${selectedTask.name} (${durationMinutes}分)`);
      
    } catch (error) {
      console.error('工数エントリの作成に失敗しました:', error);
      alert('❌ 工数エントリの作成に失敗しました\n\n' + 
            (error instanceof Error ? error.message : '不明なエラーが発生しました'));
    } finally {
      setLoading(false);
    }
  }, [selectedTask, selectedCategory, user.id, onTimeEntryCreate, hasTimeOverlap]);

  // イベント選択時のハンドラー（詳細モーダル表示）
  const onSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowDetailModal(true);
  }, []);

  // 詳細モーダルを閉じる
  const handleModalClose = useCallback(() => {
    setShowDetailModal(false);
    setSelectedEvent(null);
  }, []);

  // 詳細モーダルからの削除処理
  const handleModalDelete = useCallback(async (timeEntryId: string) => {
    if (!selectedEvent) return;
    
    try {
      setLoading(true);
      
      // TimeEntry APIで削除
      await timeEntryService.deleteTimeEntry(user.id, timeEntryId);
      
      // イベントリストから削除
      setEvents(prevEvents => prevEvents.filter(e => e.id !== timeEntryId));
      
      // コールバック実行
      onTimeEntryDelete?.(timeEntryId);
      
      // モーダルを閉じる
      handleModalClose();
      
    } catch (error) {
      console.error('工数エントリの削除に失敗しました:', error);
      alert('工数エントリの削除に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [selectedEvent, user.id, onTimeEntryDelete, handleModalClose]);


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
    
    // プロジェクトの色を基調に、分類の色をアクセントとして使用
    const { category, project } = calendarEvent.resource;
    const projectColor = project?.color || '#667eea'; // プロジェクトの色
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
        scrollToTime={new Date(0, 0, 0, 9, 0, 0)}
        defaultView="week"
        views={['month', 'week', 'day']}
        popup={true}
        popupOffset={30}
      />
      
      {/* 工数詳細モーダル */}
      <TimeEntryDetailModal
        show={showDetailModal}
        onHide={handleModalClose}
        timeEntry={selectedEvent?.resource.timeEntry || null}
        task={selectedEvent?.resource.task || null}
        category={selectedEvent?.resource.category || null}
        project={selectedEvent?.resource.project || null}
        onDelete={handleModalDelete}
        loading={loading}
      />
    </div>
  );
};

export default TimeTrackingCalendar;