export const generateInvoicePDF = (order) => {
  if (!order) return;

  const invoiceWindow = window.open('', '_blank', 'width=900,height=1000');
  if (!invoiceWindow) return;

  const itemsHtml = (order.items || []).map((item, idx) => `
    <tr style="border-bottom: 1px solid #E2E8F0;">
      <td style="padding: 12px; font-size: 13px; font-weight: bold; color: #1E293B;">${idx + 1}. ${item.title}</td>
      <td style="padding: 12px; font-size: 13px; text-align: center; color: #475569;">${item.quantity || 1}</td>
      <td style="padding: 12px; font-size: 13px; text-align: right; color: #1E293B;">₹${item.price}</td>
      <td style="padding: 12px; font-size: 13px; text-align: right; font-weight: bold; color: #0F172A;">₹${(item.price * (item.quantity || 1)).toLocaleString()}</td>
    </tr>
  `).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>VibeForge Invoice - ${order.orderId}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        body {
          font-family: 'Inter', sans-serif;
          background-color: #F8FAFC;
          color: #1E293B;
          margin: 0;
          padding: 40px;
        }
        .invoice-card {
          max-width: 800px;
          margin: 0 auto;
          background: #FFFFFF;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
          border: 1px solid #E2E8F0;
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #0B0F17 0%, #1E1B4B 100%);
          color: #FFFFFF;
          padding: 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .brand-title {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: #FFFFFF;
        }
        .brand-subtitle {
          font-size: 12px;
          color: #A5B4FC;
          margin-top: 4px;
        }
        .invoice-badge {
          text-align: right;
        }
        .invoice-badge h2 {
          margin: 0;
          font-size: 22px;
          color: #38BDF8;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .invoice-badge p {
          margin: 4px 0 0 0;
          font-size: 12px;
          color: #94A3B8;
        }
        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          padding: 32px;
          background: #F1F5F9;
          border-bottom: 1px solid #E2E8F0;
        }
        .section-title {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #64748B;
          margin-bottom: 8px;
        }
        .info-box p {
          margin: 3px 0;
          font-size: 13px;
          color: #334155;
        }
        .table-container {
          padding: 32px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th {
          background: #F8FAFC;
          padding: 12px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          color: #475569;
          text-align: left;
          border-bottom: 2px solid #E2E8F0;
        }
        .summary-container {
          display: flex;
          justify-content: flex-end;
          padding: 0 32px 32px 32px;
        }
        .summary-box {
          width: 300px;
          background: #F8FAFC;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #E2E8F0;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          padding: 6px 0;
          color: #475569;
        }
        .summary-row.total {
          border-top: 2px solid #CBD5E1;
          margin-top: 8px;
          padding-top: 12px;
          font-size: 16px;
          font-weight: 800;
          color: #0F172A;
        }
        .stamp-box {
          text-align: center;
          padding: 24px;
          border-top: 1px solid #E2E8F0;
          background: #FAFAFA;
        }
        .stamp-text {
          display: inline-block;
          border: 2px dashed #6366F1;
          color: #4F46E5;
          font-weight: 800;
          font-size: 12px;
          padding: 8px 16px;
          border-radius: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        @media print {
          body { background: #FFFFFF; padding: 0; }
          .invoice-card { box-shadow: none; border: none; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-card">
        <!-- TOP BRANDING HEADER -->
        <div class="header">
          <div>
            <div class="brand-title">Vibe<span style="color: #38BDF8;">Forge</span></div>
            <div class="brand-subtitle">Digital Engineering & Creative Agency</div>
            <div style="font-size: 11px; color: #CBD5E1; margin-top: 6px;">vibeforgemrs@gmail.com • +91 99433 80320</div>
          </div>
          <div class="invoice-badge">
            <h2>TAX INVOICE</h2>
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Date:</strong> ${new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>

        <!-- CLIENT & AGENCY DETAILS -->
        <div class="details-grid">
          <div class="info-box">
            <div class="section-title">Billed To (Customer)</div>
            <p><strong>Name:</strong> ${order.customerName || 'Valued Client'}</p>
            <p><strong>Email:</strong> ${order.customerEmail || 'N/A'}</p>
            <p><strong>Phone:</strong> ${order.customerPhone || 'N/A'}</p>
          </div>
          <div class="info-box" style="text-align: right;">
            <div class="section-title">Issued By (Agency)</div>
            <p><strong>VibeForge Digital Agency</strong></p>
            <p>Founders: Madhavan J S, Sanjay Sundar S, Rishi Nathan M</p>
            <p>GST Reg: 33AAACV1234F1Z9</p>
          </div>
        </div>

        <!-- ITEM TABLE -->
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Service Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>

        <!-- PAYMENT SUMMARY -->
        <div class="summary-container">
          <div class="summary-box">
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>₹${order.subtotal || order.totalAmount}</span>
            </div>
            ${order.discount ? `
            <div class="summary-row" style="color: #10B981;">
              <span>Discount Applied:</span>
              <span>-₹${order.discount}</span>
            </div>
            ` : ''}
            <div class="summary-row">
              <span>GST (18% Included):</span>
              <span>₹${order.gst || Math.round(order.totalAmount * 0.18)}</span>
            </div>
            <div class="summary-row total">
              <span>Total Amount:</span>
              <span>₹${order.totalAmount}</span>
            </div>
            <div class="summary-row" style="color: #059669; font-weight: bold; margin-top: 6px;">
              <span>Amount Paid:</span>
              <span>₹${order.amountPaid}</span>
            </div>
            <div class="summary-row" style="color: #D97706; font-weight: bold;">
              <span>Balance Due:</span>
              <span>₹${order.amountDue}</span>
            </div>
          </div>
        </div>

        <!-- FOOTER STAMP -->
        <div class="stamp-box">
          <div class="stamp-text">
            ✓ OFFICIALLY VERIFIED & STAMPED BY VIBEFORGE AGENCY
          </div>
          <p style="font-size: 11px; color: #64748B; margin-top: 10px;">
            Thank you for your business! For any invoice queries, contact <strong>vibeforgemrs@gmail.com</strong>.
          </p>
        </div>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `;

  invoiceWindow.document.write(htmlContent);
  invoiceWindow.document.close();
};
