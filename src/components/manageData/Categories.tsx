import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { type AppDispatch } from '../../types/redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as actions from '../../actions';
import { RootState } from '../../reducers';
import { Category as CategoryType, Transaction } from '../../types/redux';
import ConfirmModal from '../shared/ConfirmModal';
import Category, { NEW_CATEGORY_NAME } from './Category';

interface CategoryWithTransactionCount {
  id: string;
  name: string;
  parent?: string;
  transactionCount: number;
}

export default function Categories() {
  const dispatch = useDispatch<AppDispatch>();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryWithTransactionCount | null>(null);
  
  const categories = useSelector((state: RootState) => {
    const categoryCounts: { [key: string]: number } = {};
    state.transactions.data.forEach((t: Transaction) => {
      if (t.category && t.category.confirmed) {
        categoryCounts[t.category.confirmed] = (categoryCounts[t.category.confirmed] || 0) + 1;
      }
    });
    
    return state.categories.data.map((c: CategoryType) => ({
      ...c,
      transactionCount: categoryCounts[c.id] || 0
    }));
  });
  
  const transactions = useSelector((state: RootState) => state.transactions.data);

  const handleUpdateCategory = (categoryId: string, name: string, parentId?: string) => {
    dispatch(actions.updateCategory(categoryId, name, parentId));
  };

  const handleAddCategory = (name: string) => {
    dispatch(actions.addCategory(name));
  };

  const handleDeleteCategory = (categoryId: string) => {
    dispatch(actions.deleteCategory(categoryId));
    setShowConfirmModal(false);
    setCategoryToDelete(null);
  };

  const handleDeleteRequest = (category: CategoryWithTransactionCount) => {
    setCategoryToDelete(category);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      handleDeleteCategory(categoryToDelete.id);
    }
  };


  const parentCategories: CategoryWithTransactionCount[] = [];
  const childCategories: { [key: string]: CategoryWithTransactionCount[] } = {};
  
  // Add transaction counts to categories
  const categoriesWithCounts = categories.map(category => {
    const transactionCount = transactions.filter(transaction => 
      transaction.category?.confirmed === category.id || 
      transaction.category?.guess === category.id
    ).length;
    
    return {
      ...category,
      transactionCount
    } as CategoryWithTransactionCount;
  });
  
  categoriesWithCounts.forEach(category => {
    if (category.parent) {
      childCategories[category.parent] =
        (childCategories[category.parent] || []).concat([category]);
    } else {
      parentCategories.push(category);
      childCategories[category.id] = childCategories[category.id] || [];
    }
  });

  parentCategories.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <div className="flex flex-wrap gap-6">
        <div className="flex-1">
          <p className="small">
            The number in the parentheses indicates how many transactions
            have been tagged with the category.
          </p>
          <ul>
            {parentCategories.map(c => {
              const hasChildren = 
                Array.isArray(childCategories[c.id]) && !!childCategories[c.id].length;
              // Return a list item with a potential sub-list of child categories.
              return (
                <li key={`cat-${c.id}`}>
                  <Category
                    category={c}
                    transactions={transactions}
                    parentCategories={parentCategories}
                    handleUpdateCategory={handleUpdateCategory}
                    onDeleteRequest={handleDeleteRequest}
                    hasChildren={hasChildren}
                  />
                  {hasChildren &&
                  <ul>
                    {childCategories[c.id]
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map(childC => {
                        return (
                          <li key={`child-cat-${childC.id}`}>
                            <Category
                              category={childC}
                              transactions={transactions}
                              parentCategories={parentCategories}
                              handleUpdateCategory={handleUpdateCategory}
                              onDeleteRequest={handleDeleteRequest}
                            />
                          </li>
                        )
                      })
                    }
                  </ul>}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className="flex flex-wrap gap-6">
        <div className="flex-1">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 text-sm"
            onClick={() => handleAddCategory(NEW_CATEGORY_NAME)}
          >
            <FontAwesomeIcon
              icon="plus"
              className="mr-1"
              fixedWidth
            />
            Add New Category
          </button>
        </div>
      </div>
      <ConfirmModal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        body={
          categoryToDelete ? (
            <>
              {categoryToDelete.transactionCount > 0 && (
                <div className="rounded border border-red-300 bg-red-50 p-6 text-red-800">
                  Deleting "{categoryToDelete.name}" will affect {categoryToDelete.transactionCount} transactions.
                  These transactions will be reset for "{categoryToDelete.name}".
                </div>
              )}
              Are you sure you want to delete "{categoryToDelete.name}"?
            </>
          ) : null
        }
        confirmText="Delete"
        confirmButtonClass="bg-red-600 text-white hover:bg-red-700"
      />
    </>
  );
}
