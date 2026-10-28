export function formatPrice(
  value: number | string | null | undefined,
  symbol = '฿',
  locale = 'th-TH'
): string {
  const n = Number(value || 0)
  try {
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(n)
    return `${symbol}${formatted}`
  } catch {
    return `${symbol}${n.toFixed(2)}`
  }
}

export function formatDate(value: string | Date | undefined, locale = 'th-TH'): string {
  if (!value) return '—'
  const d = typeof value === 'string' ? new Date(value.replace(' ', 'T')) : value
  if (Number.isNaN(d.getTime())) return String(value)
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(d)
  } catch {
    return d.toISOString().slice(0, 10)
  }
}

export function formatDateTime(value: string | Date | undefined, locale = 'th-TH'): string {
  if (!value) return '—'
  const d = typeof value === 'string' ? new Date(value.replace(' ', 'T')) : value
  if (Number.isNaN(d.getTime())) return String(value)
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d)
  } catch {
    return d.toISOString()
  }
}

/** Picks the localised name for a bilingual record. */
export function localizedName(row: Record<string, any>, locale: string): string {
  if (!row) return ''
  if (locale === 'en') return row.nameEn || row.name || row.nameTh || ''
  return row.nameTh || row.name || row.nameEn || ''
}

export function localizedText(row: Record<string, any>, locale: string, keys = ['descriptionEn', 'descriptionTh', 'description']): string {
  if (!row) return ''
  if (locale === 'en') {
    return (row.descriptionEn || row.description || row.descriptionTh || '').toString()
  }
  return (row.descriptionTh || row.description || row.descriptionEn || '').toString()
}

export function truncate(text: string, length = 120): string {
  const t = String(text || '')
  return t.length > length ? t.slice(0, length - 1) + '…' : t
}
