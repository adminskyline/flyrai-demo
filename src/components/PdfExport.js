import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export async function exportElementToPdf(element, filename = "FlyrAI-export.pdf") {
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 3,
    useCORS: true,
    backgroundColor: null,
    imageTimeout: 15000,
  });

  const imgData = canvas.toDataURL("image/jpeg", 0.95);

  // Convert element px dimensions to PDF points (72pt per inch, 96px per inch)
  const pxToPt = 72 / 96;
  const pdfW = element.offsetWidth * pxToPt;
  const pdfH = element.offsetHeight * pxToPt;

  const landscape = pdfW > pdfH;
  const pdf = new jsPDF({
    orientation: landscape ? "landscape" : "portrait",
    unit: "pt",
    format: [pdfW, pdfH],
  });

  pdf.addImage(imgData, "JPEG", 0, 0, pdfW, pdfH);
  pdf.save(filename);
}

export async function exportPlaybookToPdf(element, filename = "FlyrAI-playbook.pdf") {
  if (!element) return;

  const pageElements = element.querySelectorAll("[data-playbook-page]");
  if (pageElements.length === 0) {
    // Fallback: single-page export
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      imageTimeout: 15000,
    });
    const imgData = canvas.toDataURL("image/jpeg", 0.92);
    const pdfW = 595.28;
    const pdfH = (canvas.height * pdfW) / canvas.width;
    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: [pdfW, pdfH] });
    pdf.addImage(imgData, "JPEG", 0, 0, pdfW, pdfH);
    pdf.save(filename);
    return;
  }

  // Multi-page: render each [data-playbook-page] as a separate PDF page, fit to full width
  const A4_W = 595.28;
  const A4_H = 841.89;
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

  for (let i = 0; i < pageElements.length; i++) {
    const el = pageElements[i];
    const canvas = await html2canvas(el, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff",
      imageTimeout: 15000,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.92);

    // Fill full page width, scale height proportionally
    const drawW = A4_W;
    const drawH = (canvas.height / canvas.width) * A4_W;

    // If taller than A4, shrink to fit height instead
    let finalW = drawW, finalH = drawH;
    if (drawH > A4_H) {
      finalH = A4_H;
      finalW = (canvas.width / canvas.height) * A4_H;
    }

    // Center on page
    const x = (A4_W - finalW) / 2;
    const y = (A4_H - finalH) / 2;

    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, "JPEG", x, y, finalW, finalH);
  }

  pdf.save(filename);
}
