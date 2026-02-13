import { describe, it, expect, beforeEach } from '@jest/globals'
import { configureStore } from '@reduxjs/toolkit'
import * as actions from './actions'
import rootReducer from './reducers'
import { type Transaction } from './types/app'

// Create a proper test store using Redux Toolkit
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState: initialState,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware()
  })
}

// Mock fetch for network requests
global.fetch = jest.fn()

describe('categorizeRows', () => {
  it('should update transaction categories and retrain categorizer', async () => {
    const store = createTestStore({
      transactions: {
        categorizer: {
          bayes: ''
        },
        data: [
          {
            id: 'abcd',
            description: 'origami',
            descriptionCleaned: 'origami',
            category: {
              guess: 'travel',
              confirmed: ''
            }
          },
          {
            id: 'efgh',
            description: 'hotel',
            descriptionCleaned: 'hotel',
            category: {
              guess: 'travel',
              confirmed: ''
            }
          }
        ]
      }
    })

    const initialState = store.getState()
    
    const rowCategoryMapping = {
      abcd: 'hobby',
      efgh: 'travel'
    }

    await store.dispatch(actions.categorizeRows(rowCategoryMapping))
    
    const finalState = store.getState()
    
    // The categorizer should have been updated (bayes string should change)
    expect(finalState.transactions.categorizer.bayes).not.toEqual(initialState.transactions.categorizer.bayes)
    
    // Transaction categories should have been updated in the state
    const updatedTransactions = finalState.transactions.data
    const abcdTransaction = updatedTransactions.find((t: Transaction) => t.id === 'abcd')
    const efghTransaction = updatedTransactions.find((t: Transaction) => t.id === 'efgh')
    
    expect(abcdTransaction?.category.confirmed).toEqual('hobby')
    expect(efghTransaction?.category.confirmed).toEqual('travel')
  })
})

describe('deleteCategory', () => {
  it('should complete delete category workflow', async () => {
    const store = createTestStore({
      transactions: {
        categorizer: {
          bayes: '{"categories":{"hobby":true,"food":true},"docCount":{"hobby":1,"food":1},"totalDocuments":2,"vocabulary":{"origami":true,"apple":true},"vocabularySize":2,"wordCount":{"hobby":1,"food":1},"wordFrequencyCount":{"hobby":{"origami":1},"food":{"apple":1}},"options":{}}'
        },
        data: [
          {
            description: 'apple',
            descriptionCleaned: 'apple',
            category: {
              guess: '',
              confirmed: 'food'
            }
          },
          {
            description: 'origami',
            descriptionCleaned: 'origami',
            category: {
              guess: '',
              confirmed: 'hobby'
            }
          }
        ]
      }
    })

    await store.dispatch(actions.deleteCategory('food'))

    const finalState = store.getState()
    
    // The action should complete successfully
    expect(finalState).toBeDefined()
    
    // If the categorizer exists, it should have been updated
    if (finalState.transactions?.categorizer?.bayes) {
      const bayesData = JSON.parse(finalState.transactions.categorizer.bayes)
      expect(bayesData.categories.food).toBeFalsy()
    }
  })
})

describe('guessAllCategories', () => {
  const baseData = {
    edit: {
      isCategoryGuessing: false,
    },
    transactions: {
      categorizer: {
        // A bayes classifier, trained on apple and origami
        bayes: '{"categories":{"hobby":true,"food":true},"docCount":{"hobby":1,"food":1},"totalDocuments":2,"vocabulary":{"origami":true,"apple":true},"vocabularySize":2,"wordCount":{"hobby":1,"food":1},"wordFrequencyCount":{"hobby":{"origami":1},"food":{"apple":1}},"options":{}}'
      },
      data: [
        {
          id: 'a',
          date: '2023-01-01',
          description: 'more origami',
          descriptionCleaned: 'more origami',
          amount: 10,
          total: 10,
          category: {
            guess: '',
            confirmed: ''
          }
        },
        {
          id: 'b',
          date: '2023-01-02',
          description: 'more origami',
          descriptionCleaned: 'more origami',
          amount: 15,
          total: 15,
          category: {
            guess: '',
            confirmed: 'hobby' // Already classified
          }
        },
        {
          id: 'c',
          date: '2023-01-03',
          description: 'apple apple',
          descriptionCleaned: 'apple apple',
          amount: 5,
          total: 5,
          category: {
            guess: '',
            confirmed: ''
          }
        }
      ]
    }
  }

  it('should not guess categories when insufficient training data', async () => {
    const store = createTestStore(baseData)
    
    await store.dispatch(actions.guessAllCategories())
    
    const finalState = store.getState()
    
    // Transaction categories should remain unchanged
    expect(finalState.transactions.data[0].category.guess).toEqual('')
    expect(finalState.transactions.data[2].category.guess).toEqual('')
  })

  it('should guess categories when forced', async () => {
    const store = createTestStore(baseData)

    await store.dispatch(actions.guessAllCategories(false))
    
    const finalState = store.getState()
    
    // Categories should have been guessed for uncategorized transactions
    const transactionA = finalState.transactions.data.find((t: Transaction) => t.id === 'a')
    const transactionC = finalState.transactions.data.find((t: Transaction) => t.id === 'c')
    
    // These should have category guesses now (likely 'hobby' for origami, 'food' for apple)
    expect(transactionA?.category.guess).not.toEqual('')
    expect(transactionC?.category.guess).not.toEqual('')
  })
})

describe('createTestData', () => {
  it('should populate store with test transactions, accounts, and categories', async () => {
    const store = createTestStore({})
    
    await store.dispatch(actions.createTestData())
    
    const finalState = store.getState()
    
    // Should have added test data to the store
    expect(finalState.transactions?.data?.length).toBeGreaterThan(0)
    expect(finalState.accounts?.data?.length).toBeGreaterThan(0)  
    expect(finalState.categories?.data?.length).toBeGreaterThan(0)
  })
})

describe('fetchCurrencies', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear()
  })

  it('should fetch and set currencies', async () => {
    const store = createTestStore({ edit: { isFetchingCurrencies: false } })
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ['USD', 'JPY']
    })

    await store.dispatch(actions.fetchCurrencies())

    const finalState = store.getState()
    
    // Verify the fetch was called with correct URL
    expect(fetch).toHaveBeenCalledWith('/api/currencies')
    
    // Verify currencies were set in the state
    expect(finalState.edit.currencies).toEqual(['USD', 'JPY'])
    expect(finalState.edit.isFetchingCurrencies).toBe(false)
  })

  it('should handle fetch errors', async () => {
    const store = createTestStore({ edit: { isFetchingCurrencies: false } })
    ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    await expect(store.dispatch(actions.fetchCurrencies())).rejects.toThrow('Network error')
    
    const finalState = store.getState()
    
    // Verify the fetch was called
    expect(fetch).toHaveBeenCalledWith('/api/currencies')
    
    // Verify fetching state was reset on error
    expect(finalState.edit.isFetchingCurrencies).toBe(false)
  })
})

describe('fetchCurrencyRates', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear()
  })

  it('should fetch and set currency rates', async () => {
    const store = createTestStore({ edit: { isFetchingCurrencyRates: false } })
    const rates = {
      '2018-01-01': {
        DKK: 7.5,
        SEK: 9.5
      }
    }
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => rates
    })

    await store.dispatch(actions.fetchCurrencyRates())

    const finalState = store.getState()
    
    // Verify the fetch was called with correct URL
    expect(fetch).toHaveBeenCalledWith('/api/currencyRates')
    
    // Verify currency rates were set in the state
    expect(finalState.edit.currencyRates).toEqual(rates)
    expect(finalState.edit.isFetchingCurrencyRates).toBe(false)
  })

  it('should fetch specific currencies', async () => {
    const store = createTestStore({ edit: { isFetchingCurrencyRates: false } })
    const rates = {
      '2018-01-01': {
        DKK: 7.5,
        SEK: 9.5
      }
    }
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => rates
    })

    await store.dispatch(actions.fetchCurrencyRates(['DKK', 'SEK']))

    const finalState = store.getState()

    expect((fetch as jest.Mock).mock.calls.length).toEqual(1)
    expect(String((fetch as jest.Mock).mock.calls[0][0]))
      .toEqual('/api/currencyRates?currencies=DKK&currencies=SEK')
    
    // Verify currency rates were set in the state
    expect(finalState.edit.currencyRates).toEqual(rates)
    expect(finalState.edit.isFetchingCurrencyRates).toBe(false)
  })

  it('should fill currencies for blank dates', async () => {
    const store = createTestStore({ edit: { isFetchingCurrencyRates: false } })
    const rates = {
      '2018-01-01': {
        DKK: 7.5,
        SEK: 9.5
      },
      '2018-01-03': {
        DKK: 8.5,
        SEK: 10.5
      }
    }
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => rates
    })

    await store.dispatch(actions.fetchCurrencyRates())

    const finalState = store.getState()

    // Verify the fetch was called
    expect(fetch).toHaveBeenCalledWith('/api/currencyRates')
    
    // Verify currency rates include filled missing dates
    expect(finalState.edit.currencyRates).toEqual(expect.objectContaining({
      '2018-01-01': {
        DKK: 7.5,
        SEK: 9.5
      },
      '2018-01-02': {
        DKK: 7.5,
        SEK: 9.5,
        refDate: '2018-01-01'
      },
      '2018-01-03': {
        DKK: 8.5,
        SEK: 10.5
      }
    }))
    expect(finalState.edit.isFetchingCurrencyRates).toBe(false)
  })

  it('should handle fetch errors', async () => {
    const store = createTestStore({ edit: { isFetchingCurrencyRates: false } })
    ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    await expect(store.dispatch(actions.fetchCurrencyRates())).rejects.toThrow('Network error')
    
    const finalState = store.getState()
    
    // Verify the fetch was called
    expect(fetch).toHaveBeenCalledWith('/api/currencyRates')
    
    // Verify fetching state was reset on error
    expect(finalState.edit.isFetchingCurrencyRates).toBe(false)
  })
})