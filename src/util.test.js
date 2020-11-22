import * as util  from './util';

describe('guessDateFormat', () => {
  it('should guess ISO-format', () => {
    expect(util.guessDateFormat('2018-01-31')).toEqual('YYYY-MM-DD');
  });

  it('should return ISO-format, even with non-hyphen characters', () => {
    expect(util.guessDateFormat('2018/01/31')).toEqual('YYYY-MM-DD');
  });

  it('should use date first for non-iso format (sorry USA :-) )', () => {
    expect(util.guessDateFormat('31-01-2018')).toEqual('DD-MM-YYYY');
  });
});

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

describe('convertCurrency', () => {
  const rates = {
    '2018-01-01': {
      DKK: 7.5,
      SEK: 10
    }
  };

  it('should convert to itself', () => {
    expect(util.convertCurrency(7.5, 'DKK', 'DKK', '2018-01-01', rates))
      .toEqual(7.5);
  });

  it('should convert from two non-EUR currencies', () => {
    expect(util.convertCurrency(7.5, 'DKK', 'SEK', '2018-01-01', rates))
      .toEqual(10);
  });

  it('should convert to EUR', () => {
    expect(util.convertCurrency(7.5, 'DKK', 'EUR', '2018-01-01', rates))
      .toEqual(1);
  });

  it('should convert from EUR', () => {
    expect(util.convertCurrency(1, 'EUR', 'DKK', '2018-01-01', rates))
      .toEqual(7.5);
  });

  it('should throw for dates that do not exist', () => {
    expect(() => util.convertCurrency(7.5, 'DKK', 'SEK', '2018-01-02', rates)).toThrow(
      'Rates for 2018-01-02 do not exist'
    );
  });

  it('should throw for invalid amounts (e.g. from currencies that do not have a value', () => {
    expect(() => util.convertCurrency(7.5, 'DKK', 'BLAH', '2018-01-01', rates)).toThrow(
      'Cannot convert from DKK to BLAH'
    );
  });

  it('should convert 0 to 0', () => {
    expect(util.convertCurrency(0, 'EUR', 'DKK', '2018-01-01', rates))
      .toEqual(0);
  });
});

describe('momentParse', () => {
  it('should support various date inputs, as long as they have the correct date format', () => {
    expect(util.momentParse('13.12.2011', 'DD-MM-YYYY').format('YYYY-MM-DD')).toEqual('2011-12-13');
    expect(util.momentParse('13-12-2011', 'DD-MM-YYYY').format('YYYY-MM-DD')).toEqual('2011-12-13');
    expect(util.momentParse('13/12/2011', 'DD-MM-YYYY').format('YYYY-MM-DD')).toEqual('2011-12-13');
    expect(util.momentParse('12/13/2011', 'MM-DD-YYYY').format('YYYY-MM-DD')).toEqual('2011-12-13');
    expect(util.momentParse('2011-12-13', 'YYYY-MM-DD').format('YYYY-MM-DD')).toEqual('2011-12-13');
    expect(util.momentParse('13 12 2011', 'DD-MM-YYYY').format('YYYY-MM-DD')).toEqual('2011-12-13');
  });

  it('should say that incompatible formats are invalid dates', () => {
    expect(util.momentParse('13/12/2011', 'YYYY-MM-DD').isValid()).toBeFalsy();
  });
});

describe('reverseIndexLookup', () => {
  it('should create an object with array index lookup', () => {
    const arr = [
      { id: 'a' },
      { id: 'b' },
      { id: 'c' },
    ];
    expect(util.reverseIndexLookup(arr)).toEqual({
      a: 0,
      b: 1,
      c: 2
    })
  });
});

describe('reverseIndexLookup', () => {
  it('should create an object with array index lookup', () => {
    const arr = [
      { id: 'a' },
      { id: 'b' },
      { id: 'c' },
    ];
    expect(util.arrayToObjectLookup(arr)).toEqual({
      a: { id: 'a' },
      b: { id: 'b' },
      c: { id: 'c' },
    })
  });
});