import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { type AppDispatch } from '../../types/redux';
import Select from 'react-select';
import * as actions from '../../actions';
import type { RootState } from '../../reducers';

interface Props {
  onChange: (currency: string) => void;
  selectedCurrency?: string;
}

export default function CurrencySelect({ onChange, selectedCurrency }: Props) {
  const currencies = useSelector((state: RootState) => state.edit.currencies);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!Array.isArray(currencies) || currencies.length === 0) {
      dispatch(actions.fetchCurrencies());
    }
  }, [currencies, dispatch]);

  const handleCurrencySelect = (value: { label: string; value: string } | { label: string; value: string }[] | null) => {
    if (!value) return;
    // Handle single select (not multi-select)
    if (Array.isArray(value)) return;
    onChange(value.value);
  };

  if (!currencies || currencies.length === 0) return null;

  const options = currencies.map(c => ({ label: c, value: c }));
  const selectedValue = selectedCurrency ?
    { label: selectedCurrency, value: selectedCurrency } : null;

  return (
    <Select
      options={options}
      name="default-currency"
      className="currency-select"
      placeholder="Select currency..."
      onChange={handleCurrencySelect}
      value={selectedValue}
    />
  );
}
