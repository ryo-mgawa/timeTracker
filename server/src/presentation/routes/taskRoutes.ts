import { Router } from 'express';
import { taskController } from '../controllers/TaskController';

const router = Router();

// タスク関連のルート定義
// ユーザー別のタスク一覧取得
router.get('/user/:userId', (req, res) => taskController.getTasksByUserId(req, res));

// プロジェクト内のタスク一覧取得
router.get('/user/:userId/project/:projectId', (req, res) => taskController.getTasksByProjectId(req, res));

// 特定タスク取得
router.get('/user/:userId/:id', (req, res) => taskController.getTaskById(req, res));

// 新規タスク作成
router.post('/', (req, res) => taskController.createTask(req, res));

// タスク更新
router.put('/user/:userId/:id', (req, res) => taskController.updateTask(req, res));

// タスク削除
router.delete('/user/:userId/:id', (req, res) => taskController.deleteTask(req, res));

export default router;