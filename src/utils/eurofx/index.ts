import axios from 'axios';
import * as Papa from 'papaparse';
import { LRUCache } from 'lru-cache';
import { unzip } from './zip';

const rateDailyUrl = 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref.zip';
const rateHistoricalUrl = 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist.zip';

// Simple global cache for storing the unzipped versions of the rates. This is
// of course not going to work a lot of the time, since this is Lambda, but it
// should help a little bit, especially during testing.
const cache = new LRUCache<string, Papa.ParseResult<Record<string, string>>>({
  max: 10,
  ttl: 1000 * 60 * 60 // 1 hour cache
});

const fetchRatesCsv = async (url: string): Promise<Papa.ParseResult<Record<string, string>>> => {
  const cached = cache.get(url);
  if (cached) {
    console.log('Using cached CSV file');
    return cached;
  }

  console.log(`Fetching CSV from ${url}`)

  const resp = await axios.get(url, {
    responseType: 'arraybuffer'
  });
  const files = await unzip(resp.data);

  // There's only one CSV in the zip for now.
  const csvFile = Papa.parse<Record<string, string>>(Object.values(files)[0], {
    header: true,
    skipEmptyLines: true
  });

  cache.set(url, csvFile);

  return csvFile;
};

interface FetchRatesOptions {
  historical?: boolean;
  currencies?: string[];
}

/**
 * Fetch a and unzip a list of currency rates from the Euro Foreign Exchange Rates.
 * @param {Object} options - request options.
 * @returns {Array} A list of exchange rates (one per day)
 */
export const fetchRates = async (options: FetchRatesOptions = {}): Promise<Record<string, string | number>[]> => {
  console.log('Got options', options);

  const url = options.historical ? rateHistoricalUrl : rateDailyUrl;

  const csvFile = await fetchRatesCsv(url);

  let validColumns: Set<string> | null = null;
  if (Array.isArray(options.currencies) && options.currencies) {
    validColumns = new Set(['Date'].concat(options.currencies));
  }

  // Trim currency values
  const csvData = csvFile.data.map((entry) => {
    const newEntry: Record<string, string | number> = {};
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