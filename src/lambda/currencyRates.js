import { fetchRates } from './eurofx';

exports.handler = async (event, context) => {
  event = event || {};

  const options = event.queryStringParameters || {};
  options.historical = true;
  let rates = await fetchRates(options);

  // Convert the array into an object with date -> currencies mapping
  rates = rates.reduce((prev, cur) => {
    const rate = Object.assign({}, cur);
    const date = cur['Date'];
    delete rate['Date'];
    return Object.assign({ [date]: rate }, prev);
  }, {});

  return {
    statusCode: 200,
    body: JSON.stringify(rates)
  };
}