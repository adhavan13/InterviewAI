// content.js
function injectPopupCard() {
  const testCaseBox = document.querySelector(
    ".flex.w-full.flex-row.items-start.justify-between.gap-4"
  );

  if (!testCaseBox) {
    console.log("❌ Test case box not found yet...");
    return;
  }

  // Prevent duplicates
  if (document.getElementById("leetcode-helper-card")) return;

  // Create popup card container
  const card = document.createElement("div");
  card.id = "leetcode-helper-card";
  card.style.position = "relative";
  card.style.display = "inline-block";
  card.style.marginLeft = "12px";

  // Create button (trigger) with professional styling
  const btn = document.createElement("button");
  btn.innerText = "💡 Tough Cases";
  btn.style.cssText = `
    padding: 8px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.25);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    letter-spacing: 0.025em;
    min-height: 36px;
    display: flex;
    align-items: center;
    gap: 6px;
    position: relative;
    overflow: hidden;
  `;

  // Add subtle hover and active states
  btn.addEventListener("mouseenter", () => {
    btn.style.transform = "translateY(-1px)";
    btn.style.boxShadow = "0 4px 16px rgba(102, 126, 234, 0.35)";
    btn.style.background = "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)";
  });

  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "translateY(0)";
    btn.style.boxShadow = "0 2px 8px rgba(102, 126, 234, 0.25)";
    btn.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
  });

  btn.addEventListener("mousedown", () => {
    btn.style.transform = "translateY(0) scale(0.98)";
  });

  btn.addEventListener("mouseup", () => {
    btn.style.transform = "translateY(-1px) scale(1)";
  });

  // Remove popup elements as they're no longer needed

  // Add button click → open side panel with feedback
  btn.addEventListener("click", (e) => {
    e.preventDefault();

    // Add click feedback
    btn.style.background = "linear-gradient(135deg, #4c51bf 0%, #553c9a 100%)";
    setTimeout(() => {
      btn.style.background =
        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    }, 150);

    chrome.runtime.sendMessage({
      type: "OPEN_SIDE_PANEL",
      source: "tough-test-cases",
    });
  });

  // Append elements
  card.appendChild(btn);
  testCaseBox.appendChild(card);

  console.log("✅ Injected enhanced Tough Cases popup card!");
}

// Run after page load
window.addEventListener("load", () => {
  setTimeout(injectPopupCard, 2000);
});

// MutationObserver (LeetCode is React SPA → reload UI)
const observer = new MutationObserver(() => {
  injectPopupCard();
});
observer.observe(document.body, { childList: true, subtree: true });
