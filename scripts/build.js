#!/usr/bin/env node

/**
 * Vajra Material IDE 构建脚本
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚚 开始构建 Vajra Material IDE...');

// 确保目录存在
const directories = [
  'dist',
  'dist/renderer',
  'dist/main',
  'dist/ontologies'
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 创建目录: ${dir}`);
  }
});

// 复制本体文件
console.log('📦 复制本体文件...');
const ontologyFiles = [
  'ontologies/pmdco-minimal.ttl',
  'ontologies/tto-example.ttl'
];

ontologyFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const dest = path.join('dist', file);
    fs.copyFileSync(file, dest);
    console.log(`  ✓ 复制: ${file} → ${dest}`);
  } else {
    console.log(`  ⚠  文件不存在: ${file}`);
  }
});

// 检查 package.json
if (!fs.existsSync('package.json')) {
  console.error('❌ package.json 不存在！');
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// 安装依赖（如果 node_modules 不存在）
if (!fs.existsSync('node_modules')) {
  console.log('📦 安装依赖...');
  try {
    execSync('npm install', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ 依赖安装失败:', error.message);
    process.exit(1);
  }
}

// 编译 TypeScript
console.log('⚙️  编译 TypeScript...');
try {
  execSync('npx tsc', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ TypeScript 编译失败:', error.message);
  process.exit(1);
}

// 使用 esbuild 打包渲染进程
console.log('📦 打包渲染进程代码...');
try {
  const esbuild = require('esbuild');
  
  esbuild.buildSync({
    entryPoints: ['src/renderer/app.tsx'],
    bundle: true,
    outfile: 'dist/renderer/app.bundle.js',
    format: 'iife', // 立即执行函数表达式
    globalName: 'VajraApp',
    platform: 'browser',
    target: ['es2020'],
    external: [], // 不再外部化，打包React进去以确保稳定
    define: {
      'process.env.NODE_ENV': '"development"'
    },
    loader: {
      '.ts': 'ts',
      '.tsx': 'tsx',
      '.css': 'css', // 使用css加载器，esbuild会处理CSS导入
      '.ttf': 'dataurl',
      '.woff': 'dataurl',
      '.woff2': 'dataurl',
      '.eot': 'dataurl',
      '.svg': 'dataurl'
    },
    tsconfig: 'tsconfig.json'
  });
  
  console.log('  ✓ 渲染进程打包完成: dist/renderer/app.bundle.js');
} catch (error) {
  console.error('❌ 渲染进程打包失败:', error.message);
  process.exit(1);
}

// 复制静态文件
console.log('📄 复制静态文件...');

// HTML 文件
const htmlFiles = [
  { src: 'src/renderer/index.html', dest: 'dist/renderer/index.html' }
];

htmlFiles.forEach(({ src, dest }) => {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`  ✓ 复制: ${src} → ${dest}`);
  }
});

// CSS 文件
const cssFiles = [
  { src: 'src/renderer/styles.css', dest: 'dist/renderer/styles.css' }
];

cssFiles.forEach(({ src, dest }) => {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`  ✓ 复制: ${src} → ${dest}`);
  }
});

// 复制预加载脚本
const preloadSrc = 'src/main/preload.js';
const preloadDest = 'dist/main/preload.js';
if (fs.existsSync(preloadSrc)) {
  fs.copyFileSync(preloadSrc, preloadDest);
  console.log(`  ✓ 复制: ${preloadSrc} → ${preloadDest}`);
}

// 创建 package.json 的构建版本
const buildPackageJson = {
  ...packageJson,
  main: './main/main.js',
  scripts: {
    start: 'electron .'
  }
};

fs.writeFileSync(
  'dist/package.json',
  JSON.stringify(buildPackageJson, null, 2)
);
console.log('  ✓ 创建: dist/package.json');

// 创建应用图标占位符
const iconDir = path.join('dist', 'resources');
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

const iconPlaceholder = path.join(iconDir, 'icon.png');
if (!fs.existsSync(iconPlaceholder)) {
  // 创建一个简单的占位符
  const placeholder = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA' +
    'B3RJTUUH5gQDBxMT5W5lVgAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAABk' +
    'SURBVDjL7ZRBCsAgEEQn3v+ilxJ6zA/9CUFKMBp3sRv5sMss4DCMWJb6xwvUTAMkU4Fk+ncD6wZk' +
    'E0gmM0A2gWQyA2QTSKbeAHM8h2Sq/QbZ9A3S6R3k0ysopp+hmvYD1fQziP8I3J8AAAAASUVORK5C' +
    'YII=',
    'base64'
  );
  fs.writeFileSync(iconPlaceholder, placeholder);
  console.log('  ✓ 创建: resources/icon.png (占位符)');
}

console.log('✨ 构建完成！');
console.log('');
console.log('运行以下命令启动应用：');
console.log('  cd dist && npm start');
console.log('');
console.log('或在开发模式下运行：');
console.log('  npm run dev');