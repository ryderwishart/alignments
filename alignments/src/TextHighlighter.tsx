import './TextHighlighter.css';
import './index.css';
import React, { useState, useEffect } from 'react';
import Highlighter from 'react-highlight-words';
import Sidebar from './Sidebar';

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

export interface VerseData {
  vref: string;
  bsb: Verse;
  macula: Verse;
  target: Verse;
  alt: string;
  alignment: Alignment[];
}

interface Alignment {
  'English phrase': Phrase;
  'Hebrew phrase'?: Phrase;
  'Greek phrase'?: Phrase;
  'Target phrase': Phrase;
  'Pseudo-English phrase'?: string;
}

interface Phrase {
  'original-text-value': string;
  ranges: Range[];
}

const TextHighlighter: React.FC = () => {
  const [data, setData] = useState<VerseData[]>([]);
  const [activePhrase, setActivePhrase] = useState<Alignment | null>();
  const [activeVerse, setActiveVerse] = useState<VerseData | null>();
  const [selectedTokenIds, setSelectedTokenIds] = useState<string[]>([]);

  useEffect(() => {
    fetch('/data.jsonl')
      .then((response) => response.text())
      .then((text) => {
        const lines = text.split('\n').filter((line) => line);
        const jsonData = lines.map((line) => JSON.parse(line));
        setData(jsonData);
      });
  }, []);

  const handlePhraseHover = (alignment: Alignment | null) => {
    setActivePhrase(alignment);
  };

  const handlePhraseClick = (currentVerse: VerseData, alignment: Alignment) => {
    setActiveVerse(currentVerse);

    // Extract the phrases from the alignment
    const phrases = ['Greek phrase', 'Hebrew phrase']
      .map((key: string) => alignment[key])
      .filter(Boolean);

    // Initialize an empty array to store the matching ids
    const matchingIds: string[] = [];

    // Iterate over each phrase
    phrases.forEach((phrase) => {
      // Iterate over each range in the phrase
      phrase.ranges.forEach(
        (range: { endPosition: number; startPosition: number }) => {
          // Iterate over each token in the current verse
          currentVerse.macula.token_ids.forEach((token) => {
            // Check if the token's range overlaps with the phrase's range
            if (
              token.range.startPosition <= range.endPosition &&
              token.range.endPosition >= range.startPosition
            ) {
              // If it does, add the token's id to the matching ids
              matchingIds.push(token.id);
            }
          });
        },
      );
    });

    // Set the selected token ids to the matching ids
    setSelectedTokenIds(matchingIds);
  };

  return (
    <div className="flex flex-row">
      <div className="p-4 bg-gray-100">
        <h2 className="text-2xl mb-4">Aligned verses (total: {data.length})</h2>
        {data.map(
          (item, index) =>
            index < 10 && (
              <div
                key={index}
                className="text-block p-4 bg-white shadow-lg rounded-lg my-4"
              >
                <div className="macula">
                  {item.alignment.map((alignment: Alignment, aIdx: number) => (
                    <span
                      key={aIdx}
                      onMouseEnter={() => handlePhraseHover(alignment)}
                      onMouseLeave={() => handlePhraseHover(null)}
                      onClick={() => handlePhraseClick(item, alignment)}
                      className="cursor-pointer text-blue-600 hover:text-blue-800"
                    >
                      Translation unit {aIdx + 1}
                      {aIdx + 1 < item.alignment.length && ' | '}
                    </span>
                  ))}
                </div>
                <div className="bsb">
                  <Highlighter
                    highlightClassName="highlight bg-yellow-300"
                    searchWords={[
                      activePhrase?.['English phrase']?.[
                        'original-text-value'
                      ] || '',
                      activePhrase?.['Hebrew phrase']?.[
                        'original-text-value'
                      ] || '',
                      activePhrase?.['Target phrase']?.[
                        'original-text-value'
                      ] || '',
                    ]}
                    autoEscape={true}
                    textToHighlight={item.bsb.content}
                  />
                </div>
                <div className="macula">
                  <Highlighter
                    highlightClassName="highlight bg-yellow-300"
                    searchWords={[
                      activePhrase?.['English phrase']?.[
                        'original-text-value'
                      ] || '',
                      activePhrase?.['Hebrew phrase']?.[
                        'original-text-value'
                      ] || '',
                      activePhrase?.['Target phrase']?.[
                        'original-text-value'
                      ] || '',
                    ]}
                    autoEscape={true}
                    textToHighlight={item.macula.content}
                  />
                </div>
                <div className="target">
                  <Highlighter
                    highlightClassName="highlight bg-yellow-300"
                    searchWords={[
                      activePhrase?.['English phrase']?.[
                        'original-text-value'
                      ] || '',
                      activePhrase?.['Hebrew phrase']?.[
                        'original-text-value'
                      ] || '',
                      activePhrase?.['Target phrase']?.[
                        'original-text-value'
                      ] || '',
                    ]}
                    autoEscape={true}
                    textToHighlight={item.target.content}
                  />
                </div>
              </div>
            ),
        )}
      </div>
      <div className="px-4 bg-white shadow-lg rounded-lg">
        <Sidebar verseData={activeVerse} tokenIds={selectedTokenIds} />
      </div>
    </div>
  );
};

export default TextHighlighter;
