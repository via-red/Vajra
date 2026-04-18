"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialIDE = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const MonacoEditor_1 = __importDefault(require("./MonacoEditor"));
const AIChatPanel_1 = __importDefault(require("./AIChatPanel"));
const MaterialExplorer_1 = __importDefault(require("./MaterialExplorer"));
const WorkflowDesigner_1 = __importDefault(require("./WorkflowDesigner"));
const StatusBar_1 = __importDefault(require("./StatusBar"));
const ontology_service_1 = require("../services/ontology-service");
const MaterialIDE = () => {
    const [activeTab, setActiveTab] = (0, react_1.useState)('editor');
    const [materialContent, setMaterialContent] = (0, react_1.useState)('');
    const [aiResponse, setAiResponse] = (0, react_1.useState)('');
    const [isOntologyLoaded, setIsOntologyLoaded] = (0, react_1.useState)(false);
    const [version, setVersion] = (0, react_1.useState)('0.1.0');
    (0, react_1.useEffect)(() => {
        // 初始化服务
        initServices();
        // 获取应用版本
        window.electronAPI.getAppVersion().then(v => setVersion(v));
        // 加载示例材料文件
        loadExampleMaterial();
    }, []);
    const initServices = async () => {
        try {
            await ontology_service_1.OntologyService.getInstance().loadCoreOntology();
            setIsOntologyLoaded(true);
            console.log('PMDco ontology loaded successfully');
        }
        catch (error) {
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
    const handleAskAI = async (question) => {
        try {
            const response = await window.electronAPI.askOpenClaw(question);
            setAiResponse(response.answer);
        }
        catch (error) {
            setAiResponse('Error: Failed to get response from AI assistant.');
        }
    };
    const handleSaveMaterial = async () => {
        try {
            await window.electronAPI.writeMaterialFile('example.mat', materialContent);
            console.log('Material file saved');
        }
        catch (error) {
            console.error('Failed to save material file:', error);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "material-ide", children: [(0, jsx_runtime_1.jsxs)("header", { className: "toolbar", children: [(0, jsx_runtime_1.jsxs)("div", { className: "logo", children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-gem" }), (0, jsx_runtime_1.jsx)("span", { children: "Vajra Material IDE" }), (0, jsx_runtime_1.jsxs)("span", { className: "version", children: ["v", version] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "tab-switcher", children: [(0, jsx_runtime_1.jsxs)("button", { className: activeTab === 'editor' ? 'active' : '', onClick: () => setActiveTab('editor'), children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-edit" }), " \u7F16\u8F91\u5668"] }), (0, jsx_runtime_1.jsxs)("button", { className: activeTab === 'workflow' ? 'active' : '', onClick: () => setActiveTab('workflow'), children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-project-diagram" }), " \u5DE5\u4F5C\u6D41"] }), (0, jsx_runtime_1.jsxs)("button", { className: activeTab === 'explorer' ? 'active' : '', onClick: () => setActiveTab('explorer'), children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-search" }), " \u6750\u6599\u5E93"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "actions", children: [(0, jsx_runtime_1.jsx)("button", { onClick: handleSaveMaterial, title: "\u4FDD\u5B58", children: (0, jsx_runtime_1.jsx)("i", { className: "fas fa-save" }) }), (0, jsx_runtime_1.jsx)("button", { title: "\u8FD0\u884C\u5DE5\u4F5C\u6D41", children: (0, jsx_runtime_1.jsx)("i", { className: "fas fa-play" }) }), (0, jsx_runtime_1.jsx)("button", { title: "\u8BBE\u7F6E", children: (0, jsx_runtime_1.jsx)("i", { className: "fas fa-cog" }) })] })] }), (0, jsx_runtime_1.jsxs)("main", { className: "workspace", children: [(0, jsx_runtime_1.jsx)("aside", { className: "sidebar-left", children: (0, jsx_runtime_1.jsx)(MaterialExplorer_1.default, {}) }), (0, jsx_runtime_1.jsxs)("section", { className: "main-editor", children: [activeTab === 'editor' && ((0, jsx_runtime_1.jsx)(MonacoEditor_1.default, { value: materialContent, onChange: setMaterialContent, language: "yaml" })), activeTab === 'workflow' && ((0, jsx_runtime_1.jsx)(WorkflowDesigner_1.default, {})), activeTab === 'explorer' && ((0, jsx_runtime_1.jsxs)("div", { className: "material-explorer-view", children: [(0, jsx_runtime_1.jsx)("h3", { children: "\u6750\u6599\u5E93\u6D4F\u89C8\u5668" }), (0, jsx_runtime_1.jsx)("p", { children: "\u57FA\u4E8E PMD \u672C\u4F53\u7684\u6750\u6599\u6982\u5FF5\u5BFC\u822A" }), isOntologyLoaded ? ((0, jsx_runtime_1.jsxs)("div", { className: "ontology-status", children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-check-circle" }), " PMDco \u672C\u4F53\u5DF2\u52A0\u8F7D"] })) : ((0, jsx_runtime_1.jsxs)("div", { className: "ontology-status loading", children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-spinner fa-spin" }), " \u52A0\u8F7D\u672C\u4F53\u4E2D..."] }))] }))] }), (0, jsx_runtime_1.jsx)("aside", { className: "sidebar-right", children: (0, jsx_runtime_1.jsx)(AIChatPanel_1.default, { onAsk: handleAskAI, response: aiResponse }) })] }), (0, jsx_runtime_1.jsx)("footer", { className: "status-bar", children: (0, jsx_runtime_1.jsx)(StatusBar_1.default, { ontologyLoaded: isOntologyLoaded, onOntologyQuery: () => {
                        window.electronAPI.queryOntology('SELECT ?class WHERE { ?class rdfs:subClassOf* pmd:Material }')
                            .then(result => console.log('Ontology query result:', result));
                    } }) })] }));
};
exports.MaterialIDE = MaterialIDE;
exports.default = exports.MaterialIDE;
