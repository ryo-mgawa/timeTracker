// Node.jsでのフロントエンド・バックエンド通信テスト
const http = require('http');
const https = require('https');
const url = require('url');

// APIクライアント設定
const API_BASE_URL = 'http://localhost:3001';
const DEFAULT_TIMEOUT = 10000;

class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.timeout = DEFAULT_TIMEOUT;
  }

  // HTTPリクエストヘルパー
  async request(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
      const fullUrl = this.baseURL + endpoint;
      const parsedUrl = url.parse(fullUrl);
      const isHttps = parsedUrl.protocol === 'https:';
      const httpModule = isHttps ? https : http;

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: this.timeout
      };

      if (data) {
        const jsonData = JSON.stringify(data);
        options.headers['Content-Length'] = Buffer.byteLength(jsonData);
      }

      const req = httpModule.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const parsedData = JSON.parse(responseData);
            
            if (res.statusCode >= 400) {
              const errorMessage = parsedData.error || `HTTP ${res.statusCode}エラー`;
              reject(new Error(errorMessage));
              return;
            }

            resolve(parsedData);
          } catch (error) {
            reject(new Error('JSONの解析に失敗しました'));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`リクエストエラー: ${error.message}`));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('リクエストがタイムアウトしました'));
      });

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  // GET リクエスト
  async get(endpoint) {
    try {
      const response = await this.request('GET', endpoint);
      
      if (!response.success) {
        throw new Error(response.error || 'APIエラーが発生しました');
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // POST リクエスト
  async post(endpoint, data) {
    try {
      const response = await this.request('POST', endpoint, data);
      
      if (!response.success) {
        throw new Error(response.error || 'APIエラーが発生しました');
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // ヘルスチェック
  async healthCheck() {
    try {
      await this.request('GET', '/health');
      return true;
    } catch {
      return false;
    }
  }
}

// テストスクリプト
async function runIntegrationTest() {
  const apiClient = new ApiClient();
  
  console.log('🚀 フロントエンド・バックエンド通信テスト開始');
  
  try {
    // 1. ヘルスチェック
    console.log('\n1. ヘルスチェックテスト');
    const isHealthy = await apiClient.healthCheck();
    console.log(`✅ サーバー状態: ${isHealthy ? 'OK' : 'NG'}`);
    
    if (!isHealthy) {
      throw new Error('サーバーが応答しません');
    }

    // 2. ユーザー一覧取得テスト
    console.log('\n2. ユーザー一覧取得テスト');
    const users = await apiClient.get('/api/users');
    console.log(`✅ ユーザー取得成功: ${users.length}件`);
    console.log('ユーザー情報:', users);

    // 3. プロジェクト一覧取得テスト（最初のユーザーで）
    if (users.length > 0) {
      const userId = users[0].id;
      console.log(`\n3. プロジェクト一覧取得テスト (ユーザーID: ${userId})`);
      const projects = await apiClient.get(`/api/projects/user/${userId}`);
      console.log(`✅ プロジェクト取得成功: ${projects.length}件`);
      console.log('プロジェクト情報:', projects);

      // 4. 分類一覧取得テスト
      console.log(`\n4. 分類一覧取得テスト (ユーザーID: ${userId})`);
      const categories = await apiClient.get(`/api/categories/user/${userId}`);
      console.log(`✅ 分類取得成功: ${categories.length}件`);
      console.log('分類情報:', categories);

      // 5. タスク一覧取得テスト
      console.log(`\n5. タスク一覧取得テスト (ユーザーID: ${userId})`);
      const tasks = await apiClient.get(`/api/tasks/user/${userId}`);
      console.log(`✅ タスク取得成功: ${tasks.length}件`);
      console.log('タスク情報:', tasks);

      // 6. 工数エントリ一覧取得テスト
      console.log(`\n6. 工数エントリ一覧取得テスト (ユーザーID: ${userId})`);
      const timeEntries = await apiClient.get(`/api/time-entries/user/${userId}`);
      console.log(`✅ 工数エントリ取得成功: ${timeEntries.length}件`);
      console.log('工数エントリ情報:', timeEntries);

      // 7. 新規プロジェクト作成テスト
      console.log('\n7. 新規プロジェクト作成テスト');
      const timestamp = new Date().getTime();
      const newProject = await apiClient.post('/api/projects', {
        name: `テストプロジェクト_${timestamp}`,
        userId: userId,
        description: 'APIテスト用プロジェクト',
        color: '#FF6B6B'
      });
      console.log('✅ プロジェクト作成成功:', newProject);

      // 8. 新規分類作成テスト
      console.log('\n8. 新規分類作成テスト');
      const newCategory = await apiClient.post('/api/categories', {
        name: `テスト分類_${timestamp}`,
        userId: userId,
        description: 'APIテスト用分類',
        color: '#4ECDC4'
      });
      console.log('✅ 分類作成成功:', newCategory);

      // 9. 新規タスク作成テスト
      console.log('\n9. 新規タスク作成テスト');
      const newTask = await apiClient.post('/api/tasks', {
        name: `テストタスク_${timestamp}`,
        projectId: newProject.id,
        userId: userId,
        description: 'APIテスト用タスク'
      });
      console.log('✅ タスク作成成功:', newTask);

      // 10. 新規工数エントリ作成テスト
      console.log('\n10. 新規工数エントリ作成テスト');
      const now = new Date();
      const startTime = new Date(now);
      startTime.setHours(14, 30, 0, 0); // 14:30 (重複しない時間帯)
      const endTime = new Date(now);
      endTime.setHours(16, 0, 0, 0); // 16:00 (15分刻み)

      const newTimeEntry = await apiClient.post('/api/time-entries', {
        taskId: newTask.id,
        categoryId: newCategory.id,
        userId: userId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        memo: 'APIテスト用工数エントリ'
      });
      console.log('✅ 工数エントリ作成成功:', newTimeEntry);

    } else {
      console.log('⚠️  ユーザーが存在しないため、関連テストをスキップします');
    }

    console.log('\n🎉 すべてのテストが成功しました！');
    console.log('✨ フロントエンドとバックエンドの通信は正常に動作しています');

  } catch (error) {
    console.error('\n❌ テスト失敗:', error.message);
    console.error('スタックトレース:', error.stack);
    process.exit(1);
  }
}

// テスト実行
if (require.main === module) {
  runIntegrationTest();
}

module.exports = { ApiClient, runIntegrationTest };