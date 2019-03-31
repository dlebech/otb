import React from 'react';
import PropTypes from 'prop-types';

const CategoryEdit = props => {
  return (
    <form className="form-inline" onSubmit={e => {
      e.preventDefault();
      props.handleSave();
    }}>
      <div className="form-group">
        <input
          ref={props.textRef}
          type="text"
          className="form-control form-control-sm"
          placeholder="Name of category"
          value={props.categoryName}
          onChange={props.handleNameChange}
          onKeyDown={e => e.keyCode === 27 && props.handleCancel()}
        />
      </div>
      {!props.hasChildren && <div className="form-group ml-2">
        <select
          className="form-control form-control-sm"
          value={props.categoryParent}
          onChange={props.handleParentChange}
        >
          <option value="">Parent Category</option>
          {props.parentCategories.map(c => {
            return <option value={c.id}>{c.name}</option>
          })}
        </select>
      </div>}
      <button type="submit" className="btn btn-success btn-sm mx-2">
        Save
      </button>
      <button
        type="button"
        className="btn btn-danger btn-sm"
        onClick={props.handleCancel}
      >
        Cancel
      </button>
    </form>
  );
};

CategoryEdit.propTypes = {
  categoryName: PropTypes.string.isRequired,
  parentCategories: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  })).isRequired,
  hasChildren: PropTypes.bool.isRequired,
  categoryParent: PropTypes.string,
};

export default CategoryEdit;