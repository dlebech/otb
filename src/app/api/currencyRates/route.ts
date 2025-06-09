import { NextRequest, NextResponse } from 'next/server';
import { fetchRates } from '../../../utils/eurofx';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const currencyParams = url.searchParams.getAll('currencies');
    
    const options: any = { historical: true };
    if (currencyParams.length > 0) {
      options.currencies = currencyParams;
    }

    let rates = await fetchRates(options);

    // Convert the array into an object with date -> currencies mapping
    const ratesObject = rates.reduce((prev: any, cur: any) => {
      prev[cur['Date']] = cur;
      delete prev[cur['Date']].Date;
      return prev;
    }, {});

    return NextResponse.json(ratesObject);
  } catch (error) {
    console.error('Error fetching currency rates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch currency rates' },
      { status: 500 }
    );
  }
}