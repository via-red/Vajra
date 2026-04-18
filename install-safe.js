#!/usr/bin/env node

/**
 * 安全安装脚本 - 避免权限和网络问题
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🛡️  安全安装 Vajra Material IDE...');

// 创建临时目录用于分步安装
const tempDir = path.join(__dirname, 'temp-install');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// 备份原始 package.json
const originalPackage = path.join(__dirname, 'package.json');
const backupPackage = path.join(tempDir, 'package.json.backup');

if (fs.existsSync(originalPackage)) {
  fs.copyFileSync(originalPackage, backupPackage);
  console.log('📦 备份原始 package.json');
}

// 创建最小化 package.json（没有 Electron）
const minimalPackage = {
  name: 'vajra-material-ide',
  version: '0.1.0',
  description: 'Material Science Intelligent IDE based on PMD standards',
  main: 'src/main.js',
  scripts: {
    "build:ts": "tsc",
    "build:web": "node scripts/build-web.js",
    "start:web": "http-server dist -p 3000"
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
    "typescript": "^5.0.0"
  }
};

// 写入最小化配置
fs.writeFileSync(
  path.join(tempDir, 'package-minimal.json'),
  JSON.stringify(minimalPackage, null, 2)
);

console.log('📝 创建最小化 package.json（跳过 Electron）');

// 选项菜单
console.log('\n🎯 安装选项：');
console.log('1. 安装最小版本（无 Electron，仅 Web 版本）');
console.log('2. 分步安装完整版本（推荐）');
console.log('3. 跳过安装，仅验证项目结构');
console.log('4. 创建开发环境配置');

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('请选择 (1-4): ', (choice) => {
  rl.close();
  
  switch(choice) {
    case '1':
      installMinimalVersion();
      break;
    case '2':
      installStepByStep();
      break;
    case '3':
      verifyProjectStructure();
      break;
    case '4':
      createDevConfig();
      break;
    default:
      console.log('使用默认选项：分步安装');
      installStepByStep();
  }
});

function installMinimalVersion() {
  console.log('\n🔧 安装最小版本（无 Electron）...');
  
  // 恢复最小化配置
  fs.writeFileSync(originalPackage, JSON.stringify(minimalPackage, null, 2));
  
  runCommand('npm', ['install', '--no-optional', '--legacy-peer-deps'], '安装核心依赖')
    .then(() => {
      console.log('✅ 最小版本安装完成！');
      console.log('\n🎉 可以运行以下命令：');
      console.log('  npm run build:ts   - 编译 TypeScript');
      console.log('  npm run build:web  - 构建 Web 版本');
      console.log('  npm run start:web  - 启动 Web 服务器');
      
      // 恢复原始配置
      fs.copyFileSync(backupPackage, originalPackage);
      console.log('\n📦 已恢复原始 package.json');
    })
    .catch(error => {
      console.error('❌ 安装失败:', error.message);
      // 恢复原始配置
      if (fs.existsSync(backupPackage)) {
        fs.copyFileSync(backupPackage, originalPackage);
      }
    });
}

function installStepByStep() {
  console.log('\n🔧 分步安装完整版本...');
  
  const steps = [
    { name: 'TypeScript 和类型定义', cmd: 'npm', args: ['install', 'typescript@^5.0.0', '@types/node@^20.0.0', '--no-optional'] },
    { name: 'React 核心', cmd: 'npm', args: ['install', '@types/react@^18.2.0', '@types/react-dom@^18.2.0', 'react@^18.2.0', 'react-dom@^18.2.0', '--no-optional'] },
    { name: 'Monaco Editor', cmd: 'npm', args: ['install', 'monaco-editor@^0.45.0', '--no-optional'] },
    { name: 'RDF 库', cmd: 'npm', args: ['install', 'n3@^1.16.0', 'rdflib@^2.2.0', 'sparqljs@^3.6.0', '--no-optional'] },
    { name: '开发工具', cmd: 'npm', args: ['install', '@typescript-eslint/eslint-plugin@^6.0.0', '@typescript-eslint/parser@^6.0.0', 'chokidar@^3.5.3', '--no-optional'] },
    { name: 'Electron (最后安装)', cmd: 'npm', args: ['install', 'electron@^29.0.0', '--no-optional', '--verbose'] }
  ];
  
  executeSteps(steps, 0);
}

function executeSteps(steps, index) {
  if (index >= steps.length) {
    console.log('\n✨ 所有步骤完成！');
    console.log('\n🎉 可以运行以下命令：');
    console.log('  npm run build:dev - 构建开发版本');
    console.log('  npm start         - 启动应用');
    return;
  }
  
  const step = steps[index];
  console.log(`\n📦 步骤 ${index + 1}/${steps.length}: ${step.name}`);
  
  runCommand(step.cmd, step.args, step.name)
    .then(() => {
      executeSteps(steps, index + 1);
    })
    .catch(error => {
      console.error(`❌ 步骤失败: ${step.name}`, error.message);
      console.log('⚠️  继续下一个步骤...');
      executeSteps(steps, index + 1);
    });
}

function runCommand(cmd, args, description) {
  return new Promise((resolve, reject) => {
    console.log(`  执行: ${cmd} ${args.join(' ')}`);
    
    const process = spawn(cmd, args, {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        ELECTRON_GET_USE_PROXY: '1',
        GLOBAL_AGENT_HTTPS_PROXY: '',
        NPM_CONFIG_REGISTRY: 'https://registry.npmmirror.com/'
      }
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        console.log(`   ✅ ${description} 完成`);
        resolve();
      } else {
        reject(new Error(`命令退出码: ${code}`));
      }
    });
    
    process.on('error', (error) => {
      reject(error);
    });
  });
}

function verifyProjectStructure() {
  console.log('\n🔍 验证项目结构...');
  
  const requiredFiles = [
    'package.json',
    'tsconfig.json',
    'src/main/main.ts',
    'src/renderer/app.tsx',
    'src/renderer/styles.css',
    'ontologies/pmdco-minimal.ttl',
    'scripts/build.js'
  ];
  
  let allExist = true;
  
  requiredFiles.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
      const stat = fs.statSync(fullPath);
      console.log(`✅ ${file} (${stat.size} 字节)`);
    } else {
      console.log(`❌ ${file} 缺失`);
      allExist = false;
    }
  });
  
  if (allExist) {
    console.log('\n✨ 项目结构完整！');
  } else {
    console.log('\n⚠️  项目结构不完整');
  }
}

function createDevConfig() {
  console.log('\n⚙️  创建开发环境配置...');
  
  // 创建 .env 文件
  const envContent = `# Vajra 开发环境配置
ELECTRON_GET_USE_PROXY=1
NODE_OPTIONS=--max-old-space-size=4096
BROWSER=none

# 镜像配置
ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
ELECTRON_CUSTOM_DIR=29.0.0
SASS_BINARY_SITE=https://npmmirror.com/mirrors/node-sass/
`;

  fs.writeFileSync(path.join(__dirname, '.env'), envContent);
  console.log('✅ 创建 .env 文件');
  
  // 创建 .npmrc
  const npmrcContent = `registry=https://registry.npmmirror.com/
electron_mirror=https://npmmirror.com/mirrors/electron/
electron_custom_dir=29.0.0
`;

  fs.writeFileSync(path.join(__dirname, '.npmrc'), npmrcContent);
  console.log('✅ 更新 .npmrc 文件');
  
  console.log('\n📋 配置完成！');
  console.log('现在可以运行: npm install --legacy-peer-deps');
}

// 如果没有交互，直接运行默认选项
if (process.argv.includes('--auto')) {
  installStepByStep();
}