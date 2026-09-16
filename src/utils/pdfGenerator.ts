import { jsPDF } from 'jspdf';
import { Order } from '../types';

export function generateInvoicePDF(order: Order, storeName: string) {
  // Initialize standard A4 PDF: 210mm x 297mm
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Colors
  const RED = [220, 38, 38]; // #DC2626
  const SLATE_DARK = [30, 41, 59]; // #1E293B
  const SLATE_LIGHT = [100, 116, 139]; // #64748B
  const BG_LIGHT = [248, 250, 252]; // #F8FAFC
  const BORDER_COLOR = [226, 232, 240]; // #E2E8F0

  // 1. Red Header Accent Bar
  doc.setFillColor(RED[0], RED[1], RED[2]);
  doc.rect(0, 0, 210, 4, 'F');

  // 2. ACI Branding (Left Side Header)
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(RED[0], RED[1], RED[2]);
  doc.text('ACI PLC', 15, 20);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(SLATE_LIGHT[0], SLATE_LIGHT[1], SLATE_LIGHT[2]);
  doc.text('Distribution & Logistics Division', 15, 25);
  doc.text('ACI Centre, 245 Tejgaon Industrial Area, Dhaka', 15, 29);

  // 3. Invoice Header Title & Reference (Right Side)
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('TRADE INVOICE', 195, 20, { align: 'right' });

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text(`Invoice ID: `, 150, 26);
  doc.setFont('Helvetica', 'bold');
  doc.text(order.id, 195, 26, { align: 'right' });

  doc.setFont('Helvetica', 'normal');
  doc.text(`Date: `, 150, 31);
  doc.setFont('Helvetica', 'bold');
  doc.text(order.date, 195, 31, { align: 'right' });

  doc.setFont('Helvetica', 'normal');
  doc.text(`Status: `, 150, 36);
  doc.setFont('Helvetica', 'bold');
  // Dynamic color coding for status in text
  if (order.status === 'Delivered') {
    doc.setTextColor(16, 185, 129); // Emerald
  } else if (order.status === 'In Transit') {
    doc.setTextColor(59, 130, 246); // Blue
  } else {
    doc.setTextColor(245, 158, 11); // Amber
  }
  doc.text(order.status.toUpperCase(), 195, 36, { align: 'right' });

  // Reset text color
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);

  // Thin line divider
  doc.setDrawColor(BORDER_COLOR[0], BORDER_COLOR[1], BORDER_COLOR[2]);
  doc.setLineWidth(0.5);
  doc.line(15, 42, 195, 42);

  // 4. Billing Details & Order Context Columns
  // Left Column: Bill To
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(SLATE_LIGHT[0], SLATE_LIGHT[1], SLATE_LIGHT[2]);
  doc.text('BILL TO (RETAILER):', 15, 50);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text(storeName, 15, 56);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  
  // Wrap shipping address
  const shippingAddress = order.shippingAddress || 'Registered Store Address';
  const splitAddress = doc.splitTextToSize(shippingAddress, 80);
  doc.text(splitAddress, 15, 61);

  // Right Column: Order & Distribution Hub Info
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(SLATE_LIGHT[0], SLATE_LIGHT[1], SLATE_LIGHT[2]);
  doc.text('DELIVERY & HUB INFO:', 115, 50);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);

  doc.text('Authorized Division:', 115, 56);
  doc.setFont('Helvetica', 'bold');
  doc.text(order.division, 195, 56, { align: 'right' });

  doc.setFont('Helvetica', 'normal');
  doc.text('Distribution Hub:', 115, 61);
  doc.setFont('Helvetica', 'bold');
  const isInsideDhaka = order.deliveryLocation === 'inside' || 
    ['aci-centre', 'nobo-tower', 'santa-forum', 'police-plaza'].includes(order.deliveryLocation || '');
  doc.text(isInsideDhaka ? 'Tejgaon Central Depot' : 'Gazipur Regional Hub', 195, 61, { align: 'right' });

  doc.setFont('Helvetica', 'normal');
  doc.text('Payment Method:', 115, 66);
  doc.setFont('Helvetica', 'bold');
  const payLabel = order.paymentMethod === 'Bank' 
    ? 'Bank Transfer' 
    : order.paymentMethod === 'COD' 
    ? 'Cash on Delivery' 
    : order.paymentMethod === 'Card' 
    ? 'Credit/Debit Card' 
    : order.paymentMethod || 'bKash';
  doc.text(payLabel, 195, 66, { align: 'right' });

  // 5. Order Items Table
  const tableStartY = 78;
  
  // Table Header Background
  doc.setFillColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.rect(15, tableStartY, 180, 8, 'F');

  // Table Header Text
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('SL.', 18, tableStartY + 5.5);
  doc.text('PRODUCT DESCRIPTION', 28, tableStartY + 5.5);
  doc.text('UNIT PRICE', 125, tableStartY + 5.5, { align: 'right' });
  doc.text('QTY', 150, tableStartY + 5.5, { align: 'right' });
  doc.text('TOTAL (BDT)', 190, tableStartY + 5.5, { align: 'right' });

  // Table Rows
  let currentY = tableStartY + 8;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);

  order.items.forEach((item, index) => {
    // Zebra background styling
    if (index % 2 === 1) {
      doc.setFillColor(BG_LIGHT[0], BG_LIGHT[1], BG_LIGHT[2]);
      doc.rect(15, currentY, 180, 8, 'F');
    }

    // Row texts
    doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
    doc.text((index + 1).toString(), 18, currentY + 5.5);
    doc.text(item.product.name, 28, currentY + 5.5);
    doc.text(`৳${item.product.price.toLocaleString()}`, 125, currentY + 5.5, { align: 'right' });
    doc.text(`${item.quantity} ${item.product.unit || 'pcs'}`, 150, currentY + 5.5, { align: 'right' });
    
    const rowTotal = item.product.price * item.quantity;
    doc.setFont('Helvetica', 'bold');
    doc.text(`৳${rowTotal.toLocaleString()}`, 190, currentY + 5.5, { align: 'right' });
    doc.setFont('Helvetica', 'normal');

    // Draw row bottom line
    doc.setDrawColor(BORDER_COLOR[0], BORDER_COLOR[1], BORDER_COLOR[2]);
    doc.setLineWidth(0.3);
    doc.line(15, currentY + 8, 195, currentY + 8);

    currentY += 8;
  });

  // Calculate items subtotal
  const subtotal = order.items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const deliveryCharge = order.deliveryCharge || 0;

  // 6. Summary Calculation Box (Right Side)
  const summaryWidth = 70;
  const summaryStartX = 125;
  const summaryStartY = currentY + 6;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(SLATE_LIGHT[0], SLATE_LIGHT[1], SLATE_LIGHT[2]);
  
  doc.text('Items Subtotal:', summaryStartX, summaryStartY);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text(`৳${subtotal.toLocaleString()}`, 190, summaryStartY, { align: 'right' });

  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(SLATE_LIGHT[0], SLATE_LIGHT[1], SLATE_LIGHT[2]);
  doc.text('Delivery & Logistics Charge:', summaryStartX, summaryStartY + 5);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text(`৳${deliveryCharge.toLocaleString()}`, 190, summaryStartY + 5, { align: 'right' });

  // Border line before grand total
  doc.setDrawColor(BORDER_COLOR[0], BORDER_COLOR[1], BORDER_COLOR[2]);
  doc.setLineWidth(0.5);
  doc.line(summaryStartX, summaryStartY + 8, 195, summaryStartY + 8);

  // Grand Total
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(RED[0], RED[1], RED[2]);
  doc.text('GRAND TOTAL BILL:', summaryStartX, summaryStartY + 13);
  doc.setFontSize(12);
  doc.text(`৳${order.totalPrice.toLocaleString()} BDT`, 190, summaryStartY + 13, { align: 'right' });

  // 7. Footer - Real-looking Vector Barcode Placeholder & Systems Message
  const footerStartY = 230;

  // Draw a beautifully calculated Vector Barcode (alternating line widths)
  doc.setDrawColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  
  const barcodeX = 15;
  const barcodeY = footerStartY;
  const barcodeHeight = 15;
  
  // Custom barcode lines configuration (varying widths and spaces)
  const barcodePattern = [
    2, 1, 3, 2, 1, 3, 1, 2, 4, 1, 2, 2, 1, 3, 2, 1, 1, 4, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 4
  ];
  
  let barcodeCurrentX = barcodeX;
  barcodePattern.forEach((width, index) => {
    // Alternate black lines and white spaces
    if (index % 2 === 0) {
      doc.setLineWidth(width * 0.4);
      doc.line(barcodeCurrentX, barcodeY, barcodeCurrentX, barcodeY + barcodeHeight);
    }
    barcodeCurrentX += (width * 0.4) + 0.5;
  });

  // Barcode alphanumeric text
  doc.setFont('Courier', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(SLATE_LIGHT[0], SLATE_LIGHT[1], SLATE_LIGHT[2]);
  doc.text(`*${order.id}*`, barcodeX, barcodeY + barcodeHeight + 4);

  // Legal & Verification Text (Right side of barcode)
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(SLATE_DARK[0], SLATE_DARK[1], SLATE_DARK[2]);
  doc.text('ACI PLC AUTOMATED LOGISTICS VERIFIED', 85, barcodeY + 3);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(SLATE_LIGHT[0], SLATE_LIGHT[1], SLATE_LIGHT[2]);
  doc.text('This invoice is officially integrated into the ACI Central Enterprise Resource Planning (ERP) platform.', 85, barcodeY + 7);
  doc.text('Products listed above correspond to real-time inventory clears authenticated on purchase dispatch.', 85, barcodeY + 11);
  doc.text('Should you have any claims regarding delivery, please reach out to your designated sales representative.', 85, barcodeY + 15);

  // Footer Branding Tagline
  doc.setDrawColor(BORDER_COLOR[0], BORDER_COLOR[1], BORDER_COLOR[2]);
  doc.setLineWidth(0.5);
  doc.line(15, 270, 195, 270);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(RED[0], RED[1], RED[2]);
  doc.text('ACI - Improving Quality of Life', 105, 276, { align: 'center' });

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(SLATE_LIGHT[0], SLATE_LIGHT[1], SLATE_LIGHT[2]);
  doc.text('© 2026 ACI Limited. All rights reserved. Dhaka, Bangladesh.', 105, 281, { align: 'center' });

  // Save the PDF
  doc.save(`ACI-Invoice-${order.id}.pdf`);
}
