// content.js
function injectPopupCard() {
  const testCaseBox = document.querySelector(
    ".flex.w-full.flex-row.items-start.justify-between.gap-4"
  );
  if (!testCaseBox) return;
  if (document.getElementById("leetcode-helper-card")) return;

  const card = document.createElement("div");
  card.id = "leetcode-helper-card";
  card.style.marginLeft = "0.75rem"; // ~12px in rem

  const btn = document.createElement("button");
  btn.innerText = "💡 Tough Cases";
  btn.style.cssText = `
    padding: 0.5rem 1rem; /* scales with font */
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    font-size: clamp(0.75rem, 1vw, 0.875rem); /* responsive font */
    font-weight: 500;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 0;
    transition: all 0.2s ease-in-out;
  `;

  btn.addEventListener("mouseenter", () => {
    btn.style.opacity = "0.9";
  });

  btn.addEventListener("mouseleave", () => {
    btn.style.opacity = "1";
  });

  btn.addEventListener("click", async () => {
    try {
      const problemId = scrapeProblemId();
      const contentData = scrapeData();

      if (!problemId.success || !contentData.success) {
        console.log("Error scraping data");
        return;
      }

      // Ask background to open side panel
      chrome.runtime.sendMessage({
        type: "OPEN_SIDE_PANEL",
        source: "tough-testcases",
        problemId: problemId.data,
        content: contentData.data,
      });
    } catch (error) {
      console.error(
        "❌ Could not send message, extension context invalidated",
        error
      );
    }
  });

  card.appendChild(btn);
  testCaseBox.appendChild(card);
  console.log("✅ Injected Tough Cases button!");
}
function injectTopBarButton() {
  const navContainer = document.querySelector(
    ".relative.flex.flex-1.items-center.justify-end"
  );
  if (!navContainer) return;
  if (document.getElementById("leetcode-topbar-btn")) return;

  const btn = document.createElement("button");
  btn.id = "leetcode-topbar-btn";
  btn.innerText = "Interview Simulation";
  btn.style.cssText = `
    padding: 0.4rem 0.8rem;
    background: linear-gradient(135deg, #34d399 0%, #059669 100%);
    color: white;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    font-size: clamp(0.7rem, 0.9vw, 0.85rem);
    margin-left: 0.5rem;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 0;
    transition: all 0.2s ease-in-out;
  `;

  btn.addEventListener("mouseenter", () => {
    btn.style.opacity = "0.9";
  });

  btn.addEventListener("mouseleave", () => {
    btn.style.opacity = "1";
  });

  btn.addEventListener("click", async () => {
    try {
      const problemId = scrapeProblemId();
      const contentData = scrapeData();

      if (!problemId.success || !contentData.success) {
        console.log("Error scraping data");
        return;
      }

      // Ask background to open side panel
      chrome.runtime.sendMessage({
        type: "OPEN_SIDE_PANEL",
        source: "interview-simulation",
        problemId: problemId.data,
        content: contentData.data,
      });
    } catch (error) {
      console.error(
        "❌ Could not send message, extension context invalidated",
        error
      );
    }
  });

  navContainer.appendChild(btn);
  console.log("✅ Injected Quick Hint button!");
}
function scrapeProblemId() {
  // Properly escape the colon in hover:text-blue-s
  const container = document.querySelector(
    ".no-underline.hover\\:text-blue-s.truncate"
  );

  if (!container) {
    console.log("❌ Container not found");
    return { success: false, error: "Container not found" };
  }

  // Return the text content instead of the element
  const text = container.innerText.trim();
  return { success: true, data: text };
}
function scrapeData() {
  console.log("Scrapping");
  const container = document.querySelector(".elfjS");

  if (!container) {
    console.log("❌ Container not found");
    return { success: false, error: "Container not found" };
  }

  try {
    const data = Array.from(container.querySelectorAll("*"))
      .map((el) => (el.innerText ? el.innerText.trim() : ""))
      .filter(Boolean);

    const text = data.join("\n");
    // console.log("✅ Scraped text:", text);
    return { success: true, data: text };
  } catch (error) {
    console.error("❌ Error scraping data:", error);
    return { success: false, error: error.message };
  }
}

// Run after page load
window.addEventListener("load", () => {
  setTimeout(() => {
    injectPopupCard();
    injectTopBarButton();
  }, 2000);
});

// MutationObserver (SPA navigation)
const observer = new MutationObserver(() => {
  injectPopupCard();
  injectTopBarButton();
});
observer.observe(document.body, { childList: true, subtree: true });
