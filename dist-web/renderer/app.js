"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
const client_1 = __importDefault(require("react-dom/client"));
const MaterialIDE_1 = require("./components/MaterialIDE");
require("./styles.css");
const root = client_1.default.createRoot(document.getElementById('root'));
root.render((0, jsx_runtime_1.jsx)(react_1.default.StrictMode, { children: (0, jsx_runtime_1.jsx)(MaterialIDE_1.MaterialIDE, {}) }));
// 初始化 Monaco Editor
const monaco_setup_1 = require("./editor/monaco-setup");
(0, monaco_setup_1.initializeMonaco)().then(() => {
    console.log('Monaco Editor initialized');
});
