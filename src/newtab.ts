// --- Settings ---

const SETTINGS_KEY = "userSettings";

type Theme = "system" | "light" | "dark";

interface UserSettings {
  theme: Theme;
}

const defaultSettings: UserSettings = { theme: "system" };

async function loadSettings(): Promise<UserSettings> {
  const result = await chrome.storage.local.get(SETTINGS_KEY);
  return { ...defaultSettings, ...(result[SETTINGS_KEY] as Partial<UserSettings>) };
}

async function saveSettings(settings: UserSettings) {
  await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
}

let mediaQuery: MediaQueryList | null = null;

function applyTheme(theme: Theme) {
  // Clean up previous system listener
  if (mediaQuery) {
    mediaQuery.removeEventListener("change", onSystemThemeChange);
    mediaQuery = null;
  }

  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else if (theme === "light") {
    document.documentElement.classList.remove("dark");
  } else {
    // system
    mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    document.documentElement.classList.toggle("dark", mediaQuery.matches);
    mediaQuery.addEventListener("change", onSystemThemeChange);
  }
}

function onSystemThemeChange(e: MediaQueryListEvent) {
  document.documentElement.classList.toggle("dark", e.matches);
}

function initSettings(settings: UserSettings) {
  applyTheme(settings.theme);

  const btn = document.getElementById("settings-btn")!;
  const dialog = document.getElementById("settings-dialog") as HTMLDialogElement;
  const closeBtn = dialog.querySelector(".close-btn")!;
  const radios = dialog.querySelectorAll<HTMLInputElement>('input[name="theme"]');

  // Set initial radio state
  radios.forEach((radio) => {
    radio.checked = radio.value === settings.theme;
  });

  btn.addEventListener("click", () => dialog.showModal());
  closeBtn.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });

  radios.forEach((radio) => {
    radio.addEventListener("change", () => {
      const theme = radio.value as Theme;
      applyTheme(theme);
      saveSettings({ ...settings, theme });
      settings.theme = theme;
    });
  });
}

// --- State Persistence ---

const STORAGE_KEY = "detailsState";

type DetailsState = Record<string, boolean>;

async function loadState(): Promise<DetailsState> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return (result[STORAGE_KEY] as DetailsState) ?? {};
}

async function saveState(state: DetailsState) {
  await chrome.storage.local.set({ [STORAGE_KEY]: state });
}

let detailsState: DetailsState = {};

function trackDetails(details: HTMLDetailsElement, key: string, fallback: boolean) {
  details.open = detailsState[key] ?? fallback;
  details.addEventListener("toggle", () => {
    detailsState[key] = details.open;
    saveState(detailsState);
  });
}

// --- Web Components ---

function faviconUrl(pageUrl: string): string {
  if (!pageUrl) return "";
  const encoded = encodeURIComponent(pageUrl);
  return `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encoded}&size=16`;
}

function hostname(pageUrl: string): string {
  try {
    return new URL(pageUrl).hostname;
  } catch {
    return "";
  }
}

function populateLink(content: DocumentFragment, url: string, faviconOverride = "") {
  const img = content.querySelector(".favicon") as HTMLImageElement;
  const host = content.querySelector(".hostname") as HTMLSpanElement;
  img.src = faviconOverride || faviconUrl(url);
  host.textContent = hostname(url);
}

class BookmarkLink extends HTMLElement {
  connectedCallback() {
    const template = document.getElementById(
      "bookmark-link-template"
    ) as HTMLTemplateElement;
    const content = template.content.cloneNode(true) as DocumentFragment;
    const url = this.getAttribute("url") ?? "";
    const a = content.querySelector("a") as HTMLAnchorElement;
    a.href = url;
    a.textContent = this.getAttribute("title") || url;
    populateLink(content, url);
    this.appendChild(content);
  }
}

class TabLink extends HTMLElement {
  connectedCallback() {
    const tabId = Number(this.getAttribute("tab-id"));
    const windowId = Number(this.getAttribute("window-id"));
    const url = this.getAttribute("url") ?? "";

    const template = document.getElementById(
      "tab-link-template"
    ) as HTMLTemplateElement;
    const content = template.content.cloneNode(true) as DocumentFragment;
    const a = content.querySelector("a") as HTMLAnchorElement;
    a.textContent = this.getAttribute("title") || "Untitled";
    a.addEventListener("click", (e) => {
      e.preventDefault();
      chrome.tabs.update(tabId, { active: true });
      chrome.windows.update(windowId, { focused: true });
    });
    const faviconOverride = this.getAttribute("favicon") ?? "";
    populateLink(content, url, faviconOverride);
    this.appendChild(content);
  }
}

customElements.define("bookmark-link", BookmarkLink);
customElements.define("tab-link", TabLink);

// --- Bookmarks ---

function renderBookmarkNode(
  node: chrome.bookmarks.BookmarkTreeNode
): HTMLElement | null {
  if (node.url) {
    const li = document.createElement("li");
    const link = document.createElement("bookmark-link");
    link.setAttribute("url", node.url);
    link.setAttribute("title", node.title || node.url);
    li.appendChild(link);
    return li;
  }

  if (node.children && node.children.length > 0) {
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = node.title || "Bookmarks";
    details.appendChild(summary);
    trackDetails(details, `bookmark:${node.id}`, false);

    const ul = document.createElement("ul");
    for (const child of node.children) {
      const rendered = renderBookmarkNode(child);
      if (rendered) ul.appendChild(rendered);
    }
    details.appendChild(ul);
    return details;
  }

  return null;
}

function loadBookmarks() {
  chrome.bookmarks.getTree((tree) => {
    const container = document.getElementById("bookmarks");
    if (!container) return;
    container.innerHTML = "";
    for (const root of tree) {
      if (root.children) {
        for (const child of root.children) {
          const rendered = renderBookmarkNode(child);
          if (rendered) container.appendChild(rendered);
        }
      }
    }
  });
}

// --- Open Tabs ---

function createTabLi(tab: chrome.tabs.Tab): HTMLLIElement {
  const li = document.createElement("li");
  const link = document.createElement("tab-link");
  link.setAttribute("tab-id", String(tab.id));
  link.setAttribute("window-id", String(tab.windowId));
  link.setAttribute("title", tab.title || tab.url || "");
  link.setAttribute("url", tab.url || "");
  if (tab.favIconUrl) link.setAttribute("favicon", tab.favIconUrl);
  li.appendChild(link);
  return li;
}

async function loadTabs() {
  const windows = await chrome.windows.getAll({ populate: true });
  const groups = await chrome.tabGroups.query({});
  const groupMap = new Map(groups.map((g) => [g.id, g]));
  const container = document.getElementById("tabs");
  if (!container) return;
  container.innerHTML = "";

  for (const win of windows) {
    const tabs = win.tabs;
    if (!tabs) continue;

    const details = document.createElement("details");
    trackDetails(details, `window:${win.id}`, true);

    const summary = document.createElement("summary");
    const activeTab = tabs.find((t) => t.active);
    const windowLabel = activeTab
      ? `${activeTab.title} (${tabs.length} tabs)`
      : `Window (${tabs.length} tabs)`;
    summary.textContent = windowLabel;
    details.appendChild(summary);

    const ul = document.createElement("ul");

    // Group consecutive tabs by their groupId
    let currentGroupId = -1;
    let groupUl: HTMLUListElement | null = null;

    for (const tab of tabs) {
      if (tab.groupId !== -1 && tab.groupId !== currentGroupId) {
        // Start a new tab group
        const group = groupMap.get(tab.groupId);
        const groupDetails = document.createElement("details");
        const collapsed = group?.collapsed ?? false;
        trackDetails(groupDetails, `tabgroup:${tab.groupId}`, !collapsed);
        const groupSummary = document.createElement("summary");
        groupSummary.textContent = group?.title || "Unnamed Group";
        if (group?.color) groupSummary.classList.add(`group-${group.color}`);
        groupDetails.appendChild(groupSummary);
        groupUl = document.createElement("ul");
        groupDetails.appendChild(groupUl);

        const li = document.createElement("li");
        li.appendChild(groupDetails);
        ul.appendChild(li);
      }

      if (tab.groupId !== -1) {
        currentGroupId = tab.groupId;
        groupUl!.appendChild(createTabLi(tab));
      } else {
        // Ungrouped tab
        currentGroupId = -1;
        groupUl = null;
        ul.appendChild(createTabLi(tab));
      }
    }

    details.appendChild(ul);
    container.appendChild(details);
  }
}

// --- Live Updates ---

chrome.tabs.onCreated.addListener(loadTabs);
chrome.tabs.onRemoved.addListener(loadTabs);
chrome.tabs.onUpdated.addListener(loadTabs);
chrome.tabs.onMoved.addListener(loadTabs);
chrome.tabs.onActivated.addListener(loadTabs);
chrome.tabGroups.onCreated.addListener(loadTabs);
chrome.tabGroups.onUpdated.addListener(loadTabs);
chrome.tabGroups.onRemoved.addListener(loadTabs);

chrome.bookmarks.onCreated.addListener(loadBookmarks);
chrome.bookmarks.onRemoved.addListener(loadBookmarks);
chrome.bookmarks.onChanged.addListener(loadBookmarks);
chrome.bookmarks.onMoved.addListener(loadBookmarks);

// --- Init ---

async function init() {
  const settings = await loadSettings();
  initSettings(settings);
  detailsState = await loadState();
  loadBookmarks();
  loadTabs();
}

init();
