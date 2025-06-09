import { NextRequest, NextResponse } from 'next/server';
import { fetchRates } from '../../../utils/eurofx';

export async function GET(request: NextRequest) {
  try {
    const rates = await fetchRates();
    const currencies = Object.keys(rates[0]).filter(k => k !== 'Date');

    return NextResponse.json(currencies);
  } catch (error) {
    console.error('Error fetching currencies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch currencies' },
      { status: 500 }
    );
  }
}