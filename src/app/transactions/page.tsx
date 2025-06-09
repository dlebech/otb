'use client';

import dynamic from 'next/dynamic';
import Loading from '../../components/shared/Loading';

const Transactions = dynamic(() => import('../../components/Transactions'), {
  loading: () => <Loading />
});

export default function TransactionsPage() {
  return <Transactions />;
}