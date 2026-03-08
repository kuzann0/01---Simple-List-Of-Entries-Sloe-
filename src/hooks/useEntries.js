import { useState, useEffect } from 'react';

export function useEntries() {
  const [entries, setEntries] = useState(() => {
    const savedEntries = localStorage.getItem("entriesList");
    return savedEntries ? JSON.parse(savedEntries) : [];
  });

  const [exportedEntries, setExportedEntries] = useState(() => {
    const saved = localStorage.getItem("exportedEntries");
    return saved ? JSON.parse(saved) : [];
  });

  const [nextEntryNumber, setNextEntryNumber] = useState("0001");

  // Persist entries to localStorage
  useEffect(() => {
    localStorage.setItem("entriesList", JSON.stringify(entries));
  }, [entries]);

  // Persist exported entries to localStorage
  useEffect(() => {
    localStorage.setItem("exportedEntries", JSON.stringify(exportedEntries));
  }, [exportedEntries]);

  // Calculate next entry number
  useEffect(() => {
    if (entries.length === 0) {
      setNextEntryNumber("0001");
    } else {
      const maxNum = Math.max(...entries.map(e => parseInt(e.entryNumber, 10)));
      const next = String(maxNum + 1).padStart(4, "0");
      setNextEntryNumber(next);
    }
  }, [entries]);

  const addEntry = (newEntry) => {
    setEntries([...entries, newEntry]);
  };

  const updateEntry = (index, updatedEntry) => {
    const updated = [...entries];
    updated[index] = updatedEntry;
    setEntries(updated);
  };

  const deleteEntry = (index) => {
    setEntries(entries.filter((_, i) => i !== index));
  };

  const deleteMultiple = (indices) => {
    setEntries(entries.filter((_, i) => !indices.includes(i)));
  };

  const clearAllEntries = () => {
    setEntries([]);
  };

  const markAsExported = (entryNumbers) => {
    const updated = [...exportedEntries, ...entryNumbers];
    setExportedEntries(updated);
  };

  const resetExportHistory = () => {
    setExportedEntries([]);
  };

  const getNewlyExportedEntries = () => {
    return entries.filter(e => !exportedEntries.includes(e.entryNumber));
  };

  return {
    entries,
    setEntries,
    exportedEntries,
    setExportedEntries,
    nextEntryNumber,
    setNextEntryNumber,
    addEntry,
    updateEntry,
    deleteEntry,
    deleteMultiple,
    clearAllEntries,
    markAsExported,
    resetExportHistory,
    getNewlyExportedEntries
  };
}
