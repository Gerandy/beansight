import React, { useRef, useState, useEffect } from "react";
import {getDoc,doc} from "firebase/firestore";
import { db } from "../firebase";
import { number } from "framer-motion";

export default function ThermalReceipt({
  items = [],
  subtotal = 0,
  discountType = "none",
  discountAmount = 0,
  total = 0,
  customer = "Walk-in Customer",
  orderId = "POS-XXXXXX",
  cashGiven = 0,
  change = 0,
  date = new Date().toLocaleString(),
  orderType = "Default",
  baristaServer = localStorage.getItem("firstName"),

  onClose = () => {},
}) {
  const printRef = useRef();
  const [tax, setTax] = useState(12);
  const vat = tax / 100;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-PH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handlePrint = () => {
    const receiptHtml = `
      <div class="receipt">
        <div class="center bold">Sol-Ace Cafe</div>
        <div class="center">9017 Gahak Rd, Corner Tramo, Kawit Cavite</div>
        <div class="center">Contact: 0992-727-4046</div>
        <div class="line"></div>
        <div class="row"><span>Order Type:</span><span>${orderType}</span></div>
        <div class="row"><span>Order ID:</span><span>${orderId}</span></div>
        <div class="row"><span>Customer:</span><span>${customer}</span></div>
        <div class="row"><span>Date:</span><span>${formatDate(date)}</span></div>
        <div class="row"><span>Barista:</span><span>${(baristaServer)}</span></div>
        <div class="line"></div>
        ${items
          .map((i) => {
            const addonsTotal = i.addons?.reduce((sum, a) => sum + (a.price * a.qty || 0), 0) || 0;
            const itemTotal = (i.price + addonsTotal) * (i.quantity ?? i.qty ?? 1);
            return `<div class="row"><span>${i.name} x${i.quantity ?? i.qty ?? 1} ${i.addons && i.addons.length > 0 
  ? `<br><small style="font-size: 10px; opacity: 0.7;">(${i.addons.map(a => `${a.name} x${a.qty}`).join(", ")})</small>`
  : ""
}
</span><span>₱${itemTotal.toFixed(2)}</span></div>`;
          })
          .join("")}
        <div class="line"></div>
        <div class="row"><span>Subtotal:</span><span>₱${Number(subtotal).toFixed(2)}</span></div>
        <div class="row"><span>Discount (${discountType}):</span><span>-₱${Number(discountAmount).toFixed(2)}</span></div>
        <div class="row"><span>VAT ${tax}%:</span><span>₱${Number(vat * total).toFixed(2)}</span></div>
        <div class="line"></div>
        <div class="row bold"><span>Cash Given:</span><span>₱${Number(cashGiven).toFixed(2)}</span></div>
        <div class="row bold"><span>Change:</span><span>₱${Number(change).toFixed(2)}</span></div>
        <div class="row bold"><span>Total:</span><span>₱${Number(total).toFixed(2)}</span></div>
        <div class="line"></div>
        <div class="center">Thank you!</div>
        <div class="center">Please come again</div>
      </div>
    `;

    // open print window and guard against popup blockers
    const win = window.open("", "_blank");
    if (!win) {
      alert("Please allow pop-ups to print receipts");
      return;
    }

    win.document.write(`
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            @media print {
              @page { size: 58mm auto; margin: 0; }
            }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { width: 58mm; font-family: monospace; font-size: 11px; line-height: 1.2; }
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

    // Delay for mobile devices to render properly then print
    setTimeout(() => {
      try {
        win.print();
        // Auto-close on non-mobile after print
        if (!/Android|iPhone|iPad|iPod/.test(navigator.userAgent)) {
          win.onafterprint = () => win.close();
        }
      } catch (e) {
        console.error("Print failed:", e);
        // ensure window is closed if something goes wrong
        try { win.close(); } catch {}
      }
    }, 500);
  };

  useEffect(() => {
    handlePrint();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 text-center">
        <p className="text-gray-700 mb-4">Printing receipt...</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}
