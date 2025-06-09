import * as yauzl from 'yauzl';

const promisify = (api: any) => {
  return (...args: any[]) => {
    return new Promise((resolve, reject) => {
      api(...args, (err: any, response: any) => {
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
export const unzip = async (data: ArrayBuffer): Promise<Record<string, string>> => {
  // Prepare the zip file
  const zipFile = await yauzlFromBuffer(data, { lazyEntries: true }) as any;
  console.log('Number of entries in zipfile:', zipFile.entryCount);

  // Open a read stream
  const openReadStream = promisify(zipFile.openReadStream.bind(zipFile));

  // Read all entries and return each csv file.
  return new Promise((resolve, reject) => {
    const files: Record<string, Buffer[]> = {};

    zipFile.readEntry();
    zipFile.on('entry', async (entry: any) => {
      console.log('Reading file:', entry.fileName);

      files[entry.fileName] = []; // Create an empty array to gather the chunks

      const stream = await openReadStream(entry) as any;

      stream.on('end', () => {
        console.log('Done with:', entry.fileName);

        // Gather all the chunks into a string
        (files as any)[entry.fileName] = Buffer.concat(files[entry.fileName]).toString();

        // Read the next entry
        zipFile.readEntry(); 
      });

      stream.on('data', (chunk: Buffer) => {
        files[entry.fileName].push(chunk);
      });
    });

    zipFile.on('end', () => {
      resolve(files as any);
    });

    zipFile.on('error', reject);
  });
};