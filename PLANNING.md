# Planning Document: Organic New Tab Page

## Features Overview

The new tab page will consist of two key sections:

1. **Bookmarks**
2. **Current Opened Tabs**

---

## Feature Details

### 1. Bookmarks Section

- **Structure**: Display bookmarks as an expandable/collapsible tree using the `<details>` and `<summary>` elements in HTML.
- **Hierarchy**: Organize links hierarchically based on their folder structure.
- **Expand/Collapse**:
  - Users can expand/collapse each folder to view its contents.
  - Use `<details>` for folders, `<summary>` for folder names, and `<a>` for links.

#### Example HTML

```html
<details>
  <summary>Folder Name</summary>
  <ul>
    <li><a href="https://example.com">Example</a></li>
    <li><a href="https://another-site.com">Another Site</a></li>
  </ul>
</details>
```

---

### 2. Current Opened Tabs Section

- **Structure**: Display current opened tabs organized by their window.
- **Expand/Collapse**:
  - Use `<details>` and `<summary>` to represent windows.
  - List all tabs within each window when expanded.
- **Window Naming**:
  - **Named Windows**: Use the specified window name.
  - **Unnamed Windows**: Use the title of the last active tab in the window, followed by the total number of tabs.
  - Example: `"Last Active Tab Title (5 tabs)"`.

#### Example HTML

```html
<details>
  <summary>Window Name/Last Active Tab Title (3 tabs)</summary>
  <ul>
    <li><a href="https://example.com">Tab 1</a></li>
    <li><a href="https://example.com">Tab 2</a></li>
    <li><a href="https://example.com">Tab 3</a></li>
  </ul>
</details>
```

---

## Interaction Details

- **Refresh/Load Data**:
  - Fetch bookmarks from the `chrome.bookmarks` API.
  - Fetch open tabs and windows from the `chrome.windows` API.
- **Navigation**:
  - Clicking on a bookmark should navigate to that URL in a new tab.
  - Clicking on an open tab should activate and focus that tab, even if it is in a different window (using the chrome.tabs API).
- **Performance**:
  - Load bookmarks and tabs asynchronously to ensure fast UI response.
  - Use appropriate error handling for API calls.

---

## Additional Notes

- Keep a simple, clean design to ensure usability.
- Ensure proper alignment and spacing for nested lists.
- Optionally, add search/filter functionality for bookmarks and tabs if needed later.
