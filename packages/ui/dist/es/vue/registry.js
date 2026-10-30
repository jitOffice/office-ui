import { OjIcon } from "./icon.js";
import { OjLocaleProvider } from "./locale.js";
import { OjLocaleSwitcher } from "./locale-switcher.js";
import { OjCommandButton } from "./command-button.js";
import { OjCommandLauncher } from "./command-launcher.js";
import { OjPopper } from "./popper.js";
import { OjPortal } from "./portal.js";
import { OjContextMenu } from "./context-menu.js";
import { OjToggleButton } from "./toggle-button.js";
import { OjSplitButton } from "./split-button.js";
import { OjDropdownButton } from "./dropdown-button.js";
import { OjDropdown } from "./dropdown.js";
import { OjRibbonGroup } from "./ribbon-group.js";
import { OjToolbar } from "./toolbar.js";
import { OjHotkey } from "./hotkey.js";
import { OjStatusBar } from "./status-bar.js";
import { OjRibbonGallery } from "./ribbon-gallery.js";
import { OjCommandPalette } from "./command-palette.js";
import { OjTrigger } from "./trigger.js";
import { OjTooltip } from "./tooltip.js";
import { OjRibbonTab } from "./ribbon-tab.js";
import { OjRibbon } from "./ribbon.js";
import { OjTableGridPicker } from "./table-grid-picker.js";
import { OjTabs } from "./tabs.js";
import { OjDialog } from "./dialog.js";
import { OjSearchReplaceBar } from "./search-bar.js";
import { OjZoomControl } from "./zoom-control.js";
import { OjFileTree } from "./file-tree.js";
import { OjRuler } from "./ruler.js";
import { OjSignaturePad } from "./signature-pad.js";
import { OjStamp } from "./stamp.js";
import { OjWatermark } from "./watermark.js";
import { OjAiPanel } from "./ai-panel.js";
import { OjCodeBlock } from "./code-block.js";
//#region src/vue/registry.ts
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
var OJ_COMPONENTS = {
	"oj-ai-panel": OjAiPanel,
	"oj-code-block": OjCodeBlock,
	"oj-command-button": OjCommandButton,
	"oj-command-launcher": OjCommandLauncher,
	"oj-command-palette": OjCommandPalette,
	"oj-context-menu": OjContextMenu,
	"oj-dialog": OjDialog,
	"oj-dropdown": OjDropdown,
	"oj-dropdown-button": OjDropdownButton,
	"oj-file-tree": OjFileTree,
	"oj-hotkey": OjHotkey,
	"oj-icon": OjIcon,
	"oj-locale-provider": OjLocaleProvider,
	"oj-locale-switcher": OjLocaleSwitcher,
	"oj-popper": OjPopper,
	"oj-portal": OjPortal,
	"oj-ribbon": OjRibbon,
	"oj-ribbon-gallery": OjRibbonGallery,
	"oj-ribbon-group": OjRibbonGroup,
	"oj-ribbon-tab": OjRibbonTab,
	"oj-ruler": OjRuler,
	"oj-search-replace-bar": OjSearchReplaceBar,
	"oj-signature-pad": OjSignaturePad,
	"oj-split-button": OjSplitButton,
	"oj-stamp": OjStamp,
	"oj-status-bar": OjStatusBar,
	"oj-table-grid-picker": OjTableGridPicker,
	"oj-tabs": OjTabs,
	"oj-toggle-button": OjToggleButton,
	"oj-toolbar": OjToolbar,
	"oj-tooltip": OjTooltip,
	"oj-trigger": OjTrigger,
	"oj-watermark": OjWatermark,
	"oj-zoom-control": OjZoomControl
};
function resolveOjComponent(name) {
	const key = name.trim().toLowerCase();
	if (key.length === 0) return void 0;
	return OJ_COMPONENTS[key] ?? OJ_COMPONENTS[`oj-${key}`];
}
/** 给文档与 web-types 生成用：稳定排序，避免每次构建产出不同的 diff */
function ojComponentNames() {
	return Object.keys(OJ_COMPONENTS).sort();
}
//#endregion
export { OJ_COMPONENTS, ojComponentNames, resolveOjComponent };
