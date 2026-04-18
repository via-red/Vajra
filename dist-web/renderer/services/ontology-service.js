"use strict";
// 本体服务 - 处理 PMD 本体加载和查询
Object.defineProperty(exports, "__esModule", { value: true });
exports.OntologyService = void 0;
class OntologyService {
    static instance;
    ontologyGraph = null; // RDF 图对象
    classes = new Map();
    properties = new Map();
    isLoaded = false;
    constructor() { }
    static getInstance() {
        if (!OntologyService.instance) {
            OntologyService.instance = new OntologyService();
        }
        return OntologyService.instance;
    }
    /**
     * 加载 PMD 核心本体
     */
    async loadCoreOntology() {
        if (this.isLoaded) {
            return;
        }
        try {
            // 在实际应用中，这里会使用 RDFlib 或其他 RDF 库加载本体
            // 暂时使用模拟数据
            await this.loadMockOntology();
            this.isLoaded = true;
            console.log('PMD Core Ontology loaded successfully');
        }
        catch (error) {
            console.error('Failed to load PMD Core Ontology:', error);
            throw error;
        }
    }
    /**
     * 查询本体
     * @param query SPARQL 查询字符串
     */
    async query(query) {
        if (!this.isLoaded) {
            await this.loadCoreOntology();
        }
        // 在实际应用中，这里会执行 SPARQL 查询
        // 暂时返回模拟结果
        return this.executeMockQuery(query);
    }
    /**
     * 获取材料相关的类
     */
    async getMaterialClasses() {
        const query = `
      SELECT ?class ?label WHERE {
        ?class rdfs:subClassOf* pmd:Material .
        ?class rdfs:label ?label .
      }
    `;
        const results = await this.query(query);
        return results.map((result) => ({
            id: this.extractLocalName(result.class),
            label: result.label,
            iri: result.class
        }));
    }
    /**
     * 获取特定类的子类
     */
    async getSubClasses(parentIri) {
        const query = `
      SELECT ?class ?label WHERE {
        ?class rdfs:subClassOf <${parentIri}> .
        ?class rdfs:label ?label .
      }
    `;
        const results = await this.query(query);
        return results.map((result) => ({
            id: this.extractLocalName(result.class),
            label: result.label,
            iri: result.class,
            parent: parentIri
        }));
    }
    /**
     * 根据标签搜索类
     */
    async searchClasses(searchTerm) {
        const query = `
      SELECT ?class ?label WHERE {
        ?class rdfs:label ?label .
        FILTER(CONTAINS(LCASE(?label), LCASE("${searchTerm}")))
      }
      LIMIT 20
    `;
        const results = await this.query(query);
        return results.map((result) => ({
            id: this.extractLocalName(result.class),
            label: result.label,
            iri: result.class
        }));
    }
    /**
     * 获取类的详细信息
     */
    async getClassDetails(classIri) {
        const query = `
      SELECT ?label ?comment WHERE {
        <${classIri}> rdfs:label ?label .
        OPTIONAL { <${classIri}> rdfs:comment ?comment }
      }
    `;
        const results = await this.query(query);
        if (results.length === 0) {
            return null;
        }
        return {
            id: this.extractLocalName(classIri),
            label: results[0].label,
            description: results[0].comment,
            iri: classIri
        };
    }
    /**
     * 验证材料数据是否符合本体约束
     */
    async validateMaterialData(materialData) {
        // 在实际应用中，这里会使用 SHACL 或其他验证机制
        // 暂时返回模拟验证结果
        return {
            valid: true,
            errors: [],
            warnings: ['数据验证功能待实现']
        };
    }
    /**
     * 将材料数据转换为 RDF 格式
     */
    async materialToRDF(materialData) {
        // 在实际应用中，这里会将材料数据转换为 RDF 三元组
        // 暂时返回模拟 RDF
        return `
      @prefix pmd: <https://w3id.org/pmd/co/> .
      @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
      
      <https://example.org/material/${materialData.designation}>
        a pmd:Material ;
        pmd:hasDesignation "${materialData.designation}" ;
        pmd:hasMaterialClass pmd:${materialData.class} .
    `;
    }
    // 私有方法
    async loadMockOntology() {
        // 模拟 PMDco 本体数据
        const mockClasses = [
            {
                id: 'Material',
                label: '材料',
                description: '所有材料的总称',
                iri: 'https://w3id.org/pmd/co/Material'
            },
            {
                id: 'Alloy',
                label: '合金',
                description: '金属合金材料',
                iri: 'https://w3id.org/pmd/co/Alloy',
                parent: 'https://w3id.org/pmd/co/Material'
            },
            {
                id: 'Ceramic',
                label: '陶瓷',
                description: '陶瓷材料',
                iri: 'https://w3id.org/pmd/co/Ceramic',
                parent: 'https://w3id.org/pmd/co/Material'
            },
            {
                id: 'Polymer',
                label: '高分子',
                description: '聚合物材料',
                iri: 'https://w3id.org/pmd/co/Polymer',
                parent: 'https://w3id.org/pmd/co/Material'
            },
            {
                id: 'Composite',
                label: '复合材料',
                description: '复合型材料',
                iri: 'https://w3id.org/pmd/co/Composite',
                parent: 'https://w3id.org/pmd/co/Material'
            },
            {
                id: 'HighEntropyAlloy',
                label: '高熵合金',
                description: '高熵合金材料',
                iri: 'https://w3id.org/pmd/co/HighEntropyAlloy',
                parent: 'https://w3id.org/pmd/co/Alloy'
            },
            {
                id: 'MaterialProperty',
                label: '材料性能',
                description: '材料性能',
                iri: 'https://w3id.org/pmd/co/MaterialProperty'
            },
            {
                id: 'Processing',
                label: '加工工艺',
                description: '材料加工工艺',
                iri: 'https://w3id.org/pmd/co/Processing'
            }
        ];
        const mockProperties = [
            {
                id: 'hasComposition',
                label: '具有组成',
                domain: 'https://w3id.org/pmd/co/Material',
                range: 'https://w3id.org/pmd/co/Composition',
                description: '关联材料与其化学组成'
            },
            {
                id: 'hasProperty',
                label: '具有性能',
                domain: 'https://w3id.org/pmd/co/Material',
                range: 'https://w3id.org/pmd/co/MaterialProperty',
                description: '关联材料与其性能'
            },
            {
                id: 'hasProcessing',
                label: '经过加工',
                domain: 'https://w3id.org/pmd/co/Material',
                range: 'https://w3id.org/pmd/co/Processing',
                description: '关联材料与其加工工艺'
            }
        ];
        mockClasses.forEach(cls => this.classes.set(cls.iri, cls));
        mockProperties.forEach(prop => this.properties.set(prop.id, prop));
    }
    executeMockQuery(query) {
        // 简单模拟 SPARQL 查询结果
        if (query.includes('pmd:Material')) {
            return [
                { class: 'https://w3id.org/pmd/co/Material', label: '材料' },
                { class: 'https://w3id.org/pmd/co/Alloy', label: '合金' },
                { class: 'https://w3id.org/pmd/co/Ceramic', label: '陶瓷' },
                { class: 'https://w3id.org/pmd/co/Polymer', label: '高分子' },
                { class: 'https://w3id.org/pmd/co/Composite', label: '复合材料' },
                { class: 'https://w3id.org/pmd/co/HighEntropyAlloy', label: '高熵合金' }
            ];
        }
        if (query.includes('CONTAINS')) {
            return [
                { class: 'https://w3id.org/pmd/co/Material', label: '材料' },
                { class: 'https://w3id.org/pmd/co/MaterialProperty', label: '材料性能' }
            ];
        }
        // 默认返回空结果
        return [];
    }
    extractLocalName(iri) {
        const parts = iri.split('#');
        if (parts.length > 1) {
            return parts[1];
        }
        const parts2 = iri.split('/');
        return parts2[parts2.length - 1];
    }
    // 公共状态检查
    isOntologyLoaded() {
        return this.isLoaded;
    }
    getClassCount() {
        return this.classes.size;
    }
    getPropertyCount() {
        return this.properties.size;
    }
}
exports.OntologyService = OntologyService;
