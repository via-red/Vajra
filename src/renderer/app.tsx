import React from 'react';
import ReactDOM from 'react-dom/client';
import { MaterialIDE } from './components/MaterialIDE';
import './styles.css';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <MaterialIDE />
  </React.StrictMode>
);

// 初始化 Monaco Editor
import { initializeMonaco } from './editor/monaco-setup';
initializeMonaco().then(() => {
  console.log('Monaco Editor initialized');
});