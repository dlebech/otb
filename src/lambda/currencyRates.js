import moment from 'moment';
import { fetchRates } from './eurofx';

/**
 * Fill currency rates for missing days. Fills based on the most recently known
 * rate.
 * @param {Object} rates - The un-filled currency rates.
 */
const fillDates = rates => {
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

exports.handler = async event => {
  event = event || {};

  const options = event.queryStringParameters || {};
  options.historical = true;
  let rates = await fetchRates(options);

  // Convert the array into an object with date -> currencies mapping
  rates = rates.reduce((prev, cur) => {
    prev[cur['Date']] = cur;
    delete prev[cur['Date']].Date;
    return prev;
  }, {});

  rates = fillDates(rates);

  return {
    statusCode: 200,
    body: JSON.stringify(rates)
  };
}