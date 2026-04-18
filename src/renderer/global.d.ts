// 全局类型声明
export {};

declare global {
  interface Window {
    electronAPI?: {
      // 本体操作
      queryOntology: (query: string) => Promise<any>;
      loadOntology: (path: string) => Promise<any>;
      
      // OpenClaw 交互
      askOpenClaw: (question: string) => Promise<any>;
      executeWorkflow: (workflowDefinition: any) => Promise<any>;
      
      // 文件操作
      readMaterialFile: (filePath: string) => Promise<any>;
      writeMaterialFile: (filePath: string, content: string) => Promise<any>;
      
      // 系统信息
      getAppVersion: () => Promise<string>;
      
      // 系统功能
      openExternal: (url: string) => Promise<{ success: boolean; error?: string }>;
      
      // 事件监听
      onOntologyLoaded: (callback: (event: any, ...args: any[]) => void) => void;
      onWorkflowProgress: (callback: (event: any, ...args: any[]) => void) => void;
    };
  }
}