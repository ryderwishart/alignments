// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import TextHighlighter from './TextHighlighter';
import './TextHighlighter.css';
import './index.css';

const App: React.FC = () => (
  <div className="App p-4">
    <TextHighlighter />
  </div>
);

ReactDOM.render(<App />, document.getElementById('root'));
