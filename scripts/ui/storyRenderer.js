export function setStoryText(container, content) {
  if (!container) {
    return;
  }

  container.innerHTML = "";
  const paragraphs = Array.isArray(content)
    ? content.filter(Boolean)
    : String(content)
        .split("\n")
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);

  paragraphs.forEach((paragraph) => {
    const p = document.createElement("p");
    p.textContent = paragraph;
    container.appendChild(p);
  });
}
