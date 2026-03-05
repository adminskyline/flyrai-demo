import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export async function exportElementToPdf(element, filename = "GetPosted-export.pdf") {
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

export async function exportPlaybookToPdf(element, filename = "GetPosted-playbook.pdf") {
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
    // US Letter in points: 612 * 72/96 = 459, 792 * 72/96 = 594
    const pdfW = 612 * 0.75;
    const pdfH = 792 * 0.75;
    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: [pdfW, pdfH] });
    pdf.addImage(imgData, "JPEG", 0, 0, pdfW, pdfH);
    pdf.save(filename);
    return;
  }

  // 1:1 page rendering — each page element maps directly to a PDF page
  const pxToPt = 72 / 96;
  let pdf = null;

  for (let i = 0; i < pageElements.length; i++) {
    const el = pageElements[i];

    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      imageTimeout: 15000,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.92);

    // Use the actual rendered element dimensions for the PDF page
    const pageW = el.offsetWidth * pxToPt;
    const pageH = el.offsetHeight * pxToPt;

    if (i === 0) {
      pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: [pageW, pageH],
      });
    } else {
      pdf.addPage([pageW, pageH], "portrait");
    }

    // Fill the entire PDF page — no centering, no whitespace
    pdf.addImage(imgData, "JPEG", 0, 0, pageW, pageH);
  }

  if (pdf) pdf.save(filename);
}
