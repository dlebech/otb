import React from 'react';
import { Category } from '../../types/redux';

interface CategoryEditProps {
  textRef: React.RefObject<HTMLInputElement | null>;
  categoryName: string;
  categoryParent?: string;
  parentCategories: Category[];
  hasChildren: boolean;
  handleSave: () => void;
  handleCancel: () => void;
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleParentChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function CategoryEdit({
  textRef,
  categoryName,
  categoryParent,
  parentCategories,
  hasChildren,
  handleSave,
  handleCancel,
  handleNameChange,
  handleParentChange
}: CategoryEditProps) {
  return (
    <form className="flex items-center gap-2" onSubmit={e => {
      e.preventDefault();
      handleSave();
    }}>
      <div className="mb-6">
        <input
          ref={textRef}
          type="text"
          className="block w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Name of category"
          value={categoryName}
          onChange={handleNameChange}
          onKeyDown={e => e.keyCode === 27 && handleCancel()}
        />
      </div>
      {!hasChildren && <div className="mb-6 ml-2">
        <select
          className="block w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={categoryParent || ''}
          onChange={handleParentChange}
        >
          <option value="">Parent Category</option>
          {parentCategories.map(c => {
            return <option key={c.id} value={c.id}>{c.name}</option>
          })}
        </select>
      </div>}
      <button type="submit" className="inline-flex items-center justify-center rounded font-medium transition-colors bg-green-600 text-white hover:bg-green-700 px-3 py-1 text-sm mx-2">
        Save
      </button>
      <button
        type="button"
        className="inline-flex items-center justify-center rounded font-medium transition-colors bg-red-600 text-white hover:bg-red-700 px-3 py-1 text-sm"
        onClick={handleCancel}
      >
        Cancel
      </button>
    </form>
  );
}
