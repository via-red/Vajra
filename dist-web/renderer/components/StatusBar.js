"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const StatusBar = ({ ontologyLoaded, onOntologyQuery }) => {
    const [currentTime, setCurrentTime] = (0, react_1.useState)('');
    const [memoryUsage, setMemoryUsage] = (0, react_1.useState)('');
    (0, react_1.useEffect)(() => {
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
    return ((0, jsx_runtime_1.jsxs)("div", { className: "status-bar", children: [(0, jsx_runtime_1.jsxs)("div", { className: "status-left", children: [(0, jsx_runtime_1.jsxs)("div", { className: "status-item", children: [(0, jsx_runtime_1.jsx)("span", { className: "status-label", children: "PMD \u672C\u4F53:" }), (0, jsx_runtime_1.jsx)("span", { className: `status-value ${ontologyLoaded ? 'success' : 'warning'}`, children: ontologyLoaded ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-check-circle" }), " \u5DF2\u52A0\u8F7D"] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-exclamation-circle" }), " \u52A0\u8F7D\u4E2D"] })) }), (0, jsx_runtime_1.jsx)("button", { className: "status-action-btn", onClick: onOntologyQuery, title: "\u6D4B\u8BD5\u672C\u4F53\u67E5\u8BE2", children: (0, jsx_runtime_1.jsx)("i", { className: "fas fa-search" }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "status-item", children: [(0, jsx_runtime_1.jsx)("span", { className: "status-label", children: "\u5DE5\u4F5C\u6D41:" }), (0, jsx_runtime_1.jsxs)("span", { className: "status-value", children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-play-circle" }), " \u5C31\u7EEA"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "status-item", children: [(0, jsx_runtime_1.jsx)("span", { className: "status-label", children: "AI:" }), (0, jsx_runtime_1.jsxs)("span", { className: "status-value success", children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-robot" }), " \u5728\u7EBF"] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "status-center", children: [(0, jsx_runtime_1.jsxs)("div", { className: "status-item", children: [(0, jsx_runtime_1.jsx)("span", { className: "status-label", children: "\u8BED\u6CD5:" }), (0, jsx_runtime_1.jsxs)("span", { className: "status-value", children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-check" }), " YAML"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "status-item", children: [(0, jsx_runtime_1.jsx)("span", { className: "status-label", children: "\u7F16\u7801:" }), (0, jsx_runtime_1.jsx)("span", { className: "status-value", children: "UTF-8" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "status-item", children: [(0, jsx_runtime_1.jsx)("span", { className: "status-label", children: "\u884C\u5C3E\u7B26:" }), (0, jsx_runtime_1.jsx)("span", { className: "status-value", children: "LF" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "status-right", children: [(0, jsx_runtime_1.jsxs)("div", { className: "status-item", children: [(0, jsx_runtime_1.jsx)("span", { className: "status-label", children: "\u5185\u5B58:" }), (0, jsx_runtime_1.jsx)("span", { className: "status-value", children: memoryUsage })] }), (0, jsx_runtime_1.jsxs)("div", { className: "status-item", children: [(0, jsx_runtime_1.jsx)("span", { className: "status-label", children: "\u65F6\u95F4:" }), (0, jsx_runtime_1.jsxs)("span", { className: "status-value", children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-clock" }), " ", currentTime] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "status-item", children: [(0, jsx_runtime_1.jsx)("span", { className: "status-label", children: "\u9879\u76EE:" }), (0, jsx_runtime_1.jsx)("span", { className: "status-value", children: "Vajra IDE" })] })] })] }));
};
exports.default = StatusBar;
