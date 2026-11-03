<script setup lang="ts">
const { locale } = useI18n()
const { site } = useSite()
const route = useRoute()

const open = ref(false)
const tab = ref<'channels' | 'livechat'>('channels')
const sending = ref(false)
const customerName = ref('')
const customerContact = ref('')
const draft = ref('')
const messages = ref<{ sender: 'bot' | 'user'; text: string; time: string }[]>([])

onMounted(() => {
  messages.value = [
    {
      sender: 'bot',
      text:
        locale.value === 'en'
          ? site.value.chatGreetingEn || 'Welcome to OPWatch Thailand Boutique! Ask us about watch specs, promotions, or branch stock.'
          : site.value.chatGreetingTh || 'สวัสดีครับ ยินดีต้อนรับสู่ OPWatch Boutique โดย บริษัท อินเตอร์ไทมส์ จำกัด สอบถามรุ่นนาฬิกา คูปองส่วนลด หรือเช็คสต็อกสาขาใกล้บ้านได้เลยครับ',
      time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    }
  ]
})

const quickPrompts = computed(() =>
  locale.value === 'en'
    ? ['Current promotions & coupons', '2-Year Thailand warranty', 'Gift wrap & branch pickup']
    : ['ขอโค้ดส่วนลดโปรโมชั่นล่าสุด', 'เงื่อนไขรับประกันศูนย์ไทย 2 ปี', 'บริการห่อของขวัญ & รับที่สาขา']
)

async function sendMessage(preset?: string) {
  const text = String(preset ?? draft.value).trim()
  if (!text || sending.value) return
  const now = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
  messages.value.push({ sender: 'user', text, time: now })
  if (!preset) draft.value = ''
  sending.value = true
  try {
    const productSlug = route.path.includes('/products/') ? String(route.params.slug || '') : ''
    const res = await $fetch<{ reply: string }>('/api/chat', {
      method: 'POST',
      body: {
        message: text,
        customerName: customerName.value || 'ลูกค้าหน้าเว็บ',
        customerContact: customerContact.value,
        productSlug
      }
    })
    messages.value.push({
      sender: 'bot',
      text: res.reply,
      time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    })
  } catch {
    messages.value.push({
      sender: 'bot',
      text: 'สามารถติดต่อด่วนได้ที่ LINE ID: opwatch.th หรือโทร 02 251 5777 ครับ',
      time: now
    })
  } finally {
    sending.value = false
  }
}

const lineHref = computed(() => site.value.lineUrl || 'https://line.me/ti/p/~opwatch.th')
const fbHref = computed(() => site.value.facebookUrl || 'https://www.facebook.com/OPwatchThailand')
const tiktokHref = computed(() => site.value.tiktokUrl || 'https://www.tiktok.com/@opwatchthailand')
const shopeeHref = computed(() => site.value.shopeeUrl || 'https://shopee.co.th/opwatchthailand')
const phoneClean = computed(() => String(site.value.phone || '022515777').replace(/\s+/g, ''))
</script>

<template>
  <div v-if="site.chatEnabled !== false" class="op-chat">
    <Transition name="fade-drop">
      <div v-if="open" class="op-chat__panel">
        <div class="op-chat__head">
          <div>
            <strong>OPWatch Concierge</strong>
            <span>{{ locale === 'th' ? 'บริษัท อินเตอร์ไทมส์ จำกัด · ตอบกลับทันที' : 'Inter Times Co., Ltd. · Online' }}</span>
          </div>
          <button type="button" class="op-chat__close" aria-label="Close chat" @click="open = false">✕</button>
        </div>

        <div class="op-chat__tabs">
          <button type="button" :class="{ 'is-active': tab === 'channels' }" @click="tab = 'channels'">
            {{ locale === 'th' ? 'ช่องทางโซเชียล & แชทด่วน' : 'Social & Direct Chat' }}
          </button>
          <button type="button" :class="{ 'is-active': tab === 'livechat' }" @click="tab = 'livechat'">
            {{ locale === 'th' ? 'แชทบนหน้าเว็บทันที' : 'Live Web Chat' }}
          </button>
        </div>

        <!-- Tab 1: Omnichannel Social Direct Links -->
        <div v-if="tab === 'channels'" class="op-chat__channels">
          <a :href="lineHref" target="_blank" rel="noopener noreferrer" class="op-chat__item op-chat__item--line">
            <span class="op-chat__badge">LINE</span>
            <div>
              <strong>LINE Official : {{ site.lineId || 'opwatch.th' }}</strong>
              <small>{{ locale === 'th' ? 'แชทปรึกษารุ่นนาฬิกา & รับคูปองส่วนลด' : 'Instant watch consultation & vouchers' }}</small>
            </div>
          </a>

          <a :href="fbHref" target="_blank" rel="noopener noreferrer" class="op-chat__item op-chat__item--fb">
            <span class="op-chat__badge">FB</span>
            <div>
              <strong>Facebook : OPwatchThailand</strong>
              <small>{{ locale === 'th' ? 'ทักแชทเพจทางการ & ชมรีวิวเรือนจริง' : 'Message our official Thailand page' }}</small>
            </div>
          </a>

          <a :href="tiktokHref" target="_blank" rel="noopener noreferrer" class="op-chat__item op-chat__item--tt">
            <span class="op-chat__badge">TT</span>
            <div>
              <strong>TikTok : @opwatchthailand</strong>
              <small>{{ locale === 'th' ? 'ชมวิดีโอเรือนเวลาบนข้อมือ & Flash Deal' : 'Watch wrist videos & TikTok deals' }}</small>
            </div>
          </a>

          <a :href="shopeeHref" target="_blank" rel="noopener noreferrer" class="op-chat__item op-chat__item--sp">
            <span class="op-chat__badge">SHP</span>
            <div>
              <strong>Shopee Official Store</strong>
              <small>shopee.co.th/opwatchthailand</small>
            </div>
          </a>

          <a :href="`tel:${phoneClean}`" class="op-chat__item op-chat__item--tel">
            <span class="op-chat__badge">TEL</span>
            <div>
              <strong>{{ site.phone || '02 251 5777' }}</strong>
              <small>{{ locale === 'th' ? 'ศูนย์บริการ อินเตอร์ไทมส์ (เพชรบุรีตัดใหม่)' : 'Official Thailand Service Center' }}</small>
            </div>
          </a>

          <button type="button" class="btn btn--sm btn--block" style="margin-top: 6px" @click="tab = 'livechat'">
            {{ locale === 'th' ? '💬 พิมพ์คุยผ่านแชทหน้าเว็บทันที →' : '💬 Start Live Web Chat →' }}
          </button>
        </div>

        <!-- Tab 2: Built-in Web Concierge Chat -->
        <div v-else class="op-chat__live">
          <div class="op-chat__msgs">
            <div
              v-for="(m, idx) in messages"
              :key="idx"
              class="op-chat__msg"
              :class="m.sender === 'user' ? 'is-user' : 'is-bot'"
            >
              <p>{{ m.text }}</p>
              <time>{{ m.time }}</time>
            </div>
          </div>

          <div class="op-chat__quick">
            <button v-for="q in quickPrompts" :key="q" type="button" @click="sendMessage(q)">
              {{ q }}
            </button>
          </div>

          <div class="op-chat__contact-row">
            <input v-model="customerContact" :placeholder="locale === 'th' ? 'เบอร์โทร / LINE ID (เพื่อให้เจ้าหน้าที่ติดต่อกลับ)' : 'Phone / LINE ID (optional)'" />
          </div>

          <form class="op-chat__form" @submit.prevent="sendMessage()">
            <input
              v-model="draft"
              :placeholder="locale === 'th' ? 'พิมพ์ข้อความสอบถาม...' : 'Type your question...'"
            />
            <button type="submit" :disabled="sending">{{ locale === 'th' ? 'ส่ง' : 'Send' }}</button>
          </form>
        </div>
      </div>
    </Transition>

    <button type="button" class="op-chat__fab" @click="open = !open">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
      </svg>
      <span>{{ locale === 'th' ? 'แชท / ติดต่อเรา' : 'Chat with Us' }}</span>
    </button>
  </div>
</template>

<style scoped>
.op-chat {
  position: fixed;
  right: 22px;
  bottom: 22px;
  z-index: 95;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}
.op-chat__fab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #1d2088, #101357);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 999px;
  padding: 12px 20px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 14px 34px rgba(29, 32, 136, 0.38);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.op-chat__fab:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 40px rgba(29, 32, 136, 0.5);
}
.op-chat__panel {
  width: min(370px, calc(100vw - 32px));
  background: #ffffff;
  border: 1px solid var(--line-strong);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(15, 19, 48, 0.26);
}
.op-chat__head {
  background: linear-gradient(135deg, #1d2088, #0f124c);
  color: #ffffff;
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.op-chat__head strong { display: block; font-size: 15px; }
.op-chat__head span { font-size: 11.5px; opacity: 0.85; }
.op-chat__close { background: transparent; border: 0; color: #ffffff; font-size: 16px; cursor: pointer; }
.op-chat__tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-bottom: 1px solid var(--line);
  background: #f6f7fb;
}
.op-chat__tabs button {
  padding: 9px 10px;
  border: 0;
  background: transparent;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--muted);
  cursor: pointer;
}
.op-chat__tabs button.is-active {
  background: #ffffff;
  color: var(--sapphire);
  box-shadow: inset 0 -2px 0 var(--sapphire);
}
.op-chat__channels {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.op-chat__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 11px;
  border: 1px solid var(--line);
  border-radius: 10px;
  transition: all 0.15s ease;
}
.op-chat__item:hover {
  border-color: var(--sapphire);
  background: #f8f9ff;
}
.op-chat__item strong { display: block; font-size: 13px; color: var(--ink); }
.op-chat__item small { display: block; font-size: 11.5px; color: var(--muted); }
.op-chat__badge {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 800;
  color: #ffffff;
  flex: none;
}
.op-chat__item--line .op-chat__badge { background: #06c755; }
.op-chat__item--fb .op-chat__badge { background: #1877f2; }
.op-chat__item--tt .op-chat__badge { background: #111111; }
.op-chat__item--sp .op-chat__badge { background: #ee4d2d; }
.op-chat__item--tel .op-chat__badge { background: #1d2088; }
.op-chat__live { display: flex; flex-direction: column; height: 350px; }
.op-chat__msgs {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #f8f9fc;
}
.op-chat__msg {
  max-width: 86%;
  padding: 9px 12px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.5;
}
.op-chat__msg.is-bot { align-self: flex-start; background: #ffffff; border: 1px solid var(--line); color: var(--ink); }
.op-chat__msg.is-user { align-self: flex-end; background: var(--sapphire); color: #ffffff; }
.op-chat__msg time { display: block; font-size: 10px; opacity: 0.65; margin-top: 3px; }
.op-chat__quick {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 6px 10px;
  background: #ffffff;
  border-top: 1px solid var(--line);
}
.op-chat__quick button {
  white-space: nowrap;
  font-size: 11px;
  padding: 4px 9px;
  border-radius: 999px;
  border: 1px solid #cfd3f2;
  background: #f3f5ff;
  color: var(--sapphire);
  cursor: pointer;
}
.op-chat__contact-row { padding: 6px 10px 0; background: #ffffff; }
.op-chat__contact-row input {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 7px;
  padding: 5px 9px;
  font-size: 11.5px;
}
.op-chat__form {
  display: flex;
  gap: 6px;
  padding: 8px 10px 10px;
  background: #ffffff;
}
.op-chat__form input {
  flex: 1;
  border: 1px solid var(--line-strong);
  border-radius: 8px;
  padding: 7px 10px;
  font-size: 13px;
}
.op-chat__form button {
  background: var(--sapphire);
  color: #ffffff;
  border: 0;
  border-radius: 8px;
  padding: 0 14px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
}
</style>
