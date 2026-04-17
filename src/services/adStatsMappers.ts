import type { AdStats } from '../types/marketplace'
import { asRecord, getNumber, isNonEmptyRecord, type UnknownRecord } from './apiMappers'

/** Resolves `data`, `stats`, or root object from typical API envelopes. */
export const extractStatsRecord = (payload: unknown): UnknownRecord => {
  const root = asRecord(payload)
  const data = asRecord(root.data)
  if (isNonEmptyRecord(data)) return data
  const stats = asRecord(root.stats)
  if (isNonEmptyRecord(stats)) return stats
  return root
}

export const mapAdStats = (item: UnknownRecord): AdStats => ({
  viewsCount: getNumber(item, 'views_count', 'viewsCount', 'views', 'view_count'),
  favoritesCount: getNumber(
    item,
    'favorites_count',
    'favoritesCount',
    'saved_count',
    'saves_count',
    'favorites',
  ),
  messagesCount: getNumber(item, 'messages_count', 'messagesCount', 'chats_count', 'chats'),
  phoneRevealsCount: getNumber(
    item,
    'phone_reveals_count',
    'phoneRevealsCount',
    'phone_clicks',
    'contact_clicks',
  ),
})
