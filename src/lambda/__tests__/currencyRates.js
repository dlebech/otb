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
      },
      // The 15-16 didn't have currencies but for completeness, the last known
      // currency rates are returned.
      '2018-09-15': {
        USD: 1.1690,
        JPY: 130.76,
        refDate: '2018-09-14'
      },
      '2018-09-16': {
        USD: 1.1690,
        JPY: 130.76,
        refDate: '2018-09-14'
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
      },
      '2018-09-15': {
        USD: 1.1690,
        refDate: '2018-09-14'
      },
      '2018-09-16': {
        USD: 1.1690,
        refDate: '2018-09-14'
      }
    };

    expect(res).toEqual({
      statusCode: 200,
      body: JSON.stringify(rates)
    });
  });
});
