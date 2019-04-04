import Tokenizer, { padTokenizedText } from './tokenizer';
import { createCategoryModel, computeClassWeight } from './model';

const preprocess = transactions => {
  // Descriptions are already lowercased so we don't need to repeat that.
  const tokenizer = new Tokenizer({ lower: false });
  const texts = transactions.map(t => t.descriptionCleaned);
  tokenizer.fitOnTexts(texts);
  const sequences = tokenizer.textsToSequences(texts)
  const maxLength = Math.max(...sequences.map(s => s.length));
  return [sequences, tokenizer, maxLength];
};

export const createCategoryMapping = categories => {
  return categories.reduce((obj, c, i) => {
    obj[c.id] = i;
    return obj;
  }, {})
};

export const train = async (transactions, categories, config = {}, callbacks = {}) => {
  const { tensor } = await import('@tensorflow/tfjs');

  transactions = transactions.filter(t => !!t.category.confirmed);

  // Preprocess transactions into vectors consisting of the description and
  // amount vectors.
  const [tokenizedTexts, tokenizer, maxLength] = preprocess(transactions);

  // Create a category mapping and 
  const categoryMapping = createCategoryMapping(categories);
  const labels = transactions.map(t => categoryMapping[t.category.confirmed]);
  const classWeights = computeClassWeight(Object.values(categoryMapping), labels);

  const categoryModel = await createCategoryModel(tokenizer, categoryMapping, maxLength);

  const paddedTexts = tokenizedTexts
    .map(tokenizedText => padTokenizedText(tokenizedText, maxLength, 0));
  const inputTensor = tensor(paddedTexts);
  const outputTensor = tensor(labels);

  console.log(categoryModel.model.summary());

  const history = await categoryModel.model.fit(inputTensor, outputTensor, {
    epochs: config.epochs || 10,
    batchSize: config.batchSize || 32,
    classWeight: classWeights,
    callbacks
  });

  return [categoryModel, history];
};
