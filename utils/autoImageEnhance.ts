export interface EnhanceOptions {
  preset?: 'watch-square' | 'banner-wide' | 'keep-ratio'
  brightness?: number // -40 to +40, default +6
  contrast?: number // -40 to +40, default +12
  saturation?: number // -40 to +40, default +6
  sharpness?: number // 0 to 1, default 0.35
  cleanWhiteBg?: boolean // default true
  autoTrim?: boolean // default true
  paddingRatio?: number // 0.02 to 0.20, default 0.08
}

export const DEFAULT_ENHANCE_OPTIONS: Required<EnhanceOptions> = {
  preset: 'watch-square',
  brightness: 6,
  contrast: 12,
  saturation: 6,
  sharpness: 0.32,
  cleanWhiteBg: true,
  autoTrim: true,
  paddingRatio: 0.08
}

function clampByte(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : Math.round(v)
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('ไม่สามารถโหลดรูปภาพเพื่อปรับแต่งอัตโนมัติได้'))
    img.src = src
  })
}

function detectSubjectBounds(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const { data } = ctx.getImageData(0, 0, w, h)
  let minX = w
  let minY = h
  let maxX = 0
  let maxY = 0
  let found = 0

  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      const i = (y * w + x) * 4
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = data[i + 3]
      const isTransparent = a < 24
      const isNearWhite = r > 243 && g > 243 && b > 243 && Math.max(r, g, b) - Math.min(r, g, b) < 14
      if (!isTransparent && !isNearWhite) {
        found++
        if (x < minX) minX = x
        if (y < minY) minY = y
        if (x > maxX) maxX = x
        if (y > maxY) maxY = y
      }
    }
  }

  if (found < 30 || maxX <= minX + 16 || maxY <= minY + 16) {
    return { sx: 0, sy: 0, sw: w, sh: h }
  }
  return {
    sx: Math.max(0, minX - 4),
    sy: Math.max(0, minY - 4),
    sw: Math.min(w, maxX - minX + 8),
    sh: Math.min(h, maxY - minY + 8)
  }
}

function applyPixelStudioPass(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  opts: Required<EnhanceOptions>
) {
  const imgData = ctx.getImageData(0, 0, w, h)
  const d = imgData.data
  const cFactor = (259 * (opts.contrast * 2.1 + 255)) / (255 * (259 - opts.contrast * 2.1))
  const bShift = opts.brightness * 1.8
  const satBoost = 1 + opts.saturation / 100

  for (let i = 0; i < d.length; i += 4) {
    let r = d[i]
    let g = d[i + 1]
    let b = d[i + 2]
    const a = d[i + 3]

    if (a < 18) {
      if (opts.cleanWhiteBg) {
        d[i] = 255
        d[i + 1] = 255
        d[i + 2] = 255
        d[i + 3] = 255
      }
      continue
    }

    const chroma = Math.max(r, g, b) - Math.min(r, g, b)
    if (opts.cleanWhiteBg && r > 236 && g > 236 && b > 236 && chroma < 16) {
      d[i] = 255
      d[i + 1] = 255
      d[i + 2] = 255
      d[i + 3] = 255
      continue
    }

    r = cFactor * (r + bShift - 128) + 128
    g = cFactor * (g + bShift - 128) + 128
    b = cFactor * (b + bShift - 128) + 128

    if (satBoost !== 1) {
      const lum = 0.299 * r + 0.587 * g + 0.114 * b
      r = lum + (r - lum) * satBoost
      g = lum + (g - lum) * satBoost
      b = lum + (b - lum) * satBoost
    }

    d[i] = clampByte(r)
    d[i + 1] = clampByte(g)
    d[i + 2] = clampByte(b)
  }

  // Mild Unsharp / 3x3 sharpening pass for watch dial & sapphire clarity
  if (opts.sharpness > 0.05) {
    const src = new Uint8ClampedArray(d)
    const amt = Math.min(0.8, opts.sharpness)
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = (y * w + x) * 4
        if (src[idx] === 255 && src[idx + 1] === 255 && src[idx + 2] === 255) continue
        for (let c = 0; c < 3; c++) {
          const center = src[idx + c]
          const neighbors =
            (src[((y - 1) * w + x) * 4 + c] +
              src[((y + 1) * w + x) * 4 + c] +
              src[(y * w + (x - 1)) * 4 + c] +
              src[(y * w + (x + 1)) * 4 + c]) *
            0.25
          d[idx + c] = clampByte(center + (center - neighbors) * amt * 1.8)
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0)
}

export async function renderEnhancedDataUrl(
  sourceUrl: string,
  options: EnhanceOptions = {}
): Promise<{ dataUrl: string; blob: Blob; width: number; height: number }> {
  const opts: Required<EnhanceOptions> = { ...DEFAULT_ENHANCE_OPTIONS, ...options }
  const img = await loadHtmlImage(sourceUrl)

  const srcCanvas = document.createElement('canvas')
  srcCanvas.width = img.naturalWidth || img.width || 800
  srcCanvas.height = img.naturalHeight || img.height || 800
  const srcCtx = srcCanvas.getContext('2d', { willReadFrequently: true })!
  if (opts.cleanWhiteBg) {
    srcCtx.fillStyle = '#ffffff'
    srcCtx.fillRect(0, 0, srcCanvas.width, srcCanvas.height)
  }
  srcCtx.drawImage(img, 0, 0)

  const bounds = opts.autoTrim
    ? detectSubjectBounds(srcCtx, srcCanvas.width, srcCanvas.height)
    : { sx: 0, sy: 0, sw: srcCanvas.width, sh: srcCanvas.height }

  let targetW = 1200
  let targetH = 1200
  if (opts.preset === 'banner-wide') {
    targetW = 1600
    targetH = 900
  } else if (opts.preset === 'keep-ratio') {
    const maxSide = 1400
    const scale = Math.min(1, maxSide / Math.max(srcCanvas.width, srcCanvas.height))
    targetW = Math.max(200, Math.round(srcCanvas.width * scale))
    targetH = Math.max(200, Math.round(srcCanvas.height * scale))
  }

  const outCanvas = document.createElement('canvas')
  outCanvas.width = targetW
  outCanvas.height = targetH
  const outCtx = outCanvas.getContext('2d', { willReadFrequently: true })!
  outCtx.fillStyle = '#ffffff'
  outCtx.fillRect(0, 0, targetW, targetH)
  outCtx.imageSmoothingEnabled = true
  outCtx.imageSmoothingQuality = 'high'

  if (opts.preset === 'keep-ratio' && !opts.autoTrim) {
    outCtx.drawImage(srcCanvas, 0, 0, targetW, targetH)
  } else {
    const padX = Math.round(targetW * opts.paddingRatio)
    const padY = Math.round(targetH * opts.paddingRatio)
    const availW = targetW - padX * 2
    const availH = targetH - padY * 2
    const fitScale = Math.min(availW / bounds.sw, availH / bounds.sh)
    const dw = Math.round(bounds.sw * fitScale)
    const dh = Math.round(bounds.sh * fitScale)
    const dx = Math.round((targetW - dw) / 2)
    const dy = Math.round((targetH - dh) / 2)
    outCtx.drawImage(srcCanvas, bounds.sx, bounds.sy, bounds.sw, bounds.sh, dx, dy, dw, dh)
  }

  applyPixelStudioPass(outCtx, targetW, targetH, opts)

  const dataUrl = outCanvas.toDataURL('image/jpeg', 0.92)
  const blob: Blob = await new Promise((resolve, reject) => {
    outCanvas.toBlob((b) => (b ? resolve(b) : reject(new Error('แปลงไฟล์รูปภาพไม่สำเร็จ'))), 'image/jpeg', 0.92)
  })

  return { dataUrl, blob, width: targetW, height: targetH }
}

export async function autoEnhanceFile(file: File, options: EnhanceOptions = {}): Promise<File> {
  const objectUrl = URL.createObjectURL(file)
  try {
    const { blob } = await renderEnhancedDataUrl(objectUrl, options)
    const baseName = file.name.replace(/\.[^.]+$/, '') || 'opwatch-studio'
    return new File([blob], `${baseName}-studio.jpg`, { type: 'image/jpeg' })
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export async function autoEnhanceExistingUrl(url: string, options: EnhanceOptions = {}): Promise<File> {
  const { blob } = await renderEnhancedDataUrl(url, options)
  const slug = url.split('/').pop()?.replace(/\.[^.]+$/, '') || 'watch'
  return new File([blob], `${slug}-enhanced.jpg`, { type: 'image/jpeg' })
}
