const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoicePDF = async (order) => {
  return new Promise((resolve, reject) => {
    try {
      const invoicesDir = path.join(__dirname, '..', 'invoices');
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }

      const fileName = `Invoice_${order.orderId}.pdf`;
      const filePath = path.join(invoicesDir, fileName);

      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // Colors
      const primaryColor = '#4F46E5';
      const textColor = '#1E293B';
      const lightGray = '#F8FAFC';
      const borderColor = '#E2E8F0';

      // Header Branding
      doc
        .fillColor(primaryColor)
        .fontSize(24)
        .font('Helvetica-Bold')
        .text('VIBEFORGE DIGITAL AGENCY', 50, 40);

      doc
        .fillColor(textColor)
        .fontSize(9)
        .font('Helvetica')
        .text('Web Development • App Design • Digital Marketing', 50, 68)
        .text('Email: vibeforge@gmail.com | Phone: +91 99433 80320', 50, 80)
        .text('Website: www.vibeforge.com', 50, 92);

      // Invoice Title & Meta
      doc
        .fillColor(primaryColor)
        .fontSize(18)
        .font('Helvetica-Bold')
        .text('OFFICIAL INVOICE', 380, 40, { align: 'right' });

      doc
        .fillColor(textColor)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(`Invoice No: ${order.orderId}`, 380, 65, { align: 'right' })
        .font('Helvetica')
        .text(`Date: ${new Date(order.paymentTimestamp || order.createdAt || Date.now()).toLocaleDateString('en-IN')}`, 380, 80, { align: 'right' })
        .text(`Payment Status: ${order.paymentStatus || 'PAID'}`, 380, 95, { align: 'right' });

      // Line Separator
      doc
        .moveTo(50, 115)
        .lineTo(545, 115)
        .strokeColor(borderColor)
        .lineWidth(1)
        .stroke();

      // Billed To & Payment Details
      doc
        .fillColor(primaryColor)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('BILLED TO:', 50, 130);

      doc
        .fillColor(textColor)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(order.customerName || 'Valued Customer', 50, 146)
        .font('Helvetica')
        .text(`Email: ${order.customerEmail || 'N/A'}`, 50, 160)
        .text(`Phone: ${order.customerPhone || 'N/A'}`, 50, 174);

      if (order.address) {
        doc.text(`Organization/Address: ${order.address}`, 50, 188);
      }

      const paymentInfoY = 130;
      doc
        .fillColor(primaryColor)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('PAYMENT DETAILS:', 330, paymentInfoY);

      doc
        .fillColor(textColor)
        .fontSize(9)
        .font('Helvetica')
        .text(`Payment Method: ${order.paymentMethod || 'Cashfree PG'}`, 330, paymentInfoY + 16)
        .text(`Cashfree Order ID: ${order.cashfreeOrderId || order.orderId}`, 330, paymentInfoY + 28)
        .text(`CF Payment ID / Txn: ${order.cfPaymentId || order.transactionId || 'CONFIRMED'}`, 330, paymentInfoY + 40)
        .text(`Payment Time: ${order.paymentTimestamp ? new Date(order.paymentTimestamp).toLocaleString('en-IN') : 'N/A'}`, 330, paymentInfoY + 52);

      // Items Table Header
      const tableTop = 225;
      doc
        .rect(50, tableTop, 495, 25)
        .fill(primaryColor);

      doc
        .fillColor('#FFFFFF')
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Item Description', 60, tableTop + 7)
        .text('Qty', 330, tableTop + 7, { width: 40, align: 'center' })
        .text('Price', 380, tableTop + 7, { width: 70, align: 'right' })
        .text('Total (INR)', 465, tableTop + 7, { width: 70, align: 'right' });

      let yPos = tableTop + 32;

      const items = order.items && order.items.length > 0 ? order.items : [
        { title: 'VibeForge Digital Service', quantity: 1, price: order.totalAmount || 0 }
      ];

      items.forEach((item) => {
        const title = item.title || 'Digital Service Package';
        const qty = item.quantity || 1;
        const price = item.price || 0;
        const itemTotal = price * qty;

        doc
          .fillColor(textColor)
          .fontSize(9)
          .font('Helvetica')
          .text(title, 60, yPos, { width: 260 })
          .text(String(qty), 330, yPos, { width: 40, align: 'center' })
          .text(`Rs. ${price.toLocaleString('en-IN')}`, 380, yPos, { width: 70, align: 'right' })
          .text(`Rs. ${itemTotal.toLocaleString('en-IN')}`, 465, yPos, { width: 70, align: 'right' });

        yPos += 22;
      });

      // Table Bottom Line
      doc
        .moveTo(50, yPos)
        .lineTo(545, yPos)
        .strokeColor(borderColor)
        .lineWidth(1)
        .stroke();

      yPos += 15;

      // Calculation Summary
      const summaryLeft = 330;
      doc
        .fillColor(textColor)
        .fontSize(9)
        .font('Helvetica')
        .text('Subtotal:', summaryLeft, yPos)
        .text(`Rs. ${(order.subtotal || order.totalAmount || 0).toLocaleString('en-IN')}`, 465, yPos, { width: 70, align: 'right' });

      yPos += 16;
      if (order.discount > 0) {
        doc
          .text('Discount:', summaryLeft, yPos)
          .text(`- Rs. ${(order.discount).toLocaleString('en-IN')}`, 465, yPos, { width: 70, align: 'right' });
        yPos += 16;
      }

      if (order.gst > 0) {
        doc
          .text('GST (18%):', summaryLeft, yPos)
          .text(`Rs. ${(order.gst).toLocaleString('en-IN')}`, 465, yPos, { width: 70, align: 'right' });
        yPos += 16;
      }

      doc
        .moveTo(summaryLeft, yPos)
        .lineTo(545, yPos)
        .strokeColor(borderColor)
        .stroke();

      yPos += 8;

      doc
        .fillColor(primaryColor)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('Total Package Amount:', summaryLeft, yPos)
        .text(`Rs. ${(order.totalAmount || 0).toLocaleString('en-IN')}`, 450, yPos, { width: 85, align: 'right' });

      yPos += 18;
      doc
        .fillColor('#059669')
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Amount Paid:', summaryLeft, yPos)
        .text(`Rs. ${(order.amountPaid || 0).toLocaleString('en-IN')}`, 450, yPos, { width: 85, align: 'right' });

      yPos += 16;
      if (order.amountDue > 0) {
        doc
          .fillColor('#D97706')
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('Remaining Balance Due:', summaryLeft, yPos)
          .text(`Rs. ${(order.amountDue).toLocaleString('en-IN')}`, 450, yPos, { width: 85, align: 'right' });
      }

      // Footer Box
      const footerY = 700;
      doc
        .rect(50, footerY, 495, 55)
        .fillAndStroke(lightGray, borderColor);

      doc
        .fillColor(primaryColor)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Thank you for partnering with VibeForge Digital Agency!', 60, footerY + 12, { align: 'center' });

      doc
        .fillColor(textColor)
        .fontSize(8)
        .font('Helvetica')
        .text('This is a computer-generated invoice and requires no physical signature.', 60, footerY + 28, { align: 'center' })
        .text('Track your project status anytime at https://vibeforge.com/track', 60, footerY + 38, { align: 'center' });

      doc.end();

      writeStream.on('finish', () => {
        const backendUrl = (process.env.BACKEND_URL || process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/, '');
        const invoiceUrl = `${backendUrl}/invoices/${fileName}`;
        resolve({ invoicePath: filePath, invoiceUrl });
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateInvoicePDF };
