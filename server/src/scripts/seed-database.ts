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

// 初期テストデータ投入スクリプト
async function seedDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🌱 データベースシード開始...');
    
    // リポジトリインスタンス作成
    const userRepo = new RealUserRepository(prisma);
    const projectRepo = new RealProjectRepository(prisma);
    const categoryRepo = new RealCategoryRepository(prisma);
    const taskRepo = new RealTaskRepository(prisma);
    const timeEntryRepo = new RealTimeEntryRepository(prisma);

    console.log('🧹 既存データをクリア中...');
    // 既存データクリア（外部キー制約を考慮した順序）
    await timeEntryRepo.clear();
    await taskRepo.clear();
    await categoryRepo.clear();
    await projectRepo.clear();
    await userRepo.clear();

    console.log('👥 テストユーザーを作成中...');
    // テストユーザー作成
    const testUsers = [
      User.create('山田太郎', 'yamada@example.com'),
      User.create('佐藤花子', 'sato@example.com'),
      User.create('鈴木一郎', 'suzuki@example.com'),
      User.create('田中美咲', 'tanaka@example.com'),
      User.create('伊藤直樹', 'ito@example.com')
    ];

    const savedUsers = [];
    for (const user of testUsers) {
      const savedUser = await userRepo.save(user);
      savedUsers.push(savedUser);
      console.log(`  ✅ ユーザー作成: ${savedUser.name.getValue()}`);
    }

    console.log('📊 テストプロジェクトを作成中...');
    // 各ユーザーにプロジェクト作成
    const projectTemplates = [
      { name: 'Webサイトリニューアル', description: 'コーポレートサイトの全面刷新', color: '#3498db' },
      { name: 'モバイルアプリ開発', description: 'iOS/Androidアプリの新規開発', color: '#e74c3c' },
      { name: 'データベース移行', description: 'レガシーDBからクラウドDBへの移行', color: '#2ecc71' },
      { name: '業務システム改善', description: '社内システムのUI/UX改善', color: '#f39c12' }
    ];

    const savedProjects = [];
    for (let i = 0; i < savedUsers.length; i++) {
      const user = savedUsers[i];
      // 各ユーザーに2-3個のプロジェクトを作成
      const projectCount = Math.min(projectTemplates.length, 2 + (i % 2));
      
      for (let j = 0; j < projectCount; j++) {
        const template = projectTemplates[j];
        const project = Project.create(
          `${template.name} (${user.name.getValue()})`,
          user.id,
          template.description,
          template.color
        );
        const savedProject = await projectRepo.save(project);
        savedProjects.push(savedProject);
        console.log(`  ✅ プロジェクト作成: ${savedProject.name.getValue()}`);
      }
    }

    console.log('🏷️ テスト分類を作成中...');
    // 各ユーザーに分類作成（プロジェクト横断で使用）
    const categoryTemplates = [
      { name: '設計', description: 'システム設計・DB設計', color: '#9b59b6' },
      { name: '開発', description: 'プログラミング・コーディング', color: '#e67e22' },
      { name: 'テスト', description: '単体テスト・結合テスト', color: '#f1c40f' },
      { name: '会議', description: '打ち合わせ・ミーティング', color: '#34495e' },
      { name: 'ドキュメント作成', description: '仕様書・マニュアル作成', color: '#1abc9c' }
    ];

    const savedCategories = [];
    for (const user of savedUsers) {
      // 各ユーザーに3-4個の分類を作成
      const categoryCount = Math.min(categoryTemplates.length, 3 + (savedUsers.indexOf(user) % 2));
      
      for (let k = 0; k < categoryCount; k++) {
        const template = categoryTemplates[k];
        const category = Category.create(
          template.name,
          user.id,
          template.description,
          template.color
        );
        const savedCategory = await categoryRepo.save(category);
        savedCategories.push(savedCategory);
        console.log(`  ✅ 分類作成: ${savedCategory.name.getValue()} (${user.name.getValue()})`);
      }
    }

    console.log('📝 テストタスクを作成中...');
    // 各プロジェクトにタスク作成
    const taskTemplates = [
      '要件定義',
      '基本設計',
      '詳細設計',
      'フロントエンド実装',
      'バックエンド実装',
      'データベース設計',
      'API設計',
      'テスト設計',
      '単体テスト',
      '結合テスト'
    ];

    const savedTasks = [];
    for (const project of savedProjects) {
      // 各プロジェクトに3-5個のタスクを作成
      const taskCount = 3 + (savedProjects.indexOf(project) % 3);
      
      for (let l = 0; l < taskCount; l++) {
        const taskName = taskTemplates[l % taskTemplates.length];
        const task = Task.create(
          taskName,
          project.id,
          project.userId,
          `${project.name.getValue()}における${taskName}の実施`
        );
        const savedTask = await taskRepo.save(task);
        savedTasks.push(savedTask);
        console.log(`  ✅ タスク作成: ${savedTask.name.getValue()} (${project.name.getValue()})`);
      }
    }

    console.log('⏰ テスト工数エントリを作成中...');
    // 各ユーザーに工数エントリを作成（過去1週間分）
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    let entryCount = 0;
    for (const user of savedUsers) {
      const userCategories = savedCategories.filter(c => c.userId === user.id);
      const userTasks = savedTasks.filter(t => t.userId === user.id);
      
      if (userTasks.length === 0 || userCategories.length === 0) continue;
      
      // 過去7日間のうち、5日分の工数エントリを作成
      for (let day = 0; day < 7; day++) {
        if (day === 1 || day === 6) continue; // 土日は除く（簡単のため）
        
        const workDate = new Date(oneWeekAgo.getTime() + day * 24 * 60 * 60 * 1000);
        
        // 1日あたり3-5個の工数エントリ
        const entriesPerDay = 3 + (day % 3);
        let currentHour = 9; // 9時開始
        
        for (let entry = 0; entry < entriesPerDay; entry++) {
          if (currentHour >= 18) break; // 18時で終業
          
          const randomTask = userTasks[Math.floor(Math.random() * userTasks.length)];
          const randomCategory = userCategories[Math.floor(Math.random() * userCategories.length)];
          
          // 1-2時間の工数エントリ（15分刻み）
          const durationHours = 1 + (Math.floor(Math.random() * 4) * 0.25); // 1.0, 1.25, 1.5, 1.75, 2.0時間
          
          const startTime = new Date(workDate);
          startTime.setHours(currentHour, 0, 0, 0);
          
          const endTime = new Date(startTime);
          endTime.setTime(startTime.getTime() + durationHours * 60 * 60 * 1000);
          
          try {
            const timeEntry = TimeEntry.create(
              randomTask.id,
              randomCategory.id,
              user.id,
              startTime,
              endTime,
              `${randomTask.name.getValue()}の作業実施`
            );
            
            await timeEntryRepo.save(timeEntry);
            entryCount++;
            
            currentHour = endTime.getHours() + (endTime.getMinutes() > 0 ? 1 : 0);
          } catch (error) {
            // 重複エラーなどは無視して続行
            console.log(`  ⚠️ 工数エントリスキップ: ${error instanceof Error ? error.message : error}`);
          }
        }
      }
    }
    
    console.log(`  ✅ 工数エントリ作成: ${entryCount}件`);

    console.log('\n🎉 データベースシード完了！');
    console.log(`📊 作成されたデータ:`);
    console.log(`  - ユーザー: ${savedUsers.length}人`);
    console.log(`  - プロジェクト: ${savedProjects.length}件`);
    console.log(`  - 分類: ${savedCategories.length}件`);
    console.log(`  - タスク: ${savedTasks.length}件`);
    console.log(`  - 工数エントリ: ${entryCount}件`);

  } catch (error) {
    console.error('❌ シードデータ投入エラー:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプト実行
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✨ シード処理が完了しました！');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 シード処理でエラーが発生しました:', error);
      process.exit(1);
    });
}

export { seedDatabase };