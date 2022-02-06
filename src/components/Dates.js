import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';
import Select from 'react-select';

import 'react-dates/lib/css/_datepicker.css';
import '../css/datepicker.css';

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
  },
  {
    label: `Last Year (${moment().subtract(1, 'year').format('Y')})`,
    value: 'lastYear',
    startDate: moment().subtract(1, 'year').startOf('year'),
    endDate: moment().subtract(1, 'year').endOf('year')
  },
  {
    label: `Previous Year (${moment().subtract(2, 'year').format('Y')})`,
    value: 'previousYear',
    startDate: moment().subtract(2, 'year').startOf('year'),
    endDate: moment().subtract(2, 'year').endOf('year')
  },
  {
    label: 'Since Y2K',
    value: 'sincey2k',
    startDate: moment('2000-01-01'),
    endDate: moment()
  }
];

class Dates extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      focusedInput: null,
      startDate: props.startDate,
      endDate: props.endDate,
    };

    this.handleFocusChange = this.handleFocusChange.bind(this);
    this.handleDatesChange = this.handleDatesChange.bind(this);
    this.handlePresetChange = this.handlePresetChange.bind(this);
  }

  handleDatesChange({ startDate, endDate }) {
    // Reset dates when both are empty.
    if (!startDate && !endDate) {
      return this.props.handleDatesChange(this.props.id, null, null);
    }

    // Clone dates if one is empty. This will make the date update work when one
    // field is initially empty.
    if (!startDate && endDate) startDate = endDate.clone();
    else if (startDate && !endDate) endDate = startDate.clone();

    this.props.handleDatesChange(this.props.id, startDate, endDate);
  }

  handleFocusChange(focusedInput) {
    this.setState({ focusedInput });
  }

  handlePresetChange({ startDate, endDate }, action) {
    if (action.action !== 'select-option') return;
    this.props.handleDatesChange(
      this.props.id,
      startDate,
      endDate
    );
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
            onDatesChange={this.handleDatesChange}
            isOutsideRange={() => false}
            {...this.props.dateProps}
          />
        </div>
        {this.props.showPresets && <div className="col-lg-6 mt-3 mt-lg-0">
          <Select
            name="date-preset"
            options={presets}
            onChange={this.handlePresetChange}
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
