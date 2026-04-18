import React, { useState, useEffect } from 'react';
import { OntologyService } from '../services/ontology-service';

interface MaterialItem {
  id: string;
  name: string;
  type: 'alloy' | 'ceramic' | 'polymer' | 'composite' | 'other';
  lastModified: string;
  size: string;
}

interface OntologyClass {
  id: string;
  label: string;
  description?: string;
  children?: OntologyClass[];
}

const MaterialExplorer: React.FC = () => {
  const [materials, setMaterials] = useState<MaterialItem[]>([
    { id: '1', name: 'CoCrFeNiMn-HEA', type: 'alloy', lastModified: '2026-04-18', size: '2.3 KB' },
    { id: '2', name: 'Al2O3-Ceramic', type: 'ceramic', lastModified: '2026-04-17', size: '1.8 KB' },
    { id: '3', name: 'PET-Polymer', type: 'polymer', lastModified: '2026-04-16', size: '1.5 KB' },
    { id: '4', name: 'CFRP-Composite', type: 'composite', lastModified: '2026-04-15', size: '3.2 KB' },
  ]);

  const [ontologyClasses, setOntologyClasses] = useState<OntologyClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set(['material']));
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'files' | 'ontology' | 'templates'>('files');

  useEffect(() => {
    // 模拟加载本体类
    loadOntologyClasses();
  }, []);

  const loadOntologyClasses = async () => {
    try {
      // 这里应该从 OntologyService 获取实际数据
      // 暂时使用模拟数据
      const classes: OntologyClass[] = [
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
    } catch (error) {
      console.error('Failed to load ontology classes:', error);
    }
  };

  const handleCreateNewMaterial = () => {
    const newMaterial: MaterialItem = {
      id: Date.now().toString(),
      name: `新材料-${materials.length + 1}`,
      type: 'alloy',
      lastModified: new Date().toISOString().split('T')[0],
      size: '0 KB'
    };
    
    setMaterials([newMaterial, ...materials]);
    setActiveTab('files');
  };

  const handleOpenMaterial = (materialId: string) => {
    console.log('Opening material:', materialId);
    // 这里应该触发打开文件的事件
  };

  const handleDeleteMaterial = (materialId: string) => {
    setMaterials(materials.filter(m => m.id !== materialId));
  };

  const toggleClassExpand = (classId: string) => {
    const newExpanded = new Set(expandedClasses);
    if (newExpanded.has(classId)) {
      newExpanded.delete(classId);
    } else {
      newExpanded.add(classId);
    }
    setExpandedClasses(newExpanded);
  };

  const renderOntologyTree = (classes: OntologyClass[], level = 0) => {
    return classes.map(cls => (
      <div key={cls.id} className="ontology-tree-node">
        <div 
          className="tree-node-header"
          style={{ paddingLeft: `${level * 20 + 10}px` }}
          onClick={() => toggleClassExpand(cls.id)}
        >
          <span className="expand-icon">
            {cls.children && (
              <i className={`fas fa-chevron-${expandedClasses.has(cls.id) ? 'down' : 'right'}`}></i>
            )}
          </span>
          <span 
            className={`class-name ${selectedClass === cls.id ? 'selected' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedClass(cls.id);
            }}
          >
            <i className="fas fa-cube"></i> {cls.label}
          </span>
        </div>
        
        {cls.children && expandedClasses.has(cls.id) && (
          <div className="tree-node-children">
            {renderOntologyTree(cls.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  const filteredMaterials = materials.filter(material =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="material-explorer">
      <div className="explorer-header">
        <div className="tab-buttons">
          <button 
            className={activeTab === 'files' ? 'active' : ''}
            onClick={() => setActiveTab('files')}
          >
            <i className="fas fa-file-alt"></i> 文件
          </button>
          <button 
            className={activeTab === 'ontology' ? 'active' : ''}
            onClick={() => setActiveTab('ontology')}
          >
            <i className="fas fa-sitemap"></i> 本体
          </button>
          <button 
            className={activeTab === 'templates' ? 'active' : ''}
            onClick={() => setActiveTab('templates')}
          >
            <i className="fas fa-layer-group"></i> 模板
          </button>
        </div>
        
        <button 
          className="new-material-btn"
          onClick={handleCreateNewMaterial}
          title="创建新材料"
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="搜索材料或本体概念..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <i className="fas fa-search"></i>
      </div>

      <div className="explorer-content">
        {activeTab === 'files' && (
          <div className="files-view">
            <div className="file-list-header">
              <span>名称</span>
              <span>类型</span>
              <span>修改时间</span>
              <span>大小</span>
              <span>操作</span>
            </div>
            
            <div className="file-list">
              {filteredMaterials.map(material => (
                <div key={material.id} className="file-item">
                  <div className="file-icon">
                    {material.type === 'alloy' && <i className="fas fa-cogs"></i>}
                    {material.type === 'ceramic' && <i className="fas fa-gem"></i>}
                    {material.type === 'polymer' && <i className="fas fa-water"></i>}
                    {material.type === 'composite' && <i className="fas fa-layer-group"></i>}
                  </div>
                  <span className="file-name">{material.name}</span>
                  <span className="file-type">{material.type}</span>
                  <span className="file-date">{material.lastModified}</span>
                  <span className="file-size">{material.size}</span>
                  <div className="file-actions">
                    <button 
                      className="action-btn open"
                      onClick={() => handleOpenMaterial(material.id)}
                      title="打开"
                    >
                      <i className="fas fa-folder-open"></i>
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={() => handleDeleteMaterial(material.id)}
                      title="删除"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ontology' && (
          <div className="ontology-view">
            <div className="ontology-info">
              <h4>
                <i className="fas fa-info-circle"></i> PMD 本体浏览器
              </h4>
              <p>基于 PMD Core Ontology 的材料概念层次结构</p>
            </div>
            
            <div className="ontology-tree">
              {renderOntologyTree(ontologyClasses)}
            </div>
            
            {selectedClass && (
              <div className="class-details">
                <h5>选中的概念详情</h5>
                {(() => {
                  const findClass = (classes: OntologyClass[], id: string): OntologyClass | undefined => {
                    for (const cls of classes) {
                      if (cls.id === id) return cls;
                      if (cls.children) {
                        const found = findClass(cls.children, id);
                        if (found) return found;
                      }
                    }
                    return undefined;
                  };
                  
                  const cls = findClass(ontologyClasses, selectedClass);
                  return cls ? (
                    <div>
                      <p><strong>标签:</strong> {cls.label}</p>
                      <p><strong>描述:</strong> {cls.description || '暂无描述'}</p>
                      <p><strong>IRI:</strong> https://w3id.org/pmd/co/{cls.id}</p>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="templates-view">
            <div className="template-category">
              <h5><i className="fas fa-allergies"></i> 合金模板</h5>
              <div className="template-list">
                <div className="template-item">
                  <i className="fas fa-cogs"></i>
                  <span>高熵合金</span>
                </div>
                <div className="template-item">
                  <i className="fas fa-cogs"></i>
                  <span>不锈钢</span>
                </div>
                <div className="template-item">
                  <i className="fas fa-cogs"></i>
                  <span>铝合金</span>
                </div>
              </div>
            </div>
            
            <div className="template-category">
              <h5><i className="fas fa-gem"></i> 陶瓷模板</h5>
              <div className="template-list">
                <div className="template-item">
                  <i className="fas fa-gem"></i>
                  <span>氧化物陶瓷</span>
                </div>
                <div className="template-item">
                  <i className="fas fa-gem"></i>
                  <span>氮化物陶瓷</span>
                </div>
              </div>
            </div>
            
            <div className="template-category">
              <h5><i className="fas fa-water"></i> 高分子模板</h5>
              <div className="template-list">
                <div className="template-item">
                  <i className="fas fa-water"></i>
                  <span>热塑性塑料</span>
                </div>
                <div className="template-item">
                  <i className="fas fa-water"></i>
                  <span>热固性塑料</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="explorer-footer">
        <div className="stats">
          <span>材料总数: {materials.length}</span>
          <span>本体类: {ontologyClasses.length}</span>
        </div>
      </div>
    </div>
  );
};

export default MaterialExplorer;