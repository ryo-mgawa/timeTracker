import { Project } from '../../domain/entities/Project';
import { ProjectId, UserId } from '../../shared/types/common';

// プロジェクト用モックリポジトリ
export class MockProjectRepository {
  private projects: Map<ProjectId, Project> = new Map();

  constructor() {
    this.initializeProjects();
  }

  async findAll(): Promise<readonly Project[]> {
    const allProjects = Array.from(this.projects.values());
    return allProjects.filter(project => !project.isDeleted());
  }

  async findByUserId(userId: UserId): Promise<readonly Project[]> {
    // アーリーリターン
    if (!userId) return [];

    const allProjects = Array.from(this.projects.values());
    return allProjects.filter(project => 
      project.belongsToUser(userId) && !project.isDeleted()
    );
  }

  async findById(id: ProjectId): Promise<Project | null> {
    const project = this.projects.get(id);
    
    // アーリーリターン
    if (!project) return null;
    if (project.isDeleted()) return null;
    
    return project;
  }

  async findByUserIdAndId(userId: UserId, id: ProjectId): Promise<Project | null> {
    const project = this.projects.get(id);
    
    // アーリーリターン
    if (!project) return null;
    if (project.isDeleted()) return null;
    if (!project.belongsToUser(userId)) return null;
    
    return project;
  }

  async save(project: Project): Promise<Project> {
    if (!project) {
      throw new Error('プロジェクトは必須です');
    }

    this.projects.set(project.id, project);
    return project;
  }

  async delete(id: ProjectId, userId: UserId): Promise<void> {
    const project = this.projects.get(id);
    
    // アーリーリターン
    if (!project) {
      throw new Error('プロジェクトが見つかりません');
    }

    if (!project.belongsToUser(userId)) {
      throw new Error('このプロジェクトを削除する権限がありません');
    }

    // 論理削除
    const deletedProject = project.delete();
    this.projects.set(id, deletedProject);
  }

  // テスト用のクリア機能
  async clear(): Promise<void> {
    this.projects.clear();
  }

  // 初期データの作成
  private initializeProjects(): void {
    // モックユーザーIDと合わせる
    const userIds = [
      'user_1',
      'user_2', 
      'yamada',
      'sato',
      'suzuki'
    ];

    const projectData = [
      { name: 'Webサイトリニューアルプロジェクト', color: '#3498db', description: 'コーポレートサイトの全面リニューアル' },
      { name: 'モバイルアプリ開発', color: '#e74c3c', description: 'iOS/Androidアプリの新規開発' },
      { name: 'データベース移行プロジェクト', color: '#2ecc71', description: '既存DBからクラウドDBへの移行' },
      { name: '業務システム改善', color: '#f39c12', description: '社内業務システムのUX改善' },
      { name: 'セキュリティ強化プロジェクト', color: '#9b59b6', description: 'システムセキュリティの全面見直し' }
    ];

    // 各ユーザーにプロジェクトを作成
    userIds.forEach((userId, userIndex) => {
      projectData.forEach((data, projectIndex) => {
        // ユーザーごとに異なるプロジェクトを作成
        const project = Project.create(
          `${data.name} (${userId})`,
          userId,
          data.description,
          data.color
        );
        this.projects.set(project.id, project);
      });
    });
  }
}