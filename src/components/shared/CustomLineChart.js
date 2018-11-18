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
import color from '../../data/color'
import { formatNumber } from '../../util';

class CustomLineChart extends React.Component {
  constructor(props) {
    super(props);

    const enabledLines = {};
    props.series.forEach(s => enabledLines[s.name] = true);
    this.state = { enabledLines };
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
    return (
      <div className="chart">
        <ResponsiveContainer>
          <LineChart data={this.props.data}>
            <XAxis dataKey="key" />
            <YAxis />
            {this.props.showLegend && <Legend
              verticalAlign="top"
              onClick={this.handleLegendClick}
            />}
            <Tooltip formatter={v => formatNumber(v, { maximumFractionDigits: 0 })} />
            {this.props.series.map(s => {
              const fill = s.fill || color.bootstrap.dark;
              const stroke = s.stroke || color.bootstrap.dark;
              return (
                <Line
                  type="monotone"
                  name={s.name}
                  key={s.name + s.dataKey}
                  dataKey={this.state.enabledLines[s.name] ? s.dataKey : ''}
                  fill={fill}
                  stroke={stroke}
                  dot={false}
                />
              )
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
}

CustomLineChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  series: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    dataKey: PropTypes.string.isRequired,
    fill: PropTypes.string,
    stroke: PropTypes.string
  })).isRequired,
  showLegend: PropTypes.bool
};

CustomLineChart.defaultProps = {
  showLegend: true
};

export default CustomLineChart;