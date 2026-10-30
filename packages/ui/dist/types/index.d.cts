/**
 * `@jitoffice/ui` 根入口：框架无关的行为层。
 *
 * Vue 组件在 `@jitoffice/ui/vue`。根入口一旦 import vue，Node 里的命令校验和
 * `pnpm verify` 的零依赖链都会被拖上一个运行时。
 */
export { createMemoryEditor } from './editor-host.cjs';
export type { EditorCall, MemoryEditor, OjEditorHost, OjEditorState } from './editor-host.cjs';
export { bridgedCommandIds, tiptapEditorHost } from './tiptap-host.cjs';
export type { TiptapLikeEditor } from './tiptap-host.cjs';
export { COMMAND_BLOCKQUOTE, COMMAND_BOLD, COMMAND_BULLET_LIST, COMMAND_CODE_BLOCK, COMMAND_HARD_BREAK, COMMAND_HEADING, COMMAND_HORIZONTAL_RULE, COMMAND_ORDERED_LIST, COMMAND_TABLE, editorCommands, isHeadingLevel, isTableSize, registerEditorCommands, } from './commands.cjs';
export type { OjCommandLike, OjCommandSink, TableSize } from './commands.cjs';
export { createGridPicker, DEFAULT_GRID_LIMITS } from './table-grid.cjs';
export type { GridCell, GridKeyResult, GridLimits, GridPicker } from './table-grid.cjs';
export { placePopper } from './popper.cjs';
export type { Box, PlacePopperOptions, PopperPlacement, PopperPosition } from './popper.cjs';
export { createTriggerMachine } from './trigger.cjs';
export type { TriggerCloseReason, TriggerMachine, TriggerMachineOptions, TriggerMode, TriggerScheduler, } from './trigger.cjs';
export { detectPlatform, formatHotkey, hotkeyConflicts, matchHotkey, normalizeKey, parseHotkey, platformFrom, } from './hotkey.cjs';
export type { OjHotkeyBinding, OjHotkeyConflict, OjHotkeySpec, OjKeyEventLike, OjPlatform } from './hotkey.cjs';
export { createTooltipMachine } from './tooltip.cjs';
export type { TooltipMachine, TooltipOptions } from './tooltip.cjs';
export { createRibbonChrome, packRibbon, ribbonDismiss, ribbonHasKeyTips, ribbonKeyTip, ribbonPanelOpen, ribbonProbeSize, ribbonSelect, ribbonSmallerSize, ribbonToggleCollapsed, } from './ribbon.cjs';
export type { RibbonChromeState, RibbonItemSize, RibbonItemSpec, RibbonKeyTipItem, RibbonPackItem, RibbonPackOptions, RibbonPackResult, RibbonPackedItem, RibbonWidthTable, } from './ribbon.cjs';
export { iconLabelProblem, iconMarkup, icons, isDevEnv } from './icons.cjs';
export type { IconNameOptions, OjIconName } from './icons.cjs';
export { iconMarkupProblem, registerIcon, registerIcons, registeredIconMarkup, registeredIconNames, resetRegisteredIcons, unregisterIcon, } from './icon-registry.cjs';
export type { IconMarkup } from './icon-registry.cjs';
export { selectByKey } from './shell/tabs.cjs';
export { neighbor, replaceAll, replaceOne, searchHits } from './shell/search.cjs';
export type { SearchHit, SearchQuery } from './shell/search.cjs';
export { clampZoom, stepZoom, ZOOM_MAX, ZOOM_MIN, ZOOM_STEP } from './shell/zoom.cjs';
export { filterTree, toggleId } from './shell/files.cjs';
export { galleryNeighbor } from './shell/gallery.cjs';
export { menuAction, menuNeighbor, menuSelectable, menuSelectableIndices } from './menu.cjs';
export type { OjMenuItem, OjMenuItemAction, OjMenuItemKind, OjMenuSeparator } from './menu.cjs';
export { filterPaletteItems, paletteScore, paletteStep } from './palette.cjs';
export type { OjPaletteItem } from './palette.cjs';
export type { FileNode } from './shell/files.cjs';
export { A4_WIDTH_PX, pageWidth, rulerTicks } from './shell/ruler.cjs';
export type { RulerTick } from './shell/ruler.cjs';
export { extendStroke, startStroke, strokePath } from './shell/signature.cjs';
export type { SignaturePoint, SignatureStroke } from './shell/signature.cjs';
export { COMMAND_ALIGN_LEFT, COMMAND_ITALIC, COMMAND_UNDERLINE } from './commands.cjs';
export { HORIZONTAL_RULE_GROUP, HORIZONTAL_RULE_INPUT, HORIZONTAL_RULE_MARKDOWN, HORIZONTAL_RULE_MARKDOWN_TOKEN, HORIZONTAL_RULE_NAME, applyHorizontalRuleInput, horizontalRuleOptions, isHorizontalRuleInput, mergeAttributes, parseHorizontalRuleHTML, parseHorizontalRuleMarkdown, renderHorizontalRule, renderHorizontalRuleMarkdown, setHorizontalRule, } from './nodes/horizontal-rule.cjs';
export type { HorizontalRuleOptions, OjHorizontalRule } from './nodes/horizontal-rule.cjs';
export { matchNodeInput, nodeExtension, starterNodes } from './nodes/catalog.cjs';
export type { OjInputMatch, OjNodeExtension, OjNodeGroup, OjParseRule } from './nodes/catalog.cjs';
export { applyNodeInput, setHardBreak, toggleBlockquote, toggleBulletList, toggleCodeBlock, toggleHeading, toggleOrderedList, } from './nodes/document.cjs';
export { blockPlain, createDocument, isTextblockType, plainText, textblock, withPlain } from './nodes/tree.cjs';
export type { OjDocument, OjNode, OjSelection } from './nodes/tree.cjs';
