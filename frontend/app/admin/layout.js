import { redirect } from "next/navigation";
import { requireAdminSession } from "../../lib/adminServer";
import AdminNav from "../../components/admin/AdminNav";

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
      <AdminNav />
      <div className="h-1 w-full bg-blue-800" />

      <div className="max-w-6xl mx-auto px-5 py-10">{children}</div>
    </div>
  );
}
