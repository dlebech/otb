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
      <div className="form-group mb-3">
        <label className="form-label">
          Category name:
        </label>
        <input
          type="text"
          className="form-control form-control-sm"
          placeholder="Name of category"
          value={name}
          onChange={handleNameChange}
        />
      </div>
      <div className="form-group mb-3">
        <label className="form-label">
          Parent category:
        </label>
        <select
          className="form-control form-control-sm"
          value={parent}
          onChange={handleParentChange}
        >
          <option value=""></option>
          {parentCategories.map(c => {
            return <option value={c.id} key={`parent-${c.id}`}>{c.name}</option>
          })}
        </select>
      </div>
      <div className="d-flex justify-content-end gap-2">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onHide}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleConfirm}
        >
          Create category
        </button>
      </div>
    </Modal>
  );
}
