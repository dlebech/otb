import React from 'react';
import moment from 'moment';
import configureStore from 'redux-mock-store';
import { MemoryRouter } from 'react-router-dom';
import { shallow, mount } from 'enzyme';
import TransactionTable from './TransactionTable';

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

const defaultProps = {
  transactions,
  categories,
  showModal: jest.fn(),
  hideModal: jest.fn(),
  handleIgnoreRow: jest.fn(),
  handleDeleteRow: jest.fn(),
  handleRowCategory: jest.fn()
};

it('should show transaction rows', () => {
  const container = shallow(<TransactionTable {...defaultProps} />);
  expect(container.find('TransactionRow').length).toEqual(3);
  const rendered = container.render();
  expect(rendered.find('tbody > tr').eq(0).find('td').first().text()).toEqual('2018-01-01');
  expect(rendered.find('tbody > tr').eq(1).find('td').first().text()).toEqual('2018-01-02');
});

it('should show less rows when paginating', () => {
  const container = shallow(
    <TransactionTable
      {...defaultProps}
    />
  );
  container.instance().handlePageSizeChange(1);
  container.update();
  expect(container.find('TransactionRow').length).toEqual(1);
  const rendered = container.render();
  expect(rendered.find('td').first().text()).toEqual('2018-01-01');
  expect(rendered.find('.page-item').first().hasClass('disabled')).toEqual(true);
  expect(rendered.find('.page-item').last().hasClass('disabled')).toEqual(false);
});

it('should show page two', () => {
  const container = shallow(
    <TransactionTable
      {...defaultProps}
    />
  );
  container.instance().handlePageSizeChange(1);
  container.instance().handlePageChange(3);
  container.update();
  expect(container.find('TransactionRow').length).toEqual(1);
  const rendered = container.render();
  expect(rendered.find('td').first().text()).toEqual('2018-01-03');
  expect(rendered.find('.page-item').first().hasClass('disabled')).toEqual(false);
  expect(rendered.find('.page-item').last().hasClass('disabled')).toEqual(true);
});

it('should sort descending', () => {
  const container = shallow(
    <TransactionTable
      {...defaultProps}
    />
  );
  container.instance().handleSortChange('date', false);
  container.update();
  const rendered = container.render();

  expect(rendered.find('tbody > tr').first().find('td').first().text()).toEqual('2018-01-03');
  expect(rendered.find('tbody > tr').last().find('td').first().text()).toEqual('2018-01-01');
});

it('should change page if page size makes a page no longer exist', () => {
  const container = shallow(
    <TransactionTable
      {...defaultProps}
    />
  );
  container.instance().handlePageSizeChange(1);
  container.instance().handlePageChange(2);
  container.instance().handlePageSizeChange(10);
  container.update();
  expect(container.find('TransactionRow').length).toEqual(3);
  const rendered = container.render();
  expect(rendered.find('td').first().text()).toEqual('2018-01-01');
});

it('should show only uncategorized', () => {
  const container = shallow(
    <TransactionTable
      {...defaultProps}
    />
  );
  container.instance().handleShowOnlyUncategorized({ target: { checked: true }});
  container.update();
  expect(container.find('TransactionRow').length).toEqual(1);
  const rendered = container.render();
  expect(rendered.find('td').first().text()).toEqual('2018-01-03');
});