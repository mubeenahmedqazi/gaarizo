// BigInt cannot go through JSON.stringify, so convert price to Number.
export function serializeAd(ad) {
  return { ...ad, price: Number(ad.price) };
}
