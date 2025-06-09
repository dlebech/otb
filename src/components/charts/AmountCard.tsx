import React from 'react';
import { Tooltip } from 'react-tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatNumber } from '../../util';

interface Account {
  name: string;
  currency: string;
}

interface Amounts {
  amount: number;
  originalAmount: number;
}

interface AmountData {
  account: Account;
  amounts: Amounts;
}

interface AmountTipProps {
  amounts: AmountData[];
  baseCurrency?: string;
}

function AmountTip({ amounts, baseCurrency }: AmountTipProps) {
  if (amounts.length <= 1) return null;

  const id = `amount-tip-${Math.random()}`;
  return (
    <>
      <FontAwesomeIcon
        icon="question-circle"
        className="cursor-help"
        fixedWidth
        data-tooltip-id={id}
        data-tooltip-content=""
      />
      <Tooltip id={id}>
        {amounts.map((a, i) => {
          return (
            <div key={`id-${i}`} className={`${i >= 1 ? 'mt-2' : ''}`}>
              <div>
                {formatNumber(Math.round(Math.abs(a.amounts.originalAmount)))}&nbsp;
                {a.account.currency} ({a.account.name})
              </div>
              {a.amounts.originalAmount !== a.amounts.amount && <div>
                Converted to {formatNumber(Math.round(Math.abs(a.amounts.amount)))} {baseCurrency}
              </div>}
            </div>
          );
        })}
      </Tooltip>
    </>
  );
}

interface AmountCardProps {
  title: string;
  amount: string | number;
  amounts?: AmountData[];
  baseCurrency?: string;
}

export default function AmountCard({ title, amount, amounts = [], baseCurrency }: AmountCardProps) {
  return (
    <div className="card">
      <div className="card-body">
        <p className="display-3">{amount}</p>
        <h5 className="card-title">
          {title}
          <AmountTip amounts={amounts} baseCurrency={baseCurrency} />
        </h5>
      </div>
    </div>
  )
}
