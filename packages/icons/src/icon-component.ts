import { defineComponent, h } from 'vue'
import type { PropType } from 'vue'

import { iconLabelProblem, isDevEnv } from './a11y.ts'
import type { OjIconName } from './generated/icons.ts'

/**
 * 生成器给每枚图标造组件时共用的形状。放在手写代码里而不是展开进 31 个生成文件：
 * 可访问名与尺寸的规则只有一份，改一次全生效。
 *
 * 为什么是"每图一个组件"而不是"一个组件 + name prop"：`import { OjIconFormatBold }`
 * 必须能被摇到只剩这一枚（05 C1 验收 ≤ 1 KB gzip）。带 name prop 的组件做不到，
 * 它的模板里必然含整张查找表。
 */

const reported = new Set<string>()

function cssSize(size: number | string): string {
  return typeof size === 'number' ? `${size}px` : size
}

/**
 * `markup` 由生成器以字面量传入，**不要**改成在运行时查常量表：
 * 那会让每枚图标都拖上整张表（实测从 ~0.4 kB 涨到 2.15 kB，直接顶穿 1 KB 阈值）。
 */
export function createIconComponent(name: OjIconName, componentName: string, markup: string) {
  return defineComponent({
    name: componentName,
    props: {
      size: { type: [Number, String], default: undefined },
      label: { type: String as PropType<string | undefined>, default: undefined },
      decorative: { type: Boolean, default: false },
    },
    setup(props) {
      const env = (import.meta as unknown as { env?: { DEV?: boolean } }).env
      return () => {
        // 在 render 里判定而不是 setup：label 常常是绑定的，setup 时可能还是空。
        // 按图标名去重——一个 Ribbon 里同一枚图标会出现十几次，刷屏等于没告警。
        if (!reported.has(name)) {
          const problem = iconLabelProblem(name, { label: props.label, decorative: props.decorative })
          if (problem !== undefined && isDevEnv(env)) {
            reported.add(name)
            console.warn(problem)
          }
        }

        const labelled = typeof props.label === 'string' && props.label.length > 0
        return h('span', {
          class: 'oj-icon',
          role: labelled ? 'img' : undefined,
          'aria-label': labelled ? props.label : undefined,
          'aria-hidden': labelled ? undefined : 'true',
          style: props.size === undefined ? undefined : { width: cssSize(props.size), height: cssSize(props.size) },
          innerHTML: markup,
        })
      }
    },
  })
}
