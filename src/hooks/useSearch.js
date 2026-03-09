import { useState, useEffect } from 'react';

export function useSearch(entries) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem("searchHistory");
    return saved ? JSON.parse(saved) : [];
  });

  // Persist search history
  useEffect(() => {
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  }, [searchHistory]);

  const getFilteredEntries = () => {
    let result = entries;

    // Apply status filter
    if (statusFilter !== "all") {
      if (statusFilter === "Serviceable") {
        result = result.filter(e => e.conditionStatus === "Serviceable (SVC)");
      } else if (statusFilter === "Unserviceable") {
        result = result.filter(e => e.conditionStatus === "Unserviceable (UNSVC)");
      } else if (statusFilter === "Update") {
        result = result.filter(e => e.conditionStatus === "Update (Masterlist)");
      }
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(entry => {
        if (searchCategory === "all") {
          return (
            entry.entryNumber.toLowerCase().includes(term) ||
            (entry.modelName && entry.modelName.toLowerCase().includes(term)) ||
            entry.serialNumber.toLowerCase().includes(term) ||
            entry.propertyNumber.toLowerCase().includes(term) ||
            (entry.conditionStatus && entry.conditionStatus.toLowerCase().includes(term)) ||
            (entry.remarks && entry.remarks.toLowerCase().includes(term))
          );
        } else if (searchCategory === "entryNumber") {
          return entry.entryNumber.toLowerCase().includes(term);
        } else if (searchCategory === "modelName") {
          return entry.modelName && entry.modelName.toLowerCase().includes(term);
        } else if (searchCategory === "serialNumber") {
          return entry.serialNumber.toLowerCase().includes(term);
        } else if (searchCategory === "propertyNumber") {
          return entry.propertyNumber.toLowerCase().includes(term);
        } else if (searchCategory === "conditionStatus") {
          return entry.conditionStatus && entry.conditionStatus.toLowerCase().includes(term);
        } else if (searchCategory === "remarks") {
          return entry.remarks && entry.remarks.toLowerCase().includes(term);
        }
        return true;
      });
    }

    return result;
  };

  const addToSearchHistory = (term) => {
    const newHistory = [term, ...searchHistory.filter(h => h !== term)].slice(0, 10);
    setSearchHistory(newHistory);
  };

  return {
    searchTerm,
    setSearchTerm,
    searchCategory,
    setSearchCategory,
    statusFilter,
    setStatusFilter,
    searchHistory,
    getFilteredEntries,
    addToSearchHistory
  };
}
