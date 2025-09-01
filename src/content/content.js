function scrapeData() {
  const container = document.querySelector(
    ".flex.w-full.flex-1.flex-col.gap-4.overflow-y-auto.px-4.py-5"
  );
  if (!container) return [];

  return Array.from(container.querySelectorAll("*"))
    .map((el) => el.innerText.trim())
    .filter(Boolean);
}

export default scrapeData;
