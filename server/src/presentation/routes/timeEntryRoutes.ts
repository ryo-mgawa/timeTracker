import { Router } from 'express';
import { timeEntryController } from '../controllers/TimeEntryController';

const router = Router();

// 工数エントリ関連のルート定義
// ユーザー別の工数エントリ一覧取得
router.get('/user/:userId', (req, res) => timeEntryController.getTimeEntriesByUserId(req, res));

// 日付指定での工数エントリ取得
router.get('/user/:userId/date/:date', (req, res) => timeEntryController.getTimeEntriesByDate(req, res));

// 特定工数エントリ取得
router.get('/user/:userId/:id', (req, res) => timeEntryController.getTimeEntryById(req, res));

// 新規工数エントリ作成
router.post('/', (req, res) => timeEntryController.createTimeEntry(req, res));

// 工数エントリ更新
router.put('/user/:userId/:id', (req, res) => timeEntryController.updateTimeEntry(req, res));

// 工数エントリ削除
router.delete('/user/:userId/:id', (req, res) => timeEntryController.deleteTimeEntry(req, res));

export default router;