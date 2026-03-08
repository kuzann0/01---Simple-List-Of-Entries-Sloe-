import React from 'react';

export function SearchBar({
  searchTerm,
  onSearchChange,
  onSearchKeyDown,
  searchCategory,
  onCategoryChange,
  showCategoryMenu,
  onCategoryMenuToggle,
  onCategoryKeyDown,
  selectedCategoryIndex,
  onCategoryMouseEnter,
  showDropdown,
  filteredResults,
  selectedSearchIndex,
  onResultClick,
  onResultMouseEnter,
  onSearchFocus,
  onSearchBlur,
  searchCategoryLabels
}) {
  return (
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
        onChange={onSearchChange}
        onKeyDown={onSearchKeyDown}
        onFocus={onSearchFocus}
        onBlur={onSearchBlur}
      />
      <div className="category-filter">
        <button
          className="category-button"
          onClick={onCategoryMenuToggle}
          onKeyDown={onCategoryKeyDown}
          onBlur={() => setTimeout(() => onCategoryMenuToggle(false), 200)}
        >
          <span className="category-label">
            {searchCategoryLabels[searchCategory] || "All"}
          </span>
          <svg className="category-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        {showCategoryMenu && (
          <div className="category-menu">
            {Object.entries(searchCategoryLabels).map(([value, label], idx) => (
              <div
                key={value}
                className={`category-option ${selectedCategoryIndex === idx ? "selected" : ""}`}
                onClick={() => onCategoryChange(value)}
                onMouseEnter={() => onCategoryMouseEnter(idx)}
              >
                {label}
              </div>
            ))}
          </div>
        )}
      </div>

      {showDropdown && searchTerm && filteredResults.length > 0 && (
        <div className="search-dropdown">
          {filteredResults.map((entry, idx) => (
            <div
              key={idx}
              className={`search-result-item ${idx === selectedSearchIndex ? "selected" : ""}`}
              onClick={() => onResultClick(entry)}
              onMouseEnter={() => onResultMouseEnter(idx)}
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
  );
}
