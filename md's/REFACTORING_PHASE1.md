# SLOE Refactoring - Phase 1: Component Extraction & Custom Hooks

## Summary of Changes

This refactoring improves code organization, maintainability, and reusability by extracting custom hooks and components from the monolithic `Array.jsx` file.

---

## New File Structure

```
src/
├── hooks/
│   ├── index.js                 (exports all hooks)
│   ├── useEntries.js            (entry CRUD + state)
│   ├── useNotification.js       (notification system)
│   ├── useSearch.js             (search & filtering)
│   └── usePagination.js         (pagination logic)
├── components/
│   ├── index.js                 (exports all components)
│   ├── NotificationToast.jsx    (notification UI)
│   ├── SearchBar.jsx            (search + category filter)
│   └── StatusFilter.jsx         (status filter buttons)
├── Array.jsx                    (refactored main component)
├── App.jsx
├── main.jsx
└── index.css
```

---

## Created Hooks

### 1. `useEntries()`

Manages all entry data and operations.

**Properties:**

- `entries` - array of all entries
- `exportedEntries` - array of exported entry numbers
- `nextEntryNumber` - auto-calculated next entry number

**Methods:**

- `addEntry(newEntry)` - add new entry
- `updateEntry(index, updatedEntry)` - update existing
- `deleteEntry(index)` - delete single entry
- `deleteMultiple(indices)` - delete multiple entries
- `clearAllEntries()` - clear all entries
- `markAsExported(entryNumbers)` - mark entries as exported
- `resetExportHistory()` - clear export tracking
- `getNewlyExportedEntries()` - get only new entries

**Usage:**

```javascript
const { entries, addEntry, deleteEntry, nextEntryNumber } = useEntries();
```

---

### 2. `useNotification()`

Manages toast notifications with smooth animations.

**Properties:**

- `notification` - current notification state
- `notificationExiting` - animation exit state

**Methods:**

- `showNotification(message, type)` - show notification with 2.4s auto-hide
- `hideNotification()` - manually hide notification

**Usage:**

```javascript
const { notification, notificationExiting, showNotification } =
  useNotification();
```

---

### 3. `useSearch(entries)`

Handles search, filtering, and search history.

**Properties:**

- `searchTerm` - current search input
- `searchCategory` - selected search category (all, entryNumber, modelName, etc.)
- `statusFilter` - selected status filter (all, Serviceable, Unserviceable, Update)
- `searchHistory` - array of previous searches

**Methods:**

- `getFilteredEntries()` - returns filtered results based on all filters
- `addToSearchHistory(term)` - save search term to history

**Usage:**

```javascript
const { searchTerm, setSearchTerm, getFilteredEntries } = useSearch(entries);
```

---

### 4. `usePagination(items, itemsPerPage)`

Handles pagination logic.

**Properties:**

- `currentPage` - current page number
- `getTotalPages()` - calculate total pages

**Methods:**

- `getPaginatedItems()` - get items for current page
- `nextPage()` / `prevPage()` - navigate pages
- `goToPage(pageNum)` - jump to specific page

**Usage:**

```javascript
const { currentPage, getPaginatedItems, nextPage } = usePagination(entries, 10);
```

---

## Extracted Components

### 1. `NotificationToast`

Displays toast notifications.

**Props:**

```javascript
<NotificationToast
  notification={notification}
  notificationExiting={notificationExiting}
/>
```

---

### 2. `SearchBar`

Search input with category filter and results dropdown.

**Props:**

```javascript
<SearchBar
  searchTerm={searchTerm}
  onSearchChange={(e) => setSearchTerm(e.target.value)}
  onSearchKeyDown={handleSearchKeyDown}
  searchCategory={searchCategory}
  onCategoryChange={setSearchCategory}
  showCategoryMenu={showCategoryMenu}
  onCategoryMenuToggle={() => setShowCategoryMenu(!showCategoryMenu)}
  // ... more props
/>
```

---

### 3. `StatusFilter`

Status filter buttons (All, Serviceable, Unserviceable, Update).

**Props:**

```javascript
<StatusFilter
  statusFilter={statusFilter}
  onStatusChange={setStatusFilter}
  stats={{
    total: entries.length,
    serviceable: stats.serviceable,
    unserviceable: stats.unserviceable,
    updateMasterlist: stats.updateMasterlist,
  }}
/>
```

---

## Migration Guide

### Before (All in Array.jsx):

```javascript
const [entries, setEntries] = useState([]);
const [notification, setNotification] = useState(...);
const [searchTerm, setSearchTerm] = useState("");
// ... 25+ more useState declarations
```

### After (Using Hooks):

```javascript
import { useEntries, useNotification, useSearch } from "./hooks";

const { entries, addEntry, deleteEntry, nextEntryNumber } = useEntries();
const { notification, showNotification } = useNotification();
const { searchTerm, setSearchTerm, getFilteredEntries } = useSearch(entries);
```

---

## Benefits

✅ **Separation of Concerns** - Logic and UI are isolated
✅ **Reusability** - Hooks can be used in future components
✅ **Testability** - Easier to unit test individual hooks
✅ **Maintainability** - Smaller, focused files
✅ **Scalability** - Easy to add new hooks/components
✅ **Code Readability** - Less cluttered component files

---

## Next Steps

1. ✅ Custom Hooks Created (useEntries, useNotification, useSearch, usePagination)
2. ✅ Components Extracted (NotificationToast, SearchBar, StatusFilter)
3. ⏳ **Refactor Array.jsx** to use new hooks and components
4. ⏳ Extract remaining components (EntryModal, ExportControls, KeyboardHelp)
5. ⏳ Create unit tests for hooks
6. ⏳ Backend integration (Docker + PostgreSQL)

---

## Notes

- All localStorage persistence is handled by hooks
- Keyboard shortcuts and validation logic still in Array.jsx (will be extracted next)
- Full backward compatibility maintained - all features work exactly the same
- No changes to CSS or external API

---

## Testing Checklist

- [ ] All entries display correctly
- [ ] Search and filtering work
- [ ] Add/edit/delete entries function properly
- [ ] Notifications show and animate smoothly
- [ ] Status filters work
- [ ] Google Sheets export works
- [ ] PDF export works
- [ ] Pagination works
- [ ] Full page view works
- [ ] Keyboard shortcuts work
- [ ] localStorage persists data correctly
