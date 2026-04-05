const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'
const DEEPSEEK_MODEL = 'deepseek-chat'

const toTrimmedString = (value) => (typeof value === 'string' ? value.trim() : '')

const parseRequestBody = (body) => {
  if (!body) return {}
  if (typeof body === 'string') {
    try {
      return JSON.parse(body)
    } catch {
      return {}
    }
  }
  if (typeof body === 'object') return body
  return {}
}

const sanitizeDescription = (value) =>
  value
    .replace(/^["'`]+|["'`]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim()

const createFallbackDescription = ({ categoryName, subcategoryName, title }) => {
  const titleSentence = title
    ? `${title} bo'yicha ${subcategoryName.toLowerCase()} taklifi ${categoryName.toLowerCase()} toifasida taqdim etiladi.`
    : `${subcategoryName} mahsuloti ${categoryName.toLowerCase()} toifasida taqdim etiladi.`

  return [
    titleSentence,
    "Mahsulot sifatiga e'tibor berilgan, kundalik ehtiyoj uchun qulay va amaliy tanlov hisoblanadi.",
    "Batafsil ma'lumot, miqdor hamda narx bo'yicha bog'lanib kelishib olishingiz mumkin.",
  ].join(' ')
}

const sendFallbackDescription = (res, description, warning) =>
  res.status(200).json({
    description,
    source: 'fallback',
    warning,
  })

const buildPrompt = ({ categoryName, subcategoryName, title }) => {
  const titleLine = title ? `Sarlavha: ${title}` : 'Sarlavha: berilmagan'
  return [
    'Daladan marketplace uchun sotuvga mo\'ljallangan tabiiy e\'lon tavsifi yozing.',
    `Kategoriya: ${categoryName}`,
    `Subkategoriya: ${subcategoryName}`,
    titleLine,
    '',
    'Qoidalar:',
    '- Faqat o\'zbek (lotin) tilida yozing.',
    '- 2-4 gapdan iborat bo\'lsin.',
    '- Matn inson yozgandek tabiiy va ishonchli bo\'lsin.',
    '- Emoji, markdown, ro\'yxat, hashtag ishlatmang.',
    '- Juda oshirib yuborilgan va\'dalardan saqlaning.',
  ].join('\n')
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

  if (!categoryName || !subcategoryName) {
    return res.status(400).json({ error: 'Kategoriya va subkategoriya nomi majburiy' })
  }

  const fallbackDescription = createFallbackDescription({ categoryName, subcategoryName, title })
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
        temperature: 0.8,
        max_tokens: 220,
        messages: [
          {
            role: 'system',
            content:
              "Siz tajribali marketplace copywritersiz. Har doim o'zbek (lotin) tilida, insoniy va ishonchli matn yozasiz.",
          },
          {
            role: 'user',
            content: buildPrompt({ categoryName, subcategoryName, title }),
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
