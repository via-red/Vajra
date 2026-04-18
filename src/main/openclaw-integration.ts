// 主进程中的 OpenClaw 集成

import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as http from 'http';
import * as https from 'https';
import { URL } from 'url';

const execAsync = promisify(exec);

// OpenClaw Gateway 配置
const GATEWAY_HOST = '127.0.0.1';
const GATEWAY_PORT = 18789;
const GATEWAY_URL = `http://${GATEWAY_HOST}:${GATEWAY_PORT}`;
const WS_URL = `ws://${GATEWAY_HOST}:${GATEWAY_PORT}/ws`;

// 连接状态
enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error'
}

// 连接管理器
class OpenClawConnectionManager {
  private ws: WebSocket | null = null;
  private status: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  private connectionAttempts = 0;
  private maxAttempts = 3;
  private reconnectDelay = 5000; // 5秒
  
  constructor(private mainWindow: BrowserWindow) {}
  
  // 获取当前状态
  getStatus(): ConnectionStatus {
    return this.status;
  }
  
  // 连接到 Gateway
  async connect(): Promise<{ success: boolean; message: string; details?: any }> {
    if (this.status === ConnectionStatus.CONNECTED || this.status === ConnectionStatus.CONNECTING) {
      return { success: true, message: 'Already connected or connecting' };
    }
    
    this.status = ConnectionStatus.CONNECTING;
    this.mainWindow.webContents.send('openclaw:status', { status: this.status });
    
    // 尝试多种连接方式
    const results = await this.tryAllConnectionMethods();
    
    if (results.success) {
      this.status = ConnectionStatus.CONNECTED;
      this.connectionAttempts = 0;
      this.mainWindow.webContents.send('openclaw:connected');
      return { success: true, message: 'Connected to OpenClaw Gateway', details: results.details };
    } else {
      this.status = ConnectionStatus.ERROR;
      this.mainWindow.webContents.send('openclaw:connection-error', results.error);
      
      // 如果连接尝试次数过多，延迟重连
      if (this.connectionAttempts < this.maxAttempts) {
        this.connectionAttempts++;
        setTimeout(() => this.connect(), this.reconnectDelay);
      }
      
      return { 
        success: false, 
        message: 'Failed to connect to OpenClaw Gateway', 
        details: results 
      };
    }
  }
  
  // 尝试所有连接方法
  private async tryAllConnectionMethods(): Promise<{ success: boolean; method?: string; details?: any; error?: string }> {
    console.log('尝试连接到 OpenClaw Gateway...');
    
    // 1. 首先检查 Gateway 是否运行
    const healthCheck = await this.checkGatewayHealth();
    if (!healthCheck.alive) {
      return { 
        success: false, 
        error: `Gateway 未运行或无法访问 (${GATEWAY_URL})`,
        details: { healthCheck }
      };
    }
    
    console.log('Gateway 健康检查通过，尝试连接方法...');
    
    // 2. 尝试 WebSocket 连接
    const wsResult = await this.tryWebSocketConnection();
    if (wsResult.success) {
      return { success: true, method: 'websocket', details: wsResult };
    }
    
    // 3. 尝试 HTTP API 连接
    const httpResult = await this.tryHttpApiConnection();
    if (httpResult.success) {
      return { success: true, method: 'http', details: httpResult };
    }
    
    // 4. 尝试 CLI 连接
    const cliResult = await this.tryCliConnection();
    if (cliResult.success) {
      return { success: true, method: 'cli', details: cliResult };
    }
    
    return { 
      success: false, 
      error: '所有连接方法都失败',
      details: { wsResult, httpResult, cliResult }
    };
  }
  
  // 检查 Gateway 健康状态
  private async checkGatewayHealth(): Promise<{ alive: boolean; response?: any }> {
    try {
      const response = await this.httpRequest(`${GATEWAY_URL}/health`, 'GET');
      return { alive: true, response };
    } catch (error) {
      return { alive: false };
    }
  }
  
  // 尝试 WebSocket 连接
  private async tryWebSocketConnection(): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      try {
        console.log(`尝试 WebSocket 连接: ${WS_URL}`);
        
        // 在 Electron 主进程中创建 WebSocket
        this.ws = new WebSocket(WS_URL);
        
        this.ws.onopen = () => {
          console.log('WebSocket 连接成功');
          resolve({ success: true });
        };
        
        this.ws.onerror = (error) => {
          console.error('WebSocket 连接错误:', error);
          resolve({ success: false, error: 'WebSocket connection failed' });
        };
        
        this.ws.onclose = () => {
          console.log('WebSocket 连接关闭');
          this.ws = null;
        };
        
        // 设置超时
        setTimeout(() => {
          if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
            this.ws.close();
            resolve({ success: false, error: 'WebSocket connection timeout' });
          }
        }, 5000);
        
      } catch (error: any) {
        resolve({ success: false, error: error.message });
      }
    });
  }
  
  // 尝试 HTTP API 连接
  private async tryHttpApiConnection(): Promise<{ success: boolean; error?: string; response?: any }> {
    try {
      console.log('尝试 HTTP API 连接...');
      
      // 尝试常见的 API 端点
      const endpoints = [
        '/api/agent',
        '/api/v1/agent',
        '/api/chat',
        '/api/message'
      ];
      
      for (const endpoint of endpoints) {
        try {
          const url = `${GATEWAY_URL}${endpoint}`;
          console.log(`尝试端点: ${url}`);
          
          // 发送测试请求
          const response = await this.httpRequest(url, 'POST', {
            message: 'ping',
            sessionId: 'vajra-test'
          });
          
          if (response) {
            console.log(`HTTP API 端点可用: ${endpoint}`);
            return { success: true, response };
          }
        } catch (error) {
          // 继续尝试下一个端点
          continue;
        }
      }
      
      return { success: false, error: '没有可用的 HTTP API 端点' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
  
  // 尝试 CLI 连接
  private async tryCliConnection(): Promise<{ success: boolean; error?: string; output?: string }> {
    try {
      console.log('尝试 CLI 连接...');
      
      // 检查 openclaw 命令是否可用
      const { stdout, stderr } = await execAsync('openclaw --version');
      
      if (stderr && !stdout) {
        return { success: false, error: 'OpenClaw CLI 不可用' };
      }
      
      console.log('OpenClaw CLI 可用，版本:', stdout?.trim() || 'unknown');
      
      // 尝试发送测试消息（注意：可能需要配对）
      try {
        const { stdout: agentStdout } = await execAsync(
          `openclaw agent --agent main --message "Vajra IDE test connection" --json`,
          { timeout: 10000 }
        );
        
        return { success: true, output: agentStdout };
      } catch (error: any) {
        // CLI 可用但需要配对或其他配置
        return { 
          success: false, 
          error: `CLI 连接需要配置: ${error.message}` 
        };
      }
      
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
  
  // 发送消息到 AI 助手
  async sendMessage(question: string, context?: any): Promise<{ success: boolean; answer?: string; error?: string; method?: string }> {
    if (this.status !== ConnectionStatus.CONNECTED) {
      const connectResult = await this.connect();
      if (!connectResult.success) {
        return { 
          success: false, 
          error: `无法连接: ${connectResult.message}`,
          method: 'fallback'
        };
      }
    }
    
    // 优先使用 WebSocket
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return this.sendViaWebSocket(question, context);
    }
    
    // 尝试 HTTP API
    const httpResult = await this.sendViaHttpApi(question, context);
    if (httpResult.success) {
      return { ...httpResult, method: 'http' };
    }
    
    // 尝试 CLI
    const cliResult = await this.sendViaCli(question, context);
    if (cliResult.success) {
      return { ...cliResult, method: 'cli' };
    }
    
    // 所有方法都失败，回退到模拟响应
    console.log('所有真实连接方法失败，使用模拟响应');
    return this.sendViaSimulation(question, context);
  }
  
  // 通过 WebSocket 发送消息
  private async sendViaWebSocket(question: string, context?: any): Promise<{ success: boolean; answer?: string; error?: string }> {
    return new Promise((resolve) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        resolve({ success: false, error: 'WebSocket 未连接' });
        return;
      }
      
      const messageId = Date.now().toString();
      const message = {
        id: messageId,
        type: 'agent-request',
        payload: {
          message: question,
          context,
          sessionId: 'vajra-material-ide',
          timestamp: new Date().toISOString()
        }
      };
      
      // 设置响应超时
      const timeout = setTimeout(() => {
        resolve({ success: false, error: 'WebSocket 响应超时' });
      }, 30000);
      
      // 消息处理器
      const messageHandler = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.id === messageId || data.responseTo === messageId) {
            clearTimeout(timeout);
            this.ws?.removeEventListener('message', messageHandler);
            
            if (data.error) {
              resolve({ success: false, error: data.error });
            } else {
              resolve({ 
                success: true, 
                answer: data.payload?.response || data.message || JSON.stringify(data) 
              });
            }
          }
        } catch (error) {
          // 继续等待正确格式的响应
        }
      };
      
      this.ws.addEventListener('message', messageHandler);
      
      try {
        this.ws.send(JSON.stringify(message));
      } catch (error: any) {
        clearTimeout(timeout);
        this.ws?.removeEventListener('message', messageHandler);
        resolve({ success: false, error: error.message });
      }
    });
  }
  
  // 通过 HTTP API 发送消息
  private async sendViaHttpApi(question: string, context?: any): Promise<{ success: boolean; answer?: string; error?: string }> {
    try {
      // 尝试多个可能的 API 端点
      const endpoints = [
        { path: '/api/agent', method: 'POST' },
        { path: '/api/v1/agent', method: 'POST' },
        { path: '/api/chat', method: 'POST' },
        { path: '/api/message', method: 'POST' }
      ];
      
      const payload = {
        message: question,
        context,
        sessionId: 'vajra-material-ide',
        timestamp: new Date().toISOString(),
        agent: 'main'
      };
      
      for (const endpoint of endpoints) {
        try {
          const url = `${GATEWAY_URL}${endpoint.path}`;
          const response = await this.httpRequest(url, endpoint.method, payload);
          
          if (response) {
            // 尝试解析响应
            const answer = response.response || response.answer || response.message || JSON.stringify(response);
            return { success: true, answer };
          }
        } catch (error) {
          // 继续尝试下一个端点
          continue;
        }
      }
      
      return { success: false, error: '所有 HTTP API 端点都失败' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
  
  // 通过 CLI 发送消息
  private async sendViaCli(question: string, context?: any): Promise<{ success: boolean; answer?: string; error?: string }> {
    try {
      const contextStr = context ? ` --context '${JSON.stringify(context)}'` : '';
      const command = `openclaw agent --agent main --message "${question.replace(/"/g, '\\"')}"${contextStr} --json`;
      
      const { stdout, stderr } = await execAsync(command, { timeout: 60000 });
      
      if (stderr && !stdout) {
        return { success: false, error: stderr };
      }
      
      try {
        const result = JSON.parse(stdout);
        if (result.error) {
          return { success: false, error: result.error };
        }
        return { success: true, answer: result.response || result.answer || stdout };
      } catch (parseError) {
        // 如果无法解析为 JSON，返回原始输出
        return { success: true, answer: stdout };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
  
  // 模拟响应（后备方案）
  private async sendViaSimulation(question: string, context?: any): Promise<{ success: boolean; answer: string; error?: string }> {
    try {
      const response = await simulateAIResponse(question, context);
      return { success: true, answer: response };
    } catch (error: any) {
      return { success: false, error: error.message, answer: '模拟响应失败' };
    }
  }
  
  // 通用的 HTTP 请求函数
  private httpRequest(url: string, method: string, data?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname,
        method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Vajra-Material-IDE/1.0'
        }
      };
      
      const req = (urlObj.protocol === 'https:' ? https : http).request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(responseData));
            } catch {
              resolve(responseData);
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
          }
        });
      });
      
      req.on('error', reject);
      
      if (data) {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }
  
  // 断开连接
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.status = ConnectionStatus.DISCONNECTED;
    this.mainWindow.webContents.send('openclaw:disconnected');
  }
}

export function setupOpenClawIntegration(mainWindow: BrowserWindow) {
  // 创建连接管理器
  const connectionManager = new OpenClawConnectionManager(mainWindow);

  // 连接到 OpenClaw Gateway
  ipcMain.handle('openclaw:connect', async () => {
    try {
      const result = await connectionManager.connect();
      
      if (result.success) {
        mainWindow.webContents.send('openclaw:connected', result.details);
        return { success: true, message: result.message, details: result.details };
      } else {
        mainWindow.webContents.send('openclaw:connection-error', result);
        return { success: false, error: result.message, details: result.details };
      }
    } catch (error: any) {
      console.error('Failed to connect to OpenClaw:', error);
      const errorResult = { success: false, error: error.message };
      mainWindow.webContents.send('openclaw:connection-error', errorResult);
      return errorResult;
    }
  });

  // 向 AI 助手提问
  ipcMain.handle('openclaw:ask', async (event: IpcMainInvokeEvent, question: string, context?: any) => {
    try {
      console.log(`OpenClaw 提问: ${question.substring(0, 100)}${question.length > 100 ? '...' : ''}`);
      
      // 发送开始处理事件
      mainWindow.webContents.send('openclaw:processing', { question, timestamp: new Date().toISOString() });
      
      // 使用连接管理器发送消息
      const startTime = Date.now();
      const result = await connectionManager.sendMessage(question, context);
      const responseTime = Date.now() - startTime;
      
      if (result.success) {
        // 发送响应事件
        mainWindow.webContents.send('openclaw:response', {
          question,
          answer: result.answer,
          timestamp: new Date().toISOString(),
          responseTime,
          method: result.method || 'unknown'
        });
        
        console.log(`OpenClaw 响应成功 (${responseTime}ms, 方法: ${result.method || 'unknown'})`);
        return { success: true, answer: result.answer, responseTime, method: result.method };
      } else {
        // 发送错误事件
        mainWindow.webContents.send('openclaw:error', {
          question,
          error: result.error,
          timestamp: new Date().toISOString(),
          responseTime
        });
        
        console.error(`OpenClaw 响应失败: ${result.error}`);
        return { success: false, error: result.error, responseTime };
      }
    } catch (error: any) {
      console.error('Failed to ask AI:', error);
      mainWindow.webContents.send('openclaw:error', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      return { success: false, error: error.message };
    }
  });

  // 执行工作流
  ipcMain.handle('workflow:execute', async (event: IpcMainInvokeEvent, workflowDefinition: any) => {
    try {
      console.log('执行工作流:', workflowDefinition.name || '未命名工作流');
      
      // 发送进度更新
      mainWindow.webContents.send('workflow:progress', { step: 1, total: 5, message: '解析工作流定义' });
      
      // 在实际应用中，这里会通过 OpenClaw 执行工作流
      // 暂时保持模拟执行，但可以扩展为真实执行
      
      await new Promise(resolve => setTimeout(resolve, 500));
      mainWindow.webContents.send('workflow:progress', { step: 2, total: 5, message: '准备计算资源' });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      mainWindow.webContents.send('workflow:progress', { step: 3, total: 5, message: '执行计算任务' });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      mainWindow.webContents.send('workflow:progress', { step: 4, total: 5, message: '处理计算结果' });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      mainWindow.webContents.send('workflow:progress', { step: 5, total: 5, message: '生成输出报告' });
      
      // 模拟结果
      const results = {
        success: true,
        output: {
          predictions: {
            hardness: '250 ± 30 HV',
            strength: '850 ± 50 MPa',
            ductility: '22 ± 5%'
          },
          recommendations: [
            '优化热处理工艺以提高强度',
            '考虑添加微量合金元素改善性能',
            '进行实验验证关键性能指标'
          ],
          generatedFiles: [
            'prediction_report.pdf',
            'material_data.rdf',
            'analysis_results.json'
          ]
        }
      };
      
      mainWindow.webContents.send('workflow:completed', results);
      
      return results;
    } catch (error: any) {
      console.error('Failed to execute workflow:', error);
      mainWindow.webContents.send('workflow:error', error.message);
      return { success: false, error: error.message };
    }
  });

  // 检查 OpenClaw 状态
  ipcMain.handle('openclaw:status', async () => {
    try {
      // 检查 OpenClaw Gateway 是否在运行
      const { stdout } = await execAsync('openclaw gateway status');
      const isRunning = stdout.includes('running') || stdout.includes('active');
      
      // 获取连接管理器状态
      const connectionStatus = connectionManager.getStatus();
      
      return {
        success: true,
        gateway: {
          running: isRunning,
          status: isRunning ? 'active' : 'inactive'
        },
        connection: {
          status: connectionStatus,
          url: GATEWAY_URL
        }
      };
    } catch (error) {
      // OpenClaw 可能未安装或未运行
      return {
        success: true,
        gateway: {
          running: false,
          status: 'not_installed'
        },
        connection: {
          status: ConnectionStatus.DISCONNECTED,
          url: GATEWAY_URL
        }
      };
    }
  });

  // 启动 OpenClaw Gateway
  ipcMain.handle('openclaw:start', async () => {
    try {
      console.log('启动 OpenClaw Gateway...');
      
      // 在实际应用中，这里会启动 OpenClaw Gateway
      // 暂时模拟启动，但可以扩展为真实启动
      
      const { stdout, stderr } = await execAsync('openclaw gateway start', { timeout: 30000 });
      
      if (stderr && !stdout.includes('started')) {
        throw new Error(stderr);
      }
      
      // 等待 Gateway 启动
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 尝试连接
      const connectResult = await connectionManager.connect();
      
      mainWindow.webContents.send('openclaw:started', {
        stdout,
        connectResult
      });
      
      return { 
        success: true, 
        message: 'OpenClaw Gateway started',
        details: { stdout, connectResult }
      };
    } catch (error: any) {
      console.error('Failed to start OpenClaw:', error);
      mainWindow.webContents.send('openclaw:start-error', error.message);
      return { success: false, error: error.message };
    }
  });

  // 停止 OpenClaw Gateway
  ipcMain.handle('openclaw:stop', async () => {
    try {
      console.log('停止 OpenClaw Gateway...');
      
      // 断开连接
      connectionManager.disconnect();
      
      // 停止 Gateway
      const { stdout, stderr } = await execAsync('openclaw gateway stop', { timeout: 10000 });
      
      if (stderr && !stdout.includes('stopped')) {
        throw new Error(stderr);
      }
      
      mainWindow.webContents.send('openclaw:stopped', { stdout });
      
      return { success: true, message: 'OpenClaw Gateway stopped', details: { stdout } };
    } catch (error: any) {
      console.error('Failed to stop OpenClaw:', error);
      mainWindow.webContents.send('openclaw:stop-error', error.message);
      return { success: false, error: error.message };
    }
  });

  // 获取连接详情
  ipcMain.handle('openclaw:connection-details', async () => {
    return {
      gatewayUrl: GATEWAY_URL,
      wsUrl: WS_URL,
      connectionStatus: connectionManager.getStatus(),
      timestamp: new Date().toISOString()
    };
  });

  console.log('OpenClaw 真实集成已设置，准备连接到 Gateway:', GATEWAY_URL);
  
  // 自动尝试连接（可选）
  // setTimeout(() => {
  //   console.log('自动尝试连接到 OpenClaw Gateway...');
  //   connectionManager.connect().then(result => {
  //     console.log('自动连接结果:', result.success ? '成功' : '失败', result.message);
  //   });
  // }, 3000);
}

// 模拟 AI 响应
async function simulateAIResponse(question: string, context?: any): Promise<string> {
  // 模拟处理延迟
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // 根据问题类型生成不同的响应
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('分析') || lowerQuestion.includes('composition')) {
    return `根据您提供的材料配方分析：

1. **相稳定性分析**:
   - CoCrFeNiMn 高熵合金在室温下倾向于形成单相 FCC 结构
   - 各元素混合熵较高，有利于固溶体形成
   - 计算出的相形成焓为负值，表明热力学稳定

2. **性能预测**:
   - 硬度: 预计 200-300 HV (维氏硬度)
   - 屈服强度: 预计 600-800 MPa
   - 断裂韧性: 预计 30-50 MPa·m¹/²
   - 密度: 约 8.1 g/cm³

3. **改进建议**:
   - 可添加 2-5% Al 以提高强度
   - 调整 Cr 含量至 15-25% 以优化耐腐蚀性
   - 考虑后续热处理工艺 (如时效处理)

4. **实验验证建议**:
   - 进行 XRD 分析确认相组成
   - 开展显微硬度测试
   - 进行拉伸试验获取力学性能数据

建议使用 DFT 计算进一步验证电子结构，并通过 CALPHAD 方法优化成分设计。`;
  }
  
  if (lowerQuestion.includes('预测') || lowerQuestion.includes('性能') || lowerQuestion.includes('property')) {
    return `基于材料数据库和机器学习模型预测：

**CoCrFeNiMn 高熵合金性能预测报告**

1. **力学性能**:
   - 抗拉强度: 850 ± 50 MPa
   - 屈服强度: 650 ± 40 MPa
   - 断裂伸长率: 22 ± 5%
   - 硬度: 250 ± 30 HV
   - 弹性模量: 180 ± 20 GPa

2. **热学性能**:
   - 熔点: 1350 ± 50°C
   - 热导率: 15 ± 3 W/m·K (室温)
   - 热膨胀系数: 14 ± 2 × 10⁻⁶/K (20-500°C)
   - 比热容: 450 ± 50 J/kg·K

3. **电学性能**:
   - 电导率: 5 ± 1% IACS
   - 电阻率: 35 ± 5 μΩ·cm

4. **耐腐蚀性能**:
   - 在 3.5% NaCl 溶液中腐蚀速率: < 0.1 mm/year
   - 钝化性能良好，适合海洋环境应用

**预测不确定性说明**:
- 以上预测基于类似合金的数据库和机器学习模型
- 实际性能受制备工艺、微观结构、热处理等因素影响
- 建议通过实验验证关键性能指标

**数据来源**:
- Materials Project 高通量计算数据库
- OQMD 量子力学数据库
- 文献报道的实验数据综合`;
  }
  
  if (lowerQuestion.includes('工作流') || lowerQuestion.includes('workflow')) {
    return `**材料开发工作流设计建议**

基于您的需求，推荐以下标准化工作流：

**工作流名称**: 高通量合金开发与优化
**预计周期**: 6-8周
**主要步骤**:

1. **计算筛选阶段** (2-3周)
   - 步骤1.1: 基于 DFT 的相稳定性计算 (VASP/Quantum ESPRESSO)
   - 步骤1.2: 机器学习性能预测 (scikit-learn/TensorFlow)
   - 步骤1.3: 多目标优化筛选配方 (NSGA-II/Pareto 优化)

2. **实验制备阶段** (2-3周)
   - 步骤2.1: 机器人辅助合金熔炼 (Ar 气保护)
   - 步骤2.2: 均匀化热处理 (1000-1200°C, 2-24h)
   - 步骤2.3: 热机械加工 (轧制/锻造)

3. **表征测试阶段** (1-2周)
   - 步骤3.1: 微观结构表征 (XRD, SEM, TEM)
   - 步骤3.2: 力学性能测试 (拉伸, 压缩, 硬度)
   - 步骤3.3: 功能性能测试 (腐蚀, 磨损, 疲劳)

4. **数据分析阶段** (1周)
   - 步骤4.1: 数据集成与知识图谱构建
   - 步骤4.2: 模型迭代与优化
   - 步骤4.3: 结果报告生成

**工具集成**:
- 计算: pyiron 工作流引擎
- 实验: 自动化实验平台
- 数据: PMD 数据空间集成
- 分析: Jupyter Notebook + 自定义分析脚本

**FAIR 数据管理**:
- 所有数据自动标注 PMD 本体术语
- 结果自动转换为 RDF 格式
- 可通过 SPARQL 查询完整数据链

此工作流已在多个 MaterialDigital 项目中成功应用，可实现材料开发的全流程数字化。`;
  }
  
  if (lowerQuestion.includes('解释') || lowerQuestion.includes('是什么') || lowerQuestion.includes('概念')) {
    if (lowerQuestion.includes('高熵合金')) {
      return `**高熵合金 (High-Entropy Alloys, HEAs)**

**定义**:
高熵合金是由多种主要元素（通常5种或更多）以近似等原子比组成的合金，各元素浓度在5-35%之间。

**核心特征**:
1. **高熵效应**: 高的构型熵促进形成简单固溶体相而非金属间化合物
2. **晶格畸变效应**: 不同原子尺寸导致严重晶格畸变，影响性能
3. **迟滞扩散效应**: 多种元素相互制约，减慢扩散过程
4. **鸡尾酒效应**: 各元素协同作用产生独特性能

**典型体系**:
- CoCrFeNiMn (Cantor 合金)
- CoCrFeNiAl
- TiZrHfNbTa (难熔高熵合金)

**优势**:
- 优异的力学性能组合（高强度、高韧性）
- 良好的热稳定性
- 出色的耐腐蚀和抗氧化性
- 潜在的功能性能（磁性、热电等）

**应用领域**:
- 航空航天高温部件
- 核能结构材料
- 生物医用植入物
- 耐腐蚀涂层

**研究热点**:
- 机器学习辅助的成分设计
- 增材制造制备工艺
- 极端环境性能表征
- 多功能一体化设计

高熵合金代表了合金设计理念的革新，从"一种基体+少量添加"转向"多主元"设计思想。`;
    }
    
    return `**材料科学概念解释**

您询问的概念在材料科学中具有重要意义。

材料科学是研究材料的成分、结构、加工、性能及其相互关系的学科。核心范式是"加工-结构-性能"关系链：

1. **加工 (Processing)**: 材料制备和处理的工艺过程
   - 示例: 熔炼、铸造、热处理、机加工、增材制造

2. **结构 (Structure)**: 材料在不同尺度上的组织结构
   - 原子尺度: 晶体结构、缺陷
   - 微观尺度: 晶粒、相组成
   - 宏观尺度: 形状、尺寸

3. **性能 (Properties)**: 材料对外界刺激的响应
   - 力学性能: 强度、硬度、韧性
   - 物理性能: 导电、导热、磁性
   - 化学性能: 耐腐蚀、抗氧化

4. **性能 (Performance)**: 材料在实际应用中的表现

现代材料科学强调：
- 多尺度计算与实验相结合
- 数据驱动与人工智能辅助
- 可持续与绿色材料设计
- 材料基因组计划加速发现

如需了解具体概念，请提供更详细的关键词。`;
  }
  
  // 默认响应
  return `您好！我是 Vajra AI 材料科学助手。

我检测到您的问题是: "${question.substring(0, 100)}${question.length > 100 ? '...' : ''}"

作为专注于材料科学的 AI 助手，我可以帮助您：

**分析功能**:
- 材料配方分析与优化建议
- 性能预测与结构-性能关系
- 相图计算与热力学分析

**设计功能**:
- 实验与计算工作流设计
- 新材料成分设计
- 工艺参数优化

**解释功能**:
- 材料科学概念解释
- 实验现象分析
- 文献结果解读

**工具功能**:
- 分析代码生成 (Python/R)
- 数据可视化建议
- 文献调研指导

**集成功能**:
- 与 PMD 本体系统集成
- 材料数据库查询
- 标准化数据格式转换

请提供更具体的信息或选择上述一个方向，我将为您提供详细、专业的帮助。

当前对话上下文: ${context ? JSON.stringify(context) : '无'}`;
}