import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import 'react-dates/initialize';
import { DateRangePicker, START_DATE } from 'react-dates';

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
