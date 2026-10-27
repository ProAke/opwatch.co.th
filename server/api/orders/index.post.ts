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
      image: images[0] || '/images/hero-watch.jpg',
      price: Number(product.price),
      quantity
    })
  }

  if (!lines.length) throw createError({ statusCode: 400, statusMessage: 'cart.empty' })

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0)

  // New members receive 10% off their first order.
  let discount = 0
  if (user && Number(user.totalSpent || 0) <= 0) {
    discount = Math.round(subtotal * 0.1 * 100) / 100
  }

  const shippingFee =
    Number(cfg.site.freeShippingThreshold || 0) > 0 && subtotal - discount >= Number(cfg.site.freeShippingThreshold)
      ? 0
      : Number(cfg.site.shippingFee || 0)

  const total = Math.max(0, Math.round((subtotal - discount + shippingFee) * 100) / 100)

  const customer = body?.customer || {}
  const customerName = String(customer.name || '').trim()
  const customerEmail = String(customer.email || user?.email || '').trim().toLowerCase()
  if (!customerName || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customerEmail)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'checkout.invalidContact',
      data: { errors: { name: !customerName ? 'validation.required' : '', email: !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customerEmail) ? 'validation.emailInvalid' : '' } }
    })
  }

  const order = await store.create('orders', {
    orderNo: orderNo(),
    customerId: user ? Number(user.id) : null,
    customerName,
    customerEmail,
    phone: String(customer.phone || user?.phone || '').trim(),
    address: String(customer.address || '').trim(),
    city: String(customer.city || '').trim(),
    postalCode: String(customer.postalCode || '').trim(),
    country: String(customer.country || 'Thailand').trim(),
    subtotal,
    shippingFee,
    discount,
    total,
    currency: cfg.site.currency,
    status: 'pending',
    paymentMethod: String(body?.paymentMethod || 'offline'),
    note: String(body?.note || '').trim().slice(0, 500)
  })

  for (const line of lines) {
    await store.create('order_items', {
      orderId: Number(order.id),
      productId: line.productId,
      sku: line.sku,
      name: line.name,
      image: line.image,
      price: line.price,
      quantity: line.quantity
    })
    const product = await store.findById('products', line.productId)
    if (product) {
      const nextStock = Math.max(0, Number(product.stock || 0) - line.quantity)
      await store.update('products', Number(product.id), { stock: nextStock })
    }
  }

  // Loyalty: 1 point per 50 THB spent.
  if (user) {
    const points = Math.floor(total / 50)
    await store.update('customers', Number(user.id), {
      points: Number(user.points || 0) + points,
      totalSpent: Number(user.totalSpent || 0) + total
    })
  }

  const created = await store.findById('orders', Number(order.id))
  return { order: created, items: lines }
})
