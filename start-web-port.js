#!/usr/bin/env node

/**
 * 启动 Vajra Web 版本服务器（使用端口 3001）
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 启动 Vajra Web 版本 (端口 3001)...');

// 检查 dist-web 是否存在
const webDist = path.join(__dirname, 'dist-web');
if (!fs.existsSync(webDist)) {
  console.log('❌ dist-web 目录不存在，先构建 Web 版本...');
  
  const buildProcess = spawn('node', ['scripts/build-web.js'], {
    stdio: 'inherit',
    shell: true
  });
  
  buildProcess.on('close', (code) => {
    if (code === 0) {
      startServer();
    } else {
      console.log('❌ Web 版本构建失败');
    }
  });
} else {
  startServer();
}

function startServer() {
  console.log('🌐 启动 HTTP 服务器...');
  console.log('📂 服务目录:', webDist);
  console.log('🔗 请手动打开: http://localhost:3001');
  console.log('\n🛑 按 Ctrl+C 停止服务器\n');
  
  // 启动 http-server，不自动打开浏览器
  const serverProcess = spawn('npx', ['http-server', webDist, '-p', '3001'], {
    stdio: 'inherit',
    shell: true
  });
  
  serverProcess.on('close', (code) => {
    console.log(`\n服务器已停止 (代码: ${code})`);
  });
  
  // 处理退出
  process.on('SIGINT', () => {
    console.log('\n👋 正在关闭服务器...');
    serverProcess.kill();
    process.exit(0);
  });
}