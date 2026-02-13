import React from 'react';
import Link from 'next/link';

export default function NoData() {
  return (
    <div className="flex flex-wrap gap-6">
      <div className="flex-1">
        <p>No data yet. <Link href="/transactions/add" className="inline-flex items-center px-3 py-1 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">Add some</Link></p>
      </div>
    </div>
  );
}
