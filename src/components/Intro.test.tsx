import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Intro from './Intro';
import rootReducer from '../reducers';

// Mock Next.js Link component - following Next.js testing guide
jest.mock('next/link', () => {
  return function MockLink({ children, href, className, ...props }: { children: React.ReactNode; href: string; className?: string; [key: string]: unknown }) {
    return (
      <a href={href} className={className} {...props}>
        {children}
      </a>
    );
  };
});

// Mock FontAwesome to prevent icon loading issues in tests
jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon, className, ...props }: { icon: string; className?: string; [key: string]: unknown }) => (
    <span className={className} data-icon={icon} {...props} />
  )
}));

// Mock react-tooltip
jest.mock('react-tooltip', () => ({
  Tooltip: ({ id, className, ...props }: { id?: string; className?: string; [key: string]: unknown }) => (
    <div data-testid={id} className={className} {...props} />
  )
}));

// Mock the RestoreData component to isolate the Intro component
jest.mock('./manageData/RestoreData', () => {
  return function MockRestoreData({ children, className, ...props }: { children: React.ReactNode; className?: string; [key: string]: unknown }) {
    return (
      <div className={className} data-testid="restore-data" {...props}>
        {children}
      </div>
    );
  };
});

describe('Intro Component', () => {
  const createMockStore = (overrides = {}) => {
    const defaultState = {
      app: {
        storage: {
          localStorage: false
        },
        isTestMode: false
      },
      transactions: {
        version: 1,
        import: {
          data: [],
          skipRows: 0,
          skipDuplicates: true,
          columnSpec: [],
          dateFormat: ''
        },
        data: [],
        categorizer: {
          bayes: ''
        }
      },
      categories: {
        data: []
      },
      accounts: {
        data: []
      },
      edit: {},
      search: {
        transactions: {
          text: '',
          result: []
        }
      }
    };

    // Deep merge overrides
    const mergedState = {
      ...defaultState,
      ...overrides,
      transactions: {
        ...defaultState.transactions,
        ...(overrides as Record<string, unknown>).transactions as Record<string, unknown>
      }
    };

    return configureStore({
      reducer: rootReducer,
      preloadedState: mergedState,
      middleware: (getDefaultMiddleware) => getDefaultMiddleware()
    });
  };

  const renderWithStore = (store: ReturnType<typeof createMockStore>, props = {}) => {
    return render(
      <Provider store={store}>
        <Intro {...props} />
      </Provider>
    );
  };

  describe('when user has no transactions', () => {
    it('renders welcome screen with OTB title', () => {
      const store = createMockStore();
      renderWithStore(store);

      expect(screen.getByRole('heading', { name: 'OTB' })).toBeInTheDocument();
      expect(screen.getByText('Privacy-First Bank Transaction Analysis')).toBeInTheDocument();
    });

    it('displays getting started options', () => {
      const store = createMockStore();
      renderWithStore(store);

      expect(screen.getByRole('link', { name: 'Add Transactions' })).toBeInTheDocument();
      expect(screen.getByTestId('restore-data')).toBeInTheDocument();
      expect(screen.getByText('Demo')).toBeInTheDocument();
    });

    it('shows demo button with tooltip info', () => {
      const store = createMockStore();
      renderWithStore(store);

      const demoButton = screen.getByText('Demo');
      expect(demoButton).toBeInTheDocument();
      
      // Check for tooltip icon (mocked FontAwesome question-circle icon)
      const tooltipIcon = screen.getByTestId('demo-tip');
      expect(tooltipIcon).toBeInTheDocument();
    });

    it('dispatches createTestData action when demo button is clicked', () => {
      const store = createMockStore();
      const dispatchSpy = jest.spyOn(store, 'dispatch');
      
      renderWithStore(store);

      const demoButton = screen.getByText('Demo');
      fireEvent.click(demoButton);

      // createTestData returns a thunk, so we check that dispatch was called
      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      
      // Verify the store state was updated with test data
      const finalState = store.getState();
      expect(finalState.transactions.data.length).toBeGreaterThan(0);
    });
  });

  describe('when user has transactions', () => {
    it('renders welcome back screen for single transaction', () => {
      const store = createMockStore({
        transactions: {
          data: [{ id: '1', description: 'Test transaction' }]
        }
      });
      
      renderWithStore(store);

      expect(screen.getByRole('heading', { name: 'Welcome back!' })).toBeInTheDocument();
      expect(screen.getByText('You have 1 transactions so far.')).toBeInTheDocument();
    });

    it('renders welcome back screen for multiple transactions', () => {
      const store = createMockStore({
        transactions: {
          data: [
            { id: '1', description: 'Transaction 1' },
            { id: '2', description: 'Transaction 2' },
            { id: '3', description: 'Transaction 3' }
          ]
        }
      });
      
      renderWithStore(store);

      expect(screen.getByRole('heading', { name: 'Welcome back!' })).toBeInTheDocument();
      expect(screen.getByText('You have 3 transactions so far.')).toBeInTheDocument();
    });

    it('displays navigation links for existing data', () => {
      const store = createMockStore({
        transactions: {
          data: [{ id: '1', description: 'Test transaction' }]
        }
      });
      
      renderWithStore(store);

      expect(screen.getByRole('link', { name: /Add more transactions/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Existing transactions/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Charts/i })).toBeInTheDocument();
    });

    it('links have correct href attributes', () => {
      const store = createMockStore({
        transactions: {
          data: [{ id: '1', description: 'Test transaction' }]
        }
      });
      
      renderWithStore(store);

      expect(screen.getByRole('link', { name: /Add more transactions/i })).toHaveAttribute('href', '/transactions/add');
      expect(screen.getByRole('link', { name: /Existing transactions/i })).toHaveAttribute('href', '/transactions');
      expect(screen.getByRole('link', { name: /Charts/i })).toHaveAttribute('href', '/charts');
    });
  });

  describe('component props', () => {
    it('renders RestoreData component', () => {
      const store = createMockStore();

      renderWithStore(store);

      expect(screen.getByTestId('restore-data')).toBeInTheDocument();
    });
  });
});