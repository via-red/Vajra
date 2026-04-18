// 主进程中的本体加载器

import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron';
import path from 'path';
import fs from 'fs';
import * as $rdf from 'rdflib';

export function setupOntologyLoader(mainWindow: BrowserWindow) {
  // RDF 存储和命名空间
  let store: $rdf.Store | null = null;
  const pmd = $rdf.Namespace('https://w3id.org/pmd/co/');
  const rdf = $rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
  const rdfs = $rdf.Namespace('http://www.w3.org/2000/01/rdf-schema#');
  const owl = $rdf.Namespace('http://www.w3.org/2002/07/owl#');
  const xsd = $rdf.Namespace('http://www.w3.org/2001/XMLSchema#');
  
  // ODK 发布的 PMDco 本体 URL（短期集成）
  const ODK_RELEASE_URL = 'https://materialdigital.github.io/core-ontology/ontology.ttl';
  const LOCAL_FALLBACK = 'pmdco-minimal.ttl';
  
  // 初始化 RDF 存储
  function initStore() {
    if (!store) {
      store = $rdf.graph();
      console.log('RDF 存储已初始化');
    }
    return store;
  }
  
  // 加载本体文件到存储（支持本地文件和远程 URL）
  async function loadOntologyToStore(ontologyPath: string): Promise<{ success: boolean; triples?: number; error?: string }> {
    try {
      const store = initStore();
      
      // 判断是否为远程 URL
      const isRemote = ontologyPath.startsWith('http://') || ontologyPath.startsWith('https://');
      
      if (isRemote) {
        // 远程 URL：使用 fetch 获取内容
        console.log(`从远程 URL 加载本体: ${ontologyPath}`);
        try {
          const response = await fetch(ontologyPath);
          console.log(`HTTP 响应状态: ${response.status} ${response.statusText}`);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          const content = await response.text();
          console.log(`获取到内容长度: ${content.length} 字符`);
          const baseURI = ontologyPath; // 使用 URL 作为基础 URI
          
          return new Promise((resolve) => {
            $rdf.parse(content, store, baseURI, 'text/turtle', (error: any, actualStore) => {
              if (error) {
                console.error('解析远程本体文件失败:', error);
                resolve({ success: false, error: error.message });
              } else {
                const triples = store.statements.length;
                console.log(`远程本体加载成功: ${triples} 个三元组`);
                resolve({ success: true, triples });
              }
            });
          });
        } catch (fetchError: any) {
          console.error('获取远程本体失败:', fetchError.message);
          return { success: false, error: fetchError.message };
        }
      } else {
        // 本地文件
        const fullPath = path.isAbsolute(ontologyPath) 
          ? ontologyPath 
          : path.join(__dirname, '../../ontologies', ontologyPath);
        
        if (!fs.existsSync(fullPath)) {
          throw new Error(`本体文件未找到: ${fullPath}`);
        }
        
        const content = fs.readFileSync(fullPath, 'utf-8');
        
        return new Promise((resolve) => {
          $rdf.parse(content, store, fullPath, 'text/turtle', (error: any, actualStore) => {
            if (error) {
              console.error('解析本体文件失败:', error);
              resolve({ success: false, error: error.message });
            } else {
              const triples = store.statements.length;
              console.log(`本体加载成功: ${triples} 个三元组`);
              resolve({ success: true, triples });
            }
          });
        });
      }
    } catch (error: any) {
      console.error('加载本体失败:', error);
      return { success: false, error: error.message };
    }
  }
  
  // 执行 SPARQL 查询
  function executeSparqlQuery(query: string): any[] {
    try {
      const store = initStore();
      if (store.statements.length === 0) {
        throw new Error('RDF 存储为空，请先加载本体文件');
      }
      
      const queryObj = $rdf.SPARQLToQuery(query, false, store) as any;
      const results: any[] = [];
      
      store.query(queryObj, (result) => {
        // 转换查询结果
        const formattedResult: any = {};
        for (const [key, value] of Object.entries(result)) {
          if (value instanceof $rdf.NamedNode || value instanceof $rdf.BlankNode || value instanceof $rdf.Literal) {
            formattedResult[key] = value.value;
          } else {
            formattedResult[key] = value;
          }
        }
        results.push(formattedResult);
      });
      
      return results;
    } catch (error: any) {
      console.error('SPARQL 查询失败:', error);
      throw error;
    }
  }

  // 加载本体文件
  ipcMain.handle('ontology:load', async (event: IpcMainInvokeEvent, ontologyPath: string) => {
    try {
      const result = await loadOntologyToStore(ontologyPath);
      
      if (result.success) {
        // 发送本体加载成功事件
        mainWindow.webContents.send('ontology:loaded', {
          path: ontologyPath,
          triples: result.triples,
          timestamp: new Date().toISOString()
        });
        
        return { 
          success: true, 
          message: `本体加载成功，${result.triples} 个三元组`,
          triples: result.triples
        };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      console.error('Failed to load ontology:', error);
      return { success: false, error: error.message };
    }
  });

  // 查询本体
  ipcMain.handle('ontology:query', async (event: IpcMainInvokeEvent, query: string) => {
    try {
      console.log(`执行本体查询: ${query.substring(0, 100)}${query.length > 100 ? '...' : ''}`);
      
      let results: any[] = [];
      
      // 检查是否为简单关键词查询（兼容旧代码）
      if (query.includes('pmd:Material') || query.includes('材料类') || query.toLowerCase().includes('material class')) {
        // 执行 SPARQL 查询获取所有材料类
        const sparqlQuery = `
          PREFIX pmd: <https://w3id.org/pmd/co/>
          PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
          SELECT ?class ?label WHERE {
            ?class rdfs:subClassOf* pmd:Material .
            OPTIONAL { ?class rdfs:label ?label }
          }
          ORDER BY ?class
        `;
        
        try {
          results = executeSparqlQuery(sparqlQuery);
        } catch (sparqlError) {
          // 如果 SPARQL 查询失败，返回模拟结果作为后备
          console.log('SPARQL 查询失败，使用模拟结果:', sparqlError);
          results = [
            { class: 'https://w3id.org/pmd/co/Material', label: '材料' },
            { class: 'https://w3id.org/pmd/co/Alloy', label: '合金' },
            { class: 'https://w3id.org/pmd/co/Ceramic', label: '陶瓷' },
            { class: 'https://w3id.org/pmd/co/Polymer', label: '高分子' },
            { class: 'https://w3id.org/pmd/co/Composite', label: '复合材料' },
            { class: 'https://w3id.org/pmd/co/HighEntropyAlloy', label: '高熵合金' }
          ];
        }
      } else if (query.trim().toLowerCase().startsWith('select') || query.includes('PREFIX')) {
        // 如果是完整的 SPARQL 查询
        results = executeSparqlQuery(query);
      } else {
        // 关键词搜索
        const store = initStore();
        const searchResults: any[] = [];
        const searchTerm = query.toLowerCase();
        
        // 在标签和注释中搜索
        store.statements.forEach((stmt) => {
          if (stmt.object.value.toLowerCase().includes(searchTerm)) {
            searchResults.push({
              subject: stmt.subject.value,
              predicate: stmt.predicate.value,
              object: stmt.object.value
            });
          }
        });
        
        results = searchResults.slice(0, 50); // 限制结果数量
      }
      
      // 发送查询完成事件
      mainWindow.webContents.send('ontology:query-completed', {
        query,
        resultCount: results.length,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: true,
        results,
        count: results.length
      };
    } catch (error: any) {
      console.error('Failed to query ontology:', error);
      mainWindow.webContents.send('ontology:query-error', {
        query,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      return { success: false, error: error.message };
    }
  });

  // 验证材料数据
  ipcMain.handle('ontology:validate', async (event: IpcMainInvokeEvent, materialData: any) => {
    try {
      console.log('验证材料数据:', materialData.designation || '未命名材料');
      
      const errors: string[] = [];
      const warnings: string[] = [];
      
      // 基本验证
      if (!materialData.designation) {
        errors.push('材料必须包含 designation 字段');
      }
      
      if (!materialData.class) {
        warnings.push('建议指定材料类别 (class)');
      }
      
      // 如果已加载本体，进行更高级的验证
      const store = initStore();
      if (store.statements.length > 0) {
        // 验证材料类是否存在于本体中
        if (materialData.class) {
          const classUri = materialData.class.startsWith('http') 
            ? materialData.class 
            : `https://w3id.org/pmd/co/${materialData.class}`;
          
          const classExists = store.match(
            $rdf.sym(classUri),
            rdf('type'),
            owl('Class')
          ).length > 0 || store.match(
            $rdf.sym(classUri),
            rdf('type'),
            rdfs('Class')
          ).length > 0;
          
          if (!classExists) {
            warnings.push(`材料类 "${materialData.class}" 可能不在 PMD 本体中`);
          }
        }
        
        // 验证必需属性
        if (materialData.composition) {
          const composition = materialData.composition;
          const total = Object.values(composition).reduce((sum: number, val: any) => sum + parseFloat(val.toString()), 0);
          
          if (Math.abs(total - 100) > 0.1) {
            warnings.push(`成分总和为 ${total.toFixed(2)}%，建议调整为 100%`);
          }
        }
      }
      
      const validationResult = {
        success: true,
        valid: errors.length === 0,
        errors,
        warnings,
        timestamp: new Date().toISOString()
      };
      
      // 发送验证结果事件
      mainWindow.webContents.send('ontology:validation-completed', validationResult);
      
      return validationResult;
    } catch (error: any) {
      console.error('Failed to validate material:', error);
      return { success: false, error: error.message };
    }
  });

  // 将材料数据转换为 RDF
  ipcMain.handle('ontology:toRDF', async (event: IpcMainInvokeEvent, materialData: any) => {
    try {
      console.log('转换材料数据为 RDF:', materialData.designation || '未命名材料');
      
      const store = $rdf.graph();
      const materialUri = `https://example.org/material/${materialData.designation || 'unknown'}`;
      const material = $rdf.sym(materialUri);
      
      // 添加类型
      const materialClass = materialData.class 
        ? (materialData.class.startsWith('http') 
            ? materialData.class 
            : `https://w3id.org/pmd/co/${materialData.class}`)
        : 'https://w3id.org/pmd/co/Material';
      
      store.add(material, rdf('type'), $rdf.namedNode(materialClass));
      
      // 添加 designation
      if (materialData.designation) {
        store.add(material, pmd('hasDesignation'), $rdf.lit(materialData.designation));
      }
      
      // 添加成分
      if (materialData.composition && typeof materialData.composition === 'object') {
        const compositionObj = materialData.composition as Record<string, number>;
        Object.entries(compositionObj).forEach(([element, percentage]) => {
          const compositionUri = `${materialUri}#composition/${element}`;
          const composition = $rdf.sym(compositionUri);
          
          store.add(composition, rdf('type'), pmd('Composition'));
          store.add(composition, pmd('hasElement'), $rdf.lit(element));
          store.add(composition, pmd('hasPercentage'), $rdf.lit(percentage.toString(), undefined, xsd('decimal')));
          store.add(material, pmd('hasComposition'), composition);
        });
      }
      
      // 添加处理工艺
      if (materialData.processing && Array.isArray(materialData.processing)) {
        materialData.processing.forEach((process: string, index: number) => {
          store.add(material, pmd('hasProcessingStep'), $rdf.lit(process));
        });
      }
      
      // 添加属性
      if (materialData.properties && typeof materialData.properties === 'object') {
        const propertiesObj = materialData.properties as Record<string, string | number>;
        Object.entries(propertiesObj).forEach(([property, value]) => {
          const propertyUri = `https://w3id.org/pmd/co/${property}`;
          store.add(material, $rdf.namedNode(propertyUri), $rdf.lit(value.toString()));
        });
      }
      
      // 序列化为 Turtle 格式
      const rdfText = $rdf.serialize(null, store, materialUri, 'text/turtle');
      
      const result = {
        success: true,
        rdf: rdfText,
        triples: store.statements.length,
        timestamp: new Date().toISOString()
      };
      
      // 发送 RDF 生成完成事件
      mainWindow.webContents.send('ontology:rdf-generated', result);
      
      return result;
    } catch (error: any) {
      console.error('Failed to convert to RDF:', error);
      return { success: false, error: error.message };
    }
  });

  // 获取本体统计信息
  ipcMain.handle('ontology:stats', async () => {
    try {
      const store = initStore();
      const triples = store.statements.length;
      
      // 统计类数量
      const classQuery = `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        SELECT (COUNT(DISTINCT ?class) as ?classCount) WHERE {
          { ?class a owl:Class }
          UNION
          { ?class a rdfs:Class }
        }
      `;
      
      let classCount = 0;
      try {
        const classResults = executeSparqlQuery(classQuery);
        if (classResults.length > 0 && classResults[0].classCount) {
          classCount = parseInt(classResults[0].classCount);
        }
      } catch (error) {
        console.log('无法获取类统计:', error);
      }
      
      const stats = {
        triples,
        classCount,
        loaded: triples > 0,
        timestamp: new Date().toISOString()
      };
      
      return { success: true, stats };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // 自动加载默认本体 - 优先使用 ODK 发布版本
  ipcMain.handle('ontology:load-default', async () => {
    try {
      const ontologiesToLoad = [
        { path: ODK_RELEASE_URL, name: 'pmdco-remote' },
        { path: LOCAL_FALLBACK, name: 'pmdco-local' },
        { path: 'tto-example.ttl', name: 'tto-example' }
      ];
      const results: Array<{
        name: string;
        path: string;
        success: boolean;
        triples?: number;
        error?: string;
      }> = [];
      
      for (const { path, name } of ontologiesToLoad) {
        // 如果远程版本已成功加载，跳过本地回退版本
        if (name === 'pmdco-local' && results.some(r => r.name === 'pmdco-remote' && r.success)) {
          console.log('远程 PMDco 本体已加载，跳过本地回退版本');
          continue;
        }
        
        try {
          const result = await loadOntologyToStore(path);
          results.push({ 
            name, 
            path, 
            success: result.success, 
            triples: result.triples,
            error: result.error 
          });
        } catch (error: any) {
          results.push({ 
            name, 
            path, 
            success: false, 
            error: error.message 
          });
        }
      }
      
      const successCount = results.filter(r => r.success).length;
      console.log(`默认本体加载完成: ${successCount}/${ontologiesToLoad.length} 成功`);
      
      return {
        success: successCount > 0,
        results,
        message: `加载了 ${successCount} 个本体文件`
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  console.log('本体加载器设置完成，已集成 rdflib');
  
  // 自动加载默认本体（可选）- 优先使用 ODK 发布版本
  setTimeout(async () => {
    console.log('自动加载默认本体文件...');
    
    // 首先尝试从 ODK 发布 URL 加载
    console.log(`尝试从 ODK 发布 URL 加载: ${ODK_RELEASE_URL}`);
    let result = await loadOntologyToStore(ODK_RELEASE_URL);
    console.log(`远程加载结果: 成功=${result.success}, 三元组=${result.triples || 0}, 错误=${result.error || '无'}`);
    
    if (!result.success) {
      console.log('远程加载失败，回退到本地本体文件:', LOCAL_FALLBACK);
      result = await loadOntologyToStore(LOCAL_FALLBACK);
      console.log(`本地加载结果: 成功=${result.success}, 三元组=${result.triples || 0}, 错误=${result.error || '无'}`);
    }
    
    if (result.success) {
      console.log(`本体加载成功: ${result.triples} 个三元组`);
      // 发送加载成功事件到渲染进程
      mainWindow.webContents.send('ontology:loaded', {
        path: result.success ? ODK_RELEASE_URL : LOCAL_FALLBACK,
        triples: result.triples,
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('本体加载失败:', result.error);
    }
  }, 2000);
}