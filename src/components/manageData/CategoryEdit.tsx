import React from 'react';
import { Category } from '../../data/categories';

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
    <form className="form-inline" onSubmit={e => {
      e.preventDefault();
      handleSave();
    }}>
      <div className="form-group">
        <input
          ref={textRef}
          type="text"
          className="form-control form-control-sm"
          placeholder="Name of category"
          value={categoryName}
          onChange={handleNameChange}
          onKeyDown={e => e.keyCode === 27 && handleCancel()}
        />
      </div>
      {!hasChildren && <div className="form-group ms-2">
        <select
          className="form-control form-control-sm"
          value={categoryParent || ''}
          onChange={handleParentChange}
        >
          <option value="">Parent Category</option>
          {parentCategories.map(c => {
            return <option key={c.id} value={c.id}>{c.name}</option>
          })}
        </select>
      </div>}
      <button type="submit" className="btn btn-success btn-sm mx-2">
        Save
      </button>
      <button
        type="button"
        className="btn btn-danger btn-sm"
        onClick={handleCancel}
      >
        Cancel
      </button>
    </form>
  );
}
