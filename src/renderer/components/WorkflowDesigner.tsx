import React, { useState } from 'react';

interface WorkflowNode {
  id: string;
  type: 'input' | 'process' | 'analysis' | 'output';
  label: string;
  x: number;
  y: number;
}

interface WorkflowConnection {
  from: string;
  to: string;
}

const WorkflowDesigner: React.FC = () => {
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    { id: '1', type: 'input', label: '材料配方', x: 50, y: 100 },
    { id: '2', type: 'process', label: 'DFT 计算', x: 200, y: 80 },
    { id: '3', type: 'process', label: 'MD 模拟', x: 200, y: 140 },
    { id: '4', type: 'analysis', label: '性能分析', x: 350, y: 110 },
    { id: '5', type: 'output', label: '结果报告', x: 500, y: 110 },
  ]);

  const [connections, setConnections] = useState<WorkflowConnection[]>([
    { from: '1', to: '2' },
    { from: '1', to: '3' },
    { from: '2', to: '4' },
    { from: '3', to: '4' },
    { from: '4', to: '5' },
  ]);

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleNodeDragStart = (nodeId: string) => {
    setSelectedNode(nodeId);
    setIsDragging(true);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 如果点击空白处，添加新节点
    if (!selectedNode && !isDragging) {
      const newNodeId = Date.now().toString();
      const newNode: WorkflowNode = {
        id: newNodeId,
        type: 'process',
        label: '新步骤',
        x: x - 60,
        y: y - 20
      };
      
      setNodes([...nodes, newNode]);
    }
    
    setSelectedNode(null);
    setIsDragging(false);
  };

  const handleNodeDrag = (e: React.MouseEvent) => {
    if (!selectedNode || !isDragging) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setNodes(nodes.map(node => 
      node.id === selectedNode 
        ? { ...node, x: x - 60, y: y - 20 }
        : node
    ));
  };

  const getNodeColor = (type: WorkflowNode['type']) => {
    switch (type) {
      case 'input': return '#4CAF50';
      case 'process': return '#2196F3';
      case 'analysis': return '#FF9800';
      case 'output': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getNodeIcon = (type: WorkflowNode['type']) => {
    switch (type) {
      case 'input': return 'fas fa-box-open';
      case 'process': return 'fas fa-cogs';
      case 'analysis': return 'fas fa-chart-line';
      case 'output': return 'fas fa-file-export';
      default: return 'fas fa-circle';
    }
  };

  return (
    <div className="workflow-designer">
      <div className="designer-toolbar">
        <h3>
          <i className="fas fa-project-diagram"></i> 工作流设计器
        </h3>
        
        <div className="toolbar-actions">
          <button className="toolbar-btn">
            <i className="fas fa-save"></i> 保存工作流
          </button>
          <button className="toolbar-btn">
            <i className="fas fa-play"></i> 运行
          </button>
          <button className="toolbar-btn">
            <i className="fas fa-trash"></i> 清空
          </button>
        </div>
        
        <div className="node-palette">
          <span>节点类型：</span>
          <div className="node-type" style={{ backgroundColor: '#4CAF50' }}>
            <i className="fas fa-box-open"></i> 输入
          </div>
          <div className="node-type" style={{ backgroundColor: '#2196F3' }}>
            <i className="fas fa-cogs"></i> 处理
          </div>
          <div className="node-type" style={{ backgroundColor: '#FF9800' }}>
            <i className="fas fa-chart-line"></i> 分析
          </div>
          <div className="node-type" style={{ backgroundColor: '#F44336' }}>
            <i className="fas fa-file-export"></i> 输出
          </div>
        </div>
      </div>

      <div className="designer-canvas-container">
        <div 
          className="designer-canvas"
          onClick={handleCanvasClick}
          onMouseMove={handleNodeDrag}
          onMouseUp={() => {
            setIsDragging(false);
            setSelectedNode(null);
          }}
          onMouseLeave={() => {
            setIsDragging(false);
            setSelectedNode(null);
          }}
        >
          {/* 绘制连接线 */}
          <svg className="connections-layer" width="100%" height="100%">
            {connections.map((conn, index) => {
              const fromNode = nodes.find(n => n.id === conn.from);
              const toNode = nodes.find(n => n.id === conn.to);
              
              if (!fromNode || !toNode) return null;
              
              return (
                <line
                  key={index}
                  x1={fromNode.x + 120}
                  y1={fromNode.y + 20}
                  x2={toNode.x}
                  y2={toNode.y + 20}
                  stroke="#666"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
              );
            })}
            
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
              </marker>
            </defs>
          </svg>

          {/* 绘制节点 */}
          {nodes.map(node => (
            <div
              key={node.id}
              className={`workflow-node ${selectedNode === node.id ? 'selected' : ''}`}
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                backgroundColor: getNodeColor(node.type),
                borderColor: selectedNode === node.id ? '#FFD700' : getNodeColor(node.type)
              }}
              onMouseDown={() => handleNodeDragStart(node.id)}
            >
              <div className="node-header">
                <i className={getNodeIcon(node.type)}></i>
                <span className="node-label">{node.label}</span>
              </div>
              
              <div className="node-content">
                {node.type === 'input' && (
                  <div className="node-props">
                    <small>输入类型: 材料配方</small>
                  </div>
                )}
                
                {node.type === 'process' && (
                  <div className="node-props">
                    <small>计算工具: VASP/LAMMPS</small>
                  </div>
                )}
                
                {node.type === 'analysis' && (
                  <div className="node-props">
                    <small>分析方法: ML/统计分析</small>
                  </div>
                )}
                
                {node.type === 'output' && (
                  <div className="node-props">
                    <small>输出格式: RDF/PDF</small>
                  </div>
                )}
              </div>
              
              <div className="node-ports">
                <div className="port input-port"></div>
                <div className="port output-port"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="designer-properties">
        <h4>
          <i className="fas fa-sliders-h"></i> 属性面板
        </h4>
        
        {selectedNode ? (
          (() => {
            const node = nodes.find(n => n.id === selectedNode);
            return node ? (
              <div className="property-form">
                <div className="form-group">
                  <label>节点标签:</label>
                  <input 
                    type="text" 
                    value={node.label}
                    onChange={(e) => {
                      setNodes(nodes.map(n => 
                        n.id === selectedNode ? { ...n, label: e.target.value } : n
                      ));
                    }}
                  />
                </div>
                
                <div className="form-group">
                  <label>节点类型:</label>
                  <select 
                    value={node.type}
                    onChange={(e) => {
                      setNodes(nodes.map(n => 
                        n.id === selectedNode ? { ...n, type: e.target.value as WorkflowNode['type'] } : n
                      ));
                    }}
                  >
                    <option value="input">输入</option>
                    <option value="process">处理</option>
                    <option value="analysis">分析</option>
                    <option value="output">输出</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>位置:</label>
                  <div className="position-inputs">
                    <input 
                      type="number" 
                      value={node.x}
                      onChange={(e) => {
                        setNodes(nodes.map(n => 
                          n.id === selectedNode ? { ...n, x: parseInt(e.target.value) } : n
                        ));
                      }}
                    />
                    <span>×</span>
                    <input 
                      type="number" 
                      value={node.y}
                      onChange={(e) => {
                        setNodes(nodes.map(n => 
                          n.id === selectedNode ? { ...n, y: parseInt(e.target.value) } : n
                        ));
                      }}
                    />
                  </div>
                </div>
                
                <button className="property-delete-btn">
                  <i className="fas fa-trash"></i> 删除节点
                </button>
              </div>
            ) : null;
          })()
        ) : (
          <div className="property-placeholder">
            <p>选择一个节点以编辑其属性</p>
            <p>或拖拽左侧节点类型到画布上</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowDesigner;