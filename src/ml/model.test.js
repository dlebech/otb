import { computeClassWeight, createCategoryModel } from './model';
import Tokenizer from './tokenizer';

describe('ml/model', () => {
  it('should calculate class weights', () => {
    const classes = [0, 1];
    const labels = [0, 1, 1];
    const classWeights = computeClassWeight(classes, labels);
    expect(classWeights).toEqual({
      0: 1.5,
      1: 0.75
    })
  });

  describe('ml/model/createCategoryModel', () => {
    it('should initialize a model with identity embedding', async () => {
      const tokenizer = new Tokenizer();
      tokenizer.fitOnTexts(['hello hello hello']);

      const model = await createCategoryModel(tokenizer, { a: 0, b: 1 }, 5);
      expect(model.maxDescriptionLength).toEqual(5);
      const embedding = model.model.getLayer('descriptionEmbedding');

      // Because of the low dimensionality, we should expect an identity matrix.
      const weights = embedding.getWeights()[0].arraySync();
      expect(weights[0]).toEqual([1, 0]);
      expect(weights[1]).toEqual([0, 1]);

      // Expect 5 words as input
      expect(embedding.batchInputShape[1]).toEqual(5);

      // Output five words (in two dimensions because of the low dimensionality)
      expect(embedding.outputShape[1]).toEqual(5);
      expect(embedding.outputShape[2]).toEqual(2);
    });

    it('should initialize a model with random weights embedding', async () => {
      const tokenizer = new Tokenizer();
      tokenizer.fitOnTexts(['0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59']);

      const model = await createCategoryModel(tokenizer, { a: 0, b: 1 }, 5);
      expect(model.maxDescriptionLength).toEqual(5);
      const embedding = model.model.getLayer('descriptionEmbedding');

      // Because of the more-than-fifty dimensionality, we should expect a randomly initialized matrix.
      const weights = embedding.getWeights()[0].arraySync();

      // 61 tokens get mapped to 50 dimensions
      expect(weights).toHaveLength(61);
      expect(weights[0]).toHaveLength(50);
      expect(weights[0][0]).not.toEqual(1);
      expect(weights[0][0]).not.toEqual(0);

      // Expect 5 words as input
      expect(embedding.batchInputShape[1]).toEqual(5);

      // Output five words in fifty dimensions
      expect(embedding.outputShape[1]).toEqual(5);
      expect(embedding.outputShape[2]).toEqual(50);
    });
  })
});