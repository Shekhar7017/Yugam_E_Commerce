// Maps a carrier name to a function that builds a direct tracking URL on the
// courier's own website, using the AWB / tracking number entered by the admin.
// This gives customers real, live status straight from the courier — without
// us needing an API integration yet.

export const KNOWN_CARRIERS = [
  "Delhivery",
  "Blue Dart",
  "Ecom Express",
  "DTDC",
  "XpressBees",
  "Shadowfax",
  "India Post (Speed Post)",
  "Ekart",
  "Amazon Shipping",
  "Other",
] as const;

export function buildCarrierTrackingUrl(carrier: string | null | undefined, trackingNumber: string | null | undefined) {
  if (!carrier || !trackingNumber) return null;

  const awb = encodeURIComponent(trackingNumber.trim());
  const normalized = carrier.trim().toLowerCase();

  if (normalized.includes("delhivery")) return `https://www.delhivery.com/track/package/${awb}`;
  if (normalized.includes("blue dart") || normalized.includes("bluedart"))
    return `https://www.bluedart.com/tracking?trackFor=0&trackNo=${awb}`;
  if (normalized.includes("ecom")) return `https://ecomexpress.in/tracking/?awb_field=${awb}`;
  if (normalized.includes("dtdc")) return `https://www.dtdc.in/trace.asp?strCnno=${awb}`;
  if (normalized.includes("xpressbees")) return `https://www.xpressbees.com/track?awbNo=${awb}`;
  if (normalized.includes("shadowfax")) return `https://track.shadowfax.in/#/${awb}`;
  if (normalized.includes("india post") || normalized.includes("speed post"))
    return `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx?id=${awb}`;
  if (normalized.includes("ekart")) return `https://ekartlogistics.com/track/${awb}`;
  if (normalized.includes("amazon")) return `https://www.amazon.in/gp/your-account/order-history`;

  // Unknown carrier — fall back to a Google search for the AWB + carrier name
  return `https://www.google.com/search?q=${encodeURIComponent(carrier + " track " + trackingNumber)}`;
}
