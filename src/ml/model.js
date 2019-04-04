import { padTokenizedText } from './tokenizer';

/**
 * A wrapper for a tensorflow model that can predict categories for
 * transactions.
 */
class CategoryModel {
  constructor(model, tokenizer, categoryMapping) {
    this.model = model;
    this.tokenizer = tokenizer;
    this.categoryMapping = categoryMapping;
    this.reverseCategoryMapping = Object.entries(this.categoryMapping)
      .reduce((obj, [id, index]) => {
        obj[index] = id;
        return obj;
      }, {});
    this.maxDescriptionLength = this.model.getLayer('descriptionInput').batchInputShape[1];
  }

  async predict(transactions) {
    const { tensor, argMax } = await import('@tensorflow/tfjs');

    if (!Array.isArray(transactions)) transactions = [transactions];
    const paddedTexts = this.tokenizer
      .textsToSequences(transactions.map(t => t.descriptionCleaned))
      .map(text => padTokenizedText(text, this.maxDescriptionLength, 0));
    const predictions = await this.model.predict(tensor(paddedTexts));
    const labels = argMax(predictions, -1);
    const predictionArray = await predictions.array();
    const labelArray = await labels.array();
    return predictionArray.map((p, i) => {
      const idx = labelArray[i];
      return {
        confidence: p[idx],
        label: this.reverseCategoryMapping[idx],
        labelIndex: idx
      };
    });
  }
}

export const createCategoryModel = async (tokenizer, categoryMapping, longestDescription) => {
  const tf = await import('@tensorflow/tfjs');

  // Tokenized description input.
  const descriptionInput = tf.input({
    name: 'descriptionInput',
    shape: [longestDescription]
  });

  // If we have less than 50 words, use one-hot encoding.
  const inputDim = Object.keys(tokenizer.wordIndex).length + 1
  const outputDim = inputDim <= 50 ? inputDim : 50;
  const embeddingsInitializer = inputDim <= 50 ? 'identity' : 'glorotNormal';

  const embedding = tf.layers.embedding({
    inputDim,
    outputDim,
    embeddingsInitializer,
    name: 'descriptionEmbedding',
    inputLength: longestDescription,
    maskZero: true,
  }).apply(descriptionInput);

  const gru1 = tf.layers.gru({ units: 16 }).apply(embedding);
  const dense1 = tf.layers.dense({ units: 16, activation: 'relu' }).apply(gru1);
  const softmax = tf.layers.dense({
    units: Object.keys(categoryMapping).length,
    activation: 'softmax'
  }).apply(dense1);
  const model = tf.model({ inputs: [descriptionInput], outputs: [softmax]});
  model.compile({
    optimizer: 'adam',
    loss: 'sparseCategoricalCrossentropy',
    metrics: ['accuracy']
  });

  return new CategoryModel(model, tokenizer, categoryMapping);
};

/**
 * Calculate class weights according to the "balanced" scheme of scikit-learn's
 * compute_class_weight function
 * @param {Object} labelMapping - label -> index mapping
 * @param {Array} labels - list of label indices.
 */
export const computeClassWeight = (classes, labels) => {
  const labelCounts = labels.reduce((obj, label) => {
    obj[label] = (obj[label] || 0) + 1;
    return obj;
  }, {});

  const numLabels = classes.length;

  return classes.reduce((obj, c) => {
    obj[c] = labels.length / (numLabels * labelCounts[c]);
    return obj
  }, {});
};

