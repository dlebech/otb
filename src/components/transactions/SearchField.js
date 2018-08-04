import React from 'react';
import PropTypes from 'prop-types';

class SearchField extends React.Component {
  constructor(props) {
    super(props);

    // The data from props is actually being stored in state as well, but they
    // are set further down.
    this.state = { searchText: props.searchText };

    this.handleSearch = this.handleSearch.bind(this);
  }

  handleSearch(e) {
    this.setState({ searchText: e.target.value }, () => {
      this.props.handleSearch(this.state.searchText);
    });
  }

  render() {
    return (
      <input
        type="text"
        placeholder="Search for a transaction"
        className="form-control form-col-auto"
        value={this.state.searchText}
        onChange={this.handleSearch}
      />
    );
  }
}

SearchField.propTypes = {
  searchText: PropTypes.string
};

SearchField.defaultProps = {
  searchText: ''
};

export default SearchField;