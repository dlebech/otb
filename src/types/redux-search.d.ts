declare module 'redux-search' {
  import { Action, StoreEnhancer } from 'redux';

  export interface SearchState {
    [resourceName: string]: {
      text: string;
      result: string[];
    };
  }

  export function reducer(state: SearchState | undefined, action: Action): SearchState;

  export function createSearchAction(resourceName: string): (searchText: string) => Action;

  export interface ReduxSearchConfig {
    resourceIndexes: Record<string, string[]>;
    resourceSelector: (resourceName: string, state: unknown) => unknown[];
    searchApi?: SearchApi;
  }

  export function reduxSearch(config: ReduxSearchConfig): StoreEnhancer;

  export interface SearchApiOptions {
    matchAnyToken?: boolean;
    indexMode?: string;
    tokenizeString?: (text: string) => string[];
  }

  export class SearchApi {
    constructor(options?: SearchApiOptions);
  }
}
