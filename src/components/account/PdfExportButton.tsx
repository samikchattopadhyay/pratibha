"use client";

import { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface PdfExportButtonProps {
  studentName: string;
  profileRef: React.RefObject<HTMLDivElement | null>;
}

export default function PdfExportButton({
  studentName,
  profileRef,
}: PdfExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!profileRef.current) return;

    setIsExporting(true);

    // Suppress console errors during PDF generation
    const originalError = console.error;
    const originalWarn = console.warn;
    console.error = (...args: any[]) => {
      const message = String(args[0]);
      // Suppress color parsing warnings
      if (!message.includes("oklab") && !message.includes("color function")) {
        originalError(...args);
      }
    };
    console.warn = (...args: any[]) => {
      const message = String(args[0]);
      if (!message.includes("oklab") && !message.includes("color function")) {
        originalWarn(...args);
      }
    };

    try {
      // Capture the profile content as canvas
      const canvas = await html2canvas(profileRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#fcf9f2",
        allowTaint: true,
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add image to PDF, handling multiple pages
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download PDF
      pdf.save(`${studentName}-profile.pdf`);
    } catch (error) {
      if (!(error instanceof Error && error.message?.includes("oklab"))) {
        console.error("Error generating PDF:", error);
      }
    } finally {
      // Restore console functions
      console.error = originalError;
      console.warn = originalWarn;
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gold text-charcoal font-medium hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isExporting ? (
        <>
          <span className="inline-block animate-spin">⟳</span>
          Generating PDF...
        </>
      ) : (
        <>
          <span>📥</span>
          Download PDF
        </>
      )}
    </button>
  );
}
