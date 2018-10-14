import fs from 'fs';
import path from 'path';
import moxios from 'moxios';
import { handler } from '../currencyRates';

const daily = fs.readFileSync(path.join(__dirname, './daily.zip'));
const historical = fs.readFileSync(path.join(__dirname, './hist.zip'));

describe('currencyRates', () => {
  beforeEach(() => {
    moxios.install();

    moxios.stubRequest(/.*eurofxref\.zip$/, {
      status: 200,
      response: daily
    });

    moxios.stubRequest(/.*eurofxref-hist\.zip$/, {
      status: 200,
      response: historical
    });
  });

  afterEach(() => moxios.uninstall());

  it('should return daily rates', async () => {
    const res = await handler();
    const rates = {
      '2018-09-14': {
        USD: 1.1689,
        JPY: 130.75
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
      '2018-09-14': {
        USD: 1.1689
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
