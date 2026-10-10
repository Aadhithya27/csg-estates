import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Bill, Property, RentalHome } from '../types';
import { FinanceService } from './finance';

export class PDFGeneratorService {
  /**
   * Generate & download clean, simple, aligned monthly Rent Bill PDF
   */
  static generateBillPDF(bill: Bill, home: RentalHome | undefined, property: Property | undefined) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // 1. Top Header Banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 26, 'F');

    // Company Brand Header
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('C S G ESTATES', 14, 12);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(199, 210, 254); // indigo-200
    doc.text('Property Management & Rental Invoices', 14, 19);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text('RENT INVOICE', 196, 12, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(203, 213, 225);
    doc.text(`Invoice ID: ${bill.id}`, 196, 19, { align: 'right' });

    // 2. Meta Section with Clean 2-Column Alignment
    const startY = 34;

    // Left Column: Property & Bill Period
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text('ESTATE & PERIOD DETAILS', 14, startY);

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(property?.name || 'C S G Estates Property', 14, startY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(property?.address || 'Chennai, Tamil Nadu', 14, startY + 11.5);
    doc.text(`Billing Month: ${bill.billingMonth}`, 14, startY + 17);
    doc.text(`Due Date: ${bill.dueDate}`, 14, startY + 22.5);

    // Right Column: Tenant & Rental Unit Details
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('TENANT & UNIT DETAILS', 120, startY);

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(home?.tenantName || 'Tenant (Unassigned)', 120, startY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Rental Unit: ${home?.houseNumber || 'N/A'}`, 120, startY + 11.5);
    doc.text(`Phone: ${home?.tenantPhone || 'N/A'}`, 120, startY + 17);
    doc.text(`Payment Status: ${bill.status.toUpperCase()}`, 120, startY + 22.5);

    // 3. Bill Itemized Breakdown Table
    // Use FinanceService.formatPdfCurrency for pure ASCII ('Rs. 12,000') to avoid jsPDF glyph corruption
    const tableRows = [
      ['1', 'Monthly Base House Rent', 'Standard Monthly Rent', FinanceService.formatPdfCurrency(bill.rentAmount)],
      ['2', 'Electricity Charges', 'Utility Consumption', FinanceService.formatPdfCurrency(bill.electricityCharge)],
      ['3', 'Water Supply Charges', 'Water Maintenance', FinanceService.formatPdfCurrency(bill.waterCharge)],
    ];

    if (bill.otherCharges > 0) {
      tableRows.push(['4', 'Other Maintenance / Service Charges', 'Property Upkeep', FinanceService.formatPdfCurrency(bill.otherCharges)]);
    }

    if (bill.previousBalance > 0) {
      tableRows.push([String(tableRows.length + 1), 'Previous Outstanding Balance', 'Carried Forward Arrears', FinanceService.formatPdfCurrency(bill.previousBalance)]);
    }

    // Exact margins: Left: 14mm, Right: 14mm. Page width: 210mm. Table width = 182mm (14 to 196mm).
    autoTable(doc, {
      startY: startY + 28,
      margin: { left: 14, right: 14 },
      tableWidth: 182,
      head: [['#', 'Item Description', 'Charge Type', 'Amount']],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59], // slate-800
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        lineColor: [51, 65, 85],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { cellWidth: 14, halign: 'center' },
        1: { cellWidth: 88, halign: 'left' },
        2: { cellWidth: 42, halign: 'left' },
        3: { cellWidth: 38, halign: 'right', fontStyle: 'bold' },
      },
      didParseCell: (data) => {
        // Guarantee column 3 header ('Amount') and body numbers are both right-aligned
        if (data.column.index === 3) {
          data.cell.styles.halign = 'right';
        }
        if (data.column.index === 0) {
          data.cell.styles.halign = 'center';
        }
      },
      styles: {
        fontSize: 8.5,
        cellPadding: 3.5,
        textColor: [15, 23, 42],
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
        valign: 'middle',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 8;

    // 4. Notes on the Left
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text('Payment & Settlement Details:', 14, finalY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Payment Modes: UPI (GPay/PhonePe), Bank Transfer, Cheque, Cash', 14, finalY + 13);
    doc.text('Please retain this receipt for your records.', 14, finalY + 19);
    doc.text('Issued by C S G Estates Management Office.', 14, finalY + 25);

    // 5. Aligned Totals Summary Box on the Right (Starts at 116mm, ends at 196mm, width 80mm)
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(116, finalY, 80, 36, 2, 2, 'FD');

    // Row 1: Total Gross Amount
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Total Gross Amount:', 122, finalY + 8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(FinanceService.formatPdfCurrency(bill.totalAmount), 190, finalY + 8, { align: 'right' });

    // Row 2: Total Amount Paid
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Total Amount Paid:', 122, finalY + 16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129); // emerald
    doc.text(`- ${FinanceService.formatPdfCurrency(bill.amountPaid)}`, 190, finalY + 16, { align: 'right' });

    // Divider Line
    doc.setDrawColor(203, 213, 225);
    doc.line(122, finalY + 20, 190, finalY + 20);

    // Row 3: Net Balance Due
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    if (bill.remainingAmount > 0) {
      doc.setTextColor(225, 29, 72); // rose
    } else {
      doc.setTextColor(16, 185, 129); // emerald
    }
    doc.text('Net Balance Due:', 122, finalY + 28);
    doc.text(FinanceService.formatPdfCurrency(bill.remainingAmount), 190, finalY + 28, { align: 'right' });

    doc.save(`${bill.id}_${home?.houseNumber.replace(/\s+/g, '_') || 'CSG_Bill'}.pdf`);
  }
}
