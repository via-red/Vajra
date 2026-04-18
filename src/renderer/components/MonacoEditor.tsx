import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as monaco from 'monaco-editor';

// 材料类定义
interface MaterialClass {
  class: string;
  label?: string;
}

// 本体属性
interface OntologyProperty {
  property: string;
  label?: string;
  range?: string;
  description?: string;
}

interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({ 
  value, 
  onChange, 
  language = 'yaml',
  height = '100%'
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  
  // 本体数据引用
  const materialClassesRef = useRef<MaterialClass[]>([]);
  const ontologyPropertiesRef = useRef<OntologyProperty[]>([]);
  const chemicalElementsRef = useRef<string[]>([
    'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne',
    'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca',
    'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn',
    'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr', 'Rb', 'Sr', 'Y', 'Zr',
    'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn',
    'Sb', 'Te', 'I', 'Xe', 'Cs', 'Ba', 'La', 'Ce', 'Pr', 'Nd',
    'Pm', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy', 'Ho', 'Er', 'Tm', 'Yb',
    'Lu', 'Hf', 'Ta', 'W', 'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg',
    'Tl', 'Pb', 'Bi', 'Po', 'At', 'Rn', 'Fr', 'Ra', 'Ac', 'Th',
    'Pa', 'U', 'Np', 'Pu', 'Am', 'Cm', 'Bk', 'Cf', 'Es', 'Fm',
    'Md', 'No', 'Lr', 'Rf', 'Db', 'Sg', 'Bh', 'Hs', 'Mt', 'Ds',
    'Rg', 'Cn', 'Nh', 'Fl', 'Mc', 'Lv', 'Ts', 'Og'
  ]);

  // 加载本体数据
  const loadOntologyData = useCallback(async () => {
    try {
      if (!window.electronAPI) {
        console.warn('electronAPI 不可用，使用默认本体数据');
        return;
      }
      
      console.log('加载本体数据...');
      
      // 加载材料类
      try {
        const classResult = await window.electronAPI.queryOntology('pmd:Material');
        if (classResult.success && classResult.results) {
          materialClassesRef.current = classResult.results;
          console.log(`加载了 ${materialClassesRef.current.length} 个材料类`);
        }
      } catch (error) {
        console.error('加载材料类失败:', error);
      }
      
      // 加载本体属性（示例查询）
      try {
        const propertyQuery = `
          PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
          PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
          PREFIX owl: <http://www.w3.org/2002/07/owl#>
          SELECT ?property ?label ?comment WHERE {
            ?property a owl:ObjectProperty .
            OPTIONAL { ?property rdfs:label ?label }
            OPTIONAL { ?property rdfs:comment ?comment }
          }
          LIMIT 50
        `;
        
        const propertyResult = await window.electronAPI.queryOntology(propertyQuery);
        if (propertyResult.success && propertyResult.results) {
          ontologyPropertiesRef.current = propertyResult.results.map((r: any) => ({
            property: r.property,
            label: r.label,
            description: r.comment
          }));
          console.log(`加载了 ${ontologyPropertiesRef.current.length} 个本体属性`);
        }
      } catch (error) {
        console.error('加载本体属性失败:', error);
      }
      
    } catch (error) {
      console.error('加载本体数据失败:', error);
    }
  }, []);

  // 注册材料语言
  const registerMaterialLanguage = useCallback(() => {
    try {
      // 检查是否已注册
      const languages = monaco.languages.getLanguages();
      const isAlreadyRegistered = languages.some(lang => lang.id === 'material');
      
      if (isAlreadyRegistered) {
        console.log('material语言已注册，跳过重复注册');
        return;
      }
      
      // 定义 .mat 文件的语言配置
      monaco.languages.register({ id: 'material' });
      
      // 语法高亮 - 简化版本避免Monarch错误
      monaco.languages.setMonarchTokensProvider('material', {
        defaultToken: '',
        tokenPostfix: '.material',
        
        // 简化关键词列表
        keywords: [
          'material', 'designation', 'class', 'composition',
          'element', 'amount', 'unit', 'processing', 'type', 'parameters',
          'temperature', 'atmosphere', 'cooling', 'properties', 'value',
          'method', 'workflow', 'id', 'steps'
        ],
        
        tokenizer: {
          root: [
            // 注释
            [/#.*$/, 'comment'],
            
            // 上下文声明 - 简化处理
            [/\@context\b/, 'keyword'],
            
            // 顶级关键词
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
            
            // 字符串
            [/"([^"\\]|\\.)*$/, 'string.invalid'],  // 非终止字符串
            [/"([^"\\]|\\.)*"/, 'string'],
            [/'([^'\\]|\\.)*$/, 'string.invalid'],  // 非终止字符串
            [/'([^'\\]|\\.)*'/, 'string'],
            
            // 数字
            [/\d+(\.\d+)?/, 'number'],
            
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
    } catch (error) {
      console.error('注册material语言失败，使用YAML作为后备:', error);
      // 如果注册失败，我们仍然可以使用YAML语言
      return;
    }
    
    // 自动补全
    monaco.languages.registerCompletionItemProvider('material', {
      triggerCharacters: [':', '.', '@'],
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };
        
        // 构建建议列表
        const suggestions: monaco.languages.CompletionItem[] = [];
        
        // 材料类建议
        materialClassesRef.current.forEach(cls => {
          suggestions.push({
            label: `material:${cls.class}`,
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: `material:${cls.class}`,
            range: range,
            detail: cls.label ? `材料类: ${cls.label}` : `材料类`
          });
        });
        
        // 元素符号建议
        chemicalElementsRef.current.forEach(element => {
          suggestions.push({
            label: element,
            kind: monaco.languages.CompletionItemKind.Value,
            insertText: element,
            range: range,
            detail: '化学元素'
          });
        });
        
        // 本体属性建议
        ontologyPropertiesRef.current.forEach(prop => {
          suggestions.push({
            label: `property:${prop.property.split('#').pop() || prop.property.split('/').pop()}`,
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: `property:${prop.property.split('#').pop() || prop.property.split('/').pop()}`,
            range: range,
            detail: prop.label || '本体属性'
          });
        });
        
        // 关键字建议
        const keywords = [
          '@context:', 'material:', 'designation:', 'class:', 'composition:',
          'element:', 'amount:', 'unit:', 'processing:', 'type:', 'parameters:',
          'temperature:', 'atmosphere:', 'cooling:', 'properties:', 'value:',
          'method:', 'workflow:', 'id:', 'steps:'
        ];
        
        keywords.forEach(keyword => {
          suggestions.push({
            label: keyword,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: keyword,
            range: range
          });
        });
        
        return { suggestions };
      }
    });
    
    // 悬停提示
    monaco.languages.registerHoverProvider('material', {
      provideHover: (model, position) => {
        const word = model.getWordAtPosition(position);
        if (!word) return null;
        
        const wordText = word.word;
        
        // 检查是否是材料类
        const materialClass = materialClassesRef.current.find(cls => 
          cls.class.includes(wordText) || `material:${cls.class}` === wordText
        );
        
        if (materialClass) {
          return {
            contents: [
              { value: `**材料类**: ${materialClass.class}` },
              { value: materialClass.label ? `**标签**: ${materialClass.label}` : '' }
            ]
          };
        }
        
        // 检查是否是化学元素
        if (chemicalElementsRef.current.includes(wordText)) {
          return {
            contents: [
              { value: `**化学元素**: ${wordText}` }
            ]
          };
        }
        
        // 检查是否是本体属性
        const ontologyProperty = ontologyPropertiesRef.current.find(prop => 
          prop.property.includes(wordText) || `property:${prop.property.split('#').pop() || prop.property.split('/').pop()}` === wordText
        );
        
        if (ontologyProperty) {
          return {
            contents: [
              { value: `**本体属性**: ${ontologyProperty.property.split('#').pop() || ontologyProperty.property.split('/').pop()}` },
              { value: ontologyProperty.label ? `**标签**: ${ontologyProperty.label}` : '' },
              { value: ontologyProperty.description ? `**描述**: ${ontologyProperty.description}` : '' }
            ]
          };
        }
        
        return null;
      }
    });
  }, []);

  useEffect(() => {
    if (editorRef.current && !editorInstanceRef.current) {
      try {
        // 创建编辑器实例
        const editor = monaco.editor.create(editorRef.current, {
          value,
          language: language === 'material' ? 'yaml' : language, // 如果material语言有问题，使用yaml作为后备
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
          tabSize: 2,
          quickSuggestions: true,
          suggest: {
            showProperties: true,
            showFunctions: true,
            showVariables: true,
            showClasses: true
          }
        });

        // 监听内容变化
        editor.onDidChangeModelContent(() => {
          const newValue = editor.getValue();
          onChange(newValue);
        });

        editorInstanceRef.current = editor;

        // 注册自定义语言（材料文件）
        try {
          registerMaterialLanguage();
        } catch (langError) {
          console.error('注册material语言失败，继续使用YAML:', langError);
        }
        
        // 加载本体数据（后台进行）
        loadOntologyData();
      } catch (error) {
        console.error('创建Monaco编辑器失败:', error);
        // 创建后备编辑器或显示错误消息
        editorRef.current.innerHTML = '<div style="padding: 20px; color: #ccc;">编辑器初始化失败: ' + (error as Error).message + '</div>';
      }
    }

    return () => {
      if (editorInstanceRef.current) {
        editorInstanceRef.current.dispose();
        editorInstanceRef.current = null;
      }
    };
  }, [registerMaterialLanguage, loadOntologyData]);

  // 更新编辑器内容
  useEffect(() => {
    if (editorInstanceRef.current && editorInstanceRef.current.getValue() !== value) {
      editorInstanceRef.current.setValue(value);
    }
  }, [value]);

  // 更新语言
  useEffect(() => {
    if (editorInstanceRef.current) {
      try {
        const model = editorInstanceRef.current.getModel();
        if (model) {
          // 如果material语言有问题，使用yaml作为后备
          const safeLanguage = language === 'material' ? 'yaml' : language;
          monaco.editor.setModelLanguage(model, safeLanguage);
        }
      } catch (error) {
        console.error('更新编辑器语言失败:', error);
      }
    }
  }, [language]);

  const style = {
    height,
    width: '100%',
    border: '1px solid #333',
    borderRadius: '4px'
  };

  return <div ref={editorRef} style={style} />;
};

export default MonacoEditor;