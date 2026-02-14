import React from 'react';

interface Props {
  page: number;
  pageSize: number;
  rowCount: number;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (pageSize: number) => void;
}

export default function Pagination({
  page,
  pageSize,
  rowCount,
  handlePageChange,
  handlePageSizeChange
}: Props) {
  const lastPage = Math.ceil(rowCount / pageSize);

  const pages = [];
  // If the current page is 3 or above, go two levels back, except if we're
  // getting close to the final page, in which case we should go 3 or 4 back.
  const pagesLeft = lastPage - page;
  let minPage = page > 2 ? page - 2 : 1;
  if (pagesLeft < 2) {
    minPage -= (2 - pagesLeft);
    if (minPage < 1) minPage = 1;
  }

  // The max page is determined from the min page more easily :-)
  const maxPage = page + (minPage === 1 ? 4 : minPage === 2 ? 3 : 2);

  // Now we can just run through them all.
  for (let i = minPage; i <= maxPage && i <= lastPage; i++) {
    if (pages.length === 5) break;
    const paging = <li
      key={`page-item-${i}`}
    >
      {i === page &&
        <span className="px-3 py-1 rounded border border-blue-600 bg-blue-600 text-white transition-colors">
          {i}
          <span className="sr-only">(current)</span>
        </span>
      }
      {i !== page &&
        <button
          className="px-3 py-1 rounded border border-gray-300 text-blue-600 hover:bg-gray-100 transition-colors"
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      }
    </li>
    pages.push(paging)
  }

  return (
    <nav className="inline-flex items-center">
      <ul className="flex items-center gap-1 mr-4 mb-0">
        <li>
          <button
            className={`px-3 py-1 rounded border border-gray-300 text-blue-600 hover:bg-gray-100 transition-colors${page === 1 ? ' opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => handlePageChange(1)}
            disabled={page === 1}
          >
            <span aria-hidden="true">&laquo;</span>
            <span className="sr-only">First Page</span>
          </button>
        </li>
        <li>
          <button
            className={`px-3 py-1 rounded border border-gray-300 text-blue-600 hover:bg-gray-100 transition-colors${page === 1 ? ' opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            <span aria-hidden="true">&lsaquo;</span>
            <span className="sr-only">Previous Page</span>
          </button>
        </li>
        {pages}
        <li>
          <button
            className={`px-3 py-1 rounded border border-gray-300 text-blue-600 hover:bg-gray-100 transition-colors${page === lastPage ? ' opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => handlePageChange(page + 1)}
            disabled={page === lastPage}
          >
            <span aria-hidden="true">&rsaquo;</span>
            <span className="sr-only">Next Page</span>
          </button>
        </li>
        <li>
          <button
            className={`px-3 py-1 rounded border border-gray-300 text-blue-600 hover:bg-gray-100 transition-colors${page === lastPage ? ' opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => handlePageChange(lastPage)}
            disabled={page === lastPage}
          >
            <span aria-hidden="true">&raquo;</span>
            <span className="sr-only">Last Page</span>
          </button>
        </li>
      </ul>
      <span className="whitespace-nowrap px-2">
        Per Page:
      </span>
      <select
        id="page-size"
        className="block w-full rounded border border-gray-300 px-3 py-1.5 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        value={pageSize}
        onChange={e => handlePageSizeChange(Number(e.target.value))}
      >
        <option value="10">10</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>
    </nav>
  );
}
