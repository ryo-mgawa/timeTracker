import { Router } from 'express';
import { categoryController } from '../controllers/CategoryController';

const router = Router();

// 分類関連のルート定義
// ユーザー別の分類一覧取得
router.get('/user/:userId', (req, res) => categoryController.getCategoriesByUserId(req, res));

// 特定分類取得
router.get('/user/:userId/:id', (req, res) => categoryController.getCategoryById(req, res));

// 新規分類作成
router.post('/', (req, res) => categoryController.createCategory(req, res));

// 分類更新
router.put('/user/:userId/:id', (req, res) => categoryController.updateCategory(req, res));

// 分類削除
router.delete('/user/:userId/:id', (req, res) => categoryController.deleteCategory(req, res));

export default router;