import { createApp, defineComponent, h, ref } from 'vue'

import { createI18n } from '../../i18n/src/index.ts'
import enUS from '../../i18n/src/locales/en-US.ts'
import jaJP from '../../i18n/src/locales/ja-JP.ts'
import zhCN from '../../i18n/src/locales/zh-CN.ts'
import zhTW from '../../i18n/src/locales/zh-TW.ts'
import { createCommandRegistry } from '../../shared/src/commands/index.ts'
import '../../tokens/dist/index.css'
import {
  COMMAND_ALIGN_LEFT,
  COMMAND_BLOCKQUOTE,
  COMMAND_BOLD,
  COMMAND_BULLET_LIST,
  COMMAND_CODE_BLOCK,
  COMMAND_HEADING,
  COMMAND_HORIZONTAL_RULE,
  COMMAND_ITALIC,
  COMMAND_ORDERED_LIST,
  COMMAND_TABLE,
  COMMAND_UNDERLINE,
  blockPlain,
  createDocument,
  createMemoryEditor,
  editorCommands,
  filterTree,
  isTableSize,
  isTextblockType,
  neighbor,
  pageWidth,
  plainText,
  registerEditorCommands,
  replaceAll,
  replaceOne,
  searchHits,
  setHorizontalRule,
  toggleBlockquote,
  toggleBulletList,
  toggleCodeBlock,
  toggleHeading,
  toggleOrderedList,
  toggleId,
  withPlain,
} from '../src/index.ts'
import type { FileNode, GridCell, OjDocument, OjEditorHost, OjNode, SearchHit } from '../src/index.ts'
import {
  OjAiPanel,
  OjCodeBlock,
  OjCommandButton,
  OjContextMenu,
  OjDialog,
  OjDropdown,
  OjFileTree,
  OjHotkey,
  OjLocaleProvider,
  OjLocaleSwitcher,
  OjRibbon,
  OjRibbonGroup,
  OjRuler,
  OjSearchReplaceBar,
  OjSignaturePad,
  OjStamp,
  OjTableGridPicker,
  OjTooltip,
  OjWatermark,
  OjZoomControl,
  useLocale,
} from '../src/vue/index.ts'
import type { OjAiMessage } from '../src/vue/index.ts'
import '../src/style.css'

const i18n = createI18n({ locale: zhCN, locales: [zhCN, zhTW, jaJP, enUS], dev: true })
const editor = createMemoryEditor()
const registry = createCommandRegistry<OjEditorHost>({
  context: () => editor.host,
  resolve: (message) => i18n.resolve(message),
  schedule: (task) => {
    requestAnimationFrame(task)
  },
})
registerEditorCommands(registry)
registry.bind(editor.host)

const FILES: readonly FileNode[] = [
  {
    id: 'docs',
    name: '文档',
    kind: 'folder',
    children: [
      { id: 'prd', name: '产品说明', kind: 'file' },
      { id: 'notes', name: '会议记录', kind: 'file' },
    ],
  },
  {
    id: 'sheets',
    name: '表格',
    kind: 'folder',
    children: [{ id: 'budget', name: '预算', kind: 'file' }],
  },
]

const CODE = 'const page = "office shell"\npage.includes("内核") // false'

/** 命令表里写了 `keys` 的那几条直接变成真实快捷键——`mod` 的展开交给 OjHotkey */
const HOTKEYS = editorCommands().flatMap((command) =>
  command.keys === undefined ? [] : [{ id: command.id, keys: command.keys }],
)

const SAMPLE = '这一页是办公外壳，不是文档内核。查找会标出「外壳」。'

function highlight(text: string, hits: readonly SearchHit[], current: number) {
  const nodes: Array<string | ReturnType<typeof h>> = []
  let cursor = 0
  hits.forEach((hit, index) => {
    if (hit.start > cursor) nodes.push(text.slice(cursor, hit.start))
    nodes.push(
      h(
        'mark',
        { 'data-current': index === current ? '' : undefined },
        text.slice(hit.start, hit.end),
      ),
    )
    cursor = hit.end
  })
  if (cursor < text.length) nodes.push(text.slice(cursor))
  return nodes
}

function highlightedText(node: OjNode, hits: readonly SearchHit[], current: number, cursor: { n: number }) {
  const text = blockPlain(node)
  const start = cursor.n
  const end = start + text.length
  const local: SearchHit[] = []
  let localCurrent = -1
  hits.forEach((hit, hitIndex) => {
    if (hit.end <= start || hit.start >= end) return
    if (hitIndex === current) localCurrent = local.length
    local.push({
      start: Math.max(hit.start, start) - start,
      end: Math.min(hit.end, end) - start,
    })
  })
  cursor.n = end + 1
  return text.length === 0 ? '\u00a0' : highlight(text, local, localCurrent)
}

function renderNode(node: OjNode, key: string, hits: readonly SearchHit[], current: number, cursor: { n: number }): ReturnType<typeof h> | string {
  if (node.type === 'text') return node.text ?? ''
  if (node.type === 'hardBreak') return h('br', { key })
  if (node.type === 'horizontalRule') return h('hr', { class: String(node.attrs?.class ?? 'oj-hr'), key })
  const children = () => (node.content ?? []).map((child, index) => renderNode(child, `${key}-${index}`, hits, current, cursor))
  if (node.type === 'bulletList') return h('ul', { key }, children())
  if (node.type === 'orderedList') return h('ol', { key }, children())
  if (node.type === 'listItem') return h('li', { key }, children())
  if (node.type === 'blockquote') return h('blockquote', { key }, children())
  if (node.type === 'codeBlock') return h('pre', { class: 'oj-code', key }, highlightedText(node, hits, current, cursor))
  if (node.type === 'heading') {
    const level = Number(node.attrs?.level ?? 1)
    const tag = level >= 1 && level <= 6 ? `h${level}` : 'p'
    return h(tag, { class: 'oj-paper__text', key }, highlightedText(node, hits, current, cursor))
  }
  if (isTextblockType(node.type)) return h('p', { class: 'oj-paper__text', key }, highlightedText(node, hits, current, cursor))
  return h('div', { key }, children())
}

function renderBlocks(doc: OjDocument, hits: readonly SearchHit[], current: number) {
  const cursor = { n: 0 }
  return (doc.doc.content ?? []).map((node, index) => renderNode(node, String(index), hits, current, cursor))
}

const Demo = defineComponent({
  name: 'OfficeShell',
  setup() {
    const tab = ref('start')
    const gridOpen = ref(false)
    const tableOpen = ref(false)
    const signatureOpen = ref(false)
    const rows = ref('3')
    const cols = ref('4')
    const find = ref('外壳')
    const replace = ref('界面')
    const matchCase = ref(false)
    const hitIndex = ref(0)
    const doc = ref<OjDocument>(createDocument(SAMPLE))
    const zoom = ref(100)
    const fileQuery = ref('')
    const openIds = ref<string[]>(['docs'])
    const selectedId = ref('prd')
    const watermark = ref(true)
    const stamped = ref(false)
    const messages = ref<OjAiMessage[]>([])
    const status = ref(i18n.t('oj.shell.status.kernel'))
    const log = ref<string[]>([])
    const locale = useLocale()
    const menuOpen = ref(false)
    const menuPoint = ref({ x: 0, y: 0 })

    const source = {
      get: (id: string) => registry.get(id),
      state: (id: string) => registry.state(id),
      resolve: (message: string | { key: string }) => registry.resolve(message),
      subscribe: (id: string, listener: (state: { enabled?: boolean; active?: boolean }) => void) =>
        registry.subscribe(id, listener),
      run: async (id: string) => {
        await run(id)
      },
    }

    async function run(id: string, arg?: unknown): Promise<void> {
      const result = await registry.run(id, arg)
      const mark = result.ok ? 'ok' : (result.skipped ?? 'error')
      log.value = [...log.value, `${id} ${JSON.stringify(arg ?? null)} ${mark}`]
      if (result.ok && id === COMMAND_HORIZONTAL_RULE) {
        doc.value = setHorizontalRule(doc.value, { HTMLAttributes: { class: 'oj-hr' } })
      }
      if (result.ok && id === COMMAND_HEADING) doc.value = toggleHeading(doc.value, 1)
      if (result.ok && id === COMMAND_BLOCKQUOTE) doc.value = toggleBlockquote(doc.value)
      if (result.ok && id === COMMAND_BULLET_LIST) doc.value = toggleBulletList(doc.value)
      if (result.ok && id === COMMAND_ORDERED_LIST) doc.value = toggleOrderedList(doc.value)
      if (result.ok && id === COMMAND_CODE_BLOCK) doc.value = toggleCodeBlock(doc.value)
      if (result.ok && (id === COMMAND_TABLE || id === COMMAND_HORIZONTAL_RULE)) gridOpen.value = false
    }

    function confirmTable(): void {
      const size = { rows: Number(rows.value), cols: Number(cols.value) }
      if (!isTableSize(size)) {
        status.value = i18n.t('oj.validation.numberOnly')
        return
      }
      tableOpen.value = false
      void run(COMMAND_TABLE, size)
    }

    function ribbonTabs() {
      return [
        { id: 'start', label: i18n.t('oj.shell.tabs.start'), keyTip: 'H' },
        { id: 'insert', label: i18n.t('oj.shell.tabs.insert'), keyTip: 'N' },
        { id: 'view', label: i18n.t('oj.shell.tabs.view'), keyTip: 'W' },
      ]
    }

    /** 一条命令按钮：尺寸由 `OjRibbonGroup` 降级后喂回来（`item.display`） */
    function ribbonCommand(id: string, display: string) {
      return h(OjTooltip, { label: i18n.t(`oj.command.${id.split('.')[1]}` as 'oj.command.bold') }, () =>
        h(OjCommandButton, { source, id, size: display === 'large' ? 'medium' : 'mini' }),
      )
    }

    /** 不给宽度：`OjRibbonGroup` 自己逐档量，量完再决定降级还是溢出 */
    function ribbonGroup(ids: string[], size: 'large' | 'medium' = 'large') {
      return h(
        OjRibbonGroup,
        { items: ids.map((id) => ({ id, size })) },
        {
          item: ({ item }: { item: { id: string; display: string } }) => ribbonCommand(item.id, item.display),
        },
      )
    }

    return () => {
      // demo 的文案都直接读 `i18n.t()`（不是发布面，没必要逐个改成 `useLocale().t()`），
      // 所以在渲染时读一次 `lang` 建立依赖：否则切语言只换了 `html[lang]`，整页文字停在旧语言。
      void locale.lang.value
      const query = { find: find.value, replace: replace.value, matchCase: matchCase.value }
      const text = plainText(doc.value)
      const hits = searchHits(text, query)
      const current = hits.length === 0 ? -1 : Math.min(hitIndex.value, hits.length - 1)
      const visibleFiles = filterTree(FILES, fileQuery.value)
      const shownOpen = fileQuery.value.trim().length > 0 ? folderIds(visibleFiles) : openIds.value
      const width = pageWidth(zoom.value)
      const paperHeight = Math.round(480 * (zoom.value / 100))
      const selected = findFile(FILES, selectedId.value)

      return h('div', { class: 'oj-shell' }, [
        h('header', { class: 'oj-shell__bar' }, [
          h('h1', { class: 'oj-shell__title', id: 'doc-title' }, selected?.name ?? i18n.t('oj.shell.paper.untitled')),
        ]),
        h(OjRibbon, {
          items: ribbonTabs(),
          modelValue: tab.value,
          'onUpdate:modelValue': (next: string) => {
            tab.value = next
          },
        }, {
          default: () => h('div', { class: 'oj-shell__toolbar', id: 'toolbar' }, [
          tab.value === 'start'
            ? [
                ribbonGroup([COMMAND_BOLD, COMMAND_ITALIC, COMMAND_UNDERLINE]),
                ribbonGroup([COMMAND_ALIGN_LEFT, COMMAND_HEADING, COMMAND_BLOCKQUOTE], 'medium'),
                ribbonGroup([COMMAND_BULLET_LIST, COMMAND_ORDERED_LIST, COMMAND_CODE_BLOCK], 'medium'),
                h(OjSearchReplaceBar, {
                  find: find.value,
                  replace: replace.value,
                  matchCase: matchCase.value,
                  current,
                  total: hits.length,
                  findLabel: i18n.t('oj.shell.search.find'),
                  replaceLabel: i18n.t('oj.shell.search.replace'),
                  nextLabel: i18n.t('oj.shell.search.next'),
                  previousLabel: i18n.t('oj.shell.search.previous'),
                  matchCaseLabel: i18n.t('oj.shell.search.matchCase'),
                  countLabel: i18n.t('oj.shell.search.count', {
                    current: current < 0 ? 0 : current + 1,
                    total: hits.length,
                  }),
                  replaceActionLabel: i18n.t('oj.shell.search.replaceAction'),
                  replaceAllLabel: i18n.t('oj.shell.search.replaceAll'),
                  'onUpdate:find': (value: string) => {
                    find.value = value
                    hitIndex.value = 0
                  },
                  'onUpdate:replace': (value: string) => {
                    replace.value = value
                  },
                  'onUpdate:matchCase': (value: boolean) => {
                    matchCase.value = value
                    hitIndex.value = 0
                  },
                  onNext: () => {
                    hitIndex.value = neighbor(current, hits.length, 1)
                  },
                  onPrevious: () => {
                    hitIndex.value = neighbor(current, hits.length, -1)
                  },
                  onReplace: () => {
                    const hit = hits[current]
                    if (!hit) return
                    doc.value = withPlain(doc.value, replaceOne(text, hit, replace.value))
                  },
                  onReplaceAll: () => {
                    const next = replaceAll(text, query)
                    doc.value = withPlain(doc.value, next.text)
                    hitIndex.value = 0
                    status.value = `${next.count}`
                  },
                }),
              ]
            : null,
          tab.value === 'insert'
            ? [
                h(
                  OjDropdown,
                  {
                    open: gridOpen.value,
                    'onUpdate:open': (next: boolean) => {
                      gridOpen.value = next
                    },
                  },
                  {
                    trigger: () =>
                      h(
                        'button',
                        { type: 'button', class: 'oj-button', 'data-size': 'mini', id: 'insert-table' },
                        i18n.t('oj.command.insertTable'),
                      ),
                    default: () =>
                      h(OjTableGridPicker, {
                        format: (cell: GridCell) => i18n.t('oj.tableGridPicker.size', { rows: cell.row, cols: cell.col }),
                        detailLabel: i18n.t('oj.tableGridPicker.insertDialog'),
                        exceedLabel: i18n.t('oj.tableGridPicker.exceedMax', { max: '10 × 20' }),
                        onSelect: (cell: GridCell) => {
                          void run(COMMAND_TABLE, { rows: cell.row, cols: cell.col })
                        },
                        onDetail: () => {
                          gridOpen.value = false
                          tableOpen.value = true
                        },
                      }),
                  },
                ),
                h(OjCommandButton, { source, id: COMMAND_HORIZONTAL_RULE, size: 'mini' }),
                h(
                  'button',
                  {
                    type: 'button',
                    class: 'oj-button',
                    'data-size': 'mini',
                    id: 'insert-image',
                    onClick: () => {
                      status.value = i18n.t('oj.shell.status.kernel')
                    },
                  },
                  i18n.t('oj.shell.insert.image'),
                ),
              ]
            : null,
          tab.value === 'view'
            ? [
                h(
                  'button',
                  {
                    type: 'button',
                    class: 'oj-button',
                    'data-size': 'mini',
                    'data-active': watermark.value ? '' : undefined,
                    id: 'toggle-watermark',
                    onClick: () => {
                      watermark.value = !watermark.value
                    },
                  },
                  i18n.t('oj.shell.watermark.toggle'),
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    class: 'oj-button',
                    'data-size': 'mini',
                    id: 'open-signature',
                    onClick: () => {
                      signatureOpen.value = true
                    },
                  },
                  i18n.t('oj.shell.signature.open'),
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    class: 'oj-button',
                    'data-size': 'mini',
                    'data-active': stamped.value ? '' : undefined,
                    id: 'toggle-stamp',
                    onClick: () => {
                      stamped.value = !stamped.value
                    },
                  },
                  i18n.t('oj.shell.stamp.open'),
                ),
              ]
            : null,
          ]),
        }),
        h('div', { class: 'oj-shell__body' }, [
          h('aside', { class: 'oj-files-pane', 'aria-label': i18n.t('oj.shell.files.title') }, [
            h('input', {
              id: 'file-search',
              class: 'oj-files-pane__search',
              placeholder: i18n.t('oj.shell.files.search'),
              value: fileQuery.value,
              onInput: (event: Event) => {
                fileQuery.value = (event.target as HTMLInputElement).value
              },
            }),
            h(OjFileTree, {
              nodes: visibleFiles,
              openIds: shownOpen,
              selectedId: selectedId.value,
              emptyLabel: i18n.t('oj.shell.files.empty'),
              onToggle: (id: string) => {
                openIds.value = toggleId(openIds.value, id)
              },
              onSelect: (id: string) => {
                selectedId.value = id
              },
            }),
          ]),
          h('section', { class: 'oj-stage' }, [
            h('div', { class: 'oj-stage__sheet' }, [
              h('div'),
              h(OjRuler, { length: width, zoom: zoom.value }),
              h(OjRuler, { length: paperHeight, zoom: zoom.value, orientation: 'vertical' }),
              h(
                'article',
                {
                  class: 'oj-paper',
                  id: 'paper',
                  style: { width: `${width}px`, minHeight: `${paperHeight}px` },
                  // canvas 式用法：锚点只有坐标，没有元素（`OjContextMenu` 的 `x/y` 就是 clientX/clientY）
                  onContextmenu: (event: MouseEvent) => {
                    event.preventDefault()
                    menuPoint.value = { x: event.clientX, y: event.clientY }
                    menuOpen.value = true
                  },
                },
                [
                  h(OjWatermark, { text: i18n.t('oj.shell.watermark.sample'), visible: watermark.value }, () => [
                    ...renderBlocks(doc.value, hits, current),
                    h(OjCodeBlock, { language: 'ts', code: CODE }),
                    stamped.value ? h(OjStamp, { text: i18n.t('oj.shell.stamp.sample') }) : null,
                  ]),
                ],
              ),
            ]),
          ]),
          h(OjAiPanel, {
            title: i18n.t('oj.shell.ai.title'),
            placeholder: i18n.t('oj.shell.ai.placeholder'),
            sendLabel: i18n.t('oj.shell.ai.send'),
            notice: i18n.t('oj.shell.ai.notice'),
            messages: messages.value,
            onSubmit: (text: string) => {
              messages.value = [...messages.value, { role: 'user', text }]
            },
          }),
        ]),
        h('footer', { class: 'oj-shell__footer' }, [
          h('span', { class: 'oj-status', id: 'status' }, status.value),
          h(OjZoomControl, {
            modelValue: zoom.value,
            zoomOutLabel: i18n.t('oj.shell.zoom.zoomOut'),
            zoomInLabel: i18n.t('oj.shell.zoom.zoomIn'),
            resetLabel: i18n.t('oj.shell.zoom.reset'),
            'onUpdate:modelValue': (next: number) => {
              zoom.value = next
            },
          }),
          h(OjLocaleSwitcher),
        ]),
        h(OjDialog, {
          open: tableOpen.value,
          title: i18n.t('oj.shell.dialog.insertTitle'),
          confirmLabel: i18n.t('oj.common.confirm'),
          cancelLabel: i18n.t('oj.common.cancel'),
          'onUpdate:open': (next: boolean) => {
            tableOpen.value = next
          },
          onConfirm: confirmTable,
        }, () => [
          h('label', { class: 'oj-search__field' }, [
            i18n.t('oj.shell.dialog.rows'),
            h('input', {
              id: 'table-rows',
              value: rows.value,
              onInput: (event: Event) => {
                rows.value = (event.target as HTMLInputElement).value
              },
            }),
          ]),
          h('label', { class: 'oj-search__field' }, [
            i18n.t('oj.shell.dialog.cols'),
            h('input', {
              id: 'table-cols',
              value: cols.value,
              onInput: (event: Event) => {
                cols.value = (event.target as HTMLInputElement).value
              },
            }),
          ]),
        ]),
        h(OjDialog, {
          open: signatureOpen.value,
          title: i18n.t('oj.shell.signature.open'),
          confirmLabel: i18n.t('oj.common.confirm'),
          cancelLabel: i18n.t('oj.common.cancel'),
          'onUpdate:open': (next: boolean) => {
            signatureOpen.value = next
          },
          onConfirm: () => {
            signatureOpen.value = false
          },
        }, () => [h(OjSignaturePad, { clearLabel: i18n.t('oj.shell.signature.clear') })]),
        h(OjContextMenu, {
          open: menuOpen.value,
          x: menuPoint.value.x,
          y: menuPoint.value.y,
          items: [
            { id: COMMAND_BOLD, label: i18n.t('oj.command.bold'), shortcut: 'Ctrl+B' },
            { id: COMMAND_ITALIC, label: i18n.t('oj.command.italic'), shortcut: 'Ctrl+I' },
            { id: COMMAND_UNDERLINE, label: i18n.t('oj.command.underline'), shortcut: 'Ctrl+U' },
            { kind: 'separator' },
            { id: COMMAND_HORIZONTAL_RULE, label: i18n.t('oj.command.horizontalRule') },
            { id: COMMAND_TABLE, label: i18n.t('oj.command.insertTable'), separatorBefore: true },
          ],
          'onUpdate:open': (next: boolean) => {
            menuOpen.value = next
          },
          onSelect: (id: string) => {
            void run(id)
          },
        }),
        h(OjHotkey, {
          bindings: HOTKEYS,
          onRun: (id: string) => {
            void run(id)
          },
        }),
        h('pre', { id: 'log', hidden: true }, log.value.join('\n')),
      ])
    }
  },
})

function folderIds(nodes: readonly FileNode[]): string[] {
  const ids: string[] = []
  for (const node of nodes) {
    if (node.kind !== 'folder') continue
    ids.push(node.id)
    if (node.children) ids.push(...folderIds(node.children))
  }
  return ids
}

function findFile(nodes: readonly FileNode[], id: string): FileNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node
    const child = node.children ? findFile(node.children, id) : undefined
    if (child) return child
  }
  return undefined
}

// i18n 通过 Provider 注入：它负责把 `html[lang]` 跟语言包同步（tokens 的语言覆写层靠这个选择器）。
createApp({
  setup: () => () => h(OjLocaleProvider, { i18n }, () => h(Demo)),
}).mount('#app')
