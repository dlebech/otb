import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Category as CategoryType } from '../../types/redux';
import CategoryGuessConfirm from './CategoryGuessConfirm';

interface CategoryProps {
  handleRowCategoryChange: (mapping: { [transactionId: string]: string }) => void;
  handleEditCategoryForRow: (transactionId: string) => void;
  transactionId: string;
  categoryGuess?: CategoryType | null;
  categoryConfirmed?: CategoryType | null;
}

/**
 * Showing a confirmed or guessed category.
 */
export default function Category({
  handleRowCategoryChange,
  handleEditCategoryForRow,
  transactionId,
  categoryGuess,
  categoryConfirmed
}: CategoryProps) {
  // 1. If the category has a guess, show that, as well as controls for
  // confirming the guess.
  // 2. If the category is confirmed, show an edit button
  // 3. Otherwise show nothing.
  if (categoryGuess) {
    return <CategoryGuessConfirm
      transactionId={transactionId}
      categoryGuess={categoryGuess}
      handleRowCategoryChange={handleRowCategoryChange}
    />;
  }

  if (categoryConfirmed) {
    return (
      <span
        className="cursor-pointer"
        onClick={() => handleEditCategoryForRow(transactionId)}
      >
        {categoryConfirmed.name}
        <FontAwesomeIcon icon="edit" className="ms-1" fixedWidth />
      </span>
    );
  }

  return null;
}
