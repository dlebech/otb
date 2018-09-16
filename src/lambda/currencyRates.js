import { fetchRates } from './eurofx';

exports.handler = async (event, context) => {
  event = event || {};
  const rates = await fetchRates(event.queryStringParameters);

  return {
    statusCode: 200,
    body: JSON.stringify(rates)
  };
}