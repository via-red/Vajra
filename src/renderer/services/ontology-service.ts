// 本体服务 - 处理 PMD 本体加载和查询

export interface OntologyClass {
  id: string;
  label: string;
  description?: string;
  iri: string;
  parent?: string;
  children?: OntologyClass[];
}

export interface OntologyProperty {
  id: string;
  label: string;
  domain: string;
  range: string;
  description?: string;
}

export class OntologyService {
  private static instance: OntologyService;
  private classes: Map<string, OntologyClass> = new Map();
  private properties: Map<string, OntologyProperty> = new Map();
  private isLoaded: boolean = false;
  private autoLoaded: boolean = false;
  private autoLoadListenerSet: boolean = false;

  private constructor() {}

  public static getInstance(): OntologyService {
    if (!OntologyService.instance) {
      OntologyService.instance = new OntologyService();
    }
    return OntologyService.instance;
  }

  /**
   * 加载 PMD 核心本体
   */
  public async loadCoreOntology(): Promise<void> {
    if (this.isLoaded) {
      return;
    }

    // 设置自动加载事件监听器（仅一次）
    if (!this.autoLoadListenerSet && window.electronAPI?.onOntologyLoaded) {
      this.autoLoadListenerSet = true;
      window.electronAPI.onOntologyLoaded((event, data) => {
        console.log('收到本体自动加载事件:', data);
        this.autoLoaded = true;
        this.isLoaded = true;
        // 可以在这里初始化缓存，但等待查询时再初始化也可以
      });
    }

    try {
      console.log('加载 PMD 核心本体...');
      
      // 通过主进程加载本体
      if (window.electronAPI?.loadOntology) {
        const result = await window.electronAPI.loadOntology('pmdco-minimal.ttl');
        
        if (result.success) {
          console.log(`本体加载成功: ${result.triples || 0} 个三元组`);
          
          // 从主进程获取本体统计信息以初始化本地缓存
          await this.initializeFromLoadedOntology();
          
          this.isLoaded = true;
          console.log('PMD Core Ontology 加载完成');
        } else {
          throw new Error(`本体加载失败: ${result.error || '未知错误'}`);
        }
      } else {
        // 没有 electronAPI，使用模拟数据
        console.log('没有可用的 electronAPI，使用模拟本体数据');
        await this.loadMockOntology();
        this.isLoaded = true;
      }
    } catch (error) {
      console.error('Failed to load PMD Core Ontology:', error);
      // 如果加载失败，回退到模拟数据
      console.log('回退到模拟本体数据...');
      await this.loadMockOntology();
      this.isLoaded = true;
    }
  }

  /**
   * 从已加载的本体初始化本地缓存
   */
  private async initializeFromLoadedOntology(): Promise<void> {
    try {
      // 清空现有数据
      this.classes.clear();
      this.properties.clear();
      
      // 查询所有材料类来初始化缓存
      const materialClasses = await this.getMaterialClasses();
      for (const cls of materialClasses) {
        this.classes.set(cls.iri, cls);
      }
      
      console.log(`本体缓存初始化完成: ${this.classes.size} 个类`);
    } catch (error) {
      console.error('初始化本体缓存失败:', error);
    }
  }

  /**
   * 查询本体
   * @param query SPARQL 查询字符串
   */
  public async query(query: string): Promise<any[]> {
    if (!this.isLoaded) {
      await this.loadCoreOntology();
    }

    // 如果有 electronAPI，使用主进程查询
    if (window.electronAPI?.queryOntology) {
      try {
        const result = await window.electronAPI.queryOntology(query);
        if (result.success && result.results) {
          return result.results;
        } else {
          console.warn('本体查询失败，使用模拟查询:', result.error);
          return this.executeMockQuery(query);
        }
      } catch (error) {
        console.error('本体查询异常:', error);
        return this.executeMockQuery(query);
      }
    }
    
    // 没有 electronAPI，使用模拟查询
    return this.executeMockQuery(query);
  }

  /**
   * 获取材料相关的类
   */
  public async getMaterialClasses(): Promise<OntologyClass[]> {
    const query = `
      SELECT ?class ?label WHERE {
        ?class rdfs:subClassOf* pmd:Material .
        ?class rdfs:label ?label .
      }
    `;
    
    const results = await this.query(query);
    return results.map((result: any) => ({
      id: this.extractLocalName(result.class),
      label: result.label,
      iri: result.class
    }));
  }

  /**
   * 获取特定类的子类
   */
  public async getSubClasses(parentIri: string): Promise<OntologyClass[]> {
    const query = `
      SELECT ?class ?label WHERE {
        ?class rdfs:subClassOf <${parentIri}> .
        ?class rdfs:label ?label .
      }
    `;
    
    const results = await this.query(query);
    return results.map((result: any) => ({
      id: this.extractLocalName(result.class),
      label: result.label,
      iri: result.class,
      parent: parentIri
    }));
  }

  /**
   * 根据标签搜索类
   */
  public async searchClasses(searchTerm: string): Promise<OntologyClass[]> {
    const query = `
      SELECT ?class ?label WHERE {
        ?class rdfs:label ?label .
        FILTER(CONTAINS(LCASE(?label), LCASE("${searchTerm}")))
      }
      LIMIT 20
    `;
    
    const results = await this.query(query);
    return results.map((result: any) => ({
      id: this.extractLocalName(result.class),
      label: result.label,
      iri: result.class
    }));
  }

  /**
   * 获取类的详细信息
   */
  public async getClassDetails(classIri: string): Promise<OntologyClass | null> {
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
  public async validateMaterialData(materialData: any): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
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
  public async materialToRDF(materialData: any): Promise<string> {
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

  private async loadMockOntology(): Promise<void> {
    // 模拟 PMDco 本体数据
    const mockClasses: OntologyClass[] = [
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

    const mockProperties: OntologyProperty[] = [
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

  private executeMockQuery(query: string): any[] {
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

  private extractLocalName(iri: string): string {
    const parts = iri.split('#');
    if (parts.length > 1) {
      return parts[1];
    }
    
    const parts2 = iri.split('/');
    return parts2[parts2.length - 1];
  }

  // 公共状态检查
  public isOntologyLoaded(): boolean {
    return this.isLoaded;
  }

  public getClassCount(): number {
    return this.classes.size;
  }

  public getPropertyCount(): number {
    return this.properties.size;
  }
}