import { v4 as uuidv4 } from 'uuid';

export interface Account {
  id: string;
  name: string;
  currency?: string;
}

export const defaultAccount: Account = { 
  id: uuidv4(), 
  name: 'Default Account' 
};
