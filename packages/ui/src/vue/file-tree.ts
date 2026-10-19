import { defineComponent, h } from 'vue'
import type { PropType } from 'vue'

import type { FileNode } from '../shell/files.ts'
import { OjIcon } from './icon.ts'

export const OjFileTree = defineComponent({
  name: 'OjFileTree',
  props: {
    nodes: { type: Array as PropType<readonly FileNode[]>, required: true },
    openIds: { type: Array as PropType<readonly string[]>, default: () => [] },
    selectedId: { type: String, default: '' },
    emptyLabel: { type: String, default: '' },
  },
  emits: ['toggle', 'select'],
  setup(props, { emit }) {
    function renderNode(node: FileNode, depth: number): ReturnType<typeof h> {
      const open = props.openIds.includes(node.id)
      const selected = props.selectedId === node.id
      return h('li', { key: node.id, role: 'none' }, [
        h(
          'button',
          {
            type: 'button',
            class: 'oj-files__item',
            role: 'treeitem',
            'aria-expanded': node.kind === 'folder' ? String(open) : undefined,
            'aria-selected': selected ? 'true' : 'false',
            style: { paddingLeft: `${8 + depth * 16}px` },
            onClick: () => {
              if (node.kind === 'folder') emit('toggle', node.id)
              emit('select', node.id)
            },
          },
          [
            node.kind === 'folder' ? h(OjIcon, { name: open ? 'oj-chevron-down' : 'oj-chevron-right' }) : h(OjIcon, { name: 'oj-file' }),
            h('span', node.name),
          ],
        ),
        node.kind === 'folder' && open && node.children
          ? h(
              'ul',
              { role: 'group' },
              node.children.map((child) => renderNode(child, depth + 1)),
            )
          : null,
      ])
    }

    return () => {
      if (props.nodes.length === 0) return h('p', { class: 'oj-files__empty' }, props.emptyLabel)
      return h(
        'ul',
        { class: 'oj-files', role: 'tree' },
        props.nodes.map((node) => renderNode(node, 0)),
      )
    }
  },
})
