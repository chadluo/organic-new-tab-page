// --- Web Components ---

class BookmarkLink extends HTMLElement {
  connectedCallback() {
    const template = document.getElementById("bookmark-link-template");
    const content = template.content.cloneNode(true);
    const a = content.querySelector("a");
    a.href = this.getAttribute("url");
    a.textContent = this.getAttribute("title") || this.getAttribute("url");
    this.appendChild(content);
  }
}

class TabLink extends HTMLElement {
  connectedCallback() {
    const tabId = Number(this.getAttribute("tab-id"));
    const windowId = Number(this.getAttribute("window-id"));

    const template = document.getElementById("tab-link-template");
    const content = template.content.cloneNode(true);
    const a = content.querySelector("a");
    a.textContent = this.getAttribute("title") || "Untitled";
    a.addEventListener("click", (e) => {
      e.preventDefault();
      chrome.tabs.update(tabId, { active: true });
      chrome.windows.update(windowId, { focused: true });
    });
    this.appendChild(content);
  }
}

customElements.define("bookmark-link", BookmarkLink);
customElements.define("tab-link", TabLink);

// --- Bookmarks ---

function renderBookmarkNode(node) {
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

function loadTabs() {
  chrome.windows.getAll({ populate: true }, (windows) => {
    const container = document.getElementById("tabs");

    for (const win of windows) {
      const details = document.createElement("details");
      details.open = true;

      const summary = document.createElement("summary");
      const activeTab = win.tabs.find((t) => t.active);
      const windowLabel = activeTab
        ? `${activeTab.title} (${win.tabs.length} tabs)`
        : `Window (${win.tabs.length} tabs)`;
      summary.textContent = windowLabel;
      details.appendChild(summary);

      const ul = document.createElement("ul");
      for (const tab of win.tabs) {
        const li = document.createElement("li");
        const link = document.createElement("tab-link");
        link.setAttribute("tab-id", tab.id);
        link.setAttribute("window-id", tab.windowId);
        link.setAttribute("title", tab.title || tab.url);
        li.appendChild(link);
        ul.appendChild(li);
      }
      details.appendChild(ul);
      container.appendChild(details);
    }
  });
}

// --- Init ---

loadBookmarks();
loadTabs();
