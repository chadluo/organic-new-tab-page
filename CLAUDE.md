# Project: Organic New Tab Page

Chrome extension that replaces the new tab page with bookmarks and open tabs.

## Tech Stack

- TypeScript, Tailwind CSS v4, Chrome Extension APIs
- Build: `npm run build` (clean → copy → tsc → tailwindcss CLI)

## Styling Preference

When applying Tailwind utility classes, prefer this order:

1. **Static HTML** — classes on elements in `newtab.html` (including `<template>` elements)
2. **CSS** — `@apply` rules in `styles.css` for dynamically-created elements (e.g. `details`, `summary`, `ul`, `li`) and custom element selectors (e.g. `bookmark-link`, `tab-link`)
3. **JS** — `className` / `classList` in TypeScript as a last resort, only when styles are truly dynamic (e.g. `overflow-y-auto` on layout columns, `gridColumn` for responsive layout)
