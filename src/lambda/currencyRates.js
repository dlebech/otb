import { fetchRates } from './eurofx';

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

  return {
    statusCode: 200,
    body: JSON.stringify(rates)
  };
}