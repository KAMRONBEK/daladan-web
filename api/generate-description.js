const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'
const DEEPSEEK_MODEL = 'deepseek-chat'

const toTrimmedString = (value) => (typeof value === 'string' ? value.trim() : '')

const parseRequestBody = (body) => {
  if (!body) return {}
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(body)) {
    try {
      return JSON.parse(body.toString('utf8'))
    } catch {
      return {}
    }
  }
  if (typeof body === 'string') {
    try {
      return JSON.parse(body)
    } catch {
      return {}
    }
  }
  if (typeof body === 'object' && body !== null) return body
  return {}
}

const sanitizeDescription = (value) => {
  const stripped = value.replace(/^["'`]+|["'`]+$/g, '').trim()
  return stripped
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n')
}

const blob = (categoryName, subcategoryName, title) =>
  `${categoryName} ${subcategoryName} ${title}`.toLowerCase()

const formatContextBlock = ({ priceText, unit, deliveryAvailable, regionName, districtName }) => {
  const lines = []
  const loc = [toTrimmedString(regionName), toTrimmedString(districtName)].filter(Boolean).join(', ')
  if (loc) lines.push(`Joylashuv: ${loc}.`)
  const p = toTrimmedString(priceText)
  const u = toTrimmedString(unit)
  if (p) {
    lines.push(u ? `Narx: ${p} so'm / ${u}.` : `Narx: ${p} so'm.`)
  } else {
    lines.push(`Narx bo'yicha telefon orqali kelishamiz.`)
  }
  if (typeof deliveryAvailable === 'boolean') {
    lines.push(deliveryAvailable ? 'Yetkazib berish mavjud.' : "Yetkazib berish mavjud emas.")
  }
  return lines.join('\n')
}

const buildCommercialPromptLines = ({ priceText, unit, deliveryAvailable, regionName, districtName }) => {
  const loc = [toTrimmedString(regionName), toTrimmedString(districtName)].filter(Boolean).join(', ')
  const p = toTrimmedString(priceText)
  const u = toTrimmedString(unit)
  return [
    "Formadan kelgan ma'lumotlarni tavsifga qo'shing (raqamlarni o'zgartirmang):",
    loc ? `Joylashuv: ${loc}` : 'Joylashuv: kiritilmagan',
    p ? `Narx (so'mda, forma bo'yicha): ${p}` : 'Narx: kiritilmagan',
    u ? `Birlik: ${u}` : 'Birlik: kiritilmagan',
    typeof deliveryAvailable === 'boolean'
      ? `Yetkazib berish: ${deliveryAvailable ? 'ha' : "yo'q"}`
      : 'Yetkazib berish: noma\'lum',
  ].join('\n')
}

/**
 * @returns {'wanted' | 'rent' | 'service' | 'sale'}
 */
const inferIntent = (categoryName, subcategoryName, title) => {
  const b = blob(categoryName, subcategoryName, title)
  if (/\b(qidiray|qidirayapman|qidiramiz|kerak|olaman|olmoqchi|xarid qil|olib qol)\b/.test(b)) return 'wanted'
  if (/\b(ijaraga|ijara|ijaraga beriladi|arenda)\b/.test(b)) return 'rent'
  if (
    /\bxizmat\b/.test(b) ||
    /xizmatlar/i.test(categoryName) ||
    /\b(transport|ta'mirlash|yuk tashish)\b/.test(b)
  ) {
    return 'service'
  }
  return 'sale'
}

/**
 * Sale body lines: vary by what is sold (hayvon, sabzavot, boshqalar).
 * @returns {string[]}
 */
const saleBodyLines = (categoryName, subcategoryName, title) => {
  const b = blob(categoryName, subcategoryName, title)
  const name = title.trim() || subcategoryName
  const nameLc = name.toLowerCase()

  if (/otlar/i.test(b)) {
    return [
      `Sog'lom otlar, mashq va ishlatishga mos. Ko'rib chiqish va shartlar bo'yicha kelishamiz.`,
      "📞 Qo'ng'iroq qiling — ko'rish va narxni gaplashamiz.",
    ]
  }
  if (/(tuya|qatir|xach|sigir|buqa|\bot\b)/i.test(b)) {
    return [
      `Sog'lom holatda, hujjatlari tartibda. Ko'rib chiqish, narxi va yetkazib berish bo'yicha muzokara qilamiz.`,
      "📞 Avvalo qo'ng'iroq qiling — shartlarni aniq aytamiz.",
    ]
  }
  if (/(qo'y|qo'zi|echki)/i.test(b)) {
    return [
      `Sog'lom va parvarishlangan ${nameLc}. Chobonchilik va fermalar uchun mos; ulgurji yoki chakana. Holat va narx bo'yicha kelishamiz.`,
      "📞 Qo'ng'iroq qiling — surat yoki ko'rishni rejalashtiramiz.",
    ]
  }
  if (/(xo'roz|tovuq|bedana|cho'chqa|quyon)/i.test(b)) {
    return [
      `Sog'lom va parvarishlangan ${nameLc}. Fermalar va uy xo'jaligi uchun mos. Partiya bo'yicha ulgurji ham, dona bo'yicha ham. Narxi va yetkazib berish bo'yicha kelishamiz.`,
      "📞 Qo'ng'iroq qiling — miqdor va narxni gaplashamiz.",
    ]
  }
  if (/(sabzavot|meva|piyoz|sabzi|uzum|olma|bodring|pamidor)/i.test(b)) {
    return [
      `Yangi yig'ilgan, toza va sifatli ${nameLc}. Mahalliy yetishtirilgan; do'konlar, oshxonalar va uy uchun qulay. Ulgurji va chakana savdo bor. Narx va yetkazib berish bo'yicha kelishamiz.`,
      "📞 Qo'ng'iroq qiling — miqdor va narxni telefonda kelishamiz.",
    ]
  }
  if (/(asal|don|bug'doy|sholi|yog'|un|guruch|loviya)/i.test(b)) {
    return [
      `Sifatli ${nameLc}, saqlash sharoiti yaxshi. Partiya va miqdor bo'yicha kelishamiz; yetkazib berishni ham muhokama qilamiz.`,
      "📞 Hoziroq qo'ng'iroq qiling — partiya va narx bo'yicha gaplashamiz.",
    ]
  }
  if (/hayvon/i.test(b)) {
    return [
      `Sog'lom holatda, tafsilot va hujjatlar bo'yicha kelishamiz. Ko'rib chiqish va narxi bo'yicha muzokara qilamiz.`,
      "📞 Qo'ng'iroq qiling — tur va narxni aniq aytamiz.",
    ]
  }
  return [
    `Holati va miqdori yaxshi; narx va yetkazib berish bo'yicha muzokaraga ochiqmiz.`,
    "📞 Qo'ng'iroq qiling — batafsil ma'lumot beramiz.",
  ]
}

const openingLine = (intent, subcategoryName, title) => {
  const subject = title.trim() || subcategoryName
  if (intent === 'wanted') return `${subject} kerak!`
  if (intent === 'rent') return `${subject} ijaraga!`
  if (intent === 'service') {
    return /xizmat/i.test(subject) ? `${subject}!` : `${subject} xizmati!`
  }
  return `${subject} sotiladi!`
}

const createFallbackDescription = ({ categoryName, subcategoryName, title, commercial }) => {
  const intent = inferIntent(categoryName, subcategoryName, title)
  const ctx = commercial ? formatContextBlock(commercial) : ''

  if (intent === 'wanted') {
    const s = title.trim() || subcategoryName
    return [
      openingLine(intent, subcategoryName, title),
      ctx,
      `Agar taklif bo'lsa, tafsilot va narxni yozing. ${s} bo'yicha qidiruv davom etmoqda.`,
      "📞 Qo'ng'iroq qiling — shartlarni tezda kelishamiz.",
    ]
      .filter(Boolean)
      .join('\n')
  }
  if (intent === 'rent') {
    return [
      openingLine(intent, subcategoryName, title),
      ctx,
      `Muddat va shartlar bo'yicha muzokara qilamiz. Ko'rib chiqish mumkin.`,
      "📞 Qo'ng'iroq qiling — vaqt va narxni aniqlaymiz.",
    ]
      .filter(Boolean)
      .join('\n')
  }
  if (intent === 'service') {
    return [
      openingLine(intent, subcategoryName, title),
      ctx,
      `Tajriba va sifat kafolati. Vaqt va hudud bo'yicha kelishamiz; narxni obyektga qarab belgilaymiz.`,
      "📞 Qo'ng'iroq qiling — buyurtma va bahoni aniqlaymiz.",
    ]
      .filter(Boolean)
      .join('\n')
  }

  const body = saleBodyLines(categoryName, subcategoryName, title)
  return [openingLine(intent, subcategoryName, title), ctx, ...body].filter(Boolean).join('\n')
}

const sendFallbackDescription = (res, description, warning) =>
  res.status(200).json({
    description,
    source: 'fallback',
    warning,
  })

const buildPrompt = ({ categoryName, subcategoryName, title, commercial }) => {
  const titleLine = title ? `Sarlavha: ${title}` : 'Sarlavha: berilmagan'
  const intent = inferIntent(categoryName, subcategoryName, title)
  const intentHint =
    intent === 'wanted'
      ? "Bu e'lon sotuv emas — xaridor qidiruvi (kerak/olaman) bo'lishi mumkin. Birinchi qator va matn shunga mos bo'lsin."
      : intent === 'rent'
        ? "Bu ijara e'lon bo'lishi mumkin — 'ijaraga', muddat, ko'rish."
        : intent === 'service'
          ? "Bu xizmat e'lon — ish hajmi, hudud, vaqt; 'sotiladi' o'rniga xizmatga mos ibora."
          : "Bu sotuv e'lon — mahsulotning o'ziga xos jihatlari (hayvon/sabzavot/jihoz va hokazo) bo'yicha alohida yozing."

  const lines = [
    'Daladan marketplace uchun qisqa e\'lon tavsifi yozing. Har bir e\'lon o\'ziga xos bo\'lsin — bitta shablonni barcha mahsulotlarga qo\'llamang.',
    `Kategoriya: ${categoryName}`,
    `Subkategoriya: ${subcategoryName}`,
    titleLine,
  ]
  if (commercial) {
    lines.push('', buildCommercialPromptLines(commercial))
  }
  lines.push(
    '',
    `E'lon turi (taxminiy): ${intent}. ${intentHint}`,
    '',
    'Muhim:',
    '- Formadagi narx, birlik, yetkazib berish va joylashuvni tavsifda aniq qayd eting (narx forma bo\'sh bo\'lsa, "narx bo\'yicha kelishamiz" deb yozing).',
    '- Hayvon (tuya, xo\'roz, qo\'y, ...) uchun "do\'kon/oshxona" kabi noto\'g\'ri bog\'lanishlardan qoching; sabzavot/meva uchun esa yetishtirish va sotish shakli mos bo\'lsin.',
    '- Xizmat/ijara/qidiruvda "sotiladi" majburiy emas — vaziyatga mos sarlavha va gaplar.',
    '- Oxirgi qator: 📞 bilan qo\'ng\'iroqqa chaqiriq — narx yoki yetkazib berish bo\'yicha savol bo\'lsa, qo\'ng\'iroq qilishni urg\'ub qo\'ying. Faqat shu qatorda 📞 emoji.',
    '',
    'Qoidalar:',
    '- Faqat o\'zbek (lotin) tilida.',
    '- Markdown, hashtag, ro\'yxat belgilari (#, -, *) ishlatmang.',
    '- 4-8 qisqa gap; mantiqiy bloklarni yangi qator bilan ajrating.',
    '- Rasmiy katalog ("taqdim etiladi", "toifasida") uslubidan qoching.',
  )
  return lines.join('\n')
}

const toProviderError = (data) => {
  if (!data || typeof data !== 'object') return ''
  const source = data
  const nestedMessage = source.error && typeof source.error === 'object' ? toTrimmedString(source.error.message) : ''
  return nestedMessage || toTrimmedString(source.message)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: "Faqat POST so'rovi qo'llab-quvvatlanadi" })
  }

  const body = parseRequestBody(req.body)
  const categoryName = toTrimmedString(body.categoryName)
  const subcategoryName = toTrimmedString(body.subcategoryName)
  const title = toTrimmedString(body.title)
  const commercial = {
    priceText: toTrimmedString(body.priceText),
    unit: toTrimmedString(body.unit),
    deliveryAvailable: typeof body.deliveryAvailable === 'boolean' ? body.deliveryAvailable : undefined,
    regionName: toTrimmedString(body.regionName),
    districtName: toTrimmedString(body.districtName),
  }

  if (!categoryName || !subcategoryName) {
    return res.status(400).json({ error: 'Kategoriya va subkategoriya nomi majburiy' })
  }

  const fallbackDescription = createFallbackDescription({ categoryName, subcategoryName, title, commercial })
  const apiSecret = toTrimmedString(process.env.API_SECRET)
  if (!apiSecret) {
    return sendFallbackDescription(res, fallbackDescription, "AI xizmati sozlanmagan. API_SECRET topilmadi.")
  }

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiSecret}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        temperature: 0.9,
        max_tokens: 400,
        messages: [
          {
            role: 'system',
            content:
              "Siz Daladan e'lonlari uchun yozuvchisiz: sotuv, xizmat, ijara yoki qidiruv — kontekstga mos, har bir mahsulot uchun boshqa so'z tanlang (hayvon, o'simlik, texnika bir xil bo'lmasin). Oxirida qo'ng'iroqqa iqtibos qiling. O'zbek (lotin) tilida, tabiiy gapirish uslubida.",
          },
          {
            role: 'user',
            content: buildPrompt({ categoryName, subcategoryName, title, commercial }),
          },
        ],
      }),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      const providerError = toProviderError(data)
      return sendFallbackDescription(
        res,
        fallbackDescription,
        providerError || "AI tavsifni yaratib bo'lmadi. Vaqtincha namunaviy tavsif qaytarildi.",
      )
    }

    const rawContent =
      data &&
      typeof data === 'object' &&
      Array.isArray(data.choices) &&
      data.choices[0] &&
      data.choices[0].message &&
      typeof data.choices[0].message.content === 'string'
        ? data.choices[0].message.content
        : ''

    const generatedDescription = sanitizeDescription(toTrimmedString(rawContent))
    const description = generatedDescription.length >= 10 ? generatedDescription : fallbackDescription

    return res.status(200).json({ description, source: generatedDescription.length >= 10 ? 'ai' : 'fallback' })
  } catch (error) {
    const warning =
      error instanceof Error && error.message.trim()
        ? error.message
        : "AI xizmatiga ulanishda muammo bo'ldi. Vaqtincha namunaviy tavsif qaytarildi."
    return sendFallbackDescription(res, fallbackDescription, warning)
  }
}
