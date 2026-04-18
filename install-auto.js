#!/usr/bin/env node

/**
 * 自动安装脚本 - 无交互，自动执行
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🤖 自动安装 Vajra Material IDE...');

// 设置环境变量以避免网络问题
process.env.ELECTRON_GET_USE_PROXY = '1';
process.env.NPM_CONFIG_REGISTRY = 'https://registry.npmmirror.com/';
process.env.ELECTRON_MIRROR = 'https://npmmirror.com/mirrors/electron/';
process.env.ELECTRON_CUSTOM_DIR = '29.0.0';

// 创建优化后的 .npmrc
const npmrcContent = `registry=https://registry.npmmirror.com/
electron_mirror=https://npmmirror.com/mirrors/electron/
electron_custom_dir=29.0.0
strict-ssl=false
`;

fs.writeFileSync(path.join(__dirname, '.npmrc'), npmrcContent);
console.log('✅ 创建 .npmrc 配置');

// 备份原始 package.json
const originalPackage = path.join(__dirname, 'package.json');
const backupPackage = path.join(__dirname, 'package.json.backup');

if (fs.existsSync(originalPackage)) {
  fs.copyFileSync(originalPackage, backupPackage);
  console.log('📦 备份原始 package.json');
}

// 步骤1：安装 TypeScript 和核心依赖（不包含 Electron）
console.log('\n🔧 步骤 1/3: 安装 TypeScript 和核心依赖...');

const step1 = spawn('npm', [
  'install',
  'typescript@^5.0.0',
  '@types/node@^20.0.0',
  '@types/react@^18.2.0', 
  '@types/react-dom@^18.2.0',
  'react@^18.2.0',
  'react-dom@^18.2.0',
  '--no-optional',
  '--legacy-peer-deps',
  '--verbose'
], {
  stdio: 'inherit',
  shell: true
});

step1.on('close', (code1) => {
  if (code1 !== 0) {
    console.log(`⚠️  步骤1部分失败，继续下一步 (代码: ${code1})`);
  }
  
  // 步骤2：安装 Monaco Editor 和 RDF 库
  console.log('\n🔧 步骤 2/3: 安装 Monaco Editor 和 RDF 库...');
  
  const step2 = spawn('npm', [
    'install',
    'monaco-editor@^0.45.0',
    'n3@^1.16.0',
    '--no-optional',
    '--legacy-peer-deps'
  ], {
    stdio: 'inherit',
    shell: true
  });
  
  step2.on('close', (code2) => {
    if (code2 !== 0) {
      console.log(`⚠️  步骤2部分失败，继续下一步 (代码: ${code2})`);
    }
    
    // 步骤3：尝试安装 Electron（可能失败）
    console.log('\n🔧 步骤 3/3: 尝试安装 Electron（如果失败可跳过）...');
    
    const step3 = spawn('npm', [
      'install',
      'electron@^29.0.0',
      '--no-optional',
      '--legacy-peer-deps'
    ], {
      stdio: 'inherit',
      shell: true
    });
    
    step3.on('close', (code3) => {
      if (code3 !== 0) {
        console.log(`⚠️  Electron 安装失败 (代码: ${code3})`);
        console.log('💡 提示: 可以稍后单独安装 Electron');
        
        // 尝试替代方案：使用预构建版本
        console.log('\n💡 替代方案: 下载预构建的 Electron');
        console.log('   1. 访问: https://npmmirror.com/mirrors/electron/');
        console.log('   2. 下载 electron-v29.0.0-win32-x64.zip');
        console.log('   3. 解压到 node_modules/electron/dist/');
      } else {
        console.log('✅ Electron 安装成功！');
      }
      
      // 安装其他开发依赖
      console.log('\n🔧 安装其他开发依赖...');
      
      const step4 = spawn('npm', [
        'install',
        '@typescript-eslint/eslint-plugin@^6.0.0',
        '@typescript-eslint/parser@^6.0.0',
        'chokidar@^3.5.3',
        'rdflib@^2.2.0',
        'sparqljs@^3.6.0',
        '--no-optional',
        '--legacy-peer-deps'
      ], {
        stdio: 'inherit',
        shell: true
      });
      
      step4.on('close', (code4) => {
        console.log('\n✨ 安装过程完成！');
        
        // 验证安装
        verifyInstallation();
      });
    });
  });
});

function verifyInstallation() {
  console.log('\n🔍 验证安装结果...');
  
  const checkDirs = [
    'node_modules/typescript',
    'node_modules/react',
    'node_modules/monaco-editor',
    'node_modules/n3'
  ];
  
  const checkFiles = [
    'package.json',
    'tsconfig.json',
    'src/main/main.ts',
    'src/renderer/app.tsx'
  ];
  
  let dirsExist = 0;
  checkDirs.forEach(dir => {
    if (fs.existsSync(path.join(__dirname, dir))) {
      dirsExist++;
      console.log(`✅ ${dir}`);
    } else {
      console.log(`⚠️  ${dir} 缺失`);
    }
  });
  
  console.log(`\n📦 依赖目录: ${dirsExist}/${checkDirs.length} 存在`);
  
  // 检查 Electron
  const electronExists = fs.existsSync(path.join(__dirname, 'node_modules/electron'));
  console.log(`⚡ Electron: ${electronExists ? '✅ 已安装' : '⚠️  未安装（可以稍后安装）'}`);
  
  console.log('\n🎉 安装验证完成！');
  console.log('\n下一步命令:');
  console.log('  npx tsc           - 编译 TypeScript');
  console.log('  npm run build:dev - 构建开发版本');
  
  if (!electronExists) {
    console.log('\n💡 如果需要 Electron，运行:');
    console.log('  npm install electron@^29.0.0 --no-optional');
  }
  
  // 恢复原始 package.json
  if (fs.existsSync(backupPackage)) {
    fs.copyFileSync(backupPackage, originalPackage);
    console.log('\n📦 已恢复原始 package.json');
  }
}

// 错误处理
process.on('uncaughtException', (error) => {
  console.error('❌ 未捕获异常:', error.message);
  // 恢复原始 package.json
  if (fs.existsSync(backupPackage)) {
    fs.copyFileSync(backupPackage, originalPackage);
    console.log('📦 已恢复原始 package.json');
  }
});