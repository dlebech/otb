import bayes from 'bayes';
import { reverseIndexLookup } from './util';

const retrainBayes = async transactions => {
  const classifier = bayes({
    tokenizer: (text) => text
      .replace(/[^(a-zA-ZA-Яa-я0-9_)+\s]/g, ' ')
      .trim()
      .split(/\s+/)
  });
  console.log(classifier);
  for (const t of transactions) {
    if (t.category.confirmed && t.descriptionCleaned) {
      await classifier.learn(t.descriptionCleaned, t.category.confirmed);
    }
  }
  return classifier;
};

export const retrainCategorizer = async transactions => {
  return {
    bayes: (await retrainBayes(transactions)).toJson()
  };
};

/**
 * Ensure that our categorizer is up-to-date when transactions get categorized.
 * 
 * @param {Object} transactions - The existing transactions to update
 * @param {Object} categorizerConfig - The category classification configuration to
 *                                     use for classification.
 * @param {Object} transactionCategoryMapping - A mapping of transaction IDs to category IDs
 * @returns {Object} The new categorizer
 */
export const updateCategorizer = async (transactions, categorizerConfig, transactionCategoryMapping) => {
  const rowIds = Object.keys(transactionCategoryMapping);
  const rowsToCategorizeAsSet = new Set(rowIds);

  // This wouldn't be necessary if the transactions were not stored in an array.
  const lookup = reverseIndexLookup(transactions);

  // Find the indexes to update.
  const rowIndexes = rowIds
    .map(rowId => lookup[rowId])
    .filter(rowIndex => rowIndex !== null && rowIndex >= 0);

  // Exit early if we can't find the transactions. This shouldn't really
  // happen...
  if (rowIndexes.length === 0) return null;

  // If any of the rows already had a confirmed category, assume it's being changed here and thus: Retrain
  // If the categorizer is empty: Retrain
  // Otherwise just instantiate it.
  let classifier;
  const anyTransactionHasCategory = !!transactions
    .find(t => rowsToCategorizeAsSet.has(t.id) && t.category.confirmed);

  if (anyTransactionHasCategory || !categorizerConfig.bayes) {
    // Reset the classifier and re-train on all transactions, except the ones
    // we are changing here.
    classifier = await retrainBayes(transactions.filter(t => !rowsToCategorizeAsSet.has(t.id)));
  } else {
    classifier = bayes.fromJson(categorizerConfig.bayes);
  }

  // Atomically update the state
  for (const i of rowIndexes) {
    const transaction = transactions[i]
    const newCategoryId = transactionCategoryMapping[transaction.id];

    // Train on the new category we are about to add.
    // Note: The category can be the empty string, if it's a reset of the
    // category. In those cases, we shouldn't train on it...
    const description = transaction.descriptionCleaned || transaction.description;
    if (newCategoryId && description) {
      await classifier.learn(description, newCategoryId);
    }
  }

  // Finally, save the classifier and return transactionsn and classifier
  return { bayes: classifier.toJson() };
};

/**
 * Guess the category of the given transactions.
 * @param {Array} transactions - A list of transactions to guess the category for
 * @param {Object} categorizerConfig - The categorizer config
 * @returns {Object} Mapping from transaction ID to category ID
 */
export const guessCategory = async (transactions, categorizerConfig) => {
  if (!categorizerConfig.bayes) return null;

  const guesstimator = bayes.fromJson(categorizerConfig.bayes);

  const transactionCategoryGuessMapping = {};
  for (const transaction of transactions) {
    transactionCategoryGuessMapping[transaction.id] =
      await guesstimator.categorize(transaction.descriptionCleaned);
  }

  return transactionCategoryGuessMapping;
};
