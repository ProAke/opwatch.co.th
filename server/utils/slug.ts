export function slugify(input: string): string {
  return String(input || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\s_]+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200)
}

export function ensureUniqueSlug(base: string, existing: { id: number | string; slug: string }[], ignoreId?: number | string): string {
  const used = new Set(existing.filter((s) => String(s.id) !== String(ignoreId)).map((s) => s.slug))
  if (!used.has(base)) return base
  let i = 2
  while (used.has(`${base}-${i}`)) i++
  return `${base}-${i}`
}
