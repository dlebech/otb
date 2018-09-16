import axios from 'axios';
import yauzl from 'yauzl';
import Papa from 'papaparse';

const rateDailyUrl = 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref.zip';
const rateHistUrl = 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist.zip';

const promisify = api => {
  return (...args) => {
    return new Promise((resolve, reject) => {
      api(...args, (err, response) => {
        if (err) return reject(err);
        resolve(response);
      });
    });
  };
};

const yauzlFromBuffer = promisify(yauzl.fromBuffer);

const unzipCsvs = async data => {
  // Prepare the zip file
  const zipFile = await yauzlFromBuffer(data, { lazyEntries: true });
  console.log('Number of entries in zipfile:', zipFile.entryCount);

  // Open a read stream
  const openReadStream = promisify(zipFile.openReadStream.bind(zipFile));

  // Read all entries and return each csv file.
  return new Promise((resolve, reject) => {
    const files = {};

    zipFile.readEntry();
    zipFile.on('entry', async entry => {
      console.log('Reading file:', entry.fileName);

      files[entry.fileName] = []; // Create an empty array to gather the chunks

      const stream = await openReadStream(entry);

      stream.on('end', () => {
        console.log('Done with:', entry.fileName);

        // Gather all the chunks into a string
        files[entry.fileName] = Buffer.concat(files[entry.fileName]).toString();

        // Read the next entry
        zipFile.readEntry(); 
      });

      stream.on('data', chunk => {
        files[entry.fileName].push(chunk);
      });
    });

    zipFile.on('end', () => {
      resolve(files);
    });

    zipFile.on('error', reject);
  });
}

export const fetchRates = async options => {
  options = options || {};

  // TODO: Change to historical when date is requested
  const url = rateDailyUrl;

  const resp = await axios.get(url, {
    responseType: 'arraybuffer'
  });
  const files = await unzipCsvs(resp.data);

  // There's only one CSV in the zip for now.
  const csvFile = Papa.parse(Object.values(files)[0], {
    header: true,
    skipEmptyLines: true
  });

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
