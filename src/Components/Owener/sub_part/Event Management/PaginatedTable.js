import React, { useState, useEffect } from 'react';
import './PaginatedTable.css';

const PaginatedTable = ({
    data,
    columns,
    itemsPerPage = 10,
    renderRow,
    emptyMessage = 'No Data Available'
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [displayData, setDisplayData] = useState([]);

    useEffect(() => {
        // Calculate total pages
        const pages = Math.ceil(data.length / itemsPerPage);
        setTotalPages(pages || 1);

        // Reset to first page if data changes and current page is out of bounds
        if (currentPage > pages) {
            setCurrentPage(1);
        }

        // Update displayed data
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setDisplayData(data.slice(startIndex, endIndex));
    }, [data, itemsPerPage, currentPage]);

    // Handle page changes
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Calculate which page numbers to show
    const getPageNumbers = () => {
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        if (currentPage <= 3) {
            return [1, 2, 3, 4, 5, '...', totalPages];
        }

        if (currentPage >= totalPages - 2) {
            return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        }

        return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    };

    if (!data || data.length === 0) {
        return <p className="no-data-message">{emptyMessage}</p>;
    }

    return (
        <div className="paginated-table-container">
            <table className="paginated-table">
                <thead>
                    <tr>
                        {columns.map((column, index) => (
                            <th key={index} style={column.style}>{column.header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {displayData.map((item, index) => renderRow(item, index))}
                </tbody>
            </table>

            {totalPages > 1 && (
                <div className="pagination-controls">
                    <button
                        className="pagination-btn"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>

                    <div className="page-numbers">
                        {getPageNumbers().map((page, index) => (
                            <React.Fragment key={index}>
                                {page === '...' ? (
                                    <span className="ellipsis">...</span>
                                ) : (
                                    <button
                                        className={`page-number ${currentPage === page ? 'active' : ''}`}
                                        onClick={() => goToPage(page)}
                                    >
                                        {page}
                                    </button>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    <button
                        className="pagination-btn"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}

            <div className="pagination-info">
                Showing {displayData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, data.length)} of {data.length} entries
            </div>
        </div>
    );
};

export default PaginatedTable; 