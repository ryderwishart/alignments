import React, { useEffect, useState } from 'react';
import ApolloClient from 'apollo-boost';
import { gql } from 'apollo-boost';
import { VerseData, MultimediaMetadata } from './MainDisplay';
import './index.css';
import { convertUrl } from './utils';

interface SidebarProps {
  verseData?: VerseData;
  tokenIds: string[];
  multiMediaManifest: MultimediaMetadata[] | null;
}

const client = new ApolloClient({
  uri: 'https://conceptual-hierarchies---macula-atlas-api-qa-25c5xl4maa-uk.a.run.app/graphql/',
});

interface Token {
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

const Sidebar: React.FC<SidebarProps> = ({
  verseData,
  tokenIds,
  multiMediaManifest,
}) => {
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

  const filteredMultiMediaManifest = multiMediaManifest?.filter((item) => {
    const matchingTags = item.Tags?.filter((tag) =>
      clickedTokens?.map((token) => token?.data?.lemma).includes(tag),
    );
    return matchingTags?.length && matchingTags?.length > 0;
  });

  //   console.log({ filteredMultiMediaManifest, multiMediaManifest });

  //   filteredMultiMediaManifest?.forEach((item) => {
  //     item.URL && console.log(item.URL, convertUrl(item.URL));
  //     item.newURL ? (item.URL = convertUrl(item.URL)) : 'no url';
  //   });

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
                {filteredMultiMediaManifest?.map((item) => {
                  console.log({
                    match: item.Tags?.includes(token.data.lemma),
                    up_url_present: item.updatedURL,
                    urlpresent: item.URL,
                    item,
                  });
                  if (item.Tags?.includes(token.data.lemma)) {
                    return (
                      <div className="text-red-900 bg-white shadow-lg rounded-lg p-4 mt-4">
                        <img
                          src={item.updatedURL}
                          alt={item.FileName}
                          className="w-full h-64 object-cover"
                        />
                        <div className="text-sm text-gray-700 mt-2">
                          {item.FileName}
                        </div>
                      </div>
                    );
                  }
                  return null;
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
