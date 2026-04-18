"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const WorkflowDesigner = () => {
    const [nodes, setNodes] = (0, react_1.useState)([
        { id: '1', type: 'input', label: '材料配方', x: 50, y: 100 },
        { id: '2', type: 'process', label: 'DFT 计算', x: 200, y: 80 },
        { id: '3', type: 'process', label: 'MD 模拟', x: 200, y: 140 },
        { id: '4', type: 'analysis', label: '性能分析', x: 350, y: 110 },
        { id: '5', type: 'output', label: '结果报告', x: 500, y: 110 },
    ]);
    const [connections, setConnections] = (0, react_1.useState)([
        { from: '1', to: '2' },
        { from: '1', to: '3' },
        { from: '2', to: '4' },
        { from: '3', to: '4' },
        { from: '4', to: '5' },
    ]);
    const [selectedNode, setSelectedNode] = (0, react_1.useState)(null);
    const [isDragging, setIsDragging] = (0, react_1.useState)(false);
    const handleNodeDragStart = (nodeId) => {
        setSelectedNode(nodeId);
        setIsDragging(true);
    };
    const handleCanvasClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        // 如果点击空白处，添加新节点
        if (!selectedNode && !isDragging) {
            const newNodeId = Date.now().toString();
            const newNode = {
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
    const handleNodeDrag = (e) => {
        if (!selectedNode || !isDragging)
            return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setNodes(nodes.map(node => node.id === selectedNode
            ? { ...node, x: x - 60, y: y - 20 }
            : node));
    };
    const getNodeColor = (type) => {
        switch (type) {
            case 'input': return '#4CAF50';
            case 'process': return '#2196F3';
            case 'analysis': return '#FF9800';
            case 'output': return '#F44336';
            default: return '#9E9E9E';
        }
    };
    const getNodeIcon = (type) => {
        switch (type) {
            case 'input': return 'fas fa-box-open';
            case 'process': return 'fas fa-cogs';
            case 'analysis': return 'fas fa-chart-line';
            case 'output': return 'fas fa-file-export';
            default: return 'fas fa-circle';
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "workflow-designer", children: [(0, jsx_runtime_1.jsxs)("div", { className: "designer-toolbar", children: [(0, jsx_runtime_1.jsxs)("h3", { children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-project-diagram" }), " \u5DE5\u4F5C\u6D41\u8BBE\u8BA1\u5668"] }), (0, jsx_runtime_1.jsxs)("div", { className: "toolbar-actions", children: [(0, jsx_runtime_1.jsxs)("button", { className: "toolbar-btn", children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-save" }), " \u4FDD\u5B58\u5DE5\u4F5C\u6D41"] }), (0, jsx_runtime_1.jsxs)("button", { className: "toolbar-btn", children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-play" }), " \u8FD0\u884C"] }), (0, jsx_runtime_1.jsxs)("button", { className: "toolbar-btn", children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-trash" }), " \u6E05\u7A7A"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "node-palette", children: [(0, jsx_runtime_1.jsx)("span", { children: "\u8282\u70B9\u7C7B\u578B\uFF1A" }), (0, jsx_runtime_1.jsxs)("div", { className: "node-type", style: { backgroundColor: '#4CAF50' }, children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-box-open" }), " \u8F93\u5165"] }), (0, jsx_runtime_1.jsxs)("div", { className: "node-type", style: { backgroundColor: '#2196F3' }, children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-cogs" }), " \u5904\u7406"] }), (0, jsx_runtime_1.jsxs)("div", { className: "node-type", style: { backgroundColor: '#FF9800' }, children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-chart-line" }), " \u5206\u6790"] }), (0, jsx_runtime_1.jsxs)("div", { className: "node-type", style: { backgroundColor: '#F44336' }, children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-file-export" }), " \u8F93\u51FA"] })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "designer-canvas-container", children: (0, jsx_runtime_1.jsxs)("div", { className: "designer-canvas", onClick: handleCanvasClick, onMouseMove: handleNodeDrag, onMouseUp: () => {
                        setIsDragging(false);
                        setSelectedNode(null);
                    }, onMouseLeave: () => {
                        setIsDragging(false);
                        setSelectedNode(null);
                    }, children: [(0, jsx_runtime_1.jsxs)("svg", { className: "connections-layer", width: "100%", height: "100%", children: [connections.map((conn, index) => {
                                    const fromNode = nodes.find(n => n.id === conn.from);
                                    const toNode = nodes.find(n => n.id === conn.to);
                                    if (!fromNode || !toNode)
                                        return null;
                                    return ((0, jsx_runtime_1.jsx)("line", { x1: fromNode.x + 120, y1: fromNode.y + 20, x2: toNode.x, y2: toNode.y + 20, stroke: "#666", strokeWidth: "2", markerEnd: "url(#arrowhead)" }, index));
                                }), (0, jsx_runtime_1.jsx)("defs", { children: (0, jsx_runtime_1.jsx)("marker", { id: "arrowhead", markerWidth: "10", markerHeight: "7", refX: "9", refY: "3.5", orient: "auto", children: (0, jsx_runtime_1.jsx)("polygon", { points: "0 0, 10 3.5, 0 7", fill: "#666" }) }) })] }), nodes.map(node => ((0, jsx_runtime_1.jsxs)("div", { className: `workflow-node ${selectedNode === node.id ? 'selected' : ''}`, style: {
                                left: `${node.x}px`,
                                top: `${node.y}px`,
                                backgroundColor: getNodeColor(node.type),
                                borderColor: selectedNode === node.id ? '#FFD700' : getNodeColor(node.type)
                            }, onMouseDown: () => handleNodeDragStart(node.id), children: [(0, jsx_runtime_1.jsxs)("div", { className: "node-header", children: [(0, jsx_runtime_1.jsx)("i", { className: getNodeIcon(node.type) }), (0, jsx_runtime_1.jsx)("span", { className: "node-label", children: node.label })] }), (0, jsx_runtime_1.jsxs)("div", { className: "node-content", children: [node.type === 'input' && ((0, jsx_runtime_1.jsx)("div", { className: "node-props", children: (0, jsx_runtime_1.jsx)("small", { children: "\u8F93\u5165\u7C7B\u578B: \u6750\u6599\u914D\u65B9" }) })), node.type === 'process' && ((0, jsx_runtime_1.jsx)("div", { className: "node-props", children: (0, jsx_runtime_1.jsx)("small", { children: "\u8BA1\u7B97\u5DE5\u5177: VASP/LAMMPS" }) })), node.type === 'analysis' && ((0, jsx_runtime_1.jsx)("div", { className: "node-props", children: (0, jsx_runtime_1.jsx)("small", { children: "\u5206\u6790\u65B9\u6CD5: ML/\u7EDF\u8BA1\u5206\u6790" }) })), node.type === 'output' && ((0, jsx_runtime_1.jsx)("div", { className: "node-props", children: (0, jsx_runtime_1.jsx)("small", { children: "\u8F93\u51FA\u683C\u5F0F: RDF/PDF" }) }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "node-ports", children: [(0, jsx_runtime_1.jsx)("div", { className: "port input-port" }), (0, jsx_runtime_1.jsx)("div", { className: "port output-port" })] })] }, node.id)))] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "designer-properties", children: [(0, jsx_runtime_1.jsxs)("h4", { children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-sliders-h" }), " \u5C5E\u6027\u9762\u677F"] }), selectedNode ? ((() => {
                        const node = nodes.find(n => n.id === selectedNode);
                        return node ? ((0, jsx_runtime_1.jsxs)("div", { className: "property-form", children: [(0, jsx_runtime_1.jsxs)("div", { className: "form-group", children: [(0, jsx_runtime_1.jsx)("label", { children: "\u8282\u70B9\u6807\u7B7E:" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: node.label, onChange: (e) => {
                                                setNodes(nodes.map(n => n.id === selectedNode ? { ...n, label: e.target.value } : n));
                                            } })] }), (0, jsx_runtime_1.jsxs)("div", { className: "form-group", children: [(0, jsx_runtime_1.jsx)("label", { children: "\u8282\u70B9\u7C7B\u578B:" }), (0, jsx_runtime_1.jsxs)("select", { value: node.type, onChange: (e) => {
                                                setNodes(nodes.map(n => n.id === selectedNode ? { ...n, type: e.target.value } : n));
                                            }, children: [(0, jsx_runtime_1.jsx)("option", { value: "input", children: "\u8F93\u5165" }), (0, jsx_runtime_1.jsx)("option", { value: "process", children: "\u5904\u7406" }), (0, jsx_runtime_1.jsx)("option", { value: "analysis", children: "\u5206\u6790" }), (0, jsx_runtime_1.jsx)("option", { value: "output", children: "\u8F93\u51FA" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "form-group", children: [(0, jsx_runtime_1.jsx)("label", { children: "\u4F4D\u7F6E:" }), (0, jsx_runtime_1.jsxs)("div", { className: "position-inputs", children: [(0, jsx_runtime_1.jsx)("input", { type: "number", value: node.x, onChange: (e) => {
                                                        setNodes(nodes.map(n => n.id === selectedNode ? { ...n, x: parseInt(e.target.value) } : n));
                                                    } }), (0, jsx_runtime_1.jsx)("span", { children: "\u00D7" }), (0, jsx_runtime_1.jsx)("input", { type: "number", value: node.y, onChange: (e) => {
                                                        setNodes(nodes.map(n => n.id === selectedNode ? { ...n, y: parseInt(e.target.value) } : n));
                                                    } })] })] }), (0, jsx_runtime_1.jsxs)("button", { className: "property-delete-btn", children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-trash" }), " \u5220\u9664\u8282\u70B9"] })] })) : null;
                    })()) : ((0, jsx_runtime_1.jsxs)("div", { className: "property-placeholder", children: [(0, jsx_runtime_1.jsx)("p", { children: "\u9009\u62E9\u4E00\u4E2A\u8282\u70B9\u4EE5\u7F16\u8F91\u5176\u5C5E\u6027" }), (0, jsx_runtime_1.jsx)("p", { children: "\u6216\u62D6\u62FD\u5DE6\u4FA7\u8282\u70B9\u7C7B\u578B\u5230\u753B\u5E03\u4E0A" })] }))] })] }));
};
exports.default = WorkflowDesigner;
