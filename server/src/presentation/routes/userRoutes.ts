import { Router } from 'express';
import { userController } from '../controllers/UserController';

const router = Router();

// ユーザー関連のルート定義
router.get('/', (req, res) => userController.getUsers(req, res));
router.get('/:id', (req, res) => userController.getUserById(req, res));
router.post('/', (req, res) => userController.createUser(req, res));
router.delete('/:id', (req, res) => userController.deleteUser(req, res));

export default router;