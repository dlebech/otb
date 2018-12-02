import React from 'react';
import moment from 'moment';
import { shallow } from 'enzyme';
import TransactionTable from './TransactionTable';
import { uncategorized } from '../../data/categories';

jest.mock('redux-modal', () => {
  return {
    connectModal: () => () => () => <span>YOLO</span>
  };
});

const transactions = [
  // Note that this is unsorted for dates.
  {
    id: 'a',
    date: moment('2018-01-02').locale('sv-SE'),
    amount: 1,
    description: 'test a',
    total: 3,
    categoryConfirmed: {
      id: 'a',
      name: 'Food'
    }
  },
  {
    id: 'b',
    date: moment('2018-01-01').locale('sv-SE'),
    amount: 2,
    description: 'test b',
    total: 2,
    categoryConfirmed: {
      id: 'a',
      name: 'Food'
    }
  },
  {
    id: 'c',
    date: moment('2018-01-03').locale('sv-SE'),
    amount: 3,
    description: 'test c',
    total: 6,
  }
];

const categories = {
  a: {
    id: 'a',
    name: 'Food'
  },
  b: {
    id: 'b',
    name: 'Travel'
  }
};

const accounts = {
  a: {
    id: 'a',
    name: 'Default Account'
  }
}

const dateSelect = {
  id: 'transaction-dates'
};

const defaultProps = {
  transactions,
  categories,
  accounts,
  dateSelect,
  page: 1,
  pageSize: 50,
  sortKey: 'date',
  sortAscending: true,
  filterCategories: new Set([]),
  showModal: jest.fn(),
  hideModal: jest.fn(),
  handleIgnoreRow: jest.fn(),
  handleDeleteRow: jest.fn(),
  handleRowCategory: jest.fn(),
  handleFilterCategories: jest.fn(),
  handlePageChange: jest.fn(),
  handlePageSizeChange: jest.fn(),
  transactionGroups: {}
};

it('should show all transaction rows with default sorting', () => {
  const container = shallow(<TransactionTable {...defaultProps} />);
  expect(container.find('TransactionRow').length).toEqual(3);

  expect(container.find('TransactionRow').at(0).dive().find('td').first().text()).toEqual('2018-01-01');
  expect(container.find('TransactionRow').at(1).dive().find('td').first().text()).toEqual('2018-01-02');
  expect(container.find('TransactionRow').at(2).dive().find('td').first().text()).toEqual('2018-01-03');
});

it('should show less rows when page size is smaller', () => {
  const props = Object.assign({}, defaultProps, {
    pageSize: 1
  });

  const container = shallow(
    <TransactionTable
      {...props}
    />
  );

  expect(container.find('TransactionRow').length).toEqual(1);
  expect(container.find('TransactionRow').at(0).dive().find('td').first().text()).toEqual('2018-01-01');
  // First page item should be disabled
  expect(container.find('Pagination').dive().find('.page-item').first().prop('className'))
    .toEqual(expect.stringContaining('disabled'));
  // Last page item should be clickable
  expect(container.find('Pagination').dive().find('.page-item').last().prop('className'))
    .toEqual(expect.not.stringContaining('disabled'));
});

it('should call handlePageSizeChange', () => {
  const container = shallow(
    <TransactionTable
      {...defaultProps}
    />
  );
  
  container.instance().handlePageSizeChange(123);
  expect(defaultProps.handlePageSizeChange.mock.calls.length).toEqual(1);
  expect(defaultProps.handlePageSizeChange.mock.calls[0]).toEqual([123, 3]);
});

it('should show page three', () => {
  const props = Object.assign({}, defaultProps, {
    pageSize: 1,
    page: 3
  });

  const container = shallow(
    <TransactionTable
      {...props}
    />
  );
  expect(container.find('TransactionRow').length).toEqual(1);
  expect(container.find('TransactionRow').dive().find('td').first().text()).toEqual('2018-01-03');

  // First page item should be clickable
  expect(container.find('Pagination').dive().find('.page-item').first().prop('className'))
    .toEqual(expect.not.stringContaining('disabled'));
  // Last page item should be disabled
  expect(container.find('Pagination').dive().find('.page-item').last().prop('className'))
    .toEqual(expect.stringContaining('disabled'));
});

it('should sort descending', () => {
  const props = Object.assign({}, defaultProps, {
    sortAscending: false
  });

  const container = shallow(
    <TransactionTable
      {...props}
    />
  );
  expect(container.find('TransactionRow').first().dive().find('td').first().text()).toEqual('2018-01-03');
  expect(container.find('TransactionRow').last().dive().find('td').first().text()).toEqual('2018-01-01');
});

it('should show only uncategorized', () => {
  const props = Object.assign({}, defaultProps, {
    filterCategories: new Set([uncategorized.id])
  });

  const container = shallow(
    <TransactionTable
      {...props}
    />
  );

  expect(container.find('TransactionRow').length).toEqual(1);
  expect(container.find('TransactionRow').dive().find('td').first().text()).toEqual('2018-01-03');
});

it('should call handleFilterCategories', () => {
  const container = shallow(
    <TransactionTable
      {...defaultProps}
    />
  );

  // Simulate a react-select callback
  container.instance().handleCategorySelect(
    [{ value: uncategorized.id }],
    { action: 'select-option' }
  );
  container.update();
  expect(defaultProps.handleFilterCategories.mock.calls.length).toEqual(1);
  expect(defaultProps.handleFilterCategories.mock.calls[0]).toEqual([
    new Set([uncategorized.id]),
    1 // This is the new number of transactions after filtering the category
  ]);
});

it('should show a specific category', () => {
  const props = Object.assign({}, defaultProps, {
    filterCategories: new Set(['a']) // Fake category ID matching the transactions above
  });

  const container = shallow(
    <TransactionTable
      {...props}
    />
  );

  expect(container.find('TransactionRow').length).toEqual(2);
});

it('should filter by date', () => {
  const props = Object.assign({}, defaultProps, {
    dateSelect: {
      id: 'transaction-dates',
      startDate: moment('2018-01-03').locale('sv-SE'),
      endDate: moment('2018-02-03').locale('sv-SE')
    }
  });

  const container = shallow(
    <TransactionTable
      {...props}
    />
  );

  expect(container.find('TransactionRow').length).toEqual(1);
  expect(container.find('TransactionRow').dive().find('td').first().text()).toEqual('2018-01-03');
});

it('should handle a row select', () => {
  const container = shallow(
    <TransactionTable
      {...defaultProps}
    />
  );

  // Not contained before
  expect(container.state('selectedRows').has('b')).toBeFalsy();

  // Toggle on
  container.instance().handleRowSelect('b');
  expect(container.state('selectedRows').has('b')).toBeTruthy();
  expect(container.find('TransactionRow').at(0).dive().find('tr').prop('className')).toEqual('table-primary')

  // Toggle off
  container.instance().handleRowSelect('b');
  expect(container.state('selectedRows').has('b')).toBeFalsy();
  expect(container.find('TransactionRow').at(0).dive().find('tr').prop('className')).toEqual('')
});
