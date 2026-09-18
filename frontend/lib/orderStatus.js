// Maps the raw OrderStatus enum values (what's actually stored in the DB)
// to what a human should see. PENDING and PROCESSING in particular don't
// mean what their names suggest to a customer: PENDING means "payment not
// completed yet" (not "order pending"), and PROCESSING is set the instant
// payment succeeds (see backend/src/routes/orders.js) — so from a
// customer's perspective, PAID and PROCESSING are just "your order is
// confirmed."
export const STATUS_LABELS = {
  PENDING: "Payment Pending",
  PAID: "Order Confirmed",
  PROCESSING: "Order Confirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const STATUS_COLORS = {
  PENDING: "bg-gray-100 text-gray-600",
  PAID: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export function statusLabel(status) {
  return STATUS_LABELS[status] || status;
}
