import { notFound } from "next/navigation";
import { callAdminApi } from "../../../../lib/adminServer";
import ProductForm from "../../../../components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }) {
  const { ok, data } = await callAdminApi(`/products/${params.id}`);
  if (!ok) notFound();

  return (
    <div>
      <p className="mono text-[11px] font-semibold tracking-[0.3em] text-red-600 uppercase mb-2">
        Catalog
      </p>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 heading-font uppercase mb-8">
        Edit Product
      </h1>
      <ProductForm initialProduct={data} />
    </div>
  );
}
