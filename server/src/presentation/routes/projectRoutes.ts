import { Router } from 'express';
import { projectController } from '../controllers/ProjectController';

const router = Router();

// プロジェクト関連のルート定義
// ユーザー別のプロジェクト一覧取得
router.get('/user/:userId', (req, res) => projectController.getProjectsByUserId(req, res));

// 特定プロジェクト取得
router.get('/user/:userId/:id', (req, res) => projectController.getProjectById(req, res));

// 新規プロジェクト作成
router.post('/', (req, res) => projectController.createProject(req, res));

// プロジェクト更新
router.put('/user/:userId/:id', (req, res) => projectController.updateProject(req, res));

// プロジェクト削除
router.delete('/user/:userId/:id', (req, res) => projectController.deleteProject(req, res));

export default router;