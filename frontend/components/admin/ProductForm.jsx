"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const emptyProduct = {
  sku: "",
  name: "",
  slug: "",
  tag: "",
  description: "",
  price: "",
  isBuyable: false,
  stock: 0,
  isPublished: true,
  categoryId: "",
  images: [{ url: "" }],
};

// initialProduct is null for "create" and an existing product object for
// "edit" — same form either way, just a different submit target.
export default function ProductForm({ initialProduct }) {
  const router = useRouter();
  const isEdit = !!initialProduct;

  const [form, setForm] = useState(
    initialProduct
      ? {
          ...initialProduct,
          price: initialProduct.price ?? "",
          images: initialProduct.images?.length ? initialProduct.images.map((i) => ({ url: i.url })) : [{ url: "" }],
        }
      : emptyProduct
  );
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        // Default to the first category on a brand-new product
        if (!isEdit && data.length && !form.categoryId) {
          setForm((f) => ({ ...f, categoryId: data[0].id }));
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function updateImage(index, url) {
    setForm((f) => {
      const images = [...f.images];
      images[index] = { url };
      return { ...f, images };
    });
  }

  function addImageField() {
    setForm((f) => ({ ...f, images: [...f.images, { url: "" }] }));
  }

  function removeImageField(index) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  }

  // Auto-fill slug from name, but only while the user hasn't touched slug
  // by hand — avoids fighting them if they typed a custom one.
  const [slugTouched, setSlugTouched] = useState(isEdit);
  function handleNameChange(value) {
    update("name", value);
    if (!slugTouched) {
      update(
        "slug",
        value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      );
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const body = {
      ...form,
      price: form.price === "" ? null : Number(form.price),
      stock: Number(form.stock) || 0,
    };

    const res = await fetch(isEdit ? `/api/admin/products/${initialProduct.id}` : "/api/admin/products", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || "Failed to save product");
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  const labelClass = "block mono text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-1.5";
  const inputClass = "w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-800";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-2xl">
      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Name *</label>
          <input
            className={inputClass}
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>SKU *</label>
          <input
            className={inputClass}
            value={form.sku}
            onChange={(e) => update("sku", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Slug *</label>
          <input
            className={inputClass}
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              update("slug", e.target.value);
            }}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Category *</label>
          <select
            className={inputClass}
            value={form.categoryId}
            onChange={(e) => update("categoryId", e.target.value)}
            required
          >
            <option value="" disabled>Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Tag (optional — e.g. project/spec reference)</label>
        <input className={inputClass} value={form.tag || ""} onChange={(e) => update("tag", e.target.value)} />
      </div>

      <div>
        <label className={labelClass}>Description *</label>
        <textarea
          className={inputClass}
          rows={4}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Price (₹, leave blank for "Quote only")</label>
          <input
            className={inputClass}
            type="number"
            step="0.01"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Stock</label>
          <input
            className={inputClass}
            type="number"
            value={form.stock}
            onChange={(e) => update("stock", e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-8">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.isBuyable}
            onChange={(e) => update("isBuyable", e.target.checked)}
          />
          Buyable (shows "Add to Cart" instead of "Request a Quote")
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => update("isPublished", e.target.checked)}
          />
          Published (visible on the site)
        </label>
      </div>

      <div>
        <label className={labelClass}>Image URLs (first one is the primary photo)</label>
        <div className="flex flex-col gap-2">
          {form.images.map((img, i) => (
            <div key={i} className="flex gap-2">
              <input
                className={inputClass}
                value={img.url}
                onChange={(e) => updateImage(i, e.target.value)}
                placeholder="https://…"
              />
              {form.images.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImageField(i)}
                  className="text-red-600 text-xs font-semibold px-2"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addImageField}
          className="mt-2 text-blue-800 text-xs font-semibold hover:underline"
        >
          + Add another image
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-4 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold px-7 py-3 transition-colors"
        >
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Product"}
        </button>
      </div>
    </form>
  );
}
