export function renderFeedback(container, aggregatedChanges, insights, getMetadata, defaultFormatter) {
  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (aggregatedChanges.length) {
    const heading = document.createElement("h2");
    heading.textContent = "Perubahan Stat";
    container.appendChild(heading);

    const list = document.createElement("ul");
    list.className = "stat-changes";
    aggregatedChanges.forEach((change) => {
      const metadata = getMetadata(change.key);
      const alias = metadata?.alias ?? change.key;
      const positiveIsGood = metadata?.positiveIsGood !== false;
      const isPositive = change.amount > 0;
      const outcomePositive = (isPositive && positiveIsGood) || (!isPositive && !positiveIsGood);

      const item = document.createElement("li");
      item.className = `stat-change ${outcomePositive ? "positive" : "negative"}`;

      const label = document.createElement("span");
      label.textContent = alias;
      const value = document.createElement("span");
      const formatter = metadata?.formatChange ?? defaultFormatter;
      value.textContent = formatter(change.amount);

      item.append(label, value);
      list.appendChild(item);
    });
    container.appendChild(list);
  }

  if (insights.length) {
    const heading = document.createElement("h2");
    heading.textContent = "Catatan Kondisi";
    container.appendChild(heading);

    const list = document.createElement("ul");
    list.className = "insights";
    insights.forEach((text) => {
      const item = document.createElement("li");
      item.textContent = text;
      list.appendChild(item);
    });
    container.appendChild(list);
  }
}
