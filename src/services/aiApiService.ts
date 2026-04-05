import type { AIService, GenerateAdDescriptionRequest } from './contracts'

const parseResponseData = async (response: Response) => {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text) as unknown
  } catch {
    return text
  }
}

const toTrimmedString = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

const toErrorMessage = (status: number, data: unknown) => {
  if (typeof data === 'string' && data.trim()) return data

  if (data && typeof data === 'object') {
    const maybeData = data as { error?: unknown; message?: unknown }
    const nestedError = toTrimmedString(maybeData.error)
    if (nestedError) return nestedError
    const nestedMessage = toTrimmedString(maybeData.message)
    if (nestedMessage) return nestedMessage
  }

  if (status === 400) return 'Kategoriya va subkategoriyani tanlang'
  if (status === 404) return "AI endpoint topilmadi. Lokal muhitda `yarn dev` ni qayta ishga tushiring."
  return "AI tavsifni yaratib bo'lmadi"
}

const toDescription = (data: unknown) => {
  if (!data || typeof data !== 'object') return ''
  const payload = data as { description?: unknown }
  return toTrimmedString(payload.description)
}

export const aiApiService: AIService = {
  async generateAdDescription(payload: GenerateAdDescriptionRequest) {
    try {
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await parseResponseData(response)
      const description = toDescription(data)

      if (!response.ok && !description) {
        throw new Error(toErrorMessage(response.status, data))
      }

      if (!description) {
        throw new Error("AI bo'sh tavsif qaytardi. Qayta urinib ko'ring.")
      }

      return description
    } catch (error) {
      if (error instanceof Error) throw error
      throw new Error("AI xizmati bilan ulanishda xatolik yuz berdi")
    }
  },
}
