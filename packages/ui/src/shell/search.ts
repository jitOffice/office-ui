/** 查找替换。命中按原文下标返回，替换不改命中以外的字符。 */

export interface SearchQuery {
  find: string
  replace: string
  matchCase: boolean
}

export interface SearchHit {
  start: number
  end: number
}

export function searchHits(text: string, query: SearchQuery): SearchHit[] {
  if (query.find.length === 0) return []
  const source = query.matchCase ? text : text.toLowerCase()
  const needle = query.matchCase ? query.find : query.find.toLowerCase()
  const hits: SearchHit[] = []
  let from = 0
  while (from <= source.length) {
    const at = source.indexOf(needle, from)
    if (at < 0) break
    hits.push({ start: at, end: at + needle.length })
    from = at + Math.max(needle.length, 1)
  }
  return hits
}

export function replaceOne(text: string, hit: SearchHit, replacement: string): string {
  return text.slice(0, hit.start) + replacement + text.slice(hit.end)
}

export function replaceAll(text: string, query: SearchQuery): { text: string; count: number } {
  const hits = searchHits(text, query)
  let out = ''
  let cursor = 0
  for (const hit of hits) {
    out += text.slice(cursor, hit.start) + query.replace
    cursor = hit.end
  }
  return { text: out + text.slice(cursor), count: hits.length }
}

/** 没有命中时返回 -1。 */
export function neighbor(index: number, count: number, direction: 1 | -1): number {
  if (count <= 0) return -1
  const start = index < 0 ? (direction > 0 ? -1 : 0) : index
  return (start + direction + count) % count
}
