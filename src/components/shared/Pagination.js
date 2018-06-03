import React from 'react';
import PropTypes from 'prop-types';

const Pagination = props => {
  const lastPage = Math.ceil(props.rowCount / props.pageSize);

  const pages = [];
  // If the current page is 3 or above, go two levels back, except if we're
  // getting close to the final page, in which case we should go 3 or 4 back.
  const pagesLeft = lastPage - props.page;
  let minPage = props.page > 2 ? props.page - 2 : 1;
  if (pagesLeft < 2) {
    minPage -= (2 - pagesLeft);
    if (minPage < 1) minPage = 1;
  }

  // The max page is determined from the min page more easily :-)
  const maxPage = props.page + (minPage === 1 ? 4 : minPage === 2 ? 3 : 2);

  // Now we can just run through them all.
  for (let i = minPage; i <= maxPage && i <= lastPage; i++) {
    if (pages.length === 5) break;
    const paging = <li
      key={`page-item-${i}`}
      className={`page-item${i === props.page ? ' active': ''}`}
    >
      {i === props.page && 
        <span className="page-link">
          {i}
          <span className="sr-only">(current)</span>
        </span>
      }
      {i !== props.page &&
        <button
          className="page-link"
          onClick={() => props.handlePageChange(i)}
        >
          {i}
        </button>
      }
    </li>
    pages.push(paging)
  }

  return (
    <nav className="d-inline-flex align-items-center">
      <ul className="pagination mr-3 mb-0">
        <li className={`page-item${props.page === 1 ? ' disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => props.handlePageChange(props.page - 1)}
          >
            Previous
          </button>
        </li>
        {pages}
        <li className={`page-item${props.page === lastPage ? ' disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => props.handlePageChange(props.page + 1)}
          >
            Next
          </button>
        </li>
      </ul>
      <span className="text-nowrap px-2">
        Per Page:
      </span>
      <select
        id="page-size"
        className="form-control"
        value={props.pageSize}
        onChange={e => props.handlePageSizeChange(Number(e.target.value))}
      >
        <option value="10">10</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>
    </nav>
  );
};

Pagination.propTypes = {
  page: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  rowCount: PropTypes.number.isRequired,
  handlePageChange: PropTypes.func.isRequired,
  handlePageSizeChange: PropTypes.func.isRequired
};

export default Pagination;
