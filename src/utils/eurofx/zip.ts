import * as yauzl from 'yauzl';
import { type Readable } from 'stream';
import logger from '../logger';

const yauzlFromBuffer = (data: ArrayBuffer, options: yauzl.Options): Promise<yauzl.ZipFile> => {
  return new Promise((resolve, reject) => {
    yauzl.fromBuffer(Buffer.from(data), options, (err: Error | null, zipfile?: yauzl.ZipFile) => {
      if (err) return reject(err);
      resolve(zipfile!);
    });
  });
};

/**
 * Unzip the data in the given buffer
 * @param {Buffer} data - The zipfile to unzip as a buffer.
 * @returns {Object} An object with filenames as keys and string data as values.
 */
export const unzip = async (data: ArrayBuffer): Promise<Record<string, string>> => {
  // Prepare the zip file
  const zipFile = await yauzlFromBuffer(data, { lazyEntries: true });
  logger.debug('Number of entries in zipfile:', zipFile.entryCount);

  // Open a read stream
  const openReadStream = (entry: yauzl.Entry): Promise<Readable> => {
    return new Promise((resolve, reject) => {
      zipFile.openReadStream(entry, (err: Error | null, stream?: Readable) => {
        if (err) return reject(err);
        resolve(stream!);
      });
    });
  };

  // Read all entries and return each csv file.
  return new Promise((resolve, reject) => {
    const files: Record<string, Buffer[] | string> = {};

    zipFile.readEntry();
    zipFile.on('entry', async (entry: yauzl.Entry) => {
      logger.debug('Reading file:', entry.fileName);

      files[entry.fileName] = []; // Create an empty array to gather the chunks

      const stream = await openReadStream(entry);

      stream.on('end', () => {
        logger.debug('Done with:', entry.fileName);

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
