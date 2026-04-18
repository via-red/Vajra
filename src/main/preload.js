const { contextBridge, ipcRenderer, shell } = require('electron');

// 安全地暴露 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 本体操作
  queryOntology: (query) => ipcRenderer.invoke('ontology:query', query),
  loadOntology: (path) => ipcRenderer.invoke('ontology:load', path),
  
  // OpenClaw 交互
  askOpenClaw: (question) => ipcRenderer.invoke('openclaw:ask', question),
  executeWorkflow: (workflowDefinition) => ipcRenderer.invoke('workflow:execute', workflowDefinition),
  
  // 文件操作
  readMaterialFile: (filePath) => ipcRenderer.invoke('file:readMaterial', filePath),
  writeMaterialFile: (filePath, content) => ipcRenderer.invoke('file:writeMaterial', filePath, content),
  
  // 系统信息
  getAppVersion: () => ipcRenderer.invoke('app:version'),
  
  // 系统功能
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // 事件监听
  onOntologyLoaded: (callback) => ipcRenderer.on('ontology:loaded', callback),
  onWorkflowProgress: (callback) => ipcRenderer.on('workflow:progress', callback)
});