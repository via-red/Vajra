#!/usr/bin/env node

/**
 * 最小化安装脚本 - 解决依赖安装问题
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚚 开始最小化安装 Vajra Material IDE...');

// 尝试清理 node_modules
try {
  if (fs.existsSync('node_modules')) {
    console.log('🧹 清理旧的 node_modules...');
    
    // 在 Windows 上，可能需要多次尝试
    try {
      // 先尝试删除整个目录
      fs.rmSync('node_modules', { recursive: true, force: true, maxRetries: 3 });
      console.log('✅ node_modules 清理成功');
    } catch (err) {
      console.log('⚠️  无法完全清理 node_modules，尝试跳过...');
      // 创建备份目录
      if (fs.existsSync('node_modules_backup')) {
        fs.rmSync('node_modules_backup', { recursive: true, force: true });
      }
      fs.renameSync('node_modules', 'node_modules_backup');
      console.log('✅ 已将旧 node_modules 移动到备份');
    }
  }
} catch (err) {
  console.log('⚠️  清理过程中出错:', err.message);
}

// 创建最小化的 package.json 用于测试
const minimalPackage = {
  name: 'vajra-material-ide',
  version: '0.1.0',
  main: 'src/main.js',
  scripts: {
    start: 'electron .',
    dev: 'node scripts/build.js && electron dist --dev',
    build: 'node scripts/build.js'
  },
  dependencies: {
    "monaco-editor": "^0.45.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "n3": "^1.16.0"
  },
  devDependencies: {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "electron": "^29.0.0"
  }
};

// 保存最小化配置
const backupPackagePath = 'package.json.backup';
if (!fs.existsSync(backupPackagePath)) {
  fs.copyFileSync('package.json', backupPackagePath);
  console.log('📦 备份原始 package.json');
}

// 写入最小化配置
fs.writeFileSync('package.json.minimal', JSON.stringify(minimalPackage, null, 2));
console.log('📝 创建最小化 package.json 配置');

console.log('\n🔧 安装选项:');
console.log('1. 使用 npm 安装 (默认)');
console.log('2. 使用 yarn 安装');
console.log('3. 使用 cnpm (淘宝镜像)');
console.log('4. 跳过安装，仅验证项目结构');

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('请选择安装方式 (1-4): ', (choice) => {
  rl.close();
  
  const installMethods = {
    '1': 'npm',
    '2': 'yarn', 
    '3': 'cnpm',
    '4': 'skip'
  };
  
  const method = installMethods[choice] || 'npm';
  
  if (method === 'skip') {
    console.log('⏭️  跳过安装，验证项目结构...');
    verifyProjectStructure();
    return;
  }
  
  console.log(`🔨 使用 ${method} 安装依赖...`);
  
  try {
    // 恢复原始 package.json
    fs.copyFileSync(backupPackagePath, 'package.json');
    
    // 安装依赖
    let installCmd;
    if (method === 'npm') {
      installCmd = 'npm install --registry=https://registry.npmmirror.com';
    } else if (method === 'yarn') {
      installCmd = 'yarn install';
    } else if (method === 'cnpm') {
      installCmd = 'cnpm install';
    }
    
    console.log(`📦 执行: ${installCmd}`);
    
    // 先安装核心依赖（跳过可选依赖）
    const coreDeps = [
      'typescript',
      '@types/node',
      '@types/react',
      '@types/react-dom',
      'react',
      'react-dom'
    ];
    
    console.log('📦 先安装核心依赖...');
    execSync(`${method} install ${coreDeps.join(' ')} --no-optional`, { stdio: 'inherit' });
    
    console.log('📦 安装 Monaco Editor...');
    execSync(`${method} install monaco-editor@0.45.0 --no-optional`, { stdio: 'inherit' });
    
    console.log('📦 安装 RDF 库...');
    execSync(`${method} install n3@1.16.0 --no-optional`, { stdio: 'inherit' });
    
    console.log('📦 安装 Electron (可能需要较长时间)...');
    execSync(`${method} install electron@29.0.0 --no-optional`, { stdio: 'inherit' });
    
    console.log('📦 安装其他开发依赖...');
    const otherDeps = [
      '@typescript-eslint/eslint-plugin',
      '@typescript-eslint/parser',
      'chokidar',
      'electron-builder',
      'eslint',
      'jest',
      'prettier',
      'rdflib',
      'sparqljs'
    ];
    
    execSync(`${method} install ${otherDeps.join(' ')} --no-optional`, { stdio: 'inherit' });
    
    console.log('✅ 依赖安装完成！');
    verifyProjectStructure();
    
  } catch (error) {
    console.error('❌ 安装过程中出错:', error.message);
    console.log('\n💡 建议:');
    console.log('1. 检查网络连接');
    console.log('2. 尝试使用管理员权限运行');
    console.log('3. 或手动运行: npm install --registry=https://registry.npmmirror.com');
    
    // 恢复备份
    if (fs.existsSync(backupPackagePath)) {
      fs.copyFileSync(backupPackagePath, 'package.json');
    }
  }
});

function verifyProjectStructure() {
  console.log('\n🔍 验证项目结构...');
  
  const requiredFiles = [
    'package.json',
    'tsconfig.json', 
    'src/main/main.ts',
    'src/renderer/app.tsx',
    'src/renderer/styles.css',
    'ontologies/pmdco-minimal.ttl'
  ];
  
  let allExist = true;
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} 缺失`);
      allExist = false;
    }
  });
  
  if (allExist) {
    console.log('\n✨ 项目结构验证通过！');
    console.log('\n下一步:');
    console.log('1. 编译 TypeScript: npx tsc');
    console.log('2. 构建项目: npm run build');
    console.log('3. 启动应用: npm start');
  } else {
    console.log('\n⚠️  项目结构不完整，请检查缺失文件');
  }
}