import { createApp, defineComponent, h, ref } from 'vue'

import { createI18n } from '../../i18n/src/index.ts'
import enUS from '../../i18n/src/locales/en-US.ts'
import jaJP from '../../i18n/src/locales/ja-JP.ts'
import zhCN from '../../i18n/src/locales/zh-CN.ts'
import zhTW from '../../i18n/src/locales/zh-TW.ts'
import { createCommandRegistry } from '../../shared/src/commands/index.ts'
import '../../tokens/dist/index.css'
import {
  COMMAND_ALIGN,
  COMMAND_ALIGN_LEFT,
  COMMAND_BLOCKQUOTE,
  COMMAND_BOLD,
  COMMAND_BORDER,
  COMMAND_BULLET_LIST,
  COMMAND_CODE_BLOCK,
  COMMAND_FONT_FAMILY,
  COMMAND_FONT_SIZE,
  COMMAND_HEADING,
  COMMAND_HORIZONTAL_RULE,
  COMMAND_ITALIC,
  COMMAND_LINE_SPACING,
  COMMAND_ORDERED_LIST,
  COMMAND_TABLE,
  COMMAND_TEXT_COLOR,
  COMMAND_UNDERLINE,
  DEFAULT_ALIGNMENT,
  DEFAULT_BORDER,
  FONT_OPTIONS,
  addReply,
  blockPlain,
  borderCss,
  createDocument,
  createMemoryEditor,
  decideAll,
  decideChange,
  editorCommands,
  filterTree,
  findFont,
  isTableSize,
  isTextblockType,
  neighbor,
  normalizeAlignment,
  normalizeBorder,
  pageWidth,
  plainText,
  registerEditorCommands,
  replaceAll,
  replaceOne,
  searchHits,
  setHorizontalRule,
  setResolved,
  toggleBlockquote,
  toggleBulletList,
  toggleCodeBlock,
  toggleHeading,
  toggleOrderedList,
  toggleId,
  withPlain,
} from '../src/index.ts'
import type {
  AlignmentValue,
  BorderValue,
  CommentThread,
  FileNode,
  GridCell,
  OjDocument,
  OjEditorHost,
  OjNode,
  OjPerson,
  ReviewChange,
  ReviewDecision,
  ReviewKind,
  SaveState,
  SearchHit,
} from '../src/index.ts'
import {
  OjAiPanel,
  OjAlignmentPicker,
  OjBorderPicker,
  OjCodeBlock,
  OjColorPicker,
  OjCommandButton,
  OjCommentThread,
  OjContextMenu,
  OjDialog,
  OjDropdown,
  OjFileNameHeader,
  OjFileTree,
  OjFontPicker,
  OjFontSizeField,
  OjHotkey,
  OjLineSpacingPicker,
  OjPaneGroup,
  OjPresenceAvatars,
  OjReviewPanel,
  OjLocaleProvider,
  OjLocaleSwitcher,
  OjRibbon,
  OjRibbonGroup,
  OjRuler,
  OjSearchReplaceBar,
  OjSignaturePad,
  OjStamp,
  OjTableGridPicker,
  OjTabs,
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

/** 协同演示用的人：头像颜色与首字母都由 id/姓名派生，这里不给 `tone` 以外的任何样式 */
const PEOPLE: readonly OjPerson[] = [
  { id: 'u-ada', name: 'Ada Lovelace' },
  { id: 'u-zhang', name: '张伟' },
  { id: 'u-li', name: '李娜' },
  { id: 'u-wang', name: '王芳' },
  { id: 'u-sato', name: '佐藤 健' },
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
    // 格式面板同一时刻只开一个：六个下拉各自管 `open` 会出现两个面板叠着。
    const formatOpen = ref('')
    /**
     * 当前选区的格式镜像。真实内核里这些值来自 `editor.getAttributes()`，
     * demo 把它们当成"宿主侧的真值"——命令只负责写进去，界面读它们。
     */
    const fontFamily = ref(FONT_OPTIONS[0]?.id ?? 'sans')
    const fontSize = ref(14)
    const textColor = ref('var(--oj-text-1)')
    const border = ref<BorderValue>(DEFAULT_BORDER)
    const lineSpacing = ref(1.5)
    const alignment = ref<AlignmentValue>(DEFAULT_ALIGNMENT)

    // ---- 审阅与协同（M3 第一批）：批注线程、修订列表、协同头像、文件名保存态
    const docName = ref('产品说明')
    const favored = ref(false)
    const saveState = ref<SaveState>('saved')
    /**
     * 合同审阅 preset 的两条侧栏宽度：由 `OjPaneGroup` 的分隔条回写（收起时是 0）。
     * 中文档栏 `flexible`，不存尺寸——它的宽度就是"剩下的空间"。
     */
    const filesSize = ref(220)
    const sideSize = ref(320)
    const sidePane = ref<'ai' | 'review'>('ai')
    const now = Date.now()
    const threads = ref<CommentThread[]>([
      {
        id: 'c1',
        anchor: 'p0',
        author: PEOPLE[0]!,
        at: now - 42 * 60 * 1000,
        text: '这一段的「外壳」建议改成「界面」，和产品术语表对齐。',
        replies: [],
        resolved: false,
      },
      {
        id: 'c2',
        anchor: 'p1',
        author: PEOPLE[1]!,
        at: now - 12 * 60 * 1000,
        text: '表格里的数字需要补单位。',
        replies: [{ id: 'c2-r1', author: PEOPLE[2]!, at: now - 8 * 60 * 1000, text: '已补上「万元」。' }],
        resolved: true,
      },
    ])
    // 摘要只说"改了哪段内容"，"插入/删除/格式"由左边的种类标签给——重复一遍读起来像口吃
    const changes = ref<ReviewChange[]>([
      { id: 'ch1', kind: 'insert', author: PEOPLE[1]!, at: now - 30 * 60 * 1000, summary: '「以实际交付为准。」', anchor: 'p0' },
      { id: 'ch2', kind: 'delete', author: PEOPLE[0]!, at: now - 20 * 60 * 1000, summary: '「本页仅供参考」', anchor: 'p1' },
      { id: 'ch3', kind: 'format', author: PEOPLE[3]!, at: now - 5 * 60 * 1000, summary: '「产品说明」→ 加粗', anchor: 'p2' },
    ])

    let saveTimer: ReturnType<typeof setTimeout> | undefined
    /** 任何一次成功的编辑都走这条：未保存 → 保存中 → 已保存。三档不可跳过（见 shell/file-name.ts）。 */
    function markDirty(): void {
      saveState.value = 'unsaved'
      if (saveTimer !== undefined) clearTimeout(saveTimer)
      saveTimer = setTimeout(() => {
        saveState.value = 'saving'
        saveTimer = setTimeout(() => {
          saveState.value = 'saved'
          saveTimer = undefined
        }, 600)
      }, 400)
    }

    const saveLabels = (): Record<SaveState, string> => ({
      saved: i18n.t('oj.fileName.saved'),
      saving: i18n.t('oj.fileName.saving'),
      unsaved: i18n.t('oj.fileName.unsaved'),
    })

    const kindLabels = (): Record<ReviewKind, string> => ({
      insert: i18n.t('oj.review.kind.insert'),
      delete: i18n.t('oj.review.kind.delete'),
      format: i18n.t('oj.review.kind.format'),
    })

    const formatTime = (at: number): string => i18n.date.time(at)

    function replyTo(id: string, text: string): void {
      threads.value = threads.value.map((thread) =>
        thread.id === id
          ? addReply(thread, {
              id: `${id}-r${thread.replies.length + 1}`,
              author: PEOPLE[0]!,
              at: Date.now(),
              text,
            })
          : thread,
      )
    }

    function toggleThreadResolved(id: string, resolved: boolean): void {
      threads.value = threads.value.map((thread) => (thread.id === id ? setResolved(thread, resolved) : thread))
    }

    function decideOne(id: string, decision: ReviewDecision): void {
      changes.value = [...decideChange(changes.value, id)]
      status.value = `${i18n.t('oj.review.title')} · ${
        decision === 'accept' ? i18n.t('oj.review.accept') : i18n.t('oj.review.reject')
      }`
      markDirty()
    }

    /** 批量决策只作用于面板当前的筛选结果：`kind` 由面板带出来，宿主用同一个条件复算。 */
    function decideVisible(decision: ReviewDecision, kind: ReviewKind | 'all'): void {
      changes.value = [...decideAll(changes.value, { kind })]
      markDirty()
    }

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
      // 值型命令：宿主执行成功后把归一化过的值写回镜像。
      // 读回归一化结果（而不是直接读 arg）才能证明命令层真的校验过——非法值在这里是 `error`，不写回。
      if (result.ok && id === COMMAND_FONT_FAMILY) fontFamily.value = String(arg)
      if (result.ok && id === COMMAND_FONT_SIZE) fontSize.value = Number(arg)
      if (result.ok && id === COMMAND_TEXT_COLOR) textColor.value = String(arg)
      if (result.ok && id === COMMAND_BORDER) {
        border.value = normalizeBorder(arg === 'none' ? { style: 'none' } : (arg as Partial<BorderValue>))
      }
      if (result.ok && id === COMMAND_LINE_SPACING) lineSpacing.value = Number(arg)
      if (result.ok && id === COMMAND_ALIGN) alignment.value = normalizeAlignment(arg as Partial<AlignmentValue>)
      // 任何一条命令成功都算一次编辑：标题栏的保存态跟着走，用户能看见"改完会落盘"
      if (result.ok) markDirty()
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
    /**
     * 一个格式下拉：触发器显示当前值，面板里是选择器。
     *
     * 六个面板共用 `formatOpen`，因为"同一时刻只开一个"必须由同一个真值表达：
     * 各自管 `open` 的话，点第二个面板时第一个不会关，两个浮层会叠在一起。
     */
    function formatMenu(id: string, triggerId: string, trigger: string, panel: () => ReturnType<typeof h>) {
      return h(
        OjDropdown,
        {
          open: formatOpen.value === id,
          'onUpdate:open': (next: boolean) => {
            formatOpen.value = next ? id : ''
          },
        },
        {
          trigger: () =>
            h('button', { type: 'button', class: 'oj-button', 'data-size': 'mini', id: triggerId }, trigger),
          default: panel,
        },
      )
    }

    /**
     * 格式组：六个选择器 → 六条值型命令（M2「格式相关命令端到端」的那条链）。
     *
     * 选择器只负责产出**值**，写成文档的是命令；`run()` 成功后才把值写回镜像。
     * 这条顺序不能反——先写界面再跑命令，命令失败时界面会撒谎。
     */
    function formatGroup() {
      const close = (): void => {
        formatOpen.value = ''
      }
      const font = findFont(FONT_OPTIONS, fontFamily.value)
      const borderStyleLabels = {
        none: i18n.t('oj.border.style.none'),
        solid: i18n.t('oj.border.style.solid'),
        dashed: i18n.t('oj.border.style.dashed'),
        dotted: i18n.t('oj.border.style.dotted'),
        double: i18n.t('oj.border.style.double'),
      }
      const alignLabels = {
        left: i18n.t('oj.align.left'),
        center: i18n.t('oj.align.center'),
        right: i18n.t('oj.align.right'),
        justify: i18n.t('oj.align.justify'),
        top: i18n.t('oj.align.top'),
        middle: i18n.t('oj.align.middle'),
        bottom: i18n.t('oj.align.bottom'),
      }

      return h('div', { class: 'oj-format', role: 'group', 'aria-label': i18n.t('oj.command.fontFamily') }, [
        formatMenu(COMMAND_FONT_FAMILY, 'format-font', font?.label ?? fontFamily.value, () =>
          h(OjFontPicker, {
            modelValue: fontFamily.value,
            label: i18n.t('oj.command.fontFamily'),
            placeholder: i18n.t('oj.common.inputPlaceholder'),
            'onUpdate:modelValue': (next: string) => {
              close()
              void run(COMMAND_FONT_FAMILY, next)
            },
          }),
        ),
        // 字号常驻在功能区上直接可编辑（Office 的行为），不进下拉
        h(OjFontSizeField, {
          modelValue: fontSize.value,
          label: i18n.t('oj.command.fontSize'),
          decreaseLabel: i18n.t('oj.common.decrease'),
          increaseLabel: i18n.t('oj.common.increase'),
          'onUpdate:modelValue': (next: number) => {
            void run(COMMAND_FONT_SIZE, next)
          },
        }),
        formatMenu(COMMAND_TEXT_COLOR, 'format-color', i18n.t('oj.command.textColor'), () =>
          h(OjColorPicker, {
            modelValue: textColor.value,
            label: i18n.t('oj.command.textColor'),
            customLabel: i18n.t('oj.colorPicker.custom'),
            'onUpdate:modelValue': (next: string) => {
              close()
              void run(COMMAND_TEXT_COLOR, next)
            },
          }),
        ),
        formatMenu(COMMAND_BORDER, 'format-border', i18n.t('oj.command.border'), () =>
          h(OjBorderPicker, {
            modelValue: border.value,
            label: i18n.t('oj.command.border'),
            widthLabel: i18n.t('oj.border.width'),
            colorLabel: i18n.t('oj.border.color'),
            styleLabels: borderStyleLabels,
            'onUpdate:modelValue': (next: Partial<BorderValue>) => {
              void run(COMMAND_BORDER, next)
            },
          }),
        ),
        formatMenu(COMMAND_LINE_SPACING, 'format-spacing', i18n.t('oj.command.lineSpacing'), () =>
          h(OjLineSpacingPicker, {
            modelValue: lineSpacing.value,
            label: i18n.t('oj.command.lineSpacing'),
            'onUpdate:modelValue': (next: number) => {
              close()
              void run(COMMAND_LINE_SPACING, next)
            },
          }),
        ),
        formatMenu(COMMAND_ALIGN, 'format-align', i18n.t('oj.command.align'), () =>
          h(OjAlignmentPicker, {
            modelValue: alignment.value,
            label: i18n.t('oj.command.align'),
            itemLabels: alignLabels,
            'onUpdate:modelValue': (next: Partial<AlignmentValue>) => {
              close()
              void run(COMMAND_ALIGN, next)
            },
          }),
        ),
      ])
    }

    /**
     * 一条 Ribbon 组。
     *
     * `available` 必须给：demo 的功能区是普通 flex 容器，组的宽度由内容撑开，
     * 而 `OjRibbonGroup` 自己量宽时会发生一次"先量到 0 → 全进 `»` → 宽度永远是 20px"的死循环
     * （组件注释里写明的宿主责任：组必须被父级约束宽度）。给固定预算就等于告诉它"你最多这么宽"。
     */
    function ribbonGroup(ids: string[], size: 'large' | 'medium' = 'large', available = 240) {
      return h(
        OjRibbonGroup,
        { items: ids.map((id) => ({ id, size })), available },
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

      return h('div', { class: 'oj-shell' }, [
        h('header', { class: 'oj-shell__bar' }, [
          h(
            'h1',
            { class: 'oj-shell__title', id: 'doc-title' },
            h(OjFileNameHeader, {
              name: docName.value,
              state: saveState.value,
              stateLabel: saveLabels()[saveState.value],
              renameLabel: i18n.t('oj.fileName.rename'),
              favoriteLabel: i18n.t('oj.fileName.favorite'),
              favored: favored.value,
              problemLabels: {
                empty: i18n.t('oj.fileName.empty'),
                illegal: i18n.t('oj.fileName.illegal'),
                reserved: i18n.t('oj.fileName.reserved'),
              },
              onRename: (next: string) => {
                docName.value = next
                markDirty()
              },
              'onUpdate:favored': (next: boolean) => {
                favored.value = next
              },
            }),
          ),
          h(OjPresenceAvatars, {
            people: PEOPLE,
            // 5 人、4 格：留一格给"还有 2 人"，点它能展开完整名单（这里用状态栏回显占位）
            max: 4,
            label: i18n.t('oj.presence.label'),
            overflowLabel: i18n.t('oj.presence.more', { n: PEOPLE.length - 3 }),
            overflowTitle: i18n.t('oj.presence.overflowTitle'),
            onSelect: (id: string) => {
              status.value = id
            },
            onOverflow: () => {
              status.value = i18n.t('oj.presence.overflowTitle')
            },
          }),
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
                formatGroup(),
                // 三组都用 medium：large 会把第一行撑到放不下，三个组各自溢出成 `»`
                ribbonGroup([COMMAND_BOLD, COMMAND_ITALIC, COMMAND_UNDERLINE], 'medium'),
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
          /*
           * 合同审阅 preset：左文件栏（可收起）+ 中文档（吃剩余宽度）+ 右审阅栏（可收起）。
           * 三栏都交给 `OjPaneGroup`——分隔条只调固定宽的那两栏，中文档没有可拖的数值。
           * 收起靠双击分隔条或聚焦后按 Enter，展开同理。
           */
          h(OjPaneGroup, {
            panes: [
              {
                id: 'files',
                size: filesSize.value,
                min: 160,
                max: 360,
                collapsible: true,
                label: i18n.t('oj.shell.pane.files'),
              },
              { id: 'doc', size: 0, flexible: true, min: 480 },
              {
                id: 'side',
                size: sideSize.value,
                min: 260,
                max: 520,
                collapsible: true,
                label: i18n.t('oj.shell.pane.side'),
              },
            ],
            label: i18n.t('oj.shell.pane.resize'),
            'onUpdate:size': (id: string, size: number) => {
              if (id === 'files') filesSize.value = size
              else if (id === 'side') sideSize.value = size
            },
          }, {
            files: () => h('aside', { class: 'oj-files-pane', 'aria-label': i18n.t('oj.shell.files.title') }, [
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
                  // 点文件 = 打开它：标题栏跟着换名字，否则左边选了「会议记录」、标题还停在旧文件
                  const file = findFile(FILES, id)
                  if (file) {
                    docName.value = file.name
                    markDirty()
                  }
                },
              }),
            ]),
            doc: () => h('section', { class: 'oj-stage' }, [
              h('div', { class: 'oj-stage__sheet' }, [
                h('div'),
                h(OjRuler, { length: width, zoom: zoom.value }),
                h(OjRuler, { length: paperHeight, zoom: zoom.value, orientation: 'vertical' }),
                h(
                  'article',
                  {
                    class: 'oj-paper',
                    id: 'paper',
                    /**
                     * 文档区把六条格式命令的结果**画出来**，否则"命令跑成功了"只有一行日志可看。
                     * 边框走 `borderCss()`，与 `OjBorderPicker` 的预览同一个函数——两套字符串迟早不一致。
                     */
                    style: {
                      width: `${width}px`,
                      minHeight: `${paperHeight}px`,
                      fontFamily: findFont(FONT_OPTIONS, fontFamily.value)?.stack,
                      fontSize: `${fontSize.value}px`,
                      color: textColor.value,
                      lineHeight: String(lineSpacing.value),
                      border: borderCss(border.value),
                      textAlign: alignment.value.horizontal,
                    },
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
            side: () => h('aside', { class: 'oj-side' }, [
              h(OjTabs, {
                items: [
                  { id: 'ai', label: i18n.t('oj.shell.ai.title') },
                  { id: 'review', label: i18n.t('oj.shell.review.title') },
                ],
                modelValue: sidePane.value,
                'onUpdate:modelValue': (next: string) => {
                  sidePane.value = next === 'review' ? 'review' : 'ai'
                },
              }),
              sidePane.value === 'ai'
                ? h(OjAiPanel, {
                    title: i18n.t('oj.shell.ai.title'),
                    placeholder: i18n.t('oj.shell.ai.placeholder'),
                    sendLabel: i18n.t('oj.shell.ai.send'),
                    notice: i18n.t('oj.shell.ai.notice'),
                    messages: messages.value,
                    onSubmit: (text: string) => {
                      messages.value = [...messages.value, { role: 'user', text }]
                    },
                  })
                : h('div', { class: 'oj-review-pane' }, [
                    h(OjReviewPanel, {
                      changes: changes.value,
                      label: i18n.t('oj.review.title'),
                      acceptLabel: i18n.t('oj.review.accept'),
                      rejectLabel: i18n.t('oj.review.reject'),
                      acceptAllLabel: i18n.t('oj.review.acceptAll'),
                      rejectAllLabel: i18n.t('oj.review.rejectAll'),
                      emptyLabel: i18n.t('oj.review.empty'),
                      allKindsLabel: i18n.t('oj.review.allKinds'),
                      kindLabels: kindLabels(),
                      formatTime,
                      onDecide: decideOne,
                      'onDecide-all': decideVisible,
                    }),
                    ...threads.value.map((thread) =>
                      h(OjCommentThread, {
                        key: thread.id,
                        thread,
                        formatTime,
                        resolveLabel: i18n.t('oj.comment.resolve'),
                        reopenLabel: i18n.t('oj.comment.reopen'),
                        replyLabel: i18n.t('oj.comment.reply'),
                        replyPlaceholder: i18n.t('oj.comment.replyPlaceholder'),
                        onReply: (text: string) => {
                          replyTo(thread.id, text)
                        },
                        'onToggle-resolved': (resolved: boolean) => {
                          toggleThreadResolved(thread.id, resolved)
                        },
                      }),
                    ),
                  ]),
            ]),
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
