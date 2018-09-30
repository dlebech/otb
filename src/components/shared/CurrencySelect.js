import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Select from 'react-select';
import * as actions from '../../actions';

class CurrencySelect extends React.Component {
  constructor(props) {
    super(props);
    this.handleCurrencySelect = this.handleCurrencySelect.bind(this);
  }

  componentDidMount() {
    if (!Array.isArray(this.props.currencies) || this.props.currencies.length === 0) {
      this.props.ensureCurrencies();
    }
  }

  handleCurrencySelect(option, action) {
    if (action.action !== 'select-option') return;
    this.props.onChange(option.value);
  }

  render() {
    const currencies = this.props.currencies || [];
    if (currencies.length === 0) return null;

    const options = currencies.map(c => ({ label: c, value: c }));
    const selectedValue = this.props.selectedCurrency ?
      {label: this.props.selectedCurrency, value: this.props.selectedCurrency} : null;

    return (
      <Select
        options={options}
        name="default-currency"
        className="currency-select"
        placeholder="Select currency..."
        onChange={this.handleCurrencySelect}
        value={selectedValue}
      />
    );
  }
};

CurrencySelect.propTypes = {
  onChange: PropTypes.func.isRequired,
  selectedCurrency: PropTypes.string,
  currencies: PropTypes.arrayOf(PropTypes.string)
};

const mapStateToProps = state => {
  return {
    currencies: state.edit.currencies
  };
};

const mapDispatchToProps = dispatch => {
  return {
    ensureCurrencies: () => {
      dispatch(actions.fetchCurrencies());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CurrencySelect);
