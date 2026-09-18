import ProductForm from "../../../../components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <p className="mono text-[11px] font-semibold tracking-[0.3em] text-red-600 uppercase mb-2">
        Catalog
      </p>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 heading-font uppercase mb-8">
        Add Product
      </h1>
      <ProductForm initialProduct={null} />
    </div>
  );
}
