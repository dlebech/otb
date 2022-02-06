import fs from 'fs';
import path from 'path';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { handler } from '../currencyRates';

const daily = fs.readFileSync(path.join(__dirname, './daily.zip'));
const historical = fs.readFileSync(path.join(__dirname, './hist.zip'));

describe('currencyRates', () => {
  let mock;
  beforeEach(() => {
    mock = new MockAdapter(axios);
    mock.onGet(/.*eurofxref\.zip$/).reply(200, daily);
    mock.onGet(/.*eurofxref-hist\.zip$/).reply(200, historical);
  });

  afterEach(() => mock.restore());

  it('should return daily rates', async () => {
    const res = await handler();
    const rates = {
      '2018-09-17': {
        USD: 1.1691,
        JPY: 130.77
      },
      '2018-09-14': {
        USD: 1.1690,
        JPY: 130.76
      },
      '2018-09-13': {
        USD: 1.1689,
        JPY: 130.75
      }
    };

    expect(res).toEqual({
      statusCode: 200,
      body: JSON.stringify(rates)
    });
  });

  it('should return specific currencies', async () => {
    const res = await handler({
      queryStringParameters: {
        currencies: ['USD']
      }
    });
    const rates = {
      '2018-09-17': {
        USD: 1.1691
      },
      '2018-09-14': {
        USD: 1.1690
      },
      '2018-09-13': {
        USD: 1.1689
      }
    };

    expect(res).toEqual({
      statusCode: 200,
      body: JSON.stringify(rates)
    });
  });
});
