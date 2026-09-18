import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdminSession } from "../../lib/adminServer";

// Every page under /admin renders inside this layout, so this one check
// protects the whole section — no individual admin page needs to repeat
// the role check for the page itself to render (the API routes still
// check independently, since a layout guard alone doesn't protect
// direct API calls).
export default async function AdminLayout({ children }) {
  const session = await requireAdminSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/admin" className="text-xs font-bold tracking-widest uppercase heading-font">
            Taraknath Admin
          </Link>
          <nav className="flex items-center gap-6 mono text-[11px] tracking-widest uppercase">
            <Link href="/admin" className="hover:text-red-400">Dashboard</Link>
            <Link href="/admin/products" className="hover:text-red-400">Products</Link>
            <Link href="/admin/orders" className="hover:text-red-400">Orders</Link>
            <Link href="/" className="text-gray-400 hover:text-white">Back to site</Link>
          </nav>
        </div>
      </div>
      <div className="h-1 w-full bg-blue-800" />

      <div className="max-w-6xl mx-auto px-5 py-10">{children}</div>
    </div>
  );
}
