import React, { useState, useEffect } from 'react';
import { Category } from '../../types/redux';
import Modal from '../shared/Modal';

interface NewCategoryForRowProps {
  show: boolean;
  onHide: () => void;
  categoryName: string;
  parentCategories: Category[];
  handleNewRowCategory: (rowId: string, name: string, parent: string) => void;
  rowId: string;
}

export default function NewCategoryForRow({
  show,
  onHide,
  categoryName,
  parentCategories,
  handleNewRowCategory,
  rowId
}: NewCategoryForRowProps) {
  const [name, setName] = useState(categoryName);
  const [parent, setParent] = useState('');

  // Update name state when categoryName prop changes
  useEffect(() => {
    setName(categoryName);
  }, [categoryName]);

  const handleParentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setParent(e.target.value);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleConfirm = () => {
    handleNewRowCategory(rowId, name, parent);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} title="Create New Category">
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">
          Category name:
        </label>
        <input
          type="text"
          className="block w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Name of category"
          value={name}
          onChange={handleNameChange}
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 text-sm font-medium">
          Parent category:
        </label>
        <select
          className="block w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={parent}
          onChange={handleParentChange}
        >
          <option value=""></option>
          {parentCategories.map(c => {
            return <option value={c.id} key={`parent-${c.id}`}>{c.name}</option>
          })}
        </select>
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded font-medium transition-colors bg-gray-600 text-white hover:bg-gray-700 px-4 py-2"
          onClick={onHide}
        >
          Cancel
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 px-4 py-2"
          onClick={handleConfirm}
        >
          Create category
        </button>
      </div>
    </Modal>
  );
}
