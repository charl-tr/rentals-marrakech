/** Unknown values are not evidence that a property satisfies a numeric filter. */
export function meetsMinimum(value: number | null | undefined, minimum: number) {
  return value != null && Number.isFinite(value) && value >= minimum;
}

export function matchesPriceBucket(price: number | null | undefined, bucket: { min?: number; max?: number }) {
  return price != null && Number.isFinite(price) && price > 0 &&
    (bucket.min === undefined || price > bucket.min) &&
    (bucket.max === undefined || price <= bucket.max);
}
