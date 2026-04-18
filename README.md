# Vajra - 材料智能开发IDE

基于 PMD (Platform MaterialDigital) 标准构建的材料科学智能集成开发环境。

## 项目愿景

创建一个融合 PMD 语义标准、OpenClaw AI 自动化、VS Code 编辑器体验的专门面向材料研究的 IDE，实现材料研发的全流程数字化。

## 技术栈

- **前端**: Electron + React + Monaco Editor (VS Code 核心)
- **语义层**: PMD Core Ontology (PMDco) + RDFLib/N3.js
- **AI 集成**: OpenClaw Gateway + 材料专用 Agent
- **工作流引擎**: pyiron (PMD 官方环境)
- **数据格式**: `.mat` (YAML + RDF 注释)

## 项目结构

```
Vajra/
├── src/                    # 源代码
├── docs/                  # 文档
├── resources/             # 静态资源
├── ontologies/           # PMD 本体文件
│   ├── pmdco-minimal.ttl
│   └── tto-example.ttl
├── scripts/              # 构建/工具脚本
└── tests/               # 测试
```

## 核心特性

1. **语义智能感知**: 基于 PMDco 的材料概念自动补全
2. **工作流设计器**: 拖拽式材料研究流程编排
3. **AI 材料助手**: OpenClaw 驱动的自然语言交互
4. **实验-模拟闭环**: 连接真实设备与数字孪生
5. **FAIR 数据输出**: 自动生成 PMD 兼容的 RDF 数据

## 快速开始

### 环境准备
```bash
# 克隆仓库
git clone <repository-url>
cd Vajra

# 安装依赖
npm install

# 下载 PMD 本体
cd ontologies
curl -O https://raw.githubusercontent.com/materialdigital/core-ontology/main/pmdco-minimal.ttl
```

### 开发模式
```bash
npm run dev
```

## 路线图

### 阶段 1: 语义层集成 (1-2个月)
- [ ] PMDco 本体解析与查询
- [ ] `.mat` 文件格式规范
- [ ] VS Code 扩展基础框架

### 阶段 2: 工作流引擎 (3-4个月)
- [ ] pyiron 集成
- [ ] 可视化工作流设计器
- [ ] 本地执行环境

### 阶段 3: AI 增强 (5-6个月)
- [ ] OpenClaw 集成
- [ ] 语义增强的 AI 提示
- [ ] 自动数据标注

### 阶段 4: 实验集成 (7-8个月)
- [ ] 设备控制接口
- [ ] 实时数据流
- [ ] 数字孪生同步

## 与 PMD 生态的关系

Vajra 旨在成为 **PMD 标准的参考实现前端**，类似于：
- **VSCode** 之于 **Language Server Protocol (LSP)**
- **GitHub Desktop** 之于 **Git**

## 贡献指南

欢迎贡献！请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详情。

## 许可证

[待定]

## 联系方式

- 项目主页: [待定]
- 问题追踪: [GitHub Issues](待定)
- 讨论区: [待定]

---

**金刚 (Vajra)**: 在佛教中象征不可摧毁的智慧，寓意本 IDE 将提供坚固、锐利的工具，帮助材料科学家穿透研究中的复杂性。