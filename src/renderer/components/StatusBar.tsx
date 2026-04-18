import React, { useState, useEffect } from 'react';

interface StatusBarProps {
  ontologyLoaded: boolean;
  onOntologyQuery: () => void;
}

const StatusBar: React.FC<StatusBarProps> = ({ ontologyLoaded, onOntologyQuery }) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [memoryUsage, setMemoryUsage] = useState<string>('');

  const handleContributeTerm = () => {
    const contributeUrl = 'https://github.com/materialdigital/core-ontology/issues/new?template=term_request.md';
    // 尝试使用 electron shell 打开外部浏览器
    if (window.electronAPI && window.electronAPI.openExternal) {
      window.electronAPI.openExternal(contributeUrl);
    } else {
      window.open(contributeUrl, '_blank');
    }
  };

  useEffect(() => {
    // 更新时间
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    // 模拟内存使用
    const updateMemory = () => {
      const usage = Math.floor(Math.random() * 500) + 300;
      setMemoryUsage(`${usage} MB`);
    };
    
    updateMemory();
    const memoryInterval = setInterval(updateMemory, 5000);
    
    return () => {
      clearInterval(interval);
      clearInterval(memoryInterval);
    };
  }, []);

  return (
    <div className="status-bar">
      <div className="status-left">
        <div className="status-item">
          <span className="status-label">PMD 本体:</span>
          <span className={`status-value ${ontologyLoaded ? 'success' : 'warning'}`}>
            {ontologyLoaded ? (
              <>
                <i className="fas fa-check-circle"></i> 已加载
              </>
            ) : (
              <>
                <i className="fas fa-exclamation-circle"></i> 加载中
              </>
            )}
          </span>
          <button 
            className="status-action-btn"
            onClick={onOntologyQuery}
            title="测试本体查询"
          >
            <i className="fas fa-search"></i>
          </button>
          <button 
            className="status-action-btn"
            onClick={handleContributeTerm}
            title="贡献新术语到 PMD 本体"
          >
            <i className="fas fa-plus-circle"></i>
          </button>
        </div>
        
        <div className="status-item">
          <span className="status-label">工作流:</span>
          <span className="status-value">
            <i className="fas fa-play-circle"></i> 就绪
          </span>
        </div>
        
        <div className="status-item">
          <span className="status-label">AI:</span>
          <span className="status-value success">
            <i className="fas fa-robot"></i> 在线
          </span>
        </div>
      </div>
      
      <div className="status-center">
        <div className="status-item">
          <span className="status-label">语法:</span>
          <span className="status-value">
            <i className="fas fa-check"></i> YAML
          </span>
        </div>
        
        <div className="status-item">
          <span className="status-label">编码:</span>
          <span className="status-value">UTF-8</span>
        </div>
        
        <div className="status-item">
          <span className="status-label">行尾符:</span>
          <span className="status-value">LF</span>
        </div>
      </div>
      
      <div className="status-right">
        <div className="status-item">
          <span className="status-label">内存:</span>
          <span className="status-value">{memoryUsage}</span>
        </div>
        
        <div className="status-item">
          <span className="status-label">时间:</span>
          <span className="status-value">
            <i className="fas fa-clock"></i> {currentTime}
          </span>
        </div>
        
        <div className="status-item">
          <span className="status-label">项目:</span>
          <span className="status-value">Vajra IDE</span>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;