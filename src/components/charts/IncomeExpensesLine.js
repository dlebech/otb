import React from 'react';
import PropTypes from 'prop-types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
  XAxis,
  YAxis,
  Legend
} from 'recharts';
import { nest } from 'd3-collection';
import { sum, ascending } from 'd3-array';
import color from '../../data/color'
import { formatNumber } from '../../util';

const EXPENSES_NAME = 'Expenses';
const INCOME_NAME = 'Income';

class IncomeExpensesLine extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      enabledLines: {
        [INCOME_NAME]: true,
        [EXPENSES_NAME]: true
      }
    };

    this.handleLegendClick = this.handleLegendClick.bind(this);
  }

  handleLegendClick(o) {
    this.setState(prevState => {
      return {
        enabledLines: {
          ...prevState.enabledLines,
          [o.value]: !prevState.enabledLines[o.value]
        }
      }
    });
  }

  render() {
    const keySelector = this.props.endDate.diff(this.props.startDate, 'month', true) < 2 ?
      d => d.date :
      d => d.date.substring(0, 7)
    const data = nest()
      .key(keySelector)
      .sortKeys(ascending)
      .rollup(a => {
        return {
          expenses: Math.abs(sum(a, d => (d.amount < 0 ? d.amount : 0))),
          income: sum(a, d => (d.amount >= 0 ? d.amount : 0))
        }
      })
      .entries(this.props.transactions);

    data.forEach(d => {
      d.expenses = d.value.expenses;
      d.income = d.value.income;
      delete d.value;
    });

    return (
      <div className="chart">
        <ResponsiveContainer>
          <LineChart data={data}>
            <XAxis dataKey="key" />
            <YAxis />
            <Legend
              verticalAlign="top"
              onClick={this.handleLegendClick}
            />
            <Tooltip formatter={v => formatNumber(v, { maximumFractionDigits: 0 })} />
            <Line
              type="monotone"
              name={EXPENSES_NAME}
              dataKey={this.state.enabledLines[EXPENSES_NAME] ? 'expenses' : ''}
              fill={color.bootstrap.danger}
              stroke={color.bootstrap.danger}
              dot={false}
            />
            <Line
              type="monotone"
              name={INCOME_NAME}
              dataKey={this.state.enabledLines[INCOME_NAME] ? 'income' : ''}
              fill={color.bootstrap.success}
              stroke={color.bootstrap.success}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
}

IncomeExpensesLine.propTypes = {
  transactions: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired
  })).isRequired
};

export default IncomeExpensesLine;