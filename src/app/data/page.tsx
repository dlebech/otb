'use client';

import dynamic from 'next/dynamic';
import Loading from '../../components/shared/Loading';

const ManageData = dynamic(() => import('../../components/ManageData'), {
  loading: () => <Loading />
});

export default function DataPage() {
  return <ManageData />;
}