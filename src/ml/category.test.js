import { train, createCategoryMapping } from './category';

describe('ml/category', () => {
  const transactions = [
    {
      category: {
        confirmed: 'a',
      },
      descriptionCleaned: 'hello hello hello hello world world world',
    },
    {
      descriptionCleaned: 'great success success',
      category: {
        confirmed: 'b',
      },
    },
    {
      descriptionCleaned: 'great success success',
      category: {
        confirmed: 'b',
      },
    },
  ];
  
  const categories = [
    {
      id: 'a',
      name: 'Hello'
    },
    {
      id: 'b',
      name: 'Success'
    }
  ];

  it('should train a model that can predict category', async () => {
    const [model, history] = await train(transactions, categories);

    // With the data given above, we should consistently be able to predict the
    // correct label, otherwise there's something very wrong with the model :-)
    let predictions = await model.predict(transactions[0]);
    expect(predictions).toHaveLength(1);
    expect(predictions[0].confidence).toBeGreaterThanOrEqual(0.5);
    expect(predictions[0].label).toEqual('a');
    expect(predictions[0].labelIndex).toEqual(0);

    predictions = await model.predict(transactions.slice(1));
    expect(predictions).toHaveLength(2);
    expect(predictions[0].confidence).toBeGreaterThanOrEqual(0.5);
    expect(predictions[1].confidence).toBeGreaterThanOrEqual(0.5);
    expect(predictions[0].label).toEqual('b');
    expect(predictions[1].label).toEqual('b');
    expect(predictions[0].labelIndex).toEqual(1);
    expect(predictions[1].labelIndex).toEqual(1);
  });

  it('should create a category mapping', () => {
    const mapping = createCategoryMapping(categories);
    expect(mapping).toEqual({
      a: 0,
      b: 1
    })
  });

  //it('should classify the file', async done => {
  //  const { time } = await import('@tensorflow/tfjs');
  //  const fs = require('fs');
  //  const file = fs.readFileSync('/home/david/projects/otb/test_examples/data_2018-01-12_cleaned.json');
  //  const js = JSON.parse(file);
  //  // const [model, history] = await train(js.transactions.data.slice(0, 5), js.categories.data, { epochs: 50 });
  //  //console.log(history.history);
  //  //console.log(await model.predict(js.transactions.data[0]));
  //  const timing = await time(() => train(js.transactions.data.slice(0, 5), js.categories.data, { epochs: 50 }));
  //  console.log(`kernelMs: ${timing.kernelMs}, wallTimeMs: ${timing.wallMs}`);
  //  expect(false).toBe(true);
  //  done();
  //}, 60000);
});