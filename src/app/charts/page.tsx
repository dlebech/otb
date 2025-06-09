'use client';

import dynamic from 'next/dynamic';
import Loading from '../../components/shared/Loading';

const Charts = dynamic(() => import('../../components/Charts'), {
  loading: () => <Loading />
});

export default function ChartsPage() {
  return <Charts />;
}