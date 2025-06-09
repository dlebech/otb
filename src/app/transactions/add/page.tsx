'use client';

import dynamic from 'next/dynamic';
import Loading from '../../../components/shared/Loading';

const TransactionAdd = dynamic(() => import('../../../components/TransactionAdd'), {
  loading: () => <Loading />
});

export default function TransactionAddPage() {
  return <TransactionAdd />;
}