#!/usr/bin/env node

/**
 * Vajra Material IDE 开发服务器
 */

const { spawn } = require('child_process');
const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');

console.log('🚚 启动 Vajra Material IDE 开发服务器...');

let electronProcess = null;

// 启动 Electron 进程
function startElectron() {
  if (electronProcess) {
    console.log('🔄 重启 Electron...');
    electronProcess.kill();
  }
  
  electronProcess = spawn('electron', ['.', '--dev'], {
    stdio: 'inherit',
    shell: true
  });
  
  electronProcess.on('close', (code) => {
    if (code !== 0) {
      console.log(`❌ Electron 进程退出，代码 ${code}`);
    }
  });
}

// 监视文件变化
const watcher = chokidar.watch([
  'src/**/*.ts',
  'src/**/*.tsx',
  'src/**/*.js',
  'src/**/*.css',
  'src/**/*.html'
], {
  ignored: /(^|[\/\\])\../, // 忽略隐藏文件
  persistent: true,
  ignoreInitial: true
});

watcher
  .on('add', path => {
    console.log(`📄 文件添加: ${path}`);
    rebuild();
  })
  .on('change', path => {
    console.log(`📄 文件修改: ${path}`);
    rebuild();
  })
  .on('unlink', path => {
    console.log(`📄 文件删除: ${path}`);
    rebuild();
  });

// 构建函数
function rebuild() {
  console.log('🔨 重新构建...');
  
  // 运行构建脚本
  const buildProcess = spawn('node', ['scripts/build.js'], {
    stdio: 'inherit',
    shell: true
  });
  
  buildProcess.on('close', (code) => {
    if (code === 0) {
      console.log('✅ 构建成功');
      startElectron();
    } else {
      console.log(`❌ 构建失败，代码 ${code}`);
    }
  });
}

// 初始构建和启动
console.log('🔨 执行初始构建...');
const initialBuild = spawn('node', ['scripts/build.js'], {
  stdio: 'inherit',
  shell: true
});

initialBuild.on('close', (code) => {
  if (code === 0) {
    console.log('✅ 初始构建成功');
    startElectron();
  } else {
    console.log(`❌ 初始构建失败，代码 ${code}`);
    process.exit(1);
  }
});

// 处理退出
process.on('SIGINT', () => {
  console.log('\n👋 正在关闭开发服务器...');
  if (electronProcess) {
    electronProcess.kill();
  }
  watcher.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 收到终止信号，正在关闭...');
  if (electronProcess) {
    electronProcess.kill();
  }
  watcher.close();
  process.exit(0);
});

console.log('👀 正在监视文件变化...');
console.log('📝 按 Ctrl+C 退出');