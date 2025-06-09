declare module 'redux-search' {
  export function reducer(state: any, action: any): any;
  export function connectSearchBox(reducer: any, stateKey: string): any;
  export function connectSearchBox(reducer: any, stateKey: string, searchStateSelector?: any): any;
  export function createSearchAction(resourceName: string): (searchText: string) => any;
  export function reduxSearch(config: any): any;
  export class SearchApi {
    constructor(options: any);
  }
}
