import uuidv4 from 'uuid/v4';

// These are the base parent categories
export const foodAndDrink = { id: uuidv4(), name: 'Food & Drink' };
export const home = { id: uuidv4(), name: 'Home' };
export const transportation = { id: uuidv4(), name: 'Transportation' };
export const shopping = { id: uuidv4(), name: 'Shopping' }
export const entertainment = { id: uuidv4(), name: 'Entertainment' };
export const travel = { id: uuidv4(), name: 'Travel' };
export const money = { id: uuidv4(), name: 'Money' }

const defaultCategories = [
  // Any list of categories will by definition be opionated in some form. The
  // goal is not to have a complete set of categories but rather a small-ish set
  // of useful categories to get started with.

  // Staying alive
  foodAndDrink,
  { id: uuidv4(), name: 'Groceries', parent: foodAndDrink.id },
  { id: uuidv4(), name: 'Restaurant/Fast-food', parent: foodAndDrink.id },
  { id: uuidv4(), name: 'Bar', parent: foodAndDrink.id },
  { id: uuidv4(), name: 'Cafe', parent: foodAndDrink.id },

  // Getting around
  transportation,
  { id: uuidv4(), name: 'Public Transportation', parent: transportation.id },
  { id: uuidv4(), name: 'Fuel/Gas', parent: transportation.id },
  { id: uuidv4(), name: 'Parking', parent: transportation.id },
  { id: uuidv4(), name: 'Car Loan/Leasing', parent: transportation.id },
  { id: uuidv4(), name: 'Car Maintenance', parent: transportation.id },
  { id: uuidv4(), name: 'Car Insurance', parent: transportation.id },

  // Shelter
  home,
  { id: uuidv4(), name: 'Mortgage', parent: home.id },
  { id: uuidv4(), name: 'Rent', parent: home.id },
  { id: uuidv4(), name: 'Maintenance', parent: home.id },
  { id: uuidv4(), name: 'Insurance', parent: home.id },
  { id: uuidv4(), name: 'Heating', parent: home.id },
  { id: uuidv4(), name: 'Water', parent: home.id },
  { id: uuidv4(), name: 'Electricity', parent: home.id },
  { id: uuidv4(), name: 'Internet', parent: home.id },
  { id: uuidv4(), name: 'Phone', parent: home.id },

  // Shopping
  shopping,
  { id: uuidv4(), name: 'Clothing & Shoes', parent: shopping.id },
  { id: uuidv4(), name: 'Health', parent: shopping.id },
  { id: uuidv4(), name: 'Electronics', parent: shopping.id },
  { id: uuidv4(), name: 'Gifts', parent: shopping.id },
  { id: uuidv4(), name: 'Pets', parent: shopping.id },
  { id: uuidv4(), name: 'Kids', parent: shopping.id },
  { id: uuidv4(), name: 'Garden', parent: shopping.id },

  // Passing time
  entertainment,
  { id: uuidv4(), name: 'Apps & software', parent: entertainment.id },
  { id: uuidv4(), name: 'Games', parent: entertainment.id },
  { id: uuidv4(), name: 'Books', parent: entertainment.id },
  { id: uuidv4(), name: 'Music', parent: entertainment.id },
  { id: uuidv4(), name: 'TV', parent: entertainment.id },
  { id: uuidv4(), name: 'Cinema/theater/concert', parent: entertainment.id },

  // Travel
  travel,
  { id: uuidv4(), name: 'Lodging/hotel/apartment', parent: travel.id },
  { id: uuidv4(), name: 'Tickets', parent: travel.id },

  // The money stuff
  money,
  { id: uuidv4(), name: 'Income', parent: money.id },
  { id: uuidv4(), name: 'Savings', parent: money.id },
  { id: uuidv4(), name: 'Investments', parent: money.id },
  { id: uuidv4(), name: 'Account Transfers', parent: money.id },
  { id: uuidv4(), name: 'Fees', parent: money.id },
  { id: uuidv4(), name: 'Tax', parent: money.id }
];

export default defaultCategories;
