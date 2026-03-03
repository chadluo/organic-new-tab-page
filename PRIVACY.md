# Privacy Policy — Organic New Tab Page

**Last updated:** March 4, 2026

## Overview

Organic New Tab Page is a Chrome extension that replaces your new tab page with a view of your bookmarks and open tabs. It is designed with privacy in mind — no data ever leaves your browser.

## Data Accessed

The extension accesses the following browser data through Chrome Extension APIs, solely to display it on your new tab page:

- **Bookmarks** — Your bookmark tree is read to render your bookmark folders and links.
- **Tabs and Windows** — Your open tabs, windows, and tab groups are read to display them on the new tab page.
- **Favicons** — Website favicons are retrieved via Chrome's favicon API to display icons next to bookmarks and tabs.

## Data Stored

The extension stores a small amount of preference data locally on your device using `chrome.storage.local`:

- **Theme preference** (light, dark, or system)
- **Layout settings** (column counts for bookmarks and tabs)
- **UI state** (which folders and windows are expanded or collapsed)

This data is stored entirely within your browser and is never transmitted externally.

## Data Collection and Sharing

This extension does **not**:

- Collect any personal information
- Transmit any data to external servers
- Use analytics, tracking, or telemetry of any kind
- Use cookies
- Make any network requests beyond what Chrome provides natively (e.g., favicon loading)

## Third-Party Services

This extension does not integrate with or send data to any third-party services.

## Permissions Justification

| Permission | Purpose |
|---|---|
| `bookmarks` | Read your bookmark tree to display it |
| `tabs` | Read open tabs and windows to display them |
| `tabGroups` | Read tab group names and colors for display |
| `storage` | Save your theme, layout, and UI state preferences locally |
| `favicon` | Display website icons next to bookmarks and tabs |

## Changes to This Policy

If this policy is updated, the changes will be noted with an updated date at the top of this document.

## Contact

If you have questions about this privacy policy, please open an issue on the project's GitHub repository.
