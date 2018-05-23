import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import 'react-dates/initialize';
import { DateRangePicker, START_DATE } from 'react-dates';

import 'react-dates/lib/css/_datepicker.css';

const DatePreset = props => {
  const isActive = props.startDate.isSame(props.currentStartDate, 'day') &&
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
  currentStartDate: PropTypes.object.isRequired,
  currentEndDate: PropTypes.object.isRequired,
  handleDatesChange: PropTypes.func.isRequired
};

const presets = [3, 2, 1].map(i => {
  const month = moment().subtract(i, 'month');
  return {
    label: month.format('MMM'),
    startDate: month.clone().startOf('month'),
    endDate: month.clone().endOf('month')
  };
}).concat([
  {
    label: `This month so far`,
    startDate: moment().startOf('month'),
    endDate: moment()
  },
  {
    label: `${moment().subtract(3, 'month').format('MMM')} - Now`,
    startDate: moment().subtract(3, 'month').startOf('month'),
    endDate: moment()
  },
]);

class Dates extends React.Component {
  constructor(props) {
    super(props);

    this.state = { focusedInput: START_DATE };

    this.handleFocusChange = this.handleFocusChange.bind(this);
  }

  handleFocusChange(focusedInput) {
    this.setState({ focusedInput });
  }

  render() {
    return (
      <div className="row align-items-center">
        <div className="col-auto">
          <DateRangePicker
            startDate={this.props.startDate}
            startDateId={`${this.props.id}-start-date`}
            endDate={this.props.endDate}
            endDateId={`${this.props.id}-end-date-id`}
            focusedInput={this.state.focusedInput}
            onFocusChange={this.handleFocusChange}
            onDatesChange={this.props.handleDatesChange}
            isOutsideRange={() => false}
          />
        </div>
        <div className="col-auto">
          <div className="btn-group">
            {presets.map(preset => {
              return <DatePreset 
                key={preset.label}
                label={preset.label}
                startDate={preset.startDate}
                endDate={preset.endDate}
                handleDatesChange={this.props.handleDatesChange}
                currentStartDate={this.props.startDate}
                currentEndDate={this.props.endDate}
              />
            })}
          </div>
        </div>
      </div>
    );
  }
}

Dates.propTypes = {
  id: PropTypes.string.isRequired,
  startDate: PropTypes.object.isRequired,
  endDate: PropTypes.object.isRequired,
  handleDatesChange: PropTypes.func.isRequired
};

export default Dates;
