import fs from 'fs';
import path from 'path';
import moxios from 'moxios';
import { handler } from '../currencies';

const daily = fs.readFileSync(path.join(__dirname, './daily.zip'));

describe('currencies', () => {
  beforeEach(() => {
    moxios.install();

    moxios.stubRequest(/.*eurofxref\.zip$/, {
      status: 200,
      response: daily
    });
  });

  afterEach(() => moxios.uninstall());

  it('should return supported currencies', async () => {
    const res = await handler();
    expect(res).toEqual({
      statusCode: 200,
      body: JSON.stringify(['USD', 'JPY'])
    });
  });
});
