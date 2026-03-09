# SLOE | Next Implementations

<br>

### Full-page-viewing of entries (COMPLETED)

    - add a new button for viewing entries with full page width and height
    - 15 entries limit range per page
    - drop-down menu for pages; 1, 2, 3, 4, 6

    IMPLEMENTATION NOTES:
    - Full Page View button added to toolbar
    - Full-page overlay takes up entire viewport (100% width/height)
    - 15 entries per page with pagination controls
    - Dropdown selector for 1, 2, 3, 4, or 6 pages per document
    - Previous/Next navigation with page indicator
    - Grid layout for responsive multi-column entry display
    - Fully responsive design on mobile devices (1 column)

<br>
<hr>
<br>

### Unique Parts Validation for Serial No. & Property No. (COMPLETED)

    - Format can be duplicated, but specific unique parts must be UNIQUE
    - Extracts unique part (typically after last dash or underscore)
    - Validates by comparing unique parts across all entries

    IMPLEMENTATION NOTES:
    - Unique part extraction: separates by dash/underscore, takes last segment
    - Validation applied on both Add and Edit operations
    - Clear warning messages showing which entry has conflicting unique part
    - Allows same format prefix with different unique identifiers

<br>
<hr>

### An Isolated popup modal for creating an entry (COMPLETED)

    - add a simple backdrop blur and down the opacity to at least 30%
    - Modal appears with dedicated form for adding entries
    - Prevents confusion with main content area

    IMPLEMENTATION NOTES:
    - "+ New Entry" button opens isolated modal
    - Backdrop blur with 30% opacity (rgba 0,0,0,0.3 + backdrop-filter)
    - Modal is scrollable for smaller screens
    - Close button (✕) to dismiss modal
    - Modal closes automatically after successful entry addition
    - Fully responsive on mobile devices
    - Click outside modal to close (backdrop click)

<br>
<br>
    
## Keyboard function for more efficient workflow (COMPLETED)

    IMPLEMENTED SHORTCUTS:

    Entry Management:
    - Alt + N = Create New Entry

    Navigation:
    - ↑ or Arrow Up = Previous Page
    - ↓ or Arrow Down = Next Page
    - ← or Arrow Left = Previous Page
    - → or Arrow Right = Next Page
    - Escape = Close Modal / Full Page View

    Actions:
    - Alt + D = Download as PDF
    - Alt + E = Export CSV
    - Alt + F = Toggle Full Page View
    - Alt + B = Toggle Bulk Delete Mode

    UI FEATURES:
    - "?" button in toolbar shows/hides keyboard shortcuts panel
    - Panel appears in bottom-right corner (fixed position)
    - Comprehensive shortcut reference with visual key displays
    - Fully responsive design on mobile devices
    - Press Escape to close shortcuts panel

    NOTES:
    - All Alt combinations are easy to press and don't interfere with browser hotkeys
    - Arrow keys work in both main view and full page view for pagination
    - Shortcuts are browser-compatible across all major browsers

- When the Model Name is selected in category filtering, the output should be
  'Name Of The Model + Serial Number'

- PDF Auto Filtering status; Serviceable, Unserviceable, For Update (Masterlist)

### Add To Google Sheet Feature

    - New Button in Dashboard: Export CSV will remain, but a new button option named "Add To Google Sheets" will be added.

### What it does:

- Automatically creates new online spreadsheets in Google when the 'Add to Online Google Sheets' button is triggered.

### Use Docker for DB Manager

    [WIP]

### UI/UX Improvements

    [WIP]


### PDF Serviceable get((param)) bug

    [WIP]


### Dark and Light  Mode Feature (User Preference)

    [WIP]


### Search Bar Z-Index Bug

    - possible solution: z-index: 99999; // sets the div on top of all layers


### Data Entry (Per Batch)

    - [ Batch No. + Date ] 


    - Batch #0001 | March 09, 
      2026

    - Add new filter button for 
      batch

    - Wooden Stick Bundle 
      Concept for more 
      organized data handling.

