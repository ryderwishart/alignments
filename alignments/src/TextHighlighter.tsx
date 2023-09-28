import './TextHighlighter.css';

import React, { useState, useEffect } from 'react';
import Highlighter from 'react-highlight-words';

const TextHighlighter: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [activePhrase, setActivePhrase] = useState<string>('');

  useEffect(() => {
    fetch('/data.jsonl')
      .then(response => response.text())
      .then(text => {
        const lines = text.split('\n').filter(line => line);
        const jsonData = lines.map(line => JSON.parse(line));
        setData(jsonData);
      });
  }, []);

  const handlePhraseHover = (phrase: string) => {
    setActivePhrase(phrase);
  };

  return (
    <div>
      {data.map((item, index) => (
        <div key={index} className="text-block">
          <div className="english">
            {item.alignment.map((alignment: any, aIdx: number) => (
              <span
                key={aIdx}
                onMouseEnter={() => {
                  handlePhraseHover(alignment['English phrase']['original-text-value']);
                  handlePhraseHover(alignment['bsb']['original-text-value']);
                  handlePhraseHover(alignment['macula']['original-text-value']);
                  handlePhraseHover(alignment['target']['original-text-value']);
                }}
                onMouseLeave={() => handlePhraseHover('')}
              >
                {alignment['English phrase']['original-text-value']}
              </span>
            ))}
          </div>
          <div className="bsb">
            <Highlighter
              highlightClassName="highlight"
              searchWords={[activePhrase]}
              autoEscape={true}
              textToHighlight={item.bsb.content}
            />
          </div>
          <div className="macula">
            <Highlighter
              highlightClassName="highlight"
              searchWords={[activePhrase]}
              autoEscape={true}
              textToHighlight={item.macula.content}
            />
          </div>
          <div className="target">
            <Highlighter
              highlightClassName="highlight"
              searchWords={[activePhrase]}
              autoEscape={true}
              textToHighlight={item.target.content}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default TextHighlighter;
