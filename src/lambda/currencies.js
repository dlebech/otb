import { fetchRates } from './eurofx';

exports.handler = async (event, context) => {
  event = event || {};
  const rates = await fetchRates();
  const currencies = Object.keys(rates[0]).filter(k => k !== 'Date');

  return {
    statusCode: 200,
    body: JSON.stringify(currencies)
  };
}