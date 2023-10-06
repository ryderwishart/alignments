import './MainDisplay.css';
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
  alignment?: Alignment[];
  alignments?: Alignment[];
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

export interface MultimediaMetadata {
  Authors?: string;
  Description: string;
  FileName: string;
  Id: string;
  Subject: string;
  Tags?: string[];
  ThematicLink: string;
  Title: string;
  URL?: string;
  updatedURL?: string;
}

interface MainDisplayProps {
  multimediaManifest: MultimediaMetadata[] | null;
}

enum CorpusFolderName {
  TOK_PISIN = 'tok-pisin',
  SPANISH = 'spanish',
  FRENCH = 'french',
}
const MainDisplay: React.FC<MainDisplayProps> = (props) => {
  const [selectedCorpus, setSelectedCorpus] = useState<CorpusFolderName>(
    CorpusFolderName.TOK_PISIN,
  );
  const [inputValue, setInputValue] = useState('');
  const [versesToDisplay, setVersesToDisplay] = useState<VerseData[]>([]);
  // const [data, setData] = useState<VerseData[]>([]);
  const [activePhrase, setActivePhrase] = useState<Alignment | null>();
  const [activeVerse, setActiveVerse] = useState<VerseData | null>();
  const [selectedTokenIds, setSelectedTokenIds] = useState<string[]>([]);
  const [showAlt, setShowAlt] = useState(false);

  // console.log(props.multimediaManifest);

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
    const phrase = alignment['Macula phrase'];
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

  const getAlignmentData = async () => {
    const responses = await Promise.all([
      // NOTE: the file names are hard-coded here
      fetch('/' + selectedCorpus + '/data-chunk-aa.jsonl'),
      fetch('/' + selectedCorpus + '/data-chunk-ab.jsonl'),
      fetch('/' + selectedCorpus + '/data-chunk-ac.jsonl'),
    ]);
    return responses;
  };

  const fetchVerseIndicesBySearchString = async (
    searchString: string,
    limit = 10,
  ) => {
    const indicesFound: number[] = [];
    const responses = await getAlignmentData();
    const texts = await Promise.all(
      responses.map((response) => response.text()),
    );
    const lines = texts.flatMap((text) =>
      text.split('\n').filter((line) => line),
    );

    lines.forEach((line, index) => {
      if (
        line.toLowerCase().includes(searchString.toLowerCase()) &&
        indicesFound.length < limit
      ) {
        indicesFound.push(index);
      }
    });
    return indicesFound;
  };

  const fetchVersesByIndices = async (indices: number[]) => {
    const jsonData: VerseData[] = [];
    const responses = await await getAlignmentData();
    const texts = await Promise.all(
      responses.map((response) => response.text()),
    );
    const lines = texts.flatMap((text) =>
      text.split('\n').filter((line) => line),
    );

    indices.forEach((index) => {
      try {
        const parsedLine = JSON.parse(lines[index]);
        jsonData.push(parsedLine);
      } catch (error) {
        console.error(
          `Error parsing line at index ${index}: ${lines[index]}`,
          error,
        );
      }
    });

    return jsonData;
  };
  // todo: bold the string that was searched
  const fetchVerseAndSiblingsByVref = async (searchString: string) => {
    console.log({ searchString });
    // fetch verse by veref
    // fetch verse before verse in question and verse afer vers in question
    const verseIndices = await fetchVerseIndicesBySearchString(searchString);
    console.log({ verseIndex: verseIndices });
    const versesToDisplay = await fetchVersesByIndices(verseIndices);
    setVersesToDisplay(versesToDisplay);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleInputSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    fetchVerseAndSiblingsByVref(inputValue);
  };

  const handleCorpusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCorpus(event.target.value as CorpusFolderName);
    setInputValue('');
    setVersesToDisplay([]);
  };

  return (
    <div className="flex flex-row">
      <div className="p-4 bg-gray-100 w-3/4">
        <h2 className="text-2xl mb-4">
          Aligned verses (total: {versesToDisplay.length})
        </h2>
        <div className="flex items-center mb-4">
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={selectedCorpus}
            onChange={handleCorpusChange}
          >
            <option value={CorpusFolderName.TOK_PISIN}>Tok Pisin</option>
            <option value={CorpusFolderName.SPANISH}>Spanish</option>
            <option value={CorpusFolderName.FRENCH}>French</option>
          </select>
        </div>
        <form
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-row gap-2"
          onSubmit={handleInputSubmit}
        >
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            value={inputValue}
            onChange={handleInputChange}
          />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Submit
          </button>
        </form>
        <div className="flex items-center mb-4">
          <input
            className="mr-2 leading-tight"
            type="checkbox"
            checked={showAlt}
            onChange={() => setShowAlt(!showAlt)}
          />
          <span className="text-sm">Show pseudo-English</span>
        </div>
        {versesToDisplay.map((item, index) => (
          <div
            key={index}
            className="text-block p-4 bg-white shadow-lg rounded-lg my-4"
            onMouseEnter={() => handleVerseHover(item)}
            onMouseLeave={() => handleVerseHover(null)}
          >
            <span>{item.vref}</span>
            <div className="macula">
              {(item.alignment || item.alignments)?.map(
                (alignment: Alignment, aIdx: number) => (
                  <span
                    key={aIdx}
                    onMouseEnter={() => handlePhraseHover(alignment)}
                    onMouseLeave={() => handlePhraseHover(null)}
                    onClick={() => handlePhraseClick(item, alignment)}
                    className="cursor-pointer text-blue-600 hover:text-blue-800"
                  >
                    Translation unit {aIdx + 1}
                    {aIdx + 1 < (item.alignment || item.alignments)?.length &&
                      ' | '}
                  </span>
                ),
              )}
            </div>
            {showAlt && (
              <div className="italic text-orange-700">{item.alt}</div>
            )}
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
              <span className="text-gray-900 font-bold">English Bible: </span>
              <Highlighter
                highlightClassName="highlight bg-yellow-300"
                searchWords={[
                  activePhrase?.['English phrase']?.['original-text-value'] ||
                    '',
                  activePhrase?.['Macula phrase']?.['original-text-value'] ||
                    '',
                  activePhrase?.['Target phrase']?.['original-text-value'] ||
                    '',
                ]}
                autoEscape={true}
                textToHighlight={item.bsb.content}
              />
            </div>
            <div className="macula">
              <span className="text-gray-900 font-bold">Source Language: </span>{' '}
              <Highlighter
                highlightClassName="highlight bg-yellow-300"
                searchWords={[
                  activePhrase?.['English phrase']?.['original-text-value'] ||
                    '',
                  activePhrase?.['Macula phrase']?.['original-text-value'] ||
                    '',
                  activePhrase?.['Target phrase']?.['original-text-value'] ||
                    '',
                ]}
                autoEscape={true}
                textToHighlight={item.macula.content}
              />
            </div>
            <div className="target">
              <span className="text-gray-900 font-bold">Target Language: </span>
              <Highlighter
                highlightClassName="highlight bg-yellow-300"
                searchWords={[
                  activePhrase?.['English phrase']?.['original-text-value'] ||
                    '',
                  activePhrase?.['Macula phrase']?.['original-text-value'] ||
                    '',
                  activePhrase?.['Target phrase']?.['original-text-value'] ||
                    '',
                ]}
                autoEscape={true}
                textToHighlight={item.target.content}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 bg-white fixed right-0 w-1/4 overflow-scroll">
        <Sidebar
          verseData={activeVerse || undefined}
          tokenIds={selectedTokenIds}
          multiMediaManifest={props.multimediaManifest}
        />
      </div>
    </div>
  );
};

export default MainDisplay;
