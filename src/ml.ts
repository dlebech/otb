import bayes from 'bayes';
import { reverseIndexLookup } from './util';
import { type Transaction } from './types/redux';

interface CategorizerConfig {
  bayes: string;
}

interface TransactionCategoryMapping {
  [transactionId: string]: string;
}

interface ClassifierInstance {
  learn(text: string, category: string): Promise<void>;
  categorize(text: string): Promise<string>;
  toJson(): string;
}


const retrainBayes = async (transactions: Transaction[]): Promise<ClassifierInstance> => {
  const classifier = bayes({
    tokenizer: (text: string) => text
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

export const retrainCategorizer = async (transactions: Transaction[]): Promise<CategorizerConfig> => {
  return {
    bayes: (await retrainBayes(transactions)).toJson()
  };
};

/**
 * Ensure that our categorizer is up-to-date when transactions get categorized.
 * 
 * @param transactions - The existing transactions to update
 * @param categorizerConfig - The category classification configuration to use for classification.
 * @param transactionCategoryMapping - A mapping of transaction IDs to category IDs
 * @returns The new categorizer
 */
export const updateCategorizer = async (
  transactions: Transaction[], 
  categorizerConfig: CategorizerConfig, 
  transactionCategoryMapping: TransactionCategoryMapping
): Promise<CategorizerConfig | null> => {
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
  let classifier: ClassifierInstance;
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
    const transaction = transactions[i];
    const newCategoryId = transactionCategoryMapping[transaction.id];

    // Train on the new category we are about to add.
    // Note: The category can be the empty string, if it's a reset of the
    // category. In those cases, we shouldn't train on it...
    const description = transaction.descriptionCleaned || transaction.description;
    if (newCategoryId && description) {
      await classifier.learn(description, newCategoryId);
    }
  }

  // Finally, save the classifier and return transactions and classifier
  return { bayes: classifier.toJson() };
};

/**
 * Guess the category of the given transactions.
 * @param transactions - A list of transactions to guess the category for
 * @param categorizerConfig - The categorizer config
 * @returns Mapping from transaction ID to category ID
 */
export const guessCategory = async (
  transactions: Transaction[], 
  categorizerConfig: CategorizerConfig
): Promise<TransactionCategoryMapping | null> => {
  if (!categorizerConfig.bayes) return null;

  const guesstimator = bayes.fromJson(categorizerConfig.bayes);

  const transactionCategoryGuessMapping: TransactionCategoryMapping = {};
  for (const transaction of transactions) {
    const textToClassify = transaction.descriptionCleaned || transaction.description || '';
    if (textToClassify) {
      const guess = await guesstimator.categorize(textToClassify);
      transactionCategoryGuessMapping[transaction.id] = guess;
    }
  }

  return transactionCategoryGuessMapping;
};