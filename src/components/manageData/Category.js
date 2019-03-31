import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import PropTypes from 'prop-types';
import Confirm from '../modals/Confirm';
import ConfirmDelete from './ConfirmDelete';
import CategoryEdit from './CategoryEdit';

export const NEW_CATEGORY_NAME = 'New Category';

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
    this.props.showModal(Confirm.modalName, {
      handleYes: this.handleDelete,
      body: <ConfirmDelete
        nameToDelete={this.props.category.name}
        numTransactions={this.props.category.transactionCount}
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
          <span className="ml-2 badge badge-secondary">{this.props.category.transactionCount}</span>
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
    name: PropTypes.string.isRequired,
    transactionCount: PropTypes.number.isRequired
  }).isRequired,
  transactions: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string
  })),
  parentCategories: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  })).isRequired,
  hasChildren: PropTypes.bool
};

Category.defaultProps = {
  hasChildren: false
};

export default Category;