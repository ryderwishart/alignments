// src/main.tsx
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import MainDisplay from './MainDisplay';
import './MainDisplay.css';
import './index.css';
import { MultimediaMetadata } from './MainDisplay';

const container = document.getElementById('root');
const root = createRoot(container);

const tsvMultimediaManifestPath = '/UBS-images-metadata_updated.tsv';

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
        const headers = lines[0].split('\t');
        const data = lines.slice(1).map((line) => {
          const obj = {};
          const currentline = line.split('\t');
          headers.forEach((header, i) => {
            // Ensure the metadata is unicode normalized for combining characters
            obj[header] = currentline[i]?.normalize('NFC');
          });
          return obj;
        });

        // I need to split the 'Tags' column into an array by semi-colon plus space
        // and then filter out any empty strings.
        data.forEach((datum) => {
          datum['Tags'] = datum['Tags']
            ?.split('; ')
            ?.filter((tag) => tag !== '');
        });

        setMultimediaManifest(data);
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
