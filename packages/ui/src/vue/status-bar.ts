import { defineComponent, h } from 'vue'
import type { PropType, VNodeChild } from 'vue'

export interface OjStatusBarSlots {
  /** 左区：视图切换这类"模式"入口 */
  start?: () => VNodeChild
  /** 中区追加内容，排在页/字数/语言之后 */
  default?: () => VNodeChild
  /** 右区：缩放、协同状态这类"读数" */
  end?: () => VNodeChild
}

/**
 * `OjStatusBar`（03 §3 B 组）：底部状态栏。
 *
 * 这里只做布局，**文案一律由使用方格式化好再传**（`page: '第 1 页 / 共 3 页'`）。
 * 状态栏是最容易被拼字符串拼坏的地方——「共 3 页」在日语里语序不同，
 * 用 `${n} 页` 拼出来的东西没法翻译。唯一例外是缩放：`100%` 是跨语言通用的。
 *
 * 左区放"模式"（页面/大纲/Web），右区放"读数"（缩放、协作人数）——这是 Word/WPS 的固定分工，
 * 换位置会让用户找不到东西，所以不做成可配置。
 */
export const OjStatusBar = defineComponent({
  name: 'OjStatusBar',
  props: {
    /** 已格式化的页码文案 */
    page: { type: String as PropType<string | undefined>, default: undefined },
    /** 已格式化的字数文案 */
    words: { type: String as PropType<string | undefined>, default: undefined },
    /** 已格式化的语言文案 */
    language: { type: String as PropType<string | undefined>, default: undefined },
    /** 缩放百分比，组件只补 `%` */
    zoom: { type: Number as PropType<number | undefined>, default: undefined },
    /** 已格式化的协同状态文案 */
    collaborators: { type: String as PropType<string | undefined>, default: undefined },
    label: { type: String as PropType<string | undefined>, default: undefined },
  },
  setup(props, { slots }) {
    function item(part: string, text: string): VNodeChild {
      return h('span', { class: 'oj-status-bar__item', 'data-part': part }, text)
    }

    return () => {
      const middle: VNodeChild[] = [slots.default?.()]
      if (props.page !== undefined) middle.push(item('page', props.page))
      if (props.words !== undefined) middle.push(item('words', props.words))
      if (props.language !== undefined) middle.push(item('language', props.language))
      if (props.zoom !== undefined) middle.push(item('zoom', `${props.zoom}%`))
      if (props.collaborators !== undefined) middle.push(item('collaborators', props.collaborators))

      return h('footer', { class: 'oj-status-bar', 'aria-label': props.label }, [
        h('div', { class: 'oj-status-bar__start' }, slots.start?.()),
        h('div', { class: 'oj-status-bar__center' }, middle),
        h('div', { class: 'oj-status-bar__end' }, slots.end?.()),
      ])
    }
  },
})
