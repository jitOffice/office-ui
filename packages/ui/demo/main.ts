import { createApp, defineComponent, h, ref } from 'vue'

import { createI18n } from '../../i18n/src/index.ts'
import zhCN from '../../i18n/src/locales/zh-CN.ts'
import { createCommandRegistry } from '../../shared/src/commands/index.ts'
import '../../tokens/dist/index.css'
import {
  COMMAND_BOLD,
  COMMAND_HORIZONTAL_RULE,
  COMMAND_TABLE,
  createMemoryEditor,
  registerEditorCommands,
} from '../src/index.ts'
import type { OjEditorHost } from '../src/index.ts'
import { OjCommandButton, OjDropdown, OjTableGridPicker, OjTooltip } from '../src/vue/index.ts'
import type { GridCell } from '../src/table-grid.ts'
import '../src/style.css'

const i18n = createI18n({ locale: zhCN })
const editor = createMemoryEditor({
  [COMMAND_BOLD]: { enabled: true, active: false },
  [COMMAND_HORIZONTAL_RULE]: { enabled: true },
  [COMMAND_TABLE]: { enabled: true },
})
const registry = createCommandRegistry<OjEditorHost>({
  context: () => editor.host,
  resolve: (message) => i18n.resolve(message),
  schedule: (task) => {
    requestAnimationFrame(task)
  },
})
registerEditorCommands(registry)
registry.bind(editor.host)

const Demo = defineComponent({
  name: 'E1Demo',
  setup() {
    const open = ref(false)
    const lines = ref<string[]>([])

    async function run(id: string, arg?: unknown): Promise<void> {
      const result = await registry.run(id, arg)
      const mark = result.ok ? 'ok' : (result.skipped ?? 'error')
      lines.value = [...lines.value, `${id} ${JSON.stringify(arg ?? null)} ${mark}`]
      if (result.ok && (id === COMMAND_TABLE || id === COMMAND_HORIZONTAL_RULE)) open.value = false
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

    return () =>
      h('main', { style: 'padding:24px;font-family:sans-serif' }, [
        h('h1', { style: 'font-size:18px' }, 'E1 命令闭环'),
        h('div', { style: 'display:flex;gap:8px;align-items:center' }, [
          h(OjTooltip, { label: i18n.t('oj.command.bold') }, () =>
            h(OjCommandButton, { source, id: COMMAND_BOLD, size: 'mini' }),
          ),
          h(OjCommandButton, { source, id: COMMAND_HORIZONTAL_RULE, size: 'mini' }),
          h(
            OjDropdown,
            {
              open: open.value,
              'onUpdate:open': (next: boolean) => {
                open.value = next
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
                }),
            },
          ),
        ]),
        h('pre', { id: 'log' }, lines.value.join('\n')),
      ])
  },
})

createApp(Demo).mount('#app')
