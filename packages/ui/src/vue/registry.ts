import type { Component } from 'vue'

import { OjAiPanel } from './ai-panel.ts'
import { OjAlignmentPicker } from './alignment-picker.ts'
import { OjBorderPicker } from './border-picker.ts'
import { OjGallery } from './gallery.ts'
import { OjStyleGallery } from './style-gallery.ts'
import { OjCodeBlock } from './code-block.ts'
import { OjCommentThread } from './comment-thread.ts'
import { OjDropZone } from './drop-zone.ts'
import { OjFileNameHeader } from './file-name-header.ts'
import { OjPresenceAvatars } from './presence-avatars.ts'
import { OjReviewPanel } from './review-panel.ts'
import { OjColorPicker } from './color-picker.ts'
import { OjFontPicker } from './font-picker.ts'
import { OjSymbolPicker } from './symbol-picker.ts'
import { OjCommandButton } from './command-button.ts'
import { OjCommandLauncher } from './command-launcher.ts'
import { OjCommandPalette } from './command-palette.ts'
import { OjContextMenu } from './context-menu.ts'
import { OjDialog } from './dialog.ts'
import { OjDockPanel } from './dock-panel.ts'
import { OjDragContext } from './drag-context.ts'
import { OjDropdown } from './dropdown.ts'
import { OjDropdownButton } from './dropdown-button.ts'
import { OjFileTree } from './file-tree.ts'
import { OjFontSizeField } from './font-size-field.ts'
import { OjLineSpacingPicker } from './line-spacing-picker.ts'
import { OjNumberField } from './number-field.ts'
import { OjPaneGroup } from './pane-group.ts'
import { OjHotkey } from './hotkey.ts'
import { OjIcon } from './icon.ts'
import { OjLocaleProvider } from './locale.ts'
import { OjLocaleSwitcher } from './locale-switcher.ts'
import { OjPopper } from './popper.ts'
import { OjPortal } from './portal.ts'
import { OjRibbon } from './ribbon.ts'
import { OjRibbonGallery } from './ribbon-gallery.ts'
import { OjRibbonGroup } from './ribbon-group.ts'
import { OjRibbonTab } from './ribbon-tab.ts'
import { OjRuler } from './ruler.ts'
import { OjSearchReplaceBar } from './search-bar.ts'
import { OjShareDialog } from './share-dialog.ts'
import { OjSignaturePad } from './signature-pad.ts'
import { OjSplitter } from './splitter.ts'
import { OjSplitButton } from './split-button.ts'
import { OjStamp } from './stamp.ts'
import { OjStatusBar } from './status-bar.ts'
import { OjTableGridPicker } from './table-grid-picker.ts'
import { OjTabs } from './tabs.ts'
import { OjToggleButton } from './toggle-button.ts'
import { OjUploadProgress } from './upload-progress.ts'
import { OjVersionHistory } from './version-history.ts'
import { OjVirtualList } from './virtual-list.ts'
import { OjToolbar } from './toolbar.ts'
import { OjTooltip } from './tooltip.ts'
import { OjTrigger } from './trigger.ts'
import { OjWatermark } from './watermark.ts'
import { OjZoomControl } from './zoom-control.ts'

/**
 * 名称 → 组件表（02 §4.2 / §4.3 的地基）。
 *
 * 为什么是**显式表**而不是从导出里推导：`OJ.create('oj-table-grid-picker')` 与
 * `<div data-oj="table-grid-picker">` 里的字符串是**公开契约**，写错一个字母就是运行时报
 * "找不到组件"。推导出来的名字一旦因为重构改了组件变量名就静默变化，而这层映射是给
 * 没有 TS 的 jQuery 用户用的——他们拿不到任何编译期提示。
 *
 * 键统一带 `oj-` 前缀；`resolveOjComponent` 同时接受不带前缀的简写（PRD 的 `data-oj="ribbon"`
 * 就是这么写的），两种写法在文档里都出现，不能只认一种。
 */
export const OJ_COMPONENTS: Readonly<Record<string, Component>> = {
  'oj-ai-panel': OjAiPanel,
  'oj-alignment-picker': OjAlignmentPicker,
  'oj-border-picker': OjBorderPicker,
  'oj-gallery': OjGallery,
  'oj-style-gallery': OjStyleGallery,
  'oj-code-block': OjCodeBlock,
  'oj-comment-thread': OjCommentThread,
  'oj-drop-zone': OjDropZone,
  'oj-file-name-header': OjFileNameHeader,
  'oj-presence-avatars': OjPresenceAvatars,
  'oj-review-panel': OjReviewPanel,
  'oj-color-picker': OjColorPicker,
  'oj-command-button': OjCommandButton,
  'oj-command-launcher': OjCommandLauncher,
  'oj-command-palette': OjCommandPalette,
  'oj-context-menu': OjContextMenu,
  'oj-dialog': OjDialog,
  'oj-dock-panel': OjDockPanel,
  'oj-drag-context': OjDragContext,
  'oj-dropdown': OjDropdown,
  'oj-dropdown-button': OjDropdownButton,
  'oj-file-tree': OjFileTree,
  'oj-font-picker': OjFontPicker,
  'oj-font-size-field': OjFontSizeField,
  'oj-line-spacing-picker': OjLineSpacingPicker,
  'oj-number-field': OjNumberField,
  'oj-pane-group': OjPaneGroup,
  'oj-hotkey': OjHotkey,
  'oj-icon': OjIcon,
  'oj-locale-provider': OjLocaleProvider,
  'oj-locale-switcher': OjLocaleSwitcher,
  'oj-popper': OjPopper,
  'oj-portal': OjPortal,
  'oj-ribbon': OjRibbon,
  'oj-ribbon-gallery': OjRibbonGallery,
  'oj-ribbon-group': OjRibbonGroup,
  'oj-ribbon-tab': OjRibbonTab,
  'oj-ruler': OjRuler,
  'oj-search-replace-bar': OjSearchReplaceBar,
  'oj-share-dialog': OjShareDialog,
  'oj-signature-pad': OjSignaturePad,
  'oj-splitter': OjSplitter,
  'oj-split-button': OjSplitButton,
  'oj-stamp': OjStamp,
  'oj-symbol-picker': OjSymbolPicker,
  'oj-status-bar': OjStatusBar,
  'oj-table-grid-picker': OjTableGridPicker,
  'oj-tabs': OjTabs,
  'oj-toggle-button': OjToggleButton,
  'oj-toolbar': OjToolbar,
  'oj-upload-progress': OjUploadProgress,
  'oj-version-history': OjVersionHistory,
  'oj-virtual-list': OjVirtualList,
  'oj-tooltip': OjTooltip,
  'oj-trigger': OjTrigger,
  'oj-watermark': OjWatermark,
  'oj-zoom-control': OjZoomControl,
}

export function resolveOjComponent(name: string): Component | undefined {
  const key = name.trim().toLowerCase()
  if (key.length === 0) return undefined
  return OJ_COMPONENTS[key] ?? OJ_COMPONENTS[`oj-${key}`]
}

/** 给文档与 web-types 生成用：稳定排序，避免每次构建产出不同的 diff */
export function ojComponentNames(): string[] {
  return Object.keys(OJ_COMPONENTS).sort()
}
