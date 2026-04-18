"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const AIChatPanel = ({ onAsk, response }) => {
    const [question, setQuestion] = (0, react_1.useState)('');
    const [chatHistory, setChatHistory] = (0, react_1.useState)([
        { role: 'ai', content: '你好！我是 Vajra AI 助手，专注于材料科学。我可以帮你分析材料配方、预测性能、设计实验工作流。有什么可以帮你的吗？' }
    ]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const chatContainerRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        if (response) {
            setChatHistory(prev => [...prev, { role: 'ai', content: response }]);
        }
    }, [response]);
    (0, react_1.useEffect)(() => {
        // 自动滚动到底部
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!question.trim())
            return;
        const userQuestion = question;
        setChatHistory(prev => [...prev, { role: 'user', content: userQuestion }]);
        setQuestion('');
        setIsLoading(true);
        try {
            await onAsk(userQuestion);
        }
        catch (error) {
            setChatHistory(prev => [...prev, {
                    role: 'ai',
                    content: '抱歉，处理你的请求时出现了错误。请稍后再试。'
                }]);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleQuickQuestion = (quickQuestion) => {
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
    return ((0, jsx_runtime_1.jsxs)("div", { className: "ai-chat-panel", children: [(0, jsx_runtime_1.jsxs)("div", { className: "panel-header", children: [(0, jsx_runtime_1.jsxs)("h3", { children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-robot" }), " AI \u6750\u6599\u52A9\u624B"] }), (0, jsx_runtime_1.jsxs)("div", { className: "connection-status", children: [(0, jsx_runtime_1.jsx)("span", { className: "status-dot connected" }), (0, jsx_runtime_1.jsx)("span", { children: "OpenClaw \u5DF2\u8FDE\u63A5" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "chat-container", ref: chatContainerRef, children: [chatHistory.map((message, index) => ((0, jsx_runtime_1.jsxs)("div", { className: `chat-message ${message.role}`, children: [(0, jsx_runtime_1.jsx)("div", { className: "message-avatar", children: message.role === 'ai' ? ((0, jsx_runtime_1.jsx)("i", { className: "fas fa-robot" })) : ((0, jsx_runtime_1.jsx)("i", { className: "fas fa-user" })) }), (0, jsx_runtime_1.jsx)("div", { className: "message-content", children: message.content })] }, index))), isLoading && ((0, jsx_runtime_1.jsxs)("div", { className: "chat-message ai", children: [(0, jsx_runtime_1.jsx)("div", { className: "message-avatar", children: (0, jsx_runtime_1.jsx)("i", { className: "fas fa-robot" }) }), (0, jsx_runtime_1.jsx)("div", { className: "message-content", children: (0, jsx_runtime_1.jsxs)("div", { className: "typing-indicator", children: [(0, jsx_runtime_1.jsx)("span", {}), (0, jsx_runtime_1.jsx)("span", {}), (0, jsx_runtime_1.jsx)("span", {})] }) })] }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "quick-questions", children: [(0, jsx_runtime_1.jsx)("p", { children: "\u5FEB\u901F\u63D0\u95EE\uFF1A" }), (0, jsx_runtime_1.jsx)("div", { className: "question-buttons", children: exampleQuestions.map((q, index) => ((0, jsx_runtime_1.jsx)("button", { className: "quick-question-btn", onClick: () => handleQuickQuestion(q), title: q, children: q.length > 25 ? q.substring(0, 25) + '...' : q }, index))) })] }), (0, jsx_runtime_1.jsxs)("form", { className: "chat-input-form", onSubmit: handleSubmit, children: [(0, jsx_runtime_1.jsxs)("div", { className: "input-group", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: question, onChange: (e) => setQuestion(e.target.value), placeholder: "\u8F93\u5165\u4F60\u7684\u6750\u6599\u79D1\u5B66\u95EE\u9898...", disabled: isLoading }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: !question.trim() || isLoading, title: "\u53D1\u9001", children: (0, jsx_runtime_1.jsx)("i", { className: "fas fa-paper-plane" }) })] }), (0, jsx_runtime_1.jsx)("div", { className: "input-hints", children: (0, jsx_runtime_1.jsx)("small", { children: "\u63D0\u793A\uFF1A\u53EF\u4EE5\u8BE2\u95EE\u6750\u6599\u914D\u65B9\u3001\u6027\u80FD\u9884\u6D4B\u3001\u5DE5\u827A\u4F18\u5316\u3001\u6570\u636E\u5206\u6790\u7B49\u95EE\u9898" }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "ai-capabilities", children: [(0, jsx_runtime_1.jsx)("h4", { children: "\u6211\u80FD\u5E2E\u4F60\uFF1A" }), (0, jsx_runtime_1.jsxs)("ul", { children: [(0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-flask" }), " \u5206\u6790\u6750\u6599\u914D\u65B9\u4E0E\u7EC4\u6210"] }), (0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-chart-line" }), " \u9884\u6D4B\u6750\u6599\u6027\u80FD"] }), (0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-cogs" }), " \u8BBE\u8BA1\u5B9E\u9A8C\u4E0E\u6A21\u62DF\u5DE5\u4F5C\u6D41"] }), (0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-database" }), " \u67E5\u8BE2\u6750\u6599\u6570\u636E\u5E93"] }), (0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-code" }), " \u751F\u6210\u5206\u6790\u4EE3\u7801"] }), (0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-book" }), " \u89E3\u91CA\u6750\u6599\u79D1\u5B66\u6982\u5FF5"] })] })] })] }));
};
exports.default = AIChatPanel;
