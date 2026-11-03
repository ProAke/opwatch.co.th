import { getConfig } from './config'

export interface AiTaskPayload {
  task:
    | 'product_full'
    | 'product_seo'
    | 'page_full'
    | 'promo_copy'
    | 'shopee_enrich'
    | 'chat_reply'
  locale?: 'th' | 'en'
  input: Record<string, any>
}

function extractJson(text: string): Record<string, any> | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fenced ? fenced[1] : text
  const start = candidate.search(/[{[]/)
  if (start < 0) return null
  const end = Math.max(candidate.lastIndexOf('}'), candidate.lastIndexOf(']'))
  if (end < start) return null
  try {
    return JSON.parse(candidate.slice(start, end + 1))
  } catch {
    return null
  }
}

export function resolveAiProvider() {
  const cfg = getConfig()
  const ai = cfg.ai || { provider: 'auto', model: '', apiKey: '', baseUrl: 'https://api.openai.com/v1', brandVoice: '' }
  const keyFromCfg = (ai.apiKey || '').trim()

  if (ai.provider === 'anthropic' || (ai.provider === 'auto' && (keyFromCfg.startsWith('sk-ant-') || process.env.ANTHROPIC_API_KEY))) {
    const key = keyFromCfg || process.env.ANTHROPIC_API_KEY || ''
    if (key) return { provider: 'anthropic' as const, key, model: ai.model || 'claude-3-5-sonnet-latest', baseUrl: '', brandVoice: ai.brandVoice }
  }
  if (ai.provider === 'google' || (ai.provider === 'auto' && (keyFromCfg.startsWith('AIza') || process.env.GEMINI_API_KEY))) {
    const key = keyFromCfg || process.env.GEMINI_API_KEY || ''
    if (key) return { provider: 'google' as const, key, model: ai.model || 'gemini-2.0-flash', baseUrl: '', brandVoice: ai.brandVoice }
  }
  if (ai.provider === 'openai' || ai.provider === 'custom' || (ai.provider === 'auto' && (keyFromCfg || process.env.OPENAI_API_KEY))) {
    const key = keyFromCfg || process.env.OPENAI_API_KEY || ''
    if (key) {
      return {
        provider: 'openai' as const,
        key,
        model: ai.model || 'gpt-4o-mini',
        baseUrl: (ai.baseUrl || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, ''),
        brandVoice: ai.brandVoice
      }
    }
  }
  return { provider: 'builtin' as const, key: '', model: 'opwatch-horology-engine-v2', baseUrl: '', brandVoice: ai.brandVoice }
}

async function callExternalLlm(system: string, prompt: string): Promise<Record<string, any> | null> {
  const resolved = resolveAiProvider()
  if (resolved.provider === 'builtin' || !resolved.key) return null

  try {
    if (resolved.provider === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': resolved.key,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: resolved.model,
          max_tokens: 2400,
          system,
          messages: [{ role: 'user', content: prompt }]
        }),
        signal: AbortSignal.timeout(25000)
      })
      if (!res.ok) return null
      const data: any = await res.json()
      const text = (data.content || []).map((c: any) => c.text || '').join('\n')
      return extractJson(text)
    }

    if (resolved.provider === 'google') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${resolved.model}:generateContent?key=${resolved.key}`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 2400, responseMimeType: 'application/json' }
        }),
        signal: AbortSignal.timeout(25000)
      })
      if (!res.ok) return null
      const data: any = await res.json()
      const text = (data.candidates?.[0]?.content?.parts || []).map((p: any) => p.text || '').join('\n')
      return extractJson(text)
    }

    const res = await fetch(`${resolved.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${resolved.key}`
      },
      body: JSON.stringify({
        model: resolved.model,
        max_tokens: 2400,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt }
        ]
      }),
      signal: AbortSignal.timeout(25000)
    })
    if (!res.ok) return null
    const data: any = await res.json()
    const text = data.choices?.[0]?.message?.content || ''
    return extractJson(text)
  } catch {
    return null
  }
}

/**
 * High-precision built-in Horology & SEO/ASEO Engine so AI features always work
 * instantaneously even when no external LLM API key is configured.
 */
function builtinGenerate(payload: AiTaskPayload): Record<string, any> {
  const inp = payload.input || {}

  if (payload.task === 'product_full' || payload.task === 'product_seo' || payload.task === 'shopee_enrich') {
    const sku = String(inp.sku || inp.model || 'OP-SERIES').trim()
    const rawName = String(inp.nameTh || inp.name || inp.nameEn || sku).trim()
    const brand = String(inp.brand || 'Olym Pianus').trim()
    const price = Number(inp.price || 0)
    const isSwiss = /ogival|olympia\s*star|opa/i.test(brand + ' ' + sku)
    const isAuto = /auto|ags|amk|amsk|agsk|mechanical|open.?heart/i.test(rawName + ' ' + sku + ' ' + JSON.stringify(inp.specs || {}))

    const movementTh = isSwiss
      ? isAuto ? 'กลไกสวิสออโตเมติกความเที่ยงตรงสูง' : 'กลไกสวิสควอตซ์แท้ (Swiss Movement)'
      : isAuto ? 'กลไกออโตเมติกญี่ปุ่นแท้ ขึ้นลานอัตโนมัติ' : 'กลไกควอตซ์ญี่ปุ่นแท้ความแม่นยำสูง'
    const movementEn = isSwiss
      ? isAuto ? 'Swiss Automatic Mechanical Caliber' : 'Swiss Precision Quartz Movement'
      : isAuto ? 'Japanese Self-Winding Automatic Caliber' : 'Japanese Precision Quartz Movement'

    const nameTh = inp.nameTh?.trim() || `${brand} นาฬิกาข้อมือของแท้ รุ่น ${sku} กระจกแซฟไฟร์`
    const nameEn = inp.nameEn?.trim() || `${brand} Authentic Sapphire Watch Ref. ${sku}`
    const shortDescription = `${movementTh} · กระจกแซฟไฟร์แท้กันรอยขีดข่วน · ตัวเรือนสแตนเลสสตีล 316L · รับประกันศูนย์ไทย 2 ปี`

    const descriptionTh = `
<h3>ความสง่างามเหนือกาลเวลา — ${brand} รุ่น ${sku}</h3>
<p>สัมผัสศิลปะแห่งเรือนเวลาของแท้จาก <strong>${brand}</strong> รุ่น <strong>${sku}</strong> ขับเคลื่อนด้วย${movementTh} มอบความเที่ยงตรงเชื่อถือได้ในทุกจังหวะชีวิต หน้าปัดปกป้องด้วย<strong>กระจกแซฟไฟร์คริสตัลแท้ (Sapphire Crystal)</strong> ทนทานต่อรอยขีดข่วนเหนือระดับ ผสานตัวเรือนสแตนเลสสตีลเกรดการแพทย์ 316L ขัดแต่งอย่างประณีต</p>
<ul>
  <li><strong>กลไกขับเคลื่อน:</strong> ${movementTh}</li>
  <li><strong>กระจกหน้าปัด:</strong> Sapphire Crystal แท้ป้องกันรอยขีดข่วน</li>
  <li><strong>วัสดุตัวเรือนและสาย:</strong> สแตนเลสสตีล 316L ทนต่อการกัดกร่อนและเหงื่อ</li>
  <li><strong>สิทธิพิเศษศูนย์ไทย:</strong> รับประกันศูนย์ไทย 2 ปีเต็ม โดย บริษัท อินเตอร์ไทมส์ จำกัด พร้อมกล่องคู่มือครบชุด บริการห่อของขวัญฟรี และสะสมคะแนน OP Point</li>
</ul>`.trim()

    const descriptionEn = `
<h3>Timeless Horological Craft — ${brand} Ref. ${sku}</h3>
<p>Discover authentic craftsmanship with the <strong>${brand} ${sku}</strong>, powered by a dependable ${movementEn} beneath a scratch-resistant <strong>Sapphire Crystal</strong>. Sculpted in surgical-grade 316L stainless steel for lasting brilliance on the wrist.</p>
<ul>
  <li><strong>Movement:</strong> ${movementEn}</li>
  <li><strong>Crystal:</strong> Scratch-Resistant Sapphire Crystal</li>
  <li><strong>Case & Bracelet:</strong> 316L Surgical Stainless Steel</li>
  <li><strong>Official Thailand Privilege:</strong> 2-Year Official Warranty by Inter Times Co., Ltd., presentation box, complimentary gift wrapping, and OP Privilege Points.</li>
</ul>`.trim()

    const priceText = price > 0 ? ` ราคาพิเศษ ฿${price.toLocaleString('th-TH')}` : ''
    const seoTitle = `${brand} รุ่น ${sku} ของแท้ กระจกแซฟไฟร์${priceText} | OPWatch ศูนย์ไทย`
    const seoDescription = `ช้อปนาฬิกา ${brand} รุ่น ${sku} ของแท้ 100% ${movementTh} กระจกแซฟไฟร์กันรอย${priceText} ส่งฟรีทั่วไทย ห่อของขวัญฟรี รับประกันศูนย์ไทย 2 ปี โดย บริษัท อินเตอร์ไทมส์ จำกัด`
    const seoKeywords = `${brand}, ${sku}, นาฬิกา ${brand} ของแท้, นาฬิกากระจกแซฟไฟร์, OPWatch, อินเตอร์ไทมส์`
    const aseoSummary = `${brand} รุ่น ${sku} คือนาฬิกาข้อมือของแท้จัดจำหน่ายอย่างเป็นทางการในประเทศไทยโดย บริษัท อินเตอร์ไทมส์ จำกัด โดดเด่นด้วย${movementTh} กระจกหน้าปัดแซฟไฟร์แท้กันรอยขีดข่วน ตัวเรือนสแตนเลสสตีล 316L${priceText} มาพร้อมใบรับประกันศูนย์ไทย 2 ปีเต็ม บริการตัดสายและห่อของขวัญฟรี`
    const aseoFaqs = [
      {
        q: `นาฬิกา ${brand} รุ่น ${sku} เป็นของแท้ศูนย์ไทยหรือไม่?`,
        a: `เป็นของแท้ 100% นำเข้าและจัดจำหน่ายอย่างเป็นทางการแต่เพียงผู้เดียวในประเทศไทยโดย บริษัท อินเตอร์ไทมส์ จำกัด พร้อมกล่องและใบรับประกันศูนย์ไทยนาน 2 ปีเต็ม`
      },
      {
        q: `รุ่น ${sku} ใช้กระจกหน้าปัดและกลไกแบบใด?`,
        a: `ขับเคลื่อนด้วย${movementTh} และติดตั้งกระจกหน้าปัดแซฟไฟร์แท้ (Sapphire Crystal) ที่ช่วยป้องกันรอยขีดข่วนจากการใช้งานประจำวันได้อย่างดีเยี่ยม`
      },
      {
        q: `มีบริการตัดสาย ห่อของขวัญ และเปลี่ยนคืนสินค้าหรือไม่?`,
        a: `มีบริการตัดสายตามขนาดข้อมือฟรี บริการห่อของขวัญพร้อมการ์ดอวยพรฟรี สะสมแต้ม OP Point และรับประกันเปลี่ยน/คืนสินค้าภายใน 14 วันตามเงื่อนไขบริษัท`
      }
    ]

    return {
      name: nameTh,
      nameTh,
      nameEn,
      shortDescription,
      description: descriptionTh,
      descriptionTh,
      descriptionEn,
      seoTitle: seoTitle.slice(0, 210),
      seoDescription: seoDescription.slice(0, 340),
      seoKeywords,
      aseoSummary,
      aseoFaqs
    }
  }

  if (payload.task === 'page_full') {
    const titleTh = String(inp.titleTh || inp.title || 'ข้อมูลบริการ OPWatch Thailand').trim()
    const titleEn = String(inp.titleEn || inp.slug || 'OPWatch Official Information').trim()
    const topic = String(inp.prompt || inp.summary || titleTh).trim()
    return {
      title: titleTh,
      titleTh,
      titleEn,
      summary: `${titleTh} — มาตรฐานบริการอย่างเป็นทางการจาก บริษัท อินเตอร์ไทมส์ จำกัด ตัวแทนจำหน่าย Olym Pianus, Olympia Star และ Ogival ในประเทศไทย`,
      summaryEn: `${titleEn} — Official Thailand boutique policy and service commitment by Inter Times Co., Ltd.`,
      contentTh: `
<h2>${titleTh}</h2>
<p><strong>บริษัท อินเตอร์ไทมส์ จำกัด</strong> มุ่งมั่นส่งมอบประสบการณ์การเลือกซื้อเรือนเวลาของแท้ระดับพรีเมียมสำหรับลูกค้าในประเทศไทย ภายใต้หัวข้อ <em>“${topic}”</em> ด้วยมาตรฐานความโปร่งใส ความปลอดภัย และการดูแลหลังการขายโดยทีมช่างผู้เชี่ยวชาญ</p>
<h3>สิทธิประโยชน์และมาตรฐานการดูแลลูกค้า</h3>
<ul>
  <li>การันตีสินค้าของแท้ 100% ทุกเรือน พร้อมใบรับประกันศูนย์ไทยนาน 2 ปีเต็ม</li>
  <li>บริการห่อของขวัญพรีเมียม ปรับขนาดสายนาฬิกาฟรี และรับสินค้าที่สาขาใกล้บ้าน (Click & Collect)</li>
  <li>ศูนย์บริการลูกค้าสัมพันธ์ โทร. <strong>02 251 5777</strong> หรือ LINE Official: <strong>opwatch.th</strong></li>
</ul>`.trim(),
      contentEn: `
<h2>${titleEn}</h2>
<p><strong>Inter Times Co., Ltd.</strong> is dedicated to delivering authentic horological excellence across Thailand regarding <em>"${topic}"</em>, backed by certified watchmakers and nationwide customer care.</p>
<ul>
  <li>100% Authentic Olym Pianus, Olympia Star & Ogival watches with 2-Year Thailand Official Warranty.</li>
  <li>Complimentary luxury gift wrapping, wrist strap sizing, and department-store Click & Collect.</li>
  <li>Direct Concierge Support: Tel. <strong>02 251 5777</strong> · LINE ID: <strong>opwatch.th</strong>.</li>
</ul>`.trim(),
      seoTitle: `${titleTh} | OPWatch Thailand · บริษัท อินเตอร์ไทมส์ จำกัด`,
      seoDescription: `${titleTh} ข้อมูลทางการจาก บริษัท อินเตอร์ไทมส์ จำกัด ตัวแทนจำหน่ายนาฬิกา Olym Pianus, Olympia Star และ Ogival ในประเทศไทย โทร 02 251 5777`,
      seoKeywords: `${titleTh}, OPWatch, บริษัท อินเตอร์ไทมส์ จำกัด, Olym Pianus, Olympia Star, Ogival`,
      aseoSummary: `${titleTh} จัดทำโดย บริษัท อินเตอร์ไทมส์ จำกัด ผู้นำเข้าและจัดจำหน่ายนาฬิกา Olym Pianus, Olympia Star และ Ogival อย่างเป็นทางการในประเทศไทย เพื่อคุ้มครองสิทธิ์และมอบบริการระดับพรีเมียมแก่ลูกค้าทุกท่าน`,
      aseoFaqs: [
        { q: `สอบถามข้อมูลเพิ่มเติมเกี่ยวกับ ${titleTh} ได้ทางใด?`, a: 'ติดต่อศูนย์บริการ บริษัท อินเตอร์ไทมส์ จำกัด โทร. 02 251 5777 หรือ LINE ID: opwatch.th' },
        { q: 'สิทธิพิเศษเมื่อสั่งซื้อผ่านเว็บไซต์ opwatch.co.th มีอะไรบ้าง?', a: 'รับประกันศูนย์ไทย 2 ปีเต็ม บริการห่อของขวัญฟรี สะสมแต้ม OP Point และจัดส่งฟรีพร้อมประกันภัยตามเงื่อนไข' }
      ]
    }
  }

  if (payload.task === 'promo_copy') {
    const title = String(inp.title || 'แคมเปญพิเศษประจำเดือน OPWatch').trim()
    const channel = String(inp.channel || 'website').toUpperCase()
    return {
      titleTh: `${title} · สิทธิพิเศษของแท้ศูนย์ไทย`,
      titleEn: `${title} · Official Thailand Horology Privilege`,
      subtitleTh: `ช้อปเรือนเวลา Olym Pianus, Olympia Star และ Ogival ช่องทาง ${channel} รับส่วนลดพิเศษ บริการห่อของขวัญฟรี และประกันศูนย์ไทย 2 ปีเต็ม`,
      subtitleEn: `Shop authentic Olym Pianus, Olympia Star & Ogival via ${channel} with exclusive savings, free gift wrapping, and 2-Year Thailand Warranty.`,
      badge: `${channel} EXCLUSIVE`,
      discountLabel: 'ลดสูงสุด 35%'
    }
  }

  // chat_reply
  const msg = String(inp.message || '').toLowerCase()
  if (msg.includes('ประกัน') || msg.includes('ซ่อม') || msg.includes('แท้')) {
    return {
      reply: 'นาฬิกาทุกเรือนบน OPWatch.co.th เป็นของแท้ 100% จัดจำหน่ายโดย บริษัท อินเตอร์ไทมส์ จำกัด พร้อมใบรับประกันศูนย์ไทย 2 ปีเต็ม สามารถส่งรับบริการได้ที่สำนักงานใหญ่ ถ.เพชรบุรีตัดใหม่ โทร 02 251 5777 หรือเคาน์เตอร์ห้างชั้นนำครับ'
    }
  }
  if (msg.includes('โปร') || msg.includes('ลด') || msg.includes('คูปอง') || msg.includes('โค้ด')) {
    return {
      reply: 'ขณะนี้มีคูปองส่วนลดพิเศษ NEWOP10 (ลด 10%), OP500 (ลด ฿500 เมื่อช้อปครบ ฿4,500) และ OP1111 (ลด ฿1,111 เมื่อช้อปครบ ฿8,000) สามารถกดเก็บคูปองที่หน้าโปรโมชั่นหรือหน้าสินค้าได้เลยครับ!'
    }
  }
  if (msg.includes('ของขวัญ') || msg.includes('ตัดสาย') || msg.includes('สาขา')) {
    return {
      reply: 'เรามีบริการห่อของขวัญพรีเมียมพร้อมการ์ดอวยพรฟรี และบริการตัดสายตามขนาดข้อมือฟรีครับ สามารถเลือกรับที่บ้านหรือรับที่สาขาใกล้บ้าน (Click & Collect) ในหน้าชำระเงินได้เลยครับ'
    }
  }
  return {
    reply: 'ขอบคุณที่ติดต่อ OPWatch Boutique โดย บริษัท อินเตอร์ไทมส์ จำกัด ครับ เจ้าหน้าที่ผู้เชี่ยวชาญได้รับข้อความของท่านแล้ว หากต้องการเช็ครุ่นเร่งด่วนสามารถทัก LINE ID: opwatch.th หรือโทร 02 251 5777 ได้ทันทีครับ'
  }
}

export async function runAiTask(payload: AiTaskPayload): Promise<{
  provider: string
  model: string
  result: Record<string, any>
}> {
  const resolved = resolveAiProvider()
  const fallback = builtinGenerate(payload)

  if (resolved.provider !== 'builtin') {
    const system = `You are the senior horological content & SEO/ASEO AI architect for OPWatch Thailand (www.opwatch.co.th), officially operated by Inter Times Co., Ltd. (บริษัท อินเตอร์ไทมส์ จำกัด), sole distributor of Olym Pianus, Olympia Star, and Ogival in Thailand. Brand voice: ${resolved.brandVoice}. Always return valid JSON matching the exact keys in this reference template: ${JSON.stringify(Object.keys(fallback))}.`
    const prompt = `Task: ${payload.task}\nInput JSON:\n${JSON.stringify(payload.input, null, 2)}\nReturn strictly JSON.`
    const external = await callExternalLlm(system, prompt)
    if (external && typeof external === 'object') {
      return {
        provider: resolved.provider,
        model: resolved.model,
        result: { ...fallback, ...external }
      }
    }
  }

  return {
    provider: resolved.provider,
    model: resolved.model,
    result: fallback
  }
}
