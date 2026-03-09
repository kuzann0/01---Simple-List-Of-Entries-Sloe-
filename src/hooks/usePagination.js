import { useState, useEffect } from 'react';

export function usePagination(items, itemsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when items change
  useEffect(() => {
    setCurrentPage(1);
  }, [items.length]);

  const getTotalPages = () => {
    return Math.ceil(items.length / itemsPerPage);
  };

  const getPaginatedItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };

  const nextPage = () => {
    setCurrentPage(prev => 
      prev < getTotalPages() ? prev + 1 : prev
    );
  };

  const prevPage = () => {
    setCurrentPage(prev => prev > 1 ? prev - 1 : prev);
  };

  const goToPage = (page) => {
    const totalPages = getTotalPages();
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return {
    currentPage,
    setCurrentPage,
    getTotalPages,
    getPaginatedItems,
    nextPage,
    prevPage,
    goToPage
  };
}
