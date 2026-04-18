#!/usr/bin/env node

/**
 * 仅安装 Web 版本所需依赖（跳过 Electron）
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🌐 安装 Vajra Web 版本所需依赖...');
console.log('📝 跳过 Electron（避免安装问题）');

// 备份原始 package.json
const originalPackage = path.join(__dirname, 'package.json');
const backupPackage = path.join(__dirname, 'package.json.backup.web');

if (fs.existsSync(originalPackage)) {
  fs.copyFileSync(originalPackage, backupPackage);
  console.log('📦 备份原始 package.json');
}

// 读取原始配置
const originalConfig = JSON.parse(fs.readFileSync(originalPackage, 'utf8'));

// 创建仅 Web 版本的配置
const webConfig = {
  ...originalConfig,
  scripts: {
    ...originalConfig.scripts,
    "start": "npm run build:web && npx http-server dist-web -p 3000 -o",
    "build:web": "node scripts/build-web.js",
    "dev:web": "node scripts/build-web.js && npx http-server dist-web -p 3000 -o"
  },
  // 移除 Electron 相关依赖
  devDependencies: Object.fromEntries(
    Object.entries(originalConfig.devDependencies).filter(([key]) => 
      !['electron', 'electron-builder', 'chokidar'].includes(key)
    )
  )
};

// 写入临时配置
fs.writeFileSync(originalPackage, JSON.stringify(webConfig, null, 2));
console.log('📝 创建 Web 版本配置（跳过 Electron）');

// 安装依赖
console.log('\n📦 安装依赖（使用淘宝镜像）...');
const env = {
  ...process.env,
  ELECTRON_SKIP_BINARY_DOWNLOAD: '1',
  NPM_CONFIG_REGISTRY: 'https://registry.npmmirror.com/'
};

const installProcess = spawn('npm', ['install', '--no-optional', '--legacy-peer-deps'], {
  stdio: 'inherit',
  shell: true,
  env
});

installProcess.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ 依赖安装成功！');
    
    // 编译 TypeScript
    console.log('\n🔧 编译 TypeScript...');
    const tscProcess = spawn('npx', ['tsc'], {
      stdio: 'inherit',
      shell: true
    });
    
    tscProcess.on('close', (tscCode) => {
      if (tscCode === 0) {
        console.log('\n✅ TypeScript 编译成功！');
      } else {
        console.log(`\n⚠️  TypeScript 编译失败 (代码: ${tscCode})，继续...`);
      }
      
      // 构建 Web 版本
      console.log('\n🌐 构建 Web 版本...');
      const buildProcess = spawn('node', ['scripts/build-web.js'], {
        stdio: 'inherit',
        shell: true
      });
      
      buildProcess.on('close', (buildCode) => {
        // 恢复原始配置
        if (fs.existsSync(backupPackage)) {
          fs.copyFileSync(backupPackage, originalPackage);
          console.log('\n📦 已恢复原始 package.json');
        }
        
        if (buildCode === 0) {
          console.log('\n✨ Web 版本构建完成！');
          console.log('\n🎉 运行以下命令启动：');
          console.log('  npm start');
          console.log('\n🌐 然后在浏览器中打开：http://localhost:3000');
        } else {
          console.log(`\n⚠️  Web 版本构建失败 (代码: ${buildCode})`);
        }
        
        console.log('\n📋 项目状态：');
        verifyInstallation();
      });
    });
    
  } else {
    console.log(`\n❌ 依赖安装失败 (代码: ${code})`);
    
    // 恢复原始配置
    if (fs.existsSync(backupPackage)) {
      fs.copyFileSync(backupPackage, originalPackage);
      console.log('📦 已恢复原始 package.json');
    }
    
    console.log('\n💡 建议：');
    console.log('1. 检查网络连接');
    console.log('2. 手动运行: npm install --registry=https://registry.npmmirror.com');
    console.log('3. 或仅构建 Web 版本: node scripts/build-web.js');
  }
});

function verifyInstallation() {
  console.log('\n🔍 验证安装结果...');
  
  const checkItems = [
    'node_modules/react',
    'node_modules/monaco-editor',
    'node_modules/n3',
    'node_modules/typescript',
    'dist-web/index.html',
    'dist-web/app.js',
    'ontologies/pmdco-minimal.ttl'
  ];
  
  let passed = 0;
  checkItems.forEach(item => {
    const fullPath = path.join(__dirname, item);
    if (fs.existsSync(fullPath)) {
      passed++;
      console.log(`✅ ${item}`);
    } else {
      console.log(`⚠️  ${item} 缺失`);
    }
  });
  
  console.log(`\n📊 检查结果: ${passed}/${checkItems.length} 通过`);
  
  if (passed >= 5) {
    console.log('\n✨ 项目基础就绪！');
    console.log('\n下一步：');
    console.log('  1. 运行: npm start (启动 Web 服务器)');
    console.log('  2. 在浏览器中打开: http://localhost:3000');
    console.log('  3. 查看 Vajra IDE 的 Web 演示版本');
  } else {
    console.log('\n⚠️  项目不完整，需要进一步安装');
  }
}