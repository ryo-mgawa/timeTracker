import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

export class ReportController {
  
  // プロジェクト別工数集計を取得
  async getProjectSummary(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { startDate, endDate } = req.query;

      if (!userId) {
        res.status(400).json({ success: false, error: 'ユーザーIDが必要です' });
        return;
      }

      // クエリ条件の構築
      const dateFilter: any = {};
      if (startDate && endDate) {
        dateFilter.date = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        };
      }

      // プロジェクト別集計クエリ
      const projectSummary = await prisma.project.findMany({
        where: {
          userId: userId,
          deletedAt: null
        },
        include: {
          tasks: {
            include: {
              timeEntries: {
                where: {
                  deletedAt: null,
                  ...dateFilter
                }
              }
            },
            where: {
              deletedAt: null
            }
          }
        }
      });

      // データの変換と集計
      const summary = projectSummary.map(project => {
        const allTimeEntries = project.tasks.flatMap(task => task.timeEntries);
        
        const totalHours = allTimeEntries.reduce((sum, entry) => {
          const hours = (entry.endTime.getTime() - entry.startTime.getTime()) / (1000 * 60 * 60);
          return sum + hours;
        }, 0);

        // startTimeからJST基準の日付を計算
        const workDates = allTimeEntries.map(e => {
          const jstDateString = e.startTime.toLocaleDateString('ja-JP', { 
            timeZone: 'Asia/Tokyo' 
          });
          return new Date(jstDateString).getTime();
        });

        return {
          projectId: project.id,
          projectName: project.name,
          projectColor: project.color,
          totalEntries: allTimeEntries.length,
          totalHours: Math.round(totalHours * 100) / 100,
          firstWorkDate: workDates.length > 0 ? 
            new Date(Math.min(...workDates)) : null,
          lastWorkDate: workDates.length > 0 ? 
            new Date(Math.max(...workDates)) : null
        };
      });

      res.json({ success: true, data: summary });
    } catch (error) {
      console.error('Project summary error:', error);
      res.status(500).json({ success: false, error: 'プロジェクト別集計の取得に失敗しました' });
    }
  }

  // 分類別工数集計を取得
  async getCategorySummary(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { startDate, endDate } = req.query;

      if (!userId) {
        res.status(400).json({ success: false, error: 'ユーザーIDが必要です' });
        return;
      }

      // クエリ条件の構築
      const dateFilter: any = {};
      if (startDate && endDate) {
        dateFilter.date = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        };
      }

      // 分類別集計クエリ
      const categorySummary = await prisma.category.findMany({
        where: {
          userId: userId,
          deletedAt: null
        },
        include: {
          timeEntries: {
            where: {
              deletedAt: null,
              ...dateFilter
            }
          }
        }
      });

      // データの変換と集計
      const summary = categorySummary.map(category => {
        const timeEntries = category.timeEntries;
        
        const totalHours = timeEntries.reduce((sum, entry) => {
          const hours = (entry.endTime.getTime() - entry.startTime.getTime()) / (1000 * 60 * 60);
          return sum + hours;
        }, 0);

        // startTimeからJST基準の日付を計算
        const workDates = timeEntries.map(e => {
          const jstDateString = e.startTime.toLocaleDateString('ja-JP', { 
            timeZone: 'Asia/Tokyo' 
          });
          return new Date(jstDateString).getTime();
        });

        return {
          categoryId: category.id,
          categoryName: category.name,
          categoryColor: category.color,
          totalEntries: timeEntries.length,
          totalHours: Math.round(totalHours * 100) / 100,
          firstWorkDate: workDates.length > 0 ? 
            new Date(Math.min(...workDates)) : null,
          lastWorkDate: workDates.length > 0 ? 
            new Date(Math.max(...workDates)) : null
        };
      });

      res.json({ success: true, data: summary });
    } catch (error) {
      console.error('Category summary error:', error);
      res.status(500).json({ success: false, error: '分類別集計の取得に失敗しました' });
    }
  }

  // 日別工数集計を取得
  async getDailySummary(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { startDate, endDate } = req.query;

      if (!userId) {
        res.status(400).json({ success: false, error: 'ユーザーIDが必要です' });
        return;
      }

      // デフォルトで過去30日間
      const end = endDate ? new Date(endDate as string) : new Date();
      const start = startDate ? new Date(startDate as string) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

      // 日別集計クエリ
      const dailySummary = await prisma.timeEntry.groupBy({
        by: ['date'],
        where: {
          userId: userId,
          deletedAt: null,
          date: {
            gte: start,
            lte: end
          }
        },
        _count: {
          id: true
        }
      });

      // 各日の詳細データを取得
      const detailPromises = dailySummary.map(async (day) => {
        const timeEntries = await prisma.timeEntry.findMany({
          where: {
            userId: userId,
            date: day.date,
            deletedAt: null
          },
          include: {
            task: {
              include: {
                project: true
              }
            },
            category: true
          }
        });

        const totalHours = timeEntries.reduce((sum, entry) => {
          const hours = (entry.endTime.getTime() - entry.startTime.getTime()) / (1000 * 60 * 60);
          return sum + hours;
        }, 0);

        const uniqueProjects = [...new Set(timeEntries.map(e => e.task.project.id))];
        const uniqueCategories = [...new Set(timeEntries.map(e => e.category.id))];

        // startTimeからJST基準の日付を計算（最初のエントリから日付を取得）
        const workDate = timeEntries.length > 0 
          ? new Date(timeEntries[0].startTime.toLocaleDateString('ja-JP', { 
              timeZone: 'Asia/Tokyo' 
            }))
          : day.date; // フォールバック（通常は使われない）

        return {
          workDate: workDate,
          totalEntries: day._count.id,
          totalHours: Math.round(totalHours * 100) / 100,
          projectsCount: uniqueProjects.length,
          categoriesCount: uniqueCategories.length
        };
      });

      const summary = await Promise.all(detailPromises);

      res.json({ success: true, data: summary.sort((a, b) => a.workDate.getTime() - b.workDate.getTime()) });
    } catch (error) {
      console.error('Daily summary error:', error);
      res.status(500).json({ success: false, error: '日別集計の取得に失敗しました' });
    }
  }

  // 詳細データを取得（フィルタ機能付き）
  async getWorkHoursDetail(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { startDate, endDate, projectId, categoryId } = req.query;

      if (!userId) {
        res.status(400).json({ success: false, error: 'ユーザーIDが必要です' });
        return;
      }

      // フィルタ条件の構築
      const whereConditions: any = {
        userId: userId,
        deletedAt: null
      };

      if (startDate && endDate) {
        whereConditions.date = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        };
      }

      if (categoryId) {
        whereConditions.categoryId = categoryId;
      }

      if (projectId) {
        whereConditions.task = {
          projectId: projectId
        };
      }

      // 詳細データの取得
      const workHoursDetail = await prisma.timeEntry.findMany({
        where: whereConditions,
        include: {
          task: {
            include: {
              project: true
            }
          },
          category: true,
          user: true
        },
        orderBy: [
          { date: 'desc' },
          { startTime: 'desc' }
        ]
      });

      // データの変換
      const detail = workHoursDetail.map(entry => {
        const workHours = (entry.endTime.getTime() - entry.startTime.getTime()) / (1000 * 60 * 60);
        
        // startTimeからJST基準の日付を計算
        const jstDateString = entry.startTime.toLocaleDateString('ja-JP', { 
          timeZone: 'Asia/Tokyo' 
        });
        
        return {
          timeEntryId: entry.id,
          userId: entry.userId,
          workDate: new Date(jstDateString),
          startTime: entry.startTime,
          endTime: entry.endTime,
          workHours: Math.round(workHours * 100) / 100,
          memo: entry.memo,
          taskId: entry.task.id,
          taskName: entry.task.name,
          taskDescription: entry.task.description,
          projectId: entry.task.project.id,
          projectName: entry.task.project.name,
          projectColor: entry.task.project.color,
          categoryId: entry.category.id,
          categoryName: entry.category.name,
          categoryColor: entry.category.color,
          userName: entry.user.name,
          userEmail: entry.user.email
        };
      });

      res.json({ success: true, data: detail });
    } catch (error) {
      console.error('Work hours detail error:', error);
      res.status(500).json({ success: false, error: '工数詳細の取得に失敗しました' });
    }
  }
}

export const reportController = new ReportController();