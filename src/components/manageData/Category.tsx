import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Category as CategoryType, Transaction } from '../../types/redux';
import ConfirmDelete from './ConfirmDelete';
import CategoryEdit from './CategoryEdit';

export const NEW_CATEGORY_NAME = 'New Category';

interface CategoryWithTransactionCount extends CategoryType {
  transactionCount: number;
}

interface CategoryProps {
  category: CategoryWithTransactionCount;
  transactions: Transaction[];
  parentCategories: CategoryWithTransactionCount[];
  handleUpdateCategory: (categoryId: string, name: string, parent?: string) => void;
  onDeleteRequest: (category: CategoryWithTransactionCount) => void;
  hasChildren?: boolean;
}

export default function Category({
  category,
  transactions,
  parentCategories,
  handleUpdateCategory,
  onDeleteRequest,
  hasChildren = false
}: CategoryProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [parent, setParent] = useState(category.parent);
  
  const textRef = useRef<HTMLInputElement>(null);

  const handleEditCategory = useCallback(() => {
    setEditing(true);
    setName(category.name);
    setParent(category.parent);
    setTimeout(() => {
      textRef.current?.focus();
    }, 0);
  }, [category.name, category.parent]);

  useEffect(() => {
    // This is the easy way to make sure a new category is in edit mode.
    // However, it might not be best practice.
    if (category.name === NEW_CATEGORY_NAME) {
      handleEditCategory();
    }
  }, [category.name, handleEditCategory]);

  const handleSave = () => {
    handleUpdateCategory(category.id, name, parent);
    setEditing(false);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleParentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setParent(e.target.value);
  };

  const handleDeleteConfirm = () => {
    onDeleteRequest(category);
  };

  if (editing) {
    const validParents = parentCategories
      .filter(c => c.id !== category.id);
    
    return <CategoryEdit
      textRef={textRef}
      categoryName={name}
      categoryParent={parent}
      parentCategories={validParents}
      hasChildren={!!hasChildren}
      handleSave={handleSave}
      handleCancel={handleCancel}
      handleNameChange={handleNameChange}
      handleParentChange={handleParentChange}
    />
  }

  return (
    <section>
      <span
        className="cursor-pointer"
        onClick={handleEditCategory}
      >
        {category.name} ({category.transactionCount})
        <FontAwesomeIcon
          icon="edit"
          className="ms-2"
        />
      </span>
      <FontAwesomeIcon
        icon="trash-alt"
        className="ms-2 cursor-pointer"
        onClick={handleDeleteConfirm}
      />
    </section>
  );
}
