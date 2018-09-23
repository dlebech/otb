import axios from 'axios';
import Papa from 'papaparse';
import { unzip } from './zip';

const rateDailyUrl = 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref.zip';
const rateHistUrl = 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist.zip';

// Simple global cache for storing the unzipped versions of the rates. This is
// of course not going to work a lot of the time, since this is Lambda, but it
// should help a little bit, especially during testing.
const cache = {};

const fetchRatesCsv = async url => {
  if (url in cache) {
    console.log('Using cached CSV file');
    return cache[url];
  }

  console.log(`Fetching CSV from ${url}`)

  const resp = await axios.get(url, {
    responseType: 'arraybuffer'
  });
  const files = await unzip(resp.data);

  // There's only one CSV in the zip for now.
  const csvFile = Papa.parse(Object.values(files)[0], {
    header: true,
    skipEmptyLines: true
  });

  cache[url] = csvFile;

  return csvFile;
};

/**
 * Fetch a and unzip a list of currency rates from the Euro Foreign Exchange Rates.
 * @param {Object} options - request options.
 * @returns {Array} A list of exchange rates (one per day)
 */
export const fetchRates = async options => {
  options = options || {};

  console.log('Got options', options);

  // TODO: Change to historical when date is requested
  const url = rateDailyUrl;

  const csvFile = await fetchRatesCsv(url);

  let validColumns = null;
  if (Array.isArray(options.currencies) && options.currencies) {
    validColumns = new Set(['Date'].concat(options.currencies));
  }

  // Trim currency values
  const csvData = csvFile.data.map(entry => {
    const newEntry = {};
    for (let [k, v] of Object.entries(entry)) {
      k = k.trim();
      v = v.trim();
      if (validColumns && !validColumns.has(k)) continue;
      if (!k) continue; // The currency file contains empty columns :(

      newEntry[k] = Number(v) || v;
    }
    return newEntry;
  });

  return csvData;
};
