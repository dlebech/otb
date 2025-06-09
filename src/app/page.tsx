'use client';

import dynamic from 'next/dynamic';
import Loading from '../components/shared/Loading';

const Intro = dynamic(() => import('../components/Intro'), {
  loading: () => <Loading />
});

export default function HomePage() {
  return <Intro />;
}