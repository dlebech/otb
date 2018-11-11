import React from 'react';
import PropTypes from 'prop-types';
import { connectModal } from 'redux-modal';

const NEW_CATEGORY_FOR_ROW = 'newCategoryForRow';

class _NewCategoryForRow extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: props.categoryName,
      parent: ''
    };

    this.handleParentChange = this.handleParentChange.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleConfirm = this.handleConfirm.bind(this);
  }

  handleParentChange(e) {
    this.setState({ parent: e.target.value });
  }

  handleNameChange(e) {
    this.setState({ name: e.target.value });
  }

  handleConfirm() {
    this.props.handleNewRowCategory(
      this.props.rowId,
      this.state.name,
      this.state.parent
    );
  }

  render() {
    if (!this.props.show) return null;

    return (
      <React.Fragment>
        <div className="modal" style={{display: 'block'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-body">
                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <label>
                        Category name:
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Name of category"
                        value={this.state.name}
                        onChange={this.handleNameChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>
                        Parent category:
                      </label>
                      <select
                        className="form-control form-control-sm"
                        value={this.state.parent}
                        onChange={this.handleParentChange}
                      >
                        <option value=""></option>
                        {this.props.parentCategories.map(c => {
                          return <option value={c.id} key={`parent-${c.id}`}>{c.name}</option>
                        })}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <div className="container-fluid">
                  <div className="row justify-content-center">
                    <div className="col-auto">
                      <button
                        type="button"
                        className="btn btn-primary m-1"
                        onClick={this.handleConfirm}
                      >
                        Create category
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary m-1"
                        onClick={this.props.handleHide}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-backdrop show"></div>
      </React.Fragment>
    );
  }
}

_NewCategoryForRow.propTypes = {
  categoryName: PropTypes.string.isRequired,
  parentCategories: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  })).isRequired,
  handleNewRowCategory: PropTypes.func.isRequired,
  rowId: PropTypes.string,
}

const NewCategoryForRow = connectModal({
  name: NEW_CATEGORY_FOR_ROW
})(_NewCategoryForRow)

NewCategoryForRow.modalName = NEW_CATEGORY_FOR_ROW;

export default NewCategoryForRow;