import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { show, hide } from 'redux-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as actions from '../actions';
import Confirm from './modals/Confirm';

const NEW_CATEGORY_NAME = 'New Category';

const ConfirmDelete = props => {
  return (
    <React.Fragment>
      {props.numTransactions > 0 && <div className="alert alert-danger">
        Deleting &quot;{props.categoryName}&quot; will affect {props.numTransactions} transactions. Their category selection will be reset, and you will have to re-categorize them later.
      </div>}
      Are you sure you want to delete &quot;{props.categoryName}&quot;?
    </React.Fragment>
  );
};

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
  categoryParent: PropTypes.string.isRequired,
  parentCategories: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  })).isRequired,
  hasChildren: PropTypes.bool.isRequired
};

class Category extends React.Component {
  constructor(props) {
    super(props);

    this.state = { editing: false };

    this.textRef = React.createRef();

    this.handleEditCategory = this.handleEditCategory.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleParentChange = this.handleParentChange.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleDeleteConfirm = this.handleDeleteConfirm.bind(this);
  }

  componentDidMount() {
    // This is the easy way to make sure a new category is in edit mode.
    // However, it might not be best practice.
    if (this.props.category.name === NEW_CATEGORY_NAME) this.handleEditCategory();
  }

  handleEditCategory() {
    this.setState({
      editing: true,
      name: this.props.category.name,
      parent: this.props.category.parent
    }, () => this.textRef.current.focus());
  }

  handleSave() {
    this.props.handleUpdateCategory(
      this.props.category.id,
      this.state.name,
      this.state.parent
    );
    this.setState({ editing: false });
  }

  handleCancel() {
    this.setState({ editing: false });
  }

  handleNameChange(e) {
    this.setState({ name: e.target.value });
  }

  handleParentChange(e) {
    this.setState({ parent: e.target.value });
  }

  async handleDelete() {
    await this.props.hideModal(Confirm.modalName);
    return this.props.handleDeleteCategory(this.props.category.id);
  }

  handleDeleteConfirm() {
    const numTransactions = this.props.transactions
      .filter(t => t.category.confirmed === this.props.category.id)
      .length;
    this.props.showModal(Confirm.modalName, {
      handleYes: this.handleDelete,
      body: <ConfirmDelete
        categoryName={this.props.category.name}
        numTransactions={numTransactions}
      />
    });
  }

  render() {
    if (this.state.editing) {
      const validParents = this.props.parentCategories
        .filter(c => c.id !== this.props.category.id)
      return <CategoryEdit
        textRef={this.textRef}
        categoryName={this.state.name}
        categoryParent={this.state.parent}
        parentCategories={validParents}
        hasChildren={!!this.props.hasChildren}
        handleSave={this.handleSave}
        handleCancel={this.handleCancel}
        handleNameChange={this.handleNameChange}
        handleParentChange={this.handleParentChange}
      />
    }

    return (
      <section>
        <span
          className="cursor-pointer"
          onClick={this.handleEditCategory}
        >
          {this.props.category.name}
          <FontAwesomeIcon
            icon="edit"
            className="ml-2"
          />
        </span>
        <FontAwesomeIcon
          icon="trash-alt"
          className="ml-2 cursor-pointer"
          onClick={this.handleDeleteConfirm}
        />
      </section>
    );
  }
}

Category.propTypes = {
  showModal: PropTypes.func.isRequired,
  hideModal: PropTypes.func.isRequired,
  category: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired,
  parentCategories: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  })).isRequired,
  hasChildren: PropTypes.bool
};

Category.defaultProps = {
  hasChildren: false
};

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
    <React.Fragment>
      <div className="row">
        <div className="col">
          <ul>
            {parentCategories.map(c => {
              const hasChildren = 
                Array.isArray(childCategories[c.id]) && !!childCategories[c.id].length;
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
    </React.Fragment>
  );
};

const mapStateToProps = state => {
  return {
    categories: state.categories.data,
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
