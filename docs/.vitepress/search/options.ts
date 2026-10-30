/**
 * 索引与检索的**共享**选项（04 §4）。
 *
 * 为什么单独一个文件：构建期（`scripts/build-search-index.ts`）、运行时（`theme/components/OjSearch.vue`）
 * 与测试（`test/search-index.test.ts`）三处必须逐字段一致。`MiniSearch.loadJSON` 只复原倒排表，
 * **不会**带出 `searchOptions`——三处各写一份的最后结果一定是"构建期算分一套、浏览器算分另一套"，
 * 症状是"文档里搜得到、页面上搜不到"，极难归因。
 *
 * 这里只有纯数据与纯函数，不 import `minisearch`，因此 node 侧与浏览器侧都能直接用。
 */

export const SEARCH_FIELDS = ['title', 'headings', 'text'] as const

export const STORE_FIELDS = ['title', 'path', 'group', 'headings'] as const

/**
 * 标题/小节命中时抬分。
 *
 * 不加这条的实测症状：搜 `Ribbon` 时"指南"页排第一——指南页文档短，正常化后分数虚高，
 * 而真正的 `OjRibbon` 页标题里只有 `OjRibbon`（分词后含 `ribbon`），落在后面。
 *
 * 单字 token（"组"、"表"）不抬分：bigram 会给每个汉字都建一条，抬分等于把噪声一起放大。
 */
export function boostDocument(
  _id: unknown,
  term: string,
  stored: Record<string, unknown> | undefined,
): number {
  if (term.length < 2) return 1
  const title = typeof stored?.title === 'string' ? stored.title.toLowerCase() : ''
  const headings = typeof stored?.headings === 'string' ? stored.headings.toLowerCase() : ''
  if (title.includes(term)) return 4
  if (headings.includes(term)) return 2
  return 1
}

export const SEARCH_OPTIONS = {
  boost: { title: 4, headings: 2 },
  prefix: true,
  fuzzy: 0.15,
  boostDocument,
}
