import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { show, hide } from 'redux-modal';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
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
          value={props.categoryName}
          onChange={props.handleChange}
          onKeyDown={e => e.keyCode === 27 && props.handleCancel()}
        />
      </div>
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
};

class Category extends React.Component {
  constructor(props) {
    super(props);

    this.state = { editing: false };

    this.textRef = React.createRef();

    this.handleEditCategory = this.handleEditCategory.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleDeleteConfirm = this.handleDeleteConfirm.bind(this);
    this.handleIgnore = this.handleIgnore.bind(this);
  }

  componentDidMount() {
    // This is the easy way to make sure a new category is in edit mode.
    // However, it might not be best practice.
    if (this.props.category.name === NEW_CATEGORY_NAME) this.handleEditCategory();
  }

  handleEditCategory() {
    this.setState({
      editing: true,
      value: this.props.category.name
    }, () => this.textRef.current.focus());
  }

  handleSave() {
    this.props.handleUpdateCategory(this.props.category.id, this.state.value);
    this.setState({ editing: false });
  }

  handleCancel() {
    this.setState({ editing: false });
  }

  handleChange(e) {
    this.setState({ value: e.target.value });
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

  handleIgnore(e) {
    this.props.handleSetIgnoreCategory(this.props.category.id, e.target.checked);
  }

  render() {
    if (this.state.editing) {
      return <CategoryEdit
        textRef={this.textRef}
        categoryName={this.state.value}
        handleSave={this.handleSave}
        handleCancel={this.handleCancel}
        handleChange={this.handleChange}
      />
    }

    return (
      <li>
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
        <div className="form-check form-check-inline ml-2">
          <input
            id={`ignore-${this.props.category.id}`}
            className="form-check-input"
            type="checkbox"
            onChange={this.handleIgnore}
            checked={!!this.props.category.ignore}
          />
          <label
            htmlFor={`ignore-${this.props.category.id}`}
            className="form-check-label"
          >
            Ignore in stats
          </label>
        </div>
      </li>
    );
  }
}

Category.propTypes = {
  showModal: PropTypes.func.isRequired,
  hideModal: PropTypes.func.isRequired,
  category: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }).isRequired
};

const Categories = props => {
  return (
    <React.Fragment>
      <div className="row">
        <div className="col">
          <ul>
            {props.categories.map(c => {
              return <Category
                key={`cat-${c.id}`}
                category={c}
                transactions={props.transactions}
                handleUpdateCategory={props.handleUpdateCategory}
                handleDeleteCategory={props.handleDeleteCategory}
                handleSetIgnoreCategory={props.handleSetIgnoreCategory}
                showModal={props.showModal}
                hideModal={props.hideModal}
              />
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
    handleUpdateCategory: (categoryId, name) => {
      dispatch(actions.updateCategory(categoryId, name));
    },
    handleAddCategory: name => {
      dispatch(actions.addCategory(name));
    },
    handleDeleteCategory: categoryId => {
      dispatch(actions.deleteCategory(categoryId));
    },
    handleSetIgnoreCategory: (categoryId, ignore) =>  {
      dispatch(actions.setIgnoreCategory(categoryId, ignore));
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
