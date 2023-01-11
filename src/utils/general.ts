
export function sign(num: number | undefined) {
  if (num === undefined) { return `???`; }
  return num >= 0 ? `+${num}` : `${num}`;
}