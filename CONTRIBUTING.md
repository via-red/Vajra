# 贡献指南

欢迎为 Vajra 项目贡献代码、文档或想法！

## 开发流程

1. **Fork 仓库**并克隆到本地
2. **创建功能分支**: `git checkout -b feature/amazing-feature`
3. **提交更改**: `git commit -m 'Add amazing feature'`
4. **推送到分支**: `git push origin feature/amazing-feature`
5. **创建 Pull Request**

## 代码规范

### 前端 (TypeScript/React)
- 使用 ESLint + Prettier 进行代码格式化
- 组件采用函数式组件 + Hooks
- 类型定义尽可能详细

### Python 后端
- 遵循 PEP 8 规范
- 使用类型注解
- 重要的公共 API 需要文档字符串

### 提交消息
使用约定式提交 (Conventional Commits):
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具变动

## 语义开发指南

### 与 PMD 本体交互
- 新功能应尽可能复用 PMDco 中的概念
- 新增本体术语需通过 PMD 社区的 Ontology Playground 讨论
- 数据映射示例应包含完整的 RDF 序列化

### 工作流开发
- 工作流定义使用 Common Workflow Language (CWL) 或 pyiron 兼容格式
- 包含完整的输入/输出模式定义
- 提供示例数据用于测试

## 测试要求

- 新功能需包含单元测试
- 集成测试覆盖关键用户流程
- 语义查询测试需验证 SPARQL 结果正确性

## 文档要求

- 公共 API 需要完整的 JSDoc/TypeDoc 注释
- 用户面向功能需要更新 README 或用户指南
- 复杂功能需要架构文档

## 问题与讨论

- **Bug 报告**: 使用 GitHub Issues，包含重现步骤和环境信息
- **功能请求**: 描述使用场景和预期行为
- **设计讨论**: 在 Pull Request 或 Discussion 中进行

## 获取帮助

- 阅读项目文档
- 查看现有代码示例
- 在 GitHub Discussions 中提问

感谢您的贡献！🚚🔬