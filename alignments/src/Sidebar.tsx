import React, { useEffect, useState } from 'react';
import ApolloClient from 'apollo-boost';
import { gql } from 'apollo-boost';
import { VerseData } from './TextHighlighter';
import './index.css';

interface SidebarProps {
  verseData?: VerseData;
  tokenIds: string[];
}

const client = new ApolloClient({
  uri: 'https://macula-atlas-api-qa-25c5xl4maa-uk.a.run.app/graphql/',
});

interface Token {
  /**
     * {
    "data": {
      "pos": "verb",
      "ref": "GEN 1:10!9",
      "lang": "H",
      "sdbh": "006633001001000",
      "stem": "qal",
      "text": "יַּ֥רְא",
      "type": "wayyiqtol",
      "after": " ",
      "class": "verb",
      "frame": "A0:010010100101; A1:010010100121;",
      "gloss": "",
      "greek": "εἶδεν",
      "lemma": "רָאָה",
      "morph": "Vqw3ms",
      "state": "",
      "gender": "masculine",
      "number": "singular",
      "person": "third",
      "xmlId": "o010010100092",
      "english": "saw",
      "extends": "",
      "subjref": "",
      "mandarin": "看",
      "lexdomain": "002004001005",
      "coredomain": "",
      "greekstrong": "1492",
      "sensenumber": "1",
      "stronglemma": "7200",
      "strongnumberx": "7200",
      "participantref": "",
      "transliteration": "yyarəʾ",
      "contextualdomain": "075002",
      "augmentedStrongs": "7200"
    },
    "__typename": "WordToken"
  },
     */
  data: {
    text: string;
    gloss: string;
    xmlId: string;
    pos: string;
    ref: string;
    lang: string;
    sdbh: string;
    stem: string;
    type: string;
    after: string;
    class: string;
    frame: string;
    greek: string;
    lemma: string;
    morph: string;
  };
}

interface DataResponse {
  data: {
    passage: {
      tokens: Token[];
    }[];
  };
}

const Sidebar: React.FC<SidebarProps> = ({ verseData, tokenIds }) => {
  const [responseData, setResponseData] = useState<DataResponse | null>(null);

  useEffect(() => {
    if (tokenIds.length > 0 && verseData?.vref) {
      client
        .query({
          query: gql`
            query Passage($vref: String!) {
              passage(filters: { reference: $vref }) {
                tokens {
                  data
                }
              }
            }
          `,
          variables: {
            vref: verseData.vref,
          },
        })
        .then((result: DataResponse | null) => {
          console.log(JSON.stringify(result));
          setResponseData(result);
        });
    }
  }, [verseData, tokenIds]);

  const clickedTokens = responseData?.data?.passage[0]['tokens'].filter(
    (token: Token) => {
      return tokenIds.includes(token.data.xmlId);
    },
  );

  const keysToDisplay = ['lemma', 'morph', 'english'];

  return (
    <div className="w-64 bg-gray-800 text-white p-5">
      <h2 className="text-2xl mb-4">Data from Atlas</h2>
      <div className="flex flex-col">
        {clickedTokens?.map((token: Token) => {
          return (
            <div className="flex flex-col mb-4">
              <div className="bg-white shadow-lg rounded-lg p-4">
                {Object.keys(token.data)
                  .filter(
                    (key) => token?.data[key] && keysToDisplay.includes(key),
                  )
                  .map((key) => {
                    return (
                      <div className="grid grid-cols-2 items-center gap-1 border-b border-gray-300">
                        <div className="text-sm text-gray-700 text-left">
                          {key}
                        </div>
                        <div className="text-xs text-gray-700 text-right">
                          {token?.data[key]}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
