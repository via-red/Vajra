"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const MaterialExplorer = () => {
    const [materials, setMaterials] = (0, react_1.useState)([
        { id: '1', name: 'CoCrFeNiMn-HEA', type: 'alloy', lastModified: '2026-04-18', size: '2.3 KB' },
        { id: '2', name: 'Al2O3-Ceramic', type: 'ceramic', lastModified: '2026-04-17', size: '1.8 KB' },
        { id: '3', name: 'PET-Polymer', type: 'polymer', lastModified: '2026-04-16', size: '1.5 KB' },
        { id: '4', name: 'CFRP-Composite', type: 'composite', lastModified: '2026-04-15', size: '3.2 KB' },
    ]);
    const [ontologyClasses, setOntologyClasses] = (0, react_1.useState)([]);
    const [selectedClass, setSelectedClass] = (0, react_1.useState)('');
    const [expandedClasses, setExpandedClasses] = (0, react_1.useState)(new Set(['material']));
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const [activeTab, setActiveTab] = (0, react_1.useState)('files');
    (0, react_1.useEffect)(() => {
        // 模拟加载本体类
        loadOntologyClasses();
    }, []);
    const loadOntologyClasses = async () => {
        try {
            // 这里应该从 OntologyService 获取实际数据
            // 暂时使用模拟数据
            const classes = [
                {
                    id: 'material',
                    label: '材料',
                    description: '所有材料的总称',
                    children: [
                        { id: 'alloy', label: '合金', description: '金属合金材料' },
                        { id: 'ceramic', label: '陶瓷', description: '陶瓷材料' },
                        { id: 'polymer', label: '高分子', description: '聚合物材料' },
                        { id: 'composite', label: '复合材料', description: '复合型材料' },
                        { id: 'semiconductor', label: '半导体', description: '半导体材料' },
                    ]
                },
                {
                    id: 'property',
                    label: '性能',
                    description: '材料性能',
                    children: [
                        { id: 'mechanical', label: '力学性能', description: '力学相关性能' },
                        { id: 'thermal', label: '热学性能', description: '热学相关性能' },
                        { id: 'electrical', label: '电学性能', description: '电学相关性能' },
                        { id: 'optical', label: '光学性能', description: '光学相关性能' },
                    ]
                },
                {
                    id: 'process',
                    label: '工艺',
                    description: '材料加工工艺',
                    children: [
                        { id: 'melting', label: '熔炼', description: '熔炼工艺' },
                        { id: 'casting', label: '铸造', description: '铸造工艺' },
                        { id: 'heat-treatment', label: '热处理', description: '热处理工艺' },
                        { id: 'sintering', label: '烧结', description: '烧结工艺' },
                    ]
                }
            ];
            setOntologyClasses(classes);
        }
        catch (error) {
            console.error('Failed to load ontology classes:', error);
        }
    };
    const handleCreateNewMaterial = () => {
        const newMaterial = {
            id: Date.now().toString(),
            name: `新材料-${materials.length + 1}`,
            type: 'alloy',
            lastModified: new Date().toISOString().split('T')[0],
            size: '0 KB'
        };
        setMaterials([newMaterial, ...materials]);
        setActiveTab('files');
    };
    const handleOpenMaterial = (materialId) => {
        console.log('Opening material:', materialId);
        // 这里应该触发打开文件的事件
    };
    const handleDeleteMaterial = (materialId) => {
        setMaterials(materials.filter(m => m.id !== materialId));
    };
    const toggleClassExpand = (classId) => {
        const newExpanded = new Set(expandedClasses);
        if (newExpanded.has(classId)) {
            newExpanded.delete(classId);
        }
        else {
            newExpanded.add(classId);
        }
        setExpandedClasses(newExpanded);
    };
    const renderOntologyTree = (classes, level = 0) => {
        return classes.map(cls => ((0, jsx_runtime_1.jsxs)("div", { className: "ontology-tree-node", children: [(0, jsx_runtime_1.jsxs)("div", { className: "tree-node-header", style: { paddingLeft: `${level * 20 + 10}px` }, onClick: () => toggleClassExpand(cls.id), children: [(0, jsx_runtime_1.jsx)("span", { className: "expand-icon", children: cls.children && ((0, jsx_runtime_1.jsx)("i", { className: `fas fa-chevron-${expandedClasses.has(cls.id) ? 'down' : 'right'}` })) }), (0, jsx_runtime_1.jsxs)("span", { className: `class-name ${selectedClass === cls.id ? 'selected' : ''}`, onClick: (e) => {
                                e.stopPropagation();
                                setSelectedClass(cls.id);
                            }, children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-cube" }), " ", cls.label] })] }), cls.children && expandedClasses.has(cls.id) && ((0, jsx_runtime_1.jsx)("div", { className: "tree-node-children", children: renderOntologyTree(cls.children, level + 1) }))] }, cls.id)));
    };
    const filteredMaterials = materials.filter(material => material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.type.toLowerCase().includes(searchTerm.toLowerCase()));
    return ((0, jsx_runtime_1.jsxs)("div", { className: "material-explorer", children: [(0, jsx_runtime_1.jsxs)("div", { className: "explorer-header", children: [(0, jsx_runtime_1.jsxs)("div", { className: "tab-buttons", children: [(0, jsx_runtime_1.jsxs)("button", { className: activeTab === 'files' ? 'active' : '', onClick: () => setActiveTab('files'), children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-file-alt" }), " \u6587\u4EF6"] }), (0, jsx_runtime_1.jsxs)("button", { className: activeTab === 'ontology' ? 'active' : '', onClick: () => setActiveTab('ontology'), children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-sitemap" }), " \u672C\u4F53"] }), (0, jsx_runtime_1.jsxs)("button", { className: activeTab === 'templates' ? 'active' : '', onClick: () => setActiveTab('templates'), children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-layer-group" }), " \u6A21\u677F"] })] }), (0, jsx_runtime_1.jsx)("button", { className: "new-material-btn", onClick: handleCreateNewMaterial, title: "\u521B\u5EFA\u65B0\u6750\u6599", children: (0, jsx_runtime_1.jsx)("i", { className: "fas fa-plus" }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "search-box", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: "\u641C\u7D22\u6750\u6599\u6216\u672C\u4F53\u6982\u5FF5...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value) }), (0, jsx_runtime_1.jsx)("i", { className: "fas fa-search" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "explorer-content", children: [activeTab === 'files' && ((0, jsx_runtime_1.jsxs)("div", { className: "files-view", children: [(0, jsx_runtime_1.jsxs)("div", { className: "file-list-header", children: [(0, jsx_runtime_1.jsx)("span", { children: "\u540D\u79F0" }), (0, jsx_runtime_1.jsx)("span", { children: "\u7C7B\u578B" }), (0, jsx_runtime_1.jsx)("span", { children: "\u4FEE\u6539\u65F6\u95F4" }), (0, jsx_runtime_1.jsx)("span", { children: "\u5927\u5C0F" }), (0, jsx_runtime_1.jsx)("span", { children: "\u64CD\u4F5C" })] }), (0, jsx_runtime_1.jsx)("div", { className: "file-list", children: filteredMaterials.map(material => ((0, jsx_runtime_1.jsxs)("div", { className: "file-item", children: [(0, jsx_runtime_1.jsxs)("div", { className: "file-icon", children: [material.type === 'alloy' && (0, jsx_runtime_1.jsx)("i", { className: "fas fa-cogs" }), material.type === 'ceramic' && (0, jsx_runtime_1.jsx)("i", { className: "fas fa-gem" }), material.type === 'polymer' && (0, jsx_runtime_1.jsx)("i", { className: "fas fa-water" }), material.type === 'composite' && (0, jsx_runtime_1.jsx)("i", { className: "fas fa-layer-group" })] }), (0, jsx_runtime_1.jsx)("span", { className: "file-name", children: material.name }), (0, jsx_runtime_1.jsx)("span", { className: "file-type", children: material.type }), (0, jsx_runtime_1.jsx)("span", { className: "file-date", children: material.lastModified }), (0, jsx_runtime_1.jsx)("span", { className: "file-size", children: material.size }), (0, jsx_runtime_1.jsxs)("div", { className: "file-actions", children: [(0, jsx_runtime_1.jsx)("button", { className: "action-btn open", onClick: () => handleOpenMaterial(material.id), title: "\u6253\u5F00", children: (0, jsx_runtime_1.jsx)("i", { className: "fas fa-folder-open" }) }), (0, jsx_runtime_1.jsx)("button", { className: "action-btn delete", onClick: () => handleDeleteMaterial(material.id), title: "\u5220\u9664", children: (0, jsx_runtime_1.jsx)("i", { className: "fas fa-trash" }) })] })] }, material.id))) })] })), activeTab === 'ontology' && ((0, jsx_runtime_1.jsxs)("div", { className: "ontology-view", children: [(0, jsx_runtime_1.jsxs)("div", { className: "ontology-info", children: [(0, jsx_runtime_1.jsxs)("h4", { children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-info-circle" }), " PMD \u672C\u4F53\u6D4F\u89C8\u5668"] }), (0, jsx_runtime_1.jsx)("p", { children: "\u57FA\u4E8E PMD Core Ontology \u7684\u6750\u6599\u6982\u5FF5\u5C42\u6B21\u7ED3\u6784" })] }), (0, jsx_runtime_1.jsx)("div", { className: "ontology-tree", children: renderOntologyTree(ontologyClasses) }), selectedClass && ((0, jsx_runtime_1.jsxs)("div", { className: "class-details", children: [(0, jsx_runtime_1.jsx)("h5", { children: "\u9009\u4E2D\u7684\u6982\u5FF5\u8BE6\u60C5" }), (() => {
                                        const findClass = (classes, id) => {
                                            for (const cls of classes) {
                                                if (cls.id === id)
                                                    return cls;
                                                if (cls.children) {
                                                    const found = findClass(cls.children, id);
                                                    if (found)
                                                        return found;
                                                }
                                            }
                                            return undefined;
                                        };
                                        const cls = findClass(ontologyClasses, selectedClass);
                                        return cls ? ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "\u6807\u7B7E:" }), " ", cls.label] }), (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "\u63CF\u8FF0:" }), " ", cls.description || '暂无描述'] }), (0, jsx_runtime_1.jsxs)("p", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "IRI:" }), " https://w3id.org/pmd/co/", cls.id] })] })) : null;
                                    })()] }))] })), activeTab === 'templates' && ((0, jsx_runtime_1.jsxs)("div", { className: "templates-view", children: [(0, jsx_runtime_1.jsxs)("div", { className: "template-category", children: [(0, jsx_runtime_1.jsxs)("h5", { children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-allergies" }), " \u5408\u91D1\u6A21\u677F"] }), (0, jsx_runtime_1.jsxs)("div", { className: "template-list", children: [(0, jsx_runtime_1.jsxs)("div", { className: "template-item", children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-cogs" }), (0, jsx_runtime_1.jsx)("span", { children: "\u9AD8\u71B5\u5408\u91D1" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "template-item", children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-cogs" }), (0, jsx_runtime_1.jsx)("span", { children: "\u4E0D\u9508\u94A2" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "template-item", children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-cogs" }), (0, jsx_runtime_1.jsx)("span", { children: "\u94DD\u5408\u91D1" })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "template-category", children: [(0, jsx_runtime_1.jsxs)("h5", { children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-gem" }), " \u9676\u74F7\u6A21\u677F"] }), (0, jsx_runtime_1.jsxs)("div", { className: "template-list", children: [(0, jsx_runtime_1.jsxs)("div", { className: "template-item", children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-gem" }), (0, jsx_runtime_1.jsx)("span", { children: "\u6C27\u5316\u7269\u9676\u74F7" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "template-item", children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-gem" }), (0, jsx_runtime_1.jsx)("span", { children: "\u6C2E\u5316\u7269\u9676\u74F7" })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "template-category", children: [(0, jsx_runtime_1.jsxs)("h5", { children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-water" }), " \u9AD8\u5206\u5B50\u6A21\u677F"] }), (0, jsx_runtime_1.jsxs)("div", { className: "template-list", children: [(0, jsx_runtime_1.jsxs)("div", { className: "template-item", children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-water" }), (0, jsx_runtime_1.jsx)("span", { children: "\u70ED\u5851\u6027\u5851\u6599" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "template-item", children: [(0, jsx_runtime_1.jsx)("i", { className: "fas fa-water" }), (0, jsx_runtime_1.jsx)("span", { children: "\u70ED\u56FA\u6027\u5851\u6599" })] })] })] })] }))] }), (0, jsx_runtime_1.jsx)("div", { className: "explorer-footer", children: (0, jsx_runtime_1.jsxs)("div", { className: "stats", children: [(0, jsx_runtime_1.jsxs)("span", { children: ["\u6750\u6599\u603B\u6570: ", materials.length] }), (0, jsx_runtime_1.jsxs)("span", { children: ["\u672C\u4F53\u7C7B: ", ontologyClasses.length] })] }) })] }));
};
exports.default = MaterialExplorer;
