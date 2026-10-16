import { defineComponent, h, ref } from 'vue'
import type { PropType } from 'vue'

import { createGridPicker } from '../table-grid.ts'
import type { GridCell } from '../table-grid.ts'

export const OjTableGridPicker = defineComponent({
  name: 'OjTableGridPicker',
  props: {
    rows: { type: Number, default: 10 },
    cols: { type: Number, default: 20 },
    format: { type: Function as PropType<(cell: GridCell) => string>, default: undefined },
    detailLabel: { type: String, default: '' },
    exceedLabel: { type: String, default: '' },
  },
  emits: ['select', 'detail'],
  setup(props, { emit }) {
    const picker = createGridPicker({ rows: props.rows, cols: props.cols })
    const tick = ref(0)
    function touch(): void {
      tick.value += 1
    }

    return () => {
      void tick.value
      const hover = picker.hover
      const vars = picker.vars()
      const cells = []
      for (let row = 1; row <= picker.limits.rows; row += 1) {
        const rowCells = []
        for (let col = 1; col <= picker.limits.cols; col += 1) {
          const cell = { row, col }
          rowCells.push(
            h('button', {
              type: 'button',
              class: 'oj-grid-picker__cell',
              role: 'gridcell',
              'aria-selected': hover?.row === row && hover?.col === col ? 'true' : 'false',
              tabindex: -1,
              onMouseenter: () => {
                picker.move(cell)
                touch()
              },
              onClick: () => {
                picker.move(cell)
                const chosen = picker.commit()
                if (chosen) emit('select', chosen)
              },
            }),
          )
        }
        cells.push(h('div', { role: 'row' }, rowCells))
      }

      const size = hover ? (props.format?.(hover) ?? `${hover.row} × ${hover.col}`) : ''
      return h(
        'div',
        {
          class: 'oj-grid-picker',
          onMouseleave: () => {
            picker.leave()
            touch()
          },
        },
        [
          h(
            'div',
            {
              class: 'oj-grid-picker__cells',
              role: 'grid',
              tabindex: 0,
              'aria-rowcount': picker.limits.rows,
              'aria-colcount': picker.limits.cols,
              style: { ...vars, '--oj-gp-cols': String(picker.limits.cols) },
              onKeydown: (event: KeyboardEvent) => {
                const result = picker.key(event.key)
                // Escape 交给外层下拉关闭，框选自己不吞掉。
                if (result === 'ignore' || result === 'cancel') return
                event.preventDefault()
                touch()
                if (result === 'commit') {
                  const chosen = picker.commit()
                  if (chosen) emit('select', chosen)
                }
              },
            },
            [
              h('div', {
                class: 'oj-grid-picker__overlay',
                'aria-hidden': 'true',
                'data-empty': hover ? undefined : '',
              }),
              ...cells,
            ],
          ),
          size ? h('p', { class: 'oj-grid-picker__size' }, size) : null,
          picker.exceeded && props.exceedLabel ? h('p', { class: 'oj-grid-picker__exceed' }, props.exceedLabel) : null,
          props.detailLabel
            ? h(
                'button',
                {
                  type: 'button',
                  class: 'oj-grid-picker__detail',
                  onClick: () => emit('detail'),
                },
                props.detailLabel,
              )
            : null,
        ],
      )
    }
  },
})
