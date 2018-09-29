import * as util  from './util';

describe('cleanNumber', () => {
  it('should return a number as-is', () => {
    expect(util.cleanNumber(123)).toEqual(123)
    expect(util.cleanNumber(123.456)).toEqual(123.456);
    expect(util.cleanNumber(1000123.456)).toEqual(1000123.456);
  });

  it('should return numbers', () => {
    expect(util.cleanNumber('123')).toEqual(123)
    expect(util.cleanNumber('123.456')).toEqual(123.456);
    expect(util.cleanNumber('1000123.456')).toEqual(1000123.456);
  });

  it('should parse American numbers', () => {
    expect(util.cleanNumber('1,000,234.56')).toEqual(1000234.56);
  });

  it('should parse Swedish numbers', () => {
    expect(util.cleanNumber('1 000 234,56')).toEqual(1000234.56);
  });

  it('should parse Danish numbers', () => {
    expect(util.cleanNumber('1.000.234,56')).toEqual(1000234.56);
  });
});

describe('cleanTransactionDescription', () => {
  it('should remove dates', () => {
    expect(util.cleanTransactionDescription('this is 2018-01-01 cool'))
      .toEqual('this is cool');
    expect(util.cleanTransactionDescription('this is 2018/01/01 cool'))
      .toEqual('this is cool');
    expect(util.cleanTransactionDescription('this is 01/01/2018 cool'))
      .toEqual('this is cool');
    expect(util.cleanTransactionDescription('this is 01-01-2018 cool'))
      .toEqual('this is cool');
    expect(util.cleanTransactionDescription('this is 01012018 cool'))
      .toEqual('this is cool');
    expect(util.cleanTransactionDescription('this is 20180101cool'))
      .toEqual('this is cool');
  });

  it('should remove numbers with 4 or more digits', () => {
    expect(util.cleanTransactionDescription('12346this is 12345 cool12345'))
      .toEqual('this is cool');
  });

  it('should lowercase', () => {
    expect(util.cleanTransactionDescription('this IS cool'))
      .toEqual('this is cool');
  });
});

describe('formatNumber', () => {
  it('should format a number', () => {
    expect(util.formatNumber(1234.56)).toEqual('1,234.56');
  });

  it('should format a number as a string', () => {
    expect(util.formatNumber('1234.56')).toEqual('1,234.56');
  });

  it('should format a currency', () => {
    expect(util.formatNumber(1234.56, { style: 'currency', currency: 'USD' })).toEqual('$1,234.56');
  });
});