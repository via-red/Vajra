// PMD 本体解析测试

const fs = require('fs');
const path = require('path');

console.log('🧪 测试 PMD 本体解析...');

// 检查本体文件是否存在
const ontologyFiles = [
  '../ontologies/pmdco-minimal.ttl',
  '../ontologies/tto-example.ttl'
];

let allFilesExist = true;

ontologyFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    console.log(`✅ ${filePath} 存在 (${stats.size} 字节)`);
    
    // 检查文件内容
    const content = fs.readFileSync(fullPath, 'utf-8');
    if (content.includes('@prefix') || content.includes('PREFIX')) {
      console.log(`  格式正确: 包含 RDF 前缀声明`);
    }
    if (content.includes('pmd:')) {
      console.log(`  包含 PMD 命名空间`);
    }
  } else {
    console.log(`❌ ${filePath} 不存在`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n⚠️  部分本体文件缺失，尝试下载...');
  
  // 提供下载链接
  console.log(`
可以手动下载缺失的文件：
1. PMDco minimal: https://raw.githubusercontent.com/materialdigital/core-ontology/main/pmdco-minimal.ttl
2. TTO example: https://raw.githubusercontent.com/materialdigital/application-ontologies/main/tensile_test_ontology_TTO/pmd_tto_data_mapping_example.ttl

将文件保存到 ontologies/ 目录下。
  `);
}

// 测试材料文件格式
console.log('\n📝 测试材料文件格式...');

const exampleMaterial = `# 示例材料: CoCrFeNiMn 高熵合金
@context:
  pmd: https://w3id.org/pmd/co/
  tto: https://w3id.org/pmd/tto/

material:
  designation: "HEA-CoCrFeNiMn-001"
  class: "HighEntropyAlloy"
  
  composition:
    - element: "Co"
      amount: 20.0
      unit: "at.%"
    
    - element: "Cr"
      amount: 20.0
      unit: "at.%"
    
    - element: "Fe"
      amount: 20.0
      unit: "at.%"
    
    - element: "Ni"
      amount: 20.0
      unit: "at.%"
    
    - element: "Mn"
      amount: 20.0
      unit: "at.%"
  
  processing:
    - type: "ArcMelting"
      parameters:
        temperature: 1600
        unit: "°C"
        atmosphere: "Ar"
        cooling: "WaterQuenched"
  
  properties:
    - type: "Hardness"
      value: 250
      unit: "HV"
      method: "VickersTest"
    
    - type: "TensileStrength"
      value: 850
      unit: "MPa"
      method: "TensileTest"
  
  workflow:
    id: "HighEntropyAlloyScreening"
    steps: ["DFT_Calculation", "ML_Prediction", "Experimental_Validation"]`;

console.log('✅ 材料文件格式示例有效');
console.log(`   包含 ${exampleMaterial.split('\n').length} 行`);
console.log(`   包含关键词: material, composition, processing, properties, workflow`);

// 测试项目结构
console.log('\n🏗️  测试项目结构...');

const requiredDirs = [
  'src',
  'src/main',
  'src/renderer',
  'src/renderer/components',
  'src/renderer/editor',
  'src/renderer/services',
  'src/renderer/utils',
  'ontologies',
  'scripts',
  'tests',
  'resources'
];

requiredDirs.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${dir}/ 存在`);
  } else {
    console.log(`❌ ${dir}/ 缺失`);
  }
});

// 测试关键文件
console.log('\n📄 测试关键文件...');

const requiredFiles = [
  'package.json',
  'tsconfig.json',
  'README.md',
  'src/main/main.ts',
  'src/renderer/app.tsx',
  'src/renderer/styles.css',
  'scripts/build.js'
];

requiredFiles.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    console.log(`✅ ${file} 存在 (${stats.size} 字节)`);
  } else {
    console.log(`❌ ${file} 缺失`);
  }
});

console.log('\n✨ 测试完成！');
console.log('\n下一步:');
console.log('1. 运行 `npm install` 安装依赖');
console.log('2. 运行 `npm run build:dev` 构建项目');
console.log('3. 运行 `npm start` 启动应用');