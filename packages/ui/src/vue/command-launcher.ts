import { defineComponent, h } from 'vue'

/**
 * `OjCommandLauncher`（03 §3 B 组）：Ribbon **组右下角的小箭头**，点开的是"段落"那类对话框。
 *
 * 它和命令按钮的区别是"打开的是一整块面板而不是执行一条命令"，所以语义上用
 * `aria-haspopup="dialog"`，而不是 `aria-expanded`——后者是给"就地展开/收起"的。
 *
 * 箭头用 CSS 画（一条 `border-right` + `border-bottom` 的直角），不引图标：
 * 它不是办公图标集里的一枚业务图标，放进 `@jitoffice/icons` 会让每个用到 Ribbon 的
 * 宿主都为这 7×7 的像素付一份图标注册表的体积。
 *
 * `label` 是必填而不是带默认值：这类纯图形按钮没有文字，可访问名只能由使用方给
 * （03 §2「可访问名」）。给个中文默认值等于把一个几乎不会被改的文案埋进库里。
 */
export const OjCommandLauncher = defineComponent({
  name: 'OjCommandLauncher',
  props: {
    label: { type: String, required: true },
    disabled: { type: Boolean, default: false },
  },
  emits: ['click'],
  setup(props, { emit }) {
    return () =>
      h(
        'button',
        {
          type: 'button',
          class: 'oj-command-launcher',
          'aria-label': props.label,
          'aria-haspopup': 'dialog',
          title: props.label,
          disabled: props.disabled || undefined,
          onClick: () => {
            if (props.disabled) return
            emit('click')
          },
        },
        [h('span', { class: 'oj-command-launcher__glyph', 'aria-hidden': 'true' })],
      )
  },
})
