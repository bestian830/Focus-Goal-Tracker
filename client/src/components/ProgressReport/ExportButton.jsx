import React from 'react';
import { Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function ExportButton() {

  const handleExport = () => {
    // Select the main content area to capture
    // Adjust this selector if you want to capture a different element
    const elementToCapture = document.querySelector('.main-content'); 

    if (!elementToCapture) {
      console.error("Could not find element to capture for PDF export.");
      alert("Error exporting PDF: Content area not found.");
      return;
    }

    console.log("Starting PDF export for element:", elementToCapture);

    // Use html2canvas to render the element onto a canvas
    html2canvas(elementToCapture, {
      scale: 2, // Increase scale for better resolution
      useCORS: true, // Enable cross-origin images if any
      logging: true, // Enable logging for debugging
    }).then(canvas => {
      console.log("Canvas created successfully.");
      const imgData = canvas.toDataURL('image/png');
      
      // Create a jsPDF instance
      // Use dimensions of the captured element for better page fit
      const pdfWidth = elementToCapture.offsetWidth;
      const pdfHeight = elementToCapture.offsetHeight;
      
      // Determine orientation based on aspect ratio
      const orientation = pdfWidth > pdfHeight ? 'l' : 'p'; // 'l' for landscape, 'p' for portrait
      
      // Create PDF using 'pt' units (points), matching typical PDF dimensions
      // A4 size in points: 595.28 x 841.89
      // We'll scale the image to fit the width of an A4 page
      const pdf = new jsPDF(orientation, 'pt', 'a4');
      const pdfPageWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calculate the ratio to scale the image to fit the PDF page width
      const ratio = pdfPageWidth / imgWidth;
      const scaledHeight = imgHeight * ratio;
      let heightLeft = scaledHeight;
      let position = 0;
      
      console.log("PDF dimensions (pt):", pdfPageWidth, pdfPageHeight);
      console.log("Image dimensions (px):", imgWidth, imgHeight);
      console.log("Scaling ratio:", ratio);
      console.log("Scaled image height (pt):", scaledHeight);
      
      // Add the image to the PDF, handling multi-page if necessary
      pdf.addImage(imgData, 'PNG', 0, position, pdfPageWidth, scaledHeight);
      heightLeft -= pdfPageHeight;

      while (heightLeft > 0) {
        position = heightLeft - scaledHeight; // Adjust position for next page
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfPageWidth, scaledHeight);
        heightLeft -= pdfPageHeight;
      }
      
      console.log("PDF generated, triggering download...");
      // Save the PDF
      pdf.save('GoalProgressReport.pdf');
      
    }).catch(err => {
      console.error("Error during html2canvas capture:", err);
      alert("Failed to export PDF. Check console for details.");
    });
  };

  return (
    <Button
      variant="contained"
      color="success" // Changed color to green
      startIcon={<DownloadIcon />}
      onClick={handleExport}
      sx={{ mb: 2 }} // Add some margin bottom for spacing
    >
      Export PDF
    </Button>
  );
}
