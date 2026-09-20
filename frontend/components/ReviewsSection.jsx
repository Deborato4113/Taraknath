"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { ShieldCheck, Trash2 } from "lucide-react";
import StarRating from "./StarRating";

export default function ReviewsSection({ productId }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [data, setData] = useState(null); // { reviews, average, count }
  const [error, setError] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function load() {
    const res = await fetch(`/api/reviews?productId=${productId}`);
    const json = await res.json();
    if (!res.ok) return setError(json.error || "Failed to load reviews");
    setData(json);

    // Prefill the form if this user already reviewed this product, so
    // submitting again edits it rather than looking like a fresh review.
    if (session?.user?.id) {
      const mine = json.reviews.find((r) => r.userId === session.user.id);
      if (mine) {
        setRating(mine.rating);
        setComment(mine.comment || "");
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!rating) {
      setFormError("Pick a star rating first");
      return;
    }
    setFormError("");
    setSubmitting(true);

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, rating, comment }),
    });
    const json = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setFormError(json.error || "Failed to submit review");
      return;
    }
    load();
  }

  async function handleDelete(id) {
    if (!confirm("Delete your review?")) return;
    setBusyId(id);
    const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
    setBusyId(null);
    if (res.ok) {
      setRating(0);
      setComment("");
      load();
    }
  }

  const myReview = session?.user?.id ? data?.reviews.find((r) => r.userId === session.user.id) : null;

  return (
    <div id="reviews" className="mt-12 pt-10 border-t border-gray-200">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 heading-font uppercase mb-4">
        Ratings & Reviews
      </h2>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {!data ? (
        <p className="text-sm text-gray-400">Loading reviews...</p>
      ) : (
        <>
          {/* Summary */}
          <div className="flex items-center gap-4 mb-8">
            <span className="text-3xl font-bold text-gray-900 heading-font">
              {data.count ? data.average.toFixed(1) : "—"}
            </span>
            <div>
              <StarRating value={data.average} size={18} />
              <p className="text-xs text-gray-500 mt-1">
                {data.count} review{data.count === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {/* Review form */}
          <form
            onSubmit={handleSubmit}
            className="border border-gray-200 p-4 sm:p-5 mb-8 max-w-xl"
          >
            <p className="mono text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-3">
              {myReview ? "Update Your Review" : "Write a Review"}
            </p>
            <div className="mb-3">
              <StarRating value={rating} onChange={setRating} size={22} />
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this product (optional)"
              rows={3}
              className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-blue-800 mb-3 resize-none"
            />
            {formError && <p className="text-red-600 text-xs mb-3">{formError}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 disabled:opacity-60 transition-colors text-white text-xs font-semibold tracking-widest uppercase px-6 py-3"
            >
              {submitting ? "Submitting..." : myReview ? "Update Review" : "Submit Review"}
            </button>
          </form>

          {/* Review list */}
          {data.reviews.length === 0 ? (
            <p className="text-sm text-gray-500">No reviews yet — be the first to write one.</p>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100 border-t border-gray-100 max-w-2xl">
              {data.reviews.map((r) => (
                <div key={r.id} className="py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <StarRating value={r.rating} size={14} />
                        {r.isVerifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 uppercase tracking-wide">
                            <ShieldCheck size={12} /> Verified Purchase
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{r.userName}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-gray-400">
                        {new Date(r.createdAt).toLocaleDateString("en-IN")}
                      </span>
                      {session?.user?.id === r.userId && (
                        <button
                          onClick={() => handleDelete(r.id)}
                          disabled={busyId === r.id}
                          className="text-gray-400 hover:text-red-600 disabled:opacity-50"
                          aria-label="Delete review"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  {r.comment && <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
