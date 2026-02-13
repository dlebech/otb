import React from 'react';
import Link from 'next/link';

export default function NoData() {
  return (
    <div className="flex flex-wrap gap-6">
      <div className="flex-1">
        <p>No data yet. <Link href="/transactions/add">Add some</Link>.</p>
      </div>
    </div>
  );
}
