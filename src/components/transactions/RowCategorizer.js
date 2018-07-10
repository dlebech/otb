import React from 'react';
import PropTypes from 'prop-types';
import Category from './Category';
import CategorySelect from './CategorySelect';

class RowCategorizer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editing: !props.transaction.categoryGuess && !props.transaction.categoryConfirmed,
      focus: false
    };

    this.handleEditCategory = this.handleEditCategory.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    if (state.editing &&
      (props.transaction.categoryGuess || props.transaction.categoryConfirmed)) {
      // If we're in here, it means that we were previously editing, but now we
      // have a category guess or confirmed category. Thus, we don't want to
      // edit no more.
      return { editing: false, focus: false };
    } else if (!state.editing && 
     (!props.transaction.categoryGuess && !props.transaction.categoryConfirmed)) {
      // If we're in here, it means that we were not previously editing a
      // category, but now we are. We can thus focus the select.
      return { editing: true, focus: true };
    }
    return null;
  }

  handleEditCategory() {
    // We start editing a category by resetting it's category ID.
    this.props.handleRowCategory(this.props.transaction.id, '');
  }

  render() {
    let categoryConfirmedAsOption = null;
    if (this.state.editing && this.props.transaction.categoryConfirmed) {
      categoryConfirmedAsOption = {
        label: this.props.transaction.categoryConfirmed.name,
        value: this.props.transaction.categoryConfirmed.id
      };
    }

    return (
      <React.Fragment>
        {!this.state.editing && <Category
          transactionId={this.props.transaction.id}
          categoryGuess={this.props.transaction.categoryGuess}
          categoryConfirmed={this.props.transaction.categoryConfirmed}
          handleRowCategory={this.props.handleRowCategory}
          handleEditCategoryForRow={this.handleEditCategory}
        />}
        {this.state.editing && <CategorySelect
          transactionId={this.props.transaction.id}
          selectedValue={categoryConfirmedAsOption}
          options={this.props.categoryOptions}
          handleRowCategory={this.props.handleRowCategory}
          focus={this.state.focus}
        />}
      </React.Fragment>
    );
  }
}

RowCategorizer.propTypes = {
  handleRowCategory: PropTypes.func.isRequired,
  transaction: PropTypes.shape({
    categoryGuess: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    }),
    categoryConfirmed: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })
  }).isRequired,
  categoryOptions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired
  })).isRequired
};

export default RowCategorizer;
