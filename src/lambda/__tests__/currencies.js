import fs from 'fs';
import path from 'path';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { handler } from '../currencies';

const daily = fs.readFileSync(path.join(__dirname, './daily.zip'));

describe('currencies', () => {
  let mock;
  beforeEach(() => {
    mock = new MockAdapter(axios);

    mock.onGet(/.*eurofxref\.zip$/).reply(200, daily);

    //moxios.stubRequest(/.*eurofxref\.zip$/, {
    //  status: 200,
    //  response: daily
    //});
  });

  afterEach(() => mock.restore());

  it('should return supported currencies', async () => {
    const res = await handler();
    expect(res).toEqual({
      statusCode: 200,
      body: JSON.stringify(['USD', 'JPY'])
    });
  });
});
