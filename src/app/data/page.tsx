'use client';

import dynamic from 'next/dynamic';
import Loading from '../../components/shared/Loading';
import { usePersistor } from '../../components/ReduxProvider';

const ManageData = dynamic(() => import('../../components/ManageData'), {
  loading: () => <Loading />
});

export default function DataPage() {
  const persistor = usePersistor();
  return <ManageData persistor={persistor} />;
}