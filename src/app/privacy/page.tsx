'use client';

import dynamic from 'next/dynamic';
import Loading from '../../components/shared/Loading';

const Privacy = dynamic(() => import('../../components/Privacy'), {
  loading: () => <Loading />
});

export default function PrivacyPage() {
  return <Privacy />;
}