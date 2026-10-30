import { computed, defineComponent, h, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import type { PropType, VNodeChild } from 'vue'

import {
  createRibbonChrome,
  ribbonDismiss,
  ribbonHasKeyTips,
  ribbonKeyTip,
  ribbonPanelOpen,
  ribbonSelect,
  ribbonToggleCollapsed,
} from '../ribbon.ts'
import type { RibbonChromeState } from '../ribbon.ts'
import { selectByKey } from '../shell/tabs.ts'
import { OjIcon } from './icon.ts'
import { OjRibbonTab } from './ribbon-tab.ts'
import type { OjRibbonTabItem } from './ribbon-tab.ts'

export interface OjRibbonSlots {
  /** 当前选项卡的面板内容。组件在收起时只隐藏、不卸载，面板里的选择器/搜索框不该丢状态。 */
  default?: (scope: { tab: string }) => VNodeChild
}

/**
 * `OjRibbon`（03 §3 B 组）：选项卡 + 组 + 自动折叠（双击标签收起，同 Word）。
 *
 * 折叠拆成 `collapsed`（固定）与 `peek`（临时）两个状态，规则全在 `ribbon.ts` 的纯函数里，
 * 这里只做碰 DOM 的那几件事：派发点击/双击、把方向键换成标签切换、收起时把焦点留在标签上、
 * "点面板外面就收回临时展开"，以及 `Alt` 唤起 Key Tips 后按字母直达标签。
 *
 * ARIA 按 03 §5 的第 2、4 条：外层 `tablist` + `tab` + `tabpanel`，
 * 收起/展开按钮带 `aria-expanded`，方向键在标签间循环，配了 Key Tip 的标签带 `aria-keyshortcuts`。
 */
export const OjRibbon = defineComponent({
  name: 'OjRibbon',
  props: {
    items: { type: Array as PropType<readonly OjRibbonTabItem[]>, required: true },
    modelValue: { type: String, required: true },
    /** 受控折叠：给了就听外部的；不给则由组件自己记（仍会发 `update:collapsed`） */
    collapsed: { type: Boolean as PropType<boolean | undefined>, default: undefined },
    label: { type: String as PropType<string | undefined>, default: undefined },
    collapseLabel: { type: String, default: '收起功能区' },
    expandLabel: { type: String, default: '展开功能区' },
  },
  emits: ['update:modelValue', 'update:collapsed'],
  setup(props, { slots, emit }) {
    const root = ref<HTMLElement | null>(null)
    const state = ref<RibbonChromeState>(createRibbonChrome(props.modelValue, props.collapsed ?? false))
    const open = computed(() => ribbonPanelOpen(state.value))
    /** `Alt` 按住期间的 Key Tips 可见性——纯展示状态，不进 chrome 状态机 */
    const tips = ref(false)

    watch(
      () => props.modelValue,
      (tab) => {
        if (tab === state.value.tab) return
        state.value = { ...state.value, tab }
      },
    )
    watch(
      () => props.collapsed,
      (collapsed) => {
        if (collapsed === undefined || collapsed === state.value.collapsed) return
        state.value = { ...state.value, collapsed, peek: false }
      },
    )

    /**
     * 状态写入的唯一入口。`collapsed` 是受控的（给了 prop 就听 prop），
     * 内部状态永远先跟 prop 对齐——否则父级没接受这次变更时，界面会和 prop 分叉。
     */
    function apply(next: RibbonChromeState): void {
      const previous = state.value
      const normalized = props.collapsed === undefined ? next : { ...next, collapsed: props.collapsed }
      if (
        normalized.tab !== previous.tab ||
        normalized.collapsed !== previous.collapsed ||
        normalized.peek !== previous.peek
      ) {
        state.value = normalized
      }
      // 事件按"用户的意图"发，不按归一化后的状态发：受控时父级没接受变更，
      // 归一化会把这次意图抹平——不在这里发，父级就永远收不到那次点击。
      if (next.tab !== previous.tab) emit('update:modelValue', next.tab)
      if (next.collapsed !== previous.collapsed) emit('update:collapsed', next.collapsed)
    }

    function focusTab(id: string): void {
      void nextTick(() => {
        const nodes = root.value?.querySelectorAll<HTMLElement>('[data-tab]') ?? []
        for (const node of nodes) {
          if (node.dataset.tab !== id) continue
          node.focus()
          return
        }
      })
    }

    /** 点面板外面就收回临时展开、顺手收起 Key Tips。 */
    function onPointerDown(event: PointerEvent): void {
      if (tips.value) tips.value = false
      if (!state.value.peek) return
      const el = root.value
      if (el && event.target instanceof Node && el.contains(event.target)) return
      apply(ribbonDismiss(state.value))
    }

    /**
     * 文档级键盘处理，两段：
     *   1. Key Tips 展开时，字母直达对应标签，其他键一律收起提示（`Escape` 只收起）；
     *   2. 否则只接 `Escape`，收回"临时展开"并把焦点留在当前标签上。
     */
    function onDocumentKeydown(event: KeyboardEvent): void {
      if (tips.value) {
        if (event.key === 'Escape') {
          tips.value = false
          return
        }
        // 带修饰键的按键不当作 Key Tip：macOS 上 Alt+字母会输入特殊字符
        if (event.altKey || event.ctrlKey || event.metaKey) {
          tips.value = false
          return
        }
        const id = ribbonKeyTip(props.items, event.key)
        if (id === undefined) {
          tips.value = false
          return
        }
        event.preventDefault()
        tips.value = false
        apply(ribbonSelect(state.value, id))
        focusTab(id)
        return
      }

      if (event.key !== 'Escape' || !state.value.peek) return
      apply(ribbonDismiss(state.value))
      focusTab(state.value.tab)
    }

    /**
     * Windows 上裸 `Alt` 只有 `keyup`（`keydown` 被系统菜单吞掉），
     * 所以提示必须由 keyup 唤起——只听 keydown 的实现在真机上永远不亮。
     */
    function onDocumentKeyup(event: KeyboardEvent): void {
      if (event.key !== 'Alt' || event.ctrlKey || event.metaKey || event.shiftKey) return
      if (!ribbonHasKeyTips(props.items)) return
      tips.value = true
    }

    onMounted(() => {
      document.addEventListener('pointerdown', onPointerDown)
      document.addEventListener('keydown', onDocumentKeydown)
      document.addEventListener('keyup', onDocumentKeyup)
    })
    onUnmounted(() => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onDocumentKeydown)
      document.removeEventListener('keyup', onDocumentKeyup)
    })

    function onTabbarKeydown(event: KeyboardEvent): void {
      const next = selectByKey(
        props.items.map((item) => item.id),
        state.value.tab,
        event.key,
      )
      if (next === state.value.tab) return
      event.preventDefault()
      apply(ribbonSelect(state.value, next))
      focusTab(next)
    }

    /** 双击选项卡 = 收起/展开功能区。别绑在每个 tab 上：事件冒泡到这里判断一次就够。 */
    function onTabbarDblClick(event: MouseEvent): void {
      const target = event.target
      if (!(target instanceof Element) || !target.closest('[data-tab]')) return
      apply(ribbonToggleCollapsed(state.value))
    }

    return () => {
      const tab = state.value.tab
      return h(
        'div',
        {
          ref: root,
          class: 'oj-ribbon',
          'data-collapsed': state.value.collapsed ? '' : undefined,
          'data-keytips': tips.value ? '' : undefined,
        },
        [
          h(
            'div',
            {
              class: 'oj-ribbon__tabbar',
              role: 'tablist',
              'aria-label': props.label,
              onKeydown: onTabbarKeydown,
              onDblclick: onTabbarDblClick,
            },
            [
              ...props.items.map((item) =>
                h(OjRibbonTab, {
                  id: item.id,
                  label: item.label,
                  selected: item.id === tab,
                  keyTip: item.keyTip,
                  showKeyTip: tips.value,
                  onSelect: () => apply(ribbonSelect(state.value, item.id)),
                }),
              ),
              h(
                'button',
                {
                  type: 'button',
                  class: 'oj-ribbon__collapse',
                  'data-open': open.value ? '' : undefined,
                  'aria-expanded': open.value ? 'true' : 'false',
                  'aria-label': state.value.collapsed ? props.expandLabel : props.collapseLabel,
                  title: state.value.collapsed ? props.expandLabel : props.collapseLabel,
                  onClick: () => apply(ribbonToggleCollapsed(state.value)),
                },
                h(OjIcon, { name: 'oj-chevron-down', decorative: true }),
              ),
            ],
          ),
          h(
            'div',
            {
              class: 'oj-ribbon__panel',
              role: 'tabpanel',
              id: `oj-ribbon-panel-${tab}`,
              'aria-labelledby': `oj-ribbon-tab-${tab}`,
              hidden: !open.value,
            },
            slots.default?.({ tab }),
          ),
        ],
      )
    }
  },
})
