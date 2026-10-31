/**
 * `@jitoffice/ui` 根入口：框架无关的行为层。
 *
 * Vue 组件在 `@jitoffice/ui/vue`。根入口一旦 import vue，Node 里的命令校验和
 * `pnpm verify` 的零依赖链都会被拖上一个运行时。
 */
export { createMemoryEditor } from './editor-host.ts';
export type { EditorCall, MemoryEditor, OjEditorHost, OjEditorState } from './editor-host.ts';
export { bridgedCommandIds, tiptapEditorHost } from './tiptap-host.ts';
export type { TiptapLikeEditor } from './tiptap-host.ts';
export { COMMAND_ALIGN, COMMAND_BLOCKQUOTE, COMMAND_BOLD, COMMAND_BORDER, COMMAND_BULLET_LIST, COMMAND_CODE_BLOCK, COMMAND_FONT_FAMILY, COMMAND_FONT_SIZE, COMMAND_HARD_BREAK, COMMAND_HEADING, COMMAND_HORIZONTAL_RULE, COMMAND_LINE_SPACING, COMMAND_ORDERED_LIST, COMMAND_TABLE, COMMAND_TEXT_COLOR, editorCommands, isHeadingLevel, isTableSize, registerEditorCommands, } from './commands.ts';
export type { OjCommandLike, OjCommandSink, TableSize } from './commands.ts';
export { alignArg, borderArg, fontFamilyArg, fontSizeArg, lineSpacingArg, parseAlignValue, textColorArg, } from './format.ts';
export { createGridPicker, DEFAULT_GRID_LIMITS } from './table-grid.ts';
export type { GridCell, GridKeyResult, GridLimits, GridPicker } from './table-grid.ts';
export { placePopper } from './popper.ts';
export type { Box, PlacePopperOptions, PopperPlacement, PopperPosition } from './popper.ts';
export { createTriggerMachine } from './trigger.ts';
export type { TriggerCloseReason, TriggerMachine, TriggerMachineOptions, TriggerMode, TriggerScheduler, } from './trigger.ts';
export { detectPlatform, formatHotkey, hotkeyConflicts, matchHotkey, normalizeKey, parseHotkey, platformFrom, } from './hotkey.ts';
export type { OjHotkeyBinding, OjHotkeyConflict, OjHotkeySpec, OjKeyEventLike, OjPlatform } from './hotkey.ts';
export { createTooltipMachine } from './tooltip.ts';
export type { TooltipMachine, TooltipOptions } from './tooltip.ts';
export { createRibbonChrome, packRibbon, ribbonDismiss, ribbonHasKeyTips, ribbonKeyTip, ribbonPanelOpen, ribbonProbeSize, ribbonSelect, ribbonSmallerSize, ribbonToggleCollapsed, } from './ribbon.ts';
export type { RibbonChromeState, RibbonItemSize, RibbonItemSpec, RibbonKeyTipItem, RibbonPackItem, RibbonPackOptions, RibbonPackResult, RibbonPackedItem, RibbonWidthTable, } from './ribbon.ts';
export { iconLabelProblem, iconMarkup, icons, isDevEnv } from './icons.ts';
export type { IconNameOptions, OjIconName } from './icons.ts';
export { iconMarkupProblem, registerIcon, registerIcons, registeredIconMarkup, registeredIconNames, resetRegisteredIcons, unregisterIcon, } from './icon-registry.ts';
export type { IconMarkup } from './icon-registry.ts';
export { DEFAULT_ALIGNMENT, HORIZONTAL_ALIGNS, VERTICAL_ALIGNS, isAlignmentValue, normalizeAlignment, stepHorizontal, stepVertical, textAlignCss, verticalAlignCss, } from './shell/alignment.ts';
export type { AlignmentValue, HorizontalAlign, VerticalAlign } from './shell/alignment.ts';
export { BORDER_COLORS, BORDER_STYLES, BORDER_WIDTHS, BORDER_WIDTH_RANGE, DEFAULT_BORDER, borderCss, formatBorderWidth, normalizeBorder, } from './shell/border.ts';
export type { BorderStyle, BorderValue } from './shell/border.ts';
export { STYLE_PRESETS, styleLabel, stylePresetCss } from './shell/style-gallery.ts';
export type { StylePreset } from './shell/style-gallery.ts';
export type { GalleryItem } from './shell/gallery.ts';
export { COLOR_SWATCH_GROUPS, isCssColor, neighborSwatch, normalizeHex } from './shell/color.ts';
export type { ColorSwatchGroup } from './shell/color.ts';
export { FONT_OPTIONS, filterFonts, findFont, stepFont } from './shell/fonts.ts';
export type { FontOption } from './shell/fonts.ts';
export { SYMBOL_GROUPS, filterSymbols, flattenSymbols } from './shell/symbols.ts';
export type { SymbolGroup, SymbolItem } from './shell/symbols.ts';
export { clampNumber, parseNumberDraft, roundTo, stepNumber } from './shell/number-field.ts';
export type { NumberBounds } from './shell/number-field.ts';
export { FONT_SIZE_PRESETS, FONT_SIZE_RANGE, LINE_SPACING_PRESETS, LINE_SPACING_RANGE, formatFontSize, formatLineSpacing, nearestPreset, stepPreset, } from './shell/presets.ts';
export { selectByKey } from './shell/tabs.ts';
export { neighbor, replaceAll, replaceOne, searchHits } from './shell/search.ts';
export type { SearchHit, SearchQuery } from './shell/search.ts';
export { clampZoom, stepZoom, ZOOM_MAX, ZOOM_MIN, ZOOM_STEP } from './shell/zoom.ts';
export { filterTree, toggleId } from './shell/files.ts';
export { galleryNeighbor } from './shell/gallery.ts';
export { menuAction, menuNeighbor, menuSelectable, menuSelectableIndices } from './menu.ts';
export type { OjMenuItem, OjMenuItemAction, OjMenuItemKind, OjMenuSeparator } from './menu.ts';
export { filterPaletteItems, paletteScore, paletteStep } from './palette.ts';
export type { OjPaletteItem } from './palette.ts';
export type { FileNode } from './shell/files.ts';
export { A4_WIDTH_PX, pageWidth, rulerTicks } from './shell/ruler.ts';
export type { RulerTick } from './shell/ruler.ts';
export { extendStroke, startStroke, strokePath } from './shell/signature.ts';
export type { SignaturePoint, SignatureStroke } from './shell/signature.ts';
export { COMMAND_ALIGN_LEFT, COMMAND_ITALIC, COMMAND_UNDERLINE } from './commands.ts';
export { HORIZONTAL_RULE_GROUP, HORIZONTAL_RULE_INPUT, HORIZONTAL_RULE_MARKDOWN, HORIZONTAL_RULE_MARKDOWN_TOKEN, HORIZONTAL_RULE_NAME, applyHorizontalRuleInput, horizontalRuleOptions, isHorizontalRuleInput, mergeAttributes, parseHorizontalRuleHTML, parseHorizontalRuleMarkdown, renderHorizontalRule, renderHorizontalRuleMarkdown, setHorizontalRule, } from './nodes/horizontal-rule.ts';
export type { HorizontalRuleOptions, OjHorizontalRule } from './nodes/horizontal-rule.ts';
export { matchNodeInput, nodeExtension, starterNodes } from './nodes/catalog.ts';
export type { OjInputMatch, OjNodeExtension, OjNodeGroup, OjParseRule } from './nodes/catalog.ts';
export { applyNodeInput, setHardBreak, toggleBlockquote, toggleBulletList, toggleCodeBlock, toggleHeading, toggleOrderedList, } from './nodes/document.ts';
export { blockPlain, createDocument, isTextblockType, plainText, textblock, withPlain } from './nodes/tree.ts';
export type { OjDocument, OjNode, OjSelection } from './nodes/tree.ts';
