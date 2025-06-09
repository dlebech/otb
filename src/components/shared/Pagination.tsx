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
      className={`page-item${i === page ? ' active': ''}`}
    >
      {i === page && 
        <span className="page-link">
          {i}
          <span className="sr-only">(current)</span>
        </span>
      }
      {i !== page &&
        <button
          className="page-link"
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      }
    </li>
    pages.push(paging)
  }

  return (
    <nav className="d-inline-flex align-items-center">
      <ul className="pagination me-3 mb-0">
        <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => handlePageChange(1)}
          >
            <span aria-hidden="true">&laquo;</span>
            <span className="sr-only">First Page</span>
          </button>
        </li>
        <li className={`page-item${page === 1 ? ' disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => handlePageChange(page - 1)}
          >
            <span aria-hidden="true">&lsaquo;</span>
            <span className="sr-only">Previous Page</span>
          </button>
        </li>
        {pages}
        <li className={`page-item${page === lastPage ? ' disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => handlePageChange(page + 1)}
          >
            <span aria-hidden="true">&rsaquo;</span>
            <span className="sr-only">Next Page</span>
          </button>
        </li>
        <li className={`page-item${page === lastPage ? ' disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => handlePageChange(lastPage)}
          >
            <span aria-hidden="true">&raquo;</span>
            <span className="sr-only">First Page</span>
          </button>
        </li>
      </ul>
      <span className="text-nowrap px-2">
        Per Page:
      </span>
      <select
        id="page-size"
        className="form-control"
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
