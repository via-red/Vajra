import React, { useState, useEffect } from 'react';
import MonacoEditor from './MonacoEditor';
import AIChatPanel from './AIChatPanel';
import MaterialExplorer from './MaterialExplorer';
import WorkflowDesigner from './WorkflowDesigner';
import StatusBar from './StatusBar';
import { OntologyService } from '../services/ontology-service';
import { OpenClawService } from '../services/openclaw-service';

export const MaterialIDE: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'editor' | 'workflow' | 'explorer'>('editor');
  const [materialContent, setMaterialContent] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isOntologyLoaded, setIsOntologyLoaded] = useState<boolean>(false);
  const [isAppReady, setIsAppReady] = useState<boolean>(false);
  const [version, setVersion] = useState<string>('0.1.0');

  useEffect(() => {
    console.log('MaterialIDE组件挂载，开始初始化...');
    
    // 简化资源加载检测：使用固定延迟和多个检查点
    let mounted = true;
    
    const ensureAppReady = () => {
      if (!mounted) return;
      console.log('设置应用为就绪状态');
      setIsAppReady(true);
    };
    
    // 立即设置一个安全超时，确保最终会显示界面
    const safetyTimeout = setTimeout(() => {
      console.log('安全超时触发，强制显示应用');
      ensureAppReady();
    }, 2000); // 2秒安全超时
    
    // 主要资源检测逻辑
    const checkResources = async () => {
      try {
        console.log('开始资源检测...');
        
        // 检查1：基本DOM就绪
        if (document.readyState !== 'complete') {
          await new Promise(resolve => {
            document.addEventListener('DOMContentLoaded', resolve, { once: true });
          });
        }
        console.log('DOM就绪检查通过');
        
        // 检查2：字体加载（如果有）
        if (document.fonts && document.fonts.ready) {
          try {
            await document.fonts.ready;
            console.log('字体加载完成');
          } catch (fontError) {
            console.warn('字体加载检查失败:', fontError);
          }
        }
        
        // 检查3：CSS关键样式是否加载
        const checkCSS = () => {
          try {
            // 简单检查：body背景色是否应用了我们的样式
            const bodyStyle = window.getComputedStyle(document.body);
            const bodyBg = bodyStyle.backgroundColor;
            // 检查是否为暗色主题颜色
            const isDarkTheme = bodyBg.includes('30, 30, 30') || bodyBg === 'rgb(30, 30, 30)' || bodyBg === '#1e1e1e';
            console.log(`CSS检查: body背景色=${bodyBg}, 暗色主题=${isDarkTheme}`);
            return isDarkTheme;
          } catch (e) {
            console.warn('CSS检查失败:', e);
            return true; // 检查失败时假设CSS已加载
          }
        };
        
        // 尝试CSS检查几次
        let cssReady = checkCSS();
        if (!cssReady) {
          await new Promise(resolve => setTimeout(resolve, 100));
          cssReady = checkCSS();
        }
        
        console.log(`CSS加载状态: ${cssReady ? '就绪' : '未就绪'}`);
        
        // 无论检查结果如何，在短暂延迟后显示应用
        await new Promise(resolve => setTimeout(resolve, 300));
        
      } catch (error) {
        console.error('资源检测过程中出错:', error);
      } finally {
        // 清理安全超时
        clearTimeout(safetyTimeout);
        
        // 确保应用显示
        ensureAppReady();
        console.log('资源检测完成，应用应显示');
      }
    };
    
    // 启动资源检测
    checkResources();
    
    // 初始化服务
    initServices();
    
    // 获取应用版本
    window.electronAPI?.getAppVersion().then(v => setVersion(v));
    
    // 加载示例材料文件
    loadExampleMaterial();
    
    // 监听本体自动加载事件
    if (window.electronAPI?.onOntologyLoaded) {
      window.electronAPI.onOntologyLoaded((event, data) => {
        console.log('收到本体自动加载事件，更新UI状态:', data);
        setIsOntologyLoaded(true);
      });
    }
    
    // 清理函数
    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      console.log('MaterialIDE组件卸载，清理资源');
    };
  }, []);

  const initServices = async () => {
    try {
      await OntologyService.getInstance().loadCoreOntology();
      setIsOntologyLoaded(true);
      console.log('PMDco ontology loaded successfully');
    } catch (error) {
      console.error('Failed to load ontology:', error);
    }
  };

  const loadExampleMaterial = () => {
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
    
    setMaterialContent(exampleMaterial);
  };

  const handleAskAI = async (question: string) => {
    try {
      const response = await window.electronAPI?.askOpenClaw(question);
      if (response) {
        setAiResponse(response.answer);
      } else {
        setAiResponse('Error: OpenClaw API not available.');
      }
    } catch (error) {
      setAiResponse('Error: Failed to get response from AI assistant.');
    }
  };

  const handleSaveMaterial = async () => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.writeMaterialFile('example.mat', materialContent);
        console.log('Material file saved');
      } else {
        console.error('Electron API not available');
      }
    } catch (error) {
      console.error('Failed to save material file:', error);
    }
  };

  // 如果应用未就绪，显示加载界面
  if (!isAppReady) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">
          <i className="fas fa-atom fa-spin"></i>
        </div>
        <div className="loading-text">
          <h2>Vajra Material IDE</h2>
          <p>正在加载应用资源...</p>
          <div className="loading-progress">
            <div className="progress-bar"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="material-ide">
      {/* 顶部工具栏 */}
      <header className="toolbar">
        <div className="logo">
          <i className="fas fa-gem"></i>
          <span>Vajra Material IDE</span>
          <span className="version">v{version}</span>
        </div>
        
        <div className="tab-switcher">
          <button 
            className={activeTab === 'editor' ? 'active' : ''}
            onClick={() => setActiveTab('editor')}
          >
            <i className="fas fa-edit"></i> 编辑器
          </button>
          <button 
            className={activeTab === 'workflow' ? 'active' : ''}
            onClick={() => setActiveTab('workflow')}
          >
            <i className="fas fa-project-diagram"></i> 工作流
          </button>
          <button 
            className={activeTab === 'explorer' ? 'active' : ''}
            onClick={() => setActiveTab('explorer')}
          >
            <i className="fas fa-search"></i> 材料库
          </button>
        </div>
        
        <div className="actions">
          <button onClick={handleSaveMaterial} title="保存">
            <i className="fas fa-save"></i>
          </button>
          <button title="运行工作流">
            <i className="fas fa-play"></i>
          </button>
          <button title="设置">
            <i className="fas fa-cog"></i>
          </button>
        </div>
      </header>

      {/* 主工作区 */}
      <main className="workspace">
        {/* 左侧材料资源管理器 */}
        <aside className="sidebar-left">
          <MaterialExplorer />
        </aside>

        {/* 中心编辑器区域 */}
        <section className="main-editor">
          {activeTab === 'editor' && (
            <MonacoEditor 
              value={materialContent}
              onChange={setMaterialContent}
              language="yaml"
            />
          )}
          
          {activeTab === 'workflow' && (
            <WorkflowDesigner />
          )}
          
          {activeTab === 'explorer' && (
            <div className="material-explorer-view">
              <h3>材料库浏览器</h3>
              <p>基于 PMD 本体的材料概念导航</p>
              {isOntologyLoaded ? (
                <div className="ontology-status">
                  <i className="fas fa-check-circle"></i> PMDco 本体已加载
                </div>
              ) : (
                <div className="ontology-status loading">
                  <i className="fas fa-spinner fa-spin"></i> 加载本体中...
                </div>
              )}
            </div>
          )}
        </section>

        {/* 右侧 AI 助手面板 */}
        <aside className="sidebar-right">
          <AIChatPanel 
            onAsk={handleAskAI}
            response={aiResponse}
          />
        </aside>
      </main>

      {/* 底部状态栏 */}
      <footer className="status-bar">
        <StatusBar 
          ontologyLoaded={isOntologyLoaded}
          onOntologyQuery={() => {
            window.electronAPI?.queryOntology('SELECT ?class WHERE { ?class rdfs:subClassOf* pmd:Material }')
              .then(result => console.log('Ontology query result:', result));
          }}
        />
      </footer>
    </div>
  );
};

export default MaterialIDE;