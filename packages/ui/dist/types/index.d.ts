/**
 * `@jitoffice/ui` 根入口：框架无关的行为层。
 *
 * Vue 组件在 `@jitoffice/ui/vue`。根入口一旦 import vue，Node 里的命令校验和
 * `pnpm verify` 的零依赖链都会被拖上一个运行时。
 */
export { createMemoryEditor } from './editor-host.ts';
export type { EditorCall, MemoryEditor, OjEditorHost, OjEditorState } from './editor-host.ts';
export { tiptapEditorHost } from './tiptap-host.ts';
export type { TiptapLikeEditor } from './tiptap-host.ts';
export { COMMAND_BOLD, COMMAND_HORIZONTAL_RULE, COMMAND_TABLE, editorCommands, isTableSize, registerEditorCommands, } from './commands.ts';
export type { OjCommandLike, OjCommandSink, TableSize } from './commands.ts';
export { createGridPicker, DEFAULT_GRID_LIMITS } from './table-grid.ts';
export type { GridCell, GridKeyResult, GridLimits, GridPicker } from './table-grid.ts';
export { placePopper } from './popper.ts';
export type { Box, PlacePopperOptions, PopperPlacement, PopperPosition } from './popper.ts';
export { createTooltipMachine } from './tooltip.ts';
export type { TooltipMachine, TooltipOptions } from './tooltip.ts';
export { iconMarkup, icons } from './icons.ts';
export type { OjIconName } from './icons.ts';
