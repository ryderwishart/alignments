import React, { useEffect, useState } from 'react';
import ApolloClient from 'apollo-boost';
import { gql } from 'apollo-boost';
import { VerseData } from './TextHighlighter';

interface SidebarProps {
  verseData: VerseData;
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

  /**
   *
   * Here's some example data returned from endpoint:
   *{"data":{"passage":[{"tokens":[{"data":{"pos":"preposition","ref":"GEN 1:1!1","lang":"H","sdbh":"","stem":"","text":"בְּ","type":"","after":"","class":"prep","frame":"","gloss":"","greek":"ἐν","lemma":"בְּ","morph":"R","state":"","gender":"","number":"","person":"","xmlId":"o010010010011","english":"in","extends":"","subjref":"","mandarin":"","lexdomain":"","coredomain":"","greekstrong":"1722","sensenumber":"","stronglemma":"b","strongnumberx":"0871a","participantref":"","transliteration":"bə","contextualdomain":"","augmentedStrongs":"b"},"__typename":"WordToken"},{"data":{"pos":"noun","ref":"GEN 1:1!1","lang":"H","sdbh":"006652001001000","stem":"","text":"רֵאשִׁ֖ית","type":"common","after":" ","class":"noun","frame":"","gloss":"","greek":"ἀρξῇ","lemma":"רֵאשִׁית","morph":"Ncfsa","state":"absolute","gender":"feminine","number":"singular","person":"","xmlId":"o010010010012","english":"beginning","extends":"","subjref":"","mandarin":"起初","lexdomain":"002003003004","coredomain":"","greekstrong":"746","sensenumber":"1","stronglemma":"7225","strongnumberx":"7225","participantref":"","transliteration":"rēʾšiyṯ","contextualdomain":"","augmentedStrongs":"7225"},"__typename":"WordToken"}, ...
   */

  console.log({ tokenIds, responseData });
  //   const clickedTokens = responseData?.data.passage.tokens.filter((token) =>
  //     tokenIds.includes(token.data.xmlId),
  //   );
  const clickedTokens = responseData?.data?.passage[0]['tokens'].filter(
    (token: Token) => {
      console.log({ token });
      return tokenIds.includes(token.data.xmlId);
    },
  );
  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-5">
      <h2 className="text-2xl mb-4">Sidebar</h2>
      <div className="flex flex-col">
        {clickedTokens?.map((token: Token) => {
          return (
            <div className="flex flex-row mb-4">
              {Object.keys(token.data).map((key) => {
                return (
                  <div className="flex flex-row">
                    <div className="text-sm">{key}</div>
                    <div className="text-xs">{token.data[key]}</div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
