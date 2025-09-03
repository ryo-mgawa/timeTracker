import { PrismaClient } from '../generated/prisma';
import { User } from '../domain/entities/User';
import { Project } from '../domain/entities/Project';
import { Category } from '../domain/entities/Category';
import { Task } from '../domain/entities/Task';
import { TimeEntry } from '../domain/entities/TimeEntry';
import { RealUserRepository } from '../infrastructure/repositories/RealUserRepository';
import { RealProjectRepository } from '../infrastructure/repositories/RealProjectRepository';
import { RealCategoryRepository } from '../infrastructure/repositories/RealCategoryRepository';
import { RealTaskRepository } from '../infrastructure/repositories/RealTaskRepository';
import { RealTimeEntryRepository } from '../infrastructure/repositories/RealTimeEntryRepository';

// シンプルなシードスクリプト（クリア処理なし）
async function simpleSeed() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🌱 シンプルシード開始...');
    
    // リポジトリインスタンス作成
    const userRepo = new RealUserRepository(prisma);
    const projectRepo = new RealProjectRepository(prisma);
    const categoryRepo = new RealCategoryRepository(prisma);
    const taskRepo = new RealTaskRepository(prisma);
    const timeEntryRepo = new RealTimeEntryRepository(prisma);

    console.log('👤 テストユーザーを1人作成中...');
    // 簡単なテストユーザー1人だけ作成
    const testUser = User.create('テストユーザー', 'test@example.com');
    const savedUser = await userRepo.save(testUser);
    console.log(`  ✅ ユーザー作成: ${savedUser.name.getValue()}`);

    console.log('📁 テストプロジェクトを1つ作成中...');
    // 簡単なテストプロジェクト1つだけ作成
    const testProject = Project.create(
      'テストプロジェクト',
      savedUser.id,
      'テスト用のプロジェクトです'
    );
    const savedProject = await projectRepo.save(testProject);
    console.log(`  ✅ プロジェクト作成: ${savedProject.name.getValue()}`);

    console.log('🏷️ テスト分類を1つ作成中...');
    // 簡単なテスト分類1つだけ作成
    const testCategory = Category.create(
      '開発',
      savedUser.id,
      'テスト用の開発分類です'
    );
    const savedCategory = await categoryRepo.save(testCategory);
    console.log(`  ✅ 分類作成: ${savedCategory.name.getValue()}`);

    console.log('📋 テストタスクを1つ作成中...');
    // 簡単なテストタスク1つだけ作成
    const testTask = Task.create(
      'テストタスク',
      savedProject.id,
      savedUser.id,
      'テスト用のタスクです'
    );
    const savedTask = await taskRepo.save(testTask);
    console.log(`  ✅ タスク作成: ${savedTask.name.getValue()}`);

    console.log('⏰ テスト工数エントリを1つ作成中...');
    // 簡単なテスト工数エントリ1つだけ作成
    const now = new Date();
    const startTime = new Date(now);
    startTime.setHours(9, 0, 0, 0); // 9:00
    const endTime = new Date(now);
    endTime.setHours(10, 0, 0, 0); // 10:00
    
    const testTimeEntry = TimeEntry.create(
      savedTask.id,
      savedCategory.id,
      savedUser.id,
      startTime,
      endTime,
      'テスト用の工数エントリです'
    );
    await timeEntryRepo.save(testTimeEntry);
    console.log(`  ✅ 工数エントリ作成: ${testTimeEntry.memo || 'メモなし'}`);

    console.log('\n🎉 シンプルシード完了！');
    console.log(`📊 作成されたデータ:`);
    console.log(`  - ユーザー: 1人`);
    console.log(`  - プロジェクト: 1件`);
    console.log(`  - 分類: 1件`);
    console.log(`  - タスク: 1件`);
    console.log(`  - 工数エントリ: 1件`);

  } catch (error) {
    console.error('❌ シンプルシードエラー:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプト実行
if (require.main === module) {
  simpleSeed()
    .then(() => {
      console.log('✨ シンプルシードが完了しました！');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 シンプルシードでエラーが発生しました:', error);
      process.exit(1);
    });
}

export { simpleSeed };