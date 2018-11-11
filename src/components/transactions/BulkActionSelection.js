import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import CategorySelect from './CategorySelect';

const CONFIRM_CATEGORY_GUESSES = 'confirmCategoryGuesses';
const SET_CATEGORIES = 'setCategories';

class BulkActionSelection extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedAction: null,
      selectedCategory: null
    };

    this.handleActionChange = this.handleActionChange.bind(this);
    this.handleCategorySelect = this.handleCategorySelect.bind(this);
    this.confirmCategoryGuesses = this.confirmCategoryGuesses.bind(this);
    this.setCategories = this.setCategories.bind(this);
    this.performAction = this.performAction.bind(this);
  }

  handleActionChange(option, action) {
    if (action.action !== 'select-option') return;
    this.setState({ selectedAction: option });
  }

  handleCategorySelect(categoryOption) {
    this.setState({ selectedCategory: categoryOption });
  }

  confirmCategoryGuesses() {
    const transactionCategoryMapping = this.props.selectedTransactions.reduce((obj, t) => {
      if (t.categoryGuess && t.categoryGuess.id) obj[t.id] = t.categoryGuess.id;
      return obj;
    }, {});
    this.props.handleRowCategoryChange(transactionCategoryMapping);
  }

  setCategories() {
    if (!this.state.selectedCategory) return;
    const transactionCategoryMapping = this.props.selectedTransactions.reduce((obj, t) => {
      obj[t.id] = this.state.selectedCategory.value;
      return obj;
    }, {});
    this.props.handleRowCategoryChange(transactionCategoryMapping);
  }

  performAction() {
    if (!this.state.selectedAction) return;
    switch (this.state.selectedAction.value) {
      case CONFIRM_CATEGORY_GUESSES:
        return this.confirmCategoryGuesses();
      case SET_CATEGORIES:
        return this.setCategories();
      default:
        return;
    }
  }

  render() {
    if (this.props.selectedTransactions.length === 0) return null; 

    const options = [
      {
        value: CONFIRM_CATEGORY_GUESSES,
        label: 'Confirm category guesses'
      },
      {
        value: SET_CATEGORIES,
        label: 'Set specific category'
      }
    ];

    return (
      <div className="form-row align-items-center">
        <div className="col-lg-3 col-md-4">
          <Select
            options={options}
            name="bulk-action"
            className="bulk-action-select"
            placeholder="Select bulk action..."
            onChange={this.handleActionChange}
            value={this.state.selectedAction}
            isSearchable={false}
            isClearable={false}
          />
        </div>
        {this.state.selectedAction && this.state.selectedAction.value === SET_CATEGORIES &&
          <div className="col-lg-3 col-md-4">
            <CategorySelect
              options={this.props.categoryOptions}
              handleCategoryChange={this.handleCategorySelect}
              handleCreateCategory={this.props.showCreateCategoryModal}
              selectedValue={this.state.selectedCategory}
            />
          </div>
        }
        {this.state.selectedAction && 
          <div className="col-auto">
            <button
              type="button"
              className="btn btn-primary"
              onClick={this.performAction}
            >
              Perform Bulk Action
            </button>
          </div>
        }
      </div>
    );
  }
}

BulkActionSelection.propTypes = {
  selectedTransactions: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    categoryGuess: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    }),
  })).isRequired,
  handleRowCategoryChange: PropTypes.func.isRequired,
  categoryOptions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired
  })).isRequired,
  showCreateCategoryModal: PropTypes.func.isRequired
};

export default BulkActionSelection;
