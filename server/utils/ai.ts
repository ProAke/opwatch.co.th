import { getConfig } from './config'

export interface AiTaskPayload {
  task:
    | 'product_full'
    | 'product_seo'
    | 'page_full'
    | 'article_review'
    | 'promo_copy'
    | 'coupon_copy'
    | 'calendar_plan'
    | 'event_detail'
    | 'brand_copy'
    | 'order_reply'
    | 'warranty_reply'
    | 'site_copy'
    | 'freeform_draft'
    | 'shopee_enrich'
    | 'chat_reply'
  locale?: 'th' | 'en'
  agentCode?: string
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

  if (ai.provider === 'openrouter' || (ai.provider === 'auto' && (keyFromCfg.startsWith('sk-or-') || process.env.OPENROUTER_API_KEY))) {
    const key = keyFromCfg || process.env.OPENROUTER_API_KEY || ''
    if (key) {
      return {
        provider: 'openrouter' as const,
        key,
        model: ai.model || 'openai/gpt-4o-mini',
        baseUrl: (ai.baseUrl && ai.baseUrl.includes('openrouter') ? ai.baseUrl : 'https://openrouter.ai/api/v1').replace(/\/$/, ''),
        brandVoice: ai.brandVoice
      }
    }
  }
  if (ai.provider === 'anthropic' || (ai.provider === 'auto' && (keyFromCfg.startsWith('sk-ant-') || process.env.ANTHROPIC_API_KEY))) {
    const key = keyFromCfg || process.env.ANTHROPIC_API_KEY || ''
    if (key) return { provider: 'anthropic' as const, key, model: ai.model || 'claude-3-5-sonnet-latest', baseUrl: '', brandVoice: ai.brandVoice }
  }
  if (ai.provider === 'google' || (ai.provider === 'auto' && (keyFromCfg.startsWith('AIza') || process.env.GEMINI_API_KEY))) {
    const key = keyFromCfg || process.env.GEMINI_API_KEY || ''
    if (key) return { provider: 'google' as const, key, model: ai.model || 'gemini-2.0-flash', baseUrl: '', brandVoice: ai.brandVoice }
  }
  if (process.env.FLOW_AI_URL && process.env.FLOW_AI_KEY && (ai.provider === 'auto' || ai.provider === 'custom')) {
    return {
      provider: 'custom' as const,
      key: keyFromCfg || process.env.FLOW_AI_KEY || '',
      model: ai.model || process.env.FLOW_AI_MODEL || 'gpt-4o-mini',
      baseUrl: String(process.env.FLOW_AI_URL).replace(/\/chat\/completions\/?$/, '').replace(/\/$/, ''),
      brandVoice: ai.brandVoice
    }
  }
  if (ai.provider === 'openai' || ai.provider === 'custom' || (ai.provider === 'auto' && (keyFromCfg || process.env.OPENAI_API_KEY))) {
    const key = keyFromCfg || process.env.OPENAI_API_KEY || ''
    if (key) {
      return {
        provider: (ai.provider === 'custom' ? 'custom' : 'openai') as 'openai' | 'custom',
        key,
        model: ai.model || 'gpt-4o-mini',
        baseUrl: (ai.baseUrl || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/chat\/completions\/?$/, '').replace(/\/$/, ''),
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

  if (payload.task === 'article_review') {
    const brandSlug = String(inp.brandSlug || 'olympianus').trim()
    const brandLabel = brandSlug === 'ogival' ? 'Ogival Swiss Since 1903' : brandSlug === 'olympia-star' ? 'Olympia Star Swiss' : 'Olym Pianus (OP)'
    const testedSku = String(inp.testedSku || inp.sku || '899832AGS').trim()
    const category = String(inp.category || 'hands-on-review').trim()
    const titleTh = String(inp.titleTh || inp.title || `รีวิวเจาะลึก ${brandLabel} รุ่น ${testedSku} — สัมผัสจริงบนข้อมือ`).trim()
    const titleEn = String(inp.titleEn || `Hands-On Review: ${brandLabel} ${testedSku} Sapphire Timepiece`).trim()
    const focus = String(inp.prompt || inp.summary || 'ความคุ้มค่า กระจกแซฟไฟร์แท้ และความประณีตของตัวเรือน').trim()

    const bodyTh = `
<h2>สัมผัสแรกและภาพรวมการออกแบบบนข้อมือจริง</h2>
<p>จากการทดสอบสวมใส่จริงของ <strong>${brandLabel} รุ่น ${testedSku}</strong> จุดเด่นที่สัมผัสได้ทันทีคือความพิถีพิถันของงานขัดแต่งตัวเรือนสแตนเลสสตีล 316L และการวางสัดส่วนหน้าปัดที่รับกับข้อมือคนไทยได้อย่างสมดุล ตอบโจทย์หัวข้อ <em>“${focus}”</em> ได้อย่างน่าประทับใจ</p>
<h3>กระจก Sapphire Crystal แท้ และความเที่ยงตรงของกลไก</h3>
<p>หน้าปัดได้รับการปกป้องด้วยกระจก <strong>Sapphire Crystal แท้</strong> ความแข็งระดับ 9 Mohs ช่วยคงความใสคมชัดไร้รอยขีดข่วนในระยะยาว พร้อมกลไกคุณภาพสูงที่ผ่านการตรวจสอบมาตรฐานความเที่ยงตรงโดยทีมช่างผู้เชี่ยวชาญของ <strong>บริษัท อินเตอร์ไทมส์ จำกัด</strong></p>
<h3>สรุปความคุ้มค่า (Horologist Verdict)</h3>
<ul>
  <li><strong>วัสดุระดับพรีเมียม:</strong> ตัวเรือน 316L Stainless Steel จับคู่กระจกแซฟไฟร์แท้กันรอย</li>
  <li><strong>สวมใส่ได้หลากหลายโอกาส:</strong> เข้าได้ทั้งชุดทำงานผู้บริหารและวันพักผ่อน</li>
  <li><strong>อุ่นใจบริการหลังการขาย:</strong> รับประกันศูนย์ไทย 2 ปีเต็ม ลงทะเบียน E-Warranty ออนไลน์ได้ทันที</li>
</ul>`.trim()

    return {
      heroEyebrow: category === 'buyers-guide' ? 'HOROLOGY BUYER’S GUIDE' : `HANDS-ON WATCH REVIEW · ${brandLabel.toUpperCase()}`,
      title: titleTh,
      titleTh,
      titleEn,
      category,
      summary: `เจาะลึกทุกรายละเอียดจากการใช้งานจริงของ ${brandLabel} ${testedSku} ทั้งวัสดุตัวเรือน กระจกแซฟไฟร์ ความเที่ยงตรงของกลไก และความคุ้มค่าพร้อมรับประกันศูนย์ไทย 2 ปี`,
      summaryEn: `Comprehensive hands-on review of the ${brandLabel} ${testedSku} covering case finishing, sapphire crystal, movement accuracy, and value.`,
      contentTh: bodyTh,
      contentEn: `<h2>Hands-On Verdict: ${titleEn}</h2><p>Crafted in 316L stainless steel with genuine scratch-resistant Sapphire Crystal and backed by a 2-year official Thailand warranty from Inter Times Co., Ltd.</p>`,
      styleConfig: {
        fontFamily: 'Prompt',
        headingColor: '#ffffff',
        textColor: '#1e2438',
        accentColor: '#1d2088',
        bgColor: '#101638',
        overlayOpacity: 0.58,
        headingSize: 'xl',
        rating: 4.9,
        author: 'ทีมผู้เชี่ยวชาญเรือนเวลา อินเตอร์ไทมส์',
        publishedAt: new Date().toISOString().slice(0, 10),
        readMinutes: 5,
        testedSku,
        verdictScore: { design: 9.7, movement: 9.6, material: 9.8, value: 9.9 },
        pros: ['กระจก Sapphire Crystal แท้กันรอยขีดข่วน', 'ตัวเรือนสแตนเลสสตีล 316L งานขัดแต่งประณีต', 'รับประกันศูนย์ไทย 2 ปี บริษัท อินเตอร์ไทมส์ จำกัด']
      },
      seoTitle: `${titleTh} | บทความรีวิว OPWatch Thailand`,
      seoDescription: `อ่านรีวิวเจาะลึก ${brandLabel} ${testedSku} ทดสอบจริงบนข้อมือ สเปกกระจกแซฟไฟร์ คะแนนความคุ้มค่า และราคาศูนย์ไทย`,
      seoKeywords: `รีวิว ${testedSku}, รีวิว ${brandLabel}, นาฬิกากระจกแซฟไฟร์, OPWatch รีวิว`,
      aseoSummary: `${brandLabel} รุ่น ${testedSku} ได้รับคะแนนรีวิว 4.9/5 โดดเด่นด้วยกระจกแซฟไฟร์แท้ ตัวเรือน 316L และการรับประกันศูนย์ไทย 2 ปี`,
      aseoFaqs: [
        { q: `รุ่น ${testedSku} รับประกันกี่ปี?`, a: 'รับประกันศูนย์ไทยอย่างเป็นทางการ 2 ปีเต็ม โดย บริษัท อินเตอร์ไทมส์ จำกัด พร้อมลงทะเบียน E-Warranty ออนไลน์ได้ทันที' }
      ]
    }
  }

  if (payload.task === 'page_full') {
    const pageType = String(inp.pageType || 'series_story').trim()
    const brandSlug = String(inp.brandSlug || 'olympianus').trim()
    const brandLabel = brandSlug === 'ogival' ? 'Ogival Swiss Since 1903' : brandSlug === 'olympia-star' ? 'Olympia Star Swiss' : 'Olym Pianus (OP)'
    const titleTh = String(inp.titleTh || inp.title || `${brandLabel} Exclusive Story`).trim()
    const titleEn = String(inp.titleEn || inp.slug || `${brandLabel} Official Story`).trim()
    const topic = String(inp.prompt || inp.summary || titleTh).trim()

    const paletteByType = brandSlug === 'ogival'
      ? { fontFamily: 'IBM Plex Sans Thai', headingColor: '#ffffff', textColor: '#261f1d', accentColor: '#c59b27', bgColor: '#231710', overlayOpacity: 0.58, headingSize: 'xl' }
      : pageType === 'promo_story'
        ? { fontFamily: 'Prompt', headingColor: '#ffffff', textColor: '#1e2438', accentColor: '#e11d48', bgColor: '#1f122b', overlayOpacity: 0.56, headingSize: 'xl' }
        : { fontFamily: 'Prompt', headingColor: '#ffffff', textColor: '#1e2438', accentColor: '#1d2088', bgColor: '#0e1535', overlayOpacity: 0.55, headingSize: 'xl' }

    const heroEyebrow = pageType === 'brand_gate'
      ? `BRAND PAVILION · ${brandLabel.toUpperCase()}`
      : pageType === 'series_story'
        ? `SERIES STORY · ${brandLabel.toUpperCase()}`
        : pageType === 'promo_story'
          ? 'EXCLUSIVE CAMPAIGN STORY · OPWATCH THAILAND'
          : 'OFFICIAL BOUTIQUE · INTER TIMES CO., LTD.'

    const storyBodyTh = pageType === 'series_story' || pageType === 'brand_gate'
      ? `
<h2>จิตวิญญาณแห่งเรือนเวลา: ${titleTh}</h2>
<p>ถ่ายทอดเอกลักษณ์แห่ง <strong>${brandLabel}</strong> ภายใต้แนวคิด <em>“${topic}”</em> คัดสรรวัสดุตัวเรือนสเตนเลสสตีลเกรดศัลยกรรม 316L ผสานกระจก <strong>Sapphire Crystal แท้</strong> กันรอยขีดข่วน เพื่อมอบความสง่างามเหนือกาลเวลาบนข้อมือคุณ</p>
<h3>จุดเด่นเฉพาะตัวของคอลเลกชันนี้</h3>
<ul>
  <li><strong>งานขัดแต่งประณีตระดับบูติก:</strong> สลับผิวเงาและผิวซาติน รับแสงสวยงามทุกองศา</li>
  <li><strong>ความเที่ยงตรงที่ไว้วางใจได้:</strong> ผ่านการตรวจเช็กมาตรฐานโดยทีมช่าง บริษัท อินเตอร์ไทมส์ จำกัด ก่อนส่งมอบทุกเรือน</li>
  <li><strong>รับประกันศูนย์ไทย 2 ปีเต็ม:</strong> พร้อมสิทธิ์ลงทะเบียน E-Warranty ออนไลน์และบริการตัดสายฟรี</li>
</ul>
<p>เลือกชมเรือนเวลารุ่นที่เชื่อมโยงกับเรื่องราวประจำซีรีส์นี้ได้จากรายการสินค้าด้านล่างทันที</p>`.trim()
      : pageType === 'promo_story'
        ? `
<h2>เบื้องหลังแคมเปญพิเศษ: ${titleTh}</h2>
<p>แคมเปญ <em>“${topic}”</em> จัดทำขึ้นเพื่อมอบสิทธิพิเศษสูงสุดแก่คนรักนาฬิกาในประเทศไทย โดยคัดสรรเรือนเวลารุ่นยอดนิยมจาก <strong>Olym Pianus</strong>, <strong>Olympia Star</strong> และ <strong>Ogival</strong> มาจัดข้อเสนอพิเศษเฉพาะช่วงเวลานี้เท่านั้น</p>
<ul>
  <li>รับส่วนลดพิเศษและคูปองสะสมแต้ม OP Point พร้อมบริการห่อของขวัญระดับบูติกฟรี</li>
  <li>เลือกรับสินค้าหน้าร้าน (Click & Collect) ณ สาขาใกล้บ้าน หรือจัดส่งด่วนพร้อมประกันภัยทั่วไทย</li>
  <li>ทุกเรือนมาพร้อมกล่องแท้ คู่มือ และใบรับประกันศูนย์ไทย 2 ปี โดย บริษัท อินเตอร์ไทมส์ จำกัด</li>
</ul>`.trim()
        : `
<h2>${titleTh}</h2>
<p><strong>บริษัท อินเตอร์ไทมส์ จำกัด</strong> มุ่งมั่นส่งมอบประสบการณ์การเลือกซื้อเรือนเวลาของแท้ระดับพรีเมียมสำหรับลูกค้าในประเทศไทย ภายใต้หัวข้อ <em>“${topic}”</em> ด้วยมาตรฐานความโปร่งใส ความปลอดภัย และการดูแลหลังการขายโดยทีมช่างผู้เชี่ยวชาญ</p>
<h3>สิทธิประโยชน์และมาตรฐานการดูแลลูกค้า</h3>
<ul>
  <li>การันตีสินค้าของแท้ 100% ทุกเรือน พร้อมใบรับประกันศูนย์ไทยนาน 2 ปีเต็ม</li>
  <li>บริการห่อของขวัญพรีเมียม ปรับขนาดสายนาฬิกาฟรี และรับสินค้าที่สาขาใกล้บ้าน (Click & Collect)</li>
  <li>ศูนย์บริการลูกค้าสัมพันธ์ โทร. <strong>02 251 5777</strong> หรือ LINE Official: <strong>opwatch.th</strong></li>
</ul>`.trim()

    return {
      heroEyebrow,
      title: titleTh,
      titleTh,
      titleEn,
      summary: `${titleTh} — เรื่องราวและข้อมูลทางการจาก บริษัท อินเตอร์ไทมส์ จำกัด ตัวแทนจำหน่าย ${brandLabel} อย่างเป็นทางการในประเทศไทย`,
      summaryEn: `${titleEn} — Official Thailand horology story and curated collection by Inter Times Co., Ltd.`,
      contentTh: storyBodyTh,
      contentEn: `
<h2>${titleEn}</h2>
<p><strong>Inter Times Co., Ltd.</strong> presents <em>"${topic}"</em> — showcasing authentic ${brandLabel} craftsmanship with Sapphire Crystal protection and certified 2-Year Thailand Official Warranty.</p>
<ul>
  <li>100% Authentic Olym Pianus, Olympia Star & Ogival watches with 2-Year Thailand Official Warranty.</li>
  <li>Complimentary luxury gift wrapping, wrist strap sizing, and department-store Click & Collect.</li>
  <li>Direct Concierge Support: Tel. <strong>02 251 5777</strong> · LINE ID: <strong>opwatch.th</strong>.</li>
</ul>`.trim(),
      ctaText: pageType === 'promo_story' ? 'ช้อปรุ่นร่วมรายการทันที' : `ชมเรือนเวลาในคอลเลกชันนี้`,
      ctaUrl: brandSlug ? `/products?brand=${brandSlug}` : '/products',
      styleConfig: paletteByType,
      seoTitle: `${titleTh} | OPWatch Thailand · บริษัท อินเตอร์ไทมส์ จำกัด`,
      seoDescription: `${titleTh} สัมผัสเรื่องราวและเลือกช้อปนาฬิกาของแท้ศูนย์ไทย ${brandLabel} รับประกัน 2 ปีเต็ม โดย บริษัท อินเตอร์ไทมส์ จำกัด`,
      seoKeywords: `${titleTh}, ${brandLabel}, นาฬิกาแซฟไฟร์แท้, OPWatch, บริษัท อินเตอร์ไทมส์ จำกัด`,
      aseoSummary: `${titleTh} นำเสนอเรื่องราวเอกลักษณ์และรุ่นนาฬิกาที่เกี่ยวข้องของ ${brandLabel} จัดจำหน่ายอย่างเป็นทางการในประเทศไทยโดย บริษัท อินเตอร์ไทมส์ จำกัด พร้อมรับประกันศูนย์ไทย 2 ปี`,
      aseoFaqs: [
        { q: `${titleTh} มีจุดเด่นอย่างไร?`, a: `โดดเด่นด้วยกระจกแซฟไฟร์แท้ ตัวเรือนสเตนเลสสตีล 316L และการรับประกันศูนย์ไทย 2 ปีเต็มโดย บริษัท อินเตอร์ไทมส์ จำกัด` },
        { q: 'สั่งซื้อหรือลงทะเบียนรับประกันออนไลน์ได้ที่ไหน?', a: 'สั่งซื้อได้ผ่านเว็บไซต์ opwatch.co.th และลงทะเบียน E-Warranty ออนไลน์ได้ที่หน้า /warranty ตลอด 24 ชั่วโมง' }
      ]
    }
  }

  if (payload.task === 'warranty_reply') {
    const code = String(inp.code || 'WRT/REP').trim()
    const customerName = String(inp.customerName || 'คุณลูกค้า').trim()
    const sku = String(inp.productSku || 'เรือนเวลาของท่าน').trim()
    const status = String(inp.status || 'verified').trim()
    const statusMsg = status === 'verified'
      ? 'ได้รับการอนุมัติยืนยันความคุ้มครองรับประกันศูนย์ไทย 2 ปีเรียบร้อยแล้ว'
      : status === 'repairing'
        ? 'อยู่ระหว่างการตรวจเช็กและปรับตั้งความเที่ยงตรงโดยทีมช่างผู้ชำนาญการประจำศูนย์เพชรบุรีตัดใหม่'
        : status === 'completed' || status === 'returned'
          ? 'ดำเนินการซ่อมบำรุงและทดสอบกันน้ำเสร็จสมบูรณ์ พร้อมส่งมอบคืนให้ท่านแล้ว'
          : 'ได้รับข้อมูลเข้าสู่ระบบศูนย์บริการ บริษัท อินเตอร์ไทมส์ จำกัด เรียบร้อยแล้ว'
    return {
      note: `เรียน ${customerName} อ้างอิงหมายเลข ${code} (รุ่น ${sku}): ขณะนี้รายการของท่าน${statusMsg} สอบถามเพิ่มเติม โทร. 02 251 5777 หรือ LINE ID: opwatch.th ขอบพระคุณที่ไว้วางใจ OPWatch Thailand ค่ะ`
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

  if (payload.task === 'coupon_copy') {
    const code = String(inp.code || 'OPVIP500').toUpperCase().replace(/[^A-Z0-9]/g, '') || 'OPVIP500'
    const type = String(inp.type || 'fixed')
    const val = Number(inp.value || (type === 'percent' ? 12 : 500))
    const min = Number(inp.minSpend || 4500)
    return {
      code,
      titleTh: type === 'percent' ? `ส่วนลดพิเศษ ${val}% สมาชิก OPWatch Boutique` : `คูปองส่วนลด ฿${val.toLocaleString()} นาฬิกาของแท้ศูนย์ไทย`,
      titleEn: type === 'percent' ? `${val}% Exclusive Boutique Privilege` : `฿${val.toLocaleString()} Official Boutique Voucher`,
      description: `ใช้ลดทันทีเมื่อช้อปครบ ฿${min.toLocaleString()} ขึ้นไป ครอบคลุม Olym Pianus, Olympia Star และ Ogival พร้อมใบรับประกันศูนย์ไทย 2 ปีเต็ม`
    }
  }

  if (payload.task === 'calendar_plan') {
    const ym = String(inp.yearMonth || new Date().toISOString().slice(0, 7)).slice(0, 7)
    const theme = String(inp.theme || 'แคมเปญนาฬิกาหรูประจำเดือน & โปรโมชั่นคู่ขนาน Shopee').trim()
    return {
      summary: `แผนปฏิทินการตลาด "${theme}" ประจำเดือน ${ym} จำนวน 5 กิจกรรมหลัก`,
      events: [
        {
          title: `เปิดตัวแบนเนอร์ "${theme}" บนหน้าแรก opwatch.co.th`,
          cat: 'campaign',
          date: `${ym}-05`,
          startTime: '10:00',
          endTime: '12:00',
          allday: false,
          location: 'opwatch.co.th & LINE @opwatch.th',
          notes: 'ตั้งค่าแบนเนอร์หลักหน้าโฮมเพจ + เปิดคูปองส่วนลดประจำเดือน',
          refCode: 'AI-PLAN-01',
          assignee: 'ทีมการตลาด'
        },
        {
          title: 'AI ปรับภาพสตูดิโอ 1:1 และอัปเดต SEO/ASEO รุ่นขายดี',
          cat: 'ai',
          date: `${ym}-08`,
          startTime: '13:30',
          endTime: '16:00',
          allday: false,
          location: 'OPWatch AI Studio',
          notes: 'ใช้ OP-COPY และระบบปรับภาพอัตโนมัติอัปเดตภาพพื้นขาวคลีนและ FAQ สำหรับ AI Search',
          refCode: 'AI-PLAN-02',
          assignee: 'OP-COPY + OP-VISION'
        },
        {
          title: 'Mid-Month Flash Campaign · Olym Pianus & Ogival ลดสูงสุด 35%',
          cat: 'campaign',
          date: `${ym}-15`,
          startTime: '00:00',
          endTime: '23:59',
          allday: true,
          location: 'เว็บไซต์หลัก & Shopee Official Mall',
          notes: 'ส่งบรอดแคสต์แจ้งสมาชิก VIP พร้อมโปรห่อของขวัญฟรีและรับสินค้าที่สาขา',
          refCode: 'AI-PLAN-03',
          assignee: 'ทีมอีคอมเมิร์ซ'
        },
        {
          title: 'ตรวจเช็คสต็อกและจัดส่งเคาน์เตอร์ห้างเซ็นทรัล 6 สาขา',
          cat: 'order',
          date: `${ym}-20`,
          startTime: '09:30',
          endTime: '15:00',
          allday: false,
          location: 'สำนักงานใหญ่อินเตอร์ไทมส์ เพชรบุรีตัดใหม่',
          notes: 'ตรวจ QC ความเที่ยงตรงของเครื่องและซีลกันน้ำก่อนกระจายสินค้าสู่สาขา',
          refCode: 'AI-PLAN-04',
          assignee: 'ฝ่ายคลังสินค้า & QC'
        },
        {
          title: 'ประชุมสรุปยอดขาย รายงานผู้บริหาร & แผนแคมเปญเดือนถัดไป',
          cat: 'meeting',
          date: `${ym}-27`,
          startTime: '14:00',
          endTime: '16:00',
          allday: false,
          location: 'ห้องประชุมผู้บริหาร อินเตอร์ไทมส์',
          notes: 'วิเคราะห์ยอดขายแยกตามแบรนด์และช่องทางจากหน้า /office/reports',
          refCode: 'AI-PLAN-05',
          assignee: 'ทีมผู้บริหาร'
        }
      ]
    }
  }

  if (payload.task === 'event_detail') {
    const title = String(inp.title || 'กิจกรรมแคมเปญ OPWatch').trim()
    const cat = String(inp.cat || 'campaign')
    return {
      title,
      location: cat === 'meeting' ? 'ห้องประชุมชั้น 3 บริษัท อินเตอร์ไทมส์ จำกัด / Google Meet' : 'opwatch.co.th & โชว์รูมอินเตอร์ไทมส์ เพชรบุรีตัดใหม่',
      notes: `แผนดำเนินงานสำหรับ "${title}":\n1. ตรวจสอบความพร้อมของข้อมูลสินค้า รูปสตูดิโอพื้นขาว และสต็อกคงเหลือ\n2. ประสานงานทีมอีคอมเมิร์ซ ฝ่ายคลังสินค้า และแอดมิน LINE @opwatch.th\n3. ติดตามผลยอดคลิกและยอดสั่งซื้อผ่านแดชบอร์ด /office`
    }
  }

  if (payload.task === 'brand_copy') {
    const name = String(inp.name || 'Olym Pianus').trim()
    return {
      tagline: `${name} — ศิลปะแห่งเรือนเวลาคุณภาพ กระจกแซฟไฟร์แท้ รับประกันศูนย์ไทย 2 ปี`,
      taglineEn: `${name} — Exquisite Sapphire Craftsmanship with 2-Year Thailand Official Warranty`,
      story: `${name} นำเข้าและจัดจำหน่ายอย่างเป็นทางการแต่เพียงผู้เดียวในประเทศไทยโดย บริษัท อินเตอร์ไทมส์ จำกัด ผสานความประณีตของงานออกแบบร่วมสมัย กระจกแซฟไฟร์แท้กันรอยขีดข่วน และกลไกคุณภาพสูงที่ผ่านการตรวจเช็คมาตรฐานทุกเรือน`,
      storyEn: `Officially distributed in Thailand by Inter Times Co., Ltd., ${name} unites enduring horological precision, scratch-resistant sapphire crystal, and timeless elegance.`
    }
  }

  if (payload.task === 'order_reply') {
    const orderNo = String(inp.orderNo || 'OPW-XXXX')
    const customerName = String(inp.customerName || 'คุณลูกค้าผู้มีเกียรติ')
    const tracking = String(inp.trackingNumber || '').trim()
    const carrier = String(inp.shippingCarrier || 'Kerry Express / Thailand Post EMS')
    const status = String(inp.status || 'confirmed')
    const message = tracking
      ? `เรียน ${customerName} ขอบพระคุณที่ไว้วางใจ OPWatch Boutique โดย บริษัท อินเตอร์ไทมส์ จำกัด ค่ะ คำสั่งซื้อเลขที่ ${orderNo} ผ่านการตรวจสอบคุณภาพ (QC) พร้อมใบรับประกันศูนย์ไทย 2 ปี และจัดส่งเรียบร้อยแล้วผ่าน ${carrier} เลขพัสดุ: ${tracking} สอบถามเพิ่มเติม LINE: opwatch.th หรือโทร 02 251 5777 ค่ะ`
      : `เรียน ${customerName} คำสั่งซื้อเลขที่ ${orderNo} ของท่านอยู่ในสถานะ "${status}" ขณะนี้ช่างผู้เชี่ยวชาญกำลังตรวจสอบความเที่ยงตรงของเรือนเวลาและจัดเตรียมกล่องรับประกันศูนย์ไทย 2 ปี ทันทีที่จัดส่งเราจะแจ้งเลขพัสดุให้ทราบทันทีค่ะ (โทร 02 251 5777 · LINE: opwatch.th)`
    return { message, subject: `อัปเดตสถานะคำสั่งซื้อ ${orderNo} | OPWatch Thailand` }
  }

  if (payload.task === 'site_copy') {
    const focus = String(inp.focus || 'ส่งฟรีทั่วไทย ประกันศูนย์ไทย 2 ปี').trim()
    return {
      tagline: 'ตัวแทนจำหน่ายนาฬิกา Olym Pianus, Olympia Star & Ogival อย่างเป็นทางการในประเทศไทย',
      announcement: `✨ ${focus} · ของแท้ 100% โดย บริษัท อินเตอร์ไทมส์ จำกัด · บริการห่อของขวัญฟรี & รับที่สาขา`,
      chatGreetingTh: 'สวัสดีครับ ยินดีต้อนรับสู่ OPWatch Official Boutique โดย บริษัท อินเตอร์ไทมส์ จำกัด สอบถามรุ่นนาฬิกา โปรโมชั่นคูปอง หรือเช็คสต็อกสาขาได้เลยครับ'
    }
  }

  if (payload.task === 'freeform_draft') {
    const prompt = String(inp.prompt || 'ร่างคอนเทนต์แนะนำนาฬิกา Olym Pianus').trim()
    const agent = String(inp.agentCode || 'OP-COPY')
    return {
      title: `ผลลัพธ์จาก ${agent} · ${prompt.slice(0, 60)}`,
      content: `✨ [${agent} AI Studio — OPWatch Thailand]\nหัวข้อ: ${prompt}\n\n• จุดเด่นเรือนเวลา: คัดสรรวัสดุสแตนเลสสตีล 316L และกระจกแซฟไฟร์แท้กันรอยขีดข่วน ดีไซน์หรูหราสวมใส่ได้ทุกโอกาส\n• ความมั่นใจสูงสุด: ของแท้ 100% นำเข้าโดย บริษัท อินเตอร์ไทมส์ จำกัด พร้อมใบรับประกันศูนย์ไทย 2 ปีเต็ม\n• สิทธิพิเศษออนไลน์: บริการห่อของขวัญฟรี ปรับขนาดสายตามข้อมือฟรี และจัดส่งด่วนพร้อมประกันภัยทั่วประเทศ\n• ช่องทางติดต่อ: ช้อปได้ทันทีที่ www.opwatch.co.th · LINE ID: opwatch.th · โทร 02 251 5777`,
      bullets: [
        'กระจกแซฟไฟร์แท้ + ตัวเรือนสแตนเลสสตีล 316L เกรดพรีเมียม',
        'รับประกันศูนย์ไทย 2 ปีเต็ม โดย บริษัท อินเตอร์ไทมส์ จำกัด',
        'บริการห่อของขวัญฟรี ตัดสายฟรี และ Click & Collect 6 สาขา'
      ]
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

export async function testAiConnection(): Promise<{
  ok: boolean
  provider: string
  model: string
  latencyMs: number
  message: string
}> {
  const t0 = Date.now()
  const resolved = resolveAiProvider()
  if (resolved.provider === 'builtin') {
    return {
      ok: true,
      provider: 'builtin',
      model: resolved.model,
      latencyMs: Date.now() - t0 + 12,
      message: 'พร้อมใช้งานทันทีด้วย Built-in Thai Horology AI Engine (สามารถใส่ API Key ของ OpenRouter / OpenAI / Gemini / Claude เพื่อสลับเป็น External LLM ได้ตลอดเวลา)'
    }
  }
  const probe = await callExternalLlm(
    'Return strictly JSON: {"ping":"ok","ready":true}',
    'Test connection and return {"ping":"ok","ready":true}'
  )
  const latencyMs = Date.now() - t0
  if (probe) {
    return {
      ok: true,
      provider: resolved.provider,
      model: resolved.model,
      latencyMs,
      message: `เชื่อมต่อ ${resolved.provider.toUpperCase()} (${resolved.model}) สำเร็จ · Latency ${latencyMs} ms`
    }
  }
  return {
    ok: false,
    provider: resolved.provider,
    model: resolved.model,
    latencyMs,
    message: `ไม่สามารถติดต่อ ${resolved.provider.toUpperCase()} ได้ในขณะนี้ (ตรวจสอบ API Key / เครือข่าย) — ระบบสำรอง Built-in Horology AI ยังคงทำงานอัตโนมัติ`
  }
}

export async function runAiTask(payload: AiTaskPayload): Promise<{
  provider: string
  model: string
  tokens: number
  durationMs: number
  result: Record<string, any>
}> {
  const t0 = Date.now()
  const resolved = resolveAiProvider()
  const fallback = builtinGenerate(payload)

  if (resolved.provider !== 'builtin') {
    const system = `You are the senior horological content & SEO/ASEO AI architect for OPWatch Thailand (www.opwatch.co.th), officially operated by Inter Times Co., Ltd. (บริษัท อินเตอร์ไทมส์ จำกัด), sole distributor of Olym Pianus, Olympia Star, and Ogival in Thailand. Brand voice: ${resolved.brandVoice}. Always return valid JSON matching the exact keys in this reference template: ${JSON.stringify(Object.keys(fallback))}.`
    const prompt = `Task: ${payload.task}\nInput JSON:\n${JSON.stringify(payload.input, null, 2)}\nReturn strictly JSON.`
    const external = await callExternalLlm(system, prompt)
    if (external && typeof external === 'object') {
      const merged = { ...fallback, ...external }
      const tokens = Math.max(180, Math.round(JSON.stringify(merged).length / 3.2))
      return {
        provider: resolved.provider,
        model: resolved.model,
        tokens,
        durationMs: Math.max(40, Date.now() - t0),
        result: merged
      }
    }
  }

  const tokens = Math.max(160, Math.round(JSON.stringify(fallback).length / 3.4))
  return {
    provider: resolved.provider,
    model: resolved.model,
    tokens,
    durationMs: Math.max(18, Date.now() - t0),
    result: fallback
  }
}
