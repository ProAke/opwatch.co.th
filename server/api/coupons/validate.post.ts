export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const code = String(body?.code || '').trim().toUpperCase()
  const subtotal = Number(body?.subtotal || 0)

  if (!code) {
    throw createError({ statusCode: 400, statusMessage: 'กรุณาระบุโค้ดคูปองหรือบัตรของขวัญ' })
  }

  const store = useStore()
  const all = await store.all('coupons')
  const coupon = all.find((c) => String(c.code || '').toUpperCase() === code && c.active !== false)

  if (!coupon) {
    throw createError({ statusCode: 404, statusMessage: 'ไม่พบโค้ดส่วนลดหรือคูปองหมดอายุแล้ว' })
  }

  if (coupon.expiresAt && String(coupon.expiresAt) < new Date().toISOString().slice(0, 10)) {
    throw createError({ statusCode: 400, statusMessage: 'คูปองนี้หมดอายุแล้ว' })
  }

  if (Number(coupon.usageLimit || 0) > 0 && Number(coupon.usedCount || 0) >= Number(coupon.usageLimit)) {
    throw createError({ statusCode: 400, statusMessage: 'สิทธิ์คูปองนี้เต็มแล้ว' })
  }

  if (subtotal < Number(coupon.minSpend || 0)) {
    throw createError({
      statusCode: 400,
      statusMessage: `ยอดสั่งซื้อขั้นต่ำสำหรับโค้ด ${code} คือ ฿${Number(coupon.minSpend).toLocaleString('th-TH')}`
    })
  }

  let discount = 0
  if (coupon.type === 'percent') {
    discount = Math.round((subtotal * Number(coupon.value || 0)) / 100)
    if (Number(coupon.maxDiscount || 0) > 0) {
      discount = Math.min(discount, Number(coupon.maxDiscount))
    }
  } else {
    discount = Math.min(subtotal, Number(coupon.value || 0))
  }

  return {
    valid: true,
    discount,
    coupon: {
      code: coupon.code,
      title: coupon.titleTh || coupon.title,
      titleTh: coupon.titleTh || coupon.title,
      titleEn: coupon.titleEn || coupon.title,
      type: coupon.type,
      value: coupon.value,
      minSpend: coupon.minSpend
    }
  }
})
