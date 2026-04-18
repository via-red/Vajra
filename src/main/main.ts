import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent, shell } from 'electron';
import path from 'path';
import { setupOpenClawIntegration } from './openclaw-integration';
import { setupOntologyLoader } from './ontology-loader';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    title: 'Vajra Material IDE',
    icon: path.join(__dirname, '../../resources/icon.png')
  });

  // 加载应用界面
  if (process.env.NODE_ENV === 'development') {
    // 开发模式：加载本地文件并打开开发者工具
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    mainWindow.webContents.openDevTools();
  } else {
    // 生产模式：加载打包后的文件
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 设置集成模块
  setupOpenClawIntegration(mainWindow);
  setupOntologyLoader(mainWindow);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 打开外部链接
ipcMain.handle('open-external', async (event: IpcMainInvokeEvent, url: string) => {
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// 应用版本信息
ipcMain.handle('app:version', async () => {
  return '0.1.0';
});

// 文件操作处理器（示例实现）
ipcMain.handle('file:readMaterial', async (event: IpcMainInvokeEvent, filePath: string) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(__dirname, '../../', filePath);
    
    if (!fs.existsSync(fullPath)) {
      return { success: false, error: 'File not found' };
    }
    
    const content = fs.readFileSync(fullPath, 'utf-8');
    return { success: true, content };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('file:writeMaterial', async (event: IpcMainInvokeEvent, filePath: string, content: string) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(__dirname, '../../', filePath);
    
    // 确保目录存在
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(fullPath, content, 'utf-8');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});