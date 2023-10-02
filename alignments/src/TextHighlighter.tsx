import './TextHighlighter.css';
import './index.css';
import React, { useState } from 'react';
import Highlighter from 'react-highlight-words';
import Sidebar from './Sidebar';

interface Verse {
  vref: string;
  content: string;
  token_ids?: Token[];
  ner?: NamedEntity[];
}

interface NamedEntity {
  name: string;
  start_char: number;
  end_char: number;
  label: string;
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
  'Macula phrase'?: Phrase;
  'Greek phrase'?: Phrase;
  'Target phrase': Phrase;
  'Pseudo-English phrase'?: string;
}

interface Phrase {
  'original-text-value': string;
  ranges: Range[];
}

// const colors_for_labels = {
//   CARDINAL: 'red-500',
//   DATE: 'blue-500',
//   EVENT: 'green-500',
//   FAC: 'yellow-500',
//   GPE: 'purple-500',
//   LANGUAGE: 'pink-500',
//   LAW: 'indigo-500',
//   LOC: 'gray-500',
//   MONEY: 'red-900',
//   NORP: 'blue-900',
//   ORDINAL: 'green-900',
//   ORG: 'yellow-900',
//   PERCENT: 'purple-900',
//   PERSON: 'pink-900',
//   PRODUCT: 'indigo-900',
//   QUANTITY: 'gray-900',
//   TIME: 'red-300',
//   WORK_OF_ART: 'blue-300',
// };

const TextHighlighter: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [versesToDisplay, setVersesToDisplay] = useState<VerseData[]>([]);
  // const [data, setData] = useState<VerseData[]>([]);
  const [activePhrase, setActivePhrase] = useState<Alignment | null>();
  const [activeVerse, setActiveVerse] = useState<VerseData | null>();
  const [selectedTokenIds, setSelectedTokenIds] = useState<string[]>([]);

  // const data_path = '/ranges-for-alignments chunk 2.jsonl';
  // useEffect(() => {
  //   fetch(data_path)
  //     .then((response) => response.text())
  //     .then((text) => {
  //       const lines = text.split('\n').filter((line) => line);
  //       const jsonData = lines.map((line) => JSON.parse(line));
  //       setData(jsonData);
  //     });
  // }, []);

  const handlePhraseHover = (alignment: Alignment | null) => {
    setActivePhrase(alignment);
  };

  const handleVerseHover = (verse: VerseData | null) => {
    setActiveVerse(verse);
  };

  const handlePhraseClick = (currentVerse: VerseData, alignment: Alignment) => {
    setActiveVerse(currentVerse);

    // Extract the phrases from the alignment
    const phrase = alignment['Macula phrase']
    // Initialize an empty array to store the matching ids
    const matchingIds: string[] = [];

    // Iterate over each phrase
    // phrases.forEach((phrase) => {
      // Iterate over each range in the phrase
      phrase?.ranges.forEach(
        (range: { endPosition: number; startPosition: number }) => {
          // Iterate over each token in the current verse
          currentVerse?.macula?.token_ids?.forEach((token) => {
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
    // });

    // Set the selected token ids to the matching ids
    setSelectedTokenIds(matchingIds);
  };

  const fetchVerseIndexByVref = async (vref: string) => {
    console.log(vref)
    let indexFound = -1;
    await fetch('/data.jsonl')
    .then((response) => response.text())
    .then((text) => {
      const lines = text.split('\n').filter((line) => line);
      lines.forEach((line, index) => {
        
        if(line.toLowerCase().includes(vref.toLowerCase())) {
          console.log('line found', line)
          indexFound = index;
        }
      });
    });
    return indexFound;
  }

  const fetchVersesByIndices = async (indices: number[]) => {
    const jsonData: VerseData[] = [];
    const response = await fetch('/data.jsonl');
    const text = await response.text();
    const lines = text.split('\n').filter((line) => line);

    indices.forEach((index) => {
      try {
        const parsedLine = JSON.parse(lines[index]);
        jsonData.push(parsedLine);
      } catch (error) {
        console.error(`Error parsing line at index ${index}: ${lines[index]}`, error);
      }
    });

    return jsonData;
  }
// todo: bold the string that was searched
  const fetchVerseAndSiblingsByVref = async (verseVref:string) => {
    console.log({verseVref})
    // fetch verse by veref
    // fetch verse before verse in question and verse afer vers in question 
    const verseIndex = await fetchVerseIndexByVref(verseVref)
    console.log({verseIndex})
    const versesToDisplay = await fetchVersesByIndices([ verseIndex - 1, verseIndex, verseIndex + 1])
    setVersesToDisplay(versesToDisplay)
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleInputSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    fetchVerseAndSiblingsByVref(inputValue);
  };

  return (
    <div className="flex flex-row">
      <div className="p-4 bg-gray-100 w-3/4">
        <h2 className="text-2xl mb-4">Aligned verses (total: {versesToDisplay.length})</h2>
        {/* Add a form with an input and a submit button */}
        <form onSubmit={handleInputSubmit}>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
          />
          <button type="submit">Submit</button>
        </form>
        {versesToDisplay.map(
          (item, index) => (
              <div
                key={index}
                className="text-block p-4 bg-white shadow-lg rounded-lg my-4"
                onMouseEnter={() => handleVerseHover(item)}
                onMouseLeave={() => handleVerseHover(null)}
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
                <div className="bsb-ner flex flex-row gap-2">
                  {
                    // add a tiny red badge if ner is present and len > 0,
                    item.bsb.ner && item.bsb.ner.length > 0 && (
                      <span className="text-gray-100 px-1 rounded-l bg-red-500">
                        concepts:
                      </span>
                    )
                  }
                  {item.vref === activeVerse?.vref &&
                    item.bsb.ner?.map((ner: NamedEntity, nerIdx: number) => {
                      //   const color: string = colors_for_labels[ner.label];
                      return (
                        <span
                          key={nerIdx}
                          className={`text-gray-100 px-1 rounded bg-purple-300`}
                        >
                          {ner.name} {ner.label}
                        </span>
                      );
                    })}
                </div>
                <div className="bsb">
                  <Highlighter
                    highlightClassName="highlight bg-yellow-300"
                    searchWords={[
                      activePhrase?.['English phrase']?.[
                        'original-text-value'
                      ] || '',
                      activePhrase?.['Macula phrase']?.[
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
                      activePhrase?.['Macula phrase']?.[
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
                      activePhrase?.['Macula phrase']?.[
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
      <div className="px-4 bg-white fixed right-0 w-1/4">
        <Sidebar verseData={activeVerse || null} tokenIds={selectedTokenIds} />
      </div>
    </div>
  );
};

export default TextHighlighter;
