import React, { useState, useEffect } from 'react';
import { Button, CircularProgress } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function ExportButton() {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      console.log("Starting specific content PDF export");
      
      // List all data-export-id elements for debugging
      console.log("DEBUGGING - All export elements:");
      document.querySelectorAll('[data-export-id]').forEach(el => {
        console.log(`Found element with data-export-id="${el.getAttribute('data-export-id')}"`, el);
      });
      
      // Give some time for the declaration dialog to open if it was triggered
      // by our click event handler in GoalDetails
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Initialize PDF
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfMargin = 40; // margin in points
      let yPosition = pdfMargin; // starting y position
      
      // Add title
      const title = `Goal Progress Report - ${new Date().toLocaleDateString()}`;
      pdf.setFontSize(18);
      pdf.text(title, pdfWidth / 2, yPosition, { align: 'center' });
      yPosition += 40;
      
      // Find AI analysis content if available
      const aiAnalysisElement = document.querySelector('[data-export-id="ai-analysis-content"]');
      console.log("AI Analysis element search result:", aiAnalysisElement);
      
      if (aiAnalysisElement) {
        console.log("AI Analysis content found, capturing...");
        console.log("AI Analysis content:", aiAnalysisElement.textContent);
        
        // Add AI Analysis section title
        pdf.setFontSize(14);
        pdf.text("AI Analysis Report", pdfWidth / 2, yPosition, { align: 'center' });
        yPosition += 30;
        
        try {
          // Option 1: Try to capture using html2canvas (original method)
          if (false) { // temporarily disable
            // Capture AI analysis content
            const aiCanvas = await html2canvas(aiAnalysisElement, {
              scale: 2,
              useCORS: true,
              logging: true, // Enable logging
              backgroundColor: '#ffffff'
            });
            
            // Calculate image dimensions to fit PDF width with margins
            const imgWidth = pdfWidth - (pdfMargin * 2);
            const imgHeight = (aiCanvas.height * imgWidth) / aiCanvas.width;
            
            // Add the image to PDF
            pdf.addImage(
              aiCanvas.toDataURL('image/png'), 
              'PNG', 
              pdfMargin, 
              yPosition, 
              imgWidth, 
              imgHeight
            );
            
            // Update y position
            yPosition += imgHeight + 40;
          } 
          // Option 2: Extract text content and add directly to PDF (alternative method)
          else {
            // Extract text content
            const textContent = aiAnalysisElement.textContent || aiAnalysisElement.innerText || '';
            console.log("Extracted text content:", textContent);
            
            if (textContent.trim()) {
              // Set font for content
              pdf.setFontSize(12);
              
              // Split text into lines that fit the page width
              const textLines = pdf.splitTextToSize(textContent, pdfWidth - (pdfMargin * 2));
              
              // Add text to PDF
              pdf.text(textLines, pdfMargin, yPosition);
              
              // Update y position based on number of lines
              yPosition += textLines.length * 14 + 20; // 14pt per line plus 20pt padding
            } else {
              pdf.setFontSize(12);
              pdf.text("AI Analysis content exists but appears to be empty", pdfMargin, yPosition);
              yPosition += 20;
            }
          }
          
          console.log("AI Analysis content added successfully");
        } catch (err) {
          console.error("Error capturing AI analysis content:", err);
          // Add error text instead
          pdf.setFontSize(12);
          pdf.setTextColor(255, 0, 0);
          pdf.text("Error capturing AI analysis content: " + err.message, pdfMargin, yPosition);
          pdf.setTextColor(0, 0, 0);
          yPosition += 20;
        }
      } else {
        console.log("AI Analysis content not found");
        pdf.setFontSize(12);
        pdf.text("AI Analysis report not available (element not found)", pdfMargin, yPosition);
        yPosition += 20;
      }
      
      // Find Goal Declaration content if available
      const declarationElement = document.querySelector('[data-export-id="goal-declaration-content"]');
      if (declarationElement) {
        console.log("Goal Declaration content found, capturing...");
        
        // Add new page for declaration
        pdf.addPage();
        yPosition = pdfMargin;
        
        // Add Declaration section title
        pdf.setFontSize(14);
        pdf.text("Goal Declaration", pdfWidth / 2, yPosition, { align: 'center' });
        yPosition += 30;
        
        try {
          // Capture declaration content
          const declarationCanvas = await html2canvas(declarationElement, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
          });
          
          // Calculate image dimensions to fit PDF width with margins
          const imgWidth = pdfWidth - (pdfMargin * 2);
          const imgHeight = (declarationCanvas.height * imgWidth) / declarationCanvas.width;
          
          // Add the image to PDF
          pdf.addImage(
            declarationCanvas.toDataURL('image/png'), 
            'PNG', 
            pdfMargin, 
            yPosition, 
            imgWidth, 
            imgHeight
          );
          
          console.log("Goal Declaration content added successfully");
        } catch (err) {
          console.error("Error capturing Goal Declaration content:", err);
          // Add error text instead
          pdf.setFontSize(12);
          pdf.setTextColor(255, 0, 0);
          pdf.text("Error capturing Goal Declaration content", pdfMargin, yPosition);
          pdf.setTextColor(0, 0, 0);
        }
      } else {
        console.log("Goal Declaration content not found");
        // Add note about missing declaration
        pdf.setFontSize(12);
        pdf.text("Goal Declaration not available", pdfMargin, yPosition);
      }
      
      // Add footer with timestamp
      const pageCount = pdf.internal.getNumberOfPages();
      pdf.setFontSize(10);
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.text(
          `Generated on ${new Date().toLocaleString()} - Page ${i} of ${pageCount}`,
          pdfWidth / 2,
          pdf.internal.pageSize.getHeight() - 20,
          { align: 'center' }
        );
      }
      
      // Save the PDF
      pdf.save('GoalReport.pdf');
      console.log("PDF generated successfully");
      
    } catch (err) {
      console.error("Error during PDF export:", err);
      alert("Failed to export PDF. Check console for details.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      variant="contained"
      color="success"
      startIcon={exporting ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
      onClick={handleExport}
      disabled={exporting}
      sx={{ 
        mb: 3,
        width: '100%',
        maxWidth: { sm: '200px' },
        display: 'block',
        mx: 'auto'
      }}
    >
      {exporting ? 'Exporting...' : 'Export Report'}
    </Button>
  );
}
