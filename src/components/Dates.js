import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import 'react-dates/initialize';
import { DateRangePicker, START_DATE } from 'react-dates';
import Select from 'react-select';

import 'react-dates/lib/css/_datepicker.css';
import '../css/datepicker.css';

const DatePreset = props => {
  const isActive = props.startDate &&
    props.endDate &&
    props.startDate.isSame(props.currentStartDate, 'day') &&
    props.endDate.isSame(props.currentEndDate, 'day');

  const className = `btn ${isActive ? 'btn-secondary' : 'btn-outline-secondary'}`;

  return (
    <button
      className={className}
      onClick={() => props.handleDatesChange({
        startDate: props.startDate,
        endDate: props.endDate
      })}
    >
      {props.label}
    </button>
  );
};

DatePreset.propTypes = {
  label: PropTypes.string.isRequired,
  startDate: PropTypes.object.isRequired,
  endDate: PropTypes.object.isRequired,
  currentStartDate: PropTypes.object,
  currentEndDate: PropTypes.object,
  handleDatesChange: PropTypes.func.isRequired
};

const presets = [
  {
    label: 'This month so far',
    value: 'thisMonth',
    startDate: moment().startOf('month'),
    endDate: moment()
  },
  {
    label: 'Last month',
    value: 'lastMonth',
    startDate: moment().subtract(1, 'month').startOf('month'),
    endDate: moment().subtract(1, 'month').endOf('month')
  },
  {
    label: 'Last 3 Months (excluding current)',
    value: 'last3Months',
    startDate: moment().subtract(3, 'month').startOf('month'),
    endDate: moment().subtract(1, 'month').endOf('month')
  },
  {
    label: 'Last 6 Months (excluding current)',
    value: 'last6Months',
    startDate: moment().subtract(6, 'month').startOf('month'),
    endDate: moment().subtract(1, 'month').endOf('month')
  },
  {
    label: 'Last 12 Months (excluding current)',
    value: 'last12Months',
    startDate: moment().subtract(12, 'month').startOf('month'),
    endDate: moment().subtract(1, 'month').endOf('month')
  }
];

class Dates extends React.Component {
  constructor(props) {
    super(props);

    this.state = { focusedInput: START_DATE };

    this.handleFocusChange = this.handleFocusChange.bind(this);
    this.handlePresetChange = this.handlePresetChange.bind(this);
  }

  handleFocusChange(focusedInput) {
    this.setState({ focusedInput });
  }

  handlePresetChange(option, action) {
    if (action.action !== 'select-option') return;
    this.props.handleDatesChange({
      startDate: option.startDate,
      endDate: option.endDate
    });
  }

  render() {
    const isActive = preset => preset.startDate &&
      preset.endDate &&
      preset.startDate.isSame(this.props.startDate, 'day') &&
      preset.endDate.isSame(this.props.endDate, 'day');
    const selectedOption = presets.find(preset => isActive(preset)) || '';

    return (
      <div className="row align-items-center">
        <div className="col-lg-auto">
          <DateRangePicker
            startDate={this.props.startDate}
            startDateId={`${this.props.id}-start-date`}
            endDate={this.props.endDate}
            endDateId={`${this.props.id}-end-date`}
            focusedInput={this.state.focusedInput}
            onFocusChange={this.handleFocusChange}
            onDatesChange={this.props.handleDatesChange}
            isOutsideRange={() => false}
            {...this.props.dateProps}
          />
        </div>
        {this.props.showPresets && <div className="col-lg-6 mt-3 mt-lg-0">
          <Select
            name="date-preset"
            options={presets}
            onChange={this.handlePresetChange}
            //value={this.state.selectedPreset}
            value={selectedOption}
          />
        </div>}
      </div>
    );
  }
}

Dates.propTypes = {
  id: PropTypes.string.isRequired,
  startDate: PropTypes.object,
  endDate: PropTypes.object,
  handleDatesChange: PropTypes.func.isRequired,
  showPresets: PropTypes.bool,
  dateProps: PropTypes.object
};

Dates.defaultProps = {
  showPresets: true,
  dateProps: {}
};

export default Dates;
