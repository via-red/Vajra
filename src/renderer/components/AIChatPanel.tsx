import React, { useState, useRef, useEffect } from 'react';

interface AIChatPanelProps {
  onAsk: (question: string) => void;
  response: string;
}

const AIChatPanel: React.FC<AIChatPanelProps> = ({ onAsk, response }) => {
  const [question, setQuestion] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'ai', content: string}>>([
    { role: 'ai', content: '你好！我是 Vajra AI 助手，专注于材料科学。我可以帮你分析材料配方、预测性能、设计实验工作流。有什么可以帮你的吗？' }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (response) {
      setChatHistory(prev => [...prev, { role: 'ai', content: response }]);
    }
  }, [response]);

  useEffect(() => {
    // 自动滚动到底部
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userQuestion = question;
    setChatHistory(prev => [...prev, { role: 'user', content: userQuestion }]);
    setQuestion('');
    setIsLoading(true);

    try {
      await onAsk(userQuestion);
    } catch (error) {
      setChatHistory(prev => [...prev, { 
        role: 'ai', 
        content: '抱歉，处理你的请求时出现了错误。请稍后再试。' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (quickQuestion: string) => {
    setQuestion(quickQuestion);
  };

  const exampleQuestions = [
    '帮我分析这个 CoCrFeNiMn 合金的相稳定性',
    '设计一个高强度铝合金的配方',
    '预测 TiO2 纳米颗粒的带隙',
    '创建一个陶瓷材料的烧结工艺工作流',
    '解释什么是高熵合金',
    '比较 FCC 和 BCC 晶体结构的性能差异'
  ];

  return (
    <div className="ai-chat-panel">
      <div className="panel-header">
        <h3>
          <i className="fas fa-robot"></i> AI 材料助手
        </h3>
        <div className="connection-status">
          <span className="status-dot connected"></span>
          <span>OpenClaw 已连接</span>
        </div>
      </div>

      <div className="chat-container" ref={chatContainerRef}>
        {chatHistory.map((message, index) => (
          <div 
            key={index} 
            className={`chat-message ${message.role}`}
          >
            <div className="message-avatar">
              {message.role === 'ai' ? (
                <i className="fas fa-robot"></i>
              ) : (
                <i className="fas fa-user"></i>
              )}
            </div>
            <div className="message-content">
              {message.content}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="chat-message ai">
            <div className="message-avatar">
              <i className="fas fa-robot"></i>
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="quick-questions">
        <p>快速提问：</p>
        <div className="question-buttons">
          {exampleQuestions.map((q, index) => (
            <button 
              key={index}
              className="quick-question-btn"
              onClick={() => handleQuickQuestion(q)}
              title={q}
            >
              {q.length > 25 ? q.substring(0, 25) + '...' : q}
            </button>
          ))}
        </div>
      </div>

      <form className="chat-input-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="输入你的材料科学问题..."
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={!question.trim() || isLoading}
            title="发送"
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
        
        <div className="input-hints">
          <small>
            提示：可以询问材料配方、性能预测、工艺优化、数据分析等问题
          </small>
        </div>
      </form>

      <div className="ai-capabilities">
        <h4>我能帮你：</h4>
        <ul>
          <li><i className="fas fa-flask"></i> 分析材料配方与组成</li>
          <li><i className="fas fa-chart-line"></i> 预测材料性能</li>
          <li><i className="fas fa-cogs"></i> 设计实验与模拟工作流</li>
          <li><i className="fas fa-database"></i> 查询材料数据库</li>
          <li><i className="fas fa-code"></i> 生成分析代码</li>
          <li><i className="fas fa-book"></i> 解释材料科学概念</li>
        </ul>
      </div>
    </div>
  );
};

export default AIChatPanel;