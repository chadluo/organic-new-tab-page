// --- Bookmarks ---

function renderBookmarkNode(node) {
  if (node.url) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = node.url;
    a.textContent = node.title || node.url;
    a.target = "_blank";
    li.appendChild(a);
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
        const a = document.createElement("a");
        a.href = "#";
        a.textContent = tab.title || tab.url;
        a.addEventListener("click", (e) => {
          e.preventDefault();
          chrome.tabs.update(tab.id, { active: true });
          chrome.windows.update(tab.windowId, { focused: true });
        });
        li.appendChild(a);
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
