"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const monaco = __importStar(require("monaco-editor"));
const MonacoEditor = ({ value, onChange, language = 'yaml', height = '100%' }) => {
    const editorRef = (0, react_1.useRef)(null);
    const editorInstanceRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        if (editorRef.current && !editorInstanceRef.current) {
            // 创建编辑器实例
            const editor = monaco.editor.create(editorRef.current, {
                value,
                language,
                theme: 'vs-dark',
                automaticLayout: true,
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                fontSize: 14,
                lineNumbers: 'on',
                renderLineHighlight: 'all',
                scrollbar: {
                    vertical: 'visible',
                    horizontal: 'visible'
                },
                wordWrap: 'on',
                wrappingIndent: 'indent',
                suggestOnTriggerCharacters: true,
                tabSize: 2
            });
            // 监听内容变化
            editor.onDidChangeModelContent(() => {
                const newValue = editor.getValue();
                onChange(newValue);
            });
            editorInstanceRef.current = editor;
            // 注册自定义语言（材料文件）
            registerMaterialLanguage();
        }
        return () => {
            if (editorInstanceRef.current) {
                editorInstanceRef.current.dispose();
                editorInstanceRef.current = null;
            }
        };
    }, []);
    // 更新编辑器内容
    (0, react_1.useEffect)(() => {
        if (editorInstanceRef.current && editorInstanceRef.current.getValue() !== value) {
            editorInstanceRef.current.setValue(value);
        }
    }, [value]);
    // 更新语言
    (0, react_1.useEffect)(() => {
        if (editorInstanceRef.current) {
            const model = editorInstanceRef.current.getModel();
            if (model) {
                monaco.editor.setModelLanguage(model, language);
            }
        }
    }, [language]);
    const registerMaterialLanguage = () => {
        // 定义 .mat 文件的语言配置
        monaco.languages.register({ id: 'material' });
        monaco.languages.setMonarchTokensProvider('material', {
            tokenizer: {
                root: [
                    // 注释
                    [/^#.*/, 'comment'],
                    // 上下文声明
                    [/@context:/, 'keyword'],
                    // 材料类
                    [/material:/, 'keyword'],
                    [/designation:|class:/, 'keyword'],
                    // 组成
                    [/composition:/, 'keyword'],
                    [/element:|amount:|unit:/, 'type'],
                    // 工艺
                    [/processing:/, 'keyword'],
                    [/type:|parameters:/, 'keyword'],
                    [/temperature:|atmosphere:|cooling:/, 'type'],
                    // 性能
                    [/properties:/, 'keyword'],
                    [/value:|method:/, 'type'],
                    // 工作流
                    [/workflow:/, 'keyword'],
                    [/id:|steps:/, 'keyword'],
                    // 字符串
                    [/"([^"\\]|\\.)*$/, 'string.invalid'], // 非终止字符串
                    [/"([^"\\]|\\.)*"/, 'string'],
                    // 数字
                    [/\d+(\.\d+)?/, 'number'],
                    // 元素符号（大写字母开头，可能跟随小写字母）
                    [/\b([A-Z][a-z]?)\b/, 'variable.predefined'],
                ]
            }
        });
        // 定义自动补全
        monaco.languages.registerCompletionItemProvider('material', {
            provideCompletionItems: (model, position) => {
                const word = model.getWordUntilPosition(position);
                const range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word.startColumn,
                    endColumn: word.endColumn
                };
                // 基于 PMD 本体的建议
                const suggestions = [
                    // 材料类
                    {
                        label: 'material:',
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: 'material:',
                        detail: '材料定义根节点',
                        documentation: '定义一个材料的开始'
                    },
                    {
                        label: 'designation:',
                        kind: monaco.languages.CompletionItemKind.Property,
                        insertText: 'designation: "${1:材料标识}"',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        detail: '材料标识符'
                    },
                    {
                        label: 'class:',
                        kind: monaco.languages.CompletionItemKind.Property,
                        insertText: 'class: "${1:材料类}"',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        detail: '材料类别 (如 HighEntropyAlloy, Ceramic, Polymer)'
                    },
                    // 组成相关
                    {
                        label: 'composition:',
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: 'composition:\n  - element: "${1:元素符号}"\n    amount: ${2:数值}\n    unit: "${3:单位}"',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        detail: '材料化学组成'
                    },
                    // 工艺相关
                    {
                        label: 'processing:',
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: 'processing:\n  - type: "${1:工艺类型}"\n    parameters:\n      temperature: ${2:数值}\n      unit: "${3:°C}"',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        detail: '材料加工工艺'
                    }
                ];
                return { suggestions };
            }
        });
    };
    const style = {
        height,
        width: '100%',
        border: '1px solid #333',
        borderRadius: '4px'
    };
    return (0, jsx_runtime_1.jsx)("div", { ref: editorRef, style: style });
};
exports.default = MonacoEditor;
