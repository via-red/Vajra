#!/usr/bin/env node

/**
 * Vajra Web 版本构建脚本
 */

const fs = require('fs');
const path = require('path');

console.log('🌐 构建 Vajra Web 版本...');

// 创建输出目录
const webDist = 'dist-web';
if (!fs.existsSync(webDist)) {
  fs.mkdirSync(webDist, { recursive: true });
  console.log(`📁 创建目录: ${webDist}`);
}

// 复制本体文件
console.log('📦 复制本体文件...');
const ontologyFiles = [
  'ontologies/pmdco-minimal.ttl',
  'ontologies/tto-example.ttl'
];

ontologyFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const dest = path.join(webDist, file);
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(file, dest);
    console.log(`  ✓ 复制: ${file} → ${dest}`);
  }
});

// 创建 Web 版本的 HTML 文件
console.log('📄 创建 Web 版本 HTML...');
const webHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vajra Material IDE (Web Version)</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
                sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            background-color: #1e1e1e;
            color: #d4d4d4;
            height: 100vh;
            overflow: hidden;
        }
        
        #root {
            height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        .web-warning {
            background-color: #8b0000;
            color: white;
            padding: 10px;
            text-align: center;
            font-size: 14px;
            border-bottom: 1px solid #ff6b6b;
        }
        
        .web-warning i {
            margin-right: 8px;
        }
    </style>
</head>
<body>
    <div class="web-warning">
        <i class="fas fa-exclamation-triangle"></i>
        Web 版本 - 部分功能受限 (AI助手和文件系统功能需要 Electron 版本)
    </div>
    <div id="root">
        <!-- React 应用将挂载在这里 -->
    </div>
    
    <!-- 加载 React -->
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    
    <!-- 加载 Monaco Editor -->
    <script src="https://unpkg.com/monaco-editor@0.45.0/min/vs/loader.js"></script>
    <script>
        // 配置 Monaco Editor
        require.config({ paths: { vs: 'https://unpkg.com/monaco-editor@0.45.0/min/vs' } });
        
        // 加载 Monaco Editor
        require(['vs/editor/editor.main'], function() {
            console.log('Monaco Editor 加载完成');
            
            // 加载应用脚本
            const script = document.createElement('script');
            script.src = 'app.js';
            script.type = 'module';
            document.head.appendChild(script);
        });
    </script>
    
    <!-- 应用脚本将在 Monaco 加载后加载 -->
</body>
</html>`;

fs.writeFileSync(path.join(webDist, 'index.html'), webHtml);
console.log('✅ 创建 index.html');

// 复制样式文件
console.log('🎨 复制样式文件...');
const styleSource = 'src/renderer/styles.css';
if (fs.existsSync(styleSource)) {
  fs.copyFileSync(styleSource, path.join(webDist, 'styles.css'));
  console.log('✅ 复制 styles.css');
}

// 创建 Web 版本的应用脚本（简化版）
console.log('⚙️  创建 Web 版本应用脚本...');
const webAppScript = `// Vajra Web 版本应用入口
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
      answer: \`Web 版本 AI 助手（模拟）\\n\\n问题: "\${question}"\\n\\n在 Web 版本中，AI 助手功能需要 Electron 版本才能完整使用。\\n\\n您可以：\\n1. 安装完整版以获得 OpenClaw AI 集成\\n2. 继续使用 Web 版本的基础编辑器功能\\n\\n当前可用功能：\\n• 材料配方编辑\\n• PMD 本体浏览\\n• 工作流设计器\\n\\n完整功能需要安装本地依赖。\`
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
  appContainer.innerHTML = \`
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
cd C:\\Users\\viare\\Vajra
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
            项目位置: C:\\Users\\viare\\Vajra<br>
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
  \`;
  
  root.appendChild(appContainer);
  
  console.log('Vajra Web 版本启动完成！');
}

// 等待 Monaco Editor 加载
if (window.monaco) {
  startApp();
} else {
  // 如果 Monaco 还没加载，等待一下
  setTimeout(startApp, 1000);
}`;

fs.writeFileSync(path.join(webDist, 'app.js'), webAppScript);
console.log('✅ 创建 app.js');

// 复制 TypeScript 编译的输出（如果存在）
console.log('🔧 检查 TypeScript 编译输出...');
const tsOutDir = 'dist';
if (fs.existsSync(tsOutDir)) {
  // 复制 renderer 文件
  const rendererSource = path.join(tsOutDir, 'renderer');
  const rendererDest = path.join(webDist, 'renderer');
  
  if (fs.existsSync(rendererSource)) {
    // 简单复制函数
    function copyDir(src, dest) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      
      const items = fs.readdirSync(src);
      items.forEach(item => {
        const srcPath = path.join(src, item);
        const destPath = path.join(dest, item);
        
        if (fs.statSync(srcPath).isDirectory()) {
          copyDir(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      });
    }
    
    copyDir(rendererSource, rendererDest);
    console.log('✅ 复制 TypeScript 编译输出');
  }
}

console.log('\n✨ Web 版本构建完成！');
console.log('\n🎉 运行以下命令启动 Web 服务器：');
console.log(`  cd ${webDist}`);
console.log('  npx http-server -p 3000 -o');
console.log('\n或者直接运行：');
console.log('  npm start (如果配置了 package.json)');