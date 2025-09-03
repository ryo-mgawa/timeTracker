import { Router } from 'express';
import { reportController } from '../controllers/ReportController';

const router = Router();

// レポート関連のルート定義
// プロジェクト別工数集計
router.get('/projects/:userId', (req, res) => reportController.getProjectSummary(req, res));

// 分類別工数集計
router.get('/categories/:userId', (req, res) => reportController.getCategorySummary(req, res));

// 日別工数集計
router.get('/daily/:userId', (req, res) => reportController.getDailySummary(req, res));

// 工数詳細データ（フィルタ機能付き）
router.get('/details/:userId', (req, res) => reportController.getWorkHoursDetail(req, res));

export default router;