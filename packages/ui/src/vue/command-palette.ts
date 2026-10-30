import { computed, defineComponent, h, ref, watch } from 'vue'
import type { PropType } from 'vue'

import { detectPlatform, formatHotkey } from '../hotkey.ts'
import { filterPaletteItems, paletteStep } from '../palette.ts'
import type { OjPaletteItem } from '../palette.ts'
import { OjPortal } from './portal.ts'

/**
 * `OjCommandPalette`（03 §3 B 组）：`Ctrl+/` 或 `Ctrl+P` 唤起的命令搜索。
 *
 * 搜索排序在 `palette.ts`（零依赖、有单测），这里只管浮层与键盘：
 *   - `role="dialog"` + 焦点陷阱 + 关闭归还焦点，全部复用 `OjPortal`；
 *   - 输入框是 `combobox`，高亮项通过 `aria-activedescendant` 报给读屏；
 *   - **IME 合成期间不抢 `Enter`**（03 §5 第 7 条）：中日文用户正在选词时回车，
 *     意图是"确认这个词"，不是"执行第一条命令"。
 */
export const OjCommandPalette = defineComponent({
  name: 'OjCommandPalette',
  props: {
    open: { type: Boolean, required: true },
    items: { type: Array as PropType<readonly OjPaletteItem[]>, required: true },
    /** 受控查询词；不给则组件自己记（仍会发 `update:query`） */
    query: { type: String as PropType<string | undefined>, default: undefined },
    label: { type: String, default: '命令面板' },
    placeholder: { type: String, default: '搜索命令' },
    emptyLabel: { type: String, default: '没有匹配的命令' },
  },
  emits: ['update:open', 'update:query', 'select'],
  setup(props, { emit }) {
    const inner = ref('')
    const active = ref(0)
    const platform = detectPlatform()

    const text = computed(() => props.query ?? inner.value)
    const results = computed(() => filterPaletteItems(props.items, text.value))
    const current = computed(() => results.value[active.value])

    watch(
      () => props.open,
      (open) => {
        if (open) active.value = 0
      },
    )
    watch(
      () => results.value.length,
      (length) => {
        if (active.value > length - 1) active.value = Math.max(0, length - 1)
      },
    )

    function close(): void {
      emit('update:open', false)
    }

    function choose(index: number): void {
      const item = results.value[index]
      if (item === undefined || item.disabled) return
      emit('select', item.id)
      close()
    }

    function onKeydown(event: KeyboardEvent): void {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        active.value = paletteStep(results.value.length, active.value, event.key === 'ArrowDown' ? 1 : -1)
        return
      }
      if (event.key === 'Home' || event.key === 'End') {
        event.preventDefault()
        active.value = event.key === 'Home' ? 0 : Math.max(0, results.value.length - 1)
        return
      }
      if (event.key === 'Enter') {
        // 合成中的回车属于输入法，抢过来等于在核心场景里让用户选不了词
        if (event.isComposing) return
        event.preventDefault()
        choose(active.value)
        return
      }
      if (event.key === 'Escape') {
        event.stopPropagation()
        close()
      }
    }

    function onInput(event: Event): void {
      const value = (event.target as HTMLInputElement).value
      inner.value = value
      active.value = 0
      emit('update:query', value)
    }

    function keyLabel(item: OjPaletteItem): string | undefined {
      if (item.keys === undefined) return undefined
      const first = typeof item.keys === 'string' ? item.keys : item.keys[0]
      return first === undefined ? undefined : formatHotkey(first, platform)
    }

    return () => {
      if (!props.open) return null

      return h(
        OjPortal,
        { trapFocus: true, lockScroll: true, zIndex: 'var(--oj-z-modal)' },
        {
          default: () =>
            h(
              'div',
              {
                class: 'oj-palette__mask',
                onClick: (event: MouseEvent) => {
                  if (event.target === event.currentTarget) close()
                },
              },
              [
                h(
                  'div',
                  {
                    class: 'oj-palette',
                    role: 'dialog',
                    'aria-modal': 'true',
                    'aria-label': props.label,
                    onKeydown,
                  },
                  [
                    h('input', {
                      class: 'oj-palette__input',
                      type: 'search',
                      value: text.value,
                      placeholder: props.placeholder,
                      'aria-label': props.placeholder,
                      role: 'combobox',
                      'aria-expanded': 'true',
                      'aria-controls': 'oj-palette-list',
                      'aria-autocomplete': 'list',
                      'aria-activedescendant':
                        current.value === undefined ? undefined : `oj-palette-${current.value.id}`,
                      onInput,
                    }),
                    h(
                      'ul',
                      { class: 'oj-palette__list', id: 'oj-palette-list', role: 'listbox', 'aria-label': props.label },
                      results.value.map((item, index) =>
                        h(
                          'li',
                          {
                            id: `oj-palette-${item.id}`,
                            class: 'oj-palette__item',
                            role: 'option',
                            'data-item': item.id,
                            'data-active': index === active.value ? '' : undefined,
                            'aria-selected': index === active.value ? 'true' : 'false',
                            'aria-disabled': item.disabled ? 'true' : undefined,
                            onClick: () => choose(index),
                          },
                          [
                            h('span', { class: 'oj-palette__label' }, item.label),
                            item.group === undefined
                              ? null
                              : h('span', { class: 'oj-palette__group' }, item.group),
                            keyLabel(item) === undefined
                              ? null
                              : h('kbd', { class: 'oj-palette__keys' }, keyLabel(item)),
                          ],
                        ),
                      ),
                    ),
                    results.value.length === 0
                      ? h('p', { class: 'oj-palette__empty' }, props.emptyLabel)
                      : null,
                  ],
                ),
              ],
            ),
        },
      )
    }
  },
})
