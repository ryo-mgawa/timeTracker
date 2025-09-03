import { PrismaClient } from './src/generated/prisma';

const prisma = new PrismaClient();

async function testDatabaseConnection() {
  try {
    console.log('🔄 データベース接続をテスト中...');
    
    // データベース接続テスト
    await prisma.$connect();
    console.log('✅ データベースに正常に接続しました！');
    
    // シンプルなクエリで各テーブルの存在確認
    console.log('📋 テーブル確認中...');
    
    // 各テーブルに順番にアクセス
    await prisma.user.findMany({ take: 0 });
    console.log('👥 Users テーブル: OK');
    
    await prisma.project.findMany({ take: 0 });
    console.log('📊 Projects テーブル: OK');
    
    await prisma.category.findMany({ take: 0 });
    console.log('🏷️ Categories テーブル: OK');
    
    await prisma.task.findMany({ take: 0 });
    console.log('📝 Tasks テーブル: OK');
    
    await prisma.timeEntry.findMany({ take: 0 });
    console.log('⏰ TimeEntries テーブル: OK');
    
    console.log('\n🎉 すべてのテーブルへのアクセスが確認できました！');
    console.log('✨ Prisma ORM のセットアップが完了しました！');
    
  } catch (error) {
    console.error('❌ データベース接続エラー:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 データベース接続を切断しました');
  }
}

// テスト実行
testDatabaseConnection();