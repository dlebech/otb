import moment from 'moment';
import uuidv4 from 'uuid/v4';
import * as categories from './data/categories';
import { defaultAccount }  from './data/accounts';
import { Exception } from 'handlebars';

/**
 * Guess the date format for a string that could potentially be a date. Makes a
 * simple match on a date-like format with support for both hyphen, period and
 * forward slash.
 * @param {String} s - The string to check
 * @returns {String} The date format, either 'YYYY-MM-DD', 'DD-MM-YYYY' or ''.
 */
export const guessDateFormat = s => {
  s = s.trim();
  if (/^\d{4}[.\-/]\d{2}[.\-/]\d{2}$/.test(s)) return 'YYYY-MM-DD';
  if (/^\d{2}[.\-/]\d{2}[.\-/]\d{4}$/.test(s)) return 'DD-MM-YYYY';
  return '';
};

/**
 * A thin wrapper around moment's parse function that replaces periods and
 * forward slashes with hyphens before parsing with moment and the given date
 * format.
 * @param {String} val - A date (hopefully) as a string
 * @param {String} dateFormat - A moment date format, using hyphens, e.g. 'YYYY-MM-DD'.
 * @returns {Moment} A moment instance
 */
export const momentParse = (val, dateFormat) => {
  return moment(val.replace(/[.-]/g, '-'), dateFormat);
};

/**
 * Given a list of transactions (an array of arrays), guess which column
 * correspond to date, descriptions, etc.
 * @param {Array} transactions - A list of transactions
 */
export const guessColumnSpec = transactions => {
  // Take the last transaction for now since there might be headers at the top.
  const transaction = transactions[transactions.length - 1];
  const columnSpec = transaction.map(() => ({ type: '' }));
  let dateFormat = '';

  const hasColumnType = columnType => columnSpec.some(c => c.type === columnType);

  for (let i = 0; i < transaction.length; i++) {
    const val = transaction[i];
    // If the type is a string, use it as date or description.
    // If the type is a number, use as amount or total, depending on whether we
    // found one of these already.
    if (typeof val === 'string' && val) {
      if (!hasColumnType('date') ) {
        dateFormat = guessDateFormat(val);
        if (dateFormat && momentParse(val, dateFormat).isValid()) {
          columnSpec[i].type = 'date';
          continue;
        }
      }
      if (!hasColumnType('description')) columnSpec[i].type = 'description';
    } else if (typeof val === 'number') {
      if (!hasColumnType('amount')) columnSpec[i].type = 'amount';
      else columnSpec[i].type = 'total';
    }
  }

  return [columnSpec, dateFormat];
};

/**
 * Search for the category with the given ID in the category list.
 * @param {Array} categories - A list of categories to search through
 * @param {String} categoryId - The ID of the category
 * @param {Boolean} [returnFallback] - Optionally return a fallback category, default is true
 */
export const findCategory = (categories, categoryId, returnFallback = true) => {
  const category = categories.find(c => c.id === categoryId);
  if (!category && returnFallback) return { name: 'Uncategorized' };
  return category;
};

export const sleep = timeToSleep => {
  return new Promise(resolve => setTimeout(resolve, timeToSleep));
};

/**
 * A simple converter that ensures the given input is a number type. Removed
 * commas from strings so the conversion is smoother. This has a bias towards
 * numbers with comma as a thousand separator. That's just life... for now.
 * @param {Number|String} number
 * @returns {Number}
 */
export const cleanNumber = number => {
  // Note. I am aware of the numeral package... but it didn't work perfectly for
  // this use case. So for now, just just going with something super super
  // simple.
  if (typeof number === 'number') return number;
  if (typeof number === 'string') {
    // Replace spaces with nothing.
    number = number.replace(/\s/g, '');

    // Simplistic matching of period thousand separator. Replace with nothing.
    if (/.*\..*,.*/.test(number)) number = number.replace(/\./g, '');

    // Now, if there are commas preceding periods (American), replace with nothing.
    // Otherwise replace the commas with periods (if there are exactly two decimals)
    // Or replace commas with nothing...
    // The second condition is an aproximation. It's not perfect :-)
    if (/.*,.*\..*/.test(number)) number = number.replace(/,/g, '');
    else if (/,\d{2}$/.test(number)) number = number.replace(',', '.');
    else number = number.replace(',', '');

    return Number(number);
  }

  // Ok well...
  return 0;
};

/**
 * Removes dates and long-ish digits from transactions to avoid tokenizing
 * these and using them for training categorization. Also lowercases.
 * @param {String} description - The description for a transaction
 */
export const cleanTransactionDescription = description => {
  if (!description) return description;
  description = description.replace(/\d{2,4}.{0,1}\d{2}.{0,1}\d{2,4}\s*/g, '');
  description = description.replace(/\d{4}\d*\s*/g, '');
  return description.toLowerCase();
};

export const toggleLocalStorage = async (persistor, enabled) => {
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

export const createTestData = () => {
  const startDate = moment().subtract(4, 'month');
  const now = moment();
  const transactions = [];
  const categorySelection = [
    categories.entertainment,
    categories.foodAndDrink,
    categories.home,
    categories.money,
    categories.shopping,
    categories.transportation,
    categories.travel
  ];
  while (startDate.isBefore(now)) {
    startDate.add(1, 'day');
    for (let i = 0; i < 3; i++) {
      const category = categorySelection[Math.floor(Math.random() * categorySelection.length)];
      const tCategory = {};
      if (Math.round(Math.random()) === 1) tCategory.confirmed = category.id;
      else if (Math.round(Math.random()) === 1) tCategory.guess = category.id;
      transactions.push({
        id: uuidv4(),
        date: startDate.clone().format('YYYY-MM-DD'),
        description: `A ${category.name} store`,
        descriptionCleaned: cleanTransactionDescription(`A ${category.name} store`),
        amount: -Math.round(Math.random() * 100 + 1),
        total: 0,
        category: tCategory,
        account: defaultAccount.id
      });
    }
  }

  // Add some income...
  transactions.push({
    id: uuidv4(),
    date: startDate.clone().format('YYYY-MM-DD'),
    description: 'Some income',
    descriptionCleaned: cleanTransactionDescription('Some income'),
    amount: 123,
    total: 0,
    category: {},
    account: defaultAccount.id
  });

  transactions.reduce((prev, cur) => {
    cur.total = prev.total + cur.amount;
    return cur;
  });

  return transactions;
};

/**
 * Simple wrapper for toLocaleString that makes sure string numbers can also be formatted.
 * @param {String|Number} num - The number to format
 * @param {Object} options - The options given to the toLocaleString function
 * @param {String} [locale=en-US] - Optional locale string
 * @returns {String}
 */
export const formatNumber = (num, options, locale = 'en-US') => {
  options = options || {};
  num = cleanNumber(num);
  return num.toLocaleString(locale, options);
};

export const detectFileEncoding = async file => {
  const jschardet = await import('jschardet').then(m => m.default);

  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(jschardet.detect(reader.result));
    reader.readAsBinaryString(file);
  });
};

/**
 * Convert an amount from one currency to another. Simple as that
 * @param {Number} amount - The amount to convery
 * @param {String} from - Source currency
 * @param {String} to - Destination currency
 * @param {String} date - The date to convert for
 * @param {Object} rates - Historical daily currency rates
 * @param {Strign} base - The base currency for the rates
 */
export const convertCurrency = (amount, from, to, date, rates, base = 'EUR') => {
  if (from === to) return amount;
  const rate = rates[date];
  if (!rate) throw new Exception(`Rates for ${date} do not exist`);
  const baseAmount = from === base ? amount : amount / rate[from];
  amount = to === base ? baseAmount : baseAmount * rate[to];
  if (!amount) throw new Exception(`Cannot convert from ${from} to ${to}`);
  return amount;
};
