"use client";

import { useState } from "react";
import { Truck } from "lucide-react";

// Rule-based delivery estimate — no courier API integration, just a
// reasonable estimate from the shipping origin's postal zone, in the same
// spirit as Amazon/Flipkart's "delivery by <date>" widget on product pages.
//
// India's postal index number (PIN) system splits the country into 9 zones
// by the FIRST digit of the pincode. Shipments from West Bengal (zone 7,
// where Taraknath is based — Howrah/Kolkata) reach other zone-7 pincodes
// fastest, neighbouring zones next, and the rest of the country a bit
// slower. Update ORIGIN_ZONE below if the factory ships from elsewhere.
const ORIGIN_ZONE = 7; // West Bengal / Odisha / NE states

// A short list of well-known metro pincode prefixes gets an extra day
// shaved off, since metro logistics networks are denser.
const METRO_PREFIXES = ["400", "110", "560", "600", "500", "411", "700", "380", "302", "682"];

function isMetro(pincode) {
  return METRO_PREFIXES.some((p) => pincode.startsWith(p));
}

function zoneOf(pincode) {
  return Number(pincode[0]);
}

function estimate(pincode) {
  const zone = zoneOf(pincode);
  const distance = Math.min(Math.abs(zone - ORIGIN_ZONE), 9 - Math.abs(zone - ORIGIN_ZONE));

  let minDays, maxDays;
  if (distance === 0) {
    minDays = 2; maxDays = 4;
  } else if (distance === 1) {
    minDays = 3; maxDays = 6;
  } else {
    minDays = 5; maxDays = 9;
  }

  if (isMetro(pincode)) {
    minDays = Math.max(1, minDays - 1);
    maxDays = Math.max(minDays, maxDays - 1);
  }

  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() + minDays);
  const to = new Date(today);
  to.setDate(today.getDate() + maxDays);

  const fmt = (d) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  return { minDays, maxDays, label: `${fmt(from)} – ${fmt(to)}` };
}

export default function PincodeDeliveryEstimate() {
  const [pincode, setPincode] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  function handleCheck(e) {
    e.preventDefault();
    const trimmed = pincode.trim();

    if (!/^[1-9][0-9]{5}$/.test(trimmed)) {
      setError("Enter a valid 6-digit pincode");
      setResult(null);
      return;
    }

    setError("");
    setResult(estimate(trimmed));
  }

  return (
    <div className="border border-gray-200 p-4 mb-3">
      <form onSubmit={handleCheck} className="flex items-center gap-2">
        <Truck size={16} className="text-gray-500 flex-shrink-0" />
        <input
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="Enter pincode"
          inputMode="numeric"
          className="flex-1 min-w-0 border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-800"
        />
        <button
          type="submit"
          className="flex-shrink-0 text-xs font-semibold tracking-widest uppercase text-blue-800 border border-blue-800 hover:bg-blue-800 hover:text-white transition-colors px-4 py-2"
        >
          Check
        </button>
      </form>

      {error && <p className="text-red-600 text-xs mt-2">{error}</p>}

      {result && (
        <p className="text-sm text-gray-700 mt-3">
          Estimated delivery: <span className="font-semibold text-gray-900">{result.label}</span>{" "}
          <span className="text-gray-400">({result.minDays}–{result.maxDays} business days)</span>
        </p>
      )}
    </div>
  );
}
