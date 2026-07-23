import jsPDF from "jspdf";
import type { SavedTrip } from "./trip-types";

const TEAL: [number, number, number] = [13, 148, 136];
const CORAL: [number, number, number] = [244, 94, 84];
const TEXT: [number, number, number] = [30, 41, 59];
const MUTED: [number, number, number] = [100, 116, 139];

function formatPKR(n: number) {
  return "PKR " + Math.round(n).toLocaleString("en-PK");
}

export function downloadTripPdf(trip: SavedTrip) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentW = pageW - margin * 2;
  let y = margin;

  const { itinerary, input } = trip;

  function ensure(space: number) {
    if (y + space > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  }

  function setColor(c: [number, number, number]) {
    doc.setTextColor(c[0], c[1], c[2]);
  }

  function heading(text: string, color: [number, number, number] = TEAL) {
    ensure(30);
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(margin, y, 4, 18, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    setColor(color);
    doc.text(text, margin + 10, y + 14);
    y += 26;
  }

  function subheading(text: string, color: [number, number, number] = CORAL) {
    ensure(22);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    setColor(color);
    doc.text(text, margin, y + 12);
    y += 18;
  }

  function body(text: string, opts: { color?: [number, number, number]; size?: number; indent?: number } = {}) {
    const size = opts.size ?? 10;
    const color = opts.color ?? TEXT;
    const indent = opts.indent ?? 0;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    setColor(color);
    const lines = doc.splitTextToSize(text, contentW - indent);
    for (const line of lines) {
      ensure(size + 4);
      doc.text(line, margin + indent, y + size);
      y += size + 4;
    }
  }

  function bullet(text: string, marker = "•", color: [number, number, number] = CORAL) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    setColor(color);
    ensure(14);
    doc.text(marker, margin + 4, y + 10);
    body(text, { indent: 16 });
  }

  function divider() {
    ensure(10);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, y + 4, pageW - margin, y + 4);
    y += 12;
  }

  // Title banner
  doc.setFillColor(TEAL[0], TEAL[1], TEAL[2]);
  doc.rect(0, 0, pageW, 90, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text("SAFAR SAATHI", margin, 32);
  doc.setFontSize(22);
  doc.text(itinerary.destinationResolved, margin, 60);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`${itinerary.days.length}-day trip from ${input.startCity}`, margin, 78);
  y = 110;

  // Summary
  body(itinerary.summary, { color: TEXT, size: 11 });
  y += 4;

  // Trip details
  heading("Trip Details");
  const details: [string, string][] = [
    ["Days", String(itinerary.days.length)],
    ["From", input.startCity],
    ["Group", input.groupSize],
    ["Budget", formatPKR(input.budgetPKR)],
    ["Estimated cost", formatPKR(itinerary.totalEstimatedCostPKR)],
    ["Best time to visit", itinerary.bestTimeToVisit],
    ["Interests", input.interests.join(", ")],
  ];
  for (const [k, v] of details) {
    ensure(16);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    setColor(MUTED);
    doc.text(k, margin, y + 10);
    doc.setFont("helvetica", "normal");
    setColor(TEXT);
    const lines = doc.splitTextToSize(v, contentW - 130);
    lines.forEach((line: string, i: number) => {
      if (i > 0) ensure(14);
      doc.text(line, margin + 130, y + 10);
      if (i < lines.length - 1) y += 12;
    });
    y += 16;
  }

  divider();

  // Day-by-day
  heading("Day-by-Day Itinerary");
  for (const d of itinerary.days) {
    ensure(40);
    doc.setFillColor(TEAL[0], TEAL[1], TEAL[2]);
    doc.roundedRect(margin, y, contentW, 26, 4, 4, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text(`Day ${d.day} — ${d.title}`, margin + 10, y + 17);
    const costLabel = formatPKR(d.totalCostPKR);
    const cw = doc.getTextWidth(costLabel);
    doc.text(costLabel, margin + contentW - cw - 10, y + 17);
    y += 34;

    if (d.places?.length) {
      subheading("Places to visit");
      for (const p of d.places) {
        body(p.name, { color: TEXT, size: 10 });
        body(p.description, { color: MUTED, size: 9, indent: 8 });
      }
    }

    if (d.activities?.length) {
      subheading("Activities");
      for (const a of d.activities) bullet(a);
    }

    subheading("Cost breakdown");
    const rows: [string, string, number][] = [
      ["Transport", d.transport.description, d.transport.costPKR],
      ["Food", d.food.description, d.food.costPKR],
      ["Stay", d.stay.description, d.stay.costPKR],
    ];
    for (const [label, desc, cost] of rows) {
      ensure(24);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, y, contentW, 22, 3, 3, "S");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      setColor(TEAL);
      doc.text(label.toUpperCase(), margin + 8, y + 10);
      doc.setFont("helvetica", "normal");
      setColor(TEXT);
      const descLines = doc.splitTextToSize(desc, contentW - 170);
      doc.text(descLines[0] ?? "", margin + 70, y + 10);
      doc.setFont("helvetica", "bold");
      setColor(CORAL);
      const c = formatPKR(cost);
      const w = doc.getTextWidth(c);
      doc.text(c, margin + contentW - w - 8, y + 10);
      if (descLines.length > 1) {
        setColor(MUTED);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(descLines.slice(1).join(" "), margin + 70, y + 18, { maxWidth: contentW - 170 });
      }
      y += 26;
    }
    y += 6;
  }

  divider();

  // Budget tips
  heading("Budget Tips", CORAL);
  for (const t of itinerary.budgetTips) bullet(t, "✓", TEAL);

  y += 6;

  // Packing
  heading("Packing Checklist");
  for (const p of itinerary.packingChecklist) bullet(p, "□", CORAL);

  // Footer on each page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setColor(MUTED);
    doc.text(
      "Generated by Safar Saathi · AI estimates — confirm prices locally.",
      margin,
      pageH - 16
    );
    const pageLabel = `${i} / ${pageCount}`;
    const w = doc.getTextWidth(pageLabel);
    doc.text(pageLabel, pageW - margin - w, pageH - 16);
  }

  const safeName = itinerary.destinationResolved.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  doc.save(`safar-saathi-${safeName}.pdf`);
}