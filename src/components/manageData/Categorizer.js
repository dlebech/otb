import React from 'react';
import { connect } from 'react-redux';

const getTopWords = (bayes) => {
  const overallWordCounts = {};
  const wordCategoryMapping = {};

  for (const [categoryId, wordCounts] of Object.entries(bayes.wordFrequencyCount)) {
    for (const [word, frequency] of Object.entries(wordCounts)) {
      overallWordCounts[word] = (overallWordCounts[word] || 0) + frequency;

      wordCategoryMapping[word] = wordCategoryMapping[word] || new Set();
      wordCategoryMapping[word].add(categoryId);
    }
  }

  return [overallWordCounts, wordCategoryMapping];
};

const Categorizer = (props) => {
  if (!props.categorizer || !props.categorizer.bayes) {
    return null;
  }
  const bayes = JSON.parse(props.categorizer.bayes);

  // Word frequency count for bayes is a mapping from category -> word -> count.
  // There is no central word count, so getting the top words, we need to
  // manually sum them.
  const [wordCounts, categoryCounts] = getTopWords(bayes);

  const wordsWithMultipleCategories = Object
    .entries(categoryCounts)
    .filter(([_, categories]) => categories.size >= 2)
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
          .sort((a, b) => b[1]-a[1])
          .slice(0, 10)
          .map(([word, frequency]) => {
            return <div>{word}: {frequency}</div>
          })
        }
      </div>
    </div>
  )
};

const mapStateToProps = state => {
  return {
    categorizer: state.transactions.categorizer
  };
};

export default connect(mapStateToProps)(Categorizer);