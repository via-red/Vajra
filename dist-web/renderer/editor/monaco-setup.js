"use strict";
// Monaco Editor 初始化配置
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
exports.configureMonacoEnvironment = configureMonacoEnvironment;
exports.initializeMonaco = initializeMonaco;
const monaco = __importStar(require("monaco-editor"));
// 配置 Monaco 环境
function configureMonacoEnvironment() {
    if (!window.MonacoEnvironment) {
        window.MonacoEnvironment = {
            getWorkerUrl: function (moduleId, label) {
                if (label === 'json') {
                    return './vs/language/json/json.worker.js';
                }
                if (label === 'css' || label === 'scss' || label === 'less') {
                    return './vs/language/css/css.worker.js';
                }
                if (label === 'html' || label === 'handlebars' || label === 'razor') {
                    return './vs/language/html/html.worker.js';
                }
                if (label === 'typescript' || label === 'javascript') {
                    return './vs/language/typescript/ts.worker.js';
                }
                return './vs/editor/editor.worker.js';
            }
        };
    }
}
// 初始化 Monaco Editor
async function initializeMonaco() {
    // 配置环境
    configureMonacoEnvironment();
    // 注册自定义语言 - 材料文件
    registerMaterialLanguage();
    // 注册主题
    registerCustomThemes();
    console.log('Monaco Editor initialized');
}
// 注册自定义主题
function registerCustomThemes() {
    // 深色主题
    monaco.editor.defineTheme('vajra-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: 'comment', foreground: '6A9955' },
            { token: 'keyword', foreground: '569CD6' },
            { token: 'string', foreground: 'CE9178' },
            { token: 'number', foreground: 'B5CEA8' },
            { token: 'type', foreground: '4EC9B0' },
            { token: 'variable.predefined', foreground: '9CDCFE' },
            { token: 'variable', foreground: '9CDCFE' },
        ],
        colors: {
            'editor.background': '#1E1E1E',
            'editor.foreground': '#D4D4D4',
            'editor.selectionBackground': '#264F78',
            'editor.lineHighlightBackground': '#2D2D30',
            'editorCursor.foreground': '#AEAFAD',
            'editorWhitespace.foreground': '#404040',
        }
    });
    // 浅色主题
    monaco.editor.defineTheme('vajra-light', {
        base: 'vs',
        inherit: true,
        rules: [
            { token: 'comment', foreground: '008000' },
            { token: 'keyword', foreground: '0000FF' },
            { token: 'string', foreground: 'A31515' },
            { token: 'number', foreground: '098658' },
            { token: 'type', foreground: '267F99' },
            { token: 'variable.predefined', foreground: '001080' },
            { token: 'variable', foreground: '001080' },
        ],
        colors: {
            'editor.background': '#FFFFFF',
            'editor.foreground': '#000000',
            'editor.selectionBackground': '#ADD6FF',
            'editor.lineHighlightBackground': '#F5F5F5',
            'editorCursor.foreground': '#000000',
        }
    });
}
// 注册材料文件语言
function registerMaterialLanguage() {
    // 定义语言 ID
    const languageId = 'material';
    // 检查是否已注册
    if (monaco.languages.getLanguages().some(lang => lang.id === languageId)) {
        return;
    }
    // 注册新语言
    monaco.languages.register({ id: languageId });
    // 配置语言
    monaco.languages.setLanguageConfiguration(languageId, {
        comments: {
            lineComment: '#'
        },
        brackets: [
            ['{', '}'],
            ['[', ']'],
            ['(', ')']
        ],
        autoClosingPairs: [
            { open: '{', close: '}' },
            { open: '[', close: ']' },
            { open: '(', close: ')' },
            { open: '"', close: '"' },
            { open: "'", close: "'" }
        ],
        surroundingPairs: [
            { open: '{', close: '}' },
            { open: '[', close: ']' },
            { open: '(', close: ')' },
            { open: '"', close: '"' },
            { open: "'", close: "'" }
        ],
        indentationRules: {
            increaseIndentPattern: /^.*:\s*$/,
            decreaseIndentPattern: /^\s*.*:\s*$/
        }
    });
    // 设置词法分析器
    monaco.languages.setMonarchTokensProvider(languageId, {
        defaultToken: '',
        tokenPostfix: '.material',
        // 关键词
        keywords: [
            '@context', 'material', 'designation', 'class', 'composition',
            'element', 'amount', 'unit', 'processing', 'type', 'parameters',
            'temperature', 'atmosphere', 'cooling', 'properties', 'value',
            'method', 'workflow', 'id', 'steps'
        ],
        // 操作符
        operators: [':'],
        // 符号
        symbols: /[=><!~?:&|+\-*/^%]+/,
        // 转义序列
        escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
        // 词法分析规则
        tokenizer: {
            root: [
                // 注释
                [/#.*$/, 'comment'],
                // 上下文声明
                [/@context\b/, 'keyword'],
                // 顶级关键字
                [/material\b|composition\b|processing\b|properties\b|workflow\b/, 'keyword'],
                // 二级属性
                [/designation\b|class\b|id\b|steps\b/, 'keyword'],
                // 三级属性
                [/element\b|amount\b|unit\b|type\b|parameters\b|value\b|method\b/, 'type'],
                // 四级属性
                [/temperature\b|atmosphere\b|cooling\b/, 'type'],
                // 标识符
                [/[a-zA-Z_][a-zA-Z0-9_]*/, {
                        cases: {
                            '@keywords': 'keyword',
                            '@default': 'identifier'
                        }
                    }],
                // 化学元素（大写字母开头，可能跟随小写字母）
                [/\b([A-Z][a-z]?)\b/, 'variable.predefined'],
                // 数字
                [/\d+(\.\d+)?/, 'number'],
                // 字符串
                [/"([^"\\]|\\.)*$/, 'string.invalid'], // 非终止字符串
                [/"([^"\\]|\\.)*"/, 'string'],
                [/'([^'\\]|\\.)*$/, 'string.invalid'], // 非终止字符串
                [/'([^'\\]|\\.)*'/, 'string'],
                // 分隔符和运算符
                [/[{}()[\]]/, '@brackets'],
                [/:/, 'operator'],
                // 空白字符
                { include: '@whitespace' }
            ],
            whitespace: [
                [/[ \t\r\n]+/, 'white'],
                [/#.*$/, 'comment']
            ]
        }
    });
    // 注册自动补全提供器
    registerCompletionProvider(languageId);
    // 注册悬停提供器
    registerHoverProvider(languageId);
    // 注册格式化提供器
    registerFormatter(languageId);
}
// 注册自动补全提供器
function registerCompletionProvider(languageId) {
    monaco.languages.registerCompletionItemProvider(languageId, {
        provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position);
            const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn
            };
            // 基于上下文的建议
            const lineContent = model.getLineContent(position.lineNumber);
            const suggestions = [];
            // 顶级建议
            if (lineContent.trim().length === 0 || lineContent.includes('material:')) {
                suggestions.push({
                    label: '@context:',
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: '@context:\n  pmd: https://w3id.org/pmd/co/\n  tto: https://w3id.org/pmd/tto/',
                    documentation: '定义本体命名空间',
                    range
                }, {
                    label: 'material:',
                    kind: monaco.languages.CompletionItemKind.Class,
                    insertText: 'material:\n  designation: "${1:材料标识}"\n  class: "${2:材料类}"',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: '定义一个新材料',
                    range
                });
            }
            // 材料属性建议
            if (lineContent.includes('material:')) {
                suggestions.push({
                    label: 'designation:',
                    kind: monaco.languages.CompletionItemKind.Property,
                    insertText: 'designation: "${1:材料标识}"',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: '材料唯一标识符',
                    range
                }, {
                    label: 'class:',
                    kind: monaco.languages.CompletionItemKind.Property,
                    insertText: 'class: "${1:HighEntropyAlloy|Ceramic|Polymer|Composite}"',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: '材料类别',
                    range
                }, {
                    label: 'composition:',
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: 'composition:\n  - element: "${1:Co}"\n    amount: ${2:20.0}\n    unit: "${3:at.%}"',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: '材料化学组成',
                    range
                }, {
                    label: 'processing:',
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: 'processing:\n  - type: "${1:ArcMelting}"\n    parameters:\n      temperature: ${2:1600}\n      unit: "${3:°C}"',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: '材料加工工艺',
                    range
                }, {
                    label: 'properties:',
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: 'properties:\n  - type: "${1:Hardness}"\n    value: ${2:250}\n    unit: "${3:HV}"\n    method: "${4:VickersTest}"',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: '材料性能',
                    range
                });
            }
            // 元素建议
            if (lineContent.includes('element:')) {
                const elements = [
                    'Co', 'Cr', 'Fe', 'Ni', 'Mn', 'Al', 'Ti', 'Cu', 'Zn', 'Mg',
                    'Si', 'O', 'C', 'N', 'H', 'Ag', 'Au', 'Pt', 'Pd', 'W', 'Mo'
                ];
                elements.forEach(element => {
                    suggestions.push({
                        label: element,
                        kind: monaco.languages.CompletionItemKind.Constant,
                        insertText: element,
                        documentation: `化学元素: ${element}`,
                        range
                    });
                });
            }
            // 单位建议
            if (lineContent.includes('unit:')) {
                const units = [
                    'at.%', 'wt.%', 'g/cm³', 'MPa', 'GPa', 'HV', '°C', 'K',
                    'W/m·K', 'S/m', 'Ω·m', 'J/mol·K', '1/K'
                ];
                units.forEach(unit => {
                    suggestions.push({
                        label: unit,
                        kind: monaco.languages.CompletionItemKind.Unit,
                        insertText: unit,
                        documentation: `单位: ${unit}`,
                        range
                    });
                });
            }
            return { suggestions };
        }
    });
}
// 注册悬停提供器
function registerHoverProvider(languageId) {
    monaco.languages.registerHoverProvider(languageId, {
        provideHover: (model, position) => {
            const word = model.getWordAtPosition(position);
            if (!word) {
                return null;
            }
            const wordText = word.word;
            // PMD 本体概念提示
            const pmdConcepts = {
                'material': '材料 (PMDco:Material) - 所有材料的总称',
                'designation': '标识符 (PMDco:hasDesignation) - 材料的唯一标识',
                'class': '类别 (PMDco:hasMaterialClass) - 材料的分类',
                'composition': '组成 (PMDco:hasComposition) - 材料的化学组成',
                'element': '元素 (PMDco:ChemicalElement) - 化学元素',
                'processing': '加工 (PMDco:hasProcessing) - 材料加工工艺',
                'properties': '性能 (PMDco:hasProperty) - 材料性能',
                'workflow': '工作流 (PMDco:Workflow) - 材料研究流程'
            };
            const conceptDoc = pmdConcepts[wordText];
            if (conceptDoc) {
                return {
                    contents: [
                        { value: `**${wordText}**` },
                        { value: conceptDoc }
                    ]
                };
            }
            // 元素提示
            const elementInfo = {
                'Co': '钴 (Cobalt) - 原子序数 27，过渡金属',
                'Cr': '铬 (Chromium) - 原子序数 24，过渡金属',
                'Fe': '铁 (Iron) - 原子序数 26，过渡金属',
                'Ni': '镍 (Nickel) - 原子序数 28，过渡金属',
                'Mn': '锰 (Manganese) - 原子序数 25，过渡金属',
                'Al': '铝 (Aluminum) - 原子序数 13，贫金属',
                'Ti': '钛 (Titanium) - 原子序数 22，过渡金属'
            };
            const elementDoc = elementInfo[wordText];
            if (elementDoc) {
                return {
                    contents: [
                        { value: `**${wordText}**` },
                        { value: elementDoc }
                    ]
                };
            }
            return null;
        }
    });
}
// 注册格式化提供器
function registerFormatter(languageId) {
    monaco.languages.registerDocumentFormattingEditProvider(languageId, {
        provideDocumentFormattingEdits: (model) => {
            const text = model.getValue();
            const lines = text.split('\n');
            const formattedLines = [];
            let indentLevel = 0;
            for (let i = 0; i < lines.length; i++) {
                let line = lines[i].trimEnd();
                // 跳过空行
                if (line.trim() === '') {
                    formattedLines.push('');
                    continue;
                }
                // 计算缩进
                const lineIndent = line.match(/^\s*/)?.[0].length || 0;
                // 调整缩进级别
                if (line.includes(':')) {
                    // 保持当前缩进
                }
                else if (line.startsWith('- ')) {
                    // 列表项，增加一级缩进
                    indentLevel++;
                }
                // 应用缩进
                const indent = '  '.repeat(indentLevel);
                formattedLines.push(indent + line.trimStart());
            }
            const formattedText = formattedLines.join('\n');
            return [{
                    range: model.getFullModelRange(),
                    text: formattedText
                }];
        }
    });
}
// 导出默认初始化函数
exports.default = initializeMonaco;
