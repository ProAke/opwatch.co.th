export default defineEventHandler(async (event) => {
  const cfg = getConfig()
  if (!cfg.installed) throw createError({ statusCode: 403, statusMessage: 'install.notInstalled' })

  const body = await readBody(event)
  const store = useStore()

  const user = await currentUser(event)
  const itemsInput = Array.isArray(body?.items) ? body.items : []
  if (!itemsInput.length) {
    throw createError({ statusCode: 400, statusMessage: 'cart.empty' })
  }

  const locale = (getHeader(event, 'x-locale') || cfg.site.defaultLocale || 'th') === 'en' ? 'en' : 'th'

  const lines: any[] = []
  for (const entry of itemsInput) {
    const productId = Number(entry?.productId)
    const quantity = Math.max(1, Math.min(99, Number(entry?.quantity) || 1))
    if (!productId) continue
    const product = await store.findById('products', productId)
    if (!product) continue
    if (product.status !== 'active') continue
    const stock = Number(product.stock || 0)
    if (stock < quantity) {
      throw createError({
        statusCode: 409,
        statusMessage: 'products.outOfStock',
        data: { productId, available: stock }
      })
    }
    const name = locale === 'en' ? product.nameEn || product.name : product.nameTh || product.name
    const images = Array.isArray(product.images) ? product.images : []
    lines.push({
      productId,
      sku: product.sku,
      name,
      image: images[0] || '/images/op/watch-990-083-blue.png',
      price: Number(product.price),
      quantity,
      wristSize: entry?.wristSize ? String(entry.wristSize).slice(0, 36) : ''
    })
  }

  if (!lines.length) throw createError({ statusCode: 400, statusMessage: 'cart.empty' })

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0)

  // 1. Coupon / Gift Card validation
  let couponDiscount = 0
  let appliedCouponCode = ''
  let matchedCoupon: Record<string, any> | null = null
  const requestedCode = String(body?.couponCode || '').trim().toUpperCase()
  if (requestedCode) {
    const coupons = await store.all('coupons')
    const found = coupons.find((c) => String(c.code || '').toUpperCase() === requestedCode && c.active !== false)
    if (found && subtotal >= Number(found.minSpend || 0)) {
      const notExpired = !found.expiresAt || String(found.expiresAt) >= new Date().toISOString().slice(0, 10)
      const hasQuota = Number(found.usageLimit || 0) <= 0 || Number(found.usedCount || 0) < Number(found.usageLimit)
      if (notExpired && hasQuota) {
        if (found.type === 'percent') {
          couponDiscount = Math.round((subtotal * Number(found.value || 0)) / 100)
          if (Number(found.maxDiscount || 0) > 0) {
            couponDiscount = Math.min(couponDiscount, Number(found.maxDiscount))
          }
        } else {
          couponDiscount = Math.min(subtotal, Number(found.value || 0))
        }
        appliedCouponCode = found.code
        matchedCoupon = found
      }
    }
  }

  // Fallback first-order welcome privilege if no coupon code was entered
  let memberDiscount = 0
  if (!couponDiscount && user && Number(user.totalSpent || 0) <= 0) {
    memberDiscount = Math.round(subtotal * 0.1 * 100) / 100
  }

  // 2. OP Privilege Points redemption
  let pointsRedeemed = 0
  let pointsDiscount = 0
  if (user && Number(body?.pointsRedeemed || 0) > 0) {
    const avail = Math.max(0, Number(user.points || 0))
    const requestedPts = Math.floor(Number(body.pointsRedeemed))
    const bahtPerPt = Math.max(0.1, Number(cfg.site.bahtPerPoint || 1))
    const maxRedeemableBaht = Math.max(0, subtotal - couponDiscount - memberDiscount)
    const maxPtsForOrder = Math.floor(maxRedeemableBaht / bahtPerPt)
    pointsRedeemed = Math.min(avail, requestedPts, maxPtsForOrder)
    pointsDiscount = Math.round(pointsRedeemed * bahtPerPt * 100) / 100
  }

  const discount = Math.min(subtotal, Math.round((couponDiscount + memberDiscount + pointsDiscount) * 100) / 100)

  // 3. Click & Collect branch vs Home delivery + Gift wrap
  const branchSlug = String(body?.branchSlug || '').trim()
  const isBranchPickup = Boolean(branchSlug)
  const giftWrap = Boolean(body?.giftWrap)
  const giftWrapFee = giftWrap ? Number(cfg.site.giftWrapFee || 0) : 0

  const baseShipping = isBranchPickup
    ? 0
    : Number(cfg.site.freeShippingThreshold || 0) > 0 && subtotal - discount >= Number(cfg.site.freeShippingThreshold)
      ? 0
      : Number(cfg.site.shippingFee || 0)

  const shippingFee = baseShipping + giftWrapFee
  const total = Math.max(0, Math.round((subtotal - discount + shippingFee) * 100) / 100)

  const customer = body?.customer || {}
  const customerName = String(customer.name || '').trim()
  const customerEmail = String(customer.email || user?.email || '').trim().toLowerCase()
  if (!customerName || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customerEmail)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'checkout.invalidContact',
      data: {
        errors: {
          name: !customerName ? 'validation.required' : '',
          email: !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customerEmail) ? 'validation.emailInvalid' : ''
        }
      }
    })
  }

  const rawCountry = String(customer.country || 'Thailand').trim().toLowerCase()
  const isThailand =
    !rawCountry || rawCountry.includes('thai') || rawCountry.includes('ไทย') || rawCountry === 'th'
  if (!isThailand) {
    throw createError({ statusCode: 400, statusMessage: 'checkout.thailandOnly' })
  }

  const pointsPerBaht = Math.max(1, Number(cfg.site.pointsPerBaht || 50))
  const pointsEarned = Math.floor(total / pointsPerBaht)

  const order = await store.create('orders', {
    orderNo: orderNo(),
    customerId: user ? Number(user.id) : null,
    customerName,
    customerEmail,
    phone: String(customer.phone || user?.phone || '').trim(),
    address: isBranchPickup && !customer.address ? `รับสินค้าที่สาขา: ${branchSlug}` : String(customer.address || '').trim(),
    city: String(customer.city || (isBranchPickup ? 'กรุงเทพมหานคร' : '')).trim(),
    postalCode: String(customer.postalCode || '').trim(),
    country: 'ประเทศไทย (Thailand)',
    subtotal,
    shippingFee,
    discount,
    total,
    currency: 'THB',
    status: 'pending',
    paymentMethod: String(body?.paymentMethod || 'promptpay'),
    note: String(body?.note || '').trim().slice(0, 500),
    couponCode: appliedCouponCode || null,
    giftWrap,
    giftMessage: giftWrap ? String(body?.giftMessage || '').trim().slice(0, 280) : null,
    branchSlug: branchSlug || null,
    carrier: isBranchPickup ? 'รับสินค้าที่สาขา (Click & Collect)' : null,
    pointsRedeemed,
    pointsEarned,
    channel: 'website'
  })

  for (const line of lines) {
    await store.create('order_items', {
      orderId: Number(order.id),
      productId: line.productId,
      sku: line.sku,
      name: line.name,
      image: line.image,
      price: line.price,
      quantity: line.quantity,
      wristSize: line.wristSize || null
    })
    const product = await store.findById('products', line.productId)
    if (product) {
      const nextStock = Math.max(0, Number(product.stock || 0) - line.quantity)
      await store.update('products', Number(product.id), { stock: nextStock })
    }
  }

  if (matchedCoupon) {
    await store.update('coupons', Number(matchedCoupon.id), {
      usedCount: Number(matchedCoupon.usedCount || 0) + 1
    })
  }

  if (user) {
    const nextPoints = Math.max(0, Number(user.points || 0) - pointsRedeemed + pointsEarned)
    await store.update('customers', Number(user.id), {
      points: nextPoints,
      totalSpent: Number(user.totalSpent || 0) + total
    })
  }

  const created = await store.findById('orders', Number(order.id))
  return { order: created, items: lines }
})
