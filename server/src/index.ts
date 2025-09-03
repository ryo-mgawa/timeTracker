import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import userRoutes from './presentation/routes/userRoutes';
import projectRoutes from './presentation/routes/projectRoutes';
import categoryRoutes from './presentation/routes/categoryRoutes';
import taskRoutes from './presentation/routes/taskRoutes';
import timeEntryRoutes from './presentation/routes/timeEntryRoutes';
import reportRoutes from './presentation/routes/reportRoutes';

// ポート設定（マジックナンバー対応）
const DEFAULT_PORT = 3001;
const PORT = process.env.PORT || DEFAULT_PORT;

// アプリケーション作成
const app = express();

// セキュリティミドルウェア
app.use(helmet());

// CORS設定
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['http://localhost:3000'] // 本番環境では適切なオリジンを設定
    : true,
  credentials: true
}));

// ボディパーサー
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ヘルスチェックエンドポイント
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Time Tracker API is running',
    timestamp: new Date().toISOString()
  });
});

// APIルートの設定
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/time-entries', timeEntryRoutes);
app.use('/api/reports', reportRoutes);

// エラーハンドリングミドルウェア
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'サーバーエラーが発生しました'
  });
});

// 404ハンドリング
app.use('*', (_req, res) => {
  res.status(404).json({
    success: false,
    error: 'エンドポイントが見つかりません'
  });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`🚀 Time Tracker API is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});