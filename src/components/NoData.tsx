import React from 'react';
import Link from 'next/link';

export default function NoData() {
  return (
    <div className="row">
      <div className="col">
        <p>No data yet. <Link href="/transactions/add">Add some</Link>.</p>
      </div>
    </div>
  );
}
