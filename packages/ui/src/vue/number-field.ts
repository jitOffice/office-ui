import { defineComponent, h } from 'vue'

import { clampNumber, parseNumberDraft, stepNumber } from '../shell/number-field.ts'
import type { NumberBounds } from '../shell/number-field.ts'

/**
 * `OjNumberField`（03 §3）：无单位/带单位的数值输入。
 *
 * 输入过程**不重渲染**：`draft` 刻意是普通变量而不是 `ref`。绑成 `ref` 后每敲一个字符就会
 * 用 `props.modelValue` 重算 value，光标跳到末尾——这是受控输入最经典的那个坑。
 * 提交时机只有三个：失焦、回车、步进按钮。
 *
 * 步进按钮与方向键都走 `stepNumber`（夹取 + 精度），所以"在 1 上按减号"不会变成 0。
 */
export const OjNumberField = defineComponent({
  name: 'OjNumberField',
  props: {
    modelValue: { type: Number, required: true },
    min: { type: Number, default: undefined },
    max: { type: Number, default: undefined },
    step: { type: Number, default: 1 },
    precision: { type: Number, default: 0 },
    /** 输入框的可访问名。按钮另有自己的标签，不共用。 */
    label: { type: String, required: true },
    decreaseLabel: { type: String, required: true },
    increaseLabel: { type: String, required: true },
    suffix: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    let draft: string | null = null

    const bounds = (): NumberBounds => ({
      min: props.min,
      max: props.max,
      step: props.step,
      precision: props.precision,
    })

    const current = (): number => clampNumber(props.modelValue, bounds())
    const text = (): string => (draft === null ? `${current()}${props.suffix}` : draft)

    function commit(): void {
      if (draft === null) return
      const parsed = parseNumberDraft(draft)
      draft = null
      // 解析不出数字就不提交：输入框会回到 props 的值，用户看到的是"没被接受"而不是 0
      if (parsed === undefined) return
      emit('update:modelValue', clampNumber(parsed, bounds()))
    }

    function bump(direction: 1 | -1): void {
      draft = null
      const next = stepNumber(props.modelValue, direction, bounds())
      // 边界上值没变就不发事件：受控组件的使用方会照单全收，多一次无意义的状态写入
      if (next === current()) return
      emit('update:modelValue', next)
    }

    return () =>
      h('div', { class: 'oj-number-field', 'data-disabled': props.disabled ? '' : undefined }, [
        h(
          'button',
          {
            type: 'button',
            class: 'oj-button',
            'data-size': 'mini',
            'aria-label': props.decreaseLabel,
            disabled: props.disabled,
            onClick: () => bump(-1),
          },
          '−',
        ),
        h('input', {
          class: 'oj-number-field__input',
          type: 'text',
          role: 'spinbutton',
          inputmode: 'decimal',
          'aria-label': props.label,
          'aria-valuenow': current(),
          'aria-valuemin': props.min,
          'aria-valuemax': props.max,
          'aria-disabled': props.disabled ? 'true' : undefined,
          disabled: props.disabled,
          value: text(),
          onInput: (event: Event) => {
            draft = (event.target as HTMLInputElement).value
          },
          onBlur: () => commit(),
          onKeydown: (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              commit()
              return
            }
            if (event.key === 'ArrowUp') {
              event.preventDefault()
              bump(1)
              return
            }
            if (event.key === 'ArrowDown') {
              event.preventDefault()
              bump(-1)
              return
            }
            if (event.key === 'Escape') {
              // 放弃这次输入，回到 props 的值
              draft = null
              ;(event.target as HTMLInputElement).value = text()
            }
          },
        }),
        h(
          'button',
          {
            type: 'button',
            class: 'oj-button',
            'data-size': 'mini',
            'aria-label': props.increaseLabel,
            disabled: props.disabled,
            onClick: () => bump(1),
          },
          '+',
        ),
      ])
  },
})
