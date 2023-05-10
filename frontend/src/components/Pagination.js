import React from "react";

const MyPagination = ({ totalItems, currentPage, pageSize, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / pageSize);
    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

    return (
        <nav>
            <ul className="pagination">
                {pages.map((page) => (
                    <li
                        key={page}
                        className={
                            page === currentPage
                                ? "page-item active"
                                : "page-item"
                        }
                    >
                        <a
                            href="#"
                            className="page-link"
                            onClick={() => onPageChange(page)}
                        >
                            {page}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default MyPagination;
