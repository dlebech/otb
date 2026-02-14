import fs from 'fs';
import path from 'path';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { GET } from '../src/app/api/currencyRates/route';
import { NextRequest } from 'next/server';

const daily = fs.readFileSync(path.join(__dirname, './daily.zip'));
const historical = fs.readFileSync(path.join(__dirname, './hist.zip'));

describe('currencyRates API', () => {
  let mock: MockAdapter;
  
  beforeEach(() => {
    mock = new MockAdapter(axios);
    mock.onGet(/.*eurofxref\.zip$/).reply(200, daily);
    mock.onGet(/.*eurofxref-hist\.zip$/).reply(200, historical);
  });

  afterEach(() => mock.restore());

  it('should return daily rates', async () => {
    const request = new NextRequest('http://localhost:3000/api/currencyRates');
    const response = await GET(request);
    const rates = await response.json();
    
    const expectedRates = {
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

    expect(response.status).toBe(200);
    expect(rates).toEqual(expectedRates);
  });

  it('should return specific currencies', async () => {
    const request = new NextRequest('http://localhost:3000/api/currencyRates?currencies=USD');
    const response = await GET(request);
    const rates = await response.json();
    
    const expectedRates = {
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

    expect(response.status).toBe(200);
    expect(rates).toEqual(expectedRates);
  });
});