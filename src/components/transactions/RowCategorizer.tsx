import React, { useState, useEffect } from 'react';
import { Transaction } from '../../types/redux';
import Category from './Category';
import CategorySelect from '../shared/CategorySelect';

interface CategoryOption {
  label: string;
  value: string;
}

interface RowCategorizerProps {
  handleRowCategoryChange: (mapping: { [transactionId: string]: string }) => void;
  showCreateCategoryModal: (name: string, transactionId: string) => void;
  transaction: Transaction;
}

export default function RowCategorizer({
  handleRowCategoryChange,
  showCreateCategoryModal,
  transaction
}: RowCategorizerProps) {
  // Start editing if there's no category assigned
  const [editing, setEditing] = useState(!transaction.categoryGuess && !transaction.categoryConfirmed);
  
  // Update editing state when transaction category changes
  useEffect(() => {
    const hasNoCategory = !transaction.categoryGuess && !transaction.categoryConfirmed;
    setEditing(hasNoCategory);
  }, [transaction.categoryGuess, transaction.categoryConfirmed]);

  const handleEditCategory = () => {
    setEditing(true);
  };

  const handleCategoryChange = (categoryOption: CategoryOption | CategoryOption[] | null) => {
    if (categoryOption && !Array.isArray(categoryOption)) {
      handleRowCategoryChange({ [transaction.id]: categoryOption.value });
      setEditing(false);
    }
  };

  const handleCreateCategory = (name: string) => {
    showCreateCategoryModal(name, transaction.id);
  };

  let categoryConfirmedAsOption: CategoryOption | null = null;
  if (transaction.categoryConfirmed) {
    categoryConfirmedAsOption = {
      label: transaction.categoryConfirmed.name,
      value: transaction.categoryConfirmed.id
    };
  }

  return (
    <React.Fragment>
      {!editing && <Category
        transactionId={transaction.id}
        categoryGuess={transaction.categoryGuess}
        categoryConfirmed={transaction.categoryConfirmed}
        handleRowCategoryChange={handleRowCategoryChange}
        handleEditCategoryForRow={handleEditCategory}
      />}
      {editing && <CategorySelect
        selectedCategory={categoryConfirmedAsOption}
        onChange={handleCategoryChange}
        onCreate={handleCreateCategory}
        focus={true}
        isMulti={false}
      />}
    </React.Fragment>
  );
}
