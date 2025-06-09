import moment, { type Moment } from 'moment';
import { v4 as uuidv4 } from 'uuid';
import * as categories from './data/categories';
import { defaultAccount } from './data/accounts';
import { Transaction } from './types/redux';

export const toggleLocalStorage = async (persistor: any, enabled: boolean): Promise<void> => {
  // Pause/purge/resume the persistor, depending on the value.
  if (enabled) {
    await persistor.persist();
    await persistor.flush();
  } else {
    await persistor.pause();
    await persistor.flush();
    await persistor.purge();
  }
};

/**
 * Guess the date format for a string that could potentially be a date.
 */
export const guessDateFormat = (s: string): string => {
  s = s.trim();
  if (/^\d{4}[.\-/]\d{2}[.\-/]\d{2}$/.test(s)) return 'YYYY-MM-DD';
  if (/^\d{2}[.\-/]\d{2}[.\-/]\d{4}$/.test(s)) return 'DD-MM-YYYY';
  if (/^\d{1,2}[.\-/]\d{1,2}[.\-/]\d{2}$/.test(s)) return 'DD-MM-YY';
  return '';
};

/**
 * A thin wrapper around moment's parse function that replaces periods and
 * forward slashes with hyphens before parsing with moment and the given date
 * format.
 * @param {String} val - A date as a string
 * @param {String} dateFormat - A moment date format, using hyphens, e.g. 'YYYY-MM-DD'.
 * @returns {Moment} A moment instance
 */
export const momentParse = (val: string, dateFormat: string): Moment => {
  // Prepend single-digit dates and months with a zero
  const parts = val.split(/[.-/ ]/);
  if (parts.length === 3) {
    if (parts[0].length === 1) parts[0] = '0' + parts[0];
    if (parts[1].length === 1) parts[1] = '0' + parts[1];
  }
  const formattedVal = parts.join('-');
  return moment(formattedVal, dateFormat, true);
};

/**
 * Sleep utility function
 */
export const sleep = (timeToSleep: number): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(resolve, timeToSleep);
  });
};



/**
 * Clean a number from various formatting
 */
export const cleanNumber = (number: any): number => {
  // Note. I am aware of the numeral package... but it didn't work perfectly for
  // this use case. So for now, just just going with something super super
  // simple.
  if (typeof number === 'number') return number;
  if (typeof number === 'string') {
    // Replace spaces with nothing.
    let cleanedNumber = number.replace(/\s/g, '');

    // Simplistic matching of period thousand separator. Replace with nothing.
    if (/.*\..*,.*/.test(cleanedNumber)) cleanedNumber = cleanedNumber.replace(/\./g, '');

    // Now, if there are commas preceding periods (American), replace with nothing.
    // Otherwise replace the commas with periods (if there are exactly two decimals)
    // Or replace commas with nothing...
    // The second condition is an aproximation. It's not perfect :-)
    if (/.*,.*\..*/.test(cleanedNumber)) cleanedNumber = cleanedNumber.replace(/,/g, '');
    else if (/,\d{2}$/.test(cleanedNumber)) cleanedNumber = cleanedNumber.replace(',', '.');
    else cleanedNumber = cleanedNumber.replace(',', '');

    return Number(cleanedNumber);
  }

  // Ok well...
  return 0;
};

/**
 * Format a number for display with proper currency formatting
 /**
 * Simple wrapper for toLocaleString that makes sure string numbers can also be formatted.
 * @param {String|Number} num - The number to format
 * @param {Object} options - The options given to the toLocaleString function
 * @param {String} [locale=en-US] - Optional locale string
 * @returns {String}
 */
export const formatNumber = (num: string | number, options?: Intl.NumberFormatOptions, locale = 'en-US'): string => {
  options = options || {};
  const cleanedNum = cleanNumber(num);
  return cleanedNum.toLocaleString(locale, options);
};

/**
 * Clean transaction description by removing common bank prefixes/suffixes
 */
export const cleanTransactionDescription = (description: string): string => {
  if (!description) return '';
  description = description.replace(/\d{2,4}.{0,1}\d{2}.{0,1}\d{2,4}\s*/g, '');
  description = description.replace(/\d{4}\d*\s*/g, '');
  description = description.replace(/\s+/g, ' ');
  return description.toLowerCase().trim();
};

/**
 * Guess column specification for CSV import
 */
/**
 * Given a list of transactions (an array of arrays), guess which column
 * correspond to date, descriptions, etc.
 * @param transactions - A list of transactions
 */
export const guessColumnSpec = (transactions: any[][]): [Array<{ type: string }>, string] => {
  // Take the last transaction for now since there might be headers at the top.
  const transaction = transactions[transactions.length - 1];
  const columnSpec = transaction.map(() => ({ type: '' }));
  let dateFormat = '';

  const hasColumnType = (columnType: string) => columnSpec.some(c => c.type === columnType);

  for (let i = 0; i < transaction.length; i++) {
    const val = transaction[i];
    // If the type is a string, use it as date or description.
    // If the type is a number, use as amount or total, depending on whether we
    // found one of these already.
    if (typeof val === 'number') {
      if (!hasColumnType('amount')) columnSpec[i].type = 'amount';
      else if (!hasColumnType('total')) columnSpec[i].type = 'total';
    } else if (typeof val === 'string' && val) {
      if (!hasColumnType('date')) {
        dateFormat = guessDateFormat(val);
        if (dateFormat && momentParse(val, dateFormat).isValid()) {
          columnSpec[i].type = 'date';
          continue;
        }
      }

      if (cleanNumber(val)) {
        if (!hasColumnType('amount')) columnSpec[i].type = 'amount';
        else if (!hasColumnType('total')) columnSpec[i].type = 'total';
      } else if (!hasColumnType('description')) columnSpec[i].type = 'description';
    }
  }

  return [columnSpec, dateFormat];
};

/**
 * Create test data function
 */
export const createTestData = (): Transaction[] => {
  const startDate = moment().subtract(7, 'month');
  const now = moment();
  const transactions: Transaction[] = [];
  const categorySelection = [
    categories.entertainment,
    categories.foodAndDrink,
    categories.home,
    categories.shopping,
    categories.transportation,
    categories.travel
  ];
  const purchaseLimit = 100;
  
  while (startDate.isBefore(now)) {
    startDate.add(1, 'day');

    // Add up to 3 transactions per day
    const limit = Math.round(Math.random() * 3);
    for (let i = 0; i < limit; i++) {
      const category = categorySelection[Math.floor(Math.random() * categorySelection.length)];
      const tCategory: { guess?: string; confirmed?: string } = {};
      
      // Randomly assign categories: some confirmed, some guessed, some uncategorized
      if (Math.round(Math.random()) === 1) tCategory.confirmed = category.id;
      else if (Math.round(Math.random()) === 1) tCategory.guess = category.id;
      
      const description = `The ${category.name} store`;
      transactions.push({
        id: uuidv4(),
        date: startDate.clone().format('YYYY-MM-DD'),
        description,
        descriptionCleaned: cleanTransactionDescription(description),
        amount: -Math.round(Math.random() * purchaseLimit + 1),
        total: 0,
        category: tCategory,
        account: defaultAccount.id
      });
    }

    // Add some income every end of month
    if (startDate.isSame(startDate.clone().endOf('month'), 'day')) {
      transactions.push({
        id: uuidv4(),
        date: startDate.clone().format('YYYY-MM-DD'),
        description: 'Salary',
        descriptionCleaned: cleanTransactionDescription('Salary'),
        amount: purchaseLimit * (Math.random() * 10 + 20),
        total: 0,
        category: {
          confirmed: categories.money.id
        },
        account: defaultAccount.id
      });
    }
  }

  // Calculate running total
  transactions.reduce((prev, cur) => {
    cur.total = prev.total + cur.amount;
    return cur;
  });

  return transactions;
};

/**
 * Detect file encoding for a file or string
 */
export const detectFileEncoding = async (fileOrString: File | string): Promise<any> => {
  const jschardet = await import('jschardet').then(m => m.default);

  return new Promise(resolve => {
    if (typeof fileOrString === 'string') {
      return resolve(jschardet.detect(fileOrString));
    }
    const reader = new FileReader();
    reader.onload = () => resolve(jschardet.detect(reader.result as string));
    reader.readAsText(fileOrString);
  });
};

/**
 * Convert an amount from one currency to another
 */
export const convertCurrency = (amount: number, from: string, to: string, date: string, rates: any, base = 'EUR'): number => {
  if (from === to) return amount;
  if (amount === 0) return 0;
  const rate = rates[date];
  if (!rate) throw new Error(`Rates for ${date} do not exist`);
  const baseAmount = from === base ? amount : amount / rate[from];
  const convertedAmount = to === base ? baseAmount : baseAmount * rate[to];
  if (!convertedAmount) throw new Error(`Cannot convert from ${from} to ${to}`);
  return convertedAmount;
};

/**
 * Get a mapping of IDs to array indices. It is assumed that the objects have a
 * single ID field.
 * @param {Array} arr - The array to search through
 * @returns {Object} - The mapping of ID to array index
 */
export const reverseIndexLookup = (arr: any[]): Record<string, number> => {
  return arr.reduce((finalObj: Record<string, number>, obj: any, i: number) => {
    finalObj[obj.id] = i;
    return finalObj;
  }, {});
};

/**
 * Takes an array of object items with an `id` field and transforms it into a
 * single object with the IDs as lookup keys.
 * [{id: 'a'}, {id: 'b'}] => {a: {id: 'a'}, b: {id: 'b'}}
 * @param {Array} arr - The array to create an object from
 * @returns {Object} - The mapping of ID to object
 */
export const arrayToObjectLookup = (arr: any[]): Record<string, any> => {
  return arr.reduce((finalObj: Record<string, any>, obj: any) => {
    finalObj[obj.id] = obj;
    return finalObj;
  }, {});
};

// Re-export other functions for now
export const findCategory = (categoryList: any[] | Record<string, any>, categoryId: string, returnFallback = true, _returnParent = false): any => {
  // Handle both array and object formats
  if (Array.isArray(categoryList)) {
    return categoryList.find(cat => cat.id === categoryId) || (returnFallback ? categoryList[0] : null);
  } else if (categoryList && typeof categoryList === 'object') {
    // Object format - direct lookup
    const category = categoryList[categoryId];
    if (category) return category;
    
    // If not found and fallback requested, return first category
    if (returnFallback) {
      const firstKey = Object.keys(categoryList)[0];
      return firstKey ? categoryList[firstKey] : null;
    }
    return null;
  }
  
  return null;
};

/**
 * Fill currency rates for missing days. Fills based on the most recently known
 * rate.
 * @param {Object} rates - The un-filled currency rates.
 */
export const fillDates = (rates: any) => {
  // Fill between min and max date.
  // Sequentially run through all possible dates and check if they exist.
  const dates = Object.keys(rates).sort();
  const maxDate = moment.utc(dates[dates.length - 1]);
  let latestRates = [dates[0], rates[dates[0]]];
  let curDate = moment.utc(dates[0]);

  while (curDate.isBefore(maxDate)) {
    const dateString = curDate.format('YYYY-MM-DD')
    if (rates[dateString]) {
      latestRates = [dateString, rates[dateString]];
    } else {
      rates[dateString] = Object.assign({}, latestRates[1]);
      rates[dateString].refDate = latestRates[0];
    }
    curDate = curDate.add(1, 'day');
  }

  return rates;
};
