import Link from "next/link";
import { callAdminApi } from "../../lib/adminServer";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { data: stats } = await callAdminApi("/stats");

  const cards = [
    { label: "Products", value: stats?.productCount ?? "—", href: "/admin/products" },
    { label: "Orders", value: stats?.orderCount ?? "—", href: "/admin/orders" },
    { label: "Pending orders", value: stats?.pendingOrders ?? "—", href: "/admin/orders" },
    {
      label: "Revenue (paid orders)",
      value: stats ? `₹${stats.revenue.toLocaleString("en-IN")}` : "—",
      href: "/admin/orders",
    },
  ];

  return (
    <div>
      <p className="mono text-[11px] font-semibold tracking-[0.3em] text-red-600 uppercase mb-2">
        Overview
      </p>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 heading-font uppercase mb-8">
        Dashboard
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white border border-gray-200 p-5 hover:border-blue-800 transition-colors"
          >
            <p className="mono text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-2">
              {card.label}
            </p>
            <p className="text-3xl font-bold text-gray-900 heading-font">{card.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 flex gap-4">
        <Link
          href="/admin/products/new"
          className="inline-block bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-6 py-3 transition-colors"
        >
          + Add Product
        </Link>
        <Link
          href="/admin/orders"
          className="inline-block border border-gray-300 hover:bg-gray-100 text-gray-700 text-sm font-semibold px-6 py-3 transition-colors"
        >
          View Orders
        </Link>
      </div>
    </div>
  );
}
