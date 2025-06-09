import React, { useState, useCallback } from 'react';
import moment, { Moment } from 'moment';
import 'react-dates/initialize';
import { DateRangePicker } from 'react-dates';
import Select from 'react-select';

import 'react-dates/lib/css/_datepicker.css';
import '../css/datepicker.css';

interface DatePreset {
  label: string;
  value: string;
  startDate: Moment;
  endDate: Moment;
}

const presets: DatePreset[] = [
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

interface DatesProps {
  id: string;
  startDate?: Moment | null;
  endDate?: Moment | null;
  handleDatesChange: (id: string, startDate: Moment | null, endDate: Moment | null) => void;
  showPresets?: boolean;
  dateProps?: any;
}

export default function Dates({
  id,
  startDate,
  endDate,
  handleDatesChange,
  showPresets = true,
  dateProps = {}
}: DatesProps) {
  const [focusedInput, setFocusedInput] = useState<'startDate' | 'endDate' | null>(null);

  const handleDatesChangeInternal = useCallback(({ startDate, endDate }: { startDate: Moment | null, endDate: Moment | null }) => {
    // Reset dates when both are empty.
    if (!startDate && !endDate) {
      return handleDatesChange(id, null, null);
    }

    // Clone dates if one is empty. This will make the date update work when one
    // field is initially empty.
    if (!startDate && endDate) startDate = endDate.clone();
    else if (startDate && !endDate) endDate = startDate.clone();

    handleDatesChange(id, startDate, endDate);
  }, [id, handleDatesChange]);

  const handleFocusChange = useCallback((focusedInput: 'startDate' | 'endDate' | null) => {
    setFocusedInput(focusedInput);
  }, []);

  const handlePresetChange = useCallback((selectedOption: DatePreset | DatePreset[] | null) => {
    if (!selectedOption || Array.isArray(selectedOption)) return;
    handleDatesChange(
      id,
      selectedOption.startDate,
      selectedOption.endDate
    );
  }, [id, handleDatesChange]);

  const isActive = useCallback((preset: DatePreset) => {
    return preset.startDate &&
      preset.endDate &&
      startDate &&
      endDate &&
      preset.startDate.isSame(startDate, 'day') &&
      preset.endDate.isSame(endDate, 'day');
  }, [startDate, endDate]);

  const selectedOption = presets.find(preset => isActive(preset)) || null;

  return (
    <div className="row align-items-center">
      <div className="col-lg-auto">
        <DateRangePicker
          startDate={startDate}
          startDateId={`${id}-start-date`}
          endDate={endDate}
          endDateId={`${id}-end-date`}
          focusedInput={focusedInput}
          onFocusChange={handleFocusChange}
          onDatesChange={handleDatesChangeInternal}
          isOutsideRange={() => false}
          {...dateProps}
        />
      </div>
      {showPresets && <div className="col-lg-6 mt-3 mt-lg-0">
        <Select<DatePreset>
          name="date-preset"
          options={presets}
          onChange={handlePresetChange}
          value={selectedOption}
        />
      </div>}
    </div>
  );
};

