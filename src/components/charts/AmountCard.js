import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatNumber } from '../../util';

const AmountTip = props => {
  if (props.amounts.length <= 1) return null;

  const id = `amount-tip-${Math.random()}`;
  return (
    <>
      <FontAwesomeIcon
        icon="question-circle"
        className="cursor-help"
        fixedWidth
        data-tip=""
        data-for={id}
      />
      <ReactTooltip id={id}>
        {props.amounts.map((a, i) => {
          return (
            <div className={`${i >= 1 ? 'mt-2' : ''}`}>
              <div>
                {formatNumber(Math.round(Math.abs(a.amounts.originalAmount)))}&nbsp;
                {a.account.currency} ({a.account.name})
              </div>
              {a.amounts.originalAmount !== a.amounts.amount && <div>
                Converted to {formatNumber(Math.round(Math.abs(a.amounts.amount)))} {props.baseCurrency}
              </div>}
            </div>
          );
        })}
      </ReactTooltip>
    </>
  );
};

AmountTip.propTypes = {
  amounts: PropTypes.arrayOf(PropTypes.shape({
    account: PropTypes.shape({
      name: PropTypes.string.isRequired
    }).isRequired,
    amounts: PropTypes.shape({
      amount: PropTypes.number.isRequired,
      originalAmount: PropTypes.number.isRequired
    }).isRequired
  })).isRequired
};

const AmountCard = props => {
  const amounts = props.amounts || [];
  return (
    <div className="card">
      <div className="card-body">
        <p className="display-3">{props.amount}</p>
        <h5 className="card-title">
          {props.title}
          <AmountTip amounts={amounts} />
        </h5>
      </div>
    </div>
  )
};

AmountCard.propTypes = {
  title: PropTypes.string.isRequired,
  amount: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired,
  amounts: PropTypes.arrayOf(PropTypes.shape({
    currency: PropTypes.string,
    amount: PropTypes.number
  }))
};

export default AmountCard;
