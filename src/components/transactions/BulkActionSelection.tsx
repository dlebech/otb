import React, { useState } from 'react';
import Select from 'react-select';
import { Transaction } from '../../types/redux';
import CategorySelect from '../shared/CategorySelect';

interface BulkAction {
  value: string;
  label: string;
}

interface CategoryOption {
  value: string;
  label: string;
}

const CONFIRM_CATEGORY_GUESSES = 'confirmCategoryGuesses';
const SET_CATEGORIES = 'setCategories';
const GROUP_TRANSACTIONS = 'groupRows';

interface BulkActionSelectionProps {
  selectedTransactions: Transaction[];
  handleRowCategoryChange: (mapping: { [transactionId: string]: string }) => void;
  showCreateCategoryModal: () => void;
  handleGroupRows: (transactionIds: string[]) => void;
}

export default function BulkActionSelection({
  selectedTransactions,
  handleRowCategoryChange,
  showCreateCategoryModal,
  handleGroupRows
}: BulkActionSelectionProps) {
  const [selectedAction, setSelectedAction] = useState<BulkAction | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption | null>(null);

  const handleActionChange = (option: BulkAction | BulkAction[] | null) => {
    // Since we're not using isMulti, we expect a single option
    const singleOption = Array.isArray(option) ? option[0] : option;
    setSelectedAction(singleOption || null);
  };

  const handleCategorySelect = (categoryOption: CategoryOption | CategoryOption[] | null) => {
    // Since we're not using isMulti, we expect a single option
    const singleOption = Array.isArray(categoryOption) ? categoryOption[0] : categoryOption;
    setSelectedCategory(singleOption || null);
  };

  const confirmCategoryGuesses = () => {
    const transactionCategoryMapping = selectedTransactions.reduce((obj: { [key: string]: string }, t) => {
      if (t.categoryGuess && t.categoryGuess.id) {
        obj[t.id] = t.categoryGuess.id;
      }
      return obj;
    }, {});
    handleRowCategoryChange(transactionCategoryMapping);
  };

  const setCategories = () => {
    if (!selectedCategory) return;
    const transactionCategoryMapping = selectedTransactions.reduce((obj: { [key: string]: string }, t) => {
      obj[t.id] = selectedCategory.value;
      return obj;
    }, {});
    handleRowCategoryChange(transactionCategoryMapping);
  };

  const performAction = () => {
    if (!selectedAction) return;
    switch (selectedAction.value) {
      case CONFIRM_CATEGORY_GUESSES:
        return confirmCategoryGuesses();
      case SET_CATEGORIES:
        return setCategories();
      case GROUP_TRANSACTIONS:
        return handleGroupRows(selectedTransactions.map(t => t.id));
      default:
        return;
    }
  };

  if (selectedTransactions.length === 0) return null;

  const options: BulkAction[] = [
    {
      value: CONFIRM_CATEGORY_GUESSES,
      label: 'Confirm category guesses'
    },
    {
      value: SET_CATEGORIES,
      label: 'Set specific category'
    },
    {
      value: GROUP_TRANSACTIONS,
      label: 'Group transactions'
    }
  ];

  return (
    <div className="form-row align-items-center">
      <div className="col-lg-3 col-md-4">
        <Select
          options={options}
          name="bulk-action"
          className="bulk-action-select"
          placeholder="Select bulk action..."
          onChange={handleActionChange}
          value={selectedAction}
          isSearchable={false}
          isClearable={false}
        />
      </div>
      {selectedAction && selectedAction.value === SET_CATEGORIES &&
        <div className="col-lg-3 col-md-4">
          <CategorySelect
            onChange={handleCategorySelect}
            onCreate={showCreateCategoryModal}
            selectedCategory={selectedCategory}
            isMulti={false}
          />
        </div>
      }
      {selectedAction && 
        <div className="col-auto">
          <button
            type="button"
            className="btn btn-primary"
            onClick={performAction}
          >
            Perform Bulk Action
          </button>
        </div>
      }
    </div>
  );
}
