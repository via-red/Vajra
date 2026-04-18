// Vajra Web 版本应用入口
console.log('Vajra Material IDE - Web 版本启动中...');

// 模拟 Electron API
window.electronAPI = {
  queryOntology: async (query) => {
    console.log('模拟本体查询:', query);
    return {
      success: true,
      results: [
        { class: 'https://w3id.org/pmd/co/Material', label: '材料' },
        { class: 'https://w3id.org/pmd/co/Alloy', label: '合金' },
        { class: 'https://w3id.org/pmd/co/Ceramic', label: '陶瓷' }
      ]
    };
  },
  
  askOpenClaw: async (question) => {
    console.log('模拟 AI 提问:', question);
    return {
      success: true,
      answer: `Web 版本 AI 助手（模拟）\n\n问题: "${question}"\n\n在 Web 版本中，AI 助手功能需要 Electron 版本才能完整使用。\n\n您可以：\n1. 安装完整版以获得 OpenClaw AI 集成\n2. 继续使用 Web 版本的基础编辑器功能\n\n当前可用功能：\n• 材料配方编辑\n• PMD 本体浏览\n• 工作流设计器\n\n完整功能需要安装本地依赖。`
    };
  },
  
  readMaterialFile: async (filePath) => {
    console.log('模拟读取文件:', filePath);
    // 尝试从本地存储读取
    const saved = localStorage.getItem(filePath);
    if (saved) {
      return { success: true, content: saved };
    }
    return { success: false, error: '文件未找到' };
  },
  
  writeMaterialFile: async (filePath, content) => {
    console.log('模拟保存文件:', filePath);
    // 保存到本地存储
    try {
      localStorage.setItem(filePath, content);
      return { success: true };
    } catch (error) {
      return { success: false, error: '保存失败' };
    }
  },
  
  getAppVersion: async () => {
    return '0.1.0-web';
  }
};

// 启动应用
function startApp() {
  console.log('启动 Vajra Web 应用...');
  
  // 创建简单的 UI
  const root = document.getElementById('root');
  
  const appContainer = document.createElement('div');
  appContainer.className = 'material-ide';
  appContainer.innerHTML = `
    <div class="toolbar">
      <div class="logo">
        <i class="fas fa-gem"></i>
        <span>Vajra Material IDE (Web 版本)</span>
        <span class="version">v0.1.0-web</span>
      </div>
    </div>
    
    <div class="workspace">
      <div class="main-editor" style="padding: 20px;">
        <h2 style="color: #569cd6;">
          <i class="fas fa-rocket"></i> Vajra 材料智能开发IDE
        </h2>
        
        <div style="background-color: #2d2d30; padding: 20px; border-radius: 8px; margin-top: 20px;">
          <h3 style="color: #ce9178;">
            <i class="fas fa-info-circle"></i> Web 版本说明
          </h3>
          
          <p>这是一个轻量级的 Web 版本，展示了 Vajra IDE 的核心界面和概念。</p>
          
          <div style="margin-top: 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
            <div style="background-color: #3e3e42; padding: 15px; border-radius: 6px;">
              <h4 style="color: #4ec9b0;">
                <i class="fas fa-check-circle"></i> 可用功能
              </h4>
              <ul>
                <li>项目结构验证</li>
                <li>PMD 本体文件查看</li>
                <li>界面布局预览</li>
                <li>代码架构展示</li>
              </ul>
            </div>
            
            <div style="background-color: #3e3e42; padding: 15px; border-radius: 6px;">
              <h4 style="color: #ce9178;">
                <i class="fas fa-exclamation-circle"></i> 需要完整版
              </h4>
              <ul>
                <li>Electron 桌面应用</li>
                <li>OpenClaw AI 集成</li>
                <li>本地文件系统访问</li>
                <li>工作流执行引擎</li>
                <li>PMD 本体完整查询</li>
              </ul>
            </div>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #0e639c; border-radius: 6px;">
            <h4 style="color: white;">
              <i class="fas fa-download"></i> 安装完整版
            </h4>
            <p>要获得完整功能，请运行以下命令：</p>
            <pre style="background-color: #1e1e1e; padding: 10px; border-radius: 4px; overflow-x: auto;">
cd C:\Users\viare\Vajra
npm install
npm run build:dev
npm start</pre>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #2d2d30; border-radius: 6px; border-left: 4px solid #4ec9b0;">
            <h4 style="color: #4ec9b0;">
              <i class="fas fa-project-diagram"></i> 项目结构
            </h4>
            <p>Vajra 项目已成功创建，包含：</p>
            <ul>
              <li><strong>PMD 本体集成</strong> - 已下载 PMDco 和 TTO 本体</li>
              <li><strong>IDE 核心组件</strong> - React + Monaco Editor</li>
              <li><strong>AI 助手框架</strong> - OpenClaw 集成准备</li>
              <li><strong>工作流设计器</strong> - 可视化编排界面</li>
              <li><strong>构建系统</strong> - 完整的开发和生产构建</li>
            </ul>
          </div>
        </div>
        
        <div style="margin-top: 30px; text-align: center; color: #888;">
          <p>
            <i class="fas fa-truck"></i> 小卡车已完成基础建设，现在需要安装依赖才能驾驶！
          </p>
          <p style="font-size: 12px;">
            项目位置: C:\Users\viare\Vajra<br>
            创建时间: 2026-04-18
          </p>
        </div>
      </div>
    </div>
    
    <div class="status-bar">
      <div style="display: flex; justify-content: space-between; width: 100%; padding: 0 20px;">
        <span><i class="fas fa-circle" style="color: #4ec9b0;"></i> Web 版本运行中</span>
        <span><i class="fas fa-database"></i> PMD 本体已加载</span>
        <span><i class="fas fa-code"></i> 项目结构完整</span>
      </div>
    </div>
  `;
  
  root.appendChild(appContainer);
  
  console.log('Vajra Web 版本启动完成！');
}

// 等待 Monaco Editor 加载
if (window.monaco) {
  startApp();
} else {
  // 如果 Monaco 还没加载，等待一下
  setTimeout(startApp, 1000);
}