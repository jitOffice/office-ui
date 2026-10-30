<script setup lang="ts">
/**
 * 文档站搜索（04 §4）。
 *
 * 为什么不用 VitePress 自带的 `VPLocalSearchBox`：它的索引在构建期用**默认分词**建好，
 * `themeConfig` 里放不进函数（JSON 序列化会丢），所以中文按空格切，搜"表格"命中不了
 * "表格选择器"。这里自己 `MiniSearch.loadJSON` 复原构建期用 `tokenizeCJK` 建的索引
 * （`scripts/build-search-index.ts`），分词规则与索引侧完全一致。
 *
 * 两条性能约束，决定了这里的写法：
 *   1. `minisearch` 与索引都用**动态 import / fetch**，首屏不为搜索付一个字节；
 *   2. 结果只渲染 `title / group / headings`，正文不进 storeFields（见构建脚本）。
 *
 * 覆盖方式：`theme/index.ts` 里 `app.component('VPNavBarSearch', OjSearch)`。
 * 用户主题的 `enhanceApp` 在默认主题之后执行，同名注册会覆盖内置的那个。
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData, useRouter } from 'vitepress'
import type MiniSearch from 'minisearch'

import { SEARCH_FIELDS, SEARCH_OPTIONS, STORE_FIELDS } from '../../search/options.ts'
import { tokenizeCJK } from '../../search/tokenize.ts'

interface Hit {
  title: string
  path: string
  group: string
  headings: string
}

const { site } = useData()
const router = useRouter()

const open = ref(false)
const query = ref('')
const results = ref<Hit[]>([])
const active = ref(0)
const status = ref<'idle' | 'loading' | 'ready' | 'failed'>('idle')
const input = ref<HTMLInputElement | null>(null)

let searcher: Promise<MiniSearch<Hit>> | null = null

/** 打开时才加载 `minisearch` + 索引：首屏（含没点搜索的每次访问）不该付这份体积。 */
function ensureSearcher(): Promise<MiniSearch<Hit>> {
  searcher ??= (async () => {
    const base = site.value.base.replace(/\/+$/, '')
    const [{ default: MiniSearch }, response] = await Promise.all([
      import('minisearch'),
      fetch(`${base}/search/index.json`),
    ])
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
    const parsed = (await response.json()) as { index: Record<string, unknown> }
    // 字段与分词必须与构建期逐字一致，否则"构建期搜得到、页面上搜不到"
    return MiniSearch.loadJSON<Hit>(JSON.stringify(parsed.index), {
      fields: [...SEARCH_FIELDS],
      storeFields: [...STORE_FIELDS],
      tokenize: tokenizeCJK,
    })
  })()
  return searcher
}

/**
 * 按分组聚合（PRD 要求结果分组呈现）。组**不按固定顺序**排——组间顺序取"该组最高分结果"
 * 在结果里的位置，也就是 Map 的插入顺序。固定顺序的实测症状：搜 `Ribbon` 时"指南"组永远
 * 排第一，真正的 Ribbon 页被压到第三屏才开始。
 */
const groups = computed(() => {
  const buckets = new Map<string, Hit[]>()
  for (const hit of results.value) {
    const list = buckets.get(hit.group) ?? []
    list.push(hit)
    buckets.set(hit.group, list)
  }
  return [...buckets.entries()]
})

/** 扁平化只为了 ↑↓ 顺序与渲染顺序一致：先按组，组内按分数。 */
const flat = computed(() =>
  groups.value.flatMap(([group, items]) =>
    items.map((item, index) => ({ ...item, group, showGroup: index === 0 })),
  ),
)

watch(query, async (value) => {
  active.value = 0
  const term = value.trim()
  if (term.length === 0) {
    results.value = []
    status.value = 'idle'
    return
  }
  try {
    const search = await ensureSearcher()
    results.value = search.search(term, SEARCH_OPTIONS).slice(0, 20) as unknown as Hit[]
    status.value = 'ready'
  } catch {
    // 索引拉不到时明确说"搜索不可用"，而不是伪装成"没有结果"
    status.value = 'failed'
    results.value = []
  }
})

/** 高亮用**原始子串**而不是分词结果：bigram 会把"表格"拆成单字，逐字上色看起来很碎。 */
function segments(text: string): { text: string; hit: boolean }[] {
  const term = query.value.trim()
  if (term.length === 0) return [{ text, hit: false }]
  const needles = [...new Set([term, ...term.split(/\s+/)])].filter(Boolean)
  const escaped = needles
    .sort((a, b) => b.length - a.length)
    .map((needle) => needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const pattern = new RegExp(`(${escaped.join('|')})`, 'gi')
  // `split` 带捕获组时，奇数下标一定是命中段——不要靠"文本等于查询词"反推，
  // 那样正文里本来就有相同字样却未被正则切中的情况会漏色
  const parts = text.split(pattern)
  const out: { text: string; hit: boolean }[] = []
  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index] as string
    if (part.length === 0) continue
    out.push({ text: part, hit: index % 2 === 1 })
  }
  return out
}

/**
 * 结果行给一行"命在哪"：只显示**含查询词**的小节名。
 *
 * 不要退化成"显示第一个小节名"——实测搜"表格"时三条结果的提示分别是
 * `ESM（推荐）`／`命令与工具栏`／`何时使用`，与命中毫无关系，比不显示更误导。
 * 正文片段要另存全文（索引翻倍），本轮不做，见 05 第十三轮的已知降级。
 */
function hintOf(hit: Hit): string {
  const term = query.value.trim().toLowerCase()
  if (term.length === 0) return ''
  return (
    hit.headings
      .split(' ')
      .filter(Boolean)
      .find((heading) => heading.toLowerCase().includes(term)) ?? ''
  )
}

const panel = ref<HTMLElement | null>(null)

async function show(): Promise<void> {
  open.value = true
  document.body.style.overflow = 'hidden'
  await nextTick()
  input.value?.focus()
  void ensureSearcher().then(
    () => {
      if (status.value === 'idle') status.value = 'ready'
    },
    () => {
      status.value = 'failed'
    },
  )
}

function hide(): void {
  open.value = false
  document.body.style.overflow = ''
}

function go(hit: Hit): void {
  hide()
  query.value = ''
  void router.go(hit.path)
}

function move(step: number): void {
  const total = flat.value.length
  if (total === 0) return
  active.value = (active.value + step + total) % total
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    hide()
    return
  }
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    move(event.key === 'ArrowDown' ? 1 : -1)
    return
  }
  if (event.key === 'Enter') {
    const hit = flat.value[active.value]
    if (hit) {
      event.preventDefault()
      go(hit)
    }
  }
}

/** `Ctrl+K` / `⌘K` 与 `/` 唤起（PRD 要求两种）；输入框内按 `/` 不算快捷键。 */
function onGlobalKeydown(event: KeyboardEvent): void {
  const target = event.target as HTMLElement | null
  const editing =
    target !== null &&
    (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    open.value ? hide() : void show()
    return
  }
  if (event.key === '/' && !editing && !open.value) {
    event.preventDefault()
    void show()
  }
}

// 选中项可能滚出面板可视区（20 条结果放不下）
watch(active, async () => {
  await nextTick()
  panel.value?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
})

onMounted(() => window.addEventListener('keydown', onGlobalKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onGlobalKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <button class="oj-search-trigger" type="button" aria-label="搜索文档" @click="show">
    <svg class="oj-search-trigger__icon" viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" stroke-width="1.6" />
      <path d="m13 13 4 4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
    </svg>
    <span class="oj-search-trigger__text">搜索文档</span>
    <kbd class="oj-search-trigger__kbd">Ctrl K</kbd>
  </button>

  <Teleport to="body">
    <div v-if="open" class="oj-search" data-oj-search @click.self="hide">
      <div
        ref="panel"
        class="oj-search__panel"
        role="dialog"
        aria-modal="true"
        aria-label="搜索文档"
      >
        <input
          ref="input"
          v-model="query"
          class="oj-search__input"
          type="text"
          role="combobox"
          aria-expanded="true"
          placeholder="搜索组件、命令、Token…（中文按词切分）"
          autocomplete="off"
          spellcheck="false"
          @keydown="onKeydown"
        />

        <ul v-if="flat.length > 0" class="oj-search__results">
          <li
            v-for="(hit, index) in flat"
            :key="hit.path"
            :data-active="index === active"
            class="oj-search__item"
            :class="{ 'is-active': index === active }"
            @mouseenter="active = index"
            @click="go(hit)"
          >
            <p v-if="hit.showGroup" class="oj-search__group">{{ hit.group }}</p>
            <p class="oj-search__title">
              <template v-for="(part, partIndex) in segments(hit.title)" :key="partIndex">
                <mark v-if="part.hit">{{ part.text }}</mark>
                <template v-else>{{ part.text }}</template>
              </template>
            </p>
            <p v-if="hintOf(hit)" class="oj-search__hint">
              <template v-for="(part, partIndex) in segments(hintOf(hit))" :key="partIndex">
                <mark v-if="part.hit">{{ part.text }}</mark>
                <template v-else>{{ part.text }}</template>
              </template>
            </p>
          </li>
        </ul>

        <p v-else-if="status === 'failed'" class="oj-search__empty">
          搜索索引加载失败（内网部署请确认 <code>search/index.json</code> 已随站点发布）
        </p>
        <p v-else-if="status === 'ready' && query.trim().length > 0" class="oj-search__empty">
          没有找到结果
        </p>
        <p v-else class="oj-search__empty">输入关键词开始搜索</p>

        <footer class="oj-search__footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> 切换</span>
          <span><kbd>Enter</kbd> 打开</span>
          <span><kbd>Esc</kbd> 关闭</span>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.oj-search-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-2);
  font-size: 13px;
  cursor: pointer;
}

.oj-search-trigger:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-text-1);
}

.oj-search-trigger__icon {
  width: 16px;
  height: 16px;
}

.oj-search-trigger__kbd {
  padding: 1px 5px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  font-size: 11px;
  font-family: var(--oj-font-mono-cjk, ui-monospace, monospace);
}

/* 窄屏只留图标：导航栏放不下「搜索文档 + Ctrl K」 */
@media (max-width: 767px) {
  .oj-search-trigger__text,
  .oj-search-trigger__kbd {
    display: none;
  }
}

.oj-search {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  justify-content: center;
  padding-top: 12vh;
  /* 遮罩与浮层直接用 token：VitePress 没有 backdrop 变量，写死 rgba 就会在暗色下偏亮 */
  background: var(--oj-bg-mask);
}

.oj-search__panel {
  display: flex;
  flex-direction: column;
  width: min(640px, calc(100vw - 32px));
  max-height: 70vh;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--oj-bg-elevated);
  box-shadow: 0 12px 32px rgb(0 0 0 / 22%);
  overflow: hidden;
}

.oj-search__input {
  /* 显式高度：`input` 的默认高度由字体行盒决定，只给 padding 时在 flex 列里会被压成一条 */
  box-sizing: border-box;
  height: 52px;
  padding: 0 16px;
  border: 0;
  border-bottom: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-1);
  font-size: 15px;
  outline: none;
}

.oj-search__input::placeholder {
  color: var(--vp-c-text-3);
}

.oj-search__results {
  /* `flex: 1` + `min-height: 0` 才能让长结果列表在 `max-height: 70vh` 内滚动，
     否则 flex 子项按内容撑开、把面板顶出视口 */
  flex: 1;
  min-height: 0;
  margin: 0;
  padding: 6px;
  list-style: none;
  overflow-y: auto;
}

.oj-search__item {
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
}

.oj-search__item.is-active {
  background: var(--vp-c-bg-soft);
}

.oj-search__group {
  margin: 8px 0 4px;
  color: var(--vp-c-text-3);
  font-size: 11px;
  letter-spacing: 0.04em;
}

.oj-search__title {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 14px;
  font-weight: 500;
}

.oj-search__hint {
  margin: 2px 0 0;
  color: var(--vp-c-text-2);
  font-size: 12px;
}

.oj-search__results mark {
  background: transparent;
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.oj-search__empty {
  margin: 0;
  padding: 18px 16px;
  color: var(--vp-c-text-3);
  font-size: 13px;
}

.oj-search__footer {
  display: flex;
  gap: 14px;
  padding: 8px 16px;
  border-top: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-3);
  font-size: 12px;
}

.oj-search__footer kbd {
  padding: 1px 4px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  font-size: 11px;
}
</style>
