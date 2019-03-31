import React from 'react';
import { connect } from 'react-redux';
import { show, hide } from 'redux-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as actions from '../../actions';
import Confirm from '../modals/Confirm';
import Category, { NEW_CATEGORY_NAME } from './Category';

const Categories = props => {
  const parentCategories = [];
  const childCategories = {};
  props.categories.forEach(category => {
    if (category.parent) {
      childCategories[category.parent] =
        (childCategories[category.parent] || []).concat([category]);
    } else {
      parentCategories.push(category);
      childCategories[category.id] = childCategories[category.id] || [];
    }
  });

  return (
    <>
      <div className="row">
        <div className="col">
          <p className="small">
            The number after the category name indicates how many
            transactions have been tagged with the category.
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
                    transactions={props.transactions}
                    parentCategories={parentCategories}
                    handleUpdateCategory={props.handleUpdateCategory}
                    handleDeleteCategory={props.handleDeleteCategory}
                    showModal={props.showModal}
                    hideModal={props.hideModal}
                    hasChildren={hasChildren}
                  />
                  {hasChildren &&
                  <ul>
                    {childCategories[c.id].map(childC => {
                      return (
                        <li key={`child-cat-${childC.id}`}>
                          <Category
                            category={childC}
                            transactions={props.transactions}
                            parentCategories={parentCategories}
                            handleUpdateCategory={props.handleUpdateCategory}
                            handleDeleteCategory={props.handleDeleteCategory}
                            showModal={props.showModal}
                            hideModal={props.hideModal}
                          />
                        </li>
                    )})}
                  </ul>}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => props.handleAddCategory(NEW_CATEGORY_NAME)}
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
      <Confirm />
    </>
  );
};

const mapStateToProps = state => {
  const categoryCounts = {};
  state.transactions.data.forEach(t => {
    if (t.category && t.category.confirmed) {
      categoryCounts[t.category.confirmed] = (categoryCounts[t.category.confirmed] || 0) + 1;
    }
  });
  const categories = state.categories.data.map(c => {
    return Object.assign({
      transactionCount: categoryCounts[c.id] || 0
    }, c);
  });

  return {
    categories,
    transactions: state.transactions.data
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleUpdateCategory: (categoryId, name, parentId) => {
      dispatch(actions.updateCategory(categoryId, name, parentId));
    },
    handleAddCategory: name => {
      dispatch(actions.addCategory(name));
    },
    handleDeleteCategory: categoryId => {
      dispatch(actions.deleteCategory(categoryId));
    },
    showModal: (...args) => {
      dispatch(show(...args));
    },
    hideModal: (...args) => {
      dispatch(hide(...args));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Categories);
