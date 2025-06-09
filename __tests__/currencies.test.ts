import fs from 'fs';
import path from 'path';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { GET } from '../src/app/api/currencies/route';
import { NextRequest } from 'next/server';

const daily = fs.readFileSync(path.join(__dirname, './daily.zip'));

describe('currencies API', () => {
  let mock: MockAdapter;
  
  beforeEach(() => {
    mock = new MockAdapter(axios);
    mock.onGet(/.*eurofxref\.zip$/).reply(200, daily);
  });

  afterEach(() => mock.restore());

  it('should return supported currencies', async () => {
    const request = new NextRequest('http://localhost:3000/api/currencies');
    const response = await GET(request);
    const currencies = await response.json();
    
    expect(response.status).toBe(200);
    expect(currencies).toEqual(['USD', 'JPY']);
  });
});