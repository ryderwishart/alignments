import './TextHighlighter.css';

import React, { useState, useEffect } from 'react';
import Highlighter from 'react-highlight-words';

/* example VerseData instance :

{
  vref: 'GEN 1:1',
  bsb: {
    vref: 'GEN 1:1',
    content: 'In the beginning God created the heavens and the earth.',
  },
  macula: {
    vref: 'GEN 1:1',
    content:
      'בְּרֵאשִׁ֖ית  בָּרָ֣א  אֱלֹהִ֑ים  אֵ֥ת  הַשָּׁמַ֖יִם  וְאֵ֥ת  הָאָֽרֶץ׃',
    token_ids: [
      {
        text: 'בְּ',
        id: 'o010010010011',
        range: { startPosition: 0, endPosition: 2 },
      },
      {
        text: 'רֵאשִׁ֖ית',
        id: 'o010010010012',
        range: { startPosition: 3, endPosition: 11 },
      },
      {
        text: 'בָּרָ֣א',
        id: 'o010010010021',
        range: { startPosition: 14, endPosition: 20 },
      },
      {
        text: 'אֱלֹהִ֑ים',
        id: 'o010010010031',
        range: { startPosition: 23, endPosition: 31 },
      },
      {
        text: 'אֵ֥ת',
        id: 'o010010010041',
        range: { startPosition: 34, endPosition: 37 },
      },
      {
        text: 'הַ',
        id: 'o010010010051',
        range: { startPosition: 40, endPosition: 41 },
      },
      {
        text: 'שָּׁמַ֖יִם',
        id: 'o010010010052',
        range: { startPosition: 42, endPosition: 51 },
      },
      {
        text: 'וְ',
        id: 'o010010010061',
        range: { startPosition: 54, endPosition: 55 },
      },
      {
        text: 'אֵ֥ת',
        id: 'o010010010062',
        range: { startPosition: 56, endPosition: 59 },
      },
      {
        text: 'הָ',
        id: 'o010010010071',
        range: { startPosition: 62, endPosition: 63 },
      },
      {
        text: 'אָֽרֶץ',
        id: 'o010010010072',
        range: { startPosition: 64, endPosition: 69 },
      },
    ],
  },
  target: {
    vref: 'GEN 1:1',
    content:
      'Bipo bipo tru God i mekim kamap skai na graun na olgeta samting i stap long en.',
  },
  alt: ' Before before true God he make come up sky and ground and all thing he stop long him.',
  alignment: [
    {
      'English phrase': {
        'original-text-value': 'In the beginning',
        ranges: [{ startPosition: 0, endPosition: 15 }],
      },
      'Hebrew phrase': {
        'original-text-value': 'בְּרֵאשִׁ֖ית',
        ranges: [{ startPosition: 0, endPosition: 11 }],
      },
      'Target phrase': {
        'original-text-value': 'Bipo bipo tru',
        ranges: [{ startPosition: 0, endPosition: 12 }],
      },
      'Pseudo-English phrase': 'Before before true',
    },
    {
      'English phrase': {
        'original-text-value': 'God created',
        ranges: [{ startPosition: 17, endPosition: 27 }],
      },
      'Hebrew phrase': {
        'original-text-value': 'בָּרָ֣א  אֱלֹהִ֑ים',
        ranges: [{ startPosition: 14, endPosition: 31 }],
      },
      'Target phrase': {
        'original-text-value': 'God i mekim kamap',
        ranges: [{ startPosition: 14, endPosition: 30 }],
      },
      'Pseudo-English phrase': 'God he make come up',
    },
    {
      'English phrase': {
        'original-text-value': 'the heavens',
        ranges: [{ startPosition: 29, endPosition: 39 }],
      },
      'Hebrew phrase': {
        'original-text-value': 'אֵ֥ת  הַשָּׁמַ֖יִם',
        ranges: [{ startPosition: 34, endPosition: 51 }],
      },
      'Target phrase': {
        'original-text-value': 'skai na graun',
        ranges: [{ startPosition: 32, endPosition: 44 }],
      },
      'Pseudo-English phrase': 'sky and ground',
    },
    {
      'English phrase': {
        'original-text-value': 'and the earth.',
        ranges: [{ startPosition: 41, endPosition: 54 }],
      },
      'Hebrew phrase': {
        'original-text-value': 'וְאֵ֥ת  הָאָֽרֶץ׃',
        ranges: [{ startPosition: 54, endPosition: 70 }],
      },
      'Target phrase': {
        'original-text-value': 'na olgeta samting i stap long en.',
        ranges: [{ startPosition: 46, endPosition: 78 }],
      },
      'Pseudo-English phrase': 'and all thing he stop long him.',
    },
  ],
};

*/

interface Verse {
  vref: string;
  content: string;
  token_ids?: Token[];
}

interface Token {
  text: string;
  id: string;
  range: Range;
}

interface Range {
  startPosition: number;
  endPosition: number;
}

interface VerseData {
  vref: string;
  bsb: Verse;
  macula: Verse;
  target: Verse;
  alt: string;
  alignment: Alignment[];
}

interface Alignment {
  'English phrase': Phrase;
  'Hebrew phrase': Phrase;
  'Target phrase': Phrase;
  'Pseudo-English phrase': string;
}

interface Phrase {
  'original-text-value': string;
  ranges: Range[];
}

const TextHighlighter: React.FC = () => {
  const [data, setData] = useState<VerseData[]>([]);
  const [activePhrase, setActivePhrase] = useState<string>('');

  useEffect(() => {
    fetch('/data.jsonl')
      .then((response) => response.text())
      .then((text) => {
        const lines = text.split('\n').filter((line) => line);
        const jsonData = lines.map((line) => JSON.parse(line));
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
                  handlePhraseHover(
                    alignment['English phrase']['original-text-value'],
                  );
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
