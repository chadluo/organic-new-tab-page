# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: Organic New Tab Page

Chrome extension (Manifest V3) that replaces the new tab page with bookmarks and open tabs.

## Tech Stack

- TypeScript, Tailwind CSS v4, Chrome Extension APIs
- Package manager: pnpm (`packageManager` field in package.json)

## Build

```bash
pnpm run build    # clean → copy → compile (tsc) → css (tailwindcss CLI)
```

Individual steps: `pnpm run clean`, `pnpm run copy`, `pnpm run compile`, `pnpm run css`

Output goes to `dist/`. Load `dist/` as an unpacked extension in Chrome.

## Architecture

Single-page extension with two source files:

- **`src/newtab.ts`** — All new tab page logic: settings management, theme system, responsive grid layout, bookmark tree rendering, tab/window rendering, live Chrome API event listeners, and two web components (`<bookmark-link>`, `<tab-link>`)
- **`src/background.ts`** — Minimal service worker (install listener only)
- **`newtab.html`** — HTML structure with `<template>` elements for web components, settings dialog, and grid layout container
- **`styles.css`** — Tailwind v4 config (`@theme` variables, `@utility`, `@layer base/components`), dark mode via `html.dark` class, tab group color system

Key patterns:
- Web components use template cloning from `<template>` elements in HTML
- Layout uses CSS subgrid with JS-controlled `gridColumn` for responsive proportional distribution
- `<details>`/`<summary>` for all expand/collapse (bookmarks folders, windows, tab groups)
- UI state (open/closed details, settings) persisted to `chrome.storage.local`
- Live updates via Chrome event listeners (tabs, tabGroups, bookmarks) that re-render sections

## Styling Preference

When applying Tailwind utility classes, prefer this order:

1. **Static HTML** — classes on elements in `newtab.html` (including `<template>` elements)
2. **CSS** — `@apply` rules in `styles.css` for dynamically-created elements (e.g. `details`, `summary`, `ul`, `li`) and custom element selectors (e.g. `bookmark-link`, `tab-link`)
3. **JS** — `className` / `classList` in TypeScript as a last resort, only when styles are truly dynamic (e.g. `overflow-y-auto` on layout columns, `gridColumn` for responsive layout)

## Chrome Permissions

storage, bookmarks, tabs, tabGroups, favicon
