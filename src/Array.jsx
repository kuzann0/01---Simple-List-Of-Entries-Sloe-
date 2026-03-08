import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { db } from './firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, onSnapshot } from 'firebase/firestore';



function Array() {
  const [entries, setEntries] = useState([]);

  const [editingIndex, setEditingIndex] = useState(null);
  const [editData, setEditData] = useState({
    entryNumber: "",
    modelName: "",
    serialNumber: "",
    propertyNumber: "",
    conditionStatus: "",
    remarks: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchCategory, setSearchCategory] = useState("all");
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showAddStatusMenu, setShowAddStatusMenu] = useState(false);
  const [addStatusValue, setAddStatusValue] = useState("");
  const [showEditStatusMenu, setShowEditStatusMenu] = useState(false);
  const [nextEntryNumber, setNextEntryNumber] = useState("0001");  const [remarksHistory, setRemarksHistory] = useState(() => {
    const saved = localStorage.getItem("remarksHistory");
    return saved ? JSON.parse(saved) : [];
  });
  const [remarksInput, setRemarksInput] = useState("");
  const [showRemarksHints, setShowRemarksHints] = useState(false);
  const [filteredRemarks, setFilteredRemarks] = useState([]);
  const [modelNameHistory, setModelNameHistory] = useState(() => {
    const saved = localStorage.getItem("modelNameHistory");
    return saved ? JSON.parse(saved) : [];
  });
  const [modelNameInput, setModelNameInput] = useState("");
  const [showModelNameHints, setShowModelNameHints] = useState(false);
  const [filteredModelNames, setFilteredModelNames] = useState([]);
  const [selectedModelNameIndex, setSelectedModelNameIndex] = useState(-1);
  const [selectedRemarksIndex, setSelectedRemarksIndex] = useState(-1);
  const [selectedSearchIndex, setSelectedSearchIndex] = useState(-1);
  const [selectedAddStatusIndex, setSelectedAddStatusIndex] = useState(-1);
  const [selectedEditStatusIndex, setSelectedEditStatusIndex] = useState(-1);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(-1);
  const [downloadCounter, setDownloadCounter] = useState(() => {
    const saved = localStorage.getItem("downloadCounter");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem("searchHistory");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);
  const [addErrors, setAddErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [addEntryNumberEditable, setAddEntryNumberEditable] = useState(false);
  const [editEntryNumberEditable, setEditEntryNumberEditable] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, index: null });
  const [warnings, setWarnings] = useState({ show: false, type: null, message: "", action: null });
  const [notification, setNotification] = useState({ show: false, message: "", type: "info" });
  const [notificationExiting, setNotificationExiting] = useState(false);
  const [fullPageViewMode, setFullPageViewMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(10);
  const [pagesPerDocument, setPagesPerDocument] = useState(1);
  const [mainViewPage, setMainViewPage] = useState(1);
  const [mainEntriesPerPage] = useState(10);
  const [showAddEntryModal, setShowAddEntryModal] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [exportedEntries, setExportedEntries] = useState(() => {
    const saved = localStorage.getItem("exportedEntries");
    return saved ? JSON.parse(saved) : [];
  });
  const [googleAuthToken, setGoogleAuthToken] = useState(() => {
    return localStorage.getItem("googleAuthToken") || null;
  });
  const [googleSheetId, setGoogleSheetId] = useState(() => {
    return localStorage.getItem("googleSheetId") || null;
  });
  const [showGoogleSetup, setShowGoogleSetup] = useState(false);

  // Load entries from Firestore in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "entries"), (snapshot) => {
      const loaded = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEntries(loaded);
    });
    return () => unsubscribe();
  }, []);

  function showNotification(message, type = "info") {
    setNotificationExiting(false);
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotificationExiting(true);
    }, 1800);
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "info" });
      setNotificationExiting(false);
    }, 2400);
  }

  useEffect(() => {
    // Entries are synced with Firestore automatically via onSnapshot listener
  }, [entries]);

  useEffect(() => {
    localStorage.setItem("remarksHistory", JSON.stringify(remarksHistory));
  }, [remarksHistory]);

  useEffect(() => {
    localStorage.setItem("modelNameHistory", JSON.stringify(modelNameHistory));
  }, [modelNameHistory]);

  useEffect(() => {
    localStorage.setItem("downloadCounter", downloadCounter.toString());
  }, [downloadCounter]);

  useEffect(() => {
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  }, [searchHistory]);

  useEffect(() => {
    localStorage.setItem("exportedEntries", JSON.stringify(exportedEntries));
  }, [exportedEntries]);

  useEffect(() => {
    if (googleAuthToken) {
      localStorage.setItem("googleAuthToken", googleAuthToken);
    }
  }, [googleAuthToken]);

  useEffect(() => {
    if (googleSheetId) {
      localStorage.setItem("googleSheetId", googleSheetId);
    }
  }, [googleSheetId]);

  useEffect(() => {
    // Reset main view page when filters change
    setMainViewPage(1);
  }, [searchTerm, statusFilter, dateFilter]);

  useEffect(() => {
    if (entries.length === 0) {
      setNextEntryNumber("0001");
      if (document.getElementById("entryNumber")) {
        document.getElementById("entryNumber").value = "0001";
      }
    } else {
      const numbers = entries
        .map(entry => parseInt(entry.entryNumber, 10))
        .filter(num => !isNaN(num));
      if (numbers.length > 0) {
        const maxNum = Math.max(...numbers);
        const nextNum = (maxNum + 1).toString().padStart(4, '0');
        setNextEntryNumber(nextNum);
        if (document.getElementById("entryNumber")) {
          document.getElementById("entryNumber").value = nextNum;
        }
      }
    }
  }, [entries]);

  function openAddEntryModal() {
    setShowAddEntryModal(true);
    setTimeout(() => {
      const modelNameInput = document.getElementById("modelName");
      if (modelNameInput) {
        modelNameInput.focus();
      }
    }, 50);
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore shortcuts when typing in input fields (except special keys)
      const isInputFocused = document.activeElement?.tagName === 'INPUT' || 
                              document.activeElement?.tagName === 'TEXTAREA';
      
      // Alt+N to open new entry modal
      if (e.altKey && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        e.stopPropagation();
        openAddEntryModal();
        return;
      }

      // Alt+S to focus search bar (fast search activation)
      if (e.altKey && (e.key === 's' || e.key === 'S')) {
        if (!isInputFocused) {
          e.preventDefault();
          e.stopPropagation();
          document.querySelector('.search-bar')?.focus();
          return;
        }
      }

      // Alt+L to clear search (fast clear)
      if (e.altKey && (e.key === 'l' || e.key === 'L')) {
        if (isInputFocused || searchTerm) {
          e.preventDefault();
          e.stopPropagation();
          setSearchTerm("");
          setShowDropdown(false);
          return;
        }
      }

      // Number keys 1-4 for quick status filters (when search not focused)
      if (!isInputFocused && !showAddEntryModal && /^[1-4]$/.test(e.key)) {
        e.preventDefault();
        const filters = ["all", "Serviceable (SVC)", "Unserviceable (UNSVC)", "Update (Masterlist)"];
        setStatusFilter(filters[parseInt(e.key) - 1]);
        return;
      }

      // Escape key to close modal or full page view
      if (e.key === 'Escape') {
        if (showAddEntryModal) {
          e.preventDefault();
          setShowAddEntryModal(false);
          return;
        }
        if (fullPageViewMode) {
          e.preventDefault();
          setFullPageViewMode(false);
          setCurrentPage(1);
          return;
        }
      }

      // Arrow keys for pagination (↓ or Right Arrow for next, ↑ or Left Arrow for previous)
      if (!isInputFocused && (e.key === 'ArrowDown' || e.key === 'ArrowRight')) {
        e.preventDefault();
        if (fullPageViewMode) {
          setCurrentPage(Math.min(getTotalPages(), currentPage + 1));
          return;
        } else if (getFilteredEntries().length > mainEntriesPerPage) {
          setMainViewPage(Math.min(getMainViewTotalPages(), mainViewPage + 1));
          return;
        }
      }

      if (!isInputFocused && (e.key === 'ArrowUp' || e.key === 'ArrowLeft')) {
        e.preventDefault();
        if (fullPageViewMode) {
          setCurrentPage(Math.max(1, currentPage - 1));
          return;
        } else if (getFilteredEntries().length > mainEntriesPerPage) {
          setMainViewPage(Math.max(1, mainViewPage - 1));
          return;
        }
      }

      // Alt+D for Download PDF
      if (e.altKey && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        e.stopPropagation();
        downloadPDF();
        return;
      }

      // Alt+E for Export CSV
      if (e.altKey && (e.key === 'e' || e.key === 'E')) {
        e.preventDefault();
        e.stopPropagation();
        exportToCSV();
        return;
      }

      // Alt+G for Add to Google Sheets
      if (e.altKey && (e.key === 'g' || e.key === 'G')) {
        e.preventDefault();
        e.stopPropagation();
        exportToGoogleSheets();
        return;
      }

      // Alt+F for toggle Full Page View
      if (e.altKey && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        e.stopPropagation();
        if (!fullPageViewMode) {
          setFullPageViewMode(true);
          setCurrentPage(1);
        } else {
          setFullPageViewMode(false);
          setCurrentPage(1);
        }
        return;
      }

      // Alt+B for Bulk Delete mode
      if (e.altKey && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        e.stopPropagation();
        setBulkDeleteMode(!bulkDeleteMode);
        return;
      }

      // Alt+H to show keyboard help
      if (e.altKey && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        e.stopPropagation();
        setShowKeyboardHelp(!showKeyboardHelp);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showAddEntryModal, fullPageViewMode, currentPage, mainViewPage, bulkDeleteMode, searchTerm, statusFilter, showKeyboardHelp]);

  function checkSequenceGaps() {
    if (entries.length < 2) return null;
    
    const numbers = entries
      .map(entry => parseInt(entry.entryNumber, 10))
      .filter(num => !isNaN(num))
      .sort((a, b) => a - b);
    
    const gaps = [];
    for (let i = 0; i < numbers.length - 1; i++) {
      if (numbers[i + 1] - numbers[i] > 1) {
        gaps.push(`Between ${numbers[i]} and ${numbers[i + 1]}`);
      }
    }
    
    return gaps.length > 0 ? gaps : null;
  }

  function extractUniquePartSerial(serialNumber) {
    // Extract unique part - usually the substring after last delimiter
    if (!serialNumber) return "";
    const parts = serialNumber.split(/[-_]/);
    return parts[parts.length - 1].trim();
  }

  function extractNumericPartSerial(serialNumber) {
    // Extract numeric part by removing -M or /M suffix (case-insensitive)
    if (!serialNumber) return "";
    return serialNumber.replace(/[-\/]([Mm])?$/i, "").trim();
  }

  function extractUniquePartProperty(propertyNumber) {
    // Extract unique part - usually the substring after last delimiter
    if (!propertyNumber) return "";
    const parts = propertyNumber.split(/[-_]/);
    return parts[parts.length - 1].trim();
  }

  function extractNumericPartProperty(propertyNumber) {
    // Extract numeric part by removing prefix and suffix
    // Format: 2024-004-03-0897-CO -> extract 0897
    if (!propertyNumber) return "";
    const parts = propertyNumber.split(/[-_]/);
    // The numeric part is typically the second-to-last part before the suffix
    if (parts.length >= 2) {
      return parts[parts.length - 2].trim();
    }
    return propertyNumber.trim();
  }

  function checkUniqueSerialPart(serialNumber, excludeIndex = null) {
    const uniquePart = extractUniquePartSerial(serialNumber);
    if (!uniquePart) return null;
    
    const duplicate = entries.find((entry, idx) => {
      if (excludeIndex !== null && idx === excludeIndex) return false;
      const entryUniquePart = extractUniquePartSerial(entry.serialNumber);
      return entryUniquePart === uniquePart;
    });
    
    return duplicate ? duplicate : null;
  }

  function checkUniquePropertyPart(propertyNumber, excludeIndex = null) {
    const uniquePart = extractUniquePartProperty(propertyNumber);
    if (!uniquePart) return null;
    
    const duplicate = entries.find((entry, idx) => {
      if (excludeIndex !== null && idx === excludeIndex) return false;
      const entryUniquePart = extractUniquePartProperty(entry.propertyNumber);
      return entryUniquePart === uniquePart;
    });
    
    return duplicate ? duplicate : null;
  }

  function checkExactDuplicate(entryData, excludeIndex = null) {
    return entries.some((entry, idx) => {
      if (excludeIndex !== null && idx === excludeIndex) return false;
      return (
        entry.modelName === entryData.modelName &&
        entry.serialNumber === entryData.serialNumber &&
        entry.propertyNumber === entryData.propertyNumber &&
        entry.conditionStatus === entryData.conditionStatus &&
        entry.remarks === entryData.remarks
      );
    });
  }

  function checkSerialPropertyDuplicate(serialNumber, propertyNumber, excludeIndex = null) {
    return entries.some((entry, idx) => {
      if (excludeIndex !== null && idx === excludeIndex) return false;
      return (
        entry.serialNumber === serialNumber &&
        entry.propertyNumber === propertyNumber
      );
    });
  }

  function checkPropertyNumberDuplicate(propertyNumber, excludeIndex = null) {
    const numericPart = extractNumericPartProperty(propertyNumber);
    if (!numericPart) return false;
    
    return entries.some((entry, idx) => {
      if (excludeIndex !== null && idx === excludeIndex) return false;
      const entryNumericPart = extractNumericPartProperty(entry.propertyNumber);
      return entryNumericPart === numericPart;
    });
  }

  function checkSerialNumberDuplicate(serialNumber, excludeIndex = null) {
    const numericPart = extractNumericPartSerial(serialNumber);
    if (!numericPart) return false;
    
    return entries.some((entry, idx) => {
      if (excludeIndex !== null && idx === excludeIndex) return false;
      const entryNumericPart = extractNumericPartSerial(entry.serialNumber);
      return entryNumericPart === numericPart;
    });
  }

  function handleAddEntry() {
    const entryNumberVal = document.getElementById("entryNumber").value;
    const modelNameVal = document.getElementById("modelName").value;
    const serialNumberVal = document.getElementById("serialNumber").value;
    const propertyNumberVal = document.getElementById("propertyNumber").value;
    const remarksVal = document.getElementById("remarks").value;
    
    const errors = {};
    
    if (!entryNumberVal) errors.entryNumber = "Entry No. is required";
    if (!modelNameVal) errors.modelName = "Model Name is required";
    if (!serialNumberVal) errors.serialNumber = "Serial No. is required";
    if (!propertyNumberVal) errors.propertyNumber = "Property No. is required";
    if (!addStatusValue) errors.status = "Service Status is required";
    
    if (Object.keys(errors).length > 0) {
      setAddErrors(errors);
      return;
    }
    
    // Check for duplicate entry number
    if (entries.some(e => e.entryNumber === entryNumberVal)) {
      setAddErrors({ entryNumber: `Entry number ${entryNumberVal} already exists!` });
      return;
    }

    // Check for duplicate serial number
    if (checkSerialNumberDuplicate(serialNumberVal)) {
      showNotification(`Serial No. "${serialNumberVal}" already exists!`, "error");
      return;
    }

    // Check for duplicate property number
    if (checkPropertyNumberDuplicate(propertyNumberVal)) {
      showNotification(`Property Number "${propertyNumberVal}" already exists!`, "error");
      return;
    }

    // Check for duplicate Serial Number + Property Number combination
    if (checkSerialPropertyDuplicate(serialNumberVal, propertyNumberVal)) {
      showNotification(`Serial No. & Property No. combination already exists!`, "error");
      return;
    }

    const now = new Date().toLocaleString();
    const newEntry = {
      id: Date.now(),
      entryNumber: entryNumberVal,
      modelName: modelNameVal,
      serialNumber: serialNumberVal,
      propertyNumber: propertyNumberVal,
      conditionStatus: addStatusValue,
      remarks: remarksVal,
      createdAt: now,
      updatedAt: now
    };

    // Check for exact duplicate (same details)
    if (checkExactDuplicate(newEntry)) {
      showNotification(`Exact duplicate detected! Adding entry anyway.`, "warning");
      addEntryWithWarningAcknowledged(newEntry);
      return;
    }

    // Check for sequence gaps
    const gaps = checkSequenceGaps();
    if (gaps && gaps.length > 0) {
      showNotification(`Entry gaps detected: ${gaps.join(", ")}. Proceeding with entry addition.`, "warning");
      addEntryWithWarningAcknowledged(newEntry);
      return;
    }

    addEntryWithWarningAcknowledged(newEntry);
  }

  function addEntryWithWarningAcknowledged(newEntry) {
    const modelNameVal = newEntry.modelName;
    const remarksVal = newEntry.remarks;

    if (modelNameVal && !modelNameHistory.includes(modelNameVal)) {
      setModelNameHistory([modelNameVal, ...modelNameHistory.slice(0, 9)]);
    }

    if (remarksVal && !remarksHistory.includes(remarksVal)) {
      setRemarksHistory([remarksVal, ...remarksHistory.slice(0, 9)]);
    }

    document.getElementById("entryNumber").value = nextEntryNumber;
    document.getElementById("modelName").value = "";
    document.getElementById("serialNumber").value = "";
    document.getElementById("propertyNumber").value = "";
    document.getElementById("remarks").value = "";
    setModelNameInput("");
    setRemarksInput("");
    setAddStatusValue("");
    setAddErrors({});
    setAddEntryNumberEditable(false);
    setShowAddEntryModal(false);

    // Save to Firestore instead of local state
    addDoc(collection(db, "entries"), {
      entryNumber: newEntry.entryNumber,
      modelName: newEntry.modelName,
      serialNumber: newEntry.serialNumber,
      propertyNumber: newEntry.propertyNumber,
      conditionStatus: newEntry.conditionStatus,
      remarks: newEntry.remarks,
      createdAt: newEntry.createdAt,
      updatedAt: newEntry.updatedAt
    }).then(() => {
      showNotification(`Entry #${newEntry.entryNumber} added successfully!`, "success");
    }).catch(err => {
      showNotification(`Error adding entry: ${err.message}`, "error");
    });
  }
  function handleRemoveEntry(index) {
    setDeleteConfirm({ show: true, index });
  }

  function confirmDelete() {
    if (deleteConfirm.index !== null) {
      const deletedEntry = entries[deleteConfirm.index];
      
      // Delete from Firestore
      deleteDoc(doc(db, "entries", deletedEntry.id)).then(() => {
        setDeleteConfirm({ show: false, index: null });
        showNotification(`Entry #${deletedEntry.entryNumber} deleted successfully!`, "success");
      }).catch(err => {
        showNotification(`Error deleting entry: ${err.message}`, "error");
      });
    }
  }

  function cancelDelete() {
    setDeleteConfirm({ show: false, index: null });
  }

  function handleEditEntry(index) {
    setEditingIndex(index);
    setEditData({ ...entries[index] });
  }

  function handleSaveEdit() {
    const errors = {};
    
    if (!editData.entryNumber) errors.entryNumber = "Entry No. is required";
    if (!editData.modelName) errors.modelName = "Model Name is required";
    if (!editData.serialNumber) errors.serialNumber = "Serial No. is required";
    if (!editData.propertyNumber) errors.propertyNumber = "Property No. is required";
    if (!editData.conditionStatus) errors.status = "Service Status is required";
    
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }
    
    // Check for duplicate entry number (excluding current entry)
    const isDuplicate = entries.some((e, idx) => 
      e.entryNumber === editData.entryNumber && idx !== editingIndex
    );
    if (isDuplicate) {
      setEditErrors({ entryNumber: `Entry number ${editData.entryNumber} already exists!` });
      return;
    }

    // Check for duplicate serial number (excluding current entry)
    if (checkSerialNumberDuplicate(editData.serialNumber, editingIndex)) {
      showNotification(`Serial No. "${editData.serialNumber}" already exists!`, "error");
      return;
    }

    // Check for duplicate property number (excluding current entry)
    if (checkPropertyNumberDuplicate(editData.propertyNumber, editingIndex)) {
      showNotification(`Property Number "${editData.propertyNumber}" already exists!`, "error");
      return;
    }

    // Check for duplicate Serial Number + Property Number combination (excluding current entry)
    if (checkSerialPropertyDuplicate(editData.serialNumber, editData.propertyNumber, editingIndex)) {
      showNotification(`Serial No. & Property No. combination already exists!`, "error");
      return;
    }

    // Check for exact duplicate (same details, excluding current entry)
    if (checkExactDuplicate(editData, editingIndex)) {
      showNotification(`Exact duplicate detected! Saving edit anyway.`, "warning");
      saveEditWithWarningAcknowledged();
      return;
    }

    // Check for sequence gaps
    const gaps = checkSequenceGaps();
    if (gaps && gaps.length > 0) {
      showNotification(`Entry gaps detected: ${gaps.join(", ")}. Proceeding with edit.`, "warning");
      saveEditWithWarningAcknowledged();
      return;
    }

    saveEditWithWarningAcknowledged();
  }

  function saveEditWithWarningAcknowledged() {
    const updatedEntry = {
      ...editData,
      updatedAt: new Date().toLocaleString()
    };

    // Update in Firestore
    updateDoc(doc(db, "entries", editData.id), {
      entryNumber: updatedEntry.entryNumber,
      modelName: updatedEntry.modelName,
      serialNumber: updatedEntry.serialNumber,
      propertyNumber: updatedEntry.propertyNumber,
      conditionStatus: updatedEntry.conditionStatus,
      remarks: updatedEntry.remarks,
      updatedAt: updatedEntry.updatedAt
    }).then(() => {
      setEditingIndex(null);
      setEditErrors({});
      setEditEntryNumberEditable(false);
      setWarnings({ show: false, type: null, message: "", action: null });
      showNotification(`Entry #${updatedEntry.entryNumber} updated successfully!`, "success");
    }).catch(err => {
      showNotification(`Error updating entry: ${err.message}`, "error");
    });
  }

  function handleCancelEdit() {
    setEditingIndex(null);
    setEditEntryNumberEditable(false);
  }

  function handleRemarksChange(value) {
    setRemarksInput(value);
    document.getElementById("remarks").value = value;
    
    if (value.trim()) {
      const filtered = remarksHistory.filter(remark => 
        remark.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredRemarks(filtered);
      setShowRemarksHints(filtered.length > 0);
    } else {
      setShowRemarksHints(false);
    }
  }

  function handleRemarksHintClick(remark) {
    setRemarksInput(remark);
    document.getElementById("remarks").value = remark;
    setShowRemarksHints(false);
  }

  function handleModelNameChange(value) {
    setModelNameInput(value);
    document.getElementById("modelName").value = value;
    
    if (value.trim()) {
      const filtered = modelNameHistory.filter(name => 
        name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredModelNames(filtered);
      setShowModelNameHints(filtered.length > 0);
    } else {
      setShowModelNameHints(false);
    }
  }

  function handleModelNameHintClick(modelName) {
    setModelNameInput(modelName);
    document.getElementById("modelName").value = modelName;
    setShowModelNameHints(false);
    setSelectedModelNameIndex(-1);
  }

  function handleModelNameKeyDown(e) {
    if (!showModelNameHints || filteredModelNames.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedModelNameIndex(prev => 
        prev < filteredModelNames.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedModelNameIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedModelNameIndex >= 0) {
        handleModelNameHintClick(filteredModelNames[selectedModelNameIndex]);
      }
    } else if (e.key === "Escape") {
      setShowModelNameHints(false);
      setSelectedModelNameIndex(-1);
    }
  }

  function handleRemarksKeyDown(e) {
    if (!showRemarksHints || filteredRemarks.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedRemarksIndex(prev => 
        prev < filteredRemarks.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedRemarksIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedRemarksIndex >= 0) {
        handleRemarksHintClick(filteredRemarks[selectedRemarksIndex]);
      }
    } else if (e.key === "Escape") {
      setShowRemarksHints(false);
      setSelectedRemarksIndex(-1);
    }
  }

  function handleSearchKeyDown(e) {
    const filteredResults = getFilteredEntries();
    if (!showDropdown || filteredResults.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSearchIndex(prev => 
        prev < filteredResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSearchIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedSearchIndex >= 0) {
        handleSearchResultClick(filteredResults[selectedSearchIndex]);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setSelectedSearchIndex(-1);
    }
  }

  function handleAddStatusKeyDown(e) {
    const statusOptions = ["Serviceable (SVC)", "Unserviceable (UNSVC)", "Update (Masterlist)"];
    
    if (!showAddStatusMenu) {
      if (e.key === "Enter" || e.key === "ArrowDown") {
        e.preventDefault();
        setShowAddStatusMenu(true);
        setSelectedAddStatusIndex(0);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedAddStatusIndex(prev => 
        prev < statusOptions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedAddStatusIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedAddStatusIndex >= 0) {
        setAddStatusValue(statusOptions[selectedAddStatusIndex]);
        setShowAddStatusMenu(false);
        setSelectedAddStatusIndex(-1);
      }
    } else if (e.key === "Escape") {
      setShowAddStatusMenu(false);
      setSelectedAddStatusIndex(-1);
    }
  }

  function handleEditStatusKeyDown(e) {
    const statusOptions = ["Serviceable (SVC)", "Unserviceable (UNSVC)", "Update (Masterlist)"];
    
    if (!showEditStatusMenu) {
      if (e.key === "Enter" || e.key === "ArrowDown") {
        e.preventDefault();
        setShowEditStatusMenu(true);
        setSelectedEditStatusIndex(0);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedEditStatusIndex(prev => 
        prev < statusOptions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedEditStatusIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedEditStatusIndex >= 0) {
        setEditData({...editData, conditionStatus: statusOptions[selectedEditStatusIndex]});
        setShowEditStatusMenu(false);
        setSelectedEditStatusIndex(-1);
      }
    } else if (e.key === "Escape") {
      setShowEditStatusMenu(false);
      setSelectedEditStatusIndex(-1);
    }
  }

  function handleCategoryKeyDown(e) {
    const categories = ["all", "entryNumber", "modelName", "serialNumber", "propertyNumber", "conditionStatus", "remarks"];
    
    if (!showCategoryMenu) {
      if (e.key === "Enter" || e.key === "ArrowDown") {
        e.preventDefault();
        setShowCategoryMenu(true);
        setSelectedCategoryIndex(0);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedCategoryIndex(prev => 
        prev < categories.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedCategoryIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedCategoryIndex >= 0) {
        setSearchCategory(categories[selectedCategoryIndex]);
        setShowCategoryMenu(false);
        setSelectedCategoryIndex(-1);
      }
    } else if (e.key === "Escape") {
      setShowCategoryMenu(false);
      setSelectedCategoryIndex(-1);
    }
  }

  function handleEditDataChange(field, value) {
    setEditData({ ...editData, [field]: value });
  }

  function getFilteredEntries() {
    let result = entries;
    
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(entry => entry.conditionStatus === statusFilter);
    }
    
    // Apply date filter
    if (dateFilter) {
      result = result.filter(entry => {
        // Extract date from createdAt (e.g., "3/8/2026, 3:45:30 PM" -> "3/8/2026")
        const entryDate = entry.createdAt.split(",")[0];
        return entryDate === dateFilter;
      });
    }
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      
      result = result.filter((entry) => {
        if (searchCategory === "all") {
          return (
            entry.entryNumber.toLowerCase().includes(term) ||
            entry.modelName.toLowerCase().includes(term) ||
            entry.serialNumber.toLowerCase().includes(term) ||
            entry.propertyNumber.toLowerCase().includes(term) ||
            entry.conditionStatus.toLowerCase().includes(term) ||
            entry.remarks.toLowerCase().includes(term)
          );
        } else if (searchCategory === "entryNumber") {
          return entry.entryNumber.toLowerCase().includes(term);
        } else if (searchCategory === "modelName") {
          return entry.modelName.toLowerCase().includes(term);
        } else if (searchCategory === "serialNumber") {
          return entry.serialNumber.toLowerCase().includes(term);
        } else if (searchCategory === "propertyNumber") {
          return entry.propertyNumber.toLowerCase().includes(term);
        } else if (searchCategory === "conditionStatus") {
          return entry.conditionStatus.toLowerCase().includes(term);
        } else if (searchCategory === "remarks") {
          return entry.remarks.toLowerCase().includes(term);
        }
        return true;
      });

      // Sort results to prioritize exact matches for entry numbers
      if (searchCategory === "entryNumber" || searchCategory === "all") {
        result = result.sort((a, b) => {
          const aExact = a.entryNumber.toLowerCase() === term ? 0 : 1;
          const bExact = b.entryNumber.toLowerCase() === term ? 0 : 1;
          if (aExact !== bExact) return aExact - bExact;
          // Secondary sort by entry number descending
          return parseInt(b.entryNumber, 10) - parseInt(a.entryNumber, 10);
        });
        return result;
      }
    }

    // Sort all results by entry number descending (newest first)
    return result.sort((a, b) => {
      return parseInt(b.entryNumber, 10) - parseInt(a.entryNumber, 10);
    });
  }

  function handleSearchResultClick(entry) {
    const element = document.querySelector(`[data-entry-number="${entry.entryNumber}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.style.backgroundColor = '#ffffcc';
      setTimeout(() => {
        element.style.backgroundColor = '';
      }, 2000);
    }
    setShowDropdown(false);
    
    // Add to search history
    const newHistory = [searchTerm, ...searchHistory.filter(h => h !== searchTerm)].slice(0, 10);
    setSearchHistory(newHistory);
  }

  function exportToCSV() {
    if (entries.length === 0) {
      alert("No entries to export");
      return;
    }
    
    const headers = ["Entry No.", "Model Name", "Serial No.", "Property No.", "Service Status", "Remarks", "Created", "Updated"];
    const rows = entries.map(e => [
      e.entryNumber,
      e.modelName || "",
      e.serialNumber,
      e.propertyNumber,
      e.conditionStatus,
      e.remarks,
      e.createdAt || "",
      e.updatedAt || ""
    ]);
    
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${new Date().toISOString().split('T')[0]} - entries.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // OAuth 2.0 Configuration from Environment Variables
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";
  const SCOPES = ["https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/userinfo.email"];
  
  // Initialize Google authentication on component mount
  useEffect(() => {
    initializeGoogleAuth();
  }, []);

  function initializeGoogleAuth() {
    try {
      // Load Google Identity Services library if not already loaded
      if (!window.google) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          initGoogleSignIn();
        };
        document.head.appendChild(script);
      } else {
        initGoogleSignIn();
      }
    } catch (err) {
      console.error("Error loading Google Auth:", err);
    }
  }

  function initGoogleSignIn() {
    try {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleSignInResponse,
          ux_mode: 'popup', // Use popup for better UX
          auto_select: false,
        });
      }
    } catch (err) {
      console.error("Error initializing Google Sign-In:", err);
    }
  }

  function handleGoogleSignInResponse(response) {
    if (response.credential) {
      try {
        // The credential is a JWT token - we use this directly
        setGoogleAuthToken(response.credential);
        localStorage.setItem("googleAuthToken", response.credential);
        showNotification("✓ Successfully logged in with Google!", "success");
        setShowGoogleSetup(false);
      } catch (err) {
        console.error("Error handling sign-in response:", err);
        showNotification("Error processing login", "error");
      }
    }
  }

  function triggerGoogleSignIn() {
    try {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-button"),
          { 
            theme: "filled_blue",
            size: "large",
            text: "signin_with"
          }
        );
      } else {
        // Fallback: open OAuth consent screen
        const state = Math.random().toString(36).substring(7);
        const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
        authUrl.searchParams.append("client_id", GOOGLE_CLIENT_ID);
        authUrl.searchParams.append("redirect_uri", window.location.origin);
        authUrl.searchParams.append("response_type", "token");
        authUrl.searchParams.append("scope", "https://www.googleapis.com/auth/spreadsheets");
        authUrl.searchParams.append("state", state);
        
        window.location.href = authUrl.toString();
      }
    } catch (err) {
      console.error("Error triggering sign-in:", err);
      showNotification("Error starting Google login", "error");
    }
  }

  function logout() {
    try {
      setGoogleAuthToken(null);
      setGoogleSheetId(null);
      localStorage.removeItem("googleAuthToken");
      localStorage.removeItem("googleSheetId");
      
      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.disableAutoSelect();
      }
      
      showNotification("Logged out from Google", "info");
    } catch (err) {
      console.error("Error during logout:", err);
    }
  }

  async function createNewGoogleSheet() {
    if (!googleAuthToken) {
      showNotification("Please authenticate with Google first", "warning");
      return;
    }

    try {
      const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${googleAuthToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            title: `SLOE-Export-${new Date().toLocaleDateString()}`
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const newSheetId = data.spreadsheetId;
        setGoogleSheetId(newSheetId);
        showNotification(`New Google Sheet created! ID: ${newSheetId}`, "success");
        return newSheetId;
      } else {
        showNotification("Failed to create Google Sheet", "error");
        return null;
      }
    } catch (err) {
      console.error("Error creating sheet:", err);
      showNotification("Error creating Google Sheet: " + err.message, "error");
      return null;
    }
  }

  async function appendToGoogleSheet(sheetId, data, headers) {
    if (!googleAuthToken) {
      showNotification("Please authenticate with Google first", "warning");
      return false;
    }

    try {
      const values = [headers, ...data];
      
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A1:append?valueInputOption=USER_ENTERED`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${googleAuthToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: values
          })
        }
      );

      if (response.ok) {
        return true;
      } else {
        const error = await response.json();
        showNotification(`Failed to append data: ${error.error.message}`, "error");
        return false;
      }
    } catch (err) {
      console.error("Error appending to sheet:", err);
      showNotification("Error appending to Google Sheet: " + err.message, "error");
      return false;
    }
  }

  function exportToGoogleSheets() {
    if (entries.length === 0) {
      showNotification("No entries to export", "warning");
      return;
    }
    
    if (!googleAuthToken) {
      setShowGoogleSetup(true);
      showNotification("Please set up Google Sheets integration first", "info");
      return;
    }

    // Find entries that haven't been exported yet
    const newEntries = entries.filter(e => !exportedEntries.includes(e.entryNumber));
    
    if (newEntries.length === 0) {
      showNotification("All entries have already been exported to Google Sheets", "info");
      return;
    }

    // Prepare data for Google Sheets
    const headers = ["Entry No.", "Model Name", "Serial No.", "Property No.", "Service Status", "Remarks", "Created", "Updated"];
    const rows = newEntries.map(e => [
      e.entryNumber,
      e.modelName || "",
      e.serialNumber,
      e.propertyNumber,
      e.conditionStatus,
      e.remarks,
      e.createdAt || "",
      e.updatedAt || ""
    ]);

    // Use existing sheet or create new one
    const targetSheetId = googleSheetId;
    
    if (!targetSheetId) {
      showNotification("Please set a Google Sheet ID first", "warning");
      return;
    }

    // Append data to Google Sheet
    appendToGoogleSheet(targetSheetId, rows, headers).then(success => {
      if (success) {
        // Update exported entries list
        const updatedExported = [...exportedEntries, ...newEntries.map(e => e.entryNumber)];
        setExportedEntries(updatedExported);
        
        showNotification(`${newEntries.length} entries successfully exported to Google Sheets! (${updatedExported.length}/${entries.length} total)`, "success");
        
        // Open the sheet in a new tab
        window.open(`https://docs.google.com/spreadsheets/d/${targetSheetId}`, '_blank');
      }
    });
  }

  function importFromJSON() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (Array.isArray(imported)) {
            // Add each entry to Firestore
            imported.forEach(entry => {
              addDoc(collection(db, "entries"), {
                entryNumber: entry.entryNumber,
                modelName: entry.modelName,
                serialNumber: entry.serialNumber,
                propertyNumber: entry.propertyNumber,
                conditionStatus: entry.conditionStatus,
                remarks: entry.remarks,
                createdAt: entry.createdAt,
                updatedAt: entry.updatedAt
              }).catch(err => {
                console.error("Error importing entry:", err);
              });
            });
            showNotification(`Successfully imported ${imported.length} entries`, "success");
          } else {
            alert("Invalid file format");
          }
        } catch (err) {
          alert("Error importing file");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function toggleEntrySelection(index) {
    const entryId = entries[index].id;
    setSelectedEntries(prev => 
      prev.includes(entryId) 
        ? prev.filter(id => id !== entryId)
        : [...prev, entryId]
    );
  }

  function deleteBulkEntries() {
    if (selectedEntries.length === 0) {
      alert("Select entries to delete");
      return;
    }
    if (confirm(`Delete ${selectedEntries.length} entries?`)) {
      const deletedCount = selectedEntries.length;
      
      // Delete each selected entry from Firestore
      selectedEntries.forEach(entryId => {
        deleteDoc(doc(db, "entries", entryId)).catch(err => {
          console.error("Error deleting entry:", err);
        });
      });
      
      setSelectedEntries([]);
      setBulkDeleteMode(false);
      showNotification(`${deletedCount} entries deleted successfully!`, "success");
    }
  }

  function getStatistics() {
    const total = entries.length;
    const serviceable = entries.filter(e => e.conditionStatus === "Serviceable (SVC)").length;
    const unserviceable = entries.filter(e => e.conditionStatus === "Unserviceable (UNSVC)").length;
    const updateMasterlist = entries.filter(e => e.conditionStatus === "Update (Masterlist)").length;
    return { total, serviceable, unserviceable, updateMasterlist };
  }

  function getPaginatedEntries() {
    const filtered = getFilteredEntries();
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    return filtered.slice(startIndex, endIndex);
  }

  function getTotalPages() {
    const filtered = getFilteredEntries();
    return Math.ceil(filtered.length / entriesPerPage);
  }

  function getMainViewPaginatedEntries() {
    const filtered = getFilteredEntries();
    const startIndex = (mainViewPage - 1) * mainEntriesPerPage;
    const endIndex = startIndex + mainEntriesPerPage;
    return filtered.slice(startIndex, endIndex);
  }

  function getMainViewTotalPages() {
    const filtered = getFilteredEntries();
    return Math.ceil(filtered.length / mainEntriesPerPage);
  }

  function clearAllEntries() {
    if (confirm("Clear all entries? This cannot be undone.")) {
      // Delete all entries from Firestore
      entries.forEach(entry => {
        deleteDoc(doc(db, "entries", entry.id)).catch(err => {
          console.error("Error deleting entry:", err);
        });
      });
      setSelectedEntries([]);
      setBulkDeleteMode(false);
    }
  }

  function downloadPDF() {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 10;
    
    // Get filtered entries based on current status filter
    let entriesToExport = entries;
    if (statusFilter !== "all") {
      entriesToExport = entries.filter(entry => entry.conditionStatus === statusFilter);
    }
    
    // Calculate statistics for exported entries
    const statsExport = {
      total: entriesToExport.length,
      serviceable: entriesToExport.filter(e => e.conditionStatus === "Serviceable (SVC)").length,
      unserviceable: entriesToExport.filter(e => e.conditionStatus === "Unserviceable (UNSVC)").length,
      updateMasterlist: entriesToExport.filter(e => e.conditionStatus === "Update (Masterlist)").length
    };

    // Title
    doc.setFontSize(16);
    const titleText = statusFilter !== "all" ? `Entries List - ${statusFilter}` : 'Entries List';
    doc.text(titleText, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 12;

    // Date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;

    doc.setDrawColor(0);
    doc.line(10, yPosition, pageWidth - 10, yPosition);
    yPosition += 8;

    // Statistics
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('SUMMARY', 15, yPosition);
    yPosition += 6;
    doc.setFont(undefined, 'normal');
    doc.text(`Total Entries: ${statsExport.total}`, 20, yPosition);
    yPosition += 5;
    doc.text(`Serviceable: ${statsExport.serviceable}`, 20, yPosition);
    yPosition += 5;
    doc.text(`Unserviceable: ${statsExport.unserviceable}`, 20, yPosition);
    yPosition += 5;
    doc.text(`Update (Masterlist): ${statsExport.updateMasterlist}`, 20, yPosition);
    yPosition += 8;

    doc.setDrawColor(0);
    doc.line(10, yPosition, pageWidth - 10, yPosition);
    yPosition += 10;

    // Group entries by status
    const statusGroups = [
      {
        label: 'Serviceable (SVC)',
        entries: entriesToExport.filter(e => e.conditionStatus === "Serviceable (SVC)")
      },
      {
        label: 'Unserviceable (UNSVC)',
        entries: entriesToExport.filter(e => e.conditionStatus === "Unserviceable (UNSVC)")
      },
      {
        label: 'Update (Masterlist)',
        entries: entriesToExport.filter(e => e.conditionStatus === "Update (Masterlist)")
      }
    ];

    // Render each status group
    let globalEntryIndex = 1;
    statusGroups.forEach((group) => {
      if (group.entries.length === 0) return; // Skip empty groups

      // Check if we need a new page
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 10;
      }

      // Status group header
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.setDrawColor(100, 100, 100);
      doc.setFillColor(240, 240, 240);
      doc.rect(10, yPosition - 4, pageWidth - 20, 8, 'F');
      doc.text(`${group.label} (${group.entries.length})`, 15, yPosition + 2);
      yPosition += 10;

      // Entries in this group
      group.entries.forEach((entry) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 35) {
          doc.addPage();
          yPosition = 10;
        }

        // Entry content
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text(`Entry ${globalEntryIndex}`, 15, yPosition);
        yPosition += 6;

        doc.setFont(undefined, 'normal');
        doc.setFontSize(9);
        doc.text(`Entry No.: ${entry.entryNumber}`, 20, yPosition);
        yPosition += 5;
        doc.text(`Model Name: ${entry.modelName || "N/A"}`, 20, yPosition);
        yPosition += 5;
        doc.text(`Serial No.: ${entry.serialNumber}`, 20, yPosition);
        yPosition += 5;
        doc.text(`Property No.: ${entry.propertyNumber}`, 20, yPosition);
        yPosition += 5;
        doc.text(`Service Status: ${entry.conditionStatus}`, 20, yPosition);
        yPosition += 5;
        doc.text(`Remarks: ${entry.remarks}`, 20, yPosition);
        yPosition += 5;
        doc.text(`Created: ${entry.createdAt || "N/A"}`, 20, yPosition);
        yPosition += 5;
        doc.text(`Updated: ${entry.updatedAt || "N/A"}`, 20, yPosition);
        yPosition += 8;

        doc.setFontSize(10);
        doc.line(10, yPosition, pageWidth - 10, yPosition);
        yPosition += 6;

        globalEntryIndex++;
      });

      yPosition += 4; // Extra spacing between status groups
    });

    // Generate filename with date and incrementing counter
    const today = new Date().toISOString().split('T')[0];
    const newCounter = downloadCounter + 1;
    const statusLabel = statusFilter !== "all" ? ` [${statusFilter}]` : "";
    const filename = `${today} - ENTRY${statusLabel} - ${newCounter}.pdf`;
    setDownloadCounter(newCounter);

    // Download
    doc.save(filename);
  }

  const stats = getStatistics();
  
  return (
    <div>
      {/* <h2>Simple List Of Entries (SLOE) | ɘlv!s</h2> */}
      
      {/* Statistics Dashboard */}
      <div className="stats-dashboard">
        <div className="stat-box">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-box serviceable">
          <div className="stat-number">{stats.serviceable}</div>
          <div className="stat-label">Serviceable</div>
        </div>
        <div className="stat-box unserviceable">
          <div className="stat-number">{stats.unserviceable}</div>
          <div className="stat-label">Unserviceable</div>
        </div>
        <div className="stat-box">
          <div className="stat-number">{stats.updateMasterlist}</div>
          <div className="stat-label">Update</div>
        </div>
      </div>
      
      <div className="search-container">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input
          type="text"
          className="search-bar"
          placeholder="Search entries..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
            setSelectedSearchIndex(-1);
          }}
          onKeyDown={handleSearchKeyDown}
          onFocus={() => searchTerm && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        />
        <div className="category-filter">
          <button
            className={`category-button ${showCategoryMenu ? 'open' : ''}`}
            onClick={() => setShowCategoryMenu(!showCategoryMenu)}
            onKeyDown={handleCategoryKeyDown}
            onBlur={() => setTimeout(() => setShowCategoryMenu(false), 200)}
          >
            <span className="category-label">
              {searchCategory === "all" ? "All" :
               searchCategory === "entryNumber" ? "Entry No." :
               searchCategory === "modelName" ? "Model Name" :
               searchCategory === "serialNumber" ? "Serial No." :
               searchCategory === "propertyNumber" ? "Property No." :
               searchCategory === "conditionStatus" ? "Status" :
               "Remarks"}
            </span>
            <svg className="category-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          {showCategoryMenu && (
            <div className="category-menu">
              <div className={`category-option ${selectedCategoryIndex === 0 ? "selected" : ""}`} onClick={() => { setSearchCategory("all"); setShowCategoryMenu(false); }} onMouseEnter={() => setSelectedCategoryIndex(0)}>All Fields</div>
              <div className={`category-option ${selectedCategoryIndex === 1 ? "selected" : ""}`} onClick={() => { setSearchCategory("entryNumber"); setShowCategoryMenu(false); }} onMouseEnter={() => setSelectedCategoryIndex(1)}>Entry No.</div>
              <div className={`category-option ${selectedCategoryIndex === 2 ? "selected" : ""}`} onClick={() => { setSearchCategory("modelName"); setShowCategoryMenu(false); }} onMouseEnter={() => setSelectedCategoryIndex(2)}>Model Name</div>
              <div className={`category-option ${selectedCategoryIndex === 3 ? "selected" : ""}`} onClick={() => { setSearchCategory("serialNumber"); setShowCategoryMenu(false); }} onMouseEnter={() => setSelectedCategoryIndex(3)}>Serial No.</div>
              <div className={`category-option ${selectedCategoryIndex === 4 ? "selected" : ""}`} onClick={() => { setSearchCategory("propertyNumber"); setShowCategoryMenu(false); }} onMouseEnter={() => setSelectedCategoryIndex(4)}>Property No.</div>
              <div className={`category-option ${selectedCategoryIndex === 5 ? "selected" : ""}`} onClick={() => { setSearchCategory("conditionStatus"); setShowCategoryMenu(false); }} onMouseEnter={() => setSelectedCategoryIndex(5)}>Service Status</div>
              <div className={`category-option ${selectedCategoryIndex === 6 ? "selected" : ""}`} onClick={() => { setSearchCategory("remarks"); setShowCategoryMenu(false); }} onMouseEnter={() => setSelectedCategoryIndex(6)}>Remarks</div>
            </div>
          )}
        </div>

        {/* <div className="filter-button-container"> 
          <div className="filter-button-wrapper"> 
            <button id="filter-button">Filter</btton>
              <div className="filter-option" onClick={() => {setFilterCategory("a")}} 
          </div>
        </div> */}


        {showDropdown && searchTerm && getFilteredEntries().length > 0 && (
          <div className="search-dropdown">
            {getFilteredEntries().map((entry, idx) => (
              <div
                key={idx}
                className={`search-result-item ${idx === selectedSearchIndex ? "selected" : ""}`}
                onClick={() => handleSearchResultClick(entry)}
                onMouseEnter={() => setSelectedSearchIndex(idx)}
              >
                {searchCategory === "modelName" ? (
                  <>
                    <strong>{entry.modelName}</strong>
                    <span className="search-result-meta">{entry.serialNumber}</span>
                  </>
                ) : (
                  <>
                    <strong>{entry.entryNumber}</strong>
                    <span className="search-result-meta">{entry.serialNumber}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Status Filter Buttons */}
      <div className="status-filter-buttons">
        <button 
          className={`filter-btn ${statusFilter === "all" ? "active" : ""}`}
          onClick={() => setStatusFilter("all")}
        >
          All ({stats.total})
        </button>
        <button 
          className={`filter-btn serviceable ${statusFilter === "Serviceable (SVC)" ? "active" : ""}`}
          onClick={() => setStatusFilter("Serviceable (SVC)")}
        >
          Serviceable (SVC) ({stats.serviceable})
        </button>
        <button 
          className={`filter-btn unserviceable ${statusFilter === "Unserviceable (UNSVC)" ? "active" : ""}`}
          onClick={() => setStatusFilter("Unserviceable (UNSVC)")}
        >
          Unserviceable (UNSVC) ({stats.unserviceable})
        </button>
        <button 
          className={`filter-btn ${statusFilter === "Update (Masterlist)" ? "active" : ""}`}
          onClick={() => setStatusFilter("Update (Masterlist)")}
        >
          Update (Masterlist) ({stats.updateMasterlist})
        </button>
      </div>

      {/* Date Filter */}
      <div className="date-filter-container">
        <label htmlFor="dateFilter" className="date-filter-label">Created Date:</label>
        <input
          type="date"
          id="dateFilter"
          className="date-filter-input"
          value={dateFilter}
          onChange={(e) => {
            const selectedDate = e.target.value;
            if (selectedDate) {
              // Convert date format from YYYY-MM-DD to M/D/YYYY to match createdAt format
              const [year, month, day] = selectedDate.split('-');
              const formattedDate = `${parseInt(month)}/${parseInt(day)}/${year}`;
              setDateFilter(formattedDate);
            } else {
              setDateFilter("");
            }
          }}
        />
        {dateFilter && (
          <>
            <span className="date-filter-display">
               Active: <strong>{dateFilter}</strong>
            </span>
            <button
            className="clear-date-btn"
            onClick={() => setDateFilter("")}
            title="Clear date filter"
          >
            ✕
          </button>
          </>
        )}
      </div>
      
      <div className="button-toolbar">
        <button onClick={openAddEntryModal} className="add-entry-modal-btn">
          + New Entry
        </button>
        <button onClick={downloadPDF} className="download-pdf-btn">
          <svg className="download-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download as PDF
        </button>
        <button onClick={exportToCSV} className="export-btn">
          Export CSV
        </button>
        <button onClick={exportToGoogleSheets} className="export-btn">
          Add To Google Sheets {exportedEntries.length > 0 && `(${exportedEntries.length}/${entries.length})`}
        </button>
        {exportedEntries.length > 0 && (
          <button 
            onClick={() => {
              setExportedEntries([]);
              showNotification("Google Sheets export history cleared", "info");
            }} 
            className="export-btn reset-export-btn"
            title="Clear export history and allow re-uploading all entries"
          >
            Reset Export
          </button>
        )}
        <button onClick={importFromJSON} className="export-btn">
          Import JSON
        </button>
        <button onClick={() => { setFullPageViewMode(true); setCurrentPage(1); }} className="fullpage-view-btn">
          Full Page View
        </button>
        <button onClick={() => setBulkDeleteMode(!bulkDeleteMode)} className={`bulk-mode-btn ${bulkDeleteMode ? "active" : ""}`}>
          {bulkDeleteMode ? "Cancel" : "Bulk Delete"}
        </button>
        {bulkDeleteMode && selectedEntries.length > 0 && (
          <button onClick={deleteBulkEntries} className="delete-bulk-btn">
            Delete {selectedEntries.length}
          </button>
        )}
        <button onClick={clearAllEntries} className="clear-all-btn">
          Clear All
        </button>
        <button onClick={() => setShowKeyboardHelp(!showKeyboardHelp)} className="keyboard-help-btn" title="Keyboard Shortcuts (?)">
          ?
        </button>
      </div>
{showAddEntryModal && (
        <div className="add-entry-modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAddEntryModal(false)}>
          <div className="add-entry-modal">
            <div className="modal-header">
              <h3>Add New Entry</h3>
              <button 
                className="modal-close-btn" 
                onClick={() => setShowAddEntryModal(false)}
                title="Close"
              >
                ✕
              </button>
            </div>
            <div className="modal-content">
        <div className={`input-wrapper entry-number-wrapper ${addErrors.entryNumber ? "error" : ""}`}>
          <input 
            type="text" 
            id="entryNumber" 
            placeholder="Entry No." 
            value={nextEntryNumber}
            disabled={!addEntryNumberEditable}
            readOnly={!addEntryNumberEditable}
            onChange={() => setAddErrors({...addErrors, entryNumber: null})}
          ></input>
          <button 
            type="button"
            className="entry-number-edit-btn"
            onClick={() => {
              setAddEntryNumberEditable(!addEntryNumberEditable);
              if (!addEntryNumberEditable) {
                setTimeout(() => document.getElementById("entryNumber").focus(), 0);
              }
            }}
            title="Edit Entry Number"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
            </svg>
          </button>
          {addErrors.entryNumber && <div className="error-message">{addErrors.entryNumber}</div>}
        </div>
        <div className={`input-wrapper model-name-wrapper ${addErrors.modelName ? "error" : ""}`}>
          <input 
            type="text" 
            id="modelName" 
            placeholder="Model Name"
            value={modelNameInput}
            onChange={(e) => {
              handleModelNameChange(e.target.value);
              setAddErrors({...addErrors, modelName: null});
              setSelectedModelNameIndex(-1);
            }}
            onKeyDown={handleModelNameKeyDown}
            onFocus={(e) => {
              if (e.target.value && modelNameHistory.some(m => m.toLowerCase().includes(e.target.value.toLowerCase()))) {
                setShowModelNameHints(true);
              }
            }}
            onBlur={() => setTimeout(() => setShowModelNameHints(false), 200)}
          ></input>
          {showModelNameHints && filteredModelNames.length > 0 && (
            <div className="model-name-hints">
              {filteredModelNames.map((modelName, idx) => (
                <div
                  key={idx}
                  className={`model-name-option ${idx === selectedModelNameIndex ? "selected" : ""}`}
                  onClick={() => handleModelNameHintClick(modelName)}
                  onMouseEnter={() => setSelectedModelNameIndex(idx)}
                >
                  {modelName}
                </div>
              ))}
            </div>
          )}
          {addErrors.modelName && <div className="error-message">{addErrors.modelName}</div>}
        </div>
        <div className={`input-wrapper ${addErrors.serialNumber ? "error" : ""}`}>
          <input type="text" id="serialNumber" placeholder="Serial No." onChange={() => setAddErrors({...addErrors, serialNumber: null})}></input>
          {addErrors.serialNumber && <div className="error-message">{addErrors.serialNumber}</div>}
        </div>
        <div className={`input-wrapper ${addErrors.propertyNumber ? "error" : ""}`}>
          <input type="text" id="propertyNumber" placeholder="Property No." onChange={() => setAddErrors({...addErrors, propertyNumber: null})}></input>
          {addErrors.propertyNumber && <div className="error-message">{addErrors.propertyNumber}</div>}
        </div>
        <div className={`input-wrapper ${addErrors.status ? "error" : ""}`}>
          <div className="status-filter">
            <button
              className="status-button"
              onClick={() => {
                setShowAddStatusMenu(!showAddStatusMenu);
                setAddErrors({...addErrors, status: null});
              }}
              onKeyDown={handleAddStatusKeyDown}
              onBlur={() => setTimeout(() => setShowAddStatusMenu(false), 200)}
            >
              <span className="status-label">
                {addStatusValue === "" ? "Select Service Status" :
                 addStatusValue === "Serviceable (SVC)" ? "Serviceable (SVC)" :
                 addStatusValue === "Unserviceable (UNSVC)" ? "Unserviceable (UNSVC)" :
                 "Update (Masterlist)"}
              </span>
              <svg className="status-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            {showAddStatusMenu && (
              <div className="status-menu">
                <div className={`status-option ${selectedAddStatusIndex === 0 ? "selected" : ""}`} onClick={() => { setAddStatusValue("Serviceable (SVC)"); setShowAddStatusMenu(false); setAddErrors({...addErrors, status: null}); }} onMouseEnter={() => setSelectedAddStatusIndex(0)}>Serviceable (SVC)</div>
                <div className={`status-option ${selectedAddStatusIndex === 1 ? "selected" : ""}`} onClick={() => { setAddStatusValue("Unserviceable (UNSVC)"); setShowAddStatusMenu(false); setAddErrors({...addErrors, status: null}); }} onMouseEnter={() => setSelectedAddStatusIndex(1)}>Unserviceable (UNSVC)</div>
                <div className={`status-option ${selectedAddStatusIndex === 2 ? "selected" : ""}`} onClick={() => { setAddStatusValue("Update (Masterlist)"); setShowAddStatusMenu(false); setAddErrors({...addErrors, status: null}); }} onMouseEnter={() => setSelectedAddStatusIndex(2)}>Update (Masterlist)</div>
              </div>
            )}
          </div>
          {addErrors.status && <div className="error-message">{addErrors.status}</div>}
        </div>
        <div className={`input-wrapper remarks-wrapper ${addErrors.remarks ? "error" : ""}`}>
          <input 
            type="text" 
            id="remarks" 
            placeholder="Remarks"
            value={remarksInput}
            onChange={(e) => {
              handleRemarksChange(e.target.value);
              setAddErrors({...addErrors, remarks: null});
              setSelectedRemarksIndex(-1);
            }}
            onKeyDown={handleRemarksKeyDown}
            onFocus={(e) => {
              if (e.target.value && remarksHistory.some(r => r.toLowerCase().includes(e.target.value.toLowerCase()))) {
                setShowRemarksHints(true);
              }
            }}
            onBlur={() => setTimeout(() => setShowRemarksHints(false), 200)}
          ></input>
          {showRemarksHints && filteredRemarks.length > 0 && (
            <div className="remarks-hints">
              {filteredRemarks.map((remark, idx) => (
                <div
                  key={idx}
                  className={`remarks-option ${idx === selectedRemarksIndex ? "selected" : ""}`}
                  onClick={() => handleRemarksHintClick(remark)}
                  onMouseEnter={() => setSelectedRemarksIndex(idx)}
                >
                  {remark}
                </div>
              ))}
            </div>
          )}
          {addErrors.remarks && <div className="error-message">{addErrors.remarks}</div>}
        </div>
        <button onClick={handleAddEntry} className="add-entry-btn">Add Entry</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Entries List Pagination Controls */}
      {getFilteredEntries().length > mainEntriesPerPage && (
        <div className="main-pagination-controls">
          <button 
            onClick={() => setMainViewPage(Math.max(1, mainViewPage - 1))}
            disabled={mainViewPage === 1}
            className="pagination-btn"
          >
            ← Previous
          </button>
          <span className="pagination-info">
            Page {mainViewPage} of {getMainViewTotalPages()} | {getFilteredEntries().length} total entries
          </span>
          <button 
            onClick={() => setMainViewPage(Math.min(getMainViewTotalPages(), mainViewPage + 1))}
            disabled={mainViewPage === getMainViewTotalPages()}
            className="pagination-btn"
          >
            Next →
          </button>
        </div>
      )}

      <ul>
        {entries.length === 0 ? (
          <li className="empty-state">No entries yet</li>
        ) : getFilteredEntries().length === 0 ? (
          <li className="empty-state">No results found</li>
        ) : (
          getMainViewPaginatedEntries().map((entry) => {
            const index = entries.indexOf(entry);
            const isSelected = selectedEntries.includes(entry.id);
            return editingIndex === index ? (
                <li key={index} className="entry-item edit-mode">
                  <h4>Edit Entry</h4>
                  <div className={`input-wrapper ${editErrors.entryNumber ? "error" : ""}`}>
                    <input 
                      type="text" 
                      placeholder="Entry No." 
                      value={editData.entryNumber} 
                      disabled={!editEntryNumberEditable}
                      readOnly={!editEntryNumberEditable}
                      onChange={(e) => {
                        handleEditDataChange("entryNumber", e.target.value);
                        setEditErrors({...editErrors, entryNumber: null});
                      }}
                    ></input>
                    <button 
                      type="button"
                      className="entry-number-edit-btn"
                      onClick={() => {
                        setEditEntryNumberEditable(!editEntryNumberEditable);
                        if (!editEntryNumberEditable) {
                          setTimeout(() => {
                            const input = document.querySelector(".entry-item.edit-mode input[placeholder='Entry No.']");
                            if (input) input.focus();
                          }, 0);
                        }
                      }}
                      title="Edit Entry Number"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                      </svg>
                    </button>
                    {editErrors.entryNumber && <div className="error-message">{editErrors.entryNumber}</div>}
                  </div>
                  <div className={`input-wrapper model-name-wrapper edit-mode ${editErrors.modelName ? "error" : ""}`}>
                    <input type="text" placeholder="Model Name" value={editData.modelName} onChange={(e) => {
                      handleEditDataChange("modelName", e.target.value);
                      setEditErrors({...editErrors, modelName: null});
                    }}></input>
                    {editErrors.modelName && <div className="error-message">{editErrors.modelName}</div>}
                  </div>
                  <div className={`input-wrapper ${editErrors.serialNumber ? "error" : ""}`}>
                    <input type="text" placeholder="Serial No." value={editData.serialNumber} onChange={(e) => {
                      handleEditDataChange("serialNumber", e.target.value);
                      setEditErrors({...editErrors, serialNumber: null});
                    }}></input>
                    {editErrors.serialNumber && <div className="error-message">{editErrors.serialNumber}</div>}
                  </div>
                  <div className={`input-wrapper ${editErrors.propertyNumber ? "error" : ""}`}>
                    <input type="text" placeholder="Property No." value={editData.propertyNumber} onChange={(e) => {
                      handleEditDataChange("propertyNumber", e.target.value);
                      setEditErrors({...editErrors, propertyNumber: null});
                    }}></input>
                    {editErrors.propertyNumber && <div className="error-message">{editErrors.propertyNumber}</div>}
                  </div>
                  <div className={`input-wrapper ${editErrors.status ? "error" : ""}`}>
                    <div className="status-filter">
                      <button
                        className="status-button"
                        onClick={() => {
                          setShowEditStatusMenu(!showEditStatusMenu);
                          setEditErrors({...editErrors, status: null});
                        }}
                        onKeyDown={handleEditStatusKeyDown}
                        onBlur={() => setTimeout(() => setShowEditStatusMenu(false), 200)}
                      >
                        <span className="status-label">
                          {editData.conditionStatus === "" ? "Select Service Status" :
                           editData.conditionStatus === "Serviceable (SVC)" ? "Serviceable (SVC)" :
                           editData.conditionStatus === "Unserviceable (UNSVC)" ? "Unserviceable (UNSVC)" :
                           "Update (Masterlist)"}
                        </span>
                        <svg className="status-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </button>
                      {showEditStatusMenu && (
                        <div className="status-menu">
                          <div className={`status-option ${selectedEditStatusIndex === 0 ? "selected" : ""}`} onClick={() => { 
                            handleEditDataChange("conditionStatus", "Serviceable (SVC)"); 
                            setShowEditStatusMenu(false);
                            setEditErrors({...editErrors, status: null});
                          }} onMouseEnter={() => setSelectedEditStatusIndex(0)}>Serviceable (SVC)</div>
                          <div className={`status-option ${selectedEditStatusIndex === 1 ? "selected" : ""}`} onClick={() => { 
                            handleEditDataChange("conditionStatus", "Unserviceable (UNSVC)"); 
                            setShowEditStatusMenu(false);
                            setEditErrors({...editErrors, status: null});
                          }} onMouseEnter={() => setSelectedEditStatusIndex(1)}>Unserviceable (UNSVC)</div>
                          <div className={`status-option ${selectedEditStatusIndex === 2 ? "selected" : ""}`} onClick={() => { 
                            handleEditDataChange("conditionStatus", "Update (Masterlist)"); 
                            setShowEditStatusMenu(false);
                            setEditErrors({...editErrors, status: null});
                          }} onMouseEnter={() => setSelectedEditStatusIndex(2)}>Update (Masterlist)</div>
                        </div>
                      )}
                    </div>
                    {editErrors.status && <div className="error-message">{editErrors.status}</div>}
                  </div>
                  <div className={`input-wrapper ${editErrors.remarks ? "error" : ""}`}>
                    <input type="text" placeholder="Remarks" value={editData.remarks} onChange={(e) => {
                      handleEditDataChange("remarks", e.target.value);
                      setEditErrors({...editErrors, remarks: null});
                    }}></input>
                    {editErrors.remarks && <div className="error-message">{editErrors.remarks}</div>}
                  </div>
                  <div className="button-group">
                    <button onClick={handleSaveEdit} className="save-btn">Save</button>
                    <button onClick={handleCancelEdit} className="cancel-btn">Cancel</button>
                  </div>
                </li>
              ) : (
              <li 
                key={index} 
                className={`entry-item ${entry.conditionStatus === "Serviceable (SVC)" ? "status-serviceable" : entry.conditionStatus === "Unserviceable (UNSVC)" ? "status-unserviceable" : "status-update"} ${isSelected ? "selected" : ""}`}
                data-entry-number={entry.entryNumber}
              >
                  {bulkDeleteMode && (
                    <input 
                      type="checkbox" 
                      className="entry-checkbox"
                      checked={isSelected}
                      onChange={() => toggleEntrySelection(index)}
                    />
                  )}
                  <div className="entry-content">
                    <strong>Entry No.:</strong> {entry.entryNumber}<br />
                    <strong>Model Name:</strong> {entry.modelName}<br />
                    <strong>Serial No.:</strong> {entry.serialNumber}<br />
                    <strong>Property No.:</strong> {entry.propertyNumber}<br />
                    <strong>Service Status:</strong> <span className={`status-badge ${entry.conditionStatus === "Serviceable (SVC)" ? "serviceable" : entry.conditionStatus === "Unserviceable (UNSVC)" ? "unserviceable" : "update"}`}>{entry.conditionStatus}</span><br />
                    <strong>Remarks:</strong> {entry.remarks}<br />
                    <div className="entry-timestamps">
                      <small>Created: {entry.createdAt || "N/A"}</small><br />
                      <small>Updated: {entry.updatedAt || "N/A"}</small>
                    </div>
                  </div>
                  <div className="button-group">
                    <button onClick={() => handleEditEntry(index)} className="edit-btn">Edit</button>
                    <button onClick={() => handleRemoveEntry(index)} className="remove-btn">Remove</button>
                  </div>
                </li>
              );
            })
          )}
      </ul>
      
      {deleteConfirm.show && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <h3>Are you sure you want to delete?</h3>
            <div className="confirmation-buttons">
              <button onClick={confirmDelete} className="confirm-yes-btn">Yes</button>
              <button onClick={cancelDelete} className="confirm-no-btn">No</button>
            </div>
          </div>
        </div>
      )}
      
      {warnings.show && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <h3>{warnings.type === "exact_duplicate" ? "Duplicate Entry Detected" : warnings.type === "duplicate_serial_property" ? "Duplicate Serial & Property Number" : "Entry Number Gap Detected"}</h3>
            <p className="warning-message">{warnings.message}</p>
            <div className="confirmation-buttons">
              <button onClick={warnings.onConfirm} className="confirm-yes-btn">{warnings.action?.confirm || "Continue"}</button>
              {warnings.action?.cancel && <button onClick={warnings.onCancel} className="confirm-no-btn">{warnings.action?.cancel || "Cancel"}</button>}
            </div>
          </div>
        </div>
      )}

      {notification.show && (
        <div className={`notification-toast notification-${notification.type} ${notificationExiting ? "notification-exit" : ""}`}>
          <span className="notification-message">{notification.message}</span>
        </div>
      )}

      {showKeyboardHelp && (
        <div className="keyboard-help-panel">
          <div className="help-panel-header">
            <h3>Keyboard Shortcuts</h3>
            <button 
              className="help-close-btn"
              onClick={() => setShowKeyboardHelp(false)}
              title="Close"
            >
              ✕
            </button>
          </div>
          <div className="help-panel-content">
            <div className="shortcut-group">
              <h4>Entry Management</h4>
              <div className="shortcut-item">
                <span className="shortcut-key">Alt + N</span>
                <span className="shortcut-desc">Create New Entry</span>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-key">Alt + S</span>
                <span className="shortcut-desc">Focus Search (Quick Search)</span>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-key">Alt + L</span>
                <span className="shortcut-desc">Clear Search Results</span>
              </div>
            </div>
            <div className="shortcut-group">
              <h4>Quick Filters</h4>
              <div className="shortcut-item">
                <span className="shortcut-key">1 / 2 / 3 / 4</span>
                <span className="shortcut-desc">Filter: All / Serviceable / Unserviceable / Update</span>
              </div>
            </div>
            <div className="shortcut-group">
              <h4>Navigation</h4>
              <div className="shortcut-item">
                <span className="shortcut-key">↑ / ← or Arrow Up / Left</span>
                <span className="shortcut-desc">Previous Page</span>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-key">↓ / → or Arrow Down / Right</span>
                <span className="shortcut-desc">Next Page</span>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-key">Escape</span>
                <span className="shortcut-desc">Close Modal / Full Page View</span>
              </div>
            </div>
            <div className="shortcut-group">
              <h4>Exports & Views</h4>
              <div className="shortcut-item">
                <span className="shortcut-key">Alt + D</span>
                <span className="shortcut-desc">Download as PDF</span>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-key">Alt + E</span>
                <span className="shortcut-desc">Export CSV</span>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-key">Alt + G</span>
                <span className="shortcut-desc">Add To Google Sheets</span>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-key">Alt + F</span>
                <span className="shortcut-desc">Toggle Full Page View</span>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-key">Alt + B</span>
                <span className="shortcut-desc">Toggle Bulk Delete Mode</span>
              </div>
              <div className="shortcut-item">
                <span className="shortcut-key">Alt + H</span>
                <span className="shortcut-desc">Show/Hide This Help Panel</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showGoogleSetup && (
        <div className="google-setup-modal-overlay">
          <div className="google-setup-modal">
            <div className="google-setup-header">
              <h3>🔐 Google Sheets Integration</h3>
              <button 
                className="google-setup-close-btn"
                onClick={() => setShowGoogleSetup(false)}
                title="Close"
              >
                ✕
              </button>
            </div>
            <div className="google-setup-content">
              {googleAuthToken ? (
                // Step 2: Sheet ID Input (shown after auth)
                <>
                  <div className="setup-section">
                    <div className="auth-success">
                      <div className="auth-success-icon">✓</div>
                      <div className="auth-success-text">
                        <strong>Logged in successfully!</strong>
                        <p>Now set your export destination</p>
                      </div>
                      <button 
                        onClick={() => logout()}
                        className="logout-btn"
                        title="Switch to different Google account"
                      >
                        Change Account
                      </button>
                    </div>
                  </div>

                  <div className="setup-section">
                    <h4>Step 2: Choose Your Google Sheet</h4>
                    <p>Enter an existing Google Sheet ID, or create a new one:</p>
                    
                    <div className="sheet-id-input-group">
                      <input 
                        type="text"
                        className="google-sheet-id-input"
                        placeholder="Paste Sheet ID from URL: docs.google.com/spreadsheets/d/[ID]/edit"
                        value={googleSheetId || ""}
                        onChange={(e) => setGoogleSheetId(e.target.value)}
                      />
                      <button 
                        onClick={() => createNewGoogleSheet()}
                        className="google-create-sheet-btn"
                        title="Create new sheet automatically"
                      >
                        ✨ Create New Sheet
                      </button>
                    </div>
                    <p className="sheet-id-hint">💡 Find Sheet ID in URL: docs.google.com/spreadsheets/d/<strong>1a2B3c4D5e6F...</strong>/edit</p>
                  </div>

                  {googleSheetId && (
                    <div className="setup-success">
                      <p>✓ All set! You can now export to Google Sheets.</p>
                      <button 
                        onClick={() => setShowGoogleSetup(false)}
                        className="setup-close-btn"
                      >
                        Start Exporting
                      </button>
                    </div>
                  )}
                </>
              ) : (
                // Step 1: Login (shown before auth)
                <>
                  <div className="setup-section">
                    <h4>Step 1: Sign In with Google</h4>
                    <p>Securely link your Google account to export entries to Google Sheets:</p>
                    
                    <div id="google-signin-button" className="google-signin-container"></div>
                    
                    <div className="signin-alt-text">OR</div>
                    
                    <button 
                      onClick={() => triggerGoogleSignIn()}
                      className="google-signin-btn"
                    >
                      <svg className="google-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Sign In with Google
                    </button>

                    <p className="signin-security-note">
                      🔒 Secure & Safe: Your password is never shared with this app. Google handles all authentication securely.
                    </p>
                  </div>

                  <div className="setup-section setup-info">
                    <h4>What This Does</h4>
                    <ul>
                      <li>✓ Securely links your Google account</li>
                      <li>✓ Only grants permission for Google Sheets access</li>
                      <li>✓ Can be revoked anytime in Google account settings</li>
                      <li>✓ No passwords are stored</li>
                    </ul>
                  </div>

                  <div className="setup-section setup-faq">
                    <h4>Security & Privacy</h4>
                    <p><strong>Is this safe?</strong> Yes! Google handles the authentication securely. We never see your password.</p>
                    <p><strong>What permissions are needed?</strong> Only Google Sheets access to export your data.</p>
                    <p><strong>Can I revoke access?</strong> Yes, anytime in your <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">Google Account Settings → Permissions</a></p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {fullPageViewMode && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#f8fafb', zIndex: 99999, overflow: 'auto' }}>
          <div style={{ maxWidth: '100%', margin: '0 auto', padding: '20px' }}>
            {/* Back Button */}
            <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                onClick={() => { setFullPageViewMode(false); setCurrentPage(1); }}
                className="back-button"
                title="Back to main view"
                style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #0B2D72 0%, #061e48 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.3s ease'
                }}
              >
                ← Back
              </button>
              <h2 style={{ margin: 0, flex: 1 }}>Full Page View - Entries ({currentPage} of {getTotalPages()})</h2>
            </div>

            {/* Header with Search and Filters */}
            <div className="fullpage-header">
              {/* Search Bar */}
              <div className="search-container fullpage-search-container">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                  type="text"
                  className="search-bar"
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                    setSelectedSearchIndex(-1);
                    setCurrentPage(1);
                  }}
                  onKeyDown={handleSearchKeyDown}
                  onFocus={() => searchTerm && setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                />
                <div className="category-filter">
                  <button
                    className={`category-button ${showCategoryMenu ? 'open' : ''}`}
                    onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                    onKeyDown={handleCategoryKeyDown}
                    onBlur={() => setTimeout(() => setShowCategoryMenu(false), 200)}
                  >
                    <span className="category-label">
                      {searchCategory === "all" ? "All" :
                       searchCategory === "entryNumber" ? "Entry No." :
                       searchCategory === "modelName" ? "Model Name" :
                       searchCategory === "serialNumber" ? "Serial No." :
                       searchCategory === "propertyNumber" ? "Property No." :
                       searchCategory === "conditionStatus" ? "Status" :
                       "Remarks"}
                    </span>
                    <svg className="category-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>
                  {showCategoryMenu && (
                    <div className="category-menu">
                      <div className={`category-option ${selectedCategoryIndex === 0 ? "selected" : ""}`} onClick={() => { setSearchCategory("all"); setShowCategoryMenu(false); }} onMouseEnter={() => setSelectedCategoryIndex(0)}>All Fields</div>
                      <div className={`category-option ${selectedCategoryIndex === 1 ? "selected" : ""}`} onClick={() => { setSearchCategory("entryNumber"); setShowCategoryMenu(false); }} onMouseEnter={() => setSelectedCategoryIndex(1)}>Entry No.</div>
                      <div className={`category-option ${selectedCategoryIndex === 2 ? "selected" : ""}`} onClick={() => { setSearchCategory("modelName"); setShowCategoryMenu(false); }} onMouseEnter={() => setSelectedCategoryIndex(2)}>Model Name</div>
                      <div className={`category-option ${selectedCategoryIndex === 3 ? "selected" : ""}`} onClick={() => { setSearchCategory("serialNumber"); setShowCategoryMenu(false); }} onMouseEnter={() => setSelectedCategoryIndex(3)}>Serial No.</div>
                      <div className={`category-option ${selectedCategoryIndex === 4 ? "selected" : ""}`} onClick={() => { setSearchCategory("propertyNumber"); setShowCategoryMenu(false); }} onMouseEnter={() => setSelectedCategoryIndex(4)}>Property No.</div>
                      <div className={`category-option ${selectedCategoryIndex === 5 ? "selected" : ""}`} onClick={() => { setSearchCategory("conditionStatus"); setShowCategoryMenu(false); }} onMouseEnter={() => setSelectedCategoryIndex(5)}>Service Status</div>
                      <div className={`category-option ${selectedCategoryIndex === 6 ? "selected" : ""}`} onClick={() => { setSearchCategory("remarks"); setShowCategoryMenu(false); }} onMouseEnter={() => setSelectedCategoryIndex(6)}>Remarks</div>
                    </div>
                  )}
                </div>

                {showDropdown && searchTerm && getFilteredEntries().length > 0 && (
                  <div className="search-dropdown">
                    {getFilteredEntries().map((entry, idx) => (
                      <div
                        key={idx}
                        className={`search-result-item ${idx === selectedSearchIndex ? "selected" : ""}`}
                        onClick={() => handleSearchResultClick(entry)}
                        onMouseEnter={() => setSelectedSearchIndex(idx)}
                      >
                        {searchCategory === "modelName" ? (
                          <>
                            <strong>{entry.modelName}</strong>
                            <span className="search-result-meta">{entry.serialNumber}</span>
                          </>
                        ) : (
                          <>
                            <strong>{entry.entryNumber}</strong>
                            <span className="search-result-meta">{entry.serialNumber}</span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Date Filter and Status Filters */}
              <div style={{ marginTop: '15px', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Date Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#555' }}>Created Date:</label>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => {
                      setDateFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="date-picker"
                    style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #ddd' }}
                  />
                  {dateFilter && (
                    <button 
                      onClick={() => setDateFilter("")}
                      style={{ padding: '4px 10px', background: '#e8e8e8', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Status Filter Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { label: "All", value: "all", count: entries.length },
                    { label: "SVC", value: "Serviceable (SVC)", count: entries.filter(e => e.conditionStatus === "Serviceable (SVC)").length },
                    { label: "UNSVC", value: "Unserviceable (UNSVC)", count: entries.filter(e => e.conditionStatus === "Unserviceable (UNSVC)").length },
                    { label: "Update", value: "Update (Masterlist)", count: entries.filter(e => e.conditionStatus === "Update (Masterlist)").length }
                  ].map(status => (
                    <button
                      key={status.value}
                      onClick={() => {
                        setStatusFilter(status.value);
                        setCurrentPage(1);
                      }}
                      style={{
                        padding: '6px 12px',
                        background: statusFilter === status.value ? 'linear-gradient(135deg, #0B2D72 0%, #061e48 100%)' : '#f0f0f0',
                        color: statusFilter === status.value ? '#fff' : '#555',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {status.label} ({status.count})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table */}
            <div style={{ marginTop: '20px', overflowX: 'auto', borderRadius: '8px', border: '1px solid #e8e8e8', background: '#fff' }}>
              {getFilteredEntries().length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                  <p>No entries found</p>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #e8e8e8' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#555' }}>Entry No.</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#555' }}>Model Name</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#555' }}>Serial No.</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#555' }}>Property No.</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#555' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#555' }}>Remarks</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#555' }}>Created</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#555' }}>Updated</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#555' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getPaginatedEntries().map((entry) => {
                      const originalIndex = entries.findIndex(e => e.id === entry.id);
                      return (
                        <tr key={entry.id} style={{ borderBottom: '1px solid #f0f0f0', transition: 'all 0.2s ease' }}>
                          <td style={{ padding: '12px', fontSize: '13px' }}>{entry.entryNumber}</td>
                          <td style={{ padding: '12px', fontSize: '13px' }}>{entry.modelName}</td>
                          <td style={{ padding: '12px', fontSize: '13px' }}>{entry.serialNumber}</td>
                          <td style={{ padding: '12px', fontSize: '13px' }}>{entry.propertyNumber}</td>
                          <td style={{ padding: '12px', fontSize: '13px' }}><span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: '4px', background: entry.conditionStatus === "Serviceable (SVC)" ? '#d4edda' : entry.conditionStatus === "Unserviceable (UNSVC)" ? '#f8d7da' : '#fff3cd', color: entry.conditionStatus === "Serviceable (SVC)" ? '#155724' : entry.conditionStatus === "Unserviceable (UNSVC)" ? '#721c24' : '#856404', fontSize: '11px', fontWeight: '500' }}>{entry.conditionStatus}</span></td>
                          <td style={{ padding: '12px', fontSize: '13px' }}>{entry.remarks}</td>
                          <td style={{ padding: '12px', fontSize: '13px' }}>{entry.createdAt || "N/A"}</td>
                          <td style={{ padding: '12px', fontSize: '13px' }}>{entry.updatedAt || "N/A"}</td>
                          <td style={{ padding: '12px', fontSize: '13px' }}>
                            <button onClick={() => handleEditEntry(originalIndex)} style={{ padding: '4px 8px', background: '#0066cc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', marginRight: '4px' }}>Edit</button>
                            <button onClick={() => handleRemoveEntry(originalIndex)} style={{ padding: '4px 8px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Remove</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination Controls at Bottom */}
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
              <button 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 16px',
                  background: currentPage === 1 ? '#e8e8e8' : 'linear-gradient(135deg, #0B2D72 0%, #061e48 100%)',
                  color: currentPage === 1 ? '#999' : '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: currentPage === 1 ? 'default' : 'pointer',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                ← Previous
              </button>
              <span style={{ fontSize: '13px', color: '#555', minWidth: '200px', textAlign: 'center' }}>Page {currentPage} of {getTotalPages()} | {getFilteredEntries().length} total</span>
              <button 
                onClick={() => setCurrentPage(Math.min(getTotalPages(), currentPage + 1))}
                disabled={currentPage === getTotalPages()}
                style={{
                  padding: '8px 16px',
                  background: currentPage === getTotalPages() ? '#e8e8e8' : 'linear-gradient(135deg, #0B2D72 0%, #061e48 100%)',
                  color: currentPage === getTotalPages() ? '#999' : '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: currentPage === getTotalPages() ? 'default' : 'pointer',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
   
}


export default Array;
