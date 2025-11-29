import React, { useRef } from "react";

export default function ThermalReceipt({
  items = [],
  subtotal = 0,
  discountType = "none",
  discountAmount = 0,
  tip = 0,
  total = 0,
  customerName = "Walk-in Customer",
  orderId = "POS-XXXXXX",
  date = new Date().toLocaleString(),
  onClose = () => {},
}) {
  const printRef = useRef();

  const handlePrint = () => {
    const receiptHtml = `
      <div class="receipt">
        <div class="center bold">BEANSIGHT CAFE</div>
        <div class="center">Brgy. Example, PH</div>
        <div class="center">Tel: 09xx-xxx-xxxx</div>
        <div class="line"></div>
        <div class="row"><span>Customer:</span><span>${customerName}</span></div>
        <div class="row"><span>Order ID:</span><span>${orderId}</span></div>
        <div class="row"><span>Date:</span><span>${date}</span></div>
        <div class="line"></div>
        ${items
          .map(
            (i) => `<div class="row"><span>${i.name} x${i.quantity}</span><span>₱${(
              i.price * i.quantity
            ).toFixed(2)}</span></div>`
          )
          .join("")}
        <div class="line"></div>
        <div class="row"><span>Subtotal:</span><span>₱${subtotal.toFixed(2)}</span></div>
        <div class="row"><span>Discount (${discountType}):</span><span>-₱${discountAmount.toFixed(2)}</span></div>
        <div class="row"><span>Tip:</span><span>₱${tip.toFixed(2)}</span></div>
        <div class="line"></div>
        <div class="row bold"><span>Total:</span><span>₱${total.toFixed(2)}</span></div>
        <div class="line"></div>
        <div class="center">Thank you!</div>
        <div class="center">Please come again</div>
      </div>
    `;

    const win = window.open("", "_blank");
    win.document.write(`
      <html>
        <head>
          <style>
            @page { size: 58mm auto; margin: 0; }
            body { width: 58mm; margin: 0; font-family: monospace; font-size: 11px; line-height: 1.2; }
            .receipt { padding: 10px; }
            .center { text-align: center; }
            .line { border-top: 1px dashed #000; margin: 6px 0; }
            .row { display: flex; justify-content: space-between; }
            .bold { font-weight: bold; }
          </style>
        </head>
        <body>
          ${receiptHtml}
        </body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-xl shadow-xl w-80">
        <h2 className="text-center text-xl font-bold mb-2">Receipt Preview</h2>
        <div className="flex gap-3 mt-3">
          <button
            onClick={handlePrint}
            className="w-full bg-coffee-600 text-white py-2 rounded-lg"
          >
            Print Thermal Receipt
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-400 text-white py-2 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
