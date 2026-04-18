#!/usr/bin/env node

/**
 * 跨平台清理脚本
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 清理构建文件和依赖...');

function removeDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    console.log(`删除目录: ${dirPath}`);
    try {
      if (process.platform === 'win32') {
        // Windows 使用 rmdir
        execSync(`rmdir /s /q "${dirPath}"`, { stdio: 'inherit' });
      } else {
        // Unix 使用 rm -rf
        execSync(`rm -rf "${dirPath}"`, { stdio: 'inherit' });
      }
      console.log(`✅ ${dirPath} 已删除`);
    } catch (error) {
      console.log(`⚠️  无法删除 ${dirPath}: ${error.message}`);
      // 尝试使用 Node.js 的 fs 模块
      try {
        fs.rmSync(dirPath, { recursive: true, force: true, maxRetries: 3 });
        console.log(`✅ ${dirPath} 已删除 (使用 fs.rmSync)`);
      } catch (fsError) {
        console.log(`❌ 完全无法删除 ${dirPath}`);
        console.log(`   请手动删除该目录`);
      }
    }
  } else {
    console.log(`📭 ${dirPath} 不存在，跳过`);
  }
}

// 清理目录
removeDir('node_modules');
removeDir('dist');
removeDir('out');

// 清理 TypeScript 生成的文件
console.log('\n🗑️  清理 TypeScript 生成的文件...');
try {
  if (fs.existsSync('tsconfig.json')) {
    const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
    const outDir = tsconfig.compilerOptions?.outDir || 'dist';
    if (outDir !== 'dist') {
      removeDir(outDir);
    }
  }
} catch (error) {
  // 忽略错误
}

// 清理缓存
console.log('\n🧼 清理 npm 缓存...');
try {
  if (process.platform === 'win32') {
    execSync('npm cache clean --force', { stdio: 'inherit' });
  } else {
    execSync('npm cache clean --force', { stdio: 'inherit' });
  }
  console.log('✅ npm 缓存已清理');
} catch (error) {
  console.log('⚠️  清理缓存失败:', error.message);
}

console.log('\n✨ 清理完成！');
console.log('\n现在可以重新安装依赖:');
console.log('  npm install --registry=https://registry.npmmirror.com');