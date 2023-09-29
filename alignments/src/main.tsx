// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import TextHighlighter from './TextHighlighter';
import './TextHighlighter.css';
import './index.css';

// const App: React.FC = () => (
//   <div className="App p-4">
//     <TextHighlighter />
//   </div>
// );
const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <div className="App p-4">
    <TextHighlighter />
  </div>,
);
