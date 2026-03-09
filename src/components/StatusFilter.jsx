import React from 'react';

export function StatusFilter({ statusFilter, onStatusChange, stats }) {
  return (
    <div className="status-filter-buttons">
      <button 
        className={`status-filter-btn ${statusFilter === "all" ? "active" : ""}`}
        onClick={() => onStatusChange("all")}
      >
        All ({stats.total})
      </button>
      <button 
        className={`status-filter-btn ${statusFilter === "Serviceable" ? "active" : ""}`}
        onClick={() => onStatusChange("Serviceable")}
      >
        Serviceable ({stats.serviceable})
      </button>
      <button 
        className={`status-filter-btn ${statusFilter === "Unserviceable" ? "active" : ""}`}
        onClick={() => onStatusChange("Unserviceable")}
      >
        Unserviceable ({stats.unserviceable})
      </button>
      <button 
        className={`status-filter-btn ${statusFilter === "Update" ? "active" : ""}`}
        onClick={() => onStatusChange("Update")}
      >
        Update ({stats.updateMasterlist})
      </button>
    </div>
  );
}
