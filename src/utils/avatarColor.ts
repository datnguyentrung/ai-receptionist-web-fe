export function avatarColor(seed: unknown) {
  const colors = [
    "#E02020",
    "#7C3AED",
    "#059669",
    "#0284C7",
    "#D97706",
    "#DB2777",
  ];
  const value = seed == null ? "" : String(seed);
  let hash = 0;
  for (const c of value) hash += c.charCodeAt(0);
  return colors[hash % colors.length];
}
