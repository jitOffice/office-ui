import { defineComponent, h } from 'vue'

import { iconLabelProblem, iconMarkup, isDevEnv } from '../icons.ts'

function cssSize(size: number | string): string {
  return typeof size === 'number' ? `${size}px` : size
}

/**
 * dev 告警按图标名去重：一个 Ribbon 里同一枚图标会出现十几次，
 * 每个实例刷一行只会让人把控制台关掉——那等于没有告警。
 */
const reported = new Set<string>()

export const OjIcon = defineComponent({
  name: 'OjIcon',
  props: {
    name: { type: String, required: true },
    size: { type: [Number, String], default: undefined },
    label: { type: String, default: undefined },
    /** 装饰性图标：显式声明「这枚图标没有语义」，渲染 `aria-hidden`（03 §2）。 */
    decorative: { type: Boolean, default: false },
  },
  setup(props) {
    const env = (import.meta as unknown as { env?: { DEV?: boolean } }).env
    const problem = iconLabelProblem(props.name, { label: props.label, decorative: props.decorative })
    if (problem !== undefined && isDevEnv(env) && !reported.has(props.name)) {
      reported.add(props.name)
      console.warn(problem)
    }

    return () => {
      const markup = iconMarkup(props.name)
      const labelled = typeof props.label === 'string' && props.label.length > 0
      return h('span', {
        class: 'oj-icon',
        role: labelled ? 'img' : undefined,
        'aria-label': labelled ? props.label : undefined,
        // 有 label 就进无障碍树；装饰性的（或什么都没声明的）一律 aria-hidden。
        'aria-hidden': labelled ? undefined : 'true',
        style: props.size === undefined ? undefined : { width: cssSize(props.size), height: cssSize(props.size) },
        innerHTML: markup ?? '',
      })
    }
  },
})
