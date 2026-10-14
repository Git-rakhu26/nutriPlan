// Responsive Canvas chart; no external charting library is required.
export function renderMacroChart(needs) {
  const canvas = document.getElementById("macroChart");
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);

  const values = [
    { label: "Protein", value: needs.protein, color: "#7658ed" },
    { label: "Carbs", value: needs.carbs, color: "#ed9638" },
    { label: "Fat", value: needs.fat, color: "#d95791" }
  ];
  const max = Math.max(...values.map((item) => item.value), 1);
  const left = 12, right = 46, top = 24, gap = 76, barHeight = 17;
  const usableWidth = Math.max(50, rect.width - left - right);

  values.forEach((item, i) => {
    const y = top + i * gap;
    ctx.font = "12px DM Sans, sans-serif";
    ctx.fillStyle = "#62677c";
    ctx.textAlign = "left";
    ctx.fillText(item.label, left, y);
    ctx.font = "bold 12px DM Sans, sans-serif";
    ctx.fillStyle = "#252840";
    ctx.textAlign = "right";
    ctx.fillText(`${item.value} g`, rect.width - 5, y);
    drawRoundRect(ctx, left, y + 14, usableWidth, barHeight, 8, "#efeff6");
    drawRoundRect(ctx, left, y + 14, usableWidth * item.value / max, barHeight, 8, item.color);
  });

  document.getElementById("macroLegend").innerHTML = values.map((item) => `
    <div class="legend-item"><span><i class="legend-dot" style="background:${item.color}"></i>${item.label}</span><strong>${item.value} g</strong></div>
  `).join("");
}

function drawRoundRect(ctx, x, y, w, h, r, color) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}
