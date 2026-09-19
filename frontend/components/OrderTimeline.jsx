"use client";

import { Check, X } from "lucide-react";

// The four "forward" stages every non-cancelled order passes through.
// PAID is folded into "Confirmed" here — see lib/orderStatus.js for why
// PAID/PROCESSING are treated as the same customer-facing stage.
const STEPS = [
  { key: "PLACED", label: "Order Placed" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" },
];

// Maps a raw order.status to how far along the STEPS track it is.
function stepIndexFor(status) {
  switch (status) {
    case "PENDING": return -1; // payment not done — nothing confirmed yet
    case "PAID":
    case "PROCESSING": return 1; // Confirmed
    case "SHIPPED": return 2;
    case "DELIVERED": return 3;
    default: return -1;
  }
}

// createdAt is always real (when the order was placed). We don't have a
// separate timestamp per status change, so "confirmed/shipped/delivered
// on" all reuse updatedAt — the exact date of the LATEST change, which is
// only precise for whichever step is the current one. That's a reasonable
// approximation without a schema change; a future improvement would be a
// proper OrderStatusHistory table if per-step dates matter later.
function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function OrderTimeline({ status, createdAt, updatedAt }) {
  if (status === "CANCELLED") {
    return (
      <div className="border border-red-200 bg-red-50 px-4 py-3 flex items-center gap-3 mb-8">
        <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
          <X size={15} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-red-700">Order Cancelled</p>
          <p className="text-xs text-red-500">{formatDate(updatedAt)}</p>
        </div>
      </div>
    );
  }

  const currentIndex = stepIndexFor(status);

  return (
    <div className="mb-10">
      <div className="flex items-start">
        {STEPS.map((step, i) => {
          const done = i <= currentIndex;
          const isCurrent = i === currentIndex;
          const isLast = i === STEPS.length - 1;

          return (
            <div key={step.key} className={`flex items-start ${isLast ? "" : "flex-1"}`}>
              <div className="flex flex-col items-center" style={{ minWidth: 0 }}>
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    done ? "bg-green-600" : "bg-gray-200"
                  }`}
                >
                  {done ? (
                    <Check size={16} className="text-white" />
                  ) : (
                    <span className="text-xs font-semibold text-gray-400">{i + 1}</span>
                  )}
                </div>
                <p className={`mt-2 text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-center px-1 ${
                  done ? "text-gray-900" : "text-gray-400"
                }`}>
                  {step.label}
                </p>
                <p className="text-[10px] text-gray-400 text-center">
                  {i === 0 ? formatDate(createdAt) : done ? (isCurrent ? formatDate(updatedAt) : "") : ""}
                </p>
              </div>

              {!isLast && (
                <div
                  className={`flex-1 h-[2px] mt-3.5 sm:mt-4 transition-colors ${
                    i < currentIndex ? "bg-green-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
