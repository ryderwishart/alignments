// src/main.tsx
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import MainDisplay from './MainDisplay';
import './MainDisplay.css';
import './index.css';
import { MultimediaMetadata } from './MainDisplay';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

const tsvMultimediaManifestPath = '/UBS-images-metadata.tsv_updated.tsv';

interface DataObject {
  [key: string]: string | undefined;
}

const App: React.FC = () => {
  const [multimediaManifest, setMultimediaManifest] = useState<
    MultimediaMetadata[] | null
  >(null);

  useEffect(() => {
    fetch(tsvMultimediaManifestPath)
      .then((response) => response.text())
      .then((text) => {
        const normText = text.normalize('NFC');
        const lines = normText.split('\n');
        let headers = lines[0].split('\t');
        // Strip off the return character if present
        headers = headers.map((header) =>
          header.endsWith('\r') ? header.slice(0, -1) : header,
        );
        const data: DataObject[] = lines.slice(1).map((line) => {
          const obj: DataObject = {};
          const currentline = line.split('\t');
          headers.forEach((header, i) => {
            // Ensure the metadata is unicode normalized for combining characters
            let value = currentline[i]?.normalize('NFC');
            // Strip off the return character if present
            if (value?.endsWith('\r')) {
              value = value.slice(0, -1);
            }
            obj[header] = value;
          });
          return obj;
        });

        // I need to split the 'Tags' column into an array by semi-colon plus space
        // and then filter out any empty strings.
        const updatedData = data.map((datum: DataObject) => {
          if (typeof datum['Tags'] === 'string') {
            return {
              ...datum,
              Tags: datum['Tags']
                .split('; ')
                .filter((tag: string) => tag !== ''),
            };
          }
          return datum;
        });

        setMultimediaManifest(updatedData as MultimediaMetadata[]);
      });
  }, []);

  console.log({ multimediaManifest });

  return (
    <div className="App p-4">
      <MainDisplay multimediaManifest={multimediaManifest} />
    </div>
  );
};

root.render(<App />);
