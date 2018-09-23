import yauzl from 'yauzl';

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

/**
 * Unzip the data in the given buffer
 * @param {Buffer} data - The zipfile to unzip as a buffer.
 * @returns {Object} An object with filenames as keys and string data as values.
 */
export const unzip = async data => {
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
};