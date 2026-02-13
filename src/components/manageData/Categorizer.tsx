import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../reducers';

interface BayesData {
  totalDocuments: number;
  vocabularySize: number;
  wordFrequencyCount: { [categoryId: string]: { [word: string]: number } };
}

const getTopWords = (bayes: BayesData): [{ [word: string]: number }, { [word: string]: Set<string> }] => {
  const overallWordCounts: { [word: string]: number } = {};
  const wordCategoryMapping: { [word: string]: Set<string> } = {};

  for (const [categoryId, wordCounts] of Object.entries(bayes.wordFrequencyCount)) {
    for (const [word, frequency] of Object.entries(wordCounts)) {
      overallWordCounts[word] = (overallWordCounts[word] || 0) + frequency;

      wordCategoryMapping[word] = wordCategoryMapping[word] || new Set();
      wordCategoryMapping[word].add(categoryId);
    }
  }

  return [overallWordCounts, wordCategoryMapping];
};

export default function Categorizer() {
  const categorizer = useSelector((state: RootState) => state.transactions.categorizer);

  if (!categorizer || !categorizer.bayes) {
    return null;
  }
  
  const bayes: BayesData = JSON.parse(categorizer.bayes);

  // Word frequency count for bayes is a mapping from category -> word -> count.
  // There is no central word count, so getting the top words, we need to
  // manually sum them.
  const [wordCounts, categoryCounts] = getTopWords(bayes);

  const wordsWithMultipleCategories = Object
    .entries(categoryCounts)
    .filter(([, categories]) => categories.size >= 2)
    .length;

  return (
    <div className="row">
      <div className="col">
        <h3>Categorizer information</h3>
        <p>
          Total transactions analyzed: {bayes.totalDocuments}<br />
          Vocabulary size: {bayes.vocabularySize}<br />
          Number of words used in multiple categories: {wordsWithMultipleCategories}
        </p>
        <h4>Top-10 most used words</h4>
        {Object
          .entries(wordCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([word, frequency]) => {
            return <div key={word}> {word}: {frequency}</div>
          })
        }
      </div>
    </div>
  )
}
