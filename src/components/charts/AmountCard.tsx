import React, { useId } from 'react';
import { Tooltip } from 'react-tooltip';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatNumber } from '../../util';

interface Account {
  name: string;
  currency?: string;
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
  const id = `amount-tip-${useId()}`;
  if (amounts.length <= 1) return null;
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
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="p-6">
        <p className="text-5xl md:text-6xl font-bold">{amount}</p>
        <h5 className="text-lg font-medium mt-2">
          {title}
          <AmountTip amounts={amounts} baseCurrency={baseCurrency} />
        </h5>
      </div>
    </div>
  )
}
