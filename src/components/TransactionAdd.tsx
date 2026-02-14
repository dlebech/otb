import React, { useState, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { type AppDispatch } from '../types/redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as actions from '../actions';
import { detectFileEncoding, cleanNumber, momentParse } from '../util';
import { RootState } from '../reducers';
import Form from './transactionAdd/Form';
import PreviewTable from './transactionAdd/PreviewTable';
import Errors from './transactionAdd/Errors';

interface TransactionAddError {
  type: string;
  message: string;
}

export default function TransactionAdd() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [errors, setErrors] = useState<TransactionAddError[]>([]);

  const {
    transactions,
    account,
    skipRows,
    skipDuplicates,
    columnSpec,
    dateFormat,
    accounts
  } = useSelector((state: RootState) => {
    let transactionsData = state.transactions.import.data;
    if (state.transactions.import.skipRows) {
      transactionsData = transactionsData.slice(state.transactions.import.skipRows);
    }

    return {
      transactions: transactionsData,
      account: state.transactions.import.account,
      skipRows: state.transactions.import.skipRows,
      skipDuplicates: state.transactions.import.skipDuplicates,
      columnSpec: state.transactions.import.columnSpec,
      dateFormat: state.transactions.import.dateFormat,
      accounts: state.accounts.data
    };
  });

  const validateForm = useCallback(() => {
    const newErrors: TransactionAddError[] = [];

    const specTypes = new Set(columnSpec.map((s: { type: string }) => s.type));
    let checkDates = false;
    let checkAmounts = false;

    if (!specTypes.has('date')) {
      newErrors.push({
        type: 'columnSpec',
        message: 'Please select a date column'
      });
    } else {
      checkDates = true;
    }

    if (!specTypes.has('amount')) {
      newErrors.push({
        type: 'columnSpec',
        message: 'Please select an amount column'
      });
    } else {
      checkAmounts = true;
    }

    if (!specTypes.has('description')) {
      newErrors.push({
        type: 'columnSpec',
        message: 'Please select a description column'
      });
    }

    if (checkDates || checkAmounts) {
      const amountIndex = columnSpec.findIndex((c) => c.type === 'amount');
      const dateIndex = columnSpec.findIndex((c) => c.type === 'date');

      for (const t of transactions) {
        if (checkDates && !momentParse(String(t[dateIndex]), dateFormat).isValid()) {
          newErrors.push({
            type: 'date',
            message: `Cannot parse all dates correctly (example: ${t[dateIndex]}), ` +
              'perhaps you need to skip a header, or change the date format?'
          });
          break; // Exit early
        }

        if (checkAmounts && !cleanNumber(t[amountIndex])) {
          newErrors.push({
            type: 'amount',
            message: 'Cannot parse all amounts as numbers, perhaps you need to skip a header?'
          });
          break; // Exit early
        }
      }
    }

    if (!account) {
      newErrors.push({
        type: 'account',
        message: 'Account is required'
      });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  }, [columnSpec, transactions, dateFormat, account]);

  // Re-validate whenever relevant state changes, but only after data is loaded.
  useEffect(() => {
    if (transactions.length > 0) {
      validateForm();
    }
  }, [validateForm, transactions, columnSpec, dateFormat, account]);

  const handleSave = useCallback(() => {
    if (!validateForm()) return;
    dispatch(actions.importSaveTransactions());
    router.push('/transactions');
  }, [validateForm, dispatch, router]);

  const handleCsv = useCallback(async (fileOrString: File | string) => {
    const [encodingResult, Papa] = await Promise.all([
      detectFileEncoding(fileOrString),
      import('papaparse').then(m => m.default)
    ]);

    return new Promise<void>((resolve, reject) => {
      Papa.parse(fileOrString, {
        encoding: encodingResult.encoding,
        skipEmptyLines: true,
        error: (err: Error) => {
          reject(err);
        },
        complete: (result: { errors: { type: string; message: string }[]; data: (string | number)[][] }) => {
          if (result.errors && result.errors.length > 0) {
            return reject(result.errors);
          }
          // Papaparse seems to be quite forgiving around the input format So
          // as an early sanity test, check that the parsed number of columns
          // is the same for all rows.
          if (!result.data.every((d: (string | number)[]) => d.length === result.data[0].length)) {
            return reject([{
              type: 'upload',
              message: 'Cannot parse the file. The number of columns varies between rows'
            }]);
          }
          dispatch(actions.importParseTransactionsEnd(result.data));
          resolve();
        }
      });
    });
  }, [dispatch]);

  const sheetToCsv = useCallback(async (file: File): Promise<string> => {
    const XLSX = await import('xlsx');
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]]);
        resolve(csv);
      };
      reader.readAsArrayBuffer(file);
    });
  }, []);

  const handleFile = useCallback(async (fileInput: File) => {
    try {
      dispatch(actions.importParseTransactionsStart());

      // Full mimetype for Excel sheets is
      // application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
      // but to keep things simple, just search for the word sheet in the type
      // Convert Excel sheets to CSV before parsing.
      let file: File | string = fileInput;
      if (fileInput.type.includes('sheet') || fileInput.name.endsWith('.xlsx') || fileInput.name.endsWith('.xls')) {
        file = await sheetToCsv(fileInput);
      }

      await handleCsv(file);
      setErrors([]);
    } catch (err) {
      dispatch(actions.importParseTransactionsEnd([]));
      const newErrors = Array.isArray(err) ? err : [{
        type: 'upload',
        message: 'Could not parse the transactions file'
      }];
      setErrors(newErrors);
    }
  }, [dispatch, sheetToCsv, handleCsv]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = e.target.files?.[0];
    if (!fileInput) return;
    handleFile(fileInput);
  }, [handleFile]);

  const handleSkipRowsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(actions.importUpdateSkipRows(Number(e.target.value)));
  }, [dispatch]);

  const handleColumnTypeChange = useCallback((columnIndex: number, columnType: string) => {
    dispatch(actions.importUpdateColumnType(columnIndex, columnType));
  }, [dispatch]);

  const handleCancel = useCallback(() => {
    setErrors([]);
    return dispatch(actions.importCancelTransactions());
  }, [dispatch]);

  const handleAccountChange = useCallback((accountId: string) => {
    dispatch(actions.importUpdateAccount(accountId));
  }, [dispatch]);

  const handleDateFormatChange = useCallback((dateFormat: string) => {
    dispatch(actions.importSetDateFormat(dateFormat));
  }, [dispatch]);

  const handleSkipDuplicatesChange = useCallback((checked: boolean) => {
    dispatch(actions.importSetSkipDuplicates(checked));
  }, [dispatch]);

  return (
    <>
      <nav aria-label="breadcrumb">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li>
            <Link href="/transactions" className="text-blue-600 hover:underline">Transactions</Link>
          </li>
          <li className="before:content-['/'] before:mx-2 text-gray-700" aria-current="page">Add</li>
        </ol>
      </nav>
      <Errors errors={errors} />
      <Form
        handleFileChange={handleFileChange}
        handleFile={handleFile}
        handleSkipRowsChange={handleSkipRowsChange}
        handleSkipDuplicatesChange={handleSkipDuplicatesChange}
        handleSave={handleSave}
        handleCancel={handleCancel}
        hasTransactions={!!transactions && transactions.length > 0}
        skipRows={skipRows}
        skipDuplicates={skipDuplicates}
        handleAccountChange={handleAccountChange}
        accounts={accounts}
        selectedAccount={account}
      />
      <PreviewTable
        transactions={transactions}
        columnSpec={columnSpec}
        dateFormat={dateFormat}
        handleColumnTypeChange={handleColumnTypeChange}
        handleDateFormatChange={handleDateFormatChange}
      />
    </>
  );
}
