export function mapRange(value, low1, high1, low2, high2) {
  const result = low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
  if (result < low2) return low2;
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
}