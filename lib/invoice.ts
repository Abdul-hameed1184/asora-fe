import type { Order } from "@/types/order.types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatCurrency(amount: number) {
  return `₦${amount.toLocaleString()}`;
}

/**
 * Opens a self-contained, print-ready invoice for the given order in a new
 * window and triggers the browser's print dialog — no PDF library installed,
 * so "Save as PDF" via the native print destination is the download path.
 */
export function openInvoicePrintView(order: Order) {
  const win = window.open("", "_blank");
  if (!win) return;

  const rows = order.items
    .map(
      (item) => `
        <tr>
          <td>${item.productName}</td>
          <td>${item.color} / ${item.size}</td>
          <td class="right">${item.quantity}</td>
          <td class="right">${formatCurrency(item.unitPrice)}</td>
          <td class="right">${formatCurrency(item.totalPrice)}</td>
        </tr>`
    )
    .join("");

  const discountRow =
    order.discount > 0
      ? `<tr><td colspan="4" class="right label">Discount</td><td class="right">-${formatCurrency(order.discount)}</td></tr>`
      : "";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice ${order.orderNumber}</title>
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; color: #222; max-width: 720px; margin: 40px auto; padding: 0 24px; }
    .brand { text-align: center; font-size: 11px; letter-spacing: 4px; text-transform: uppercase; color: #7a5c29; margin-bottom: 40px; }
    h1 { font-size: 24px; margin: 0 0 4px 0; }
    .meta { font-size: 12px; color: #666; margin-bottom: 32px; }
    .meta span { display: inline-block; margin-right: 24px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th, td { padding: 8px 6px; font-size: 13px; border-bottom: 1px solid #e5e5e5; text-align: left; }
    th { text-transform: uppercase; font-size: 10px; letter-spacing: 1px; color: #888; }
    .right { text-align: right; }
    .label { color: #666; }
    .totals td { border-bottom: none; padding: 4px 6px; }
    .totals .grand { font-size: 16px; font-weight: bold; border-top: 2px solid #222; padding-top: 10px; }
    .address { font-size: 13px; line-height: 1.6; margin-top: 24px; }
    @media print { body { margin: 0; padding: 24px; } }
  </style>
</head>
<body>
  <div class="brand">ÀṢỌ́RA</div>
  <h1>Invoice</h1>
  <div class="meta">
    <span><strong>Order:</strong> ${order.orderNumber}</span>
    <span><strong>Date:</strong> ${formatDate(order.createdAt)}</span>
    <span><strong>Status:</strong> ${order.orderStatus}</span>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Variant</th>
        <th class="right">Qty</th>
        <th class="right">Unit Price</th>
        <th class="right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <table class="totals">
    <tr><td colspan="4" class="right label">Subtotal</td><td class="right">${formatCurrency(order.subtotal)}</td></tr>
    <tr><td colspan="4" class="right label">Shipping</td><td class="right">${formatCurrency(order.shippingFee)}</td></tr>
    ${discountRow}
    <tr><td colspan="4" class="right grand">Total</td><td class="right grand">${formatCurrency(order.totalAmount)}</td></tr>
  </table>

  <div class="address">
    <strong>Shipping to:</strong><br />
    ${order.shippingName}<br />
    ${order.shippingAddress}<br />
    ${order.shippingCity}, ${order.shippingState}, ${order.shippingCountry}<br />
    ${order.shippingPhone}
  </div>
</body>
</html>`;

  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}
