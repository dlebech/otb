import * as yauzl from 'yauzl';
import { type Readable } from 'stream';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const promisify = (api: (...args: any[]) => void) => {
  return (...args: unknown[]) => {
    return new Promise((resolve, reject) => {
      api(...args, (err: Error | null, response: unknown) => {
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
  const zipFile = await yauzlFromBuffer(data, { lazyEntries: true }) as yauzl.ZipFile;
  console.log('Number of entries in zipfile:', zipFile.entryCount);

  // Open a read stream
  const openReadStream = promisify(zipFile.openReadStream.bind(zipFile));

  // Read all entries and return each csv file.
  return new Promise((resolve, reject) => {
    const files: Record<string, Buffer[] | string> = {};

    zipFile.readEntry();
    zipFile.on('entry', async (entry: yauzl.Entry) => {
      console.log('Reading file:', entry.fileName);

      files[entry.fileName] = []; // Create an empty array to gather the chunks

      const stream = await openReadStream(entry) as Readable;

      stream.on('end', () => {
        console.log('Done with:', entry.fileName);

        // Gather all the chunks into a string
        files[entry.fileName] = Buffer.concat(files[entry.fileName] as Buffer[]).toString();

        // Read the next entry
        zipFile.readEntry();
      });

      stream.on('data', (chunk: Buffer) => {
        (files[entry.fileName] as Buffer[]).push(chunk);
      });
    });

    zipFile.on('end', () => {
      resolve(files as Record<string, string>);
    });

    zipFile.on('error', reject);
  });
};